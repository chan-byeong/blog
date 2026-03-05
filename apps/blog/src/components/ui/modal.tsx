'use client';

import { createContext, useContext, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface ModalProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  title: string;
  description?: string;
}

const ModalContext = createContext<{ close: () => void } | null>(null);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within a Modal');
  return context;
};

export const Modal = ({ content, trigger, title, description }: ModalProps) => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen} modal={false}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        {/* <DialogPrimitive.Overlay /> */}
        <DialogPrimitive.Content
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <VisuallyHidden>
            <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
          </VisuallyHidden>

          <ModalContext.Provider value={{ close }}>
            {content}
          </ModalContext.Provider>

          <VisuallyHidden>
            <DialogPrimitive.Description>
              {description}
            </DialogPrimitive.Description>
          </VisuallyHidden>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
