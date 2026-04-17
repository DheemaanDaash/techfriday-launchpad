

The user is refining the previous TechCrunch import plan. Key clarifications:

1. **Layout**: 3-column hero — Col 1: large image post, Col 2: image post (image fits Col 1's image height/proportions, but smaller card overall), Col 3: top headlines list. So Col 1 is the "lead" with bigger image, Col 2 is secondary with same image dimensions but maybe stacked layout, Col 3 is text headlines.

2. **Import button**: Generic label like "Import Posts" — no "TechCrunch" branding visible.

3. **No attribution/link-back** to source needed.

4. **Rewrite content** slightly using AI (Lovable AI Gateway), but **preserve quotes verbatim**.

This is a focused implementation plan now. Keep it concise.

## Plan: TechCrunch Import + 3-Column Hero

### 1. Home Hero — 3-Column Layout (`src/pages/Home.tsx`)

```text
+----------------------+----------------+----------------+
|  Col 1: Lead Post    | Col 2: Post    | Col 3: Top     |
|  [LARGE IMAGE]       | [IMAGE same    | Headlines      |
|                      |  height as     |                |
|  Title (xl)          |  Col 1 image]  | 1. Headline... |
|  Excerpt             | Title (lg)     | 2. Headline... |
|                      | Excerpt        | 3. Headline... |
|                      |                | 4. Headline... |
|                      |                | 5. Headline... |
+----------------------+----------------+----------------+
```

- Grid: `lg:grid-cols-4` → Col 1 spans 2, Col 2 spans 1, Col 3 spans 1
- Col 1 & 2 images use the same `aspect-video` ratio so heights align
- Col 3 = ordered headline list (next 5 posts)
- Video section moves below hero (kept as standalone row)
- Recent posts grid + newsletter remain below

### 2. Import Feature

**Connector**: Firecrawl (for scraping) + Lovable AI Gateway (for rewriting).

**Edge function**: `supabase/functions/import-posts/index.ts`
- Calls Firecrawl `scrape` on `https://techcrunch.com` to get latest article links + metadata
- For each article (limit 5): scrape full content → send to Lovable AI (`google/gemini-2.5-flash`) with prompt: *"Rewrite this article in your own words. Keep all direct quotes (text inside quotation marks) exactly as-is. Return JSON: {title, excerpt, content}."*
- Insert into `posts` table as `draft` status, default category = "News", featured_image from scraped og:image
- Return count of imported posts

**Admin UI** (`src/pages/admin/Posts.tsx`):
- Add "Import Posts" button (no source name) next to "New Post"
- On click → confirmation dialog → invoke edge function → show toast with count → refresh list

### 3. Files to Create / Edit

| File | Action |
|------|--------|
| `supabase/functions/import-posts/index.ts` | Create |
| `src/pages/Home.tsx` | Rewrite hero to 3-column |
| `src/pages/admin/Posts.tsx` | Add Import button + dialog |

### 4. Prerequisites

- Connect **Firecrawl** connector (will prompt user)
- Lovable AI Gateway (`LOVABLE_API_KEY`) — already available

### 5. Notes

- Imports default to `draft` so admin reviews before publishing
- Quotes preserved verbatim per AI prompt instruction
- No source attribution or back-links inserted into post content

