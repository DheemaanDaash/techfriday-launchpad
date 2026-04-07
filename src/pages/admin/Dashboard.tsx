import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FolderOpen, Eye, FilePen } from "lucide-react";

const Dashboard = () => {
  const { data: postCount = 0 } = useQuery({
    queryKey: ["admin-post-count"],
    queryFn: async () => {
      const { count } = await supabase.from("posts").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: publishedCount = 0 } = useQuery({
    queryKey: ["admin-published-count"],
    queryFn: async () => {
      const { count } = await supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "published");
      return count ?? 0;
    },
  });

  const { data: draftCount = 0 } = useQuery({
    queryKey: ["admin-draft-count"],
    queryFn: async () => {
      const { count } = await supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "draft");
      return count ?? 0;
    },
  });

  const { data: categoryCount = 0 } = useQuery({
    queryKey: ["admin-category-count"],
    queryFn: async () => {
      const { count } = await supabase.from("categories").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const stats = [
    { title: "Total Posts", value: postCount, icon: FileText, color: "text-primary" },
    { title: "Published", value: publishedCount, icon: Eye, color: "text-green-500" },
    { title: "Drafts", value: draftCount, icon: FilePen, color: "text-yellow-500" },
    { title: "Categories", value: categoryCount, icon: FolderOpen, color: "text-accent" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
