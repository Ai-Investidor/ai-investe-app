<script setup>
import { onMounted, ref } from "vue";
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
import DatePicker from "@/components/DatePicker/DatePicker.vue";

const emit = defineEmits(["back", "complete"]);

const onboardingStore = useOnboardingStore();
const onboardingApi = onboardingService();
const { runAction: runSubmit } = useAsyncAction({ logLabel: "onboarding/step6" });
const isSubmitting = ref(false);
const mainGoalIndex = ref(0);

const currencyFormatOptions = { style: "currency", currency: "BRL" };

const CATEGORIES = [
    "Preservar patrimônio",
    "Gerar renda",
    "Crescer patrimônio",
    "Aposentadoria",
    "Meta com data",
];

function todayIso() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
}

const goalSchema = z.object({
    title: z
        .string({ required_error: "Dê um nome pro objetivo" })
        .min(1, "Dê um nome pro objetivo"),
    category: z
        .string({ required_error: "Selecione a categoria" })
        .min(1, "Selecione a categoria"),
    targetAmount: z
        .number({ required_error: "Informe o valor da meta" })
        .min(0, "Informe um valor válido"),
    deadline: z
        .string({ required_error: "Informe o prazo" })
        .min(1, "Informe o prazo"),
});

const objetivosSchema = z.object({
    goals: z
        .array(goalSchema)
        .min(1, "Adicione ao menos um objetivo"),
});

const { handleSubmit, errors, resetForm } = useForm({
    validationSchema: toTypedSchema(objetivosSchema),
    initialValues: { goals: [] },
});

onMounted(async () => {
    const goals = await onboardingApi.getGoals();
    if (!goals?.length) return;

    resetForm({
        values: {
            goals: goals.map((goal) => ({
                title: goal.title,
                category: goal.category,
                targetAmount: goal.target_amount,
                deadline: goal.deadline,
            })),
        },
    });
    mainGoalIndex.value = Math.max(
        goals.findIndex((goal) => goal.is_main),
        0,
    );
});

const onSubmit = handleSubmit(async (formValues) => {
    const mainIndex = Math.min(mainGoalIndex.value, formValues.goals.length - 1);
    const goals = formValues.goals.map((goal, index) => ({
        ...goal,
        isMain: index === mainIndex,
    }));

    const result = await runSubmit(() => onboardingApi.replaceGoals(goals), {
        loading: isSubmitting,
    });
    if (!result) return;

    onboardingStore.mergeFormData({ goals });
    emit("complete");
});
</script>

<template>
    <section
        class="w-full max-w-2xl"
        aria-labelledby="onboarding-step-6-heading"
    >
        <div
            class="rounded-2xl border bg-gradient-to-r from-black to-surface-2 border-card-border flex flex-col gap-section-gap px-8 py-10 max-lg:px-6 max-lg:py-8"
        >
            <div class="flex flex-col gap-2 text-center">
                <h2
                    id="onboarding-step-6-heading"
                    class="text-auth-heading text-white"
                >
                    Objetivos e horizontes
                </h2>
                <p class="text-paragraph-1 text-input-outline">
                    Cadastre seus objetivos e marque qual é o principal.
                </p>
            </div>

            <form
                class="flex flex-col gap-section-gap w-full"
                @submit.prevent="onSubmit"
            >
                <FieldArray v-slot="{ fields, push, remove }" name="goals">
                    <RadioGroup
                        class="flex flex-col gap-3"
                        :model-value="mainGoalIndex"
                        @update:model-value="mainGoalIndex = Number($event)"
                    >
                        <div
                            v-for="(field, index) in fields"
                            :key="field.key"
                            class="flex flex-col gap-3 rounded-xl border border-input-outline/40 bg-white/5 p-4"
                        >
                            <FormField
                                v-slot="{ componentField: titleField }"
                                :name="`goals[${index}].title`"
                            >
                                <FormItem class="space-y-2">
                                    <FormLabel class="text-paragraph-4 text-white">
                                        Nome do objetivo
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ex.: Comprar apartamento"
                                            class="border-input-outline bg-transparent text-white"
                                            v-bind="titleField"
                                        />
                                    </FormControl>
                                    <FormMessage class="text-xs" />
                                </FormItem>
                            </FormField>

                            <div class="grid grid-cols-3 gap-3 max-md:grid-cols-1">
                                <FormField
                                    v-slot="{ componentField: categoryField }"
                                    :name="`goals[${index}].category`"
                                >
                                    <FormItem class="space-y-2">
                                        <FormLabel class="text-paragraph-4 text-white">
                                            Categoria
                                        </FormLabel>
                                        <FormControl>
                                            <Select v-bind="categoryField">
                                                <SelectTrigger
                                                    class="w-full border-input-outline bg-transparent text-white"
                                                >
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem
                                                        v-for="opcao in CATEGORIES"
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
                                    :name="`goals[${index}].targetAmount`"
                                >
                                    <FormItem class="space-y-2">
                                        <FormLabel class="text-paragraph-4 text-white">
                                            Valor da meta
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

                                <FormField
                                    v-slot="{ value: deadlineValue, handleChange: handleDeadlineChange }"
                                    :name="`goals[${index}].deadline`"
                                >
                                    <FormItem class="space-y-2">
                                        <FormLabel class="text-paragraph-4 text-white">
                                            Prazo
                                        </FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                :model-value="deadlineValue"
                                                :min-value="todayIso()"
                                                class="w-full border-input-outline bg-transparent text-white"
                                                @update:model-value="handleDeadlineChange"
                                            />
                                        </FormControl>
                                        <FormMessage class="text-xs" />
                                    </FormItem>
                                </FormField>
                            </div>

                            <div class="flex items-center justify-between gap-3">
                                <label
                                    class="flex items-center gap-2 cursor-pointer"
                                >
                                    <RadioGroupItem :value="index" />
                                    <span class="text-paragraph-3 text-white"
                                        >Objetivo principal</span
                                    >
                                </label>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    class="text-destructive hover:text-destructive"
                                    @click="remove(index)"
                                >
                                    Remover
                                </Button>
                            </div>
                        </div>
                    </RadioGroup>

                    <p v-if="errors.goals" class="text-destructive text-sm">
                        {{ errors.goals }}
                    </p>

                    <Button
                        type="button"
                        variant="outline"
                        class="self-start rounded-full border-2 border-input-bg bg-transparent px-5 shadow-none hover:bg-transparent"
                        @click="
                            push({
                                title: '',
                                category: undefined,
                                targetAmount: undefined,
                                deadline: '',
                            })
                        "
                    >
                        <span class="text-auth-button text-input-bg"
                            >+ Adicionar objetivo</span
                        >
                    </Button>
                </FieldArray>

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
