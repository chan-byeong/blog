interface HeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {
  title: string;
  totalPosts: number;
}

export const Header = ({ title, totalPosts, ...props }: HeaderProps) => {
  return (
    <h2
      className='font-inter text-primary col-span-full flex self-start font-medium tracking-tighter'
      style={{ fontSize: 'clamp(2rem, 8vw, 6rem)' }}
      {...props}
    >
      {title}
      <sup
        className='text-primary translate-y-7 font-normal tracking-tight'
        style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)' }}
      >
        ( {totalPosts} )
      </sup>
    </h2>
  );
};
