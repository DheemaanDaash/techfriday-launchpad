import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";
const SOURCE_URL = "https://techcrunch.com";
const MAX_ARTICLES = 5;

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function firecrawlScrape(url: string, formats: any[]) {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY not configured");
  const res = await fetch(`${FIRECRAWL_V2}/scrape`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, formats, onlyMainContent: true }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Firecrawl ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
  return data;
}

async function rewriteWithAI(rawMarkdown: string, sourceTitle: string) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You rewrite news articles in your own words. CRITICAL: preserve every direct quotation (text inside double quotes) verbatim — do not paraphrase quotes. Output clean, well-structured HTML for the content (use <p>, <h2>, <ul>, <blockquote>). Do not include the title in the content body.",
        },
        {
          role: "user",
          content: `Source title: ${sourceTitle}\n\nSource article (markdown):\n\n${rawMarkdown.slice(0, 12000)}`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "publish_article",
            description: "Return the rewritten article",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "Concise, original headline (max 110 chars)" },
                excerpt: { type: "string", description: "1-2 sentence summary, max 200 chars" },
                content: { type: "string", description: "Full rewritten article body as HTML" },
              },
              required: ["title", "excerpt", "content"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "publish_article" } },
    }),
  });

  if (res.status === 429) throw new Error("AI rate limit reached. Try again later.");
  if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace → Usage.");
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI gateway ${res.status}: ${t.slice(0, 300)}`);
  }
  const data = await res.json();
  const call = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!call) throw new Error("AI returned no tool call");
  return JSON.parse(call.function.arguments);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await userClient.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Ensure "News" category exists
    let { data: newsCat } = await admin
      .from("categories")
      .select("id")
      .eq("slug", "news")
      .maybeSingle();
    if (!newsCat) {
      const { data: created, error: ccErr } = await admin
        .from("categories")
        .insert({ name: "News", slug: "news" })
        .select("id")
        .single();
      if (ccErr) throw ccErr;
      newsCat = created;
    }

    // Step 1: scrape source homepage to get article links
    console.log("Scraping source homepage...");
    const homepage = await firecrawlScrape(SOURCE_URL, ["links"]);
    const allLinks: string[] = homepage.data?.links ?? homepage.links ?? [];

    // Filter to article URLs (techcrunch.com/YYYY/MM/DD/slug/)
    const articlePattern = /^https?:\/\/(www\.)?techcrunch\.com\/\d{4}\/\d{2}\/\d{2}\/[^\/]+\/?$/;
    const articleLinks = Array.from(new Set(allLinks.filter((l) => articlePattern.test(l)))).slice(0, MAX_ARTICLES);

    if (articleLinks.length === 0) {
      return new Response(
        JSON.stringify({ imported: 0, message: "No new articles found." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let imported = 0;
    const errors: string[] = [];

    for (const articleUrl of articleLinks) {
      try {
        // Step 2: scrape full article
        const scraped = await firecrawlScrape(articleUrl, ["markdown"]);
        const doc = scraped.data ?? scraped;
        const markdown: string = doc.markdown ?? "";
        const meta = doc.metadata ?? {};
        const sourceTitle: string = meta.title ?? meta.ogTitle ?? "Untitled";
        const featuredImage: string | null = meta.ogImage ?? meta["og:image"] ?? null;

        if (!markdown || markdown.length < 200) {
          errors.push(`Skipped (too short): ${articleUrl}`);
          continue;
        }

        // Step 3: rewrite with AI
        const rewritten = await rewriteWithAI(markdown, sourceTitle);

        // Step 4: insert as draft, ensure unique slug
        let slug = slugify(rewritten.title);
        if (!slug) slug = `post-${Date.now()}`;
        const { data: existing } = await admin.from("posts").select("id").eq("slug", slug).maybeSingle();
        if (existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

        const { error: insErr } = await admin.from("posts").insert({
          title: rewritten.title,
          slug,
          excerpt: rewritten.excerpt,
          content: rewritten.content,
          featured_image: featuredImage,
          category_id: newsCat!.id,
          status: "draft",
        });
        if (insErr) {
          errors.push(`Insert failed for ${articleUrl}: ${insErr.message}`);
          continue;
        }
        imported++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`Failed ${articleUrl}:`, msg);
        errors.push(`${articleUrl}: ${msg}`);
      }
    }

    return new Response(
      JSON.stringify({ imported, attempted: articleLinks.length, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("import-posts error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
