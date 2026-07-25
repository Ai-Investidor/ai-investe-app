<script setup>
import { ref } from "vue";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { z } from "zod";

import { Button } from "@components/button";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@components/form";
import { RadioGroup, RadioGroupItem } from "@components/radio-group";
import { Textarea } from "@components/textarea";
import { useAsyncAction } from "@composables/useAsyncAction.js";
import { onboardingService } from "@services/onboardingService.js";
import { useOnboardingStore } from "@stores/onboarding.js";
import ArrowLeft from "@/components/icons/ArrowLeft.vue";

const emit = defineEmits(["back", "complete"]);

const onboardingStore = useOnboardingStore();
const onboardingApi = onboardingService();
const { runAction: runSubmit } = useAsyncAction({ logLabel: "onboarding/step7" });
const isSubmitting = ref(false);

const REACTIONS = ["Venderia tudo", "Venderia parte", "Manteria", "Compraria mais"];
const GAIN_PREFERENCES = [
    "Prefiro o ganho garantido, mesmo que menor",
    "Prefiro arriscar por um ganho maior",
];
const PAIN_POINTS = ["Perder dinheiro", "Ficar de fora de uma alta"];

const toleranciaSchema = z.object({
    reactionTo20PercentDrop: z
        .string({ required_error: "Selecione uma opção" })
        .min(1, "Selecione uma opção"),
    guaranteedGainPreference: z
        .string({ required_error: "Selecione uma opção" })
        .min(1, "Selecione uma opção"),
    pastBehaviorDescription: z
        .string({ required_error: "Conte um pouco sobre seu histórico" })
        .min(1, "Conte um pouco sobre seu histórico"),
    painPoint: z
        .string({ required_error: "Selecione uma opção" })
        .min(1, "Selecione uma opção"),
});

const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(toleranciaSchema),
});

const onSubmit = handleSubmit(async (formValues) => {
    const result = await runSubmit(
        () => onboardingApi.upsertRiskToleranceProfile(formValues),
        { loading: isSubmitting },
    );
    if (!result) return;

    onboardingStore.mergeFormData(formValues);
    emit("complete");
});
</script>

<template>
    <section
        class="w-full max-w-2xl"
        aria-labelledby="onboarding-step-7-heading"
    >
        <div
            class="rounded-2xl border bg-gradient-to-r from-black to-surface-2 border-card-border flex flex-col gap-section-gap px-8 py-10 max-lg:px-6 max-lg:py-8"
        >
            <div class="flex flex-col gap-2 text-center">
                <h2
                    id="onboarding-step-7-heading"
                    class="text-auth-heading text-white"
                >
                    Tolerância a risco
                </h2>
                <p class="text-paragraph-1 text-input-outline">
                    Responda com o que você faria de verdade, não o que acha
                    "certo".
                </p>
            </div>

            <form
                class="flex flex-col gap-section-gap w-full"
                @submit.prevent="onSubmit"
            >
                <FormField
                    v-slot="{ componentField }"
                    name="reactionTo20PercentDrop"
                >
                    <FormItem class="space-y-2">
                        <FormLabel class="text-paragraph-4 text-white">
                            Se seus investimentos caíssem 20%, o que você
                            faria?
                        </FormLabel>
                        <FormControl>
                            <RadioGroup
                                class="grid grid-cols-2 gap-3 max-md:grid-cols-1"
                                v-bind="componentField"
                            >
                                <label
                                    v-for="opcao in REACTIONS"
                                    :key="opcao"
                                    class="group cursor-pointer"
                                >
                                    <RadioGroupItem
                                        :value="opcao"
                                        class="peer sr-only"
                                    />
                                    <div
                                        class="rounded-xl border border-input-outline/40 bg-white/5 px-4 py-3 text-center transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50"
                                    >
                                        <span
                                            class="text-paragraph-3 text-white"
                                            >{{ opcao }}</span
                                        >
                                    </div>
                                </label>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage class="text-xs" />
                    </FormItem>
                </FormField>

                <FormField
                    v-slot="{ componentField }"
                    name="guaranteedGainPreference"
                >
                    <FormItem class="space-y-2">
                        <FormLabel class="text-paragraph-4 text-white">
                            Você prefere...
                        </FormLabel>
                        <FormControl>
                            <RadioGroup
                                class="grid grid-cols-2 gap-3 max-md:grid-cols-1"
                                v-bind="componentField"
                            >
                                <label
                                    v-for="opcao in GAIN_PREFERENCES"
                                    :key="opcao"
                                    class="group cursor-pointer"
                                >
                                    <RadioGroupItem
                                        :value="opcao"
                                        class="peer sr-only"
                                    />
                                    <div
                                        class="rounded-xl border border-input-outline/40 bg-white/5 px-4 py-3 text-center transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50"
                                    >
                                        <span
                                            class="text-paragraph-3 text-white"
                                            >{{ opcao }}</span
                                        >
                                    </div>
                                </label>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage class="text-xs" />
                    </FormItem>
                </FormField>

                <FormField
                    v-slot="{ componentField }"
                    name="pastBehaviorDescription"
                >
                    <FormItem class="space-y-2">
                        <FormLabel class="text-paragraph-4 text-white">
                            Já viveu uma queda forte na bolsa? Como reagiu na
                            época?
                        </FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Conte com suas palavras..."
                                class="border-input-outline bg-transparent text-white"
                                v-bind="componentField"
                            />
                        </FormControl>
                        <FormMessage class="text-xs" />
                    </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="painPoint">
                    <FormItem class="space-y-2">
                        <FormLabel class="text-paragraph-4 text-white">
                            O que incomoda mais?
                        </FormLabel>
                        <FormControl>
                            <RadioGroup
                                class="grid grid-cols-2 gap-3 max-md:grid-cols-1"
                                v-bind="componentField"
                            >
                                <label
                                    v-for="opcao in PAIN_POINTS"
                                    :key="opcao"
                                    class="group cursor-pointer"
                                >
                                    <RadioGroupItem
                                        :value="opcao"
                                        class="peer sr-only"
                                    />
                                    <div
                                        class="rounded-xl border border-input-outline/40 bg-white/5 px-4 py-3 text-center transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50"
                                    >
                                        <span
                                            class="text-paragraph-3 text-white"
                                            >{{ opcao }}</span
                                        >
                                    </div>
                                </label>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage class="text-xs" />
                    </FormItem>
                </FormField>

                <div class="flex items-center justify-between gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        class="rounded-full border-2 border-input-bg bg-transparent px-5 shadow-none hover:bg-transparent"
                        aria-label="Voltar para a etapa anterior"
                        @click="emit('back')"
                    >
                        <ArrowLeft
                            class="size-4 text-input-bg"
                            aria-hidden="true"
                        />
                        <span class="text-auth-button text-input-bg"
                            >Voltar</span
                        >
                    </Button>

                    <Button
                        type="submit"
                        :disabled="isSubmitting"
                        class="rounded-full bg-white px-8 h-[40px] text-auth-cta text-on-light hover:bg-white/90"
                    >
                        {{ isSubmitting ? "Salvando..." : "Avançar" }}
                    </Button>
                </div>
            </form>
        </div>
    </section>
</template>
