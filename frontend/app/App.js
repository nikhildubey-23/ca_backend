import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, StyleSheet, AppState } from 'react-native';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { notificationService } from './services/notifications';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import DocumentsScreen from './screens/DocumentsScreen';
import TaxCalculatorScreen from './screens/TaxCalculatorScreen';
import ProfileScreen from './screens/ProfileScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import FolderScreen from './screens/FolderScreen';
import ContactScreen from './screens/ContactScreen';
import TaxCalendarScreen from './screens/TaxCalendarScreen';
import InvestmentTrackerScreen from './screens/InvestmentTrackerScreen';
import HRACalculatorScreen from './screens/HRACalculatorScreen';
import DocumentScannerScreen from './screens/DocumentScannerScreen';
import TaxHistoryScreen from './screens/TaxHistoryScreen';
import ExportReportScreen from './screens/ExportReportScreen';
import DocumentViewerScreen from './screens/DocumentViewerScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'home';
          else if (route.name === 'Documents') iconName = 'folder';
          else if (route.name === 'Calculator') iconName = 'calculator';
          else if (route.name === 'Tools') iconName = 'build';
          else if (route.name === 'Profile') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: 'gray',
        headerStyle: { backgroundColor: '#2c3e50' },
        headerTintColor: '#fff',
        headerTitle: 'MY CA APP',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Documents" component={DocumentsScreen} />
      <Tab.Screen name="Calculator" component={TaxCalculatorScreen} />
      <Tab.Screen name="Tools" component={ToolsStackNavigator} options={{ title: 'Tools' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function ToolsStackNavigator() {
  const Stack = createNativeStackNavigator();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#2c3e50' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen 
        name="ToolsHome" 
        component={ToolsHomeScreen} 
        options={{ title: 'Tax Tools' }} 
      />
      <Stack.Screen 
        name="TaxCalendar" 
        component={TaxCalendarScreen} 
        options={{ title: 'Tax Calendar' }} 
      />
      <Stack.Screen 
        name="InvestmentTracker" 
        component={InvestmentTrackerScreen} 
        options={{ title: 'Investment Tracker' }} 
      />
      <Stack.Screen 
        name="HRACalculator" 
        component={HRACalculatorScreen} 
        options={{ title: 'HRA Calculator' }} 
      />
      <Stack.Screen 
        name="DocumentScanner" 
        component={DocumentScannerScreen} 
        options={{ title: 'Document Scanner' }} 
      />
      <Stack.Screen 
        name="TaxHistory" 
        component={TaxHistoryScreen} 
        options={{ title: 'Tax History' }} 
      />
      <Stack.Screen 
        name="ExportReport" 
        component={ExportReportScreen} 
        options={{ title: 'Export Report' }} 
      />
    </Stack.Navigator>
  );
}

function ToolsHomeScreen({ navigation }) {
  const { theme } = require('./context/ThemeContext').useTheme();
  
  const tools = [
    { id: 'calendar', name: 'Tax Calendar', icon: 'calendar', color: '#3498db', screen: 'TaxCalendar', desc: 'Important dates' },
    { id: 'investment', name: 'Investment Tracker', icon: 'trending-up', color: '#27ae60', screen: 'InvestmentTracker', desc: '80C, 80D, NPS' },
    { id: 'hra', name: 'HRA Calculator', icon: 'home', color: '#9b59b6', screen: 'HRACalculator', desc: 'House Rent Allowance' },
    { id: 'scanner', name: 'Doc Scanner', icon: 'scan', color: '#e74c3c', screen: 'DocumentScanner', desc: 'Scan documents' },
    { id: 'history', name: 'Tax History', icon: 'time', color: '#f39c12', screen: 'TaxHistory', desc: 'Multi-year records' },
    { id: 'export', name: 'Export Report', icon: 'document-text', color: '#1abc9c', screen: 'ExportReport', desc: 'Generate PDF' },
  ];

  return (
    <View style={[styles.toolsContainer, { backgroundColor: theme.colors.background }]}>
      <View style={styles.toolsGrid}>
        {tools.map((tool) => (
          <View key={tool.id} style={styles.toolCard}>
            <View 
              style={[styles.toolIconContainer, { backgroundColor: tool.color + '20' }]}
              onTouchEnd={() => navigation.navigate(tool.screen)}
            >
              <Ionicons name={tool.icon} size={28} color={tool.color} />
            </View>
            <Text style={styles.toolName}>{tool.name}</Text>
            <Text style={styles.toolDesc}>{tool.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toolsContainer: {
    flex: 1,
    padding: 15,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  toolCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toolIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  toolName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  toolDesc: {
    fontSize: 11,
    color: '#7f8c8d',
    marginTop: 4,
    textAlign: 'center',
  },
});

function GuestTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Calculator') iconName = 'calculator';
          else if (route.name === 'Chatbot') iconName = 'chatbubbles';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: 'gray',
        headerStyle: { backgroundColor: '#2c3e50' },
        headerTintColor: '#fff',
        headerTitle: 'MY CA APP',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen 
        name="Calculator" 
        component={TaxCalculatorScreen}
        options={{ title: 'Tax Calculator' }}
      />
      <Tab.Screen 
        name="Chatbot" 
        component={ChatbotScreen}
        options={{ title: 'AI Assistant' }}
      />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="FolderDetail" component={FolderScreen} 
        options={{ title: 'Folder Details', headerStyle: { backgroundColor: '#2c3e50' }, headerTintColor: '#fff' }} />
      <Stack.Screen name="Contact" component={ContactScreen} 
        options={{ title: 'Contact CA', headerStyle: { backgroundColor: '#2c3e50' }, headerTintColor: '#fff' }} />
      <Stack.Screen name="ChatbotScreen" component={ChatbotScreen} 
        options={{ title: 'AI Assistant', headerStyle: { backgroundColor: '#2c3e50' }, headerTintColor: '#fff' }} />
      <Stack.Screen name="DocumentViewer" component={DocumentViewerScreen} 
        options={{ title: 'Document', headerStyle: { backgroundColor: '#2c3e50' }, headerTintColor: '#fff' }} />
    </Stack.Navigator>
  );
}

function GuestNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="GuestTabs" component={GuestTabNavigator} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    await notificationService.requestPermissions();
    await notificationService.getExpoPushToken();
    await notificationService.scheduleITRReminder();
    await notificationService.scheduleAdvanceTaxReminder();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <GuestNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
  },
});
