import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { format } from "date-fns";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["public-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, categories(name, slug)")
        .eq("slug", slug!)
        .eq("status", "published")
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: relatedPosts = [] } = useQuery({
    queryKey: ["related-posts", post?.category_id, post?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, slug, featured_image, published_at")
        .eq("status", "published")
        .eq("category_id", post!.category_id!)
        .neq("id", post!.id)
        .order("published_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!post?.category_id,
  });

  // SEO: Update document title, meta description, and OG tags
  useEffect(() => {
    if (!post) return;
    const originalTitle = document.title;
    document.title = `${post.title} — TechFriday`;

    const setMeta = (property: string, content: string, isOg = false) => {
      const selector = isOg ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let tag = document.querySelector(selector) as HTMLMetaElement | null;
      if (tag) {
        tag.setAttribute("data-orig", tag.content);
        tag.content = content;
      } else {
        tag = document.createElement("meta");
        if (isOg) tag.setAttribute("property", property);
        else tag.name = property;
        tag.content = content;
        tag.setAttribute("data-dynamic", "true");
        document.head.appendChild(tag);
      }
    };

    if (post.excerpt) setMeta("description", post.excerpt);
    setMeta("og:title", post.title, true);
    if (post.excerpt) setMeta("og:description", post.excerpt, true);
    if (post.featured_image) setMeta("og:image", post.featured_image, true);
    setMeta("og:type", "article", true);

    return () => {
      document.title = originalTitle;
      document.querySelectorAll("meta[data-dynamic]").forEach((el) => el.remove());
      document.querySelectorAll("meta[data-orig]").forEach((el) => {
        (el as HTMLMetaElement).content = el.getAttribute("data-orig") ?? "";
        el.removeAttribute("data-orig");
      });
    };
  }, [post]);

  const isVideoPost = (post?.categories as any)?.slug === "videos";
  const videoUrl = (post as any)?.video_url;

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch")) return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/")) return url.replace("youtu.be/", "www.youtube.com/embed/");
    return url;
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Post not found</h1>
        <p className="text-muted-foreground mb-4">The post you're looking for doesn't exist or has been removed.</p>
        <Link to="/blog">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt ?? "",
            image: post.featured_image ?? undefined,
            datePublished: post.published_at,
            dateModified: post.updated_at,
            author: post.author
              ? { "@type": "Person", name: post.author }
              : { "@type": "Organization", name: "TechFriday" },
            publisher: { "@type": "Organization", name: "TechFriday" },
          }),
        }}
      />

      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <Link to="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Blog
        </Link>

        {post.categories && (
          <Badge variant="secondary" className="mb-3">{(post.categories as any).name}</Badge>
        )}

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
          {post.author && <span className="flex items-center gap-1"><User className="h-4 w-4" /> {post.author}</span>}
          {post.published_at && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {format(new Date(post.published_at), "MMMM d, yyyy")}</span>}
        </div>

        {isVideoPost && videoUrl && (
          <div className="aspect-video rounded-lg overflow-hidden mb-8">
            <iframe src={getEmbedUrl(videoUrl)} className="w-full h-full" allowFullScreen title={post.title} />
          </div>
        )}

        {post.featured_image && (
          <div className="rounded-lg overflow-hidden mb-8">
            <img src={post.featured_image} alt={post.title} className="w-full h-auto object-cover" />
          </div>
        )}

        <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content ?? "" }} />
      </article>

      {relatedPosts.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
          <h2 className="text-xl font-semibold mb-4">Related Posts</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {relatedPosts.map((rp) => (
              <Link key={rp.id} to={`/blog/${rp.slug}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow group h-full">
                  {rp.featured_image ? (
                    <div className="aspect-video overflow-hidden">
                      <img src={rp.featured_image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted" />
                  )}
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">{rp.title}</h3>
                    {rp.published_at && <p className="text-xs text-muted-foreground mt-1">{format(new Date(rp.published_at), "MMM d, yyyy")}</p>}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
};

export default BlogPost;
