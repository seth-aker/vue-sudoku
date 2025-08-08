<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavHeader from './components/NavHeader.vue';
import { watch } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { useUserStore } from '@/stores/userStore'
import { useSudokuStore } from '@/stores/sudokuStore'
const { isAuthenticated, user } = useAuth0();
const userStore = useUserStore()
const sudokuStore = useSudokuStore();
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
  </div>
</template>
