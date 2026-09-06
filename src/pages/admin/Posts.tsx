import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Download, Loader2, X } from "lucide-react";
import { format } from "date-fns";

const POSTS_PER_PAGE = 20;

const Posts = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkAuthor, setBulkAuthor] = useState("");


  const { data: result, isLoading } = useQuery({
    queryKey: ["admin-posts", search, page],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select("*, categories(name)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE - 1);

      if (search.trim()) {
        query = query.ilike("title", `%${search.trim()}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { posts: data ?? [], total: count ?? 0 };
    },
  });

  const posts = result?.posts ?? [];
  const totalPages = Math.ceil((result?.total ?? 0) / POSTS_PER_PAGE);

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("id, name").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const allSelected = posts.length > 0 && selected.length === posts.length;
  const selectedCount = selected.length;

  const toggleAll = () => setSelected(allSelected ? [] : posts.map((p) => p.id));
  const toggleOne = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
    qc.invalidateQueries({ queryKey: ["admin-post-count"] });
    qc.invalidateQueries({ queryKey: ["admin-published-count"] });
    qc.invalidateQueries({ queryKey: ["admin-draft-count"] });
  };

  const bulkUpdate = useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      const { error } = await supabase.from("posts").update(patch).in("id", selected);
      if (error) throw error;
    },
    onSuccess: (_d, patch) => {
      invalidateAll();
      toast({ title: `Updated ${selectedCount} post${selectedCount === 1 ? "" : "s"}` });
      setSelected([]);
      setBulkCategory("");
      setBulkAuthor("");
      void patch;
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const setStatus = (status: "published" | "draft") =>
    bulkUpdate.mutate(
      status === "published"
        ? { status, published_at: new Date().toISOString() }
        : { status },
    );


  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      qc.invalidateQueries({ queryKey: ["admin-post-count"] });
      qc.invalidateQueries({ queryKey: ["admin-published-count"] });
      qc.invalidateQueries({ queryKey: ["admin-draft-count"] });
      toast({ title: "Post deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleImport = async () => {
    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("import-posts");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({
        title: "Import complete",
        description: `${data?.imported ?? 0} of ${data?.attempted ?? 0} posts imported as drafts.`,
      });
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      qc.invalidateQueries({ queryKey: ["admin-post-count"] });
      qc.invalidateQueries({ queryKey: ["admin-draft-count"] });
      setImportOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Import failed";
      toast({ title: "Import failed", description: msg, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <h1 className="text-3xl font-bold">Posts</h1>
        <div className="flex gap-2">
          <AlertDialog open={importOpen} onOpenChange={setImportOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline"><Download className="mr-2 h-4 w-4" />Import Posts</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Import latest posts?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will fetch the 5 most recent articles, rewrite them with AI (quotes preserved verbatim), and save them as drafts in the News category for review. May take 30–60 seconds.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={importing}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={(e) => { e.preventDefault(); handleImport(); }} disabled={importing}>
                  {importing ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Importing...</>) : "Start Import"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button asChild>
            <Link to="/admin/posts/new"><Plus className="mr-2 h-4 w-4" />New Post</Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search posts..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-9"
        />
      </div>

      {/* Bulk actions */}
      {selectedCount > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 p-3">
          <span className="text-sm font-medium">{selectedCount} selected</span>
          <Button size="sm" variant="outline" disabled={bulkUpdate.isPending} onClick={() => setStatus("published")}>
            Publish
          </Button>
          <Button size="sm" variant="outline" disabled={bulkUpdate.isPending} onClick={() => setStatus("draft")}>
            Unpublish
          </Button>
          <Select value={bulkCategory} onValueChange={(v) => { setBulkCategory(v); bulkUpdate.mutate({ category_id: v }); }}>
            <SelectTrigger className="h-9 w-[180px]"><SelectValue placeholder="Change category" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Input
              className="h-9 w-[180px]"
              placeholder="Set author"
              value={bulkAuthor}
              onChange={(e) => setBulkAuthor(e.target.value)}
            />
            <Button
              size="sm"
              variant="outline"
              disabled={!bulkAuthor.trim() || bulkUpdate.isPending}
              onClick={() => bulkUpdate.mutate({ author: bulkAuthor.trim() })}
            >
              Apply
            </Button>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
            <X className="mr-1 h-4 w-4" />Clear
          </Button>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="text-muted-foreground">{search ? "No posts match your search." : "No posts yet. Create your first post!"}</p>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all posts" />
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id} data-state={selected.includes(post.id) ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(post.id)}
                        onCheckedChange={() => toggleOne(post.id)}
                        aria-label={`Select ${post.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium max-w-[250px] truncate">{post.title}</TableCell>
                    <TableCell className="text-muted-foreground">{post.author ?? "—"}</TableCell>

                    <TableCell className="text-muted-foreground">{(post.categories as any)?.name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={post.status === "published" ? "default" : "secondary"}>
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(post.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/admin/posts/${post.id}`}><Pencil className="h-4 w-4" /></Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => remove.mutate(post.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({result?.total} posts)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Posts;
