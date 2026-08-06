<script setup>
import { Extension } from "@tiptap/core";
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { onBeforeUnmount, watch } from "vue";
import {
    InputGroup,
    InputGroupAddon,
} from "@components/input-group";
import { CHAT_PLACEHOLDER } from "@constants/CHAT";
import { cn } from "@/lib/utils";

defineOptions({ inheritAttrs: false });

const props = defineProps({
    modelValue: { type: String, default: "" },
    placeholder: { type: String, default: CHAT_PLACEHOLDER },
    disabled: { type: Boolean, default: false },
    class: {
        type: [Boolean, null, String, Object, Array],
        required: false,
        skipCheck: true,
    },
});

const emit = defineEmits(["update:modelValue", "submit"]);

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function textToHtml(text) {
    if (!text) return "<p></p>";
    return `<p>${text.split("\n").map(escapeHtml).join("<br>")}</p>`;
}

const SubmitOnEnter = Extension.create({
    name: "submitOnEnter",
    priority: 1000,
    addKeyboardShortcuts() {
        return {
            Enter: () => {
                emit("submit");
                return true;
            },
        };
    },
});

const editor = useEditor({
    content: textToHtml(props.modelValue),
    editable: !props.disabled,
    extensions: [
        StarterKit.configure({
            heading: false,
            bulletList: false,
            orderedList: false,
            listItem: false,
            blockquote: false,
            codeBlock: false,
            horizontalRule: false,
            bold: false,
            italic: false,
            strike: false,
            underline: false,
            code: false,
            link: false,
        }),
        Placeholder.configure({ placeholder: props.placeholder }),
        SubmitOnEnter,
    ],
    editorProps: {
        attributes: {
            class: "chat-input-editor text-paragraph-10 text-white outline-none",
            "data-slot": "input-group-control",
        },
    },
    onUpdate: ({ editor: instance }) => {
        emit("update:modelValue", instance.getText());
    },
});

watch(
    () => props.disabled,
    (disabled) => {
        editor.value?.setEditable(!disabled);
    },
);

watch(
    () => props.modelValue,
    (value) => {
        if (value === editor.value?.getText()) return;
        editor.value?.commands.setContent(textToHtml(value), {
            emitUpdate: false,
        });
    },
);

function focusEditor() {
    editor.value?.commands.focus();
}

onBeforeUnmount(() => {
    editor.value?.destroy();
});

defineExpose({ focus: focusEditor });
</script>

<template>
    <InputGroup
        :class="
            cn(
                'gap-2 h-auto bg-app-bg border-input-border rounded-lg px-6 max-md:px-4 py-2 has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot=input-group-control]:focus-visible]:border-input-border',
                props.class,
            )
        "
        @click="focusEditor"
    >
        <InputGroupAddon v-if="$slots.start" align="inline-start">
            <slot name="start" />
        </InputGroupAddon>

        <EditorContent
            :editor="editor"
            class="chat-input-editor-wrapper flex-1 min-w-0 max-h-40 overflow-y-auto py-2"
        />

        <InputGroupAddon align="inline-end" class="pr-0">
            <slot name="end" />
        </InputGroupAddon>
    </InputGroup>
</template>

<style scoped>
.chat-input-editor-wrapper :deep(.tiptap) {
    outline: none;
}

.chat-input-editor-wrapper :deep(p.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
    color: rgb(255 255 255 / 0.55);
}
</style>
