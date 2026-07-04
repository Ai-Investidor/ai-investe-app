<script setup>
import AuthBranding from "@/components/AuthBranding/AuthBranding.vue";
import ViewSignupForm from "@views/Signup/ViewSignupForm.vue";
</script>

<template>
    <main
        class="relative flex w-full flex-col lg:h-screen lg:overflow-hidden max-lg:min-h-screen max-lg:items-center max-lg:justify-center max-lg:px-6 max-lg:py-10"
    >
        <AuthBranding />
        <ViewSignupForm />
    </main>
</template>
