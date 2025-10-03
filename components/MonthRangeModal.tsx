import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { Button, useTheme } from 'react-native-paper';

interface MonthRangeModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedMonthIdx: number | null;
  setSelectedMonthIdx: (idx: number | null) => void;
  allTimeSelected: boolean;
  setAllTimeSelected: (val: boolean) => void;
}

type MonthLayout = { x: number; width: number };

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

function MonthRangeModal({
  isVisible,
  onClose,
  selectedMonthIdx: parentSelectedMonthIdx,
  setSelectedMonthIdx,
  allTimeSelected: parentAllTimeSelected,
  setAllTimeSelected,
}: MonthRangeModalProps) {
  const theme = useTheme();
  const months = useMemo(getMonthArray, []);
  const now = new Date();
  const currentYear = now.getFullYear();
  // Store layout info for each month
  const [monthLayouts, setMonthLayouts] = useState<MonthLayout[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  // Local state for selection
  const [localSelectedMonthIdx, setLocalSelectedMonthIdx] = useState<number | null>(
    parentSelectedMonthIdx
  );
  const [localAllTimeSelected, setLocalAllTimeSelected] = useState(parentAllTimeSelected);

  // Sync local state with parent when modal opens
  useEffect(() => {
    if (isVisible) {
      setLocalSelectedMonthIdx(parentSelectedMonthIdx);
      setLocalAllTimeSelected(parentAllTimeSelected);
    }
  }, [isVisible, parentSelectedMonthIdx, parentAllTimeSelected]);

  useEffect(() => {
    let scrollToIdx = localSelectedMonthIdx;
    if (isVisible && localSelectedMonthIdx === null) {
      // If no month is selected, scroll to current month
      const currentMonthIdx = months.findIndex(
        m => m.getFullYear() === now.getFullYear() && m.getMonth() === now.getMonth()
      );
      scrollToIdx = currentMonthIdx;
    }
    if (
      isVisible &&
      scrollToIdx !== null &&
      monthLayouts[scrollToIdx] &&
      scrollRef.current &&
      monthLayouts.length === months.length
    ) {
      const { x, width } = monthLayouts[scrollToIdx];
      // Center the selected month or current month
      scrollRef.current.scrollTo({
        x: x - 180 + width / 2, // 180 is half the ScrollView width (approx)
        animated: true,
      });
    }
  }, [isVisible, localSelectedMonthIdx, monthLayouts, months.length, months, now]);

  // Handler for Set button
  const handleSet = () => {
    setSelectedMonthIdx(localSelectedMonthIdx);
    setAllTimeSelected(localAllTimeSelected);
    onClose();
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
          {months.map((date, idx) => {
            const isCurrentYear = date.getFullYear() === currentYear;
            const label = isCurrentYear
              ? date.toLocaleString('default', { month: 'long' })
              : `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
            const selected = !localAllTimeSelected && localSelectedMonthIdx === idx;
            return (
              <View
                key={date.toISOString()}
                onLayout={e => {
                  const { x, width } = e.nativeEvent.layout;
                  setMonthLayouts(prev => {
                    const next = [...prev];
                    next[idx] = { x, width };
                    return next;
                  });
                }}
                style={styles.monthBlockWrapper}
              >
                <TouchableOpacity
                  onPress={() => {
                    setLocalSelectedMonthIdx(idx);
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
              setLocalSelectedMonthIdx(null);
            }}
          >
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

function getMonthArray() {
  const months = [];
  const start = new Date(2024, 0, 1); // Jan 2024
  const end = new Date(2026, 11, 1); // Dec 2026
  let current = new Date(start);
  while (current <= end) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }
  return months;
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
    minWidth: 64,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
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
    paddingHorizontal: 28,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
  },
  allTimeButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
    gap: 16,
  },
  setButton: {
    paddingHorizontal: 24,
  },
  actionButton: {
    flex: 1,
  },
});

export default MonthRangeModal;
