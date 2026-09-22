import { getCollection, type CollectionEntry } from 'astro:content';
import config from '../../site.config.json';

export const site = config;
export type Post = CollectionEntry<'posts'>;

const BASE = import.meta.env.BASE_URL.replace(/\/$/, ''); // '' at the domain root, '/vendorcheckuk' under a subpath
export const withBase = (p: string) => BASE + p;
export const stripBase = (pathname: string) => (BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) || '/' : pathname);

export const folderOf = (p: Post) => p.id.split('/').slice(0, -1).join('/');
export const slugOf = (p: Post) => p.id.split('/').pop() as string;
export const postUrl = (p: Post) => withBase(`/posts/${p.id}/`);

const utm = `utm_source=${site.slug}&utm_medium=blog`;
export const bannerHref = (url: string) => url + (url.includes('?') ? '&' : '?') + utm;

export const orgJsonLd = (origin: string | URL) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.name,
  url: new URL(withBase('/'), origin).href,
});

export const articleJsonLd = (post: Post) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.data.title,
  description: post.data.description,
  datePublished: post.data.date.toISOString(),
  author: { '@type': 'Organization', name: site.name },
  publisher: { '@type': 'Organization', name: site.name },
});

export async function getPosts(): Promise<Post[]> {
  const all = await getCollection('posts');
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id));
}

export function countBy(posts: Post[], key: (p: Post) => string): [string, number][] {
  const m = new Map<string, number>();
  for (const p of posts) m.set(key(p), (m.get(key(p)) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });

export const readingTime = (p: Post) => Math.max(1, Math.round((p.body ?? '').split(/\s+/).filter(Boolean).length / 220));
export const rawUrl = (p: Post) => withBase(`/posts/${p.id}.md`);

export const catLabel = (c: string) => {
  const t = c.replace(/-/g, ' ');
  return t.charAt(0).toUpperCase() + t.slice(1);
};

const CAT_BLURB: Record<string, string> = {
  sourcing: 'Finding a UK seller worth ordering from in the first place.',
  usage: 'Reading a listing, a COA and a checkout page correctly.',
  'general-info': 'What "legitimate" actually means in this market.',
};
const CAT_SHORT: Record<string, string> = { 'general-info': 'Basics' };
export const catShort = (c: string) => CAT_SHORT[c] ?? catLabel(c);

export const catBlurb = (c: string) => CAT_BLURB[c] ?? 'Guides from the archive.';

// Dossier tones: stamp-ink red for sourcing (the seller itself), manila-gold for usage (reading
// a listing/checkout), deep navy for general-info -- no purple, no blue/teal gradients.
const TONES = ['stamp', 'gold', 'navy'] as const;
const CAT_TONE: Record<string, (typeof TONES)[number]> = { sourcing: 'stamp', usage: 'gold', 'general-info': 'navy' };
export const catTone = (c: string) => CAT_TONE[c] ?? TONES[[...c].reduce((n, ch) => n + ch.charCodeAt(0), 0) % TONES.length];

// A checklist/stamp tag stands in for blog-1's element-letter device -- this blog's motif is
// the verification stamp and the tick, not the periodic table.
const CAT_TAG: Record<string, string> = { sourcing: 'Vet', usage: '✓', 'general-info': 'Ref' };
export const catSymbol = (c: string) => {
  if (CAT_TAG[c]) return CAT_TAG[c];
  const l = c.replace(/[^a-z]/gi, '');
  return l.charAt(0).toUpperCase() + l.charAt(1).toLowerCase();
};
