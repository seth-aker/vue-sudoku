<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import Field from '@/components/ui/field/Field.vue';
import FieldGroup from '@/components/ui/field/FieldGroup.vue';
import FieldLabel from '@/components/ui/field/FieldLabel.vue';
import FieldLegend from '@/components/ui/field/FieldLegend.vue';
import FieldSet from '@/components/ui/field/FieldSet.vue';
import Input from '@/components/ui/input/Input.vue';
import { useUserStore } from '@/stores/userStore';
import { ref } from 'vue';

const userStore = useUserStore()
const email = ref<string>('')
const password = ref<string>('');

</script>

<template>
  <div class="w-full flex justify-center">
    <form class="max-w-md min-w-sm" v-on:submit="(event) => {
      event.preventDefault(); userStore.login(email, password)
    }">
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Login</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel for="email">Email</FieldLabel>
              <Input id="email" v-model:model-value="email" type="text" placeholder="email@example.com" required />
            </Field>
            <Field>
              <FieldLabel for="password">Password</FieldLabel>
              <Input id="password" v-model:model-value="password" type="password" required />
            </Field>
          </FieldGroup>
        </FieldSet>
        <Field orientation="horizontal">
          <Button>Submit</Button>
        </Field>
      </FieldGroup>
    </form>
  </div>
</template>
