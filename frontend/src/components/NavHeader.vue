<script lang="ts" setup>
import { useAuth0, type AppState, type RedirectLoginOptions } from '@auth0/auth0-vue';
import Button from './ui/button/Button.vue';
import { useRouter } from 'vue-router';
import NavigationMenu from './ui/navigation-menu/NavigationMenu.vue';
import NavigationMenuList from './ui/navigation-menu/NavigationMenuList.vue';
import NavigationMenuItem from './ui/navigation-menu/NavigationMenuItem.vue';
import NavigationMenuTrigger from './ui/navigation-menu/NavigationMenuTrigger.vue';
import NavigationMenuLink from './ui/navigation-menu/NavigationMenuLink.vue';
import NavigationMenuContent from './ui/navigation-menu/NavigationMenuContent.vue';
const router = useRouter()
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
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>New Puzzle</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink as-child>
                <RouterLink :to="{ name: 'easy' }">Easy</RouterLink>
              </NavigationMenuLink>
              <NavigationMenuLink as-child>
                <RouterLink :to="{ name: 'medium' }">Medium</RouterLink>
              </NavigationMenuLink>
              <NavigationMenuLink as-child>
                <RouterLink :to="{ name: 'hard' }">Hard</RouterLink>
              </NavigationMenuLink>
              <NavigationMenuLink as-child>
                <RouterLink :to="{ name: 'impossible' }">Impossible</RouterLink>
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink as-child>
              <Button class="mx-2" variant="ghost" @click="router.push({ name: 'home' })">Home</Button>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink as-child>
              <Button v-if="!isAuthenticated" :disabled="isLoading"
                @click="loginWithRedirect(loginOptions)">Login</Button>
              <Button v-else @click="logout()">Logout</Button>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

    </div>
  </header>
</template>
