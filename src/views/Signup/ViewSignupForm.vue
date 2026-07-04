<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { Button } from "@components/button";
import { Input } from "@components/input";
import { Label } from "@components/label";

import logoInvestLockup from "@assets/icons/login/logo-invest-lockup.svg";
import googleG from "@assets/icons/login/google-g.svg";

const fullName = ref("");
const email = ref("");
const phone = ref("");
const password = ref("");
const confirmPassword = ref("");

const handleSubmit = () => {
    console.log("Signup submitted:", {
        fullName: fullName.value,
        email: email.value,
        phone: phone.value,
        password: password.value,
        confirmPassword: confirmPassword.value,
    });
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
                    @click="() => {}"
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
                    @submit.prevent="handleSubmit"
                    class="flex flex-col gap-section-gap w-full"
                >
                    <div class="space-y-2">
                        <Label for="fullName" class="sr-only">
                            Nome completo
                        </Label>
                        <Input
                            id="fullName"
                            v-model="fullName"
                            type="text"
                            placeholder="Digite seu nome completo"
                            autocomplete="name"
                            class="rounded-full h-[42px] px-[13px] border-input-outline"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="email" class="sr-only"> E-mail </Label>
                        <Input
                            id="email"
                            v-model="email"
                            type="email"
                            placeholder="Digite seu e-mail"
                            autocomplete="email"
                            class="rounded-full h-[42px] px-[13px] border-input-outline"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="phone" class="sr-only"> Telefone </Label>
                        <Input
                            id="phone"
                            v-model="phone"
                            type="tel"
                            placeholder="Digite seu telefone"
                            autocomplete="tel"
                            class="rounded-full h-[42px] px-[13px] border-input-outline"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="password" class="sr-only"> Senha </Label>
                        <Input
                            id="password"
                            v-model="password"
                            type="password"
                            placeholder="Digite sua senha"
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
                            placeholder="Confirme sua senha"
                            autocomplete="new-password"
                            class="rounded-full h-[42px] px-[13px] border-input-outline"
                        />
                    </div>

                    <Button
                        type="submit"
                        class="w-full h-[40px] rounded-full bg-white px-[7px] text-auth-cta text-on-light hover:bg-white/90"
                    >
                        Criar conta
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
