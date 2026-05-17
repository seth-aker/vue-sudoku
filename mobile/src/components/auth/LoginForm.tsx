import { useState } from 'react'
import { Text, View } from 'react-native'
import { Button, Input, PasswordInput } from '@/components/ui'
import { toast, useUserStore } from '@/stores'
import { loginSchema } from '@/validation'
import { makeStyles } from '@/theme'

interface LoginFormProps {
  onSuccess?: () => void
}

/**
 * Mirrors the web's LoginForm.vue:
 *   - "Login" legend + horizontal separator
 *   - Username field (placeholder "email@example.com")
 *   - Password field with press-and-hold eye reveal
 *   - Right-aligned orange-400 submit
 */
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
      toast.success(`Welcome back!`)
      onSuccess?.()
    } else {
      toast.error(result.message ?? 'Sign-in failed')
    }
  }

  return (
    <View style={styles.form}>
      <View style={styles.legendRow}>
        <Text style={styles.legend}>Login</Text>
        <View style={styles.separator} />
      </View>

      <Input
        label="Username"
        value={username}
        onChangeText={setUsername}
        placeholder="email@example.com"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="username"
        autoComplete="username"
        errorText={errors.username}
        editable={!loading}
      />
      <PasswordInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        textContentType="password"
        autoComplete="current-password"
        errorText={errors.password}
        editable={!loading}
      />

      <View style={styles.actions}>
        <Button label="Submit" variant="brand" loading={loading} onPress={onSubmit} style={styles.submit} />
      </View>
    </View>
  )
}

const useStyles = makeStyles((t) => ({
  form: {
    gap: t.spacing[3],
  },
  legendRow: {
    flexDirection: 'column',
  },
  legend: {
    fontSize: t.text.base,
    fontWeight: '600',
    color: t.colors.foreground,
  },
  separator: {
    height: 1,
    backgroundColor: t.colors.border,
    marginTop: t.spacing[2],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: t.spacing[2],
  },
  submit: {
    width: 80,
  },
}))
