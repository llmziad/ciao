import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const setPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string(),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  });

// Strip control characters (incl. CR/LF) to prevent line/field injection downstream.
const stripControls = (v: string) => v.replace(/[\x00-\x1f\x7f]/g, "");

// Profile fields. Empty strings are coerced to undefined so optional fields clear cleanly.
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform(stripControls)
    .optional()
    .transform((v) => (v && v.length ? v : undefined));

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120).transform(stripControls),
  title: optionalText(120),
  phone: optionalText(40),
  address: optionalText(240),
  instagram: optionalText(200),
  twitter: optionalText(200),
  facebook: optionalText(200),
  linkedin: optionalText(200),
});

export const inviteUserSchema = z.object({
  email: emailSchema,
  name: z.string().trim().min(1, "Name is required.").max(120),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]),
});

export type ProfileInput = z.infer<typeof profileSchema>;
