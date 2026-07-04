<script setup>
import AuthBranding from "@/components/AuthBranding/AuthBranding.vue";
import ViewRecoverForm from "@views/Recover/ViewRecoverForm.vue";
</script>

<template>
    <div
        class="relative flex w-full flex-col lg:h-screen lg:overflow-hidden max-lg:min-h-screen max-lg:items-center max-lg:justify-center max-lg:px-6"
    >
        <AuthBranding />
        <ViewRecoverForm />
    </div>
</template>
