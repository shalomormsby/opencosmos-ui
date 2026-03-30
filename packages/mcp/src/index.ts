#!/usr/bin/env node

/**
 * Sage UI MCP Server
 *
 * Model Context Protocol server that enables AI assistants to:
 * - Browse and search Sage UI components
 * - Get detailed component information with props, examples, and use cases
 * - Install components into projects
 * - Get complete app shell boilerplate for Vite or Next.js
 * - Get usage examples for any component
 * - Run an audit checklist for correct SDE usage
 * - Eject components for full customization
 *
 * Usage:
 *   sds-mcp
 *
 * Configuration in .mcp.json or similar:
 * {
 *   "mcpServers": {
 *     "sds": {
 *       "command": "npx",
 *       "args": ["@opencosmos/mcp"]
 *     }
 *   }
 * }
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import {
  COMPONENT_CATEGORIES,
  COMPONENT_REGISTRY,
  getComponentsByCategory,
  searchComponents,
  getComponent,
  getAllComponentNames,
  getComponentCount,
  type ComponentMetadata,
} from './registry.js';

const __filename_ = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const __dirname_ = dirname(__filename_);

// Server instance
const server = new Server(
  {
    name: 'sds-mcp-server',
    version: '0.8.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ============================================================================
// TOOL DEFINITIONS
// ============================================================================

const TOOLS: Tool[] = [
  {
    name: 'list_components',
    description:
      'List all available Sage UI components. Optionally filter by category (core: actions, forms, navigation, overlays, feedback, data-display, layout; specialty: backgrounds, cursor, motion, blocks).',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description:
            'Filter by category. Core: actions, forms, navigation, overlays, feedback, data-display, layout. Specialty: backgrounds, cursor, motion, blocks.',
          enum: [
            'actions',
            'forms',
            'navigation',
            'overlays',
            'feedback',
            'data-display',
            'layout',
            'backgrounds',
            'cursor',
            'motion',
            'blocks',
          ],
        },
      },
    },
  },
  {
    name: 'search_components',
    description:
      'Search for components by keyword, description, or use case. Returns matching components with relevance.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (keywords, use cases, or component names)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_component',
    description:
      'Get detailed information about a specific component including description, props, use cases, and dependencies.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Component name (e.g., "button", "Button", "data-table", "DataTable")',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'install_component',
    description:
      'Get installation instructions for a component including import statements and dependencies.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Component name to install',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'get_app_shell',
    description:
      'Returns a complete, ready-to-use app shell with ThemeProvider, TooltipProvider, Toaster, tailwind.config, postcss.config, and globals.css import. Use this when scaffolding a new project with SDE.',
    inputSchema: {
      type: 'object',
      properties: {
        framework: {
          type: 'string',
          enum: ['nextjs', 'vite'],
          description: 'Target framework. Defaults to "vite".',
        },
        theme: {
          type: 'string',
          enum: ['studio', 'terra', 'volt'],
          description: 'Default theme. Defaults to "studio".',
        },
      },
    },
  },
  {
    name: 'get_examples',
    description:
      'Get usage examples for a specific component, including common patterns, compound component usage, and integration with other SDE components.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Component name (e.g., "Button", "Dialog", "Card")',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'get_audit_checklist',
    description:
      'Returns a post-generation checklist to verify SDE component usage is correct. Checks: provider wrapping, CSS variable usage (no hardcoded colors), accessibility attributes, motion preference respect, and import correctness.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'eject_component',
    description:
      "Eject a component's source code for full customization. Returns the actual transformed source code with imports rewritten — ready to save directly into the user's project.",
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Component name (e.g., "Button", "Card", "Dialog")',
        },
        targetDir: {
          type: 'string',
          description: 'Target directory relative to project root. Defaults to "src/components/ui"',
        },
      },
      required: ['name'],
    },
  },
];

// ============================================================================
// TOOL HANDLERS
// ============================================================================

/**
 * Format component list for display
 */
function formatComponentList(components: ComponentMetadata[]): string {
  if (components.length === 0) {
    return 'No components found.';
  }

  const groupedByCategory: Record<string, ComponentMetadata[]> = {};

  components.forEach((comp) => {
    if (!groupedByCategory[comp.category]) {
      groupedByCategory[comp.category] = [];
    }
    groupedByCategory[comp.category].push(comp);
  });

  let output = `## Sage UI Components\n\n`;
  output += `Total: ${components.length} components\n\n`;

  Object.entries(groupedByCategory).forEach(([category, comps]) => {
    const categoryInfo = COMPONENT_CATEGORIES[category as keyof typeof COMPONENT_CATEGORIES];
    output += `### ${categoryInfo.label} (${comps.length})\n`;
    output += `${categoryInfo.description}\n\n`;

    comps.forEach((comp) => {
      output += `**${comp.name}** - ${comp.description}\n`;
    });
    output += '\n';
  });

  return output;
}

/**
 * Format component details for display
 */
function formatComponentDetails(component: ComponentMetadata): string {
  let output = `# ${component.name}\n\n`;
  output += `**Category:** ${component.category}\n\n`;
  output += `## Description\n${component.description}\n\n`;

  // Import
  const importParts = [component.name];
  if (component.subComponents) {
    importParts.push(...component.subComponents);
  }
  output += `## Import\n`;
  output += `\`\`\`typescript\nimport { ${importParts.join(', ')} } from '@opencosmos/ui';\n\`\`\`\n\n`;

  // Props table
  if (component.props && Object.keys(component.props).length > 0) {
    output += `## Props\n\n`;
    output += `| Prop | Type | Default | Description |\n`;
    output += `|------|------|---------|-------------|\n`;
    Object.entries(component.props).forEach(([name, prop]) => {
      const required = prop.required ? ' **(required)**' : '';
      const defaultVal = prop.default || '-';
      output += `| ${name} | \`${prop.type}\` | ${defaultVal} | ${prop.description}${required} |\n`;
    });
    output += '\n';
  }

  // Sub-components
  if (component.subComponents && component.subComponents.length > 0) {
    output += `## Sub-Components\n`;
    output += component.subComponents.join(', ') + '\n\n';
  }

  // Example
  if (component.example) {
    output += `## Example\n`;
    output += `\`\`\`tsx\n${component.example}\n\`\`\`\n\n`;
  }

  // Use cases
  output += `## Use Cases\n`;
  component.useCases.forEach((useCase) => {
    output += `- ${useCase}\n`;
  });
  output += '\n';

  if (component.dependencies.length > 0) {
    output += `## Dependencies\n`;
    component.dependencies.forEach((dep) => {
      output += `- ${dep}\n`;
    });
    output += '\n';
  }

  if (component.radixPrimitive) {
    output += `## Radix Primitive\n`;
    output += `Built on: ${component.radixPrimitive}\n\n`;
  }

  output += `## Documentation\n`;
  output += `View full documentation at: https://thesage.dev/docs#${component.category}/${component.name.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}\n`;
  output += `\nFull API reference: https://thesage.dev/llms-full.txt\n`;

  return output;
}

/**
 * Generate installation instructions
 */
function formatInstallationInstructions(component: ComponentMetadata): string {
  let output = `# Install ${component.name}\n\n`;

  output += `## 1. Install @opencosmos/ui package\n\n`;
  output += `\`\`\`bash\n`;
  output += `pnpm add @opencosmos/ui\n`;
  output += `# or\n`;
  output += `npm install @opencosmos/ui\n`;
  output += `# or\n`;
  output += `yarn add @opencosmos/ui\n`;
  output += `\`\`\`\n\n`;

  if (component.dependencies.length > 0) {
    output += `## 2. Install peer dependencies\n\n`;
    output += `The following peer dependencies are required:\n\n`;
    output += `\`\`\`bash\n`;
    output += `pnpm add ${component.dependencies.join(' ')}\n`;
    output += `\`\`\`\n\n`;
  }

  output += `## ${component.dependencies.length > 0 ? '3' : '2'}. Import and use\n\n`;
  output += `\`\`\`typescript\n`;
  output += `import { ${component.name} } from '@opencosmos/ui';\n\n`;
  output += `export function MyComponent() {\n`;
  output += `  return (\n`;
  output += `    <${component.name}>\n`;
  output += `      {/* Your content */}\n`;
  output += `    </${component.name}>\n`;
  output += `  );\n`;
  output += `}\n`;
  output += `\`\`\`\n\n`;

  output += `## Additional Resources\n\n`;
  output += `- **Documentation:** https://thesage.dev/#${component.category}/${component.name.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}\n`;
  output += `- **GitHub:** https://github.com/shalomormsby/sage-design-engine/tree/main/packages/ui/src/components/${component.category}\n`;

  return output;
}

/**
 * Generate app shell boilerplate
 */
function generateAppShell(framework: string, theme: string): string {
  if (framework === 'nextjs') {
    return `# Next.js App Router Setup with Sage Design Engine

## 1. Install dependencies

\`\`\`bash
pnpm add @opencosmos/ui
pnpm add -D tailwindcss@^3.4 postcss autoprefixer tailwindcss-animate
\`\`\`

## 2. app/layout.tsx

\`\`\`tsx
import { ThemeProvider, TooltipProvider, Toaster } from '@opencosmos/ui'
import '@opencosmos/ui/globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="${theme}" defaultMode="system">
          <TooltipProvider delayDuration={300}>
            {children}
            <Toaster position="bottom-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
\`\`\`

## 3. tailwind.config.js

\`\`\`js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './node_modules/@opencosmos/ui/dist/**/*.{js,mjs}',
  ],
  darkMode: 'class',
  theme: { extend: {} },
  plugins: [require('tailwindcss-animate')],
}
\`\`\`

## 4. postcss.config.js

\`\`\`js
module.exports = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
}
\`\`\`

## 5. app/page.tsx (starter)

\`\`\`tsx
import { Button, Card, Heading, Text } from '@opencosmos/ui'

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8">
      <Card className="mx-auto max-w-md p-6">
        <Heading as="h1" size="lg">Welcome</Heading>
        <Text className="mt-2">Your app is ready.</Text>
        <Button className="mt-4">Get Started</Button>
      </Card>
    </main>
  )
}
\`\`\``;
  }

  // Vite (default)
  return `# Vite + React Setup with Sage Design Engine

## 1. Install dependencies

\`\`\`bash
pnpm add @opencosmos/ui
pnpm add -D tailwindcss@^3.4 postcss autoprefixer tailwindcss-animate
\`\`\`

## 2. src/main.tsx

\`\`\`tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, TooltipProvider, Toaster } from '@opencosmos/ui'
import '@opencosmos/ui/globals.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="${theme}" defaultMode="system">
      <TooltipProvider delayDuration={300}>
        <App />
        <Toaster position="bottom-right" />
      </TooltipProvider>
    </ThemeProvider>
  </React.StrictMode>
)
\`\`\`

## 3. tailwind.config.js

\`\`\`js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './node_modules/@opencosmos/ui/dist/**/*.{js,mjs}',
  ],
  darkMode: 'class',
  theme: { extend: {} },
  plugins: [require('tailwindcss-animate')],
}
\`\`\`

## 4. postcss.config.js

\`\`\`js
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
}
\`\`\`

## 5. src/App.tsx (starter)

\`\`\`tsx
import { Button, Card, Heading, Text, ThemeToggle, ThemeSwitcher } from '@opencosmos/ui'

export default function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="flex items-center justify-between">
          <Heading as="h1" size="xl">My App</Heading>
          <div className="flex gap-2">
            <ThemeSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <Card className="p-6">
          <Text>Welcome to your new app. Start building!</Text>
          <Button className="mt-4">Get Started</Button>
        </Card>
      </div>
    </div>
  )
}
\`\`\``;
}

/**
 * Generate audit checklist
 */
function generateAuditChecklist(): string {
  return `## SDE Usage Audit Checklist

### Provider Wrapping
- [ ] ThemeProvider wraps the entire app
- [ ] TooltipProvider wraps any area using Tooltip components
- [ ] <Toaster /> is rendered at app root (required for toast notifications)
- [ ] '@opencosmos/ui/globals.css' is imported at the top level

### Styling
- [ ] No hardcoded colors (no bg-white, text-black, bg-blue-500, text-gray-900)
- [ ] All colors use CSS variables (bg-background, text-foreground, bg-primary, border-border, etc.)
- [ ] className merging uses cn() utility, not string concatenation
- [ ] Dark mode works correctly via ThemeProvider (no manual dark: class management needed)
- [ ] tailwind.config.js content array includes: './node_modules/@opencosmos/ui/dist/**/*.{js,mjs}'

### Accessibility
- [ ] All interactive elements are keyboard-navigable
- [ ] Dialogs trap focus and return focus on close
- [ ] Form inputs have associated Label components
- [ ] Animated components use useMotionPreference hook
- [ ] AlertDialog used (not Dialog) for destructive confirmations
- [ ] Images have alt text

### Imports
- [ ] Components imported from '@opencosmos/ui' (not relative paths to node_modules)
- [ ] Heavy features use subpath imports:
  - @opencosmos/ui/forms (react-hook-form + zod)
  - @opencosmos/ui/dates (date-fns + react-day-picker)
  - @opencosmos/ui/tables (@tanstack/react-table)
  - @opencosmos/ui/dnd (@dnd-kit)
- [ ] No duplicate imports (same component from both @opencosmos/ui and a local file)
- [ ] Peer dependencies installed for subpath imports that need them

### Component Usage
- [ ] Compound components use correct structure (e.g., Dialog needs DialogTrigger + DialogContent)
- [ ] Sheet used for desktop side panels, Drawer for mobile bottom sheets
- [ ] Combobox used (not Select) when searchable dropdown is needed
- [ ] Switch for instant toggles, Checkbox for form submission
- [ ] Toast/Sonner for transient notifications, Alert for persistent messages`;
}

/**
 * Transform internal imports to package-level imports for ejected components
 */
function transformImports(source: string): string {
  return source
    .replace(/from\s+['"]\.\.\/\.\.\/lib\/utils['"]/g, `from './utils'`)
    .replace(/from\s+['"]\.\.\/\.\.\/lib\/[^'"]+['"]/g, `from '@opencosmos/ui/utils'`)
    .replace(/from\s+['"]\.\.\/\.\.\/hooks\/[^'"]+['"]/g, `from '@opencosmos/ui/hooks'`)
    .replace(/from\s+['"]\.\.\/[^.][^'"]*['"]/g, `from '@opencosmos/ui'`);
}

/**
 * Resolve the @opencosmos/ui source directory.
 * Tries monorepo path first, then node_modules.
 */
function resolveUiSourceDir(): string | null {
  // Monorepo: packages/mcp/src → packages/ui/src
  const monorepoPath = join(__dirname_, '..', '..', 'ui', 'src');
  if (existsSync(join(monorepoPath, 'components'))) return monorepoPath;

  // Monorepo (from dist): packages/mcp/dist → packages/ui/src
  const monorepoPathDist = join(__dirname_, '..', '..', '..', 'ui', 'src');
  if (existsSync(join(monorepoPathDist, 'components'))) return monorepoPathDist;

  // npm: try to find @opencosmos/ui in node_modules
  try {
    const resolved = require.resolve('@opencosmos/ui/package.json');
    const pkgDir = dirname(resolved);
    const srcDir = join(pkgDir, 'src');
    if (existsSync(join(srcDir, 'components'))) return srcDir;
  } catch { /* not installed via npm */ }

  return null;
}

/**
 * Read component source and return transformed code ready for ejection
 */
function generateEjectSource(component: ComponentMetadata, targetDir: string): string {
  const srcDir = resolveUiSourceDir();

  if (!srcDir) {
    return `Error: Could not locate @opencosmos/ui source files. Ensure the package is installed with source (v1.4.0+) or you are in the monorepo.`;
  }

  // Find the component file
  const componentPath = join(srcDir, 'components', component.category, `${component.name}.tsx`);
  if (!existsSync(componentPath)) {
    return `Error: Source file not found at ${componentPath}`;
  }

  const rawSource = readFileSync(componentPath, 'utf-8');
  const transformed = transformImports(rawSource);

  // Extract external dependencies
  const deps = new Set<string>();
  const importRegex = /from\s+['"](@[^/'"]+\/[^'"]+|[^.@/'"][^'"]*)['"]/g;
  let match;
  while ((match = importRegex.exec(rawSource)) !== null) {
    const pkg = match[1];
    if (pkg.startsWith('@opencosmos/') || pkg === 'react') continue;
    const pkgName = pkg.startsWith('@') ? pkg.split('/').slice(0, 2).join('/') : pkg.split('/')[0];
    deps.add(pkgName);
  }

  const destPath = `${targetDir}/${component.name}.tsx`;

  let output = `## Eject: ${component.name}\n\n`;
  output += `Save this file to \`${destPath}\`:\n\n`;
  output += `\`\`\`tsx\n${transformed}\`\`\`\n\n`;

  // cn() utility
  const usesCn = rawSource.includes("from '../../lib/utils'") || rawSource.includes('from "../../lib/utils"');
  if (usesCn) {
    output += `### Required: \`${targetDir}/utils.ts\`\n\n`;
    output += `\`\`\`ts\nimport { type ClassValue, clsx } from "clsx";\nimport { twMerge } from "tailwind-merge";\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs));\n}\n\`\`\`\n\n`;
  }

  if (deps.size > 0) {
    output += `### Dependencies\n\n`;
    output += `\`\`\`bash\npnpm add ${[...deps].sort().join(' ')}\n\`\`\`\n\n`;
  }

  output += `### Update imports\n\n`;
  output += `\`\`\`tsx\n// Before:\nimport { ${component.name} } from '@opencosmos/ui'\n// After:\nimport { ${component.name} } from './${targetDir}/${component.name}'\n\`\`\`\n\n`;
  output += `The ejected component still works with @opencosmos/ui themes and CSS variables. You now own it — modify freely.`;

  return output;
}

// ============================================================================
// SERVER SETUP
// ============================================================================

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_components': {
        const category = args?.category as string | undefined;

        if (category) {
          const components = getComponentsByCategory(category);

          return {
            content: [
              {
                type: 'text',
                text: formatComponentList(components),
              },
            ],
          };
        } else {
          const allComponents = Object.values(COMPONENT_REGISTRY);
          return {
            content: [
              {
                type: 'text',
                text: formatComponentList(allComponents),
              },
            ],
          };
        }
      }

      case 'search_components': {
        const query = args?.query as string;

        if (!query) {
          return {
            content: [
              {
                type: 'text',
                text: 'Error: query parameter is required',
              },
            ],
            isError: true,
          };
        }

        const results = searchComponents(query);

        if (results.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `No components found matching "${query}".\n\nTry searching for:\n- Component names (e.g., "button", "dialog")\n- Use cases (e.g., "form", "navigation")\n- Keywords (e.g., "overlay", "input")`,
              },
            ],
          };
        }

        let output = `# Search Results for "${query}"\n\n`;
        output += `Found ${results.length} component${results.length === 1 ? '' : 's'}:\n\n`;

        results.forEach((comp) => {
          output += `## ${comp.name}\n`;
          output += `**Category:** ${comp.category}\n\n`;
          output += `${comp.description}\n\n`;
          output += `**Use cases:** ${comp.useCases.join(', ')}\n\n`;
          output += `---\n\n`;
        });

        return {
          content: [
            {
              type: 'text',
              text: output,
            },
          ],
        };
      }

      case 'get_component': {
        const componentName = args?.name as string;

        if (!componentName) {
          return {
            content: [
              {
                type: 'text',
                text: 'Error: name parameter is required',
              },
            ],
            isError: true,
          };
        }

        const component = getComponent(componentName);

        if (!component) {
          const allNames = getAllComponentNames();
          return {
            content: [
              {
                type: 'text',
                text: `Component "${componentName}" not found.\n\nAvailable components:\n${allNames.join(', ')}`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: formatComponentDetails(component),
            },
          ],
        };
      }

      case 'install_component': {
        const componentName = args?.name as string;

        if (!componentName) {
          return {
            content: [
              {
                type: 'text',
                text: 'Error: name parameter is required',
              },
            ],
            isError: true,
          };
        }

        const component = getComponent(componentName);

        if (!component) {
          return {
            content: [
              {
                type: 'text',
                text: `Component "${componentName}" not found. Use search_components to find available components.`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: formatInstallationInstructions(component),
            },
          ],
        };
      }

      case 'get_app_shell': {
        const framework = (args?.framework as string) || 'vite';
        const theme = (args?.theme as string) || 'studio';

        return {
          content: [
            {
              type: 'text',
              text: generateAppShell(framework, theme),
            },
          ],
        };
      }

      case 'get_examples': {
        const componentName = args?.name as string;

        if (!componentName) {
          return {
            content: [
              {
                type: 'text',
                text: 'Error: name parameter is required',
              },
            ],
            isError: true,
          };
        }

        const component = getComponent(componentName);

        if (!component) {
          return {
            content: [
              {
                type: 'text',
                text: `Component "${componentName}" not found. Use search_components to find available components.`,
              },
            ],
            isError: true,
          };
        }

        let output = `## ${component.name} Examples\n\n`;

        if (component.example) {
          output += `### Basic Usage\n\n`;
          output += `\`\`\`tsx\n${component.example}\n\`\`\`\n\n`;
        }

        // Add import statement
        const importParts = [component.name];
        if (component.subComponents) {
          importParts.push(...component.subComponents);
        }
        output += `### Import\n\n`;
        output += `\`\`\`tsx\nimport { ${importParts.join(', ')} } from '@opencosmos/ui'\n\`\`\`\n\n`;

        // Add use cases as examples context
        if (component.useCases.length > 0) {
          output += `### Common Use Cases\n\n`;
          component.useCases.forEach((useCase) => {
            output += `- ${useCase}\n`;
          });
          output += '\n';
        }

        // Add props summary
        if (component.props && Object.keys(component.props).length > 0) {
          output += `### Key Props\n\n`;
          Object.entries(component.props).forEach(([propName, prop]) => {
            const defaultStr = prop.default ? ` (default: ${prop.default})` : '';
            output += `- **${propName}**: \`${prop.type}\`${defaultStr} — ${prop.description}\n`;
          });
          output += '\n';
        }

        output += `\nFull API reference: https://thesage.dev/llms-full.txt\n`;

        return {
          content: [
            {
              type: 'text',
              text: output,
            },
          ],
        };
      }

      case 'get_audit_checklist': {
        return {
          content: [
            {
              type: 'text',
              text: generateAuditChecklist(),
            },
          ],
        };
      }

      case 'eject_component': {
        const componentName = args?.name as string;
        const targetDir = (args?.targetDir as string) || 'src/components/ui';

        if (!componentName) {
          return {
            content: [
              {
                type: 'text',
                text: 'Error: name parameter is required',
              },
            ],
            isError: true,
          };
        }

        const component = getComponent(componentName);

        if (!component) {
          const allNames = getAllComponentNames();
          return {
            content: [
              {
                type: 'text',
                text: `Component "${componentName}" not found.\n\nAvailable components:\n${allNames.join(', ')}`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: generateEjectSource(component, targetDir),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// ============================================================================
// START SERVER
// ============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdout is used for MCP protocol)
  console.error('Sage UI MCP Server v0.8.0 running');
  console.error(`Components available: ${getComponentCount()}`);
  console.error(`Tools available: ${TOOLS.length}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
