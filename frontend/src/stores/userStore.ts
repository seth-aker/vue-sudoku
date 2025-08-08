import { defineStore } from "pinia";

export const useUserStore = defineStore('userStore', {
  state: () => ({
    id: '',
    name: '',
    email: '',
    image: '',
  }),
  actions: {

  },
})
