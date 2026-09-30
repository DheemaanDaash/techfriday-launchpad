import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max, `Must be ${max} characters or fewer`).transform((value) => value || undefined).optional();

export const domainOfferSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100, "Name is too long"),
  company: optionalText(120),
  email: z.string().trim().email("Enter a valid work email").max(254, "Email is too long"),
  website: z
    .string()
    .trim()
    .max(500, "Website address is too long")
    .refine((value) => !value || /^https?:\/\//i.test(value), "Include https:// in the website address")
    .transform((value) => value || undefined),
  offerAmount: z.coerce
    .number({ invalid_type_error: "Enter an offer amount" })
    .int("Use a whole dollar amount")
    .min(100, "Offers must be at least $100")
    .max(100_000_000, "Offer amount is too high"),
  intendedUse: z.string().trim().min(2, "Tell us the intended use").max(120, "Intended use is too long"),
  message: optionalText(2000),
  acknowledgment: z.literal(true, { errorMap: () => ({ message: "Please confirm this is a domain acquisition inquiry" }) }),
  websiteCheck: z.string().max(0, "Submission rejected").optional(),
});

export type DomainOfferValues = z.infer<typeof domainOfferSchema>;
