<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";

import ConstellationBackground from "@/components/ConstellationBackground/ConstellationBackground.vue";
import { useAuth } from "@composables/useAuth.js";
import { onboardingService } from "@services/onboardingService.js";
import { useAuthStore } from "@stores/auth.js";
import { useOnboardingStore } from "@stores/onboarding.js";
import ViewOnboardingConhecimento from "@views/Onboarding/ViewOnboardingConhecimento.vue";
import ViewOnboardingContextoPessoal from "@views/Onboarding/ViewOnboardingContextoPessoal.vue";
import ViewOnboardingFluxoCaixa from "@views/Onboarding/ViewOnboardingFluxoCaixa.vue";
import ViewOnboardingObjetivos from "@views/Onboarding/ViewOnboardingObjetivos.vue";
import ViewOnboardingPatrimonio from "@views/Onboarding/ViewOnboardingPatrimonio.vue";
import ViewOnboardingPerfilProfissional from "@views/Onboarding/ViewOnboardingPerfilProfissional.vue";
import ViewOnboardingReservaDividas from "@views/Onboarding/ViewOnboardingReservaDividas.vue";
import ViewOnboardingToleranciaRisco from "@views/Onboarding/ViewOnboardingToleranciaRisco.vue";

const router = useRouter();
const { userDisplayName, onboardingCurrentStep } = useAuth();
const authStore = useAuthStore();
const onboardingApi = onboardingService();

const primeiroNome = computed(() => userDisplayName.value.split(" ")[0]);

const steps = [
    { id: "contexto-pessoal", component: ViewOnboardingContextoPessoal },
    { id: "perfil-profissional", component: ViewOnboardingPerfilProfissional },
    { id: "fluxo-caixa", component: ViewOnboardingFluxoCaixa },
    { id: "reserva-dividas", component: ViewOnboardingReservaDividas },
    { id: "patrimonio", component: ViewOnboardingPatrimonio },
    { id: "objetivos", component: ViewOnboardingObjetivos },
    { id: "tolerancia-risco", component: ViewOnboardingToleranciaRisco },
    { id: "conhecimento", component: ViewOnboardingConhecimento },
];

const initialStepIndex = Math.min(
    Math.max(onboardingCurrentStep.value - 1, 0),
    steps.length - 1,
);

const onboardingStore = useOnboardingStore();
const { activeIndex, formData } = storeToRefs(onboardingStore);
onboardingStore.setActiveIndex(initialStepIndex);
const swiperInstance = ref(null);

function onSwiper(instance) {
    swiperInstance.value = instance;
}

function onSwiperDestroy() {
    swiperInstance.value = null;
}

function onSlideChange(instance) {
    onboardingStore.setActiveIndex(instance.activeIndex);
}

function goBack() {
    if (swiperInstance.value && !swiperInstance.value.destroyed) {
        swiperInstance.value.slidePrev();
    }
}

async function onStepComplete() {
    const hasNextStep = activeIndex.value < steps.length - 1;

    if (hasNextStep) {
        const nextStep = activeIndex.value + 2;
        try {
            await onboardingApi.updateMyProfile({
                onboardingCurrentStep: nextStep,
            });
            authStore.setOnboardingStatus({
                completed: false,
                currentStep: nextStep,
            });
        } catch (err) {
            console.error("[onboarding] falha ao salvar progresso", err);
        }

        if (swiperInstance.value && !swiperInstance.value.destroyed) {
            swiperInstance.value.slideNext();
        }
        return;
    }

    try {
        await onboardingApi.updateMyProfile({ onboardingCompleted: true });
        authStore.setOnboardingStatus({
            completed: true,
            currentStep: steps.length,
        });
    } catch (err) {
        console.error("[onboarding] falha ao concluir onboarding", err);
    }

    toast.success(
        "Perfil concluído! Em breve calculamos seu perfil de investidor.",
    );
    console.log("[onboarding] dados coletados:", formData.value);
    router.push({ name: "chat" });
}
</script>

<template>
    <main
        class="relative min-h-screen w-full overflow-hidden bg-app-bg"
    >
        <div class="pointer-events-none absolute inset-0 z-0">
            <ConstellationBackground
                particle-color="rgba(255, 255, 255, 0.4)"
                line-rgb="255, 255, 255"
                :line-opacity="0.12"
            />
        </div>

        <div
            class="relative z-10 flex min-h-screen w-full flex-col items-center justify-center gap-section-gap px-6 py-16"
        >
            <div class="flex flex-col items-center gap-2 text-center">
                <h1 class="text-auth-hero text-white">
                    Vamos te conhecer melhor,
                    <span class="text-auth-hero-strong">{{ primeiroNome }}</span>
                </h1>
                <p class="text-auth-subheading text-input-outline">
                    Algumas perguntas rápidas pra montar seu perfil de
                    investidor.
                </p>
            </div>

            <div class="flex w-full max-w-2xl flex-col items-center gap-2">
                <div class="flex w-full gap-1.5" role="progressbar" :aria-valuenow="activeIndex + 1" :aria-valuemin="1" :aria-valuemax="steps.length">
                    <span
                        v-for="(step, index) in steps"
                        :key="step.id"
                        class="h-1.5 flex-1 rounded-full transition-colors"
                        :class="index <= activeIndex ? 'bg-primary' : 'bg-card-border'"
                    />
                </div>
                <p class="text-paragraph-1 text-input-outline">
                    Etapa {{ activeIndex + 1 }} de {{ steps.length }}
                </p>
            </div>

            <Swiper
                :modules="[A11y]"
                :allow-touch-move="false"
                :simulate-touch="false"
                :slides-per-view="1"
                :space-between="0"
                :initial-slide="initialStepIndex"
                class="w-full max-w-2xl"
                @swiper="onSwiper"
                @destroy="onSwiperDestroy"
                @slide-change="onSlideChange"
            >
                <SwiperSlide v-for="step in steps" :key="step.id">
                    <component
                        :is="step.component"
                        @back="goBack"
                        @complete="onStepComplete"
                    />
                </SwiperSlide>
            </Swiper>
        </div>
    </main>
</template>
