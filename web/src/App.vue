<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from '@/components/AppLayout.vue';
import ToastContainer from '@/components/ToastContainer.vue';

const route = useRoute();
const semLayout = computed(() => route.meta.publica === true);
</script>

<template>
  <ToastContainer />
  <template v-if="semLayout">
    <RouterView />
  </template>
  <AppLayout v-else>
    <RouterView />
  </AppLayout>
</template>
