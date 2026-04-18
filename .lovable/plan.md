

## Plan: Fix Admin Session Hang + Edit Post Not Working

### Root Causes

**1. Infinite loading on stale session**
- `useAuth.tsx` sets `loading=true` initially. If the stored refresh token is expired, `supabase.auth.getSession()` can resolve with `null`, but the `onAuthStateChange` race + `await checkAdmin()` inside the listener can cause `setLoading(false)` to never fire reliably (Supabase guidance: never `await` inside `onAuthStateChange`).
- When a session silently expires while the admin tab is open, nothing forces a redirect — queries just fail and the UI keeps spinning.
- `ProtectedRoute` only redirects when `!user || !isAdmin` AFTER `loading=false`. If loading sticks, it spins forever.

**2. Edit post not working**
- Same root cause: `PostForm` fires `useQuery(["admin-post", id])` immediately. If the session is mid-refresh or expired, the query returns no data, `postLoading` stays true, and the form never renders. Combined with the auth hang, clicking Edit appears dead.
- Secondary risk: `.single()` throws if RLS blocks the row — error isn't surfaced.

### Fixes

**A. `src/hooks/useAuth.tsx`** — make auth bulletproof
- Set up `onAuthStateChange` listener FIRST, then call `getSession()` (correct order per Supabase docs).
- Move `checkAdmin` out of the async listener — use a `setTimeout(() => checkAdmin(...), 0)` "fire-and-forget" pattern to avoid deadlocks.
- Always call `setLoading(false)` in a `finally` block on `getSession()`.
- Listen for `TOKEN_REFRESHED` failure / `SIGNED_OUT` events: when session becomes null after being non-null, clear state so `ProtectedRoute` redirects to login.
- Add a hard timeout (e.g., 5s) — if loading hasn't resolved, force `loading=false` and `user=null` so the user lands on login instead of an infinite spinner.

**B. `src/components/ProtectedRoute.tsx`** — handle expired sessions gracefully
- Already redirects when `!user`. Add a toast/notice when redirect happens due to expiry (optional).

**C. `src/pages/admin/PostForm.tsx`** — handle query failures
- Add `error` from `useQuery` and show an error state with "Back to Posts" instead of spinning.
- Gate the query on `useAuth().user` being present (`enabled: isEdit && !!user`).
- Surface the toast on query error.

### Files to Edit

| File | Change |
|------|--------|
| `src/hooks/useAuth.tsx` | Reorder listener/getSession, fire-and-forget admin check, finally block, expiry handling, safety timeout |
| `src/pages/admin/PostForm.tsx` | Handle query error, gate on user, show error UI |

No DB / config changes needed.

