interface HeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {
  title: string;
  totalPosts: number;
}

export const Header = ({ title, totalPosts, ...props }: HeaderProps) => {
  return (
    <h2
      className='col-span-full flex tracking-tighter font-medium font-inter text-primary self-start'
      style={{ fontSize: 'clamp(2rem, 8vw, 6rem)' }}
      {...props}
    >
      {title}
      <sup
        className='tracking-tight font-normal text-primary translate-y-7'
        style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)' }}
      >
        ( {totalPosts} )
      </sup>
    </h2>
  );
};
