<script setup>
import { computed, onMounted, ref } from "vue";
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
import { useAsyncAction } from "@composables/useAsyncAction.js";
import { onboardingService } from "@services/onboardingService.js";
import { useOnboardingStore } from "@stores/onboarding.js";
import ArrowLeft from "@/components/icons/ArrowLeft.vue";

const emit = defineEmits(["back", "complete"]);

const onboardingStore = useOnboardingStore();
const onboardingApi = onboardingService();
const { runAction: runSubmit } = useAsyncAction({ logLabel: "onboarding/step3" });
const isSubmitting = ref(false);

const currencyFormatOptions = { style: "currency", currency: "BRL" };

const fluxoCaixaSchema = z.object({
    fixedCosts: z
        .number({ required_error: "Informe seus custos fixos" })
        .min(0, "Informe um valor válido"),
    variableCosts: z
        .number({ required_error: "Informe seus custos variáveis" })
        .min(0, "Informe um valor válido"),
});

const { handleSubmit, values, resetForm } = useForm({
    validationSchema: toTypedSchema(fluxoCaixaSchema),
});

onMounted(async () => {
    const [financialProfile, cashFlow] = await Promise.all([
        onboardingApi.getMyFinancialProfile(),
        onboardingApi.getLatestCashFlow(),
    ]);

    if (financialProfile?.net_monthly_income !== undefined) {
        onboardingStore.mergeFormData({
            netMonthlyIncome: financialProfile.net_monthly_income,
        });
    }

    if (!cashFlow) return;

    resetForm({
        values: {
            fixedCosts: cashFlow.fixed_costs ?? undefined,
            variableCosts: cashFlow.variable_costs ?? undefined,
        },
    });
});

const netMonthlyIncome = computed(
    () => onboardingStore.formData.netMonthlyIncome ?? 0,
);
const totalSavings = computed(
    () =>
        netMonthlyIncome.value -
        (values.fixedCosts ?? 0) -
        (values.variableCosts ?? 0),
);
const savingsRate = computed(() =>
    netMonthlyIncome.value > 0
        ? (totalSavings.value / netMonthlyIncome.value) * 100
        : 0,
);

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

function currentMonthIso() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${now.getFullYear()}-${month}-01`;
}

const onSubmit = handleSubmit(async (formValues) => {
    const result = await runSubmit(
        () =>
            onboardingApi.createCashFlow({
                month: currentMonthIso(),
                fixedCosts: formValues.fixedCosts,
                variableCosts: formValues.variableCosts,
                totalSavings: totalSavings.value,
                savingsRate: savingsRate.value,
            }),
        { loading: isSubmitting },
    );
    if (!result) return;

    onboardingStore.mergeFormData({
        ...formValues,
        totalSavings: totalSavings.value,
        savingsRate: savingsRate.value,
    });
    emit("complete");
});
</script>

<template>
    <section
        class="w-full max-w-2xl"
        aria-labelledby="onboarding-step-3-heading"
    >
        <div
            class="rounded-2xl border bg-gradient-to-r from-black to-surface-2 border-card-border flex flex-col gap-section-gap px-8 py-10 max-lg:px-6 max-lg:py-8"
        >
            <div class="flex flex-col gap-2 text-center">
                <h2
                    id="onboarding-step-3-heading"
                    class="text-auth-heading text-white"
                >
                    Fluxo de caixa mensal
                </h2>
                <p class="text-paragraph-1 text-input-outline">
                    Isso ajuda a entender quanto sobra pra investir todo mês.
                </p>
            </div>

            <form
                class="flex flex-col gap-section-gap w-full"
                @submit.prevent="onSubmit"
            >
                <div class="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                    <FormField
                        v-slot="{ value, handleChange }"
                        name="fixedCosts"
                    >
                        <FormItem class="space-y-2">
                            <FormLabel class="text-paragraph-4 text-white">
                                Custos fixos
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

                    <FormField
                        v-slot="{ value, handleChange }"
                        name="variableCosts"
                    >
                        <FormItem class="space-y-2">
                            <FormLabel class="text-paragraph-4 text-white">
                                Custos variáveis
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
                </div>

                <div
                    class="rounded-xl border border-input-outline/40 bg-white/5 p-4 flex items-center justify-between gap-3 max-md:flex-col max-md:items-start"
                >
                    <span class="text-paragraph-4 text-white"
                        >Sobra mensal estimada</span
                    >
                    <span
                        class="text-paragraph-4"
                        :class="totalSavings > 0 ? 'text-primary' : 'text-destructive'"
                    >
                        {{ currencyFormatter.format(totalSavings) }} ({{
                            savingsRate.toFixed(0)
                        }}%)
                    </span>
                </div>

                <p
                    v-if="totalSavings <= 0"
                    class="text-destructive text-sm"
                >
                    Sua poupança está zerada ou negativa — o problema aqui é
                    orçamento, não investimento.
                </p>

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
