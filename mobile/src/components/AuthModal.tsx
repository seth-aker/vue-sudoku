import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { validatePassword, validateUsername } from '@/src/lib/validation';
import { useUserStore } from '@/src/store/userStore';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Button, Modal, TextField, ThemedText } from '@/src/ui';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AuthModal({ visible, onClose }: Props) {
  const { theme } = useTheme();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string>();

  const loading = useUserStore((s) => s.userLoading);
  const login = useUserStore((s) => s.login);
  const register = useUserStore((s) => s.register);

  const reset = () => {
    setUsername('');
    setPassword('');
    setDisplayName('');
    setError(undefined);
  };

  const submit = async () => {
    const uErr = validateUsername(username);
    const pErr = validatePassword(password);
    if (uErr || pErr) {
      setError(uErr ?? pErr);
      return;
    }
    setError(undefined);
    if (mode === 'login') {
      await login(username, password);
    } else {
      await register(username, password, displayName || undefined);
    }
    const { isAuthenticated, error: storeErr } = useUserStore.getState();
    if (isAuthenticated()) {
      Toast.show({ type: 'success', text1: 'Welcome!' });
      reset();
      onClose();
    } else {
      setError(storeErr ?? 'Authentication failed');
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={mode === 'login' ? 'Login' : 'Sign up'}>
      <View style={styles.tabs}>
        <Button
          title="Login"
          variant={mode === 'login' ? 'primary' : 'ghost'}
          size="sm"
          onPress={() => setMode('login')}
        />
        <Button
          title="Sign up"
          variant={mode === 'register' ? 'primary' : 'ghost'}
          size="sm"
          onPress={() => setMode('register')}
        />
      </View>

      <View style={styles.form}>
        {mode === 'register' ? (
          <TextField
            label="Display name (optional)"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />
        ) : null}
        <TextField
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoComplete="username"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPw}
          autoCapitalize="none"
          rightSlot={
            <Ionicons
              name={showPw ? 'eye' : 'eye-off'}
              size={18}
              color={theme.colors.textMuted}
              onPress={() => setShowPw((v) => !v)}
            />
          }
        />
        {error ? (
          <ThemedText
            variant="muted"
            style={{ color: theme.colors.danger }}>
            {error}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Button title="Cancel" variant="ghost" onPress={onClose} />
        <Button
          title={mode === 'login' ? 'Login' : 'Create account'}
          onPress={submit}
          loading={loading}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  form: { gap: 12 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
});
