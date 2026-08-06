<script setup>
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@components/dropdown-menu";
import { InputGroupButton } from "@components/input-group";
import { useChatAttachments } from "@composables/useChatAttachments";
import {
	CHAT_DOC_ACCEPT,
	CHAT_IMAGE_ACCEPT,
	CHAT_PLACEHOLDER,
} from "@constants/CHAT";
import { cn } from "@lib/utils";
import { A11y, FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import { computed, nextTick, ref, watch } from "vue";
import ChatInput from "@/components/ChatInput/ChatInput.vue";
import AttachDoc from "@/components/icons/AttachDoc.vue";
import AttachImage from "@/components/icons/AttachImage.vue";
import FilePlus from "@/components/icons/FilePlus.vue";
import Send from "@/components/icons/Send.vue";
import "swiper/css";

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

const {
	docInputRef,
	imageInputRef,
	attachedFiles,
	openDocPicker,
	openImagePicker,
	handleFileChange,
	removeAttachedFile,
	clearAttachedFiles,
} = useChatAttachments();

const attachedFilesSwiperModules = [A11y, FreeMode];

const attachedFilesFreeMode = {
	enabled: true,
	momentum: true,
	momentumRatio: 1.25,
	momentumVelocityRatio: 1.25,
	momentumBounce: false,
	sticky: false,
	minimumVelocity: 0.02,
};

const attachedFilesSwiper = ref(null);

const canSubmit = computed(
	() =>
		(props.modelValue.trim().length > 0 || attachedFiles.value.length > 0) &&
		!props.disabled,
);

function refreshAttachedFilesSwiper() {
	if (attachedFiles.value.length === 0) return;

	const swiper = attachedFilesSwiper.value;
	if (!swiper || swiper.destroyed) return;

	requestAnimationFrame(() => {
		const instance = attachedFilesSwiper.value;
		if (!instance || instance.destroyed || attachedFiles.value.length === 0) {
			return;
		}

		instance.update();
		instance.updateSize();
		instance.updateSlides();
		instance.updateProgress();
	});
}

function onAttachedFilesSwiper(swiper) {
	attachedFilesSwiper.value = swiper;
	nextTick(refreshAttachedFilesSwiper);
}

function onAttachedFilesSwiperDestroy() {
	attachedFilesSwiper.value = null;
}

function handleSubmit() {
	if (!canSubmit.value) return;

	emit("submit", [...attachedFiles.value]);
	clearAttachedFiles();
}

watch(
	attachedFiles,
	(files) => {
		if (!files.length) {
			attachedFilesSwiper.value = null;
			return;
		}

		nextTick(refreshAttachedFilesSwiper);
	},
	{ deep: true },
);
</script>

<template>
	<input
		ref="docInputRef"
		type="file"
		multiple
		class="sr-only"
		:accept="CHAT_DOC_ACCEPT"
		:disabled="disabled"
		@change="handleFileChange"
	/>

	<input
		ref="imageInputRef"
		type="file"
		multiple
		class="sr-only"
		:accept="CHAT_IMAGE_ACCEPT"
		:disabled="disabled"
		@change="handleFileChange"
	/>

	<div
		v-if="attachedFiles.length"
		data-lenis-prevent
		:class="cn('shrink-0 overflow-hidden [contain:inline-size]', props.class)"
		aria-label="Arquivos anexados"
	>
		<Swiper
			:modules="attachedFilesSwiperModules"
			slides-per-view="auto"
			:space-between="8"
			:free-mode="attachedFilesFreeMode"
			:watch-overflow="false"
			:threshold="5"
			:touch-angle="30"
			touch-release-on-edges
			grab-cursor
			:observer="true"
			:observe-slide-children="true"
			no-swiping-selector="button"
			class="w-full max-w-full overflow-hidden"
			@swiper="onAttachedFilesSwiper"
			@destroy="onAttachedFilesSwiperDestroy"
		>
			<SwiperSlide
				v-for="(file, index) in attachedFiles"
				:key="`${file.name}-${file.lastModified}-${index}`"
				class="!box-border !w-36 max-md:!w-28"
			>
				<div
					class="flex w-full min-w-0 items-center gap-2 rounded-md border border-card-border bg-gradient-to-r from-black to-surface-2 px-3 py-1.5"
				>
					<span class="min-w-0 flex-1 truncate text-paragraph-3 text-white/70">
						{{ file.name }}
					</span>
					<button
						type="button"
						class="text-paragraph-3 text-white/55 hover:text-white shrink-0 cursor-pointer"
						:aria-label="`Remover ${file.name}`"
						@click="removeAttachedFile(index)"
					>
						×
					</button>
				</div>
			</SwiperSlide>
		</Swiper>
	</div>

	<ChatInput
		:model-value="modelValue"
		:placeholder="placeholder"
		:disabled="disabled"
		:class="cn('shrink-0', props.class)"
		@update:model-value="emit('update:modelValue', $event)"
		@submit="handleSubmit"
	>
		<template #start>
			<DropdownMenu>
				<DropdownMenuTrigger as-child>
					<button
						type="button"
						aria-label="Anexar"
						class="flex items-center justify-center text-white/55 hover:text-white cursor-pointer disabled:pointer-events-none disabled:opacity-50"
						:disabled="disabled"
					>
						<FilePlus class="size-4" aria-hidden="true" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" class="min-w-40">
					<DropdownMenuItem
						class="gap-2 hover:cursor-pointer"
						:disabled="disabled"
						@select="openDocPicker"
					>
						<AttachDoc class="size-4 shrink-0" aria-hidden="true" />
						Documento
					</DropdownMenuItem>
					<DropdownMenuItem
						class="gap-2 hover:cursor-pointer"
						:disabled="disabled"
						@select="openImagePicker"
					>
						<AttachImage class="size-4 shrink-0" aria-hidden="true" />
						Imagem
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</template>

		<template #end>
			<InputGroupButton
				size="sm"
				aria-label="Enviar mensagem"
				class="bg-btn-light hover:bg-white hover:text-black text-black rounded-lg px-3 py-1.5 text-paragraph-4 h-auto cursor-pointer transition-colors"
				:disabled="!canSubmit"
				@click="handleSubmit"
			>
				<Send class="size-4" aria-hidden="true" />
			</InputGroupButton>
		</template>
	</ChatInput>

	<p
		:class="
			cn(
				'shrink-0 px-2 text-paragraph-1 text-white/25 text-center tracking-ui text-nowrap max-md:text-wrap',
				props.class,
			)
		"
	>
		AI invest é uma IA e pode cometer erros.
	</p>
</template>
