import { useAuth0 } from "@auth0/auth0-vue";
import * as userService from '@/services/userService'
import { defineStore } from "pinia";
import { ref } from "vue";
import { useSudokuStore } from "./sudokuStore";

export const useUserStore = defineStore('userStore', () => {
  // state
  const id = ref('');
  const name = ref('');
  const email = ref('');
  const image = ref('');

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
    }
    await userService.updateUser(id.value, token, user)
    console.log("User updated!")
  }
  return { id, name, email, image, updateUser}

})
