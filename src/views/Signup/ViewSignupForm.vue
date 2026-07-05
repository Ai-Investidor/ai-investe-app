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
import {
    emailSchema,
    fullNameSchema,
    passwordSchema,
    phoneSchema,
} from "@utils/validators.js";

import logoInvestLockup from "@assets/icons/login/logo-invest-lockup.svg";
import googleG from "@assets/icons/login/google-g.svg";

const router = useRouter();
const { signUp, signInWithGoogle, isSigningIn, isSigningUp } = useAuth();

const signupSchema = z
    .object({
        fullName: fullNameSchema,
        email: emailSchema,
        phone: phoneSchema,
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
    validationSchema: toTypedSchema(signupSchema),
});

const onSubmit = handleSubmit(async (values) => {
    const data = await signUp({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        phone: values.phone,
    });

    if (!data) return;

    if (data.session) {
        router.push({ name: "chat" });
        return;
    }

    toast.success(
        "Conta criada! Verifique seu e-mail para confirmar o cadastro.",
    );
    router.push({ name: "login" });
});

const handleGoogleSignIn = () => {
    signInWithGoogle();
};
</script>

<template>
    <section
        class="absolute w-[461px] left-[var(--auth-form-center-x)] top-1/2 -translate-x-1/2 -translate-y-1/2 max-lg:static max-lg:w-full max-lg:max-w-[461px] max-lg:translate-x-0 max-lg:translate-y-0"
        aria-labelledby="signup-form-heading"
    >
        <div
            class="rounded-md border px-item-gap py-10 bg-gradient-to-r from-black to-surface-2 border-card-border flex flex-col items-center justify-center gap-6 shadow-login-card max-lg:py-10 max-lg:px-5"
        >
            <div class="flex justify-center">
                <img
                    :src="logoInvestLockup"
                    alt="Logo INVEST"
                    class="h-12 w-auto"
                />
            </div>

            <h2
                id="signup-form-heading"
                class="text-auth-heading text-center text-white/55"
            >
                Crie sua conta
            </h2>

            <div class="flex flex-col gap-section-gap w-full">
                <Button
                    variant="outline"
                    class="w-full py-4 h-[43px] rounded-full border-2 border-input-bg bg-transparent shadow-none hover:bg-transparent"
                    :disabled="isSigningIn"
                    @click="handleGoogleSignIn"
                >
                    <img
                        :src="googleG"
                        alt=""
                        class="size-6 mr-3"
                        aria-hidden="true"
                    />
                    <span class="text-auth-button text-input-bg"
                        >Continuar com Google</span
                    >
                </Button>

                <div class="border-t border-divider" />

                <form
                    @submit.prevent="onSubmit"
                    class="flex flex-col gap-section-gap w-full"
                >
                    <FormField v-slot="{ componentField }" name="fullName">
                        <FormItem class="space-y-2">
                            <FormLabel class="sr-only">
                                Nome completo
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder="Digite seu nome completo"
                                    autocomplete="name"
                                    class="rounded-full h-[42px] px-[13px] border-input-outline"
                                    v-bind="componentField"
                                />
                            </FormControl>
                            <FormMessage class="text-xs" />
                        </FormItem>
                    </FormField>

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

                    <FormField v-slot="{ componentField }" name="phone">
                        <FormItem class="space-y-2">
                            <FormLabel class="sr-only"> Telefone </FormLabel>
                            <FormControl>
                                <Input
                                    type="tel"
                                    placeholder="Digite seu telefone"
                                    autocomplete="tel"
                                    class="rounded-full h-[42px] px-[13px] border-input-outline"
                                    v-bind="componentField"
                                />
                            </FormControl>
                            <FormMessage class="text-xs" />
                        </FormItem>
                    </FormField>

                    <FormField v-slot="{ componentField }" name="password">
                        <FormItem class="space-y-2">
                            <FormLabel class="sr-only"> Senha </FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="Digite sua senha"
                                    autocomplete="new-password"
                                    class="rounded-full h-[42px] px-[13px] border-input-outline"
                                    v-bind="componentField"
                                />
                            </FormControl>
                            <FormMessage class="text-xs" />
                        </FormItem>
                    </FormField>

                    <FormField
                        v-slot="{ componentField }"
                        name="confirmPassword"
                    >
                        <FormItem class="space-y-2">
                            <FormLabel class="sr-only">
                                Repetir senha
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="Confirme sua senha"
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
                        :disabled="isSigningUp"
                        class="w-full h-[40px] rounded-full bg-white px-[7px] text-auth-cta text-on-light hover:bg-white/90"
                    >
                        {{ isSigningUp ? "Criando conta..." : "Criar conta" }}
                    </Button>

                    <div class="text-center">
                        <span class="text-auth-link text-input-bg">
                            Já tem uma conta?
                            <RouterLink
                                to="/auth/login"
                                class="text-auth-button text-white underline"
                            >
                                Acesse aqui!
                            </RouterLink>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    </section>
</template>
