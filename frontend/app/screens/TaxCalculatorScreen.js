import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { taxService } from '../services/api';

export default function TaxCalculatorScreen() {
  const [regime, setRegime] = useState('new');
  const [financialYear, setFinancialYear] = useState('2024-25');
  const [basicSalary, setBasicSalary] = useState('');
  const [houseRent, setHouseRent] = useState('');
  const [otherAllowances, setOtherAllowances] = useState('');
  const [professionalTax, setProfessionalTax] = useState('');
  const [section80C, setSection80C] = useState('');
  const [section80D, setSection80D] = useState('');
  const [section80G, setSection80G] = useState('');
  const [section80E, setSection80E] = useState('');
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const res = await taxService.getSuggestions();
      setSuggestions(res.data.suggestions || []);
    } catch (error) {
      console.error('Load suggestions error:', error);
    }
  };

  const calculateTax = async () => {
    const totalIncome = parseFloat(basicSalary || 0) + parseFloat(houseRent || 0) + parseFloat(otherAllowances || 0);
    
    if (totalIncome <= 0) {
      Alert.alert('Error', 'Please enter your income details');
      return;
    }

    setCalculating(true);
    try {
      const data = {
        total_income: totalIncome,
        basic_salary: parseFloat(basicSalary || 0),
        house_rent_allowance: parseFloat(houseRent || 0),
        other_allowances: parseFloat(otherAllowances || 0),
        professional_tax: parseFloat(professionalTax || 0),
        section_80c: parseFloat(section80C || 0),
        section_80d: parseFloat(section80D || 0),
        section_80g: parseFloat(section80G || 0),
        section_80e: parseFloat(section80E || 0),
        financial_year: financialYear,
        regime,
      };

      const res = await taxService.calculateTax(data);
      setResult(res.data.calculation);
    } catch (error) {
      Alert.alert('Error', 'Failed to calculate tax');
    } finally {
      setCalculating(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const renderInput = (label, value, setter, placeholder, icon) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <Ionicons name={icon} size={20} color="#3498db" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setter}
          placeholder={placeholder}
          keyboardType="numeric"
          placeholderTextColor="#bdc3c7"
        />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tax Calculator</Text>
        <Text style={styles.headerSubtitle}>Estimate your tax liability</Text>
      </View>

      <View style={styles.regimeToggle}>
        <TouchableOpacity
          style={[styles.regimeBtn, regime === 'new' && styles.regimeBtnActive]}
          onPress={() => setRegime('new')}
        >
          <Text style={[styles.regimeBtnText, regime === 'new' && styles.regimeBtnTextActive]}>New Regime</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.regimeBtn, regime === 'old' && styles.regimeBtnActive]}
          onPress={() => setRegime('old')}
        >
          <Text style={[styles.regimeBtnText, regime === 'old' && styles.regimeBtnTextActive]}>Old Regime</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Income Details</Text>
        {renderInput('Basic Salary', basicSalary, setBasicSalary, 'Enter basic salary', 'cash-outline')}
        {renderInput('House Rent Allowance', houseRent, setHouseRent, 'Enter HRA', 'home-outline')}
        {renderInput('Other Allowances', otherAllowances, setOtherAllowances, 'Enter other allowances', 'add-circle-outline')}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Deductions</Text>
        {renderInput('Professional Tax', professionalTax, setProfessionalTax, 'Enter PT', 'card-outline')}
        {regime === 'old' && (
          <>
            {renderInput('Section 80C', section80C, setSection80C, 'Max ₹1,50,000', 'trending-down-outline')}
            {renderInput('Section 80D', section80D, setSection80D, 'Health insurance', 'medkit-outline')}
            {renderInput('Section 80G', section80G, setSection80G, 'Donations', 'heart-outline')}
            {renderInput('Section 80E', section80E, setSection80E, 'Education loan', 'school-outline')}
          </>
        )}
      </View>

      <TouchableOpacity style={styles.calculateBtn} onPress={calculateTax} disabled={calculating}>
        {calculating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="calculator" size={20} color="#fff" />
            <Text style={styles.calculateBtnText}>Calculate Tax</Text>
          </>
        )}
      </TouchableOpacity>

      {result && (
        <View style={styles.resultSection}>
          <Text style={styles.resultTitle}>Tax Calculation Result</Text>
          <View style={styles.resultCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Gross Income</Text>
              <Text style={styles.resultValue}>{formatCurrency(result.gross_income)}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Total Deductions</Text>
              <Text style={styles.resultValue}>{formatCurrency(result.total_deductions)}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Taxable Income</Text>
              <Text style={styles.resultValue}>{formatCurrency(result.taxable_income)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Tax Amount</Text>
              <Text style={styles.resultValue}>{formatCurrency(result.tax_before_cess)}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Cess (4%)</Text>
              <Text style={styles.resultValue}>{formatCurrency(result.cess)}</Text>
            </View>
            {result.rebate_87a > 0 && (
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Rebate 87A</Text>
                <Text style={[styles.resultValue, { color: '#27ae60' }]}>-{formatCurrency(result.rebate_87a)}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.resultRow}>
              <Text style={styles.totalLabel}>Total Tax Payable</Text>
              <Text style={styles.totalValue}>{formatCurrency(result.total_tax)}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Effective Rate</Text>
              <Text style={styles.resultValue}>{result.effective_rate}%</Text>
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.suggestionsBtn} onPress={() => setShowSuggestions(!showSuggestions)}>
        <Ionicons name="bulb" size={20} color="#f39c12" />
        <Text style={styles.suggestionsBtnText}>Tax Saving Tips</Text>
        <Ionicons name={showSuggestions ? 'chevron-up' : 'chevron-down'} size={20} color="#f39c12" />
      </TouchableOpacity>

      {showSuggestions && (
        <View style={styles.suggestionsSection}>
          {suggestions.map((item, index) => (
            <View key={index} style={styles.suggestionCard}>
              <View style={styles.suggestionHeader}>
                <Text style={styles.suggestionTitle}>{item.section}</Text>
                <Text style={styles.suggestionMax}>Max: {item.max_saving}</Text>
              </View>
              {item.options.map((opt, i) => (
                <Text key={i} style={styles.suggestionOption}>• {opt}</Text>
              ))}
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 30 }} />
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
  regimeToggle: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  regimeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  regimeBtnActive: {
    backgroundColor: '#3498db',
  },
  regimeBtnText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  regimeBtnTextActive: {
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  calculateBtn: {
    flexDirection: 'row',
    backgroundColor: '#3498db',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calculateBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  resultSection: {
    marginHorizontal: 15,
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  divider: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  suggestionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  suggestionsBtnText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  suggestionsSection: {
    marginHorizontal: 15,
  },
  suggestionCard: {
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
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  suggestionMax: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '500',
  },
  suggestionOption: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
    marginLeft: 10,
  },
});
