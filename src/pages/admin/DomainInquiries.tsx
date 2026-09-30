import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ExternalLink, Inbox, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type InquiryStatus = Database["public"]["Enums"]["domain_inquiry_status"];

const statusLabel: Record<InquiryStatus, string> = { new: "New", contacted: "Contacted", closed: "Closed" };

export default function DomainInquiries() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: inquiries = [], isLoading, error } = useQuery({
    queryKey: ["domain-inquiries"],
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from("domain_inquiries")
        .select("id, name, company, email, website, offer_amount, intended_use, message, status, created_at")
        .order("created_at", { ascending: false });
      if (queryError) throw queryError;
      return data ?? [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: InquiryStatus }) => {
      const { error: updateError } = await supabase.from("domain_inquiries").update({ status }).eq("id", id);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domain-inquiries"] });
      toast({ title: "Inquiry status updated" });
    },
    onError: () => toast({ title: "Couldn’t update the inquiry", variant: "destructive" }),
  });

  return (
    <div>
      <div className="mb-7 flex items-end justify-between gap-4">
        <div><h1 className="text-3xl font-bold">Domain Inquiries</h1><p className="mt-1 text-muted-foreground">Offers submitted for TechFriday.tech.</p></div>
        <Badge variant="secondary">{inquiries.length} total</Badge>
      </div>
      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading inquiries…</div>
      ) : error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-destructive">Couldn’t load domain inquiries.</div>
      ) : inquiries.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-md border border-dashed text-center"><Inbox className="h-8 w-8 text-muted-foreground" /><h2 className="mt-4 font-semibold">No inquiries yet</h2><p className="mt-1 text-sm text-muted-foreground">New domain offers will appear here.</p></div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <article key={inquiry.id} className="rounded-md border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold">{inquiry.name}</h2>{inquiry.company && <span className="text-sm text-muted-foreground">at {inquiry.company}</span>}</div>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                    <a href={`mailto:${inquiry.email}`} className="inline-flex items-center gap-1.5 text-primary hover:underline"><Mail className="h-4 w-4" />{inquiry.email}</a>
                    {inquiry.website && <a href={inquiry.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline"><ExternalLink className="h-4 w-4" />Website</a>}
                    <span className="text-muted-foreground">{format(new Date(inquiry.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="whitespace-nowrap text-xl font-bold">${inquiry.offer_amount.toLocaleString()} USD</p>
                  <Select value={inquiry.status} onValueChange={(value: InquiryStatus) => updateStatus.mutate({ id: inquiry.id, status: value })} disabled={updateStatus.isPending}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(statusLabel).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-5 grid gap-4 border-t pt-5 md:grid-cols-[220px_1fr]">
                <div><p className="text-xs font-semibold uppercase text-muted-foreground">Intended use</p><p className="mt-1 text-sm">{inquiry.intended_use}</p></div>
                <div><p className="text-xs font-semibold uppercase text-muted-foreground">Message</p><p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{inquiry.message || "No message provided."}</p></div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
