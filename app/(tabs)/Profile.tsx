import { GeneratePartnerCodeModal } from '@/components/GeneratePartnerCodeModal';
import { HandleLinkingPartnerCode } from '@/components/HandleLinkingPartnerCode';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { MenuItem } from '@/components/ui/MenuItem';
import { auth } from '@/config/firebase';
import { signOut } from 'firebase/auth';
import { useState } from 'react';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  const theme = useTheme();
  const [isPartnerCodeModalVisible, setIsPartnerCodeModalVisible] = useState(false);
  const [isLinkingPartnerCodeModalVisible, setIsLinkingPartnerCodeModalVisible] = useState(false);

  const handleSignOut = () => {
    signOut(auth);
  };

  const handleGeneratePartnerCode = () => {
    setIsPartnerCodeModalVisible(true);
  };

  const handleLinkPartnerCode = () => {
    setIsLinkingPartnerCodeModalVisible(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ParallaxScrollView>
        <ThemedText type="title">Profile</ThemedText>
        <MenuItem label="Sign Out" onPress={() => handleSignOut()} />
        <MenuItem label="Generate Partner Code" onPress={() => handleGeneratePartnerCode()} />
        <MenuItem label="Link Partner Code" onPress={() => handleLinkPartnerCode()} />
      </ParallaxScrollView>

      <GeneratePartnerCodeModal
        visible={isPartnerCodeModalVisible}
        onClose={() => setIsPartnerCodeModalVisible(false)}
      />

      <HandleLinkingPartnerCode
        visible={isLinkingPartnerCodeModalVisible}
        onDismiss={() => setIsLinkingPartnerCodeModalVisible(false)}
      />
    </SafeAreaView>
  );
}
