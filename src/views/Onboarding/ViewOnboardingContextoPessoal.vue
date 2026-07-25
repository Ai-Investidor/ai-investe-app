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
import { RadioGroup, RadioGroupItem } from "@components/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/select";
import { useAsyncAction } from "@composables/useAsyncAction.js";
import { lookupService } from "@services/lookupService.js";
import { onboardingService } from "@services/onboardingService.js";
import { useOnboardingStore } from "@stores/onboarding.js";
import ArrowLeft from "@/components/icons/ArrowLeft.vue";
import DatePicker from "@/components/DatePicker/DatePicker.vue";

const emit = defineEmits(["back", "complete"]);

const onboardingStore = useOnboardingStore();
const service = lookupService();
const onboardingApi = onboardingService();
const { runAction } = useAsyncAction({ logLabel: "onboarding/lookup" });
const { runAction: runSubmit } = useAsyncAction({ logLabel: "onboarding/step1" });

const maritalStatuses = ref([]);
const isLoadingMaritalStatuses = ref(false);
const isSubmitting = ref(false);

const RELATIONSHIPS = [
    "Filho(a)",
    "Enteado(a)",
    "Cônjuge/Companheiro(a)",
    "Pai",
    "Mãe",
    "Outro",
];

onMounted(async () => {
    const data = await runAction(() => service.getMaritalStatuses(), {
        loading: isLoadingMaritalStatuses,
    });
    if (data) maritalStatuses.value = data;
});

function eighteenYearsAgo() {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date;
}

function toIsoDate(date) {
    return date.toISOString().slice(0, 10);
}

const todayIso = toIsoDate(new Date());
const eighteenYearsAgoIso = toIsoDate(eighteenYearsAgo());

const dependentSchema = z.object({
    relationship: z
        .string({ required_error: "Selecione o parentesco" })
        .min(1, "Selecione o parentesco"),
    birthDate: z
        .string({ required_error: "Informe a data de nascimento" })
        .min(1, "Informe a data de nascimento"),
});

const contextoPessoalSchema = z
    .object({
        dateOfBirth: z
            .string({ required_error: "Informe sua data de nascimento" })
            .min(1, "Informe sua data de nascimento")
            .refine((value) => new Date(value) <= eighteenYearsAgo(), {
                message: "Você precisa ter 18 anos ou mais",
            }),
        maritalStatusId: z.preprocess(
            (value) => (value === undefined ? undefined : Number(value)),
            z.number({ required_error: "Selecione sua situação familiar" }),
        ),
        hasDependents: z.enum(["sim", "nao"], {
            required_error: "Selecione uma opção",
        }),
        dependents: z.array(dependentSchema).default([]),
    })
    .refine(
        (values) =>
            values.hasDependents === "nao" || values.dependents.length >= 1,
        {
            message: "Adicione ao menos um dependente",
            path: ["dependents"],
        },
    );

const { handleSubmit, values, errors } = useForm({
    validationSchema: toTypedSchema(contextoPessoalSchema),
    initialValues: { dependents: [] },
});

const onSubmit = handleSubmit(async (formValues) => {
    const result = await runSubmit(
        async () => {
            await onboardingApi.updateMyProfile({
                dateOfBirth: formValues.dateOfBirth,
                maritalStatusId: formValues.maritalStatusId,
            });
            await onboardingApi.replaceDependents(
                formValues.hasDependents === "sim" ? formValues.dependents : [],
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
        aria-labelledby="onboarding-step-1-heading"
    >
        <div
            class="rounded-2xl border bg-gradient-to-r from-black to-surface-2 border-card-border flex flex-col gap-section-gap px-8 py-10 max-lg:px-6 max-lg:py-8"
        >
            <div class="flex flex-col gap-2 text-center">
                <h2
                    id="onboarding-step-1-heading"
                    class="text-auth-heading text-white"
                >
                    Contexto pessoal
                </h2>
                <p class="text-paragraph-1 text-input-outline">
                    Isso ajuda a entender seu horizonte de vida e sua
                    necessidade de proteção.
                </p>
            </div>

            <form
                class="flex flex-col gap-section-gap w-full"
                @submit.prevent="onSubmit"
            >
                <FormField v-slot="{ value, handleChange }" name="dateOfBirth">
                    <FormItem class="space-y-2">
                        <FormLabel class="text-paragraph-4 text-white">
                            Data de nascimento
                        </FormLabel>
                        <FormControl>
                            <DatePicker
                                :model-value="value"
                                :max-value="eighteenYearsAgoIso"
                                class="max-w-52 border-input-outline bg-transparent text-white"
                                @update:model-value="handleChange"
                            />
                        </FormControl>
                        <FormMessage class="text-xs" />
                    </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="maritalStatusId">
                    <FormItem class="space-y-2">
                        <FormLabel class="text-paragraph-4 text-white">
                            Situação familiar
                        </FormLabel>
                        <FormControl>
                            <RadioGroup
                                class="grid grid-cols-2 gap-3 max-md:grid-cols-1"
                                v-bind="componentField"
                            >
                                <label
                                    v-for="opcao in maritalStatuses"
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

                <FormField v-slot="{ componentField }" name="hasDependents">
                    <FormItem class="space-y-2">
                        <FormLabel class="text-paragraph-4 text-white">
                            Possui dependentes financeiros?
                        </FormLabel>
                        <p class="text-paragraph-1 text-input-outline">
                            Pessoas que dependem financeiramente de quem mora
                            na casa: idosos, crianças, pessoa com deficiência,
                            etc.
                        </p>
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
                        v-if="values.hasDependents === 'sim'"
                        class="flex flex-col gap-3"
                    >
                        <FieldArray v-slot="{ fields, push, remove }" name="dependents">
                            <div
                                v-for="(field, index) in fields"
                                :key="field.key"
                                class="flex items-end gap-3 rounded-xl border border-input-outline/40 bg-white/5 p-4 max-md:flex-col max-md:items-stretch"
                            >
                                <FormField
                                    v-slot="{ componentField: relationshipField }"
                                    :name="`dependents[${index}].relationship`"
                                >
                                    <FormItem class="flex-1 space-y-2">
                                        <FormLabel class="text-paragraph-4 text-white">
                                            Parentesco
                                        </FormLabel>
                                        <FormControl>
                                            <Select v-bind="relationshipField">
                                                <SelectTrigger
                                                    class="w-full border-input-outline bg-transparent text-white"
                                                >
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem
                                                        v-for="opcao in RELATIONSHIPS"
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
                                    v-slot="{ value: birthDateValue, handleChange: handleBirthDateChange }"
                                    :name="`dependents[${index}].birthDate`"
                                >
                                    <FormItem class="flex-1 space-y-2">
                                        <FormLabel class="text-paragraph-4 text-white">
                                            Data de nascimento
                                        </FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                :model-value="birthDateValue"
                                                :max-value="todayIso"
                                                class="w-full border-input-outline bg-transparent text-white"
                                                @update:model-value="handleBirthDateChange"
                                            />
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
                                v-if="errors.dependents"
                                class="text-destructive text-sm"
                            >
                                {{ errors.dependents }}
                            </p>

                            <Button
                                type="button"
                                variant="outline"
                                class="self-start rounded-full border-2 border-input-bg bg-transparent px-5 shadow-none hover:bg-transparent"
                                @click="
                                    push({ relationship: undefined, birthDate: '' })
                                "
                            >
                                <span class="text-auth-button text-input-bg"
                                    >+ Adicionar dependente</span
                                >
                            </Button>
                        </FieldArray>
                    </div>
                </Transition>

                <div class="flex items-center justify-between gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        class="rounded-full border-2 border-input-bg bg-transparent px-5 shadow-none hover:bg-transparent disabled:opacity-30"
                        disabled
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
