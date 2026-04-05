import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { taxService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TaxHistoryScreen({ navigation }) {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadTaxRecords();
  }, []);

  const loadTaxRecords = async () => {
    try {
      const response = await taxService.getTaxRecords();
      const data = response.data.records || [];
      setRecords(data);
      
      if (data.length > 0) {
        calculateSummary(data);
      }
    } catch (error) {
      console.log('Error loading tax records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data) => {
    const totalIncome = data.reduce((sum, r) => sum + (r.total_income || 0), 0);
    const totalTax = data.reduce((sum, r) => sum + (r.estimated_tax || 0), 0);
    const totalDeductions = data.reduce((sum, r) => sum + (r.total_deductions || 0), 0);
    const avgTaxRate = totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0;

    setSummary({
      totalIncome,
      totalTax,
      totalDeductions,
      avgTaxRate: avgTaxRate.toFixed(2),
      yearsCount: data.length,
      maxIncome: Math.max(...data.map(r => r.total_income || 0)),
      minIncome: Math.min(...data.map(r => r.total_income || 0)),
    });
  };

  const formatCurrency = (amount) => {
    return '₹' + Math.round(amount).toLocaleString('en-IN');
  };

  const getFinancialYear = (record) => {
    return record.financial_year || 'FY 2023-24';
  };

  const getTaxStatus = (tax) => {
    if (tax <= 0) return { label: 'No Tax', color: '#27ae60' };
    if (tax <= 50000) return { label: 'Low Tax', color: '#3498db' };
    if (tax <= 200000) return { label: 'Moderate', color: '#f39c12' };
    return { label: 'High Tax', color: '#e74c3c' };
  };

  const getComparisonWithPrevious = (current, index) => {
    if (index === 0) return null;
    const previous = records[index - 1];
    const diff = current.total_income - (previous.total_income || 0);
    const percent = previous.total_income > 0 ? ((diff / previous.total_income) * 100).toFixed(1) : 0;
    return { diff, percent, isIncrease: diff > 0 };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading tax history...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tax History</Text>
        <Text style={styles.headerSubtitle}>Your multi-year tax records</Text>
      </View>

      {summary && (
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Overall Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: '#3498db20' }]}>
                <Ionicons name="wallet" size={24} color="#3498db" />
              </View>
              <Text style={styles.summaryLabel}>Total Income</Text>
              <Text style={styles.summaryValue}>{formatCurrency(summary.totalIncome)}</Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: '#e74c3c20' }]}>
                <Ionicons name="card" size={24} color="#e74c3c" />
              </View>
              <Text style={styles.summaryLabel}>Total Tax Paid</Text>
              <Text style={styles.summaryValue}>{formatCurrency(summary.totalTax)}</Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: '#27ae6020' }]}>
                <Ionicons name="save" size={24} color="#27ae60" />
              </View>
              <Text style={styles.summaryLabel}>Deductions</Text>
              <Text style={styles.summaryValue}>{formatCurrency(summary.totalDeductions)}</Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: '#9b59b620' }]}>
                <Ionicons name="trending-up" size={24} color="#9b59b6" />
              </View>
              <Text style={styles.summaryLabel}>Avg Tax Rate</Text>
              <Text style={styles.summaryValue}>{summary.avgTaxRate}%</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.recordsSection}>
        <Text style={styles.sectionTitle}>Year-wise Breakdown</Text>
        
        {records.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>No tax records yet</Text>
            <Text style={styles.emptySubtext}>Start calculating your taxes to see history here</Text>
            <TouchableOpacity style={styles.calculateButton} onPress={() => navigation.navigate('Calculator')}>
              <Text style={styles.calculateButtonText}>Calculate Tax</Text>
            </TouchableOpacity>
          </View>
        ) : (
          records.map((record, index) => {
            const comparison = getComparisonWithPrevious(record, index);
            const status = getTaxStatus(record.estimated_tax || 0);
            const isExpanded = selectedYear === record.id;

            return (
              <TouchableOpacity
                key={record.id}
                style={styles.recordCard}
                onPress={() => setSelectedYear(isExpanded ? null : record.id)}
              >
                <View style={styles.recordHeader}>
                  <View style={styles.recordYearBadge}>
                    <Ionicons name="calendar" size={16} color="#3498db" />
                    <Text style={styles.recordYear}>{getFinancialYear(record)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>

                <View style={styles.recordMain}>
                  <View style={styles.recordItem}>
                    <Text style={styles.recordLabel}>Total Income</Text>
                    <Text style={styles.recordValue}>{formatCurrency(record.total_income || 0)}</Text>
                  </View>
                  <View style={styles.recordItem}>
                    <Text style={styles.recordLabel}>Estimated Tax</Text>
                    <Text style={[styles.recordValue, { color: '#e74c3c' }]}>
                      {formatCurrency(record.estimated_tax || 0)}
                    </Text>
                  </View>
                </View>

                {comparison && (
                  <View style={styles.comparisonBar}>
                    <Ionicons
                      name={comparison.isIncrease ? 'trending-up' : 'trending-down'}
                      size={16}
                      color={comparison.isIncrease ? '#e74c3c' : '#27ae60'}
                    />
                    <Text style={[styles.comparisonText, { color: comparison.isIncrease ? '#e74c3c' : '#27ae60' }]}>
                      {comparison.isIncrease ? '+' : ''}{formatCurrency(comparison.diff)} ({comparison.percent}%)
                    </Text>
                    <Text style={styles.comparisonLabel}>vs previous year</Text>
                  </View>
                )}

                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Gross Income</Text>
                      <Text style={styles.detailValue}>{formatCurrency(record.gross_income || 0)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Deductions (80C-80U)</Text>
                      <Text style={styles.detailValue}>{formatCurrency(record.total_deductions || 0)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Taxable Income</Text>
                      <Text style={styles.detailValue}>{formatCurrency(record.taxable_income || 0)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Rebate 87A</Text>
                      <Text style={styles.detailValue}>{formatCurrency(record.rebate_87a || 0)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Cess 4%</Text>
                      <Text style={styles.detailValue}>{formatCurrency(record.cess || 0)}</Text>
                    </View>

                    <TouchableOpacity style={styles.viewDetailsButton} onPress={() => navigation.navigate('Calculator')}>
                      <Ionicons name="eye" size={16} color="#3498db" />
                      <Text style={styles.viewDetailsText}>View Full Details</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.expandHint}>
                  <Text style={styles.expandHintText}>{isExpanded ? 'Tap to collapse' : 'Tap for details'}</Text>
                  <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#bdc3c7" />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {records.length > 0 && (
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Tax Planning Tips</Text>
          <View style={styles.tipCard}>
            <Ionicons name="trending-up" size={24} color="#3498db" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Year-over-Year Growth</Text>
              <Text style={styles.tipText}>
                Your income has grown {summary?.yearsCount || 0} times over {records.length} financial years.
                Consider increasing your tax-saving investments accordingly.
              </Text>
            </View>
          </View>
          <View style={styles.tipCard}>
            <Ionicons name="save" size={24} color="#27ae60" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Maximize Deductions</Text>
              <Text style={styles.tipText}>
                You claimed {formatCurrency(summary?.totalDeductions || 0)} in deductions.
                The maximum limit under Section 80C is ₹1,50,000.
              </Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 5,
  },
  summarySection: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryIcon: {
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 4,
  },
  recordsSection: {
    padding: 15,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
    textAlign: 'center',
  },
  calculateButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordYearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordYear: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recordMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recordItem: {},
  recordLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  recordValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 2,
  },
  comparisonBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  comparisonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  comparisonLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 6,
  },
  expandedContent: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f4fd',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
    marginLeft: 6,
  },
  expandHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  expandHintText: {
    fontSize: 12,
    color: '#bdc3c7',
  },
  tipsSection: {
    padding: 15,
    paddingBottom: 30,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  tipText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
    lineHeight: 20,
  },
});
