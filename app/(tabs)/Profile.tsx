import { GeneratePartnerCodeModal } from '@/components/GeneratePartnerCodeModal';
import { HandleLinkingPartnerCode } from '@/components/HandleLinkingPartnerCode';
import { HandleUnlinkPartnerCode } from '@/components/HandleUnlinkPartnerCode';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { MenuItem } from '@/components/ui/MenuItem';
import { auth } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  const theme = useTheme();
  const { user } = useAuth();
  const [isPartnerCodeModalVisible, setIsPartnerCodeModalVisible] = useState(false);
  const [isLinkingPartnerCodeModalVisible, setIsLinkingPartnerCodeModalVisible] = useState(false);
  const [isUnlinkingPartnerCodeModalVisible, setIsUnlinkingPartnerCodeModalVisible] =
    useState(false);

  const handleSignOut = () => {
    signOut(auth);
  };

  const handleGeneratePartnerCode = () => {
    setIsPartnerCodeModalVisible(true);
  };

  const handleLinkPartnerCode = () => {
    setIsLinkingPartnerCodeModalVisible(true);
  };

  const handleUnlinkPartnerCode = () => {
    setIsUnlinkingPartnerCodeModalVisible(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ParallaxScrollView>
        <View style={styles.header}>
          <ThemedText type="title">Profile</ThemedText>
          {user?.name && <ThemedText type="subtitle">{user.name}</ThemedText>}
        </View>
        <MenuItem label="Sign Out" onPress={() => handleSignOut()} />
        {!user?.linkedGroupId ? (
          <>
            <MenuItem label="Generate Partner Code" onPress={() => handleGeneratePartnerCode()} />
            <MenuItem label="Link Partner Code" onPress={() => handleLinkPartnerCode()} />
          </>
        ) : (
          <MenuItem label="Unlink Partner Code" onPress={() => handleUnlinkPartnerCode()} />
        )}
      </ParallaxScrollView>

      <GeneratePartnerCodeModal
        visible={isPartnerCodeModalVisible}
        onClose={() => setIsPartnerCodeModalVisible(false)}
      />

      <HandleLinkingPartnerCode
        visible={isLinkingPartnerCodeModalVisible}
        onDismiss={() => setIsLinkingPartnerCodeModalVisible(false)}
      />

      <HandleUnlinkPartnerCode
        visible={isUnlinkingPartnerCodeModalVisible}
        onDismiss={() => setIsUnlinkingPartnerCodeModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
});
