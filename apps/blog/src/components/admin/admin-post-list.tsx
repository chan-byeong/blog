'use client';

import Link from 'next/link';
import { AdminControlButton } from '@/components/admin/admin-control-button';
import { AdminStatusBadge } from '@/components/admin/admin-status-badge';
import { useAdminPosts } from '@/components/admin/admin-posts-provider';
import { TableHeader } from '@/components/ui/table-header';
import { Tag } from '@/components/ui/tag';
import type { AdminPostSummary } from '@/types/admin-post';

export function AdminPostList() {
  const { filteredPosts, pendingSlug, rowErrors, toggleVisibility } =
    useAdminPosts();

  return (
    <div className='col-span-full grid grid-cols-subgrid self-start md:col-start-6 md:row-span-2 md:row-start-2'>
      <TableHeader className='col-span-full text-xs'>
        <span className='text-primary col-span-2 col-start-1 font-semibold uppercase sm:col-span-3'>
          / Date
        </span>
        <span className='text-primary col-span-4 col-start-3 font-semibold uppercase sm:col-span-8 sm:col-start-4 md:col-span-10'>
          / Title
        </span>
        <span className='text-primary col-span-2 col-start-7 font-semibold uppercase sm:col-span-2 sm:col-start-12 md:col-span-3 md:col-start-14'>
          / Status
        </span>
        <span className='text-primary hidden font-semibold uppercase sm:col-span-3 sm:col-start-14 sm:block md:col-span-4 md:col-start-17'>
          / Visibility
        </span>
      </TableHeader>

      <ul className='col-span-full grid grid-cols-subgrid'>
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <AdminPostRow
              key={post.slug}
              post={post}
              pending={pendingSlug === post.slug}
              disabled={pendingSlug !== null}
              error={rowErrors[post.slug]}
              onToggleVisibility={toggleVisibility}
            />
          ))
        ) : (
          <li className='border-border/50 text-primary/60 col-span-full border-b-[0.5px] px-1 py-8 text-sm font-semibold uppercase'>
            No posts in this view.
          </li>
        )}
      </ul>
    </div>
  );
}

function AdminPostRow({
  post,
  pending,
  disabled,
  error,
  onToggleVisibility,
}: {
  post: AdminPostSummary;
  pending: boolean;
  disabled: boolean;
  error?: string;
  onToggleVisibility: (post: AdminPostSummary) => void;
}) {
  const actionLabel = post.published ? 'HIDE' : 'SHOW';

  return (
    <li className='border-border/50 text-primary isolate col-span-full grid grid-cols-subgrid items-center border-b-[0.5px] px-1 py-2.5'>
      <span className='col-span-2 col-start-1 text-[13px] font-semibold sm:col-span-3'>
        {post.date}
      </span>

      <div className='col-span-4 col-start-3 flex min-w-0 flex-col gap-1 sm:col-span-8 sm:col-start-4 md:col-span-10'>
        {post.published ? (
          <Link
            href={`/posts/${post.slug}`}
            className='text-md truncate font-bold hover:underline'
          >
            {post.title}
          </Link>
        ) : (
          <span className='text-md truncate font-bold'>{post.title}</span>
        )}
        {post.description ? (
          <p className='text-primary/80 line-clamp-1 text-[14px]'>
            {post.description}
          </p>
        ) : null}
        {post.tags?.length ? (
          <span className='flex flex-wrap gap-x-1'>
            {post.tags.map((tag) => (
              <Tag key={tag} label={`# ${tag}`} className='px-0 py-0 text-xs' />
            ))}
          </span>
        ) : null}
        {error ? <p className='text-destructive text-xs'>{error}</p> : null}
      </div>

      <span className='col-span-2 col-start-7 sm:col-span-2 sm:col-start-12 md:col-span-3 md:col-start-14'>
        <AdminStatusBadge published={post.published} />
      </span>

      <span className='col-span-full mt-2 sm:col-span-3 sm:col-start-14 sm:mt-0 md:col-span-4 md:col-start-17'>
        <AdminControlButton
          className='w-full sm:w-auto'
          disabled={disabled}
          onClick={() => onToggleVisibility(post)}
        >
          {pending ? 'SAVING...' : actionLabel}
        </AdminControlButton>
      </span>
    </li>
  );
}
