import * as userService from '@/services/userService'
import { defineStore } from "pinia";
import { ref } from "vue";
import { useSudokuStore } from "./sudokuStore";

export const useUserStore = defineStore('userStore', () => {
  // state
  const id = ref<string | undefined>(undefined);
  const name = ref<string | undefined>();
  const email = ref<string | undefined>();
  const image = ref<string | undefined>();

  const getUser = async (token: string | undefined) => {
    if(!token) {
      throw new Error("User not logged in")
    }
    const res = await userService.getUser(id.value, token);
    console.log(res)
    id.value = res._id
  }
  const updateUser = async (token: string | undefined) => {
    if(!token) {
      throw new Error("User not logged in")
    }
    const sudokuStore = useSudokuStore();
    const user = {
      name: name.value,
      email: email.value,
      image: image.value,
      currentPuzzle: {
        cells: sudokuStore.puzzle.rows,
        difficulty: sudokuStore.puzzle.options.difficulty,
        solved: sudokuStore.isPuzzleSolved
      }
    }
    if(id.value === '' || id.value === undefined) {
      const res = await userService.getUser(id.value, token);
      console.log(res)
      id.value = res._id;
    }
    await userService.updateUser(id.value, token, user)
    console.log("User updated!")
  }
  return { id, name, email, image, getUser, updateUser}

})
