<script setup>
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { inputGroupButtonVariants } from ".";

const props = defineProps({
  variant: { type: String, required: false, default: "ghost" },
  size: { type: String, required: false, default: "xs" },
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
});
</script>

<template>
  <Button
    :data-size="props.size"
    :variant="props.variant"
    :class="cn(inputGroupButtonVariants({ size: props.size }), props.class)"
  >
    <slot />
  </Button>
</template>
