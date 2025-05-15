import { View, type ViewProps } from 'react-native';
import { useTheme } from 'react-native-paper';

export type ThemedViewProps = ViewProps;

export function ThemedView({ style, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();

  return <View style={[{ backgroundColor: theme.colors.background }, style]} {...otherProps} />;
}
