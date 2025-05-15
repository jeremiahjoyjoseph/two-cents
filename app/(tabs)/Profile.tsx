import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { MenuItem } from '@/components/ui/MenuItem';
import { auth } from '@/config/firebase';
import { signOut } from 'firebase/auth';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  const theme = useTheme();

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ParallaxScrollView>
        <ThemedText type="title">Profile</ThemedText>
        <MenuItem label="Sign Out" onPress={() => handleSignOut()} />
      </ParallaxScrollView>
    </SafeAreaView>
  );
}
