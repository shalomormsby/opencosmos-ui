# @opencosmos/mcp

**Model Context Protocol server for OpenCosmos UI**

Enable AI assistants like Claude Desktop, Cursor, and VS Code to browse, search, and install OpenCosmos UI components directly through natural language.

## Features

- 🔍 **Browse all 100 components** across 11 functional categories
- 🔎 **Semantic search** by keywords, use cases, or functionality
- 📖 **Detailed component info** including props, dependencies, and examples
- 📦 **Installation instructions** with all required dependencies
- ⏏️ **Eject components** — get transformed source code ready to paste into any project
- 🤖 **AI-native** - Built specifically for LLM interaction

## Installation

### Quick Start

```bash
pnpm add -D @opencosmos/mcp
# or
npm install --save-dev @opencosmos/mcp
# or
yarn add -D @opencosmos/mcp
```

### MCP Client Configuration

#### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sds": {
      "command": "npx",
      "args": ["@opencosmos/mcp"]
    }
  }
}
```

Restart Claude Desktop to activate.

#### Cursor

Add to `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "sds": {
      "command": "npx",
      "args": ["@opencosmos/mcp"]
    }
  }
}
```

#### VS Code

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "sds": {
      "command": "npx",
      "args": ["@opencosmos/mcp"]
    }
  }
}
```

## Available Tools

The MCP server provides 8 tools for AI interaction:

### 1. `list_components`

List all available components, optionally filtered by category.

**Parameters:**
- `category` (optional): Filter by `actions`, `forms`, `navigation`, `overlays`, `feedback`, `data-display`, `layout`, `backgrounds`, `cursor`, `motion`, or `blocks`

**Example AI prompts:**
- "Show me all OpenCosmos UI components"
- "List all form components"
- "What overlay components are available?"

### 2. `search_components`

Search for components by keywords, descriptions, or use cases.

**Parameters:**
- `query` (required): Search term

**Example AI prompts:**
- "Find components for date selection"
- "Search for dropdown components"
- "Show me components for displaying user profiles"

### 3. `get_component`

Get detailed information about a specific component.

**Parameters:**
- `name` (required): Component name (case-insensitive, accepts PascalCase or kebab-case)

**Example AI prompts:**
- "Tell me about the Button component"
- "What props does the DataTable have?"
- "Show me details for the date-picker"

### 4. `install_component`

Get installation instructions for a component.

**Parameters:**
- `name` (required): Component name to install

**Example AI prompts:**
- "Install the Dialog component"
- "How do I add the DataTable to my project?"
- "Show me how to install the ComboBox"

### 5. `get_app_shell`

Get a complete, ready-to-use app shell with ThemeProvider, Toaster, Tailwind config, and globals.css.

**Parameters:**
- `framework` (optional): `"nextjs"` or `"vite"` (default: `"vite"`)
- `theme` (optional): `"studio"`, `"terra"`, or `"volt"` (default: `"studio"`)

### 6. `get_examples`

Get usage examples for a specific component.

**Parameters:**
- `name` (required): Component name

### 7. `get_audit_checklist`

Returns a post-generation checklist to verify correct SDE usage (providers, styling, accessibility, imports).

### 8. `eject_component`

Eject a component's source code for full customization. Returns the **actual transformed source code** with internal imports rewritten to package-level imports — ready to save directly into the user's project.

**Parameters:**
- `name` (required): Component name (e.g., `"Button"`, `"Dialog"`)
- `targetDir` (optional): Target directory (default: `"src/components/ui"`)

**What it returns:**
- Transformed component source code (ready to save as `.tsx`)
- `cn()` utility code if needed
- List of npm dependencies to install
- Import update instructions

**Example AI prompts:**
- "Eject the Button component so I can customize it"
- "I need the Dialog source code in my project"
- "Give me the Card component source for local modification"

## Component Categories

The OpenCosmos UI organizes components functionally (not atomically):

- **Actions** (3) - Interactive elements that trigger behaviors
- **Forms** (11) - Input controls for data collection
- **Navigation** (6) - Moving through content and hierarchy
- **Overlays** (9) - Contextual content above the main UI
- **Feedback** (5) - System state communication
- **Data Display** (6) - Presenting information visually
- **Layout** (8) - Spatial organization

## Usage Examples

Once configured, you can interact with the server through your AI assistant:

### Browse Components

> "Show me all components in the OpenCosmos UI"

The AI will use `list_components` to display all 100 components organized by category.

### Search for Specific Functionality

> "I need a component for selecting dates"

The AI will use `search_components` with query "date" and find:
- Calendar
- DatePicker

### Get Component Details

> "Tell me about the Button component"

The AI will use `get_component` to show:
- Description
- Use cases
- Dependencies
- Import statements
- Documentation link

### Install a Component

> "Add the Dialog component to my project"

The AI will use `install_component` to provide:
- Package installation commands
- Peer dependency requirements
- Import examples
- Usage code

## Architecture

The MCP server consists of:

1. **Component Registry** (`src/registry.ts`) - Metadata for all 100 @opencosmos/ui components
2. **MCP Server** (`src/index.ts`) - Model Context Protocol implementation with 8 tools
3. **Eject Engine** - Reads component source, transforms imports, returns ready-to-use code

Registry data is statically defined. The eject tool reads source files from the monorepo or `node_modules`.

## Development

### Build

```bash
pnpm build
```

### Test Locally

```bash
pnpm start
```

The server runs in stdio mode, communicating via stdin/stdout per the MCP specification.

## Documentation

- **Full Documentation**: https://opencosmos.ai/studio/
- **GitHub**: https://github.com/shalomormsby/opencosmos-ui
- **MCP Specification**: https://modelcontextprotocol.io/

## Support

For issues or questions:
- GitHub Issues: https://github.com/shalomormsby/opencosmos-ui/issues
- Documentation: https://opencosmos.ai/studio/#mcp-server

## License

MIT © Shalom Ormsby

---

**Part of the [OpenCosmos UI](https://opencosmos.ai/studio/) - Build lovable products at AI speed.**
