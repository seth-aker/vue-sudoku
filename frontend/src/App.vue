<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavHeader from './components/NavHeader.vue';
import { ref, watch } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { useUserStore } from '@/stores/userStore'
import LoadingOverlay from './components/LoadingOverlay.vue';
import { useSudokuStore } from './stores/sudokuStore';
const { isAuthenticated, user, isLoading } = useAuth0();
const sudokuStore = useSudokuStore();
const userStore = useUserStore()

watch(isAuthenticated, () => {
  if (isAuthenticated.value) {
    userStore.$patch({
      id: user.value?.sub,
      name: user.value?.name,
      email: user.value?.email,
      image: user.value?.picture
    })
  }
})

</script>

<template>
  <div class="max-w-screen flex flex-col">
    <NavHeader />
    <RouterView />
    <LoadingOverlay v-if="sudokuStore.loading || isLoading" />
  </div>
</template>
