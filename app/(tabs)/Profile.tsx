import { GeneratePartnerCodeModal } from '@/components/GeneratePartnerCodeModal';
import { HandleLinkingPartnerCode } from '@/components/HandleLinkingPartnerCode';
import { HandleUnlinkPartnerCode } from '@/components/HandleUnlinkPartnerCode';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { MenuItem } from '@/components/ui/MenuItem';
import { auth } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { deleteAllTransactions } from '@/lib/api/transactions';
import { signOut } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  const theme = useTheme();
  const { user, deleteAccount } = useAuth();
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

  const handleDeleteData = async () => {
    Alert.alert(
      'Delete All Data',
      'This action will permanently delete all your transaction data. This cannot be undone. Are you sure you want to continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user?.uid) return;

              await deleteAllTransactions(user.uid, user.linkedGroupId ?? null);
              Alert.alert('Success', 'All transaction data has been deleted.');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete transaction data.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      user?.linkedGroupId
        ? 'This action will first unlink your account from your partner, then permanently delete your account and all associated data. This cannot be undone. Are you sure you want to continue?'
        : 'This action will permanently delete your account and all associated data. This cannot be undone. Are you sure you want to continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              Alert.alert('Success', 'Your account has been deleted.');
            } catch (error) {
              if (error instanceof Error && error.message.includes('re-authenticate')) {
                // Show password prompt
                Alert.prompt(
                  'Re-authenticate',
                  'Please enter your password to confirm account deletion:',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async password => {
                        if (!password) return;
                        try {
                          await deleteAccount(password);
                          Alert.alert('Success', 'Your account has been deleted.');
                        } catch (error) {
                          Alert.alert('Error', 'Failed to delete account. Please try again.');
                        }
                      },
                    },
                  ],
                  'secure-text'
                );
              } else {
                Alert.alert('Error', 'Failed to delete account. Please try again.');
              }
            }
          },
        },
      ]
    );
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
        <MenuItem label="Delete Data" onPress={() => handleDeleteData()} />
        <MenuItem label="Delete Account" onPress={() => handleDeleteAccount()} />
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
