import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const CampaignProfileCreationScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [focusedField, setFocusedField] = useState('');

  // Get user email when component mounts
  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const userEmail = await AsyncStorage.getItem('userEmail');
        if (!userEmail) {
          console.warn('User email not found in storage');
        }
      } catch (error) {
        console.error('Error retrieving user email:', error);
      }
    };
    getUserEmail();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={{ marginLeft: 15 }}>
          <LinearGradient
            colors={['#14b8a6', '#2563eb']}
            style={{ borderRadius: 20, padding: 8 }}
          >
            <MaterialIcons name="home" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      ),
      headerTitle: '',
      headerTransparent: true,
    });
  }, [navigation]);

  const handleSubmit = async () => {
    // Clear previous messages
    setMessage('');
    setMessageType('');
    
    // Validation
    if (!name || !organization || !description) {
      setMessage('Please fill in all fields.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('Creating your profile...');
    setMessageType('info');

    try {
      // Get email and userId from AsyncStorage
      const email = await AsyncStorage.getItem('userEmail');
      const userId = await AsyncStorage.getItem('userId');
      if (!email || !userId) {
        setMessage('Session error. Please sign in again.');
        setMessageType('error');
        setIsLoading(false);
        return;
      }
      // Save profile to backend
      const { ApiService } = require('../services/ApiService');
      await ApiService.updateUserProfile({
        role: 'campaign_creator',
        name,
        organization,
        description,
        email
      });
      await AsyncStorage.setItem('profileComplete', 'true');
      setMessage('Your campaign creator profile has been created successfully!');
      setMessageType('success');
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp', params: { screen: 'UserInterface' } }]
        });
      }, 2000);
    } catch (error) {
      console.error('Profile creation error:', error);
      setMessage('Failed to create your profile. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const AnimatedBlob = ({ style }) => (
    <Animatable.View
      animation={{
        0: { scale: 1, translateX: 0, translateY: 0, opacity: 0.1 },
        0.5: { scale: 1.1, translateX: 20, translateY: -30, opacity: 0.15 },
        1: { scale: 1, translateX: 0, translateY: 0, opacity: 0.1 },
      }}
      iterationCount="infinite"
      duration={8000}
      style={style}
    />
  );

  return (
    <LinearGradient
      colors={['#14b8a6', '#2563eb']}
      style={styles.background}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Animated Background Elements */}
      <AnimatedBlob style={[styles.blob, styles.blob1]} />
      <AnimatedBlob style={[styles.blob, styles.blob2]} />
      <AnimatedBlob style={[styles.blob, styles.blob3]} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
        >
          <Animatable.View
            style={styles.card}
            animation="fadeInUp"
            duration={1000}
            delay={300}
          >
            <LinearGradient
              colors={['#14b8a6', '#2563eb']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Header Section */}
              <View style={styles.headerSection}>
                <LinearGradient
                  colors={['#10b981', '#16a34a']}
                  style={styles.iconContainer}
                >
                  <MaterialIcons name="campaign" size={32} color="white" />
                </LinearGradient>
                
                <Text style={styles.title}>Campaign Creator Profile</Text>
                <Text style={styles.subtitle}>Tell us about your organization and campaign</Text>
              </View>

              {/* Form Section */}
              <View style={styles.formSection}>
                {/* Name Input */}
                <Animatable.View
                  style={[
                    styles.inputContainer,
                    focusedField === 'name' && styles.inputFocused
                  ]}
                  animation={focusedField === 'name' ? 'pulse' : undefined}
                  duration={1000}
                >
                  <MaterialIcons 
                    name="person" 
                    size={20} 
                    color={focusedField === 'name' ? '#2563eb' : '#64748b'} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Your Name"
                    placeholderTextColor="#94a3b8"
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField('')}
                  />
                </Animatable.View>

                {/* Organization Input */}
                <Animatable.View
                  style={[
                    styles.inputContainer,
                    focusedField === 'organization' && styles.inputFocused
                  ]}
                  animation={focusedField === 'organization' ? 'pulse' : undefined}
                  duration={1000}
                >
                  <MaterialIcons 
                    name="business" 
                    size={20} 
                    color={focusedField === 'organization' ? '#2563eb' : '#64748b'} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Organization Name"
                    placeholderTextColor="#94a3b8"
                    value={organization}
                    onChangeText={setOrganization}
                    onFocus={() => setFocusedField('organization')}
                    onBlur={() => setFocusedField('')}
                  />
                </Animatable.View>

                {/* Description Input */}
                <Animatable.View
                  style={[
                    styles.inputContainer,
                    styles.textAreaContainer,
                    focusedField === 'description' && styles.inputFocused
                  ]}
                  animation={focusedField === 'description' ? 'pulse' : undefined}
                  duration={1000}
                >
                  <MaterialIcons 
                    name="description" 
                    size={20} 
                    color={focusedField === 'description' ? '#2563eb' : '#64748b'} 
                    style={[styles.inputIcon, styles.textAreaIcon]} 
                  />
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Campaign Description"
                    placeholderTextColor="#94a3b8"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    onFocus={() => setFocusedField('description')}
                    onBlur={() => setFocusedField('')}
                  />
                </Animatable.View>

                {/* Message Display */}
                {message ? (
                  <Animatable.View
                    style={[
                      styles.messageContainer,
                      messageType === 'success' ? styles.successMessage :
                      messageType === 'error' ? styles.errorMessage :
                      styles.infoMessage
                    ]}
                    animation="fadeInUp"
                    duration={500}
                  >
                    <Text style={styles.messageText}>{message}</Text>
                  </Animatable.View>
                ) : null}

                {/* Submit Button */}
                <Animatable.View
                  animation="fadeInUp"
                  duration={800}
                  delay={600}
                >
                  <TouchableOpacity
                    style={[styles.submitButton, isLoading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={isLoading ? ['#94a3b8', '#64748b'] : ['#14b8a6', '#2563eb']}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {isLoading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator size="small" color="#ffffff" />
                          <Text style={styles.buttonText}>Creating Profile...</Text>
                        </View>
                      ) : (
                        <View style={styles.buttonContent}>
                          <Text style={styles.buttonText}>Create Profile</Text>
                          <MaterialIcons 
                            name="arrow-forward" 
                            size={20} 
                            color="white" 
                            style={styles.buttonIcon} 
                          />
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animatable.View>
              </View>
            </LinearGradient>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width,
    height,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  // Animated Background Blobs
  blob: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
  },
  blob1: {
    width: 200,
    height: 200,
    backgroundColor: '#ffffff',
    top: 100,
    left: -50,
  },
  blob2: {
    width: 150,
    height: 150,
    backgroundColor: '#ffffff',
    top: 300,
    right: -30,
  },
  blob3: {
    width: 120,
    height: 120,
    backgroundColor: '#ffffff',
    bottom: 200,
    left: 50,
  },
  // Card Styles
  card: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 24,
    padding: 32,
    shadowColor: '#14b8a6',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 15 },
    shadowRadius: 30,
    elevation: 20,
    transform: [{ scale: 1 }],
  },
  cardGradient: {
    borderRadius: 24,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
  },
  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: -4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#10b981',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Form Section
  formSection: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: -4,
  },
  // Input Styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: 'rgba(255, 255, 255, 0.5)',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  inputFocused: {
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    shadowColor: 'rgba(255, 255, 255, 0.8)',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  textAreaIcon: {
    marginTop: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    paddingVertical: 16,
    fontWeight: '500',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  // Message Styles
  messageContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  successMessage: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: '#22c55e',
  },
  errorMessage: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#ef4444',
  },
  infoMessage: {
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    borderColor: '#14b8a6',
  },
  messageText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  // Button Styles
  submitButton: {
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#14b8a6',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    shadowOpacity: 0.1,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CampaignProfileCreationScreen;