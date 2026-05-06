import { useState } from 'react';
import { useTheme } from 'next-themes';
import {
  loginAdminFromConsole,
  redirectAdminFromConsole,
} from '@/lib/admin/client-login';

type ConsoleMode = 'normal' | 'password';

type ConsoleCommandResult =
  | {
      type: 'output';
      message: string;
    }
  | {
      type: 'clear';
    };

const ADMIN_ID_MAX_LENGTH = 64;
const ADMIN_PASSWORD_MAX_LENGTH = 256;
const INVALID_CREDENTIALS_MESSAGE = 'Invalid credentials';
const UNAUTHORIZED_MESSAGE = 'Unauthorized';

export const useConsoleCommand = () => {
  const [mode, setMode] = useState<ConsoleMode>('normal');
  const [pendingAdminId, setPendingAdminId] = useState<string | null>(null);
  const { setTheme } = useTheme();

  const parseInput = (input: string) => {
    const [command = '', ...options] = input.trim().split(/\s+/);

    return {
      command: command.toLowerCase(),
      options,
    };
  };

  const executeCommand = async (
    input: string
  ): Promise<ConsoleCommandResult> => {
    if (mode === 'password') {
      return loginAdmin(input);
    }

    const { command, options } = parseInput(input);

    switch (command) {
      case 'help':
        return {
          type: 'output',
          message: 'Available commands: help, clear, /admin <id>, /gogo, theme',
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
      case '/admin':
        return startAdminLogin(options);
      case '/gogo':
        return redirectAdmin();
      default:
        return {
          type: 'output',
          message: `Unknown command: ${command}. Type 'help' for available commands.`,
        };
    }
  };

  const startAdminLogin = (options: string[]): ConsoleCommandResult => {
    if (options.length !== 1) {
      return { type: 'output', message: 'usage: /admin <id>' };
    }

    const adminId = options[0]?.trim() ?? '';

    if (!adminId || adminId.length > ADMIN_ID_MAX_LENGTH) {
      return { type: 'output', message: 'usage: /admin <id>' };
    }

    setPendingAdminId(adminId);
    setMode('password');

    return { type: 'output', message: 'enter admin password:' };
  };

  const redirectAdmin = async (): Promise<ConsoleCommandResult> => {
    const result = await redirectAdminFromConsole();

    if (result.success) {
      return { type: 'output', message: 'redirecting...' };
    }

    return { type: 'output', message: UNAUTHORIZED_MESSAGE };
  };

  const loginAdmin = async (
    password: string
  ): Promise<ConsoleCommandResult> => {
    if (!pendingAdminId) {
      resetAdminLogin();
      return { type: 'output', message: INVALID_CREDENTIALS_MESSAGE };
    }

    if (!password || password.length > ADMIN_PASSWORD_MAX_LENGTH) {
      return { type: 'output', message: INVALID_CREDENTIALS_MESSAGE };
    }

    const result = await loginAdminFromConsole({
      id: pendingAdminId,
      password,
    });

    if (result.success) {
      resetAdminLogin();

      return {
        type: 'output',
        message: 'admin login successful, redirecting...',
      };
    }

    resetAdminLogin();
    return { type: 'output', message: INVALID_CREDENTIALS_MESSAGE };
  };

  const resetAdminLogin = () => {
    setPendingAdminId(null);
    setMode('normal');
  };

  return {
    mode,
    executeCommand,
  };
};
