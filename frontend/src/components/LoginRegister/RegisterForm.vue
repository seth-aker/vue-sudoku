<script setup lang="ts">
import { useUserStore } from '@/stores/userStore'
import { useMousePressed } from '@vueuse/core'
import { ref, useTemplateRef } from 'vue'
import FieldGroup from '../ui/field/FieldGroup.vue'
import FieldSet from '../ui/field/FieldSet.vue'
import FieldLegend from '../ui/field/FieldLegend.vue'
import Separator from '../ui/separator/Separator.vue'
import Field from '../ui/field/Field.vue'
import FieldLabel from '../ui/field/FieldLabel.vue'
import Input from '../ui/input/Input.vue'
import InputGroup from '../ui/input-group/InputGroup.vue'
import InputGroupInput from '../ui/input-group/InputGroupInput.vue'
import InputGroupAddon from '../ui/input-group/InputGroupAddon.vue'
import InputGroupButton from '../ui/input-group/InputGroupButton.vue'
import { Icon } from '@iconify/vue'
import Button from '../ui/button/Button.vue'

const popoverOpen = defineModel<boolean>('popover-open', {required: true})
const userStore = useUserStore()

const email = ref<string>('')
const password = ref<string>('');
const confirmPassword = ref<string>('');
  
const handleRegister = async (event: SubmitEvent) => {
  event.preventDefault()
  await userStore
}
const showPasswordRef = useTemplateRef('show-password')
const { pressed: showPassword } = useMousePressed({target: showPasswordRef});

const showConfirmPasswordRef = useTemplateRef('show-confirm-password')
const { pressed: showConfirmPassword} = useMousePressed({target: showConfirmPasswordRef})
</script>

<template>

<form v-on:submit="handleRegister">
      <FieldGroup>
              <FieldSet>
                <FieldLegend class="mb-0">Signup</FieldLegend>
                <Separator />
                <FieldGroup>
                  <Field>
                    <FieldLabel>Name</FieldLabel>
                    <Input />
                  </Field>
                  <Field>
                    <FieldLabel for="email">Email</FieldLabel>
                    <Input id="email" v-model:model-value="email" type="text" placeholder="email@example.com" autocomplete="username" required />
                  </Field>
                  <Field>
                    <FieldLabel for="password">Password</FieldLabel>
              <InputGroup>
                <InputGroupInput id="password" v-model:model-value="password" :type="showPassword ? 'text': 'password'" required />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton ref="show-password" type="button" >
                    <Icon :icon="showPassword ? 'radix-icons:eye-open': 'radix-icons:eye-closed'" />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel for="confirm-password">Confirm Password</FieldLabel>
              <InputGroup>
              <InputGroupInput id="confirm-password" v-model:model-value="confirmPassword" :type="showConfirmPassword ? 'text': 'password'" required />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton ref="show-confirm-password" type="button" >
                    <Icon :icon="showConfirmPassword ? 'radix-icons:eye-open': 'radix-icons:eye-closed'" />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </FieldGroup>
        </FieldSet>
        <Field orientation="horizontal" class="justify-end">
          <Button type="submit" v-if="!userStore.userLoading" class="bg-orange-400 hover:bg-orange-400/60">Create Account</Button>
          <Button v-else>
            <Icon icon="line-md:loading-twotone-loop" />
          </Button>
        </Field>
      </FieldGroup>
    </form>
</template>