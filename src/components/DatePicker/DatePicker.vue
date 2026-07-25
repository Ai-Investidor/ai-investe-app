<script setup>
import { computed, ref, watch } from "vue";
import { parseDate } from "@internationalized/date";
import { Calendar } from "@components/calendar";
import { Input } from "@components/input";
import { Popover, PopoverContent, PopoverTrigger } from "@components/popover";
import { cn } from "@lib/utils";

defineOptions({ inheritAttrs: false });

const props = defineProps({
    modelValue: { type: String, default: "" },
    placeholder: { type: String, default: "dd/mm/aaaa" },
    maxValue: { type: String, default: undefined },
    minValue: { type: String, default: undefined },
    class: {
        type: [Boolean, null, String, Object, Array],
        required: false,
        skipCheck: true,
    },
});

const emit = defineEmits(["update:modelValue"]);

function isoToDisplay(iso) {
    if (!iso) return "";
    const [year, month, day] = iso.split("-");
    return `${day}/${month}/${year}`;
}

function displayToIso(display) {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(display.trim());
    if (!match) return null;
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
}

function safeParseDate(iso) {
    if (!iso) return undefined;
    try {
        return parseDate(iso);
    } catch {
        return undefined;
    }
}

const open = ref(false);
const textValue = ref(isoToDisplay(props.modelValue));

watch(
    () => props.modelValue,
    (value) => {
        textValue.value = isoToDisplay(value);
    },
);

const calendarValue = computed(() => safeParseDate(props.modelValue));
const calendarMax = computed(() => safeParseDate(props.maxValue));
const calendarMin = computed(() => safeParseDate(props.minValue));

// Sem valor ainda: abre no mês/ano do limite (max/min) em vez de "hoje" —
// evita que o mês inicial caia todo fora do range permitido (dias cinza/inválidos).
const calendarPlaceholder = computed(
    () => calendarValue.value ?? calendarMax.value ?? calendarMin.value,
);

function handleBlur() {
    const iso = displayToIso(textValue.value);
    const parsed = iso ? safeParseDate(iso) : undefined;
    if (parsed) {
        emit("update:modelValue", parsed.toString());
    }
}

function handleCalendarSelect(calendarDate) {
    if (!calendarDate) return;
    emit("update:modelValue", calendarDate.toString());
    open.value = false;
}
</script>

<template>
    <Popover v-model:open="open">
        <PopoverTrigger as-child>
            <Input
                v-model="textValue"
                type="text"
                autocomplete="off"
                :placeholder="placeholder"
                :class="cn(props.class)"
                @blur="handleBlur"
            />
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0">
            <Calendar
                :model-value="calendarValue"
                :default-placeholder="calendarPlaceholder"
                :max-value="calendarMax"
                :min-value="calendarMin"
                layout="month-and-year"
                @update:model-value="handleCalendarSelect"
            />
        </PopoverContent>
    </Popover>
</template>
