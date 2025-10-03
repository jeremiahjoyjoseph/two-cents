import MultiSelectCategoryModal from '@/components/MultiSelectCategoryModal';
import Price from '@/components/Price';
import ReportMonthPicker from '@/components/ReportMonthPicker';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useReportData } from '@/lib/hooks/useReportData';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Card, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// Utility function to ensure iOS-compatible color format
const normalizeColor = (color: string): string => {
  if (!color) return '#000000';
  
  // Remove any whitespace
  const cleanColor = color.trim();
  
  // If color is already a valid 6-digit hex, return it
  if (/^#[0-9A-Fa-f]{6}$/.test(cleanColor)) {
    return cleanColor;
  }
  
  // If color is a 3-digit hex, expand it
  if (/^#[0-9A-Fa-f]{3}$/.test(cleanColor)) {
    const r = cleanColor[1];
    const g = cleanColor[2];
    const b = cleanColor[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  
  // If color doesn't start with #, add it
  if (!cleanColor.startsWith('#')) {
    return `#${cleanColor}`;
  }
  
  // Default fallback
  return '#000000';
};

// Utility function to create iOS-compatible color with opacity
const createColorWithOpacity = (color: string, opacity: number = 0.2): string => {
  const normalizedColor = normalizeColor(color);
  
  // Convert hex to RGB
  const hex = normalizedColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Return rgba format for iOS compatibility
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const screenWidth = Dimensions.get('window').width;

export default function ReportScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  
  const {
    filteredTransactions,
    pieData,
    graphData,
    totalSpending,
    totalIncome,
    netAmount,
    spendingTrend,
    categories,
    selectedMonth,
    selectedCategoryId,
    selectedTransactionType,
    availableMonths,
    loading,
    setSelectedMonth,
    setSelectedCategoryId,
    setSelectedTransactionType,
    clearFilters,
    formatMonthString,
  } = useReportData(user?.uid, user?.linkedGroupId);

  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedPieSlice, setSelectedPieSlice] = useState<number | null>(null);

  // Prepare pie chart data
  const pieChartData = pieData.map((item, index) => ({
    name: '',
    population: item.total,
    color: item.color,
    legendFontColor: 'transparent',
    legendFontSize: 0,
    legendFontFamily: 'System',
  }));

  // Prepare bar chart data
  const barChartData = {
    labels: graphData.slice(-6).map(item => item.month.split(' ')[0]), // Last 6 months
    datasets: [
      {
        data: graphData.slice(-6).map(item => item.total),
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // Purple color
      },
    ],
  };

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
    labelColor: (opacity = 1) => 'transparent',
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
    legendFontSize: 0,
    legendFontColor: 'transparent',
  };

  const handleCategorySelect = (categoryId: string | null) => {
    if (categoryId === null) {
      // Select "All" - clear all selections
      setSelectedCategoryId(null);
      setSelectedCategoryIds([]);
    } else {
      // Select specific category
      setSelectedCategoryId(categoryId);
      setSelectedCategoryIds([categoryId]);
    }
  };

  const handleMultiCategorySelect = (categoryIds: string[]) => {
    setSelectedCategoryIds(categoryIds);
    if (categoryIds.length === 0) {
      setSelectedCategoryId(null);
    } else if (categoryIds.length === 1) {
      setSelectedCategoryId(categoryIds[0]);
    } else {
      setSelectedCategoryId(null); // Multiple categories selected
    }
    setShowCategoryModal(false);
  };

  const handleMonthSelect = (month: string | null) => {
    setSelectedMonth(month);
    setShowMonthModal(false);
  };

  const handleClearFilters = () => {
    clearFilters();
    setSelectedCategoryIds([]);
  };

  const handleTransactionTypeSelect = (type: 'income' | 'expense' | 'all') => {
    setSelectedTransactionType(type);
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
            Loading reports...
          </Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Reports
          </Text>
          {(selectedMonth || selectedCategoryIds.length > 0 || selectedTransactionType !== 'all') && (
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={handleClearFilters}
            >
              <Text style={[styles.clearAllText, { color: theme.colors.primary }]}>
                Clear
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Modern Filter Section */}
        <View style={styles.modernFilterContainer}>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.bigFilterButton, { backgroundColor: theme.colors.surface }]}
              onPress={() => setShowMonthModal(true)}
            >
              <IconSymbol name="calendar-today" size={18} color={theme.colors.primary} />
              <Text style={[styles.bigFilterText, { color: theme.colors.onSurface }]}>
                {selectedMonth ? formatMonthString(selectedMonth) : 'All Time'}
              </Text>
              <IconSymbol name="expand-more" size={16} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Transaction Type Filter Row */}
          <View style={styles.filterRow}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.transactionTypeScrollView}
              contentContainerStyle={styles.transactionTypeScrollContent}
            >
              {/* All Transactions Button */}
              <TouchableOpacity
                style={[
                  styles.transactionTypeChip,
                  { 
                    backgroundColor: selectedTransactionType === 'all' ? theme.colors.primary : theme.colors.surface,
                    borderColor: theme.colors.outline 
                  }
                ]}
                onPress={() => handleTransactionTypeSelect('all')}
              >
                <Text style={[
                  styles.transactionTypeChipText,
                  { color: selectedTransactionType === 'all' ? theme.colors.onPrimary : theme.colors.onSurface }
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              
              {/* Income Button */}
              <TouchableOpacity
                style={[
                  styles.transactionTypeChip,
                  { 
                    backgroundColor: selectedTransactionType === 'income' ? theme.colors.primary : theme.colors.surface,
                    borderColor: theme.colors.outline 
                  }
                ]}
                onPress={() => handleTransactionTypeSelect('income')}
              >
                <IconSymbol name="trending-up" size={16} color={selectedTransactionType === 'income' ? theme.colors.onPrimary : theme.colors.onSurface} />
                <Text style={[
                  styles.transactionTypeChipText,
                  { color: selectedTransactionType === 'income' ? theme.colors.onPrimary : theme.colors.onSurface }
                ]}>
                  Income
                </Text>
              </TouchableOpacity>
              
              {/* Expense Button */}
              <TouchableOpacity
                style={[
                  styles.transactionTypeChip,
                  { 
                    backgroundColor: selectedTransactionType === 'expense' ? theme.colors.primary : theme.colors.surface,
                    borderColor: theme.colors.outline 
                  }
                ]}
                onPress={() => handleTransactionTypeSelect('expense')}
              >
                <IconSymbol name="trending-down" size={16} color={selectedTransactionType === 'expense' ? theme.colors.onPrimary : theme.colors.onSurface} />
                <Text style={[
                  styles.transactionTypeChipText,
                  { color: selectedTransactionType === 'expense' ? theme.colors.onPrimary : theme.colors.onSurface }
                ]}>
                  Expense
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          
          <View style={styles.filterRow}>
            <View style={styles.categoryFilterContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScrollView}
                contentContainerStyle={styles.categoryScrollContent}
              >
              {/* All Categories Button */}
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  { 
                    backgroundColor: selectedCategoryIds.length === 0 ? theme.colors.primary : theme.colors.surface,
                    borderColor: theme.colors.outline 
                  }
                ]}
                onPress={() => handleCategorySelect(null)}
              >
                <Text style={[
                  styles.categoryChipText,
                  { color: selectedCategoryIds.length === 0 ? theme.colors.onPrimary : theme.colors.onSurface }
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              
              {/* Category Chips */}
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    { 
                      backgroundColor: selectedCategoryIds.includes(category.id) ? theme.colors.primary : theme.colors.surface,
                      borderColor: theme.colors.outline 
                    }
                  ]}
                  onPress={() => handleCategorySelect(category.id)}
                >
                  <IconSymbol name={category.icon as any} size={16} color={selectedCategoryIds.includes(category.id) ? theme.colors.onPrimary : theme.colors.onSurface} />
                  <Text style={[
                    styles.categoryChipText,
                    { color: selectedCategoryIds.includes(category.id) ? theme.colors.onPrimary : theme.colors.onSurface }
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Dropdown Button */}
            <TouchableOpacity
              style={[styles.dropdownButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
              onPress={() => setShowCategoryModal(true)}
            >
              <View style={styles.dropdownIconContainer}>
                <View style={[styles.dropdownDot, { backgroundColor: theme.colors.primary }]} />
                <View style={[styles.dropdownDot, { backgroundColor: theme.colors.primary }]} />
                <View style={[styles.dropdownDot, { backgroundColor: theme.colors.primary }]} />
              </View>
            </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Section Divider */}
        <View style={[styles.sectionDivider, { backgroundColor: theme.colors.outline }]} />

        {/* Full Width Total Card */}
        <Card style={[styles.fullWidthCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.fullWidthContent}>
            <Text style={[styles.fullWidthLabel, { color: theme.colors.onSurfaceVariant }]}>
              {selectedTransactionType === 'income' ? 'Total Income' : 
               selectedTransactionType === 'expense' ? 'Total Expenses' : 
               'Net Amount'}
            </Text>
            <Price 
              value={selectedTransactionType === 'income' ? totalIncome : 
                     selectedTransactionType === 'expense' ? totalSpending : 
                     netAmount} 
              style={styles.fullWidthAmount} 
            />
            {selectedTransactionType === 'expense' && spendingTrend.percentage > 0 && (
              <View style={styles.trendContainer}>
                <IconSymbol 
                  name={spendingTrend.isIncrease ? "trending-up" : "trending-down"} 
                  size={16} 
                  color={spendingTrend.isIncrease ? theme.colors.error : theme.colors.primary} 
                />
                <Text style={[
                  styles.trendText, 
                  { color: spendingTrend.isIncrease ? theme.colors.error : theme.colors.primary }
                ]}>
                  {spendingTrend.percentage.toFixed(1)}% vs last month
                </Text>
              </View>
            )}
            {selectedTransactionType === 'all' && (
              <View style={styles.netAmountBreakdown}>
                <View style={styles.netAmountRow}>
                  <View style={styles.netAmountLabelContainer}>
                    <IconSymbol name="trending-up" size={14} color={theme.colors.primary} />
                    <Text style={[styles.netAmountLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Income
                    </Text>
                  </View>
                  <Price value={totalIncome} style={[styles.netAmountValue, { color: theme.colors.onSurface }]} />
                </View>
                <View style={styles.netAmountRow}>
                  <View style={styles.netAmountLabelContainer}>
                    <IconSymbol name="trending-down" size={14} color={theme.colors.onSurfaceVariant} />
                    <Text style={[styles.netAmountLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Expenses
                    </Text>
                  </View>
                  <Price value={totalSpending} style={[styles.netAmountValue, { color: theme.colors.onSurface }]} />
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
        
        {/* Transaction Count */}
        <Card style={[styles.transactionCountCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.transactionCountContent}>
            <Text style={[styles.transactionCountLabel, { color: theme.colors.onSurfaceVariant }]}>
              Transactions
            </Text>
            <Text style={[styles.transactionCountAmount, { color: theme.colors.onSurface }]}>
              {filteredTransactions.length}
            </Text>
            <Text style={[styles.transactionCountSubtext, { color: theme.colors.onSurfaceVariant }]}>
              {selectedMonth ? 'This month' : 'All time'}
            </Text>
          </Card.Content>
        </Card>

        {/* Pie Chart with Category Breakdown */}
        {pieData.length > 0 && (
          <Card style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.chartTitleContainer}>
                <Text style={[styles.chartTitle, { color: theme.colors.onSurface }]}>
                  Spending by Category
                </Text>
                <Text style={[styles.chartSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                  Tap a slice to see label
                </Text>
              </View>
              <View style={styles.pieChartContainer}>
                {pieData && pieData.length > 0 ? (
                  <PieChart
                    data={pieData
                      .filter(item => item && item.total > 0)
                      .map((item, index) => ({
                        value: Number(item.total || 0),
                        color: normalizeColor(item.color || '#000000'),
                        text: selectedPieSlice === index ? String(item.categoryName || 'Unknown') : '',
                        textColor: theme.colors.onSurface,
                        textBackgroundColor: 'transparent',
                        textSize: 12,
                        onPress: () => setSelectedPieSlice(selectedPieSlice === index ? null : index),
                        focused: selectedPieSlice === index,
                      }))}
                    radius={100}
                    innerRadius={30}
                    showText={selectedPieSlice !== null}
                    textColor={theme.colors.onSurface}
                    textSize={12}
                    showTextBackground
                    textBackgroundRadius={26}
                    onPress={(item: any, index: number) => setSelectedPieSlice(selectedPieSlice === index ? null : index)}
                  />
                ) : (
                  <Text style={[styles.chartTitle, { color: theme.colors.onSurface, textAlign: 'center' }]}>
                    No data available
                  </Text>
                )}
              </View>
              
              {/* Category Breakdown */}
              <View style={styles.categoryBreakdown}>
                {pieData.map((category, index) => (
                  <View key={category.categoryId} style={styles.categoryBreakdownItem}>
                    <View style={styles.categoryBreakdownLeft}>
                      <View style={[styles.categoryColorDot, { backgroundColor: normalizeColor(category.color) }]} />
                      <Text style={[styles.categoryBreakdownName, { color: theme.colors.onSurface }]}>
                        {category.categoryName}
                      </Text>
                    </View>
                    <Text style={[styles.categoryBreakdownAmount, { color: theme.colors.onSurface }]}>
                      ₹{category.total.toLocaleString('en-IN')}
                    </Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}


        {/* No Data State */}
        {filteredTransactions.length === 0 && (
          <Card style={[styles.noDataCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.noDataContent}>
              <IconSymbol name="bar-chart" size={48} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.noDataTitle, { color: theme.colors.onSurface }]}>
                No Data Available
              </Text>
              <Text style={[styles.noDataText, { color: theme.colors.onSurfaceVariant }]}>
                {selectedMonth || selectedCategoryId 
                  ? 'No transactions found for the selected filters'
                  : 'Add some transactions to see your spending reports'
                }
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Month Range Modal */}
      <ReportMonthPicker
        isVisible={showMonthModal}
        onClose={() => setShowMonthModal(false)}
        selectedMonth={selectedMonth}
        setSelectedMonth={handleMonthSelect}
        availableMonths={availableMonths}
      />

      {/* Multi-Select Category Modal */}
      <MultiSelectCategoryModal
        isVisible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        selectedCategoryIds={selectedCategoryIds}
        onCategorySelect={handleMultiCategorySelect}
        categories={categories}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 32, // Increased top padding
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  // Modern Filter Styles
  modernFilterContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  filterRow: {
    marginBottom: 16,
  },
  bigFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    alignSelf: 'flex-start',
  },
  bigFilterText: {
    fontSize: 16,
    fontWeight: '500',
  },
  clearAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearAllText: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryScrollView: {
    flex: 1,
  },
  categoryScrollContent: {
    paddingRight: 8,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Transaction Type Filter Styles
  transactionTypeScrollView: {
    flex: 1,
  },
  transactionTypeScrollContent: {
    paddingRight: 8,
    gap: 8,
  },
  transactionTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    marginRight: 8,
  },
  transactionTypeChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dropdownDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  sectionDivider: {
    height: 1,
    marginVertical: 12,
    marginHorizontal: 4,
    opacity: 0.3,
  },
  categoryFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  categoryFilterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Full Width Card Styles
  fullWidthCard: {
    marginBottom: 24,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fullWidthContent: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  fullWidthLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  fullWidthAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  // Transaction Count Card
  transactionCountCard: {
    marginBottom: 24,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transactionCountContent: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  transactionCountLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  transactionCountAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionCountSubtext: {
    fontSize: 12,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Net Amount Breakdown Styles
  netAmountBreakdown: {
    marginTop: 16,
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  netAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    gap: 16,
  },
  netAmountLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  netAmountLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  netAmountValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  chartCard: {
    marginBottom: 24,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chartTitleContainer: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 200,
    paddingVertical: 20,
  },
  centerLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  barChartContainer: {
    alignItems: 'center',
  },
  // Category Breakdown Styles
  categoryBreakdown: {
    marginTop: 16,
    gap: 4,
  },
  categoryBreakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  categoryBreakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryBreakdownName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryBreakdownAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  noDataCard: {
    marginTop: 32,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noDataContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
