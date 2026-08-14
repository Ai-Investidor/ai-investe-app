<script setup>
import { Skeleton } from "@/components/ui/skeleton";

defineProps({
	circular: {
		type: Boolean,
		default: false,
	},
});
</script>

<template>
	<div class="w-full rounded-md border border-card-border bg-black/25 px-3 py-3">
		<Skeleton class="h-4 w-32 bg-muted" />
		<Skeleton
			:class="
				circular
					? 'mx-auto mt-3 h-[300px] w-[300px] max-w-full bg-muted'
					: 'mt-3 h-[260px] w-full bg-muted'
			"
		/>
	</div>
</template>
