<script setup>
import AuthBranding from "@/components/AuthBranding/AuthBranding.vue";
import ViewLoginForm from "@views/Login/ViewLoginForm.vue";
</script>

<template>
    <main
        class="relative flex w-full flex-col lg:h-screen lg:overflow-hidden max-lg:min-h-screen max-lg:items-center max-lg:justify-center max-lg:px-6"
    >
        <AuthBranding />
        <ViewLoginForm />
    </main>
</template>
