import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import LoadingScreen from '../components/LoadingScreen';

// Screens
import HomeScreen from '../screens/HomeScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import DonorProfileCreationScreen from '../screens/DonorProfileCreationScreen';
import CampaignProfileCreationScreen from '../screens/CampaignProfileCreationScreen';
import CampaignCreationScreen from '../screens/CampaignCreationScreen';
import UserInterface from '../screens/UserInterface';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import AdminPortalScreen from '../screens/AdminPortalScreen';

// Create navigation stacks
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main app navigator (after authentication)
const MainTabNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="UserInterface" component={UserInterface} options={{ headerShown: true }} />
      <Stack.Screen name="CampaignCreation" component={CampaignCreationScreen} options={{ headerShown: true }} />
      <Stack.Screen name="AdminPortal" component={AdminPortalScreen} options={{ headerShown: true, title: 'Admin Portal' }} />
    </Stack.Navigator>
  );
};

// Authentication navigator
const AuthNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: true }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: true }} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: true }} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} options={{ headerShown: true }} />
      <Stack.Screen name="DonorProfileCreation" component={DonorProfileCreationScreen} options={{ headerShown: true }} />
      <Stack.Screen name="CampaignProfileCreation" component={CampaignProfileCreationScreen} options={{ headerShown: true }} />
    </Stack.Navigator>
  );
};

// Root Navigator
const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const setupApp = async () => {
      // Check if we're on mobile (iOS or Android)
      const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
      
      if (isMobile) {
        // Show loading screen for 3 seconds on mobile
        setTimeout(() => {
          setIsLoading(false);
        }, 3000); // 3 seconds = 3000 milliseconds
      } else {
        // Skip loading screen on web - immediately proceed
        setIsLoading(false);
      }
    };

    setupApp();
  }, []);

  // Show loading screen only if isLoading is true (mobile platforms)
  if (isLoading) {
    return <LoadingScreen message="Loading your dreams..." />;
  }

  // Configure linking for web and deep links
  const linking = {
    prefixes: [Linking.createURL('/'), 'https://funderrapp.com'],
    config: {
      screens: {
        Auth: {
          screens: {
            Home: 'home',
            SignIn: 'signin',
            SignUp: 'signup',
            RoleSelection: 'role',
            DonorProfileCreation: 'donor-profile',
            CampaignProfileCreation: 'campaign-profile',
          },
        },
        MainApp: {
          screens: {
            Home: 'dashboard',
            Projects: 'projects',
            Profile: 'profile',
          },
        },
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Always start with Auth navigator which includes HomeScreen as first screen */}
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="MainApp" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
