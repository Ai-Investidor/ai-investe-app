<script setup>
import { RouterLink } from "vue-router";
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
import { emailSchema } from "@utils/validators.js";

import logoInvestLockup from "@assets/icons/login/logo-invest-lockup.svg";

const { resetPassword, isResettingPassword } = useAuth();

const recoverSchema = z.object({
    email: emailSchema,
});

const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(recoverSchema),
});

const onSubmit = handleSubmit(async (values) => {
    const data = await resetPassword({ email: values.email });
    if (!data) return;

    toast.success("Link de recuperação enviado! Verifique seu e-mail.");
});
</script>

<template>
    <section
        class="absolute w-[461px] left-[var(--auth-form-center-x)] top-1/2 -translate-x-1/2 -translate-y-1/2 max-lg:static max-lg:w-full max-lg:max-w-[461px] max-lg:translate-x-0 max-lg:translate-y-0"
        aria-labelledby="recover-form-heading"
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
                    id="recover-form-heading"
                    class="text-auth-heading text-white/55"
                >
                    Recuperar senha
                </h2>
                <p class="text-auth-link text-input-bg max-w-[320px]">
                    Digite seu e-mail e enviaremos um link para redefinir sua
                    senha.
                </p>
            </div>

            <form
                @submit.prevent="onSubmit"
                class="flex flex-col gap-section-gap w-full"
            >
                <FormField v-slot="{ componentField }" name="email">
                    <FormItem class="space-y-2">
                        <FormLabel class="sr-only"> E-mail </FormLabel>
                        <FormControl>
                            <Input
                                type="email"
                                placeholder="Digite seu e-mail"
                                autocomplete="email"
                                class="rounded-full h-[42px] px-[13px] border-input-outline"
                                v-bind="componentField"
                            />
                        </FormControl>
                        <FormMessage class="text-xs" />
                    </FormItem>
                </FormField>

                <Button
                    type="submit"
                    :disabled="isResettingPassword"
                    class="w-full h-[40px] rounded-full bg-white px-[7px] text-auth-cta text-on-light hover:bg-white/90"
                >
                    {{ isResettingPassword ? "Enviando..." : "Enviar link" }}
                </Button>

                <div class="text-center">
                    <span class="text-auth-link text-input-bg">
                        Lembrou sua senha?
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
