'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Header } from '@/components/side-bar/header';
import { TableHeader } from '@/components/ui/table-header';
import { Tag } from '@/components/ui/tag';
import { cn } from '@/lib/utils';
import type { AdminPostSummary } from '@/types/admin-post';

type VisibilityFilter = 'all' | 'published' | 'hidden';

interface AdminPostsManagerProps {
  posts: AdminPostSummary[];
}

interface VisibilitySuccessResponse {
  success: true;
  post: {
    slug: string;
    title: string;
    published: boolean;
  };
  commitSha: string;
}

const FILTERS: Array<{ label: string; value: VisibilityFilter }> = [
  { label: 'ALL', value: 'all' },
  { label: 'VISIBLE', value: 'published' },
  { label: 'HIDDEN', value: 'hidden' },
];

export const AdminPostsManager = ({ posts }: AdminPostsManagerProps) => {
  const [managedPosts, setManagedPosts] = useState(posts);
  const [selectedFilter, setSelectedFilter] =
    useState<VisibilityFilter>('all');
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

  const counts = useMemo(() => getVisibilityCounts(managedPosts), [managedPosts]);
  const filteredPosts = useMemo(
    () => getFilteredPosts(managedPosts, selectedFilter),
    [managedPosts, selectedFilter]
  );

  const handleToggleVisibility = async (post: AdminPostSummary) => {
    if (pendingSlug !== null) {
      return;
    }

    const nextPublished = !post.published;
    setPendingSlug(post.slug);
    clearRowError(post.slug, setRowErrors);
    updatePostPublished(post.slug, nextPublished, setManagedPosts);

    try {
      const response = await fetch(
        `/api/admin/posts/${encodeURIComponent(post.slug)}/visibility`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ published: nextPublished }),
        }
      );

      const payload = (await response.json()) as unknown;

      if (!response.ok || !isVisibilitySuccessResponse(payload)) {
        throw new Error('Visibility update failed.');
      }

      updatePostPublished(post.slug, payload.post.published, setManagedPosts);
    } catch {
      updatePostPublished(post.slug, post.published, setManagedPosts);
      setRowErrors((currentErrors) => ({
        ...currentErrors,
        [post.slug]: '변경을 저장하지 못했습니다.',
      }));
    } finally {
      setPendingSlug(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.assign('/');
  };

  return (
    <section className='col-span-full grid grid-cols-subgrid items-start gap-y-8 self-start pt-10 md:gap-y-14 md:pt-20'>
      <aside className='sticky col-span-full row-span-2 row-start-1 grid grid-cols-subgrid grid-rows-subgrid gap-y-8 backdrop-blur-md sm:top-20 sm:gap-y-14 md:col-span-5'>
        <Header title='Admin' totalPosts={managedPosts.length} />

        <div className='col-span-full grid grid-cols-subgrid gap-y-4 self-start md:col-span-4'>
          <TableHeader className='col-span-full'>
            <span className='text-primary col-span-3 col-start-1 text-xs font-semibold uppercase'>
              / overview
            </span>
          </TableHeader>

          <div className='col-span-full grid grid-cols-3 gap-2 text-xs font-semibold uppercase md:grid-cols-1'>
            <StatusMetric label='All' value={counts.all} />
            <StatusMetric label='Visible' value={counts.published} />
            <StatusMetric label='Hidden' value={counts.hidden} />
          </div>

          <TableHeader className='col-span-full mt-3'>
            <span className='text-primary col-span-3 col-start-1 text-xs font-semibold uppercase'>
              / filters
            </span>
          </TableHeader>

          <div
            className='col-span-full flex gap-1 overflow-x-auto md:flex-col'
            role='group'
            aria-label='visibility filters'
          >
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type='button'
                className={cn(
                  'border-border/40 text-primary min-w-24 border px-2 py-1.5 text-left text-xs font-semibold tracking-tight transition-colors md:min-w-0',
                  selectedFilter === filter.value
                    ? 'bg-foreground text-background'
                    : 'hover:bg-accent/50 bg-transparent'
                )}
                onClick={() => setSelectedFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <button
            type='button'
            className='border-border/40 text-primary hover:bg-accent/50 col-span-full mt-3 border px-2 py-1.5 text-left text-xs font-semibold tracking-tight transition-colors'
            onClick={handleLogout}
          >
            LOGOUT
          </button>
        </div>
      </aside>

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
                onToggleVisibility={handleToggleVisibility}
              />
            ))
          ) : (
            <li className='border-border/50 text-primary/60 col-span-full border-b-[0.5px] px-1 py-8 text-sm font-semibold uppercase'>
              No posts in this view.
            </li>
          )}
        </ul>
      </div>
    </section>
  );
};

function StatusMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className='border-border/40 flex items-center justify-between border px-2 py-2'>
      <span className='text-primary/60'>{label}</span>
      <span className='text-primary'>{value}</span>
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
        <span
          className={cn(
            'inline-flex border px-2 py-1 text-xs font-semibold uppercase',
            post.published
              ? 'border-primary/30 text-primary'
              : 'border-destructive/40 text-destructive'
          )}
        >
          {post.published ? 'VISIBLE' : 'HIDDEN'}
        </span>
      </span>

      <span className='col-span-full mt-2 sm:col-span-3 sm:col-start-14 sm:mt-0 md:col-span-4 md:col-start-17'>
        <button
          type='button'
          className='border-border/40 text-primary hover:bg-accent/50 disabled:text-primary/40 w-full border px-2 py-1.5 text-left text-xs font-semibold tracking-tight transition-colors disabled:cursor-not-allowed disabled:hover:bg-transparent sm:w-auto'
          disabled={disabled}
          onClick={() => onToggleVisibility(post)}
        >
          {pending ? 'SAVING...' : actionLabel}
        </button>
      </span>
    </li>
  );
}

function getVisibilityCounts(posts: AdminPostSummary[]) {
  const published = posts.filter((post) => post.published).length;

  return {
    all: posts.length,
    published,
    hidden: posts.length - published,
  };
}

function getFilteredPosts(
  posts: AdminPostSummary[],
  selectedFilter: VisibilityFilter
) {
  if (selectedFilter === 'published') {
    return posts.filter((post) => post.published);
  }

  if (selectedFilter === 'hidden') {
    return posts.filter((post) => !post.published);
  }

  return posts;
}

function updatePostPublished(
  slug: string,
  published: boolean,
  setManagedPosts: Dispatch<SetStateAction<AdminPostSummary[]>>
) {
  setManagedPosts((currentPosts) =>
    currentPosts.map((post) =>
      post.slug === slug ? { ...post, published } : post
    )
  );
}

function clearRowError(
  slug: string,
  setRowErrors: Dispatch<SetStateAction<Record<string, string>>>
) {
  setRowErrors((currentErrors) => {
    const nextErrors = { ...currentErrors };
    delete nextErrors[slug];

    return nextErrors;
  });
}

function isVisibilitySuccessResponse(
  value: unknown
): value is VisibilitySuccessResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    'post' in value &&
    'commitSha' in value &&
    value.success === true &&
    typeof value.commitSha === 'string' &&
    isVisibilityPost(value.post)
  );
}

function isVisibilityPost(
  value: unknown
): value is VisibilitySuccessResponse['post'] {
  return (
    typeof value === 'object' &&
    value !== null &&
    'slug' in value &&
    'title' in value &&
    'published' in value &&
    typeof value.slug === 'string' &&
    typeof value.title === 'string' &&
    typeof value.published === 'boolean'
  );
}
