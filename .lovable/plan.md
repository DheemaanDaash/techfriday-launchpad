

# TechFriday Blog Publishing Admin Portal — Phased Plan

This plan is designed to be built over multiple days using ~5 credits per day. Each phase is a single prompt/credit worth of work.

---

## Phase 1: Backend Setup (Day 1 — 3 credits)

**Credit 1** — Enable Lovable Cloud, create database tables:
- `categories` table (id, name, slug, created_at)
- `posts` table (id, title, slug, content, excerpt, featured_image, category_id, status [draft/published], author, published_at, created_at, updated_at)
- Seed default categories: Android, Apple, News, Samsung, Uncategorized, Videos

**Credit 2** — Set up authentication:
- Admin login page at `/admin/login`
- Protect all `/admin/*` routes behind auth
- RLS policies so only authenticated admin can CRUD posts/categories

**Credit 3** — Verify auth flow works end-to-end

---

## Phase 2: Admin Dashboard & Category Management (Day 2 — 5 credits)

**Credit 4** — Admin layout with sidebar navigation (Dashboard, Posts, Categories, Settings) and a dashboard overview page showing post/category counts

**Credit 5** — Category management page: list all categories in a table with add/edit/delete functionality

**Credit 6** — Post list page: table of all posts with title, category, status, date, and action buttons (edit/delete/view)

**Credit 7** — Post create/edit form: title, slug (auto-generated), category dropdown, rich text content editor, excerpt, featured image upload, status toggle (draft/published)

**Credit 8** — Verify admin CRUD for posts and categories works end-to-end

---

## Phase 3: Rich Editor & Image Upload (Day 3 — 4 credits)

**Credit 9** — Integrate a Markdown or rich text editor (TipTap) into the post form for formatted content

**Credit 10** — Set up Supabase Storage bucket for post images, wire featured image upload into the post form

**Credit 11** — Post preview: allow admin to preview a post before publishing

**Credit 12** — Test editor, image upload, and preview flow

---

## Phase 4: Public Blog Frontend (Day 4 — 5 credits)

**Credit 13** — Blog listing page at `/blog`: display published posts as cards with featured image, title, excerpt, category badge, and date

**Credit 14** — Single post page at `/blog/:slug`: render full post content with category, date, and related posts

**Credit 15** — Category filter page at `/category/:slug`: list posts filtered by category

**Credit 16** — Wire Home page hero section to show latest/featured posts

**Credit 17** — Test public blog pages, category filtering, and navigation

---

## Phase 5: Polish & Extras (Day 5 — 3-5 credits)

**Credit 18** — Pagination for blog listing and admin post list

**Credit 19** — Search functionality for posts (admin and public)

**Credit 20** — SEO meta tags per post (title, description, OG image), responsive polish

**Credit 21-22** — Final QA: dark/light mode consistency, mobile responsiveness, edge cases

---

## Technical Approach

- **Backend**: Lovable Cloud (Supabase) for database, auth, storage, and RLS
- **Editor**: TipTap rich text editor (React-compatible, free)
- **Routing**: React Router nested routes — `/admin/*` for admin, `/blog/*` for public
- **State**: TanStack Query for all data fetching/mutations
- **UI**: Existing shadcn/ui components (tables, forms, dialogs, cards)

## Summary

5 phases over 5 days, ~20-22 credits total. Each day's work is self-contained and testable. By the end you have: admin auth, category CRUD, post CRUD with rich editor and image upload, public blog with category filtering, search, pagination, and SEO.

