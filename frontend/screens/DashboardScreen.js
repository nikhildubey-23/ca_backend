import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { taxService, folderService, documentService } from '../services/api';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIncome: 0,
    estimatedTax: 0,
    deductions: 0,
    folders: 0,
    documents: 0,
  });
  const [recentRecords, setRecentRecords] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [taxRes, foldersRes, docsRes] = await Promise.all([
        taxService.getTaxRecords().catch(() => ({ data: { records: [] } })),
        folderService.getFolders().catch(() => ({ data: { folders: [] } })),
        documentService.getDocuments().catch(() => ({ data: { documents: [] } })),
      ]);

      const records = taxRes.data.records || [];
      const totalIncome = records.reduce((sum, r) => sum + (r.total_income || 0), 0);
      const estimatedTax = records.reduce((sum, r) => sum + (r.estimated_tax || 0), 0);
      const deductions = records.reduce((sum, r) => sum + (r.total_deductions || 0), 0);

      setStats({
        totalIncome,
        estimatedTax,
        deductions,
        folders: foldersRes.data.folders?.length || 0,
        documents: docsRes.data.documents?.length || 0,
      });

      setRecentRecords(records.slice(0, 3));
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    try {
      const num = Number(amount);
      if (isNaN(num) || !isFinite(num)) return '₹0';
      return '₹' + Math.round(num).toLocaleString('en-IN');
    } catch (e) {
      return '₹0';
    }
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'User'}</Text>
          <Text style={styles.subGreeting}>Here's your tax overview</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Calculator')}>
          <View style={[styles.statIcon, { backgroundColor: '#3498db' }]}>
            <Ionicons name="cash" size={24} color="#fff" />
          </View>
          <Text style={styles.statLabel}>Total Income</Text>
          <Text style={styles.statValue}>{formatCurrency(stats.totalIncome)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Calculator')}>
          <View style={[styles.statIcon, { backgroundColor: '#e74c3c' }]}>
            <Ionicons name="calculator" size={24} color="#fff" />
          </View>
          <Text style={styles.statLabel}>Est. Tax</Text>
          <Text style={styles.statValue}>{formatCurrency(stats.estimatedTax)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Calculator')}>
          <View style={[styles.statIcon, { backgroundColor: '#27ae60' }]}>
            <Ionicons name="save" size={24} color="#fff" />
          </View>
          <Text style={styles.statLabel}>Deductions</Text>
          <Text style={styles.statValue}>{formatCurrency(stats.deductions)}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Calculator')}>
            <View style={styles.actionIcon}>
              <Ionicons name="calculator-outline" size={28} color="#3498db" />
            </View>
            <Text style={styles.actionText}>Calculate Tax</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Documents')}>
            <View style={styles.actionIcon}>
              <Ionicons name="document-attach-outline" size={28} color="#3498db" />
            </View>
            <Text style={styles.actionText}>Upload Doc</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Calculator')}>
            <View style={styles.actionIcon}>
              <Ionicons name="chatbubbles-outline" size={28} color="#3498db" />
            </View>
            <Text style={styles.actionText}>Get Help</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Profile')}>
            <View style={styles.actionIcon}>
              <Ionicons name="person-outline" size={28} color="#3498db" />
            </View>
            <Text style={styles.actionText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Ionicons name="folder" size={20} color="#3498db" />
            <Text style={styles.summaryLabel}>Folders</Text>
            <Text style={styles.summaryValue}>{stats.folders}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="document" size={20} color="#3498db" />
            <Text style={styles.summaryLabel}>Documents</Text>
            <Text style={styles.summaryValue}>{stats.documents}</Text>
          </View>
        </View>
      </View>

      {recentRecords.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Calculations</Text>
          {recentRecords.map((record) => (
            <TouchableOpacity key={record.id} style={styles.recordCard} onPress={() => navigation.navigate('Calculator')}>
              <View>
                <Text style={styles.recordYear}>{record.financial_year}</Text>
                <Text style={styles.recordIncome}>{formatCurrency(record.total_income)}</Text>
              </View>
              <View style={styles.recordTax}>
                <Text style={styles.recordTaxLabel}>Tax</Text>
                <Text style={styles.recordTaxValue}>{formatCurrency(record.estimated_tax)}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
  header: {
    backgroundColor: '#2c3e50',
    padding: 20,
    paddingTop: 50,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subGreeting: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginTop: -30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 11,
    color: '#7f8c8d',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 5,
  },
  quickActions: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionIcon: {
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  summarySection: {
    padding: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLabel: {
    marginLeft: 10,
    marginRight: 5,
    color: '#7f8c8d',
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  recentSection: {
    padding: 15,
    paddingBottom: 30,
  },
  recordCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  recordYear: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  recordIncome: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 3,
  },
  recordTax: {
    alignItems: 'flex-end',
  },
  recordTaxLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  recordTaxValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
});
