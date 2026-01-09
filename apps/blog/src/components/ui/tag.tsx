interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  icon?: React.ReactNode;
}

export const Tag = ({ label, icon, ...props }: TagProps) => {
  return (
    <span
      className='inline-flex gap-1.5 items-center bg-transparent px-1.5 py-1 text-sm font-medium text-primary hover:bg-muted-foreground/20 transition-colors '
      {...props}
    >
      {icon}
      {label}
    </span>
  );
};
