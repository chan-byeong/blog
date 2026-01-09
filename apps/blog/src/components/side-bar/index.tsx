import { FilterGroup } from './filter-group'
import { Header } from './header'

export const SideBar = () => {
  return (
    <div className='sticky top-20 grid grid-cols-subgrid grid-rows-subgrid col-span-5 row-span-2 gap-y-14 self-start'>
      <Header title='Blog' totalPosts={0} />
      <FilterGroup />
    </div>
  )
}
