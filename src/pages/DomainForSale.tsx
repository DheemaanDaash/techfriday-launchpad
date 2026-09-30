import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  ArrowDown,
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  Check,
  CircleCheck,
  Code2,
  Headphones,
  Layers3,
  Loader2,
  Mail,
  Mic2,
  Radio,
  Sparkles,
  Users,
} from "lucide-react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { domainOfferSchema, type DomainOfferValues } from "@/lib/domainOffer";

const audiences = [
  { label: "Technology communities", icon: Users },
  { label: "Developer events", icon: CalendarDays },
  { label: "Tech newsletters", icon: Mail },
  { label: "Podcasts and media", icon: Mic2 },
  { label: "Technology education", icon: BrainCircuit },
  { label: "AI communities", icon: Sparkles },
  { label: "Developer platforms", icon: Code2 },
  { label: "Technology conferences", icon: Radio },
  { label: "Startup brands", icon: Layers3 },
  { label: 'Recurring “Tech Friday” programs', icon: Headphones },
];

const benefits = [
  { number: "01", title: "Memorable", copy: "Short, clear and easy to remember." },
  { number: "02", title: "Exact Match", copy: "TechFriday + .TECH creates a highly relevant technology-focused domain." },
  { number: "03", title: "Brandable", copy: "Suitable for a company, event, community, media property or technology platform." },
  { number: "04", title: "Purpose-Built Extension", copy: "The .TECH extension immediately communicates technology." },
];

const concepts = [
  { title: "TechFriday Community", copy: "A central home for developers, designers and technology enthusiasts." },
  { title: "TechFriday Events", copy: "A dedicated destination for recurring technology events and meetups." },
  { title: "TechFriday Media", copy: "A home for technology articles, podcasts, videos and newsletters." },
  { title: "TechFriday Labs", copy: "A technology innovation, AI or developer experimentation platform." },
];

const faqs = [
  { q: "Is TechFriday.tech available?", a: "Yes. TechFriday.tech is currently available for acquisition." },
  { q: "How much is the domain?", a: "The asking price is $999 USD. Reasonable offers from serious buyers are welcome." },
  { q: "Can I make an offer?", a: "Yes. Use the inquiry form and include your proposed amount." },
  { q: "Who is this domain suitable for?", a: "Technology companies, communities, events, media platforms, newsletters, podcasts, educational programs, developer communities and other technology-focused projects." },
  { q: "Is the price negotiable?", a: "Reasonable offers may be considered." },
];

const fieldClass = "h-12 rounded-md border-domain-line bg-domain-surface text-domain-foreground placeholder:text-domain-muted/60 focus-visible:ring-domain-mint focus-visible:ring-offset-domain";

const scrollToOffer = () => document.getElementById("offer")?.scrollIntoView({ behavior: "smooth", block: "start" });

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
      <div className="flex min-h-[420px] flex-col items-center justify-center text-center" role="status">
        <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-domain-mint/35 bg-domain-mint/10 text-domain-mint">
          <CircleCheck className="h-7 w-7" aria-hidden="true" />
        </span>
        <h3 className="text-3xl font-semibold text-domain-foreground">Thanks — your inquiry has been received.</h3>
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
                {audiences.map(({ label }) => <SelectItem key={label} value={label}>{label}</SelectItem>)}
                <SelectItem value="Other technology project">Other technology project</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <FieldError message={errors.intendedUse?.message} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="message" className="text-domain-foreground">Message</Label>
        <Textarea id="message" rows={5} maxLength={2000} className={`${fieldClass} min-h-32 resize-y py-3`} {...register("message")} />
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
        <Button type="submit" size="lg" disabled={isSubmitting} className="h-13 w-full bg-domain-mint text-domain-mint-foreground hover:bg-domain-mint/90 sm:w-auto sm:min-w-48">
          {isSubmitting ? <><Loader2 className="animate-spin" /> Submitting…</> : <>Submit Offer <ArrowRight /></>}
        </Button>
      </div>
    </form>
  );
}

export default function DomainForSale() {
  return (
    <div className="min-h-screen overflow-hidden bg-domain text-domain-foreground selection:bg-domain-mint/25">
      <div className="pointer-events-none fixed inset-0 domain-glow" aria-hidden="true" />
      <div className="pointer-events-none fixed inset-0 domain-grid opacity-50" aria-hidden="true" />

      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <a href="#top" className="font-display text-base font-semibold text-domain-foreground">TechFriday<span className="text-domain-mint">.tech</span></a>
        <Button onClick={scrollToOffer} variant="outline" size="sm" className="border-domain-line bg-domain-surface/60 text-domain-foreground hover:bg-domain-elevated hover:text-domain-foreground">
          Make an Offer
        </Button>
      </header>

      <main id="top" className="relative z-10">
        <section className="mx-auto flex min-h-[calc(100svh-88px)] max-w-6xl flex-col items-center justify-center px-5 pb-16 pt-10 text-center sm:px-8 lg:px-12">
          <p className="animate-domain-rise text-xs font-semibold uppercase tracking-[0.2em] text-domain-mint">Premium .TECH Domain</p>
          <div className="mt-7 animate-domain-rise [animation-delay:100ms]">
            <span className="inline-flex items-center gap-2 rounded-full border border-domain-mint/25 bg-domain-mint/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-domain-mint">
              <span className="h-1.5 w-1.5 animate-status-pulse rounded-full bg-domain-mint" aria-hidden="true" />
              Available for acquisition
            </span>
          </div>
          <h1 className="mt-9 max-w-full animate-domain-rise font-display text-[clamp(2.4rem,9vw,7.5rem)] font-semibold leading-[0.9] tracking-normal text-domain-foreground [animation-delay:180ms]">
            TECHFRIDAY<span className="text-domain-mint">.TECH</span>
          </h1>
          <p className="mt-8 max-w-2xl animate-domain-rise text-lg leading-relaxed text-domain-muted sm:text-xl [animation-delay:260ms]">
            The domain for your next technology brand, community, event, or media platform.
          </p>
          <div className="mt-9 flex w-full max-w-md animate-domain-rise flex-col gap-3 sm:flex-row sm:justify-center [animation-delay:340ms]">
            <Button onClick={scrollToOffer} size="lg" className="h-12 flex-1 bg-domain-mint text-domain-mint-foreground shadow-domain hover:bg-domain-mint/90">Make an Offer <ArrowRight /></Button>
            <Button asChild size="lg" variant="outline" className="h-12 flex-1 border-domain-line bg-domain-surface/60 text-domain-foreground hover:bg-domain-elevated hover:text-domain-foreground">
              <a href="#value">Why This Domain? <ArrowDown /></a>
            </Button>
          </div>
          <p className="mt-9 max-w-xl animate-domain-rise text-sm text-domain-muted [animation-delay:420ms]">
            Exact-match TechFriday name + technology-focused .TECH extension.
          </p>
          <div className="mt-auto pt-16 text-[10px] font-medium uppercase tracking-[0.18em] text-domain-muted/70">Scroll to explore</div>
        </section>

        <section id="value" className="border-y border-domain-line bg-domain-surface/65 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-domain-blue">Built for technology</p>
              <h2 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">A domain built around the TechFriday name.</h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-domain-muted">A clear, versatile identity for people building technology-focused brands, programs, and platforms.</p>
            </div>
            <div className="mt-14 grid gap-px overflow-hidden rounded-md border border-domain-line bg-domain-line sm:grid-cols-2 lg:grid-cols-5">
              {audiences.map(({ label, icon: Icon }) => (
                <div key={label} className="flex min-h-32 flex-col justify-between bg-domain-surface p-5 transition-colors hover:bg-domain-elevated">
                  <Icon className="h-5 w-5 text-domain-mint" aria-hidden="true" />
                  <p className="mt-8 text-sm font-medium leading-snug">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-domain-mint">Why TechFriday.tech</p>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {benefits.map((benefit) => (
                <article key={benefit.title} className="group min-h-56 rounded-md border border-domain-line bg-domain-surface/75 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-domain-mint/35 hover:bg-domain-elevated sm:p-9">
                  <div className="flex items-center justify-between"><span className="font-mono text-xs text-domain-muted">{benefit.number}</span><Check className="h-4 w-4 text-domain-mint" aria-hidden="true" /></div>
                  <h3 className="mt-12 text-2xl font-semibold">{benefit.title}</h3>
                  <p className="mt-3 max-w-md leading-relaxed text-domain-muted">{benefit.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-domain-line bg-domain-surface/65 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-domain-blue">Concept examples</p><h2 className="mt-5 text-4xl font-semibold sm:text-5xl">Imagine what you could build here.</h2></div>
              <p className="max-w-sm text-sm leading-relaxed text-domain-muted">These are illustrative concepts only, not existing products or claims of current use.</p>
            </div>
            <div className="mt-14 divide-y divide-domain-line border-y border-domain-line">
              {concepts.map((concept, index) => (
                <article key={concept.title} className="grid gap-3 py-8 md:grid-cols-[80px_1fr_1fr] md:items-center">
                  <span className="font-mono text-xs text-domain-muted">0{index + 1}</span>
                  <h3 className="text-xl font-semibold">{concept.title}</h3>
                  <p className="leading-relaxed text-domain-muted">{concept.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 text-center sm:py-32">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-domain-mint">Acquisition</p>
            <h2 className="mt-5 text-4xl font-semibold sm:text-6xl">Interested in TechFriday.tech?</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-domain-muted">Whether you’re already building around the TechFriday name or looking for a memorable technology-focused domain, TechFriday.tech is available for acquisition.</p>
            <div className="mx-auto mt-12 max-w-xl border-y border-domain-line py-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-domain-muted">Asking Price</p>
              <p className="mt-3 text-6xl font-semibold text-domain-foreground sm:text-7xl">$999 <span className="text-xl text-domain-muted">USD</span></p>
              <p className="mt-4 text-domain-muted">Reasonable offers from serious buyers are welcome.</p>
            </div>
            <Button onClick={scrollToOffer} size="lg" className="mt-10 h-12 bg-domain-mint px-8 text-domain-mint-foreground hover:bg-domain-mint/90">Make an Offer <ArrowRight /></Button>
          </div>
        </section>

        <section id="offer" className="scroll-mt-4 border-y border-domain-line bg-domain-surface/75 py-24 sm:py-32">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-domain-blue">Private inquiry</p>
              <h2 className="mt-5 text-4xl font-semibold sm:text-5xl">Make an Offer</h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-domain-muted">Tell us a little about yourself and your interest in TechFriday.tech.</p>
              <div className="mt-10 space-y-4 text-sm text-domain-muted">
                <p className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-domain-mint" /> Inquiries are reviewed privately.</p>
                <p className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-domain-mint" /> Submitting does not create a binding agreement.</p>
              </div>
            </div>
            <div className="rounded-md border border-domain-line bg-domain p-6 shadow-domain sm:p-9"><DomainOfferForm /></div>
          </div>
        </section>

        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-domain-mint">FAQ</p>
            <h2 className="mt-5 text-4xl font-semibold sm:text-5xl">Acquisition questions.</h2>
            <Accordion type="single" collapsible className="mt-12 border-t border-domain-line">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.q} value={`faq-${index}`} className="border-domain-line">
                  <AccordionTrigger className="py-6 text-left text-base text-domain-foreground hover:text-domain-mint hover:no-underline">{faq.q}</AccordionTrigger>
                  <AccordionContent className="max-w-2xl pb-6 leading-relaxed text-domain-muted">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="border-y border-domain-line bg-domain-surface/75 py-24 text-center sm:py-32">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <p className="break-words text-[clamp(2.2rem,8vw,6.5rem)] font-semibold leading-none tracking-normal">TECHFRIDAY<span className="text-domain-mint">.TECH</span></p>
            <p className="mt-7 text-xl text-domain-muted">Own the name. Build the next TechFriday.</p>
            <Button onClick={scrollToOffer} size="lg" className="mt-9 h-12 bg-domain-mint px-8 text-domain-mint-foreground hover:bg-domain-mint/90">Make an Offer <ArrowRight /></Button>
          </div>
        </section>
      </main>

      <footer className="relative z-10 mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-8 border-b border-domain-line pb-10 md:flex-row md:items-end md:justify-between">
          <div><p className="font-display text-xl font-semibold">TechFriday<span className="text-domain-mint">.tech</span></p><p className="mt-2 text-sm text-domain-muted">Premium technology domain available for acquisition.</p></div>
          <nav aria-label="Footer" className="flex flex-wrap gap-6 text-sm text-domain-muted"><a href="#offer" className="hover:text-domain-mint">Contact</a><a href="#privacy" className="hover:text-domain-mint">Privacy</a><a href="#terms" className="hover:text-domain-mint">Terms</a></nav>
        </div>
        <div className="grid gap-6 py-8 text-xs leading-relaxed text-domain-muted/75 md:grid-cols-2">
          <p id="privacy"><strong className="text-domain-muted">Privacy:</strong> Inquiry details are used only to evaluate and respond to your domain acquisition request.</p>
          <p id="terms"><strong className="text-domain-muted">Terms:</strong> Submitting an inquiry is non-binding. Any acquisition is subject to a separate written agreement.</p>
        </div>
        <p className="border-t border-domain-line pt-7 text-xs text-domain-muted/60">© {new Date().getFullYear()} TechFriday.tech</p>
      </footer>
    </div>
  );
}
