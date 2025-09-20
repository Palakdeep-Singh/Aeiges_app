import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import BikesScreen from '../screens/BikesScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddBikeScreen from '../screens/AddBikeScreen';
import TheftReportScreen from '../screens/TheftReportScreen';
import EmergencyContactsScreen from '../screens/EmergencyContactsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        switch (route.name) {
          case 'Dashboard':
            iconName = focused ? 'speedometer' : 'speedometer-outline';
            break;
          case 'Bikes':
            iconName = focused ? 'bicycle' : 'bicycle-outline';
            break;
          case 'Alerts':
            iconName = focused ? 'alert-circle' : 'alert-circle-outline';
            break;
          case 'Profile':
            iconName = focused ? 'person' : 'person-outline';
            break;
          default:
            iconName = 'circle';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#3b82f6',
      tabBarInactiveTintColor: '#6b7280',
      tabBarStyle: {
        backgroundColor: '#ffffff',
        borderTopColor: '#e5e7eb',
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
      },
      headerStyle: {
        backgroundColor: '#0f172a',
      },
      headerTintColor: '#ffffff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardScreen}
      options={{ title: 'Dashboard' }}
    />
    <Tab.Screen 
      name="Bikes" 
      component={BikesScreen}
      options={{ title: 'My Bikes' }}
    />
    <Tab.Screen 
      name="Alerts" 
      component={AlertsScreen}
      options={{ title: 'Security Alerts' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
  </Tab.Navigator>
);

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
    <ActivityIndicator size="large" color="#3b82f6" />
  </View>
);

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen 
              name="AddBike" 
              component={AddBikeScreen}
              options={{ 
                headerShown: true,
                title: 'Add Bike',
                headerStyle: { backgroundColor: '#0f172a' },
                headerTintColor: '#ffffff',
              }}
            />
            <Stack.Screen 
              name="TheftReport" 
              component={TheftReportScreen}
              options={{ 
                headerShown: true,
                title: 'Report Theft',
                headerStyle: { backgroundColor: '#0f172a' },
                headerTintColor: '#ffffff',
              }}
            />
            <Stack.Screen 
              name="EmergencyContacts" 
              component={EmergencyContactsScreen}
              options={{ 
                headerShown: true,
                title: 'Emergency Contacts',
                headerStyle: { backgroundColor: '#0f172a' },
                headerTintColor: '#ffffff',
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;