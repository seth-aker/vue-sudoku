import { ScrollView, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';

import { README_MARKDOWN } from '@/src/content/readme';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function AboutScreen() {
  const { theme } = useTheme();
  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}>
      <Markdown
        style={{
          body: { color: theme.colors.text, fontSize: 15 },
          heading1: {
            color: theme.colors.text,
            fontSize: 26,
            fontWeight: 'bold',
            marginTop: 12,
            marginBottom: 6,
          },
          heading2: {
            color: theme.colors.text,
            fontSize: 20,
            fontWeight: 'bold',
            marginTop: 14,
            marginBottom: 4,
          },
          link: { color: theme.colors.accent },
          bullet_list: { marginVertical: 6 },
          code_inline: {
            backgroundColor: theme.colors.surfaceAlt,
            color: theme.colors.text,
          },
        }}>
        {README_MARKDOWN}
      </Markdown>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
});
