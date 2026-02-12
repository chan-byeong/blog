'use client';

import { useState } from 'react';

import { ConsoleBody } from './console-body';
import { ConsoleHeader } from './console-header';
import { useDrag } from '@/hooks/use-drag';
import { useConsoleCommand } from '@/hooks/use-console-command';

export const Console = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');
  const { mode, executeCommand } = useConsoleCommand();

  const { containerRef, handleProps } = useDrag({
    clamp: true,
    padding: { top: 40, right: 16, bottom: 0, left: 16 },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const result = executeCommand(mode === 'password' ? `pwd ${input}` : input);
    setInput('');

    if (result.type === 'clear') {
      setLogs([]);
      return;
    }
    if (result.message) {
      setLogs((prev) => [...prev, result.message]);
    }
  };

  return (
    <div
      ref={containerRef}
      aria-label='console'
      className='fixed right-4 bottom-0 flex h-96 w-full max-w-2xl flex-col overflow-hidden border border-black bg-[#e9e9e9] font-mono text-sm shadow-md'
    >
      <ConsoleHeader {...handleProps} />
      <ConsoleBody
        logs={logs}
        input={input}
        mode={mode}
        handleInputChange={handleInputChange}
        handlePressEnter={handlePressEnter}
      />
    </div>
  );
};
