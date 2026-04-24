<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import NavHeader from './components/NavHeader.vue';
import { onMounted } from 'vue';
import { useUserStore } from './stores/userStore';

const route = useRoute();
const userStore = useUserStore();

onMounted(() => {
  document.documentElement.style.touchAction = 'manipulation';
  userStore.getSelf()
})
</script>

<template>
  <div class="max-w-screen flex flex-col h-full">
    <NavHeader />
    <RouterView :key="route.fullPath" />
  </div>
</template>
