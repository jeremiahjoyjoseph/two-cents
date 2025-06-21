import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

// Map Material Icons names to SF Symbol names
const iconNameMap: Record<string, SymbolViewProps['name']> = {
  'chevron-right': 'chevron.right',
  'chevron.left': 'chevron.left',
  'arrow-upward': 'arrow.up',
  'arrow-downward': 'arrow.down',
  'arrow-drop-down': 'arrowtriangle.down.fill',
  close: 'xmark',
  check: 'checkmark',
  home: 'house',
  person: 'person',
  key: 'key',
  'content-copy': 'doc.on.doc',
  'file-download': 'arrow.down.doc',
  'file-upload': 'arrow.up.doc',
  add: 'plus',
  backspace: 'delete.left',
  delete: 'trash',
  'link-off': 'link',
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  const theme = useTheme();
  const iconColor = color ?? theme.colors.onSurface;
  const sfSymbolName = iconNameMap[name] || name;

  return (
    <SymbolView
      weight={weight}
      tintColor={iconColor}
      resizeMode="scaleAspectFit"
      name={sfSymbolName}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
