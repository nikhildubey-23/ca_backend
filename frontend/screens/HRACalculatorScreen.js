import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HRACalculatorScreen({ navigation }) {
  const [basicSalary, setBasicSalary] = useState('');
  const [dearnessAllowance, setDearnessAllowance] = useState('');
  const [hraReceived, setHraReceived] = useState('');
  const [rentPaid, setRentPaid] = useState('');
  const [metroCity, setMetroCity] = useState(true);

  const calculateHRA = () => {
    const basic = parseFloat(basicSalary) || 0;
    const da = parseFloat(dearnessAllowance) || 0;
    const hra = parseFloat(hraReceived) || 0;
    const rent = parseFloat(rentPaid) || 0;

    const salary = basic + da;
    const annualSalary = salary * 12;

    const hraExemption1 = hra;
    const hraExemption2 = rent - (annualSalary * 0.1);
    const hraExemption3 = metroCity ? (annualSalary * 0.5) : (annualSalary * 0.4);
    
    const hraExemption = Math.min(hraExemption1, hraExemption2 > 0 ? hraExemption2 : 0, hraExemption3);
    const taxableHRA = Math.max(0, hra - hraExemption);
    const annualRent = rent * 12;
    const annualHraReceived = hra * 12;

    return {
      annualSalary,
      annualHraReceived,
      annualRent,
      hraExemption: Math.round(hraExemption),
      taxableHRA: Math.round(taxableHRA),
      savings: Math.round(taxableHRA * 0.3),
    };
  };

  const formatCurrency = (amount) => {
    return '₹' + Math.round(amount).toLocaleString('en-IN');
  };

  const result = calculateHRA();
  const hasData = basicSalary && hraReceived && rentPaid;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HRA Calculator</Text>
        <Text style={styles.headerSubtitle}>Calculate your House Rent Allowance exemption</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3498db" />
          <Text style={styles.infoText}>
            HRA exemption is calculated as the minimum of: HRA received, Rent paid - 10% of salary, 
            or 50% (metro) / 40% (non-metro) of salary.
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Enter Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Basic Salary (Monthly)</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputPrefix}>₹</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={basicSalary}
                onChangeText={setBasicSalary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Dearness Allowance (Monthly)</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputPrefix}>₹</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={dearnessAllowance}
                onChangeText={setDearnessAllowance}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>HRA Received (Monthly)</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputPrefix}>₹</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={hraReceived}
                onChangeText={setHraReceived}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Rent Paid (Monthly)</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputPrefix}>₹</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={rentPaid}
                onChangeText={setRentPaid}
              />
            </View>
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.inputLabel}>Do you live in a Metro City?</Text>
            <View style={styles.switchRow}>
              <TouchableOpacity
                style={[styles.switchButton, metroCity && styles.switchActive]}
                onPress={() => setMetroCity(true)}
              >
                <Text style={[styles.switchText, metroCity && styles.switchTextActive]}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.switchButton, !metroCity && styles.switchActive]}
                onPress={() => setMetroCity(false)}
              >
                <Text style={[styles.switchText, !metroCity && styles.switchTextActive]}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {hasData && (
          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>Your HRA Exemption</Text>

            <View style={styles.resultCard}>
              <View style={styles.resultMain}>
                <Ionicons name="checkmark-circle" size={40} color="#27ae60" />
                <View style={styles.resultMainText}>
                  <Text style={styles.resultLabel}>Exempt from Tax</Text>
                  <Text style={styles.resultValue}>{formatCurrency(result.hraExemption)}</Text>
                </View>
              </View>

              <View style={styles.resultDivider} />

              <View style={styles.resultRow}>
                <View style={styles.resultItem}>
                  <Text style={styles.resultItemLabel}>HRA Received</Text>
                  <Text style={styles.resultItemValue}>{formatCurrency(result.annualHraReceived)}</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.resultItemLabel}>Taxable HRA</Text>
                  <Text style={[styles.resultItemValue, { color: '#e74c3c' }]}>
                    {formatCurrency(result.taxableHRA)}
                  </Text>
                </View>
              </View>

              <View style={styles.resultRow}>
                <View style={styles.resultItem}>
                  <Text style={styles.resultItemLabel}>Annual Salary</Text>
                  <Text style={styles.resultItemValue}>{formatCurrency(result.annualSalary)}</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.resultItemLabel}>Annual Rent</Text>
                  <Text style={styles.resultItemValue}>{formatCurrency(result.annualRent)}</Text>
                </View>
              </View>

              <View style={styles.savingsCard}>
                <Ionicons name="wallet" size={24} color="#27ae60" />
                <View style={styles.savingsContent}>
                  <Text style={styles.savingsLabel}>Potential Tax Savings</Text>
                  <Text style={styles.savingsValue}>{formatCurrency(result.savings)}</Text>
                  <Text style={styles.savingsNote}>at 30% tax bracket</Text>
                </View>
              </View>
            </View>

            <View style={styles.tipCard}>
              <Ionicons name="bulb" size={20} color="#f39c12" />
              <Text style={styles.tipText}>
                Keep rent receipts and landlord PAN (if rent > ₹1 lakh/year) for ITR filing.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>How HRA is Calculated</Text>
          
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>1. HRA Received</Text>
              <Text style={styles.breakdownValue}>
                {formatCurrency(result.annualHraReceived)} /year
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>2. Rent - 10% of Salary</Text>
              <Text style={styles.breakdownValue}>
                {formatCurrency(Math.max(0, result.annualRent - result.annualSalary * 0.1))} /year
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>3. {metroCity ? '50%' : '40%'} of Salary</Text>
              <Text style={styles.breakdownValue}>
                {formatCurrency(metroCity ? result.annualSalary * 0.5 : result.annualSalary * 0.4)} /year
              </Text>
            </View>
            <View style={styles.breakdownResult}>
              <Text style={styles.breakdownResultLabel}>Final Exemption (Minimum)</Text>
              <Text style={styles.breakdownResultValue}>{formatCurrency(result.hraExemption)}</Text>
            </View>
          </View>
        </View>
      </View>
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
  content: {
    padding: 15,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e8f4fd',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  inputPrefix: {
    fontSize: 16,
    color: '#7f8c8d',
    marginRight: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#2c3e50',
  },
  switchContainer: {
    marginTop: 5,
  },
  switchRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginRight: 5,
  },
  switchActive: {
    backgroundColor: '#3498db',
  },
  switchText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  switchTextActive: {
    color: '#fff',
  },
  resultSection: {
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  resultMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultMainText: {
    marginLeft: 15,
  },
  resultLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  resultValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  resultDivider: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginVertical: 15,
  },
  resultRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  resultItem: {
    flex: 1,
  },
  resultItemLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  resultItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 2,
  },
  savingsCard: {
    flexDirection: 'row',
    backgroundColor: '#e8f8f0',
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    alignItems: 'center',
  },
  savingsContent: {
    marginLeft: 12,
  },
  savingsLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  savingsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  savingsNote: {
    fontSize: 10,
    color: '#7f8c8d',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#fef9e7',
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    alignItems: 'center',
  },
  tipText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#2c3e50',
  },
  breakdownSection: {
    marginBottom: 30,
  },
  breakdownCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  breakdownResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    marginTop: 5,
  },
  breakdownResultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  breakdownResultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
});
