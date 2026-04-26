import * as userService from '@/services/userService'
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from 'vue-router';

export interface IUser {
  id: string,
  displayName?: string,
  username: string,
  imageUrl?: string,
  currentPuzzle?: string,
  role: string
}
export const useUserStore = defineStore('userStore', () => {
  // state
  const id = ref<string | undefined>(undefined);
  const storeDisplayName = ref<string | undefined>();
  const storeUsername = ref<string | undefined>();
  const image = ref<string | undefined>();
  const role = ref<string | undefined>();
  const userLoading = ref<boolean>(false);
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
      // const sudokuStore = useSudokuStore()
      // sudokuStore.puzzleId = res.body.currentPuzzle
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
  // const updateUser = async (token: string | undefined) => {
  //   if(!token) {
  //     throw new Error("User not logged in")
  //   }
  //   const sudokuStore = useSudokuStore();
  //   const user = {
  //     name: name.value,
  //     email: userEmail.value,
  //     image: image.value,
  //     currentPuzzle: {
  //       _id: sudokuStore.puzzleId,
  //       cells: sudokuStore.puzzle.rows,
  //       difficulty: sudokuStore.puzzle.options.difficulty,
  //       solved: sudokuStore.isPuzzleSolved
  //     }
  //   }
  //   if(id.value === '' || id.value === undefined) {
  //     const res = await userService.getUser(id.value, token);
  //     id.value = res._id;
  //   }
  //   console.log(user)
  //   await userService.updateUser(id.value, token, user)
  //   console.log("User updated!")
  // }
  return { id, displayName: storeDisplayName, username: storeUsername, image, userLoading, isAuthenticated, error, login, logout, register, getSelf, $reset}

})
