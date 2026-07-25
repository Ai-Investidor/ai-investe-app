<script setup>
import { computed, ref } from "vue";
import { toTypedSchema } from "@vee-validate/zod";
import { FieldArray, useForm } from "vee-validate";
import { z } from "zod";

import { Button } from "@components/button";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@components/form";
import { Input } from "@components/input";
import { NumberField, NumberFieldContent, NumberFieldInput } from "@components/number-field";
import { RadioGroup, RadioGroupItem } from "@components/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/select";
import { useAsyncAction } from "@composables/useAsyncAction.js";
import { onboardingService } from "@services/onboardingService.js";
import { useOnboardingStore } from "@stores/onboarding.js";
import ArrowLeft from "@/components/icons/ArrowLeft.vue";

const emit = defineEmits(["back", "complete"]);

const onboardingStore = useOnboardingStore();
const onboardingApi = onboardingService();
const { runAction: runSubmit } = useAsyncAction({ logLabel: "onboarding/step5" });
const isSubmitting = ref(false);

const currencyFormatOptions = { style: "currency", currency: "BRL" };
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

const ASSET_CLASSES = [
    "Renda Fixa",
    "Ações",
    "Fundos Imobiliários",
    "Fundos Multimercado",
    "Criptoativos",
    "Outro",
];

const investmentSchema = z.object({
    assetName: z
        .string({ required_error: "Informe o nome do ativo" })
        .min(1, "Informe o nome do ativo"),
    assetClass: z
        .string({ required_error: "Selecione a classe" })
        .min(1, "Selecione a classe"),
    amount: z
        .number({ required_error: "Informe o valor investido" })
        .min(0, "Informe um valor válido"),
});

const patrimonioSchema = z
    .object({
        totalAssets: z
            .number({ required_error: "Informe seu patrimônio total" })
            .min(0, "Informe um valor válido"),
        totalLiabilities: z
            .number({ required_error: "Informe suas dívidas/passivos" })
            .min(0, "Informe um valor válido"),
        hasInvestments: z.enum(["sim", "nao"], {
            required_error: "Selecione uma opção",
        }),
        investments: z.array(investmentSchema).default([]),
    })
    .refine(
        (values) =>
            values.hasInvestments === "nao" || values.investments.length >= 1,
        {
            message: "Adicione ao menos um investimento",
            path: ["investments"],
        },
    );

const { handleSubmit, values, errors } = useForm({
    validationSchema: toTypedSchema(patrimonioSchema),
    initialValues: { investments: [] },
});

const netWorth = computed(
    () => (values.totalAssets ?? 0) - (values.totalLiabilities ?? 0),
);

const onSubmit = handleSubmit(async (formValues) => {
    const result = await runSubmit(
        async () => {
            await onboardingApi.upsertNetWorth({
                totalAssets: formValues.totalAssets,
                totalLiabilities: formValues.totalLiabilities,
            });
            await onboardingApi.replaceInvestments(
                formValues.hasInvestments === "sim" ? formValues.investments : [],
            );
            return true;
        },
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
        aria-labelledby="onboarding-step-5-heading"
    >
        <div
            class="rounded-2xl border bg-gradient-to-r from-black to-surface-2 border-card-border flex flex-col gap-section-gap px-8 py-10 max-lg:px-6 max-lg:py-8"
        >
            <div class="flex flex-col gap-2 text-center">
                <h2
                    id="onboarding-step-5-heading"
                    class="text-auth-heading text-white"
                >
                    Patrimônio e investimentos atuais
                </h2>
                <p class="text-paragraph-1 text-input-outline">
                    Isso ajuda a entender sua capacidade e diversificação
                    atual.
                </p>
            </div>

            <form
                class="flex flex-col gap-section-gap w-full"
                @submit.prevent="onSubmit"
            >
                <div class="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                    <FormField
                        v-slot="{ value, handleChange }"
                        name="totalAssets"
                    >
                        <FormItem class="space-y-2">
                            <FormLabel class="text-paragraph-4 text-white">
                                Patrimônio total (bens + investimentos)
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
                        name="totalLiabilities"
                    >
                        <FormItem class="space-y-2">
                            <FormLabel class="text-paragraph-4 text-white">
                                Dívidas e passivos totais
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
                        >Patrimônio líquido</span
                    >
                    <span class="text-paragraph-4 text-primary">
                        {{ currencyFormatter.format(netWorth) }}
                    </span>
                </div>

                <FormField v-slot="{ componentField }" name="hasInvestments">
                    <FormItem class="space-y-2">
                        <FormLabel class="text-paragraph-4 text-white">
                            Já investe hoje?
                        </FormLabel>
                        <FormControl>
                            <RadioGroup
                                class="grid grid-cols-2 gap-3"
                                v-bind="componentField"
                            >
                                <label class="group cursor-pointer">
                                    <RadioGroupItem
                                        value="sim"
                                        class="peer sr-only"
                                    />
                                    <div
                                        class="rounded-xl border border-input-outline/40 bg-white/5 px-4 py-3 text-center transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50"
                                    >
                                        <span
                                            class="text-paragraph-3 text-white"
                                            >Sim</span
                                        >
                                    </div>
                                </label>
                                <label class="group cursor-pointer">
                                    <RadioGroupItem
                                        value="nao"
                                        class="peer sr-only"
                                    />
                                    <div
                                        class="rounded-xl border border-input-outline/40 bg-white/5 px-4 py-3 text-center transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50"
                                    >
                                        <span
                                            class="text-paragraph-3 text-white"
                                            >Não</span
                                        >
                                    </div>
                                </label>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage class="text-xs" />
                    </FormItem>
                </FormField>

                <Transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                >
                    <div
                        v-if="values.hasInvestments === 'sim'"
                        class="flex flex-col gap-3"
                    >
                        <FieldArray v-slot="{ fields, push, remove }" name="investments">
                            <div
                                v-for="(field, index) in fields"
                                :key="field.key"
                                class="flex items-end gap-3 rounded-xl border border-input-outline/40 bg-white/5 p-4 max-md:flex-col max-md:items-stretch"
                            >
                                <FormField
                                    v-slot="{ componentField: assetNameField }"
                                    :name="`investments[${index}].assetName`"
                                >
                                    <FormItem class="flex-1 space-y-2">
                                        <FormLabel class="text-paragraph-4 text-white">
                                            Ativo
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex.: Tesouro Selic"
                                                class="border-input-outline bg-transparent text-white"
                                                v-bind="assetNameField"
                                            />
                                        </FormControl>
                                        <FormMessage class="text-xs" />
                                    </FormItem>
                                </FormField>

                                <FormField
                                    v-slot="{ componentField: assetClassField }"
                                    :name="`investments[${index}].assetClass`"
                                >
                                    <FormItem class="flex-1 space-y-2">
                                        <FormLabel class="text-paragraph-4 text-white">
                                            Classe
                                        </FormLabel>
                                        <FormControl>
                                            <Select v-bind="assetClassField">
                                                <SelectTrigger
                                                    class="w-full border-input-outline bg-transparent text-white"
                                                >
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem
                                                        v-for="opcao in ASSET_CLASSES"
                                                        :key="opcao"
                                                        :value="opcao"
                                                    >
                                                        {{ opcao }}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage class="text-xs" />
                                    </FormItem>
                                </FormField>

                                <FormField
                                    v-slot="{ value: amountValue, handleChange: handleAmountChange }"
                                    :name="`investments[${index}].amount`"
                                >
                                    <FormItem class="flex-1 space-y-2">
                                        <FormLabel class="text-paragraph-4 text-white">
                                            Valor
                                        </FormLabel>
                                        <FormControl>
                                            <NumberField
                                                :min="0"
                                                :format-options="currencyFormatOptions"
                                                locale="pt-BR"
                                                :model-value="amountValue"
                                                @update:model-value="handleAmountChange"
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

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    class="text-destructive hover:text-destructive shrink-0"
                                    @click="remove(index)"
                                >
                                    Remover
                                </Button>
                            </div>

                            <p
                                v-if="errors.investments"
                                class="text-destructive text-sm"
                            >
                                {{ errors.investments }}
                            </p>

                            <Button
                                type="button"
                                variant="outline"
                                class="self-start rounded-full border-2 border-input-bg bg-transparent px-5 shadow-none hover:bg-transparent"
                                @click="
                                    push({
                                        assetName: '',
                                        assetClass: undefined,
                                        amount: undefined,
                                    })
                                "
                            >
                                <span class="text-auth-button text-input-bg"
                                    >+ Adicionar investimento</span
                                >
                            </Button>
                        </FieldArray>
                    </div>
                </Transition>

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
