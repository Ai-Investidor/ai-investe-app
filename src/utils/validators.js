import { z } from "zod";

export const fullNameSchema = z
  .string({ required_error: "Nome completo é obrigatório" })
  .trim()
  .min(1, "Nome completo é obrigatório");

export const emailSchema = z
  .string({ required_error: "E-mail é obrigatório" })
  .trim()
  .min(1, "E-mail é obrigatório")
  .email("E-mail inválido");

export const passwordSchema = z
  .string({ required_error: "Senha é obrigatória" })
  .min(1, "Senha é obrigatória")
  .min(6, "A senha deve ter no mínimo 6 caracteres");

export const phoneSchema = z
  .string({ required_error: "Telefone é obrigatório" })
  .trim()
  .min(1, "Telefone é obrigatório")
  .transform((value) => value.replace(/\D/g, ""))
  .refine((value) => value.length === 10 || value.length === 11, {
    message: "Telefone inválido",
  });
