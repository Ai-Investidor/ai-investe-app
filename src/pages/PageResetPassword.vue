<script setup>
import AuthBranding from "@/components/AuthBranding/AuthBranding.vue";
import ViewResetPasswordForm from "@views/ResetPassword/ViewResetPasswordForm.vue";
</script>

<template>
    <div
        class="relative flex w-full flex-col lg:h-screen lg:overflow-hidden max-lg:min-h-screen max-lg:items-center max-lg:justify-center max-lg:px-6"
    >
        <AuthBranding />
        <ViewResetPasswordForm />
    </div>
</template>
