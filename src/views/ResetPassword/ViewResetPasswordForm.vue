<script setup>
import { RouterLink, useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { z } from "zod";

import { Button } from "@components/button";
import { Input } from "@components/input";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@components/form";
import { useAuth } from "@composables/useAuth.js";
import { passwordSchema } from "@utils/validators.js";

import logoInvestLockup from "@assets/icons/login/logo-invest-lockup.svg";

const router = useRouter();
const { updatePassword, isUpdatingPassword, signOut } = useAuth();

const resetPasswordSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z
            .string({ required_error: "Confirme sua senha" })
            .min(1, "Confirme sua senha"),
    })
    .refine((values) => values.password === values.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    });

const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(resetPasswordSchema),
});

const onSubmit = handleSubmit(async (values) => {
    const data = await updatePassword({ password: values.password });
    if (!data) return;

    await signOut();
    toast.success("Senha atualizada com sucesso! Faça login com sua nova senha.");
    router.push({ name: "login" });
});
</script>

<template>
    <section
        class="absolute w-[461px] left-[var(--auth-form-center-x)] top-1/2 -translate-x-1/2 -translate-y-1/2 max-lg:static max-lg:w-full max-lg:max-w-[461px] max-lg:translate-x-0 max-lg:translate-y-0"
        aria-labelledby="reset-password-form-heading"
    >
        <div
            class="rounded-md border px-item-gap py-[91px] bg-gradient-to-r from-black to-surface-2 border-card-border flex flex-col items-center justify-center gap-6 shadow-login-card max-lg:py-10 max-lg:px-5"
        >
            <div class="flex justify-center">
                <img
                    :src="logoInvestLockup"
                    alt="Logo INVEST"
                    class="h-12 w-auto"
                />
            </div>

            <div class="flex flex-col gap-2 items-center text-center">
                <h2
                    id="reset-password-form-heading"
                    class="text-auth-heading text-white/55"
                >
                    Criar nova senha
                </h2>
                <p class="text-auth-link text-input-bg max-w-[320px]">
                    Digite e confirme sua nova senha para acessar sua conta.
                </p>
            </div>

            <form
                @submit.prevent="onSubmit"
                class="flex flex-col gap-section-gap w-full"
            >
                <FormField v-slot="{ componentField }" name="password">
                    <FormItem class="space-y-2">
                        <FormLabel class="sr-only"> Nova senha </FormLabel>
                        <FormControl>
                            <Input
                                type="password"
                                placeholder="Digite sua nova senha"
                                autocomplete="new-password"
                                class="rounded-full h-[42px] px-[13px] border-input-outline"
                                v-bind="componentField"
                            />
                        </FormControl>
                        <FormMessage class="text-xs" />
                    </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="confirmPassword">
                    <FormItem class="space-y-2">
                        <FormLabel class="sr-only">
                            Repetir senha
                        </FormLabel>
                        <FormControl>
                            <Input
                                type="password"
                                placeholder="Confirme sua nova senha"
                                autocomplete="new-password"
                                class="rounded-full h-[42px] px-[13px] border-input-outline"
                                v-bind="componentField"
                            />
                        </FormControl>
                        <FormMessage class="text-xs" />
                    </FormItem>
                </FormField>

                <Button
                    type="submit"
                    :disabled="isUpdatingPassword"
                    class="w-full h-[40px] rounded-full bg-white px-[7px] text-auth-cta text-on-light hover:bg-white/90"
                >
                    {{ isUpdatingPassword ? "Salvando..." : "Salvar nova senha" }}
                </Button>

                <div class="text-center">
                    <span class="text-auth-link text-input-bg">
                        <RouterLink
                            to="/auth/login"
                            class="text-auth-button text-white underline"
                        >
                            Voltar ao login
                        </RouterLink>
                    </span>
                </div>
            </form>
        </div>
    </section>
</template>
