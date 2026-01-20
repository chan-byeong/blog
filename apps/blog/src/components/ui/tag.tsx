interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  icon?: React.ReactNode;
}

export const Tag = ({ label, icon, ...props }: TagProps) => {
  return (
    <span
      className='text-primary hover:bg-muted-foreground/20 inline-flex items-center gap-1.5 bg-transparent px-1.5 py-1 text-sm font-medium transition-colors'
      {...props}
    >
      {icon}
      {label}
    </span>
  );
};
