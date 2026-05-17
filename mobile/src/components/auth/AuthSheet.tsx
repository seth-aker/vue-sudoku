import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { makeStyles, useTheme } from '@/theme'

type Tab = 'login' | 'register'

interface AuthSheetProps {
  visible: boolean
  onClose: () => void
  /** Which tab to show first. Defaults to login. */
  initialTab?: Tab
}

/**
 * Bottom-sheet style modal hosting LoginForm + RegisterForm under a tab
 * switcher. Phase 5 will refine the slide-up animation; for Phase 4 we use
 * React Native's built-in `<Modal animationType="slide">` which is good
 * enough.
 */
export function AuthSheet({ visible, onClose, initialTab = 'login' }: AuthSheetProps) {
  const styles = useStyles()
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const [tab, setTab] = useState<Tab>(initialTab)

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Empty pressable: tapping backdrop closes. */}
      </Pressable>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kbWrap}
        pointerEvents="box-none"
      >
        <View style={[styles.sheet, { paddingBottom: insets.bottom + theme.spacing[4] }]}>
          <View style={styles.handle} />
          <View style={styles.tabs}>
            <TabButton label="Sign in" active={tab === 'login'} onPress={() => setTab('login')} />
            <TabButton label="Sign up" active={tab === 'register'} onPress={() => setTab('register')} />
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {tab === 'login' ? (
              <LoginForm onSuccess={onClose} />
            ) : (
              <RegisterForm onSuccess={onClose} />
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  const { theme } = useTheme()
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: theme.spacing[3],
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: active ? theme.colors.primary : 'transparent',
      }}
    >
      <Text
        style={{
          color: active ? theme.colors.foreground : theme.colors.mutedForeground,
          fontSize: theme.text.base,
          fontWeight: active ? '700' : '500',
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}

const useStyles = makeStyles((t) => ({
  backdrop: {
    ...({
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    } as const),
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  kbWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: t.colors.card,
    borderTopLeftRadius: t.radius.xl,
    borderTopRightRadius: t.radius.xl,
    paddingHorizontal: t.spacing[5],
    paddingTop: t.spacing[3],
    borderTopWidth: 1,
    borderColor: t.colors.border,
    maxHeight: '90%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: t.colors.border,
    marginBottom: t.spacing[3],
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: t.spacing[4],
  },
  body: {
    paddingBottom: t.spacing[4],
  },
}))
