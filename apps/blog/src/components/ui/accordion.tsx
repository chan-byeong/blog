import * as RadixAccordion from '@radix-ui/react-accordion';
import { cn } from '@/lib/utils';

interface AccordionProps {
  defaultValue?: string;
  children?: React.ReactNode;
}

interface AccordionTriggerProps
  extends React.ComponentPropsWithRef<typeof RadixAccordion.Trigger> {
  children?: React.ReactNode;
  className?: string;
}

interface AccordionContentProps
  extends React.ComponentPropsWithRef<typeof RadixAccordion.Content> {
  children?: React.ReactNode;
  className?: string;
}

const AccordionRoot = ({
  defaultValue = 'item-1',
  children,
}: AccordionProps) => {
  return (
    <RadixAccordion.Root type='single' collapsible defaultValue={defaultValue}>
      <RadixAccordion.Item value={defaultValue}>{children}</RadixAccordion.Item>
    </RadixAccordion.Root>
  );
};

const AccordionTrigger = ({
  children,
  className = '',
  ...props
}: AccordionTriggerProps) => {
  return (
    <RadixAccordion.Header>
      <RadixAccordion.Trigger
        className={cn(
          'flex items-center gap-2 group w-full text-left',
          className
        )}
        {...props}
      >
        {children}
      </RadixAccordion.Trigger>
    </RadixAccordion.Header>
  );
};

const AccordionContent = ({
  children,
  className = '',
  ...props
}: AccordionContentProps) => {
  return (
    <RadixAccordion.Content
      className={cn(
        'overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp',
        className
      )}
      {...props}
    >
      {children}
    </RadixAccordion.Content>
  );
};

export const Accordion = Object.assign(AccordionRoot, {
  Trigger: AccordionTrigger,
  Content: AccordionContent,
});
