

## Root Cause

**TipTap editor initializes once and ignores prop updates.**

In `RichTextEditor.tsx`, `useEditor({ content })` only uses `content` on first mount. When `PostForm` later loads the post and calls `setContent(post.content)`, the prop updates but TipTap's internal document doesn't sync.

Evidence:
- Preview dialog uses `dangerouslySetInnerHTML={{ __html: content }}` → reads state directly → **works** ✅
- Editor body uses TipTap's internal doc → never updated after mount → **shows empty** ❌

This is a well-known TipTap gotcha.

## Fix

**`src/components/admin/RichTextEditor.tsx`** — sync external content into the editor when it changes:

```tsx
useEffect(() => {
  if (!editor) return;
  // Avoid resetting while user is typing
  if (editor.getHTML() === content) return;
  editor.commands.setContent(content || "", false); // false = don't emit update
}, [content, editor]);
```

Place it right after `useEditor(...)`. The `getHTML() === content` guard prevents cursor jumps during normal typing (since `onUpdate` already calls `onChange`, the prop will match what the editor has).

### File to Edit

| File | Change |
|------|--------|
| `src/components/admin/RichTextEditor.tsx` | Add `useEffect` to sync `content` prop → editor via `editor.commands.setContent()` |

No other changes needed. PostForm fetch logic is already correct (proves it: preview shows the content).

