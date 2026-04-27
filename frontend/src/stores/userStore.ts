import { deserializeUserPuzzle, type UserPuzzleDto } from '@/services/sudokuService';
import * as userService from '@/services/userService'
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from 'vue-router';
import { useSudokuStore } from './sudokuStore';
import { deserializeAction } from '@/utils/serialization';

export interface IUserDto {
  id: string,
  displayName?: string,
  username: string,
  imageUrl?: string,
  currentPuzzle?: UserPuzzleDto
  role: string
}
export const useUserStore = defineStore('userStore', () => {
  const sudokuStore = useSudokuStore()
  // state
  const id = ref<string | undefined>(undefined);
  const storeDisplayName = ref<string | undefined>();
  const storeUsername = ref<string | undefined>();
  const image = ref<string | undefined>();
  const role = ref<string | undefined>();
  const userLoading = ref<boolean>(false);
  const currentPuzzleId = ref<string |undefined>(undefined)

  const error = ref<string | undefined>(undefined);

  const isAuthenticated = computed(() => !!id.value)

  const router = useRouter()

  const login = async (username: string, password: string) => {
    error.value = undefined;
    userLoading.value = true;
    const res = await userService.login(username, password);
    if(!res.success || !res.body) {
      error.value = res.message
      userLoading.value = false
    } else {
      id.value = res.body.id,
      storeDisplayName.value = res.body.displayName
      storeUsername.value = res.body.username
      role.value = res.body.role
      image.value = res.body.imageUrl
      userLoading.value = false
      currentPuzzleId.value = res.body.currentPuzzle?._id
      if(res.body.currentPuzzle) {
        sudokuStore.puzzle = deserializeUserPuzzle(res.body.currentPuzzle)
        sudokuStore.puzzleId = res.body.currentPuzzle._id
        sudokuStore.actions = res.body.currentPuzzle.actions ? res.body.currentPuzzle.actions.map(each => deserializeAction(each)) : []
        sudokuStore.saveGameStateLocal()
      }
    }
  }
  const logout = async () => {
    userLoading.value = true
    const res = await userService.logout()
    if(!res.success) {
      error.value = `An error occured logging out, please try again. ${res.message}`
    }
    $reset()
    router.push({name: 'home'})
  }

  const register = async (username: string, password: string, displayName?: string) => {
    userLoading.value = true;
    const res = await userService.register(username, password, displayName);
    if(!res.success || !res.body) {
      error.value = `An error occured attempting to register, please try again. ${res.message}`
    } else {
      id.value = res.body.id
      storeUsername.value = username
      storeDisplayName.value = displayName
      role.value = res.body.role
    }
    userLoading.value = false
    
  }
  const getSelf = async () => {
    userLoading.value = true;
    const res = await userService.checkSession();
    const user = res.body
    if(res.success && user) {
      id.value = user.id
      storeDisplayName.value = user.displayName,
      storeUsername.value = user.username,
      role.value = user.role,
      image.value = user.imageUrl
      currentPuzzleId.value = user.currentPuzzle?._id
      if(user.currentPuzzle) {
        sudokuStore.puzzleId = user.currentPuzzle._id
        sudokuStore.puzzle = deserializeUserPuzzle(user.currentPuzzle)
        sudokuStore.actions = user.currentPuzzle.actions ? user.currentPuzzle.actions.map(each => deserializeAction(each)) : []
        sudokuStore.saveGameStateLocal()
      }
    }
    userLoading.value = false;
  }  

  const $reset = () => {
    id.value = undefined,
    storeDisplayName.value = undefined,
    storeUsername.value = undefined,
    image.value = undefined,
    role.value = undefined,
    userLoading.value = false,
    error.value = undefined
  }
  
  return { id, displayName: storeDisplayName, username: storeUsername, image, userLoading, isAuthenticated, error, login, logout, register, getSelf, $reset}

})
