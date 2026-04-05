import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Linking, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { folderService, documentService, taxService } from '../services/api';
import { notificationService } from '../services/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const { user, updateProfile, logout } = useAuth();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [pan, setPan] = useState(user?.pan || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ folders: 0, documents: 0, calculations: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setSaving(true);
    const result = await updateProfile({ name, pan: pan.toUpperCase(), phone });
    setSaving(false);

    if (result.success) {
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleLogout = () => {
    console.log('Logout button pressed');
    logout();
    console.log('Logout called');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleCall = () => {
    const phoneNumber = '9806509694';
    Linking.openURL(`tel:${phoneNumber}`).catch(err => {
      Alert.alert('Error', 'Unable to make call. Please try again.');
    });
  };

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [foldersRes, docsRes, taxRes] = await Promise.all([
        folderService.getFolders().catch(() => ({ data: { folders: [] } })),
        documentService.getDocuments().catch(() => ({ data: { documents: [] } })),
        taxService.getTaxRecords().catch(() => ({ data: { records: [] } })),
      ]);
      setStats({
        folders: foldersRes.data.folders?.length || 0,
        documents: docsRes.data.documents?.length || 0,
        calculations: taxRes.data.records?.length || 0,
      });
    } catch (error) {
      console.log('Error loading stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleShareApp = () => {
    Alert.alert(
      'Share App',
      'Share TaxPilot with your friends and family!',
      [{ text: 'OK' }]
    );
  };

  const toggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    if (value) {
      await notificationService.requestPermissions();
      await notificationService.scheduleITRReminder();
      await notificationService.scheduleAdvanceTaxReminder();
      Alert.alert('Enabled', 'Tax deadline reminders are now active');
    } else {
      await notificationService.cancelAllNotifications();
      Alert.alert('Disabled', 'Notifications have been turned off');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={50} color="#fff" />
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role === 'admin' ? 'Admin' : 'Taxpayer'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Ionicons name={editing ? 'close' : 'create'} size={24} color="#3498db" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="person-outline" size={20} color="#3498db" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Full Name</Text>
            {editing ? (
              <TextInput
                style={styles.infoInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
              />
            ) : (
              <Text style={styles.infoValue}>{user?.name || 'Not set'}</Text>
            )}
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="card-outline" size={20} color="#3498db" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>PAN Number</Text>
            {editing ? (
              <TextInput
                style={styles.infoInput}
                value={pan}
                onChangeText={setPan}
                placeholder="Enter PAN"
                autoCapitalize="characters"
                maxLength={10}
              />
            ) : (
              <Text style={styles.infoValue}>{user?.pan || 'Not set'}</Text>
            )}
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="mail-outline" size={20} color="#3498db" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="call-outline" size={20} color="#3498db" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone</Text>
            {editing ? (
              <TextInput
                style={styles.infoInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.infoValue}>{user?.phone || 'Not set'}</Text>
            )}
          </View>
        </View>

        {editing && (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            <Ionicons name="save" size={20} color="#fff" />
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        
        <TouchableOpacity style={styles.callButton} onPress={handleCall}>
          <View style={styles.callIconContainer}>
            <Ionicons name="call" size={28} color="#fff" />
          </View>
          <View style={styles.callTextContainer}>
            <Text style={styles.callText}>Call Us Now</Text>
            <Text style={styles.callNumber}>9806509694</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#27ae60" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Links</Text>
        
        <TouchableOpacity style={styles.quickLinkCard} onPress={() => navigation.navigate('Documents', { initialTab: 'folders' })}>
          <View style={styles.quickLinkLeft}>
            <View style={[styles.quickLinkIcon, { backgroundColor: '#3498db20' }]}>
              <Ionicons name="folder" size={24} color="#3498db" />
            </View>
            <View style={styles.quickLinkInfo}>
              <Text style={styles.quickLinkTitle}>My Documents</Text>
              <Text style={styles.quickLinkDesc}>View all your documents & folders</Text>
            </View>
          </View>
          <View style={styles.quickLinkRight}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{stats.documents}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickLinkCard} onPress={() => navigation.navigate('Documents', { initialTab: 'folders' })}>
          <View style={styles.quickLinkLeft}>
            <View style={[styles.quickLinkIcon, { backgroundColor: '#f39c1220' }]}>
              <Ionicons name="folder-open" size={24} color="#f39c12" />
            </View>
            <View style={styles.quickLinkInfo}>
              <Text style={styles.quickLinkTitle}>Tax History</Text>
              <Text style={styles.quickLinkDesc}>Browse your folders from CA</Text>
            </View>
          </View>
          <View style={styles.quickLinkRight}>
            <View style={[styles.badge, { backgroundColor: '#f39c12' }]}>
              <Text style={styles.badgeText}>{stats.folders}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickLinkCard} onPress={() => navigation.navigate('Calculator')}>
          <View style={styles.quickLinkLeft}>
            <View style={[styles.quickLinkIcon, { backgroundColor: '#27ae6020' }]}>
              <Ionicons name="calculator" size={24} color="#27ae60" />
            </View>
            <View style={styles.quickLinkInfo}>
              <Text style={styles.quickLinkTitle}>Tax Calculator</Text>
              <Text style={styles.quickLinkDesc}>Calculate your tax liability</Text>
            </View>
          </View>
          <View style={styles.quickLinkRight}>
            <View style={[styles.badge, { backgroundColor: '#27ae60' }]}>
              <Text style={styles.badgeText}>{stats.calculations}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickLinkCard} onPress={() => navigation.navigate('Chatbot')}>
          <View style={styles.quickLinkLeft}>
            <View style={[styles.quickLinkIcon, { backgroundColor: '#9b59b620' }]}>
              <Ionicons name="chatbubbles" size={24} color="#9b59b6" />
            </View>
            <View style={styles.quickLinkInfo}>
              <Text style={styles.quickLinkTitle}>AI Tax Help</Text>
              <Text style={styles.quickLinkDesc}>Get answers to tax questions</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickLinkCard} onPress={() => navigation.navigate('Contact')}>
          <View style={styles.quickLinkLeft}>
            <View style={[styles.quickLinkIcon, { backgroundColor: '#e74c3c20' }]}>
              <Ionicons name="call" size={24} color="#e74c3c" />
            </View>
            <View style={styles.quickLinkInfo}>
              <Text style={styles.quickLinkTitle}>Contact CA</Text>
              <Text style={styles.quickLinkDesc}>Get in touch with your CA</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#2c3e5020' }]}>
              <Ionicons name="moon" size={20} color="#2c3e50" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.menuText}>Dark Mode</Text>
              <Text style={styles.settingDesc}>{isDarkMode ? 'Currently enabled' : 'Currently disabled'}</Text>
            </View>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#ddd', true: '#3498db' }}
            thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#e74c3c20' }]}>
              <Ionicons name="notifications" size={20} color="#e74c3c" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.menuText}>Tax Reminders</Text>
              <Text style={styles.settingDesc}>ITR & deadline notifications</Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#ddd', true: '#3498db' }}
            thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={handleShareApp}>
          <View style={styles.menuIcon}>
            <Ionicons name="share-social-outline" size={20} color="#3498db" />
          </View>
          <Text style={styles.menuText}>Share App</Text>
          <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Privacy Policy', 'Coming soon!')}>
          <View style={styles.menuIcon}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#3498db" />
          </View>
          <Text style={styles.menuText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Help & Support', 'Email: support@taxpilot.in\nPhone: 9806509694')}>
          <View style={styles.menuIcon}>
            <Ionicons name="help-circle-outline" size={20} color="#3498db" />
          </View>
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>My CA App v1.0.0</Text>
        <Text style={styles.footerText}>Built for Smart Tax Management</Text>
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
    alignItems: 'center',
    paddingVertical: 30,
    paddingTop: 50,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 5,
  },
  roleBadge: {
    backgroundColor: '#3498db',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    marginTop: 10,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 20,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f4fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  infoValue: {
    fontSize: 16,
    color: '#2c3e50',
    marginTop: 2,
  },
  infoInput: {
    fontSize: 16,
    color: '#2c3e50',
    borderBottomWidth: 1,
    borderBottomColor: '#3498db',
    paddingVertical: 5,
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: '#27ae60',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f8f0',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#27ae60',
  },
  callIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  callText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27ae60',
  },
  callNumber: {
    fontSize: 14,
    color: '#2c3e50',
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f4fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingInfo: {
    flex: 1,
    marginLeft: 15,
  },
  settingDesc: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  quickLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  quickLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  quickLinkIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLinkInfo: {
    flex: 1,
    marginLeft: 12,
  },
  quickLinkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  quickLinkDesc: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  quickLinkRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 20,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  logoutBtnText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#bdc3c7',
  },
});
