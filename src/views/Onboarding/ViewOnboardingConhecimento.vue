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
const { runAction: runSubmit } = useAsyncAction({ logLabel: "onboarding/step8" });
const isSubmitting = ref(false);

const KNOWLEDGE_LEVELS = [
    { value: "iniciante", label: "Iniciante" },
    { value: "intermediario", label: "Intermediário" },
    { value: "avancado", label: "Avançado" },
];

const conhecimentoSchema = z.object({
    knowledgeLevel: z.enum(["iniciante", "intermediario", "avancado"], {
        required_error: "Selecione seu nível de conhecimento",
    }),
    selfPerceptionNotes: z.string().optional(),
});

const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(conhecimentoSchema),
});

const onSubmit = handleSubmit(async (formValues) => {
    const result = await runSubmit(
        () => onboardingApi.upsertKnowledgeProfile(formValues),
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
        aria-labelledby="onboarding-step-8-heading"
    >
        <div
            class="rounded-2xl border bg-gradient-to-r from-black to-surface-2 border-card-border flex flex-col gap-section-gap px-8 py-10 max-lg:px-6 max-lg:py-8"
        >
            <div class="flex flex-col gap-2 text-center">
                <h2
                    id="onboarding-step-8-heading"
                    class="text-auth-heading text-white"
                >
                    Conhecimento e autopercepção
                </h2>
                <p class="text-paragraph-1 text-input-outline">
                    Última etapa — isso ajuda a calibrar a linguagem e os
                    produtos que vamos sugerir.
                </p>
            </div>

            <form
                class="flex flex-col gap-section-gap w-full"
                @submit.prevent="onSubmit"
            >
                <FormField v-slot="{ componentField }" name="knowledgeLevel">
                    <FormItem class="space-y-2">
                        <FormLabel class="text-paragraph-4 text-white">
                            Como você classificaria seu nível de conhecimento
                            em investimentos?
                        </FormLabel>
                        <FormControl>
                            <RadioGroup
                                class="grid grid-cols-3 gap-3 max-md:grid-cols-1"
                                v-bind="componentField"
                            >
                                <label
                                    v-for="opcao in KNOWLEDGE_LEVELS"
                                    :key="opcao.value"
                                    class="group cursor-pointer"
                                >
                                    <RadioGroupItem
                                        :value="opcao.value"
                                        class="peer sr-only"
                                    />
                                    <div
                                        class="rounded-xl border border-input-outline/40 bg-white/5 px-4 py-3 text-center transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50"
                                    >
                                        <span
                                            class="text-paragraph-3 text-white"
                                            >{{ opcao.label }}</span
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
                    name="selfPerceptionNotes"
                >
                    <FormItem class="space-y-2">
                        <FormLabel class="text-paragraph-4 text-white">
                            Quer complementar sua autopercepção? (opcional)
                        </FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Ex.: entendo bem de renda fixa, pouco de ações..."
                                class="border-input-outline bg-transparent text-white"
                                v-bind="componentField"
                            />
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
                        {{ isSubmitting ? "Salvando..." : "Concluir" }}
                    </Button>
                </div>
            </form>
        </div>
    </section>
</template>
