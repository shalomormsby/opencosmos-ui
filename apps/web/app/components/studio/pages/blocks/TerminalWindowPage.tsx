'use client';

import { TerminalWindow, Card, Heading, Text, Stack, CollapsibleCodeBlock, ThemeToggle } from '@opencosmos/ui';

const CONST_CODE = `import { TerminalWindow } from '@opencosmos/ui';

export function InstallDemo() {
  return (
    <TerminalWindow
      title="Terminal — zsh"
      lines={[
        '$ npm install @opencosmos/ui',
        '✓ installed 1 package',
        '✓ ready to build',
      ]}
      loop
    />
  );
}`;

export function TerminalWindowPage() {
  return (
    <div className="space-y-12 pb-24">
      {/* Header */}
      <Stack className="space-y-2">
        <div className="flex items-center justify-between">
          <Heading level={1}>Terminal Window</Heading>
          <ThemeToggle />
        </div>
        <Text variant="secondary" className="text-xl max-w-2xl">
          A mac-style terminal window that reveals lines one at a time, with a
          working copy-to-clipboard button. Built for install/CTA moments —
          respects motion preferences and shows all lines instantly when
          animation is disabled.
        </Text>
      </Stack>

      {/* Preview */}
      <Card className="p-8 flex items-center justify-center">
        <div className="w-full max-w-xl">
          <TerminalWindow
            title="Terminal — zsh"
            lines={[
              '$ npm install @opencosmos/ui',
              '✓ installed 1 package',
              '✓ ready to build',
            ]}
            loop
          />
        </div>
      </Card>

      {/* Code */}
      <section className="space-y-4">
        <Heading level={2}>Usage</Heading>
        <CollapsibleCodeBlock
          id="terminal-window-usage"
          code={CONST_CODE}
          language="tsx"
          defaultCollapsed={false}
        />
      </section>
    </div>
  );
}
