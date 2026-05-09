import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Podaj nazwe wyswietlana.").max(80, "Nazwa jest za dluga."),
    email: z.string().trim().email("Podaj poprawny adres email.").max(160, "Email jest za dlugi."),
    password: z
      .string()
      .min(8, "Haslo musi miec co najmniej 8 znakow.")
      .max(72, "Haslo jest za dlugie."),
    confirmPassword: z.string().min(1, "Potwierdz haslo."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Hasla musza byc identyczne.",
  });

export const signInSchema = z.object({
  email: z.string().trim().email("Podaj poprawny adres email."),
  password: z.string().min(1, "Podaj haslo."),
});

export const createLinkSchema = z.object({
  url: z.string().trim().min(1, "Wklej adres URL.").max(2048, "Adres URL jest za dlugi."),
});

export const visitMetadataSchema = z.object({
  screen: z.string().trim().max(120).nullish(),
  orientation: z.string().trim().max(120).nullish(),
  language: z.string().trim().max(64).nullish(),
  timezone: z.string().trim().max(120).nullish(),
  userTime: z.string().trim().max(200).nullish(),
  platform: z.string().trim().max(120).nullish(),
  userAgent: z.string().trim().max(2048).nullish(),
  cores: z.number().int().min(0).max(128).nullish(),
  ram: z.number().min(0).max(1024).nullish(),
  cookies: z.boolean().nullish(),
  touchPoints: z.number().int().min(0).max(32).nullish(),
  webdriver: z.boolean().nullish(),
  plugins: z.string().trim().max(4000).nullish(),
  fonts: z.string().trim().max(4000).nullish(),
  gpu: z.string().trim().max(400).nullish(),
});

export type RegisterActionState = {
  status: "idle" | "error";
  message: string;
};

export const initialRegisterActionState: RegisterActionState = {
  status: "idle",
  message: "",
};

export type LinkActionState = {
  status: "idle" | "success" | "error";
  message: string;
  shortUrl?: string;
};

export const initialLinkActionState: LinkActionState = {
  status: "idle",
  message: "",
};

export function getValidationMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Formularz zawiera niepoprawne dane.";
}