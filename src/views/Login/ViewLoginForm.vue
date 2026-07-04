<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { Button } from "@components/button";
import { Input } from "@components/input";
import { Label } from "@components/label";

import cadastroArrow from "@assets/icons/login/cadastro-arrow.svg";
import logoInvestLockup from "@assets/icons/login/logo-invest-lockup.svg";
import googleG from "@assets/icons/login/google-g.svg";

const email = ref("");
const password = ref("");

const handleSubmit = () => {
    // Implementação de envio do formulário será conectada ao backend
    console.log("Form submitted:", {
        email: email.value,
        password: password.value,
    });
};
</script>

<template>
    <section
        class="absolute w-[461px] left-[calc(50%+264.5px)] top-[calc(50%+0.5px)] -translate-x-1/2 -translate-y-1/2 max-md:left-1/2 max-md:top-auto max-md:bottom-4 max-md:translate-y-0"
        aria-labelledby="login-form-heading"
    >
        <div
            class="rounded-md border px-item-gap py-[91px] bg-gradient-to-r from-black to-surface-2 border-card-border flex flex-col items-center justify-center gap-6"
        >
            <!-- Logo -->
            <div class="flex justify-center">
                <img
                    :src="logoInvestLockup"
                    alt="Logo INVEST"
                    class="h-12 w-auto"
                />
            </div>

            <!-- Headline -->
            <h2
                id="login-form-heading"
                class="text-auth-heading text-center text-white/55"
            >
                Bem vindo de volta
            </h2>

            <!-- Grupo de Campos -->
            <div class="flex flex-col gap-section-gap w-full">
                <!-- Google Button -->
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

                <!-- Divider -->
                <div class="border-t border-divider" />

                <!-- Login Form -->
                <form
                    @submit.prevent="handleSubmit"
                    class="flex flex-col gap-section-gap w-full"
                >
                    <!-- Email Field -->
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

                    <!-- Password Field -->
                    <div class="space-y-2">
                        <Label for="password" class="sr-only"> Senha </Label>
                        <Input
                            id="password"
                            v-model="password"
                            type="password"
                            placeholder="Digite sua senha"
                            autocomplete="current-password"
                            class="rounded-full h-[42px] px-[13px] border-input-outline"
                        />
                    </div>

                    <!-- Forgot Password Link -->
                    <div class="text-center">
                        <span class="text-auth-link text-input-bg">
                            Esqueceu a senha?
                            <RouterLink
                                to="/reset-password"
                                class="text-auth-button text-white underline"
                            >
                                Clique aqui!
                            </RouterLink>
                        </span>
                    </div>

                    <!-- Sign In & Sign Up Buttons -->
                    <div class="flex flex-row gap-item-gap w-full">
                        <!-- Acessar Conta: submit button -->
                        <Button
                            type="submit"
                            class="flex-1 h-[40px] rounded-full bg-white px-[7px] text-auth-cta text-on-light hover:bg-white/90"
                        >
                            Acessar Conta
                        </Button>

                        <!-- Faça seu cadastro: navigation link -->
                        <Button
                            :as="RouterLink"
                            to="/cadastro"
                            class="flex-1 justify-center h-[40px] rounded-full bg-white px-[7px] text-auth-cta text-on-light hover:bg-white/90"
                        >
                            <span>Faça seu cadastro</span>
                            <img
                                :src="cadastroArrow"
                                alt=""
                                class="size-7"
                                aria-hidden="true"
                            />
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    </section>
</template>
