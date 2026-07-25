<script setup>
import { onMounted, ref } from "vue";
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
import { NumberField, NumberFieldContent, NumberFieldInput } from "@components/number-field";
import { RadioGroup, RadioGroupItem } from "@components/radio-group";
import { useAsyncAction } from "@composables/useAsyncAction.js";
import { lookupService } from "@services/lookupService.js";
import { onboardingService } from "@services/onboardingService.js";
import { useOnboardingStore } from "@stores/onboarding.js";
import ArrowLeft from "@/components/icons/ArrowLeft.vue";

const emit = defineEmits(["back", "complete"]);

const onboardingStore = useOnboardingStore();
const service = lookupService();
const onboardingApi = onboardingService();
const { runAction } = useAsyncAction({ logLabel: "onboarding/lookup" });
const { runAction: runSubmit } = useAsyncAction({ logLabel: "onboarding/step2" });

const employmentTypes = ref([]);
const isLoadingEmploymentTypes = ref(false);
const isSubmitting = ref(false);

onMounted(async () => {
    const data = await runAction(() => service.getEmploymentTypes(), {
        loading: isLoadingEmploymentTypes,
    });
    if (data) employmentTypes.value = data;
});

const currencyFormatOptions = { style: "currency", currency: "BRL" };

const perfilProfissionalSchema = z.object({
    employmentTypeId: z.preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number({ required_error: "Selecione seu tipo de vínculo" }),
    ),
    netMonthlyIncome: z
        .number({ required_error: "Informe sua renda líquida mensal" })
        .min(0, "Informe um valor válido"),
});

const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(perfilProfissionalSchema),
});

const onSubmit = handleSubmit(async (formValues) => {
    const result = await runSubmit(
        () => onboardingApi.upsertMyFinancialProfile(formValues),
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
        aria-labelledby="onboarding-step-2-heading"
    >
        <div
            class="rounded-2xl border bg-gradient-to-r from-black to-surface-2 border-card-border flex flex-col gap-section-gap px-8 py-10 max-lg:px-6 max-lg:py-8"
        >
            <div class="flex flex-col gap-2 text-center">
                <h2
                    id="onboarding-step-2-heading"
                    class="text-auth-heading text-white"
                >
                    Perfil profissional e renda
                </h2>
                <p class="text-paragraph-1 text-input-outline">
                    Isso ajuda a estimar sua capacidade de investimento
                    mensal.
                </p>
            </div>

            <form
                class="flex flex-col gap-section-gap w-full"
                @submit.prevent="onSubmit"
            >
                <FormField v-slot="{ componentField }" name="employmentTypeId">
                    <FormItem class="space-y-2">
                        <FormLabel class="text-paragraph-4 text-white">
                            Tipo de vínculo
                        </FormLabel>
                        <FormControl>
                            <RadioGroup
                                class="grid grid-cols-3 gap-3 max-md:grid-cols-2 max-sm:grid-cols-1"
                                v-bind="componentField"
                            >
                                <label
                                    v-for="opcao in employmentTypes"
                                    :key="opcao.id"
                                    class="group cursor-pointer"
                                >
                                    <RadioGroupItem
                                        :value="opcao.id"
                                        class="peer sr-only"
                                    />
                                    <div
                                        class="rounded-xl border border-input-outline/40 bg-white/5 px-4 py-3 text-center transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50"
                                    >
                                        <span
                                            class="text-paragraph-3 text-white"
                                            >{{ opcao.name }}</span
                                        >
                                    </div>
                                </label>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage class="text-xs" />
                    </FormItem>
                </FormField>

                <FormField
                    v-slot="{ value, handleChange }"
                    name="netMonthlyIncome"
                >
                    <FormItem class="max-w-sm space-y-2">
                        <FormLabel class="text-paragraph-4 text-white">
                            Renda líquida mensal
                        </FormLabel>
                        <FormControl>
                            <NumberField
                                :min="0"
                                :format-options="currencyFormatOptions"
                                locale="pt-BR"
                                :model-value="value"
                                @update:model-value="handleChange"
                            >
                                <NumberFieldContent>
                                    <NumberFieldInput
                                        placeholder="R$ 0,00"
                                        class="border-input-outline bg-transparent text-white"
                                    />
                                </NumberFieldContent>
                            </NumberField>
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
