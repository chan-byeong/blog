interface HeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {
  title: string
  totalPosts: number
}

export const Header = ({ title, totalPosts, ...props }: HeaderProps) => {
  return (
    <h2
      className='col-span-full flex text-8xl tracking-tighter font-medium font-inter text-primary self-start'
      {...props}
    >
      {title}
      <sup className='text-sm tracking-tight font-normal text-primary ml-2 align-top'>( {totalPosts} )</sup>
    </h2>
  )
}
