import assert from 'node:assert/strict';
import test from 'node:test';
import matter from 'gray-matter';
import { updatePostPublishedInSource } from './post-visibility.ts';

test('updates published frontmatter and preserves markdown content', () => {
  const source = `---
title: 'Sample'
description: 'Description'
date: '2026-01-01'
tags: ['next']
---

# Heading

Body`;

  const updatedSource = updatePostPublishedInSource(source, false);
  const parsed = matter(updatedSource);

  assert.equal(parsed.data.published, false);
  assert.equal(parsed.content.trim(), '# Heading\n\nBody');
});

test('keeps visible posts explicitly published when requested', () => {
  const source = `---
title: 'Sample'
description: 'Description'
date: '2026-01-01'
published: false
---

Body`;

  const updatedSource = updatePostPublishedInSource(source, true);
  const parsed = matter(updatedSource);

  assert.equal(parsed.data.published, true);
});
