import { useAuth0 } from "@auth0/auth0-vue";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore('userStore', () => {
  // state
  const id = ref('');
  const name = ref('');
  const email = ref('');
  const image = ref('');

  const requestAccessToken = async () => {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
    if(isAuthenticated) {
      const token = await getAccessTokenSilently();
      return token;
    }
    return undefined;
  }

  return { id, name, email, image, requestAccessToken}
  // {
  // state: () => ({
  //   id: '',
  //   name: '',
  //   email: '',
  //   image: '',
  // }),
  // actions: {

  // },
})
