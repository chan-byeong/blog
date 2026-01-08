import { TableHeader } from '../ui/table-header';
import { Accordion } from '../ui/accordion';
import { FilterItem } from './filter-item';
import { TriggerButton } from './trigger-button';

const filterItems = [
  { label: 'All', postsCount: 0 },
  { label: 'Frontend', postsCount: 0 },
  { label: 'Backend', postsCount: 0 },
  { label: 'Fullstack', postsCount: 0 },
  { label: 'Mobile', postsCount: 0 },
  { label: 'Design', postsCount: 0 },
  { label: 'Marketing', postsCount: 0 },
  { label: 'Business', postsCount: 0 },
  { label: 'Other', postsCount: 0 },
];

export const FilterGroup = () => {
  return (
    <aside className='grid grid-cols-subgrid col-span-4 gap-y-4 self-start'>
      <TableHeader className='col-span-full'>
        <span className='col-start-1 col-span-3 text-primary text-sm font-semibold uppercase'>
          / filters
        </span>
      </TableHeader>

      <div className='col-span-full flex flex-col self-start'>
        <Accordion defaultValue='filters'>
          <Accordion.Trigger asChild>
            <TriggerButton>Tags</TriggerButton>
          </Accordion.Trigger>
          <Accordion.Content>
            <div className='flex flex-col ml-2.5 mt-2'>
              <ul className='flex flex-col gap-y-1 border-l border-border border-dotted pl-3.5'>
                {filterItems.map((item) => (
                  <li key={item.label}>
                    <FilterItem
                      label={item.label}
                      postsCount={item.postsCount}
                    />
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
