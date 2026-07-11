<script setup>
import { getSourceHostname } from "@utils/chatMessageParts.js";
import { ExternalLink } from "@lucide/vue";

defineProps({
	sources: {
		type: Array,
		default: () => [],
	},
});
</script>

<template>
	<div
		v-if="sources.length"
		class="flex w-full flex-col gap-2 border-t border-card-border pt-3"
	>
		<p class="text-paragraph-3 text-white/55">Fontes</p>

		<ul class="flex flex-col gap-2">
			<li v-for="source in sources" :key="source.id ?? source.url ?? source.title">
				<a
					v-if="source.url"
					:href="source.url"
					target="_blank"
					rel="noopener noreferrer"
					class="group flex items-start gap-2 rounded-md border border-card-border bg-black/25 px-3 py-2 transition-colors duration-200 hover:border-primary/60 hover:bg-black/40"
				>
					<ExternalLink
						class="mt-0.5 size-3.5 shrink-0 text-white/55 group-hover:text-primary"
						aria-hidden="true"
					/>
					<span class="min-w-0 flex-1">
						<span
							class="block text-paragraph-3 text-white/80 group-hover:text-white"
						>
							{{ source.title }}
						</span>
						<span class="block text-paragraph-1 text-white/45">
							{{ source.source ?? getSourceHostname(source.url) }}
						</span>
					</span>
				</a>

				<div
					v-else
					class="rounded-md border border-card-border bg-black/25 px-3 py-2"
				>
					<p class="text-paragraph-3 text-white/80">
						{{ source.title }}
					</p>
					<p v-if="source.source" class="text-paragraph-1 text-white/45">
						{{ source.source }}
					</p>
				</div>
			</li>
		</ul>
	</div>
</template>
