import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type PostStatus = Database["public"]["Enums"]["post_status"];

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const PostForm = () => {
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [status, setStatus] = useState<PostStatus>("draft");
  const [author, setAuthor] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ["admin-post", id],
    queryFn: async () => {
      if (!isEdit) return null;
      const { data, error } = await supabase.from("posts").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setSlug(post.slug);
      setContent(post.content ?? "");
      setExcerpt(post.excerpt ?? "");
      setCategoryId(post.category_id ?? "");
      setStatus(post.status);
      setAuthor(post.author ?? "");
    }
  }, [post]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        title,
        slug,
        content,
        excerpt,
        category_id: categoryId || null,
        status,
        author: author || null,
        published_at: status === "published" ? new Date().toISOString() : null,
      };

      if (isEdit) {
        const { error } = await supabase.from("posts").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("posts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      qc.invalidateQueries({ queryKey: ["admin-post-count"] });
      qc.invalidateQueries({ queryKey: ["admin-published-count"] });
      qc.invalidateQueries({ queryKey: ["admin-draft-count"] });
      toast({ title: isEdit ? "Post updated" : "Post created" });
      navigate("/admin/posts");
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (isEdit && postLoading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="max-w-3xl">
      <Button variant="ghost" onClick={() => navigate("/admin/posts")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />Back to Posts
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Post" : "New Post"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => { setTitle(e.target.value); if (!isEdit) setSlug(slugify(e.target.value)); }} />
          </div>

          <div className="space-y-2">
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Author</Label>
            <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Excerpt</Label>
            <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} placeholder="Brief summary..." />
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} placeholder="Write your post content here..." className="font-mono text-sm" />
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={status === "published"} onCheckedChange={(v) => setStatus(v ? "published" : "draft")} />
            <Label>{status === "published" ? "Published" : "Draft"}</Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={() => save.mutate()} disabled={!title || !slug || save.isPending}>
              {save.isPending ? "Saving..." : isEdit ? "Update Post" : "Create Post"}
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/posts")}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostForm;
