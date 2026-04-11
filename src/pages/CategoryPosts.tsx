import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, User, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

const POSTS_PER_PAGE = 9;

const CategoryPosts = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const { data: category } = useQuery({
    queryKey: ["category-by-slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: postsResult, isLoading } = useQuery({
    queryKey: ["category-posts", category?.id, currentPage],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("posts")
        .select("*, categories(name, slug)", { count: "exact" })
        .eq("status", "published")
        .eq("category_id", category!.id)
        .order("published_at", { ascending: false })
        .range((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE - 1);
      if (error) throw error;
      return { posts: data ?? [], total: count ?? 0 };
    },
    enabled: !!category?.id,
  });

  const posts = postsResult?.posts ?? [];
  const totalPages = Math.ceil((postsResult?.total ?? 0) / POSTS_PER_PAGE);

  const setPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    setSearchParams(params);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <Link to="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Blog
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          {category?.name ?? "Category"}
        </h1>
        <p className="text-muted-foreground">
          All posts in {category?.name ?? "this category"}.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No posts found in this category.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`}>
              <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow group">
                {post.featured_image ? (
                  <div className="aspect-video overflow-hidden">
                    <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">No image</span>
                  </div>
                )}
                <CardContent className="p-4 space-y-2">
                  <Badge variant="secondary" className="text-xs">{(post.categories as any)?.name}</Badge>
                  <h2 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h2>
                  {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                    {post.author && <span className="flex items-center gap-1"><User className="h-3 w-3" />{post.author}</span>}
                    {post.published_at && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(post.published_at), "MMM d, yyyy")}</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button key={page} variant={page === currentPage ? "default" : "ghost"} size="sm" className="w-9" onClick={() => setPage(page)}>{page}</Button>
            ))}
          </div>
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default CategoryPosts;
