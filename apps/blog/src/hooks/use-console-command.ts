import { useTheme } from 'next-themes';
import { useState } from 'react';

export const useConsoleCommand = () => {
  const [mode, setMode] = useState<'normal' | 'password'>('normal');
  const { setTheme } = useTheme();

  const parseInput = (input: string) => {
    const [command, options] = input.trim().split(/\s+/).filter(Boolean);
    return [command.toLowerCase(), options];
  };

  const executeCommand = (input: string) => {
    const [command, options] = parseInput(input);
    switch (command) {
      case 'help':
        return {
          type: 'output',
          message: 'Available commands: help, clear, admin, theme',
        };
      case 'clear':
        return { type: 'clear' };
      case 'theme':
        if (options.includes('light')) {
          setTheme('light');
          return { type: 'output', message: 'theme set to light' };
        }
        if (options.includes('dark')) {
          setTheme('dark');
          return { type: 'output', message: 'theme set to dark' };
        }
        return {
          type: 'output',
          message: 'theme command requires "light" or "dark" option',
        };
      case 'admin':
        return { type: 'output', message: 'not implemented' };
        if (options.includes('-l') || options.includes('--login')) {
          const username = options[1] ?? '';
          if (!username) {
            return { type: 'output', message: 'Username is required' };
          }
          setMode('password');
          return {
            type: 'output',
            message: `enter your password for ${username}: `,
          };
        }
        return {
          type: 'output',
          message: 'admin command requires -l or --login option',
        };
      case 'pwd':
        const pwd = options[0] ?? '';
        if (!pwd) {
          return { type: 'output', message: 'Password is required' };
        }
        // TODO: verify password
        return {
          type: 'output',
          message: 'admin login successful, redirecting to /admin...',
        };
      default:
        return {
          type: 'output',
          message: `Unknown command: ${command}. Type 'help' for available commands.`,
        };
    }
  };

  return {
    mode,
    executeCommand,
  };
};
