import { z } from "zod";

export const domainOfferSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100, "Name is too long"),
  email: z.string().trim().email("Enter a valid email").max(254, "Email is too long"),
  offerAmount: z.coerce
    .number({ invalid_type_error: "Enter an offer amount" })
    .int("Use a whole dollar amount")
    .min(100, "Offers must be at least $100")
    .max(100_000_000, "Offer amount is too high"),
  websiteCheck: z.string().max(0, "Submission rejected").optional(),
});

export type DomainOfferValues = z.infer<typeof domainOfferSchema>;
