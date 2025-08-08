<script lang="ts" setup>
import { useAuth0, type AppState, type RedirectLoginOptions } from '@auth0/auth0-vue';
import Button from './ui/button/Button.vue';
const { isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();
const loginOptions: RedirectLoginOptions<AppState> = {
  openUrl(url) {
    window.location.replace(url)
  }
}
</script>

<template>
  <header class="w-full p-4 flex justify-between border-b shadow mb-1">
    <h1 class="text-3xl">Vue Sudoku</h1>
    <div>
      <Button v-if="!isAuthenticated" :disabled="isLoading" @click="loginWithRedirect(loginOptions)">Login</Button>
      <Button v-else @click="logout()">Logout</Button>
    </div>
  </header>
</template>
