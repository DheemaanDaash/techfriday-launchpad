

## Plan: Remaining Items + Sign Out Fix + Sidebar Logo Behavior

### Remaining Items from the Original Plan

| Item | Status |
|------|--------|
| Post preview before publishing | Not built |
| `/category/:slug` route | Not built |
| Home page hero with latest posts | Placeholder only |
| Admin-side pagination | Not built |
| Search (admin + public) | Not built |
| OG image meta tags | Not built |
| Dark/light mode QA | Not done |
| Sign out redirect | Needs improvement |
| Sidebar collapsed logo | Needs fix |

### What This Plan Covers

**1. Admin Sidebar — collapsed logo fix**
- When sidebar is collapsed, show only the favicon/logo image (no text) at its current size so menu items don't shift position
- Currently the logo already shows when collapsed, but the `SidebarGroupLabel` layout changes. Fix: always render the logo `img` at a fixed size; only conditionally render the text span. Ensure the label container has consistent height/padding.

**2. Sign Out — redirect to /admin/login**
- Update the `signOut` function call in `AdminSidebar.tsx` to navigate to `/admin/login` after signing out using `useNavigate`.

**3. Post Preview (Phase 3 remaining)**
- Add a "Preview" button in `PostForm.tsx` that opens a dialog/modal rendering the post content with the same `prose` styling used on the public blog post page.

**4. `/category/:slug` route (Phase 4 remaining)**
- Create `src/pages/CategoryPosts.tsx` — fetches category by slug, lists published posts filtered by that category with pagination.
- Add route `/category/:slug` in `App.tsx` under the Layout wrapper.

**5. Home page hero section (Phase 4 remaining)**
- Rebuild `Home.tsx` with a hero showing latest 3-4 featured/published posts (large card + smaller cards grid).
- Below hero: recent posts grid section.

**6. Admin pagination (Phase 5)**
- Add pagination controls to the Posts list page in admin (`src/pages/admin/Posts.tsx`), 20 posts per page.

**7. Search (Phase 5)**
- **Public**: Add a search bar to the Blog page that filters posts by title/excerpt using Supabase `ilike`.
- **Admin**: Add a search input above the Posts table that filters by title.

**8. OG meta tags (Phase 5)**
- In `BlogPost.tsx`, add `<meta property="og:image">` and `og:title`/`og:description` using `document.head` or a `<Helmet>`-style approach (using direct DOM manipulation since react-helmet isn't installed).

**9. Dark/light mode QA**
- Review all pages for theme consistency — ensure cards, backgrounds, text colors work in both modes.

### Technical Details

**Files to create:**
- `src/pages/CategoryPosts.tsx`

**Files to modify:**
- `src/components/AdminSidebar.tsx` — fix collapsed logo, improve sign-out with redirect
- `src/pages/admin/PostForm.tsx` — add preview dialog
- `src/pages/Home.tsx` — rebuild with hero + recent posts
- `src/pages/admin/Posts.tsx` — add pagination + search
- `src/pages/Blog.tsx` — add search bar
- `src/pages/BlogPost.tsx` — add OG meta tags
- `src/App.tsx` — add `/category/:slug` route

**No database changes needed** — all features use existing tables and queries.

### Implementation Order
1. Sidebar fix (logo + sign out) — quick win
2. Post preview modal
3. Home page hero
4. Category page + route
5. Admin pagination + search
6. Public blog search
7. OG meta tags
8. Dark/light mode review

