import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, User, ArrowRight, Play } from "lucide-react";
import { format } from "date-fns";

const Home = () => {
  // Hero posts: 2 lead posts with images + 5 headlines (7 total)
  const { data: heroPosts = [], isLoading: heroLoading } = useQuery({
    queryKey: ["home-hero-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, slug, excerpt, featured_image, published_at, categories(name, slug)")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(7);
      if (error) throw error;
      return data;
    },
  });

  const leadPost = heroPosts[0];
  const secondaryPost = heroPosts[1];
  const headlines = heroPosts.slice(2, 7);

  // Latest video post
  const { data: latestVideo } = useQuery({
    queryKey: ["home-latest-video"],
    queryFn: async () => {
      const { data: videoCat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", "videos")
        .single();
      if (!videoCat) return null;
      const { data } = await supabase
        .from("posts")
        .select("*, categories(name, slug)")
        .eq("status", "published")
        .eq("category_id", videoCat.id)
        .order("published_at", { ascending: false })
        .limit(1)
        .single();
      return data;
    },
  });

  // Recent posts grid (skip the 7 already shown in hero)
  const { data: recentPosts = [], isLoading } = useQuery({
    queryKey: ["home-recent-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, categories(name, slug)")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range(7, 12);
      if (error) throw error;
      return data;
    },
  });

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("youtube.com/watch")) return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/")) return url.replace("youtu.be/", "www.youtube.com/embed/");
    return url;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {/* Hero Section — 2 columns */}
      <section className="grid gap-8 lg:grid-cols-5 mb-16">
        {/* Column 1 — Latest Video */}
        <div className="lg:col-span-3">
          {latestVideo ? (
            <div>
              <div className="aspect-video rounded-xl overflow-hidden bg-muted shadow-lg">
                {(latestVideo as any).video_url ? (
                  <iframe
                    src={getEmbedUrl((latestVideo as any).video_url)}
                    className="w-full h-full"
                    allowFullScreen
                    title={latestVideo.title}
                  />
                ) : latestVideo.featured_image ? (
                  <img src={latestVideo.featured_image} alt={latestVideo.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              <Link to={`/blog/${latestVideo.slug}`} className="block mt-3">
                <h2 className="text-xl font-bold hover:text-primary transition-colors line-clamp-2">
                  {latestVideo.title}
                </h2>
              </Link>
              {latestVideo.published_at && (
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(latestVideo.published_at), "MMM d, yyyy")}
                </p>
              )}
            </div>
          ) : (
            <div className="aspect-video rounded-xl bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">No video posts yet</p>
            </div>
          )}
        </div>

        {/* Column 2 — Top Headlines */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold uppercase tracking-wider text-primary mb-4 border-b border-primary pb-2">
            Top Headlines
          </h3>
          {headlines.length === 0 ? (
            <p className="text-muted-foreground text-sm">No posts yet.</p>
          ) : (
            <ul className="space-y-4">
              {headlines.map((post, i) => (
                <li key={post.id} className="flex gap-3 items-start group">
                  <span className="text-2xl font-bold text-primary/40 leading-none mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <Link to={`/blog/${post.slug}`} className="font-semibold leading-snug hover:text-primary transition-colors line-clamp-2 block">
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {post.categories && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {(post.categories as any).name}
                        </Badge>
                      )}
                      {post.published_at && (
                        <span>{format(new Date(post.published_at), "MMM d")}</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Recent Posts Grid */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Posts</h2>
          <Link to="/blog" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentPosts.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No published posts yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`}>
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow group">
                  {post.featured_image ? (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">No image</span>
                    </div>
                  )}
                  <CardContent className="p-4 space-y-2">
                    {post.categories && (
                      <Badge variant="secondary" className="text-xs">
                        {(post.categories as any).name}
                      </Badge>
                    )}
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                      {post.author && (
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{post.author}</span>
                      )}
                      {post.published_at && (
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(post.published_at), "MMM d, yyyy")}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Newsletter Subscription */}
      <section className="rounded-2xl bg-muted/50 border border-border p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold mb-2">Stay Updated</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Subscribe to our newsletter for the latest tech news delivered to your inbox.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const email = (form.elements.namedItem("email") as HTMLInputElement).value;
            if (email) {
              form.reset();
              alert("Thanks for subscribing!");
            }
          }}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Subscribe
          </button>
        </form>
      </section>
    </div>
  );
};

export default Home;
