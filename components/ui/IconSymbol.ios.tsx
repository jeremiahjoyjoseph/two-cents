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
  'keyboard-arrow-down': 'arrowtriangle.down.fill',
  'keyboard-arrow-up': 'arrowtriangle.up.fill',
  'calendar-today': 'calendar',
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
  // Category icons
  'account-balance': 'building.2',
  'restaurant': 'fork.knife',
  'local-gas-station': 'fuelpump',
  'shopping-bag': 'bag',
  'flight-takeoff': 'airplane',
  'receipt-long': 'doc.text',
  'local-grocery-store': 'cart',
  'work': 'briefcase',
  'school': 'graduationcap',
  'health-and-safety': 'cross.case',
  'sports': 'sportscourt',
  'music-note': 'music.note',
  'movie': 'tv',
  'car-repair': 'wrench.and.screwdriver',
  'phone': 'phone',
  'wifi': 'wifi',
  'electric-bolt': 'bolt',
  'water-drop': 'drop',
  'cleaning-services': 'sparkles',
  'category': 'square.grid.2x2',
  'bar-chart': 'chart.bar',
  'expand-more': 'chevron.down',
  'trending-up': 'arrow.up.right',
  'trending-down': 'arrow.down.right',
  // New category icons
  'commute': 'car',
  'payments': 'creditcard',
  'pets': 'pawprint',
  'favorite': 'heart',
  'medical-services': 'cross.case',
  'savings': 'banknote',
  'subscriptions': 'repeat',
  // Action icons
  'edit': 'pencil',
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
