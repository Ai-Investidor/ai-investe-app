<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { Button } from "@components/button";
import { Input } from "@components/input";
import { Label } from "@components/label";

import logoInvestLockup from "@assets/icons/login/logo-invest-lockup.svg";

const password = ref("");
const confirmPassword = ref("");

const handleSubmit = () => {
    console.log("Reset password submitted:", {
        password: password.value,
        confirmPassword: confirmPassword.value,
    });
};
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
                @submit.prevent="handleSubmit"
                class="flex flex-col gap-section-gap w-full"
            >
                <div class="space-y-2">
                    <Label for="password" class="sr-only"> Nova senha </Label>
                    <Input
                        id="password"
                        v-model="password"
                        type="password"
                        placeholder="Digite sua nova senha"
                        autocomplete="new-password"
                        class="rounded-full h-[42px] px-[13px] border-input-outline"
                    />
                </div>

                <div class="space-y-2">
                    <Label for="confirmPassword" class="sr-only">
                        Repetir senha
                    </Label>
                    <Input
                        id="confirmPassword"
                        v-model="confirmPassword"
                        type="password"
                        placeholder="Confirme sua nova senha"
                        autocomplete="new-password"
                        class="rounded-full h-[42px] px-[13px] border-input-outline"
                    />
                </div>

                <Button
                    type="submit"
                    class="w-full h-[40px] rounded-full bg-white px-[7px] text-auth-cta text-on-light hover:bg-white/90"
                >
                    Salvar nova senha
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
