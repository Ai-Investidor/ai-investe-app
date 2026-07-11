<script setup>
import { cn } from "@lib/utils";
import { Check, LoaderCircle, Search, TriangleAlert } from "@lucide/vue";
import { computed } from "vue";

const props = defineProps({
	tools: {
		type: Array,
		default: () => [],
	},
});

const visibleTools = computed(() =>
	props.tools.filter((tool) => tool.status !== "done"),
);

function statusIcon(status) {
	if (status === "running") return LoaderCircle;
	if (status === "error") return TriangleAlert;
	return Check;
}
</script>

<template>
	<ul v-if="visibleTools.length" class="flex w-full flex-col gap-2">
		<li
			v-for="tool in visibleTools"
			:key="tool.id"
			class="flex items-center gap-2 rounded-md border border-card-border bg-black/25 px-3 py-2"
		>
			<Search class="size-3.5 shrink-0 text-white/55" aria-hidden="true" />
			<span class="min-w-0 flex-1 text-paragraph-3 text-white/70">
				{{ tool.label }}
			</span>
			<component
				:is="statusIcon(tool.status)"
				:class="
					cn(
						'size-3.5 shrink-0',
						tool.status === 'running' &&
							'text-primary animate-spin',
						tool.status === 'error' && 'text-destructive',
						tool.status === 'done' && 'text-primary',
					)
				"
				aria-hidden="true"
			/>
		</li>
	</ul>
</template>
