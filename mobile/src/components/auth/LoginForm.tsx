import { useState } from 'react'
import { View } from 'react-native'
import { Button, Input } from '@/components/ui'
import { toast, useUserStore } from '@/stores'
import { loginSchema } from '@/validation'
import { makeStyles } from '@/theme'

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const styles = useStyles()
  const loading = useUserStore((s) => s.loading)
  const login = useUserStore((s) => s.login)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({})

  const onSubmit = async () => {
    const parsed = loginSchema.safeParse({ username, password })
    if (!parsed.success) {
      const fieldErrors: typeof errors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (key === 'username' || key === 'password') fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    const result = await login(parsed.data.username, parsed.data.password)
    if (result.ok) {
      toast.success('Signed in')
      onSuccess?.()
    } else {
      toast.error(result.message ?? 'Sign-in failed')
    }
  }

  return (
    <View style={styles.form}>
      <Input
        label="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="username"
        autoComplete="username"
        errorText={errors.username}
        editable={!loading}
      />
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        textContentType="password"
        autoComplete="current-password"
        errorText={errors.password}
        editable={!loading}
      />
      <Button label="Sign in" variant="primary" loading={loading} onPress={onSubmit} fullWidth />
    </View>
  )
}

const useStyles = makeStyles((t) => ({
  form: {
    gap: t.spacing[3],
  },
}))
