import { useModal } from '../ui/modal';

interface ConsoleHeaderProps {
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerMove?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
}

export const ConsoleHeader = ({
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: ConsoleHeaderProps) => {
  const { close } = useModal();

  return (
    <div
      aria-label='console-header'
      role='region'
      className='flex cursor-grab items-center justify-between bg-transparent p-1 select-none active:cursor-grabbing'
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <span className='text-xs text-gray-800'>CONSOLE</span>
      <span
        data-console-close
        onClick={close}
        onPointerDown={(e) => e.stopPropagation()}
        role='button'
        tabIndex={0}
      >
        <i className='hn hn-window-close inline-block text-sm text-gray-800'></i>
      </span>
    </div>
  );
};
