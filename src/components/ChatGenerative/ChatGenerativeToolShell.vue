<script setup>
defineProps({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		default: "",
	},
});
</script>

<template>
	<div
		class="w-full rounded-md border border-card-border bg-black/25 px-3 py-3"
	>
		<p class="text-paragraph-3 text-white/80">
			{{ title }}
		</p>
		<p v-if="description" class="mt-1 text-paragraph-1 text-white/45">
			{{ description }}
		</p>
		<slot />
	</div>
</template>
