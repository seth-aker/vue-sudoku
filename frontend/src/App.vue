<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import NavHeader from './components/NavHeader.vue';
import { computed, watch } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { useUserStore } from '@/stores/userStore'
import LoadingOverlay from './components/LoadingOverlay.vue';
import { useSudokuStore } from './stores/sudokuStore';
const route = useRoute();
const { isAuthenticated, user, isLoading, getAccessTokenSilently } = useAuth0();
const sudokuStore = useSudokuStore();
const userStore = useUserStore();
const puzzleLoading = computed(() => {
  if (!route.path.includes('sudoku')) {
    return false
  }
  return sudokuStore.loading || isLoading.value
});
watch(isAuthenticated, async () => {
  if (isAuthenticated.value) {
    console.log("isAuthenticated run")
    userStore.name = user.value?.name;
    userStore.image = user.value?.picture,
    userStore.email = user.value?.email
    console.log(userStore.id)
    if(userStore.id === undefined) {
      const token = await getAccessTokenSilently()
      userStore.getUser(token)
    }
  }
})

</script>

<template>
  <div class="max-w-screen flex flex-col">
    <NavHeader />
    <RouterView :key="route.fullPath" />
    <LoadingOverlay v-if="puzzleLoading" />
  </div>
</template>
