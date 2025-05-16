import ParallaxScrollView from '@/components/ParallaxScrollView';
import Price from '@/components/Price';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ParallaxScrollView>
        <ThemedView style={styles.container}>
          <Price value={0} symbolPosition="before" type="title" />
        </ThemedView>
      </ParallaxScrollView>
      <FAB
        icon="plus"
        style={{ ...styles.fab, backgroundColor: theme.colors.secondary }}
        onPress={() => router.push('/(transaction)')}
        color={theme.colors.onSecondary}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
