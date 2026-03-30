# @opencosmos/ui — AI Context

> 100 accessible React components | Radix UI + Tailwind CSS | 3 themes | TypeScript strict mode | MIT

## Install

```bash
pnpm add @opencosmos/ui
```

## Provider Hierarchy (Required)

Wrap your app root in this exact order:

```tsx
import { ThemeProvider, TooltipProvider } from '@opencosmos/ui/providers'
import { Toaster } from '@opencosmos/ui'
import '@opencosmos/ui/globals.css'

export default function RootLayout({ children }) {
  return (
    <ThemeProvider defaultTheme="studio" defaultMode="system">
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}
```

## Import Patterns

```tsx
// Main exports (most common)
import { Button, Card, Input, Dialog, Badge } from '@opencosmos/ui'

// Subpath exports
import { useMotionPreference, useTheme } from '@opencosmos/ui/hooks'
import { ThemeProvider, TooltipProvider } from '@opencosmos/ui/providers'
import { cn } from '@opencosmos/ui/utils'
import { spacing, typography } from '@opencosmos/ui/tokens'

// Heavy/optional features (require peer dependencies)
import { Form, FormField, FormItem } from '@opencosmos/ui/forms'       // react-hook-form + zod
import { Calendar, DatePicker } from '@opencosmos/ui/dates'             // date-fns + react-day-picker
import { DataTable } from '@opencosmos/ui/tables'                       // @tanstack/react-table
import { DragDrop } from '@opencosmos/ui/dnd'                           // @dnd-kit/*
```

## Themes

Three themes, each with light and dark modes:
- **Studio** — Professional, balanced (default)
- **Terra** — Calm, organic, warm earth tones
- **Volt** — Bold, electric, cyberpunk neon

```tsx
import { useTheme } from '@opencosmos/ui/hooks'
const { theme, setTheme, mode, setMode } = useTheme()
setTheme('volt')
setMode('dark')
```

## Styling Rules

- Use CSS variables: `bg-background`, `text-foreground`, `border-border`
- NEVER hardcode colors: no `bg-white`, `text-black`, `bg-neutral-100`
- All components accept `className` for Tailwind overrides
- Merge classes with `cn()`: `import { cn } from '@opencosmos/ui/utils'`

## Motion

Every animation MUST respect user preferences:
```tsx
import { useMotionPreference } from '@opencosmos/ui/hooks'
const { shouldAnimate, scale } = useMotionPreference()
```

## Component Categories

| Category | Count | Import | Examples |
|----------|-------|--------|----------|
| Actions | 5 | `@opencosmos/ui` | Button, Toggle, ToggleGroup, Link, Magnetic |
| Forms | 18 | `@opencosmos/ui` | Input, Textarea, Select, Checkbox, Switch, Slider, Combobox, RadioGroup, Label, SearchBar |
| Navigation | 7 | `@opencosmos/ui` | Tabs, Breadcrumb, Pagination, NavigationMenu, Menubar, Command |
| Overlays | 8 | `@opencosmos/ui` | Dialog, AlertDialog, Popover, Tooltip, HoverCard, ContextMenu, DropdownMenu, Drawer |
| Feedback | 6 | `@opencosmos/ui` | Alert, Toaster/toast, Progress, Skeleton, Spinner |
| Data Display | 14 | `@opencosmos/ui` | Card, Badge, Avatar, Table, Carousel, AspectRatio, Collapsible, CodeBlock |
| Layout | 8 | `@opencosmos/ui` | Accordion, Separator, ScrollArea, ResizablePanel, Sheet |
| Features | 3 | `@opencosmos/ui` | CustomizerPanel, ThemeSwitcher |

## High-Frequency Component Quick Reference

### Button
```tsx
<Button variant="default|destructive|outline|secondary|ghost|link" size="sm|default|lg|icon">
  Label
</Button>
```

### Card
```tsx
<Card>
  <CardHeader><CardTitle>Title</CardTitle><CardDescription>Desc</CardDescription></CardHeader>
  <CardContent>Body</CardContent>
  <CardFooter>Actions</CardFooter>
</Card>
```

### Dialog
```tsx
<Dialog>
  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader><DialogTitle>Title</DialogTitle><DialogDescription>Desc</DialogDescription></DialogHeader>
    Body
    <DialogFooter><Button>Confirm</Button></DialogFooter>
  </DialogContent>
</Dialog>
```

### Input
```tsx
<Input type="email" placeholder="Enter email" disabled={false} />
```

### Select
```tsx
<Select value={val} onValueChange={setVal}>
  <SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="a">Option A</SelectItem>
    <SelectItem value="b">Option B</SelectItem>
  </SelectContent>
</Select>
```

### Tabs
```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### Badge
```tsx
<Badge variant="default|secondary|destructive|outline">Label</Badge>
```

### Alert
```tsx
<Alert variant="default|destructive">
  <AlertTitle>Heading</AlertTitle>
  <AlertDescription>Message</AlertDescription>
</Alert>
```

### Form (react-hook-form integration)
```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@opencosmos/ui/forms'

<Form {...form}>
  <FormField control={form.control} name="email" render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl><Input {...field} /></FormControl>
      <FormMessage />
    </FormItem>
  )} />
</Form>
```

## Bundle Size (minified + brotli)

| Entrypoint | Size | Peer Deps Required |
|------------|------|--------------------|
| `@opencosmos/ui` (core) | 146 KB | None |
| `@opencosmos/ui/dates` | 29 KB | date-fns, react-day-picker |
| `@opencosmos/ui/tokens` | 11 KB | None |
| `@opencosmos/ui/utils` | 10 KB | None |
| `@opencosmos/ui/forms` | 9 KB | react-hook-form, zod |
| `@opencosmos/ui/tables` | 8 KB | @tanstack/react-table |
| `@opencosmos/ui/dnd` | 8 KB | @dnd-kit/* |
| `@opencosmos/ui/providers` | 8 KB | None |
| `@opencosmos/ui/hooks` | 6 KB | None |
| `@opencosmos/ui/webgl` | 1 KB | framer-motion |

`sideEffects: false` enables tree-shaking. Heavy features isolated behind subpath exports.

## Third-Party Pairings

For gaps SDE doesn't cover, these libraries integrate well:

| Need | Library | Install |
|------|---------|---------|
| Rich Text Editor | Tiptap | `@tiptap/react @tiptap/starter-kit` |
| File Upload | react-dropzone | `react-dropzone` |
| Charts | Recharts | `recharts` |
| Color Picker | react-colorful | `react-colorful` |
| Markdown | react-markdown | `react-markdown remark-gfm` |
| Virtualized Lists | @tanstack/react-virtual | `@tanstack/react-virtual` |
| State Machines | XState | `xstate @xstate/react` |

**Already integrated as optional peer deps:** @tanstack/react-table (`/tables`), react-hook-form + zod (`/forms`), date-fns + react-day-picker (`/dates`), @dnd-kit (`/dnd`), framer-motion, lucide-react.

**Integration pattern:** Wrap in SDE Card/Dialog, use `cn()` for class merging, pull colors from CSS variables (`var(--color-primary)`) to stay theme-aware.

## Eject (Full Customization)

```bash
npx @opencosmos/ui eject Button              # copies to src/components/ui/Button.tsx
npx @opencosmos/ui eject Dialog --dir my/dir  # custom target
npx @opencosmos/ui eject --list               # list all components
```

Imports are automatically rewritten:
- `../../lib/utils` → `./utils` (auto-scaffolded)
- `../../hooks/*` → `@opencosmos/ui/hooks`
- `../category/*` → `@opencosmos/ui`

Ejected components keep working with SDE themes and CSS variables. Also available via MCP tool `eject_component` and web UI at opencosmos.ai/studio.

## Full API Reference

For complete props, variants, and examples for all 100 components:
- Web: https://opencosmos.ai/studio/llms-full.txt
- MCP Server: `npx @opencosmos/mcp` (tools: list_components, search_components, get_component)

## Resources

- Docs: https://opencosmos.ai/studio/docs
- GitHub: https://github.com/shalomormsby/opencosmos-ui
- NPM: https://www.npmjs.com/package/@opencosmos/ui
