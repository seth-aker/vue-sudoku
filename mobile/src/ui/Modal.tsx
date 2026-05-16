import {
  Modal as RNModal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { useTheme } from '@/src/theme/ThemeProvider';

import { ThemedText } from './ThemedText';

interface Props {
  visible: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  /** Tap outside to dismiss (default true). */
  dismissable?: boolean;
}

export function Modal({
  visible,
  onClose,
  title,
  description,
  children,
  footer,
  dismissable = true,
}: Props) {
  const { theme } = useTheme();
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable
        style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}
        onPress={dismissable ? onClose : undefined}>
        <Pressable
          // Stop propagation so taps inside don't dismiss.
          onPress={() => {}}
          style={[
            styles.content,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.lg,
            },
          ]}>
          {title ? (
            <ThemedText variant="subtitle" style={styles.title}>
              {title}
            </ThemedText>
          ) : null}
          {description ? (
            <ThemedText variant="muted" style={styles.desc}>
              {description}
            </ThemedText>
          ) : null}
          {children}
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  content: { width: '100%', maxWidth: 420, borderWidth: 1, padding: 20, gap: 6 },
  title: { marginBottom: 2 },
  desc: { marginBottom: 8 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
});
