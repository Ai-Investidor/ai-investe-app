<script setup>
import { ref } from "vue";
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
const { runAction: runSubmit } = useAsyncAction({ logLabel: "onboarding/step4" });
const isSubmitting = ref(false);

const currencyFormatOptions = { style: "currency", currency: "BRL" };

const ALLOCATIONS = [
    "Poupança",
    "CDB / Renda fixa",
    "Conta corrente",
    "Investimentos",
    "Outro",
];

const DEBT_TYPES = [
    "Cartão de crédito",
    "Cheque especial",
    "Financiamento",
    "Empréstimo pessoal",
    "Outro",
];

const debtSchema = z.object({
    name: z
        .string({ required_error: "Informe o nome da dívida" })
        .min(1, "Informe o nome da dívida"),
    type: z
        .string({ required_error: "Selecione o tipo" })
        .min(1, "Selecione o tipo"),
    balance: z
        .number({ required_error: "Informe o saldo devedor" })
        .min(0, "Informe um valor válido"),
    interestRate: z
        .number({ required_error: "Informe a taxa de juros" })
        .min(0, "Informe um valor válido"),
});

const reservaDividasSchema = z
    .object({
        reserveAmount: z
            .number({ required_error: "Informe o valor da reserva" })
            .min(0, "Informe um valor válido"),
        monthsCovered: z
            .number({ required_error: "Informe quantos meses a reserva cobre" })
            .min(0, "Informe um valor válido"),
        allocation: z
            .string({ required_error: "Selecione onde a reserva está alocada" })
            .min(1, "Selecione onde a reserva está alocada"),
        hasDebts: z.enum(["sim", "nao"], {
            required_error: "Selecione uma opção",
        }),
        debts: z.array(debtSchema).default([]),
    })
    .refine(
        (values) => values.hasDebts === "nao" || values.debts.length >= 1,
        {
            message: "Adicione ao menos uma dívida",
            path: ["debts"],
        },
    );

const { handleSubmit, values, errors } = useForm({
    validationSchema: toTypedSchema(reservaDividasSchema),
    initialValues: { debts: [] },
});

const onSubmit = handleSubmit(async (formValues) => {
    const result = await runSubmit(
        async () => {
            await onboardingApi.upsertEmergencyReserve({
                amount: formValues.reserveAmount,
                monthsCovered: formValues.monthsCovered,
                allocation: formValues.allocation,
            });
            await onboardingApi.replaceDebts(
                formValues.hasDebts === "sim" ? formValues.debts : [],
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
        aria-labelledby="onboarding-step-4-heading"
    >
        <div
            class="rounded-2xl border bg-gradient-to-r from-black to-surface-2 border-card-border flex flex-col gap-section-gap px-8 py-10 max-lg:px-6 max-lg:py-8"
        >
            <div class="flex flex-col gap-2 text-center">
                <h2
                    id="onboarding-step-4-heading"
                    class="text-auth-heading text-white"
                >
                    Reserva e dívidas
                </h2>
                <p class="text-paragraph-1 text-input-outline">
                    Isso ajuda a entender sua saúde financeira antes de
                    investir.
                </p>
            </div>

            <form
                class="flex flex-col gap-section-gap w-full"
                @submit.prevent="onSubmit"
            >
                <div class="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                    <FormField
                        v-slot="{ value, handleChange }"
                        name="reserveAmount"
                    >
                        <FormItem class="space-y-2">
                            <FormLabel class="text-paragraph-4 text-white">
                                Valor da reserva de emergência
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
                        name="monthsCovered"
                    >
                        <FormItem class="space-y-2">
                            <FormLabel class="text-paragraph-4 text-white">
                                Quantos meses de custo ela cobre
                            </FormLabel>
                            <FormControl>
                                <NumberField
                                    :min="0"
                                    :model-value="value"
                                    @update:model-value="handleChange"
                                >
                                    <NumberFieldContent>
                                        <NumberFieldInput
                                            placeholder="Ex.: 6"
                                            class="border-input-outline bg-transparent text-white"
                                        />
                                    </NumberFieldContent>
                                </NumberField>
                            </FormControl>
                            <FormMessage class="text-xs" />
                        </FormItem>
                    </FormField>
                </div>

                <FormField v-slot="{ componentField }" name="allocation">
                    <FormItem class="max-w-sm space-y-2">
                        <FormLabel class="text-paragraph-4 text-white">
                            Onde a reserva está alocada
                        </FormLabel>
                        <FormControl>
                            <Select v-bind="componentField">
                                <SelectTrigger
                                    class="w-full border-input-outline bg-transparent text-white"
                                >
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        v-for="opcao in ALLOCATIONS"
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

                <FormField v-slot="{ componentField }" name="hasDebts">
                    <FormItem class="space-y-2">
                        <FormLabel class="text-paragraph-4 text-white">
                            Possui dívidas em aberto?
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
                        v-if="values.hasDebts === 'sim'"
                        class="flex flex-col gap-3"
                    >
                        <FieldArray v-slot="{ fields, push, remove }" name="debts">
                            <div
                                v-for="(field, index) in fields"
                                :key="field.key"
                                class="flex flex-col gap-3 rounded-xl border border-input-outline/40 bg-white/5 p-4"
                            >
                                <div
                                    class="grid grid-cols-2 gap-3 max-md:grid-cols-1"
                                >
                                    <FormField
                                        v-slot="{ componentField: nameField }"
                                        :name="`debts[${index}].name`"
                                    >
                                        <FormItem class="space-y-2">
                                            <FormLabel class="text-paragraph-4 text-white">
                                                Nome da dívida
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ex.: Cartão Nubank"
                                                    class="border-input-outline bg-transparent text-white"
                                                    v-bind="nameField"
                                                />
                                            </FormControl>
                                            <FormMessage class="text-xs" />
                                        </FormItem>
                                    </FormField>

                                    <FormField
                                        v-slot="{ componentField: typeField }"
                                        :name="`debts[${index}].type`"
                                    >
                                        <FormItem class="space-y-2">
                                            <FormLabel class="text-paragraph-4 text-white">
                                                Tipo
                                            </FormLabel>
                                            <FormControl>
                                                <Select v-bind="typeField">
                                                    <SelectTrigger
                                                        class="w-full border-input-outline bg-transparent text-white"
                                                    >
                                                        <SelectValue placeholder="Selecione" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem
                                                            v-for="opcao in DEBT_TYPES"
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
                                </div>

                                <div
                                    class="grid grid-cols-2 gap-3 max-md:grid-cols-1"
                                >
                                    <FormField
                                        v-slot="{ value: balanceValue, handleChange: handleBalanceChange }"
                                        :name="`debts[${index}].balance`"
                                    >
                                        <FormItem class="space-y-2">
                                            <FormLabel class="text-paragraph-4 text-white">
                                                Saldo devedor
                                            </FormLabel>
                                            <FormControl>
                                                <NumberField
                                                    :min="0"
                                                    :format-options="currencyFormatOptions"
                                                    locale="pt-BR"
                                                    :model-value="balanceValue"
                                                    @update:model-value="handleBalanceChange"
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
                                        v-slot="{ value: rateValue, handleChange: handleRateChange }"
                                        :name="`debts[${index}].interestRate`"
                                    >
                                        <FormItem class="space-y-2">
                                            <FormLabel class="text-paragraph-4 text-white">
                                                Taxa de juros (% ao mês)
                                            </FormLabel>
                                            <FormControl>
                                                <NumberField
                                                    :min="0"
                                                    :step="0.1"
                                                    :model-value="rateValue"
                                                    @update:model-value="handleRateChange"
                                                >
                                                    <NumberFieldContent>
                                                        <NumberFieldInput
                                                            placeholder="Ex.: 12.5"
                                                            class="border-input-outline bg-transparent text-white"
                                                        />
                                                    </NumberFieldContent>
                                                </NumberField>
                                            </FormControl>
                                            <FormMessage class="text-xs" />
                                        </FormItem>
                                    </FormField>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    class="text-destructive hover:text-destructive self-start"
                                    @click="remove(index)"
                                >
                                    Remover
                                </Button>
                            </div>

                            <p
                                v-if="errors.debts"
                                class="text-destructive text-sm"
                            >
                                {{ errors.debts }}
                            </p>

                            <Button
                                type="button"
                                variant="outline"
                                class="self-start rounded-full border-2 border-input-bg bg-transparent px-5 shadow-none hover:bg-transparent"
                                @click="
                                    push({
                                        name: '',
                                        type: undefined,
                                        balance: undefined,
                                        interestRate: undefined,
                                    })
                                "
                            >
                                <span class="text-auth-button text-input-bg"
                                    >+ Adicionar dívida</span
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
