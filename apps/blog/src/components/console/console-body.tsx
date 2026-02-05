import { useEffect, useRef } from 'react';

interface ConsoleBodyProps {
  logs: string[];
  input: string;
  mode: 'normal' | 'password';
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePressEnter: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}
const asciiArt = ` __                                                             __
/\\ \\                                                           /\\ \\
\\ \\ \\____  __  __     __    ___   __  __    ___      __        \\_\\ \\     __   __  __
 \\ \\ '__\`\\/\\ \\/\\ \\  /'__\`\\ / __\`\\/\\ \\/\\ \\ /' _ \`\\  /'_ \`\\      /'_\\ \`\\  /'__\`\\/\\ \\/\\ \\
  \\ \\ \\L\\ \\ \\ \\_\\ \\/\\  __//\\ \\L\\ \\ \\ \\_\\ \\/\\ \\/\\ \\/\\ \\L\\ \\  __/\\ \\L\\ \\/\\  __/\\ \\ \\_/ |
   \\ \\_,__/\\/\`____ \\ \\____\\ \\____/\\ \\____/\\ \\_\\ \\_\\ \\____ \\/\\_\\ \\___,_\\ \\____\\\\ \\___/
    \\/___/  \`/___/> \\/____/\\/___/  \\/___/  \\/_/\\/_/\\/___L\\ \\/_/\\/__,_ /\\/____/ \\/__/
               /\\___/                                /\\____/
               \\/__/                                 \\_/__/`;

export const ConsoleBody = ({
  logs,
  input,
  mode,
  handleInputChange,
  handlePressEnter,
}: ConsoleBodyProps) => {
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = logsContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  const handleBodyClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      aria-label='console-body'
      className='m-0.5 flex min-h-0 flex-1 flex-col rounded-sm bg-black'
      onClick={handleBodyClick}
    >
      <div
        ref={logsContainerRef}
        aria-label='console-logs'
        className='min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-2 wrap-break-word [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
      >
        <pre className='text-[#e9e9e9]'>{asciiArt}</pre>
        <div className='text-[#e9e9e9]'>
          Type &quot;help&quot; for available commands.
        </div>
        {logs.map((log, index) => (
          <div key={`${index}-${log}`} className='py-0.5 text-[#e9e9e9]'>
            {log}
          </div>
        ))}

        <div className='flex items-center gap-2'>
          <span className='text-[#e9e9e9] select-none'>&gt;</span>
          <input
            ref={inputRef}
            type={mode === 'password' ? 'password' : 'text'}
            className='min-w-0 flex-1 bg-transparent text-[#e9e9e9] outline-none'
            placeholder={
              mode === 'password' ? 'Enter password...' : 'Enter command...'
            }
            value={input}
            onChange={handleInputChange}
            onKeyDown={handlePressEnter}
          />
        </div>
      </div>
    </div>
  );
};
