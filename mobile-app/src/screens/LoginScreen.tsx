import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';

const LoginScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      
      // Get Google redirect URL
      const { redirectUrl } = await ApiService.getGoogleRedirectUrl();
      
      // Open Google OAuth in browser
      const supported = await Linking.canOpenURL(redirectUrl);
      if (supported) {
        await Linking.openURL(redirectUrl);
        
        // Note: In a production app, you'd handle the redirect back to the app
        // For now, we'll show instructions to the user
        Alert.alert(
          'Complete Login',
          'Please complete the login in your browser and return to the app. Then tap "I\'ve completed login" below.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: "I've completed login",
              onPress: () => handleLoginComplete(),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Unable to open browser for authentication');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Error', 'Failed to initiate login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginComplete = async () => {
    try {
      setIsLoading(true);
      
      // In a production app, you'd get the authorization code from the redirect
      // For demo purposes, we'll simulate a successful login
      // You would need to implement proper OAuth callback handling
      
      Alert.alert(
        'Demo Mode',
        'This is a demo mobile app. In production, OAuth would be handled properly with app-to-app redirects.',
        [
          {
            text: 'Continue with Demo',
            onPress: () => {
              // Simulate successful login - in production you'd use real session token
              login('demo-session-token');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Login completion error:', error);
      Alert.alert('Login Error', 'Failed to complete login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="shield-checkmark" size={80} color="#3b82f6" />
          </View>
          <Text style={styles.title}>CycleGuard Pro</Text>
          <Text style={styles.subtitle}>
            Protect your bike with advanced security monitoring
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="location" size={24} color="#10b981" />
            <Text style={styles.featureText}>Real-time GPS tracking</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="alert-circle" size={24} color="#f59e0b" />
            <Text style={styles.featureText}>Instant theft alerts</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="people" size={24} color="#8b5cf6" />
            <Text style={styles.featureText}>Emergency contacts</Text>
          </View>
        </View>

        <View style={styles.loginSection}>
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            <Ionicons 
              name="logo-google" 
              size={20} 
              color="#ffffff" 
              style={styles.loginIcon} 
            />
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Connecting...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    marginTop: 60,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#e2e8f0',
    marginLeft: 16,
  },
  loginSection: {
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#64748b',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginIcon: {
    marginRight: 12,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default LoginScreen;