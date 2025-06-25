import Constants from 'expo-constants';
import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface VersionDisplayProps {
  showBuildNumber?: boolean;
  style?: any;
  textStyle?: any;
}

export function VersionDisplay({ showBuildNumber = true, style, textStyle }: VersionDisplayProps) {
  const version = Constants.expoConfig?.version || '1.0.0';
  const buildNumber =
    Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1';

  return (
    <ThemedView style={[styles.container, style]}>
      <ThemedText style={[styles.versionText, textStyle]}>
        v{version}
        {showBuildNumber && (
          <ThemedText style={[styles.buildText, textStyle]}> ({buildNumber})</ThemedText>
        )}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  versionText: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: 'bold',
  },
  buildText: {
    fontSize: 10,
    opacity: 0.5,
  },
});
