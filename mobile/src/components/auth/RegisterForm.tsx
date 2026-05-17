import { useState } from 'react'
import { Text, View } from 'react-native'
import { Button, Input, PasswordInput } from '@/components/ui'
import { toast, useUserStore } from '@/stores'
import { registerSchema } from '@/validation'
import { makeStyles } from '@/theme'

interface RegisterFormProps {
  onSuccess?: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const styles = useStyles()
  const loading = useUserStore((s) => s.loading)
  const register = useUserStore((s) => s.register)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [errors, setErrors] = useState<{ username?: string; password?: string; displayName?: string }>({})

  const onSubmit = async () => {
    const parsed = registerSchema.safeParse({
      username,
      password,
      displayName: displayName || undefined,
    })
    if (!parsed.success) {
      const fieldErrors: typeof errors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (key === 'username' || key === 'password' || key === 'displayName') {
          fieldErrors[key] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    const result = await register(parsed.data.username, parsed.data.password, parsed.data.displayName)
    if (result.ok) {
      toast.success('Account created')
      onSuccess?.()
    } else {
      toast.error(result.message ?? 'Registration failed')
    }
  }

  return (
    <View style={styles.form}>
      <View style={styles.legendRow}>
        <Text style={styles.legend}>Register</Text>
        <View style={styles.separator} />
      </View>

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
        label="Display name (optional)"
        value={displayName}
        onChangeText={setDisplayName}
        autoCapitalize="words"
        autoCorrect={false}
        errorText={errors.displayName}
        editable={!loading}
      />
      <PasswordInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        textContentType="newPassword"
        autoComplete="new-password"
        helperText="8+ chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character"
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
