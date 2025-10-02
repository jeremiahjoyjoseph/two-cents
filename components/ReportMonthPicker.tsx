import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { Button, useTheme } from 'react-native-paper';

interface ReportMonthPickerProps {
  isVisible: boolean;
  onClose: () => void;
  selectedMonth: string | null;
  setSelectedMonth: (month: string | null) => void;
  availableMonths: string[];
}

function SectionHeader({ children, style }: { children: React.ReactNode; style?: any }) {
  const theme = useTheme();
  return (
    <Text style={[styles.sectionHeader, { color: theme.colors.onSurface }, style]}>{children}</Text>
  );
}

function Separator() {
  const theme = useTheme();
  return (
    <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant ?? '#eee' }]} />
  );
}

export default function ReportMonthPicker({
  isVisible,
  onClose,
  selectedMonth,
  setSelectedMonth,
  availableMonths,
}: ReportMonthPickerProps) {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  // Local state for selection
  const [localSelectedMonth, setLocalSelectedMonth] = useState<string | null>(selectedMonth);
  const [localAllTimeSelected, setLocalAllTimeSelected] = useState(!selectedMonth);

  // Sync local state with parent when modal opens
  useEffect(() => {
    if (isVisible) {
      setLocalSelectedMonth(selectedMonth);
      setLocalAllTimeSelected(!selectedMonth);
    }
  }, [isVisible, selectedMonth]);

  // Handler for Set button
  const handleSet = () => {
    if (localAllTimeSelected) {
      setSelectedMonth(null);
    } else {
      setSelectedMonth(localSelectedMonth);
    }
    onClose();
  };

  // Format month string for display
  const formatMonthDisplay = (monthString: string): string => {
    const [year, month] = monthString.split('-').map(Number);
    const date = new Date(year, month - 1);
    const now = new Date();
    const isCurrentYear = date.getFullYear() === now.getFullYear();
    
    return isCurrentYear
      ? date.toLocaleString('default', { month: 'long' })
      : `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      backdropColor={theme.colors.background}
      backdropOpacity={0.8}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver
    >
      <ThemedView style={[styles.container, { backgroundColor: theme.colors.elevation.level1 }]}>
        <SectionHeader>Choose month</SectionHeader>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthScrollContent}
        >
          {availableMonths.map((monthString, idx) => {
            const label = formatMonthDisplay(monthString);
            const selected = !localAllTimeSelected && localSelectedMonth === monthString;
            return (
              <View key={monthString} style={styles.monthBlockWrapper}>
                <TouchableOpacity
                  onPress={() => {
                    setLocalSelectedMonth(monthString);
                    setLocalAllTimeSelected(false);
                  }}
                  style={[
                    styles.monthBlock,
                    {
                      backgroundColor: selected
                        ? theme.colors.primary
                        : theme.colors.surfaceVariant,
                    },
                  ]}
                >
                  <IconSymbol 
                    name="calendar-today" 
                    size={16} 
                    color={selected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant} 
                  />
                  <Text
                    style={[
                      styles.monthText,
                      { color: selected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
        <Separator />
        <SectionHeader style={styles.sectionHeaderSmall}>or all time</SectionHeader>
        <View style={styles.allTimeButtonWrapper}>
          <TouchableOpacity
            style={[
              styles.allTimeButton,
              {
                backgroundColor: localAllTimeSelected
                  ? theme.colors.primary
                  : theme.colors.surfaceVariant,
              },
            ]}
            onPress={() => {
              setLocalAllTimeSelected(true);
              setLocalSelectedMonth(null);
            }}
          >
            <IconSymbol 
              name="calendar-today" 
              size={16} 
              color={localAllTimeSelected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant} 
            />
            <Text
              style={[
                styles.allTimeButtonText,
                {
                  color: localAllTimeSelected
                    ? theme.colors.onPrimary
                    : theme.colors.onSurfaceVariant,
                },
              ]}
            >
              Select All Time
            </Text>
          </TouchableOpacity>
        </View>
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <Button
            mode="text"
            onPress={onClose}
            icon={({ size, color }: { size: number; color: string }) => (
              <IconSymbol name="close" size={size} color={color} />
            )}
            textColor={theme.colors.onSurface}
            style={styles.actionButton}
          >
            Close
          </Button>
          <Button
            mode="contained"
            onPress={handleSet}
            icon={({ size, color }: { size: number; color: string }) => (
              <IconSymbol name="check" size={size} color={color} />
            )}
            buttonColor={theme.colors.primary}
            style={[styles.setButton, styles.actionButton]}
          >
            Set
          </Button>
        </View>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 200,
    paddingBottom: 24,
  },
  sectionHeader: {
    fontSize: 22,
    marginLeft: 20,
    marginTop: 24,
    marginBottom: 24,
    fontWeight: 'bold',
  },
  sectionHeaderSmall: {
    fontSize: 18,
    color: '#999', // will be overridden by theme
    marginTop: 32,
    marginBottom: 16,
  },
  separator: {
    height: 1,
    opacity: 0.3,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 0,
  },
  monthScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 8,
    gap: 12,
  },
  monthBlockWrapper: {
    marginRight: 4,
  },
  monthBlock: {
    minWidth: 80,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 6,
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  allTimeButtonWrapper: {
    alignItems: 'flex-start',
    marginLeft: 12,
  },
  allTimeButton: {
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
    flexDirection: 'row',
    gap: 8,
  },
  allTimeButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'transparent',
    marginTop: 24,
  },
  setButton: {
    paddingHorizontal: 24,
  },
  actionButton: {
    flex: 1,
  },
});
