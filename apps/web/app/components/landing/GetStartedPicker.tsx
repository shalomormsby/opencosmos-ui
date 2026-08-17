'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  TerminalWindow,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@opencosmos/ui';
import { ChevronDown, Terminal, MousePointer2, Code2, Monitor, ArrowUpRight } from 'lucide-react';

interface Agent {
  id: string;
  label: string;
  icon: React.ReactNode;
  lines: string[];
  /** Shown as a link below the terminal when this agent also needs MCP config. */
  mcpConfigFile?: string;
  comingSoon?: boolean;
}

const AGENTS: Agent[] = [
  {
    id: 'claude-code',
    label: 'Claude Code',
    icon: <Terminal className="w-4 h-4" />,
    lines: [
      '$ npm install @opencosmos/ui',
      '✓ installed 1 package',
      '✓ /create skill auto-discovered — no extra setup',
    ],
  },
  {
    id: 'cursor',
    label: 'Cursor',
    icon: <MousePointer2 className="w-4 h-4" />,
    lines: [
      '$ npm install @opencosmos/ui',
      '$ npm install --save-dev @opencosmos/mcp',
    ],
    mcpConfigFile: '.cursor/mcp.json',
  },
  {
    id: 'vscode',
    label: 'VS Code',
    icon: <Code2 className="w-4 h-4" />,
    lines: [
      '$ npm install @opencosmos/ui',
      '$ npm install --save-dev @opencosmos/mcp',
    ],
    mcpConfigFile: '.vscode/mcp.json',
  },
  {
    id: 'claude-desktop',
    label: 'Claude Desktop',
    icon: <Monitor className="w-4 h-4" />,
    lines: [
      '$ npm install @opencosmos/ui',
      '$ npm install --save-dev @opencosmos/mcp',
    ],
    mcpConfigFile: 'claude_desktop_config.json',
  },
  {
    id: 'codex-cli',
    label: 'Codex CLI',
    icon: <Terminal className="w-4 h-4" />,
    lines: [],
    comingSoon: true,
  },
  {
    id: 'copilot-cli',
    label: 'GitHub Copilot CLI',
    icon: <Terminal className="w-4 h-4" />,
    lines: [],
    comingSoon: true,
  },
];

export function GetStartedPicker() {
  const router = useRouter();
  const [selected, setSelected] = useState<Agent>(AGENTS[0]);

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs uppercase tracking-wide text-[var(--color-text-tertiary)]">
          Bring your own agent
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              {selected.icon}
              {selected.label}
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {AGENTS.map((agent) => (
              <DropdownMenuItem
                key={agent.id}
                disabled={agent.comingSoon}
                onClick={() => !agent.comingSoon && setSelected(agent)}
                className="gap-2"
              >
                {agent.icon}
                {agent.label}
                {agent.comingSoon && (
                  <span className="ml-auto text-xs text-[var(--color-text-tertiary)]">
                    Coming soon
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <TerminalWindow
        key={selected.id}
        title="Terminal — zsh"
        lines={selected.lines}
        copyText={selected.lines
          .filter((line) => line.startsWith('$'))
          .map((line) => line.slice(2))
          .join('\n')}
      />

      {selected.mcpConfigFile && (
        <button
          onClick={() => router.push('/docs/mcp-server/installation')}
          className="mt-2 flex items-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
        >
          + add the MCP config for {selected.mcpConfigFile}
          <ArrowUpRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
