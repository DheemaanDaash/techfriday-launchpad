import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ArrowRight, CircleCheck, Loader2 } from "lucide-react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { domainOfferSchema, type DomainOfferValues } from "@/lib/domainOffer";

const audiences = [
  "Technology communities",
  "Developer events",
  "Tech newsletters",
  "Podcasts and media",
  "Technology education",
  "AI communities",
  "Developer platforms",
  "Technology conferences",
  "Startup brands",
  "Recurring “Tech Friday” programs",
];

const fieldClass = "h-12 rounded-md border-domain-line bg-domain-surface text-domain-foreground placeholder:text-domain-muted/60 focus-visible:ring-domain-mint focus-visible:ring-offset-domain";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-sm text-domain-danger" role="alert">{message}</p>;
}

function DomainOfferForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<DomainOfferValues>({
    resolver: zodResolver(domainOfferSchema),
    defaultValues: { name: "", company: "", email: "", website: "", offerAmount: 999, intendedUse: "", message: "", acknowledgment: false, websiteCheck: "" },
  });

  const onSubmit = async (values: DomainOfferValues) => {
    setServerError("");
    const { data, error } = await supabase.functions.invoke("submit-domain-offer", { body: values });
    if (error) {
      let message = "We couldn’t submit your inquiry. Please try again shortly.";
      if (error instanceof FunctionsHttpError) {
        try {
          const details = await error.context.json();
          if (typeof details?.error === "string") message = details.error;
        } catch {
          // Keep the safe fallback message.
        }
      }
      setServerError(message);
      return;
    }
    if (!data?.success) {
      setServerError("We couldn’t submit your inquiry. Please try again shortly.");
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex min-h-[380px] flex-col items-center justify-center text-center" role="status">
        <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-domain-mint/35 bg-domain-mint/10 text-domain-mint">
          <CircleCheck className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="text-2xl font-semibold text-domain-foreground">Thanks — your inquiry has been received.</h2>
        <p className="mt-3 text-domain-muted">We’ll get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 sm:grid-cols-2" noValidate>
      <div>
        <Label htmlFor="name" className="text-domain-foreground">Name <span aria-hidden="true">*</span></Label>
        <Input id="name" autoComplete="name" maxLength={100} className={fieldClass} {...register("name")} aria-invalid={Boolean(errors.name)} />
        <FieldError message={errors.name?.message} />
      </div>
      <div>
        <Label htmlFor="company" className="text-domain-foreground">Company</Label>
        <Input id="company" autoComplete="organization" maxLength={120} className={fieldClass} {...register("company")} />
        <FieldError message={errors.company?.message} />
      </div>
      <div>
        <Label htmlFor="email" className="text-domain-foreground">Work Email <span aria-hidden="true">*</span></Label>
        <Input id="email" type="email" autoComplete="email" maxLength={254} className={fieldClass} {...register("email")} aria-invalid={Boolean(errors.email)} />
        <FieldError message={errors.email?.message} />
      </div>
      <div>
        <Label htmlFor="website" className="text-domain-foreground">Current Website</Label>
        <Input id="website" type="url" inputMode="url" placeholder="https://" autoComplete="url" maxLength={500} className={fieldClass} {...register("website")} aria-invalid={Boolean(errors.website)} />
        <FieldError message={errors.website?.message} />
      </div>
      <div>
        <Label htmlFor="offerAmount" className="text-domain-foreground">Offer Amount (USD) <span aria-hidden="true">*</span></Label>
        <Input id="offerAmount" type="number" inputMode="numeric" min={100} max={100000000} step={1} className={fieldClass} {...register("offerAmount")} aria-invalid={Boolean(errors.offerAmount)} />
        <FieldError message={errors.offerAmount?.message} />
      </div>
      <div>
        <Label htmlFor="intendedUse" className="text-domain-foreground">Intended Use <span aria-hidden="true">*</span></Label>
        <Controller
          control={control}
          name="intendedUse"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="intendedUse" className={fieldClass} aria-invalid={Boolean(errors.intendedUse)}>
                <SelectValue placeholder="Select a use" />
              </SelectTrigger>
              <SelectContent>
                {audiences.map((label) => <SelectItem key={label} value={label}>{label}</SelectItem>)}
                <SelectItem value="Other technology project">Other technology project</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <FieldError message={errors.intendedUse?.message} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="message" className="text-domain-foreground">Message</Label>
        <Textarea id="message" rows={4} maxLength={2000} className={`${fieldClass} min-h-28 resize-y py-3`} {...register("message")} />
        <FieldError message={errors.message?.message} />
      </div>
      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <Label htmlFor="websiteCheck">Leave this field empty</Label>
        <Input id="websiteCheck" tabIndex={-1} autoComplete="off" {...register("websiteCheck")} />
      </div>
      <div className="sm:col-span-2">
        <Controller
          control={control}
          name="acknowledgment"
          render={({ field }) => (
            <div className="flex items-start gap-3">
              <Checkbox id="acknowledgment" checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} className="mt-0.5 border-domain-muted data-[state=checked]:border-domain-mint data-[state=checked]:bg-domain-mint data-[state=checked]:text-domain-mint-foreground" />
              <Label htmlFor="acknowledgment" className="font-normal leading-relaxed text-domain-muted">
                I understand this form is an inquiry about acquiring the TechFriday.tech domain.
              </Label>
            </div>
          )}
        />
        <FieldError message={errors.acknowledgment?.message} />
      </div>
      {serverError && <p className="sm:col-span-2 rounded-md border border-domain-danger/30 bg-domain-danger/10 p-3 text-sm text-domain-danger" role="alert">{serverError}</p>}
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" disabled={isSubmitting} className="h-13 w-full bg-domain-mint text-domain-mint-foreground hover:bg-domain-mint/90">
          {isSubmitting ? <><Loader2 className="animate-spin" /> Submitting…</> : <>Submit Offer <ArrowRight /></>}
        </Button>
      </div>
    </form>
  );
}

export default function DomainForSale() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-domain text-domain-foreground selection:bg-domain-mint/25">
      <div className="pointer-events-none fixed inset-0 domain-glow" aria-hidden="true" />
      <div className="pointer-events-none fixed inset-0 domain-grid opacity-50" aria-hidden="true" />

      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <a href="#top" className="font-display text-base font-semibold text-domain-foreground">TechFriday<span className="text-domain-mint">.tech</span></a>
        <span className="inline-flex items-center gap-2 rounded-full border border-domain-mint/25 bg-domain-mint/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-domain-mint">
          <span className="h-1.5 w-1.5 animate-status-pulse rounded-full bg-domain-mint" aria-hidden="true" />
          Available for acquisition
        </span>
      </header>

      <main id="top" className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:px-12 lg:py-16">
        <div className="text-center lg:text-left">
          <p className="animate-domain-rise text-xs font-semibold uppercase tracking-[0.2em] text-domain-mint">Premium .TECH Domain</p>
          <h1 className="mt-6 animate-domain-rise font-display text-[clamp(2.2rem,7.5vw,5.5rem)] font-semibold leading-[0.95] tracking-normal text-domain-foreground [animation-delay:100ms]">
            TECHFRIDAY<span className="text-domain-mint">.TECH</span>
          </h1>
          <p className="mx-auto mt-7 max-w-xl animate-domain-rise text-lg leading-relaxed text-domain-muted sm:text-xl lg:mx-0 [animation-delay:180ms]">
            The domain for your next technology brand, community, event, or media platform.
          </p>
          <p className="mt-6 animate-domain-rise text-sm text-domain-muted [animation-delay:260ms]">
            Exact-match TechFriday name + technology-focused .TECH extension.
          </p>
          <div className="mt-10 inline-flex animate-domain-rise flex-wrap items-baseline justify-center gap-x-4 gap-y-2 border-t border-domain-line pt-6 lg:justify-start [animation-delay:340ms]">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-domain-muted">Asking price</span>
            <span className="text-3xl font-semibold text-domain-foreground">$999 <span className="text-base font-normal text-domain-muted">USD</span></span>
            <span className="text-sm text-domain-muted">Reasonable offers from serious buyers are welcome.</span>
          </div>
        </div>

        <section id="offer" className="scroll-mt-6 animate-domain-rise [animation-delay:200ms]" aria-labelledby="offer-heading">
          <div className="rounded-lg border border-domain-line bg-domain-surface/75 p-6 shadow-domain sm:p-8">
            <h2 id="offer-heading" className="text-2xl font-semibold text-domain-foreground">Make an Offer</h2>
            <p className="mt-2 text-sm leading-relaxed text-domain-muted">Tell us a little about yourself and your interest in TechFriday.tech.</p>
            <div className="mt-7 border-t border-domain-line pt-7">
              <DomainOfferForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-8 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-4 border-t border-domain-line pt-6 text-xs text-domain-muted/75 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} TechFriday.tech — Premium technology domain available for acquisition.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span id="privacy">Inquiry details are used only to evaluate your request.</span>
            <span id="terms">Submitting an inquiry is non-binding.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
