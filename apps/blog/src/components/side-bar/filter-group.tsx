import { TableHeader } from '../ui/table-header';
import { Accordion } from '../ui/accordion';
import { FilterItem } from './filter-item';
import { TriggerButton } from './trigger-button';
interface FilterGroupProps {
  filterItems: Record<string, number>;
}

export const FilterGroup = ({ filterItems = {} }: FilterGroupProps) => {
  return (
    <aside className='grid grid-cols-subgrid col-span-full md:col-span-4 gap-y-4 self-start'>
      <TableHeader className='col-span-full'>
        <span className='col-start-1 col-span-3 text-primary text-xs font-semibold uppercase'>
          / filters
        </span>
      </TableHeader>

      <div className='col-span-full flex flex-col self-start'>
        <Accordion defaultValue='filters'>
          <Accordion.Trigger asChild={true}>
            <TriggerButton>Tags</TriggerButton>
          </Accordion.Trigger>
          <Accordion.Content>
            <div className='flex flex-col ml-2.5 mt-2'>
              <ul className='flex gap-x-2 overflow-x-auto no-scrollbar md:flex-col md:gap-y-1 md:border-l md:border-border/50 md:border-dotted md:pl-3.5'>
                {Object.entries(filterItems).map(([tag, count]) => (
                  <li key={tag} className='whitespace-nowrap'>
                    <FilterItem label={tag} postsCount={count} />
                  </li>
                ))}
              </ul>
            </div>
          </Accordion.Content>
        </Accordion>
      </div>
    </aside>
  );
};
