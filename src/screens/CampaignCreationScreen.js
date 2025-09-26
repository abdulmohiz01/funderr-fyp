import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '../services/ApiService';

const { width, height } = Dimensions.get('window');

const CampaignCreationScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fundingGoal, setFundingGoal] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [focusedInput, setFocusedInput] = useState('');

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

    // Validate input fields
    if (!title.trim()) {
      setMessage('Please enter a campaign title');
      setMessageType('error');
      return;
    }

    if (!description.trim()) {
      setMessage('Please enter a campaign description');
      setMessageType('error');
      return;
    }

    if (!fundingGoal || isNaN(parseFloat(fundingGoal)) || parseFloat(fundingGoal) <= 0) {
      setMessage('Please enter a valid funding goal amount');
      setMessageType('error');
      return;
    }

    if (!category.trim()) {
      setMessage('Please select a category');
      setMessageType('error');
      return;
    }

    setMessage('Creating your campaign...');
    setMessageType('info');
    setIsSubmitting(true);

    try {
      const campaignData = {
        title,
        description,
        goal: parseFloat(fundingGoal),
        category: category.toUpperCase(),
      };
      await ApiService.createCampaign(campaignData);
      setMessage('Your campaign has been submitted for review and will be published within 24 hours.');
      setMessageType('success');
      setTimeout(() => {
        navigation.navigate('UserInterface', { refreshCampaigns: true });
      }, 2000);
    } catch (error) {
      console.error('Campaign submission error:', error);
      setMessage('There was an error creating your campaign. Please try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Background with animated elements */}
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        style={styles.backgroundGradient}
      />
      
      {/* Animated background blobs */}
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={4000}
        style={[styles.blob, styles.blob1]}
      >
        <LinearGradient
          colors={['#14b8a6', '#2563eb']}
          style={styles.blobGradient}
        />
      </Animatable.View>
      
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={6000}
        style={[styles.blob, styles.blob2]}
      >
        <LinearGradient
          colors={['#8b5cf6', '#ec4899']}
          style={styles.blobGradient}
        />
      </Animatable.View>
      
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={5000}
        style={[styles.blob, styles.blob3]}
      >
        <LinearGradient
          colors={['#10b981', '#16a34a']}
          style={styles.blobGradient}
        />
      </Animatable.View>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <Animatable.View 
              animation="fadeInDown" 
              duration={1000} 
              style={styles.headerContainer}
            >
              <LinearGradient
                colors={['rgba(20, 184, 166, 0.15)', 'rgba(37, 99, 235, 0.15)']}
                style={styles.headerCard}
              >
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <LinearGradient
                    colors={['#14b8a6', '#2563eb']}
                    style={styles.backButtonGradient}
                  >
                    <MaterialIcons name="arrow-back" size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Campaign</Text>
                <View style={{ width: 40 }} />
              </LinearGradient>
            </Animatable.View>

            {/* Main Form Card */}
            <Animatable.View
              animation="fadeInUp"
              duration={1000}
              delay={200}
              style={styles.formCardContainer}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.04)']}
                style={styles.formCard}
              >
                {/* Section Header */}
                <Animatable.View 
                  style={styles.sectionHeader}
                  animation="pulse"
                  iterationCount={1}
                  duration={1500}
                >
                  <LinearGradient
                    colors={['#14b8a6', '#2563eb']}
                    style={styles.sectionHeaderGradient}
                  >
                    <Text style={styles.sectionTitle}>Campaign Details</Text>
                    <Text style={styles.sectionSubtitle}>Fill in the information below to get started</Text>
                  </LinearGradient>
                </Animatable.View>

                {/* Title Input */}
                <Animatable.View 
                  style={styles.inputGroup}
                  animation="fadeInUp"
                  delay={400}
                >
                  <View style={styles.labelRow}>
                    <LinearGradient
                      colors={['#14b8a6', '#2563eb']}
                      style={styles.iconGradient}
                    >
                      <Ionicons name="document-text-outline" size={16} color="white" />
                    </LinearGradient>
                    <Text style={styles.inputLabel}>Campaign Title</Text>
                  </View>
                  <View style={[
                    styles.inputContainer,
                    focusedInput === 'title' && styles.inputContainerFocused
                  ]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter a compelling campaign title"
                      value={title}
                      onChangeText={setTitle}
                      onFocus={() => setFocusedInput('title')}
                      onBlur={() => setFocusedInput('')}
                      placeholderTextColor="#64748b"
                    />
                  </View>
                  <Text style={styles.inputHint}>Choose a clear and inspiring title for your campaign</Text>
                </Animatable.View>

                {/* Description Input */}
                <Animatable.View 
                  style={styles.inputGroup}
                  animation="fadeInUp"
                  delay={600}
                >
                  <View style={styles.labelRow}>
                    <LinearGradient
                      colors={['#8b5cf6', '#ec4899']}
                      style={styles.iconGradient}
                    >
                      <Ionicons name="list-outline" size={16} color="white" />
                    </LinearGradient>
                    <Text style={styles.inputLabel}>Campaign Description</Text>
                  </View>
                  <View style={[
                    styles.inputContainer,
                    styles.textAreaContainer,
                    focusedInput === 'description' && styles.inputContainerFocused
                  ]}>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Tell people why you're raising funds and how it will make a difference..."
                      value={description}
                      onChangeText={setDescription}
                      onFocus={() => setFocusedInput('description')}
                      onBlur={() => setFocusedInput('')}
                      multiline
                      numberOfLines={6}
                      textAlignVertical="top"
                      placeholderTextColor="#64748b"
                    />
                  </View>
                  <Text style={styles.inputHint}>Explain your cause, goals, and how donations will be used</Text>
                </Animatable.View>

                {/* Funding Goal Input */}
                <Animatable.View 
                  style={styles.inputGroup}
                  animation="fadeInUp"
                  delay={800}
                >
                  <View style={styles.labelRow}>
                    <LinearGradient
                      colors={['#10b981', '#16a34a']}
                      style={styles.iconGradient}
                    >
                      <Ionicons name="cash-outline" size={16} color="white" />
                    </LinearGradient>
                    <Text style={styles.inputLabel}>Funding Goal (ETH)</Text>
                  </View>
                  <View style={[
                    styles.currencyInputContainer,
                    focusedInput === 'goal' && styles.inputContainerFocused
                  ]}>
                    <LinearGradient
                      colors={['#0f766e', '#14b8a6']}
                      style={styles.currencyLabel}
                    >
                      <Text style={styles.currencyText}>ETH</Text>
                    </LinearGradient>
                    <TextInput
                      style={styles.currencyInput}
                      placeholder="1.5"
                      value={fundingGoal}
                      onChangeText={setFundingGoal}
                      onFocus={() => setFocusedInput('goal')}
                      onBlur={() => setFocusedInput('')}
                      keyboardType="numeric"
                      placeholderTextColor="#64748b"
                    />
                  </View>
                  <Text style={styles.inputHint}>Set a realistic target amount for your fundraising goal (in Ether)</Text>
                </Animatable.View>
                
                {/* Category Selection */}
                <Animatable.View 
                  style={styles.inputGroup}
                  animation="fadeInUp"
                  delay={1000}
                >
                  <View style={styles.labelRow}>
                    <LinearGradient
                      colors={['#8b5cf6', '#ec4899']}
                      style={styles.iconGradient}
                    >
                      <Ionicons name="pricetag-outline" size={16} color="white" />
                    </LinearGradient>
                    <Text style={styles.inputLabel}>Campaign Category</Text>
                  </View>
                  <View style={styles.categoryButtonsContainer}>
                    {['Education', 'Health', 'Emergency', 'Water', 'Food', 'Sports', 'Arts'].map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryButton,
                          category === cat && styles.categoryButtonSelected
                        ]}
                        onPress={() => setCategory(cat)}
                      >
                        {category === cat ? (
                          <LinearGradient
                            colors={['#14b8a6', '#2563eb']}
                            style={styles.categoryButtonGradient}
                          >
                            <Text style={styles.categoryButtonTextSelected}>
                              {cat}
                            </Text>
                          </LinearGradient>
                        ) : (
                          <Text style={styles.categoryButtonText}>
                            {cat}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.inputHint}>Select the category that best describes your campaign</Text>
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
                    <Animatable.Text 
                      style={styles.messageText}
                      animation="pulse" 
                      iterationCount={messageType === 'error' ? 2 : 1}
                    >
                      {message}
                    </Animatable.Text>
                  </Animatable.View>
                ) : null}

                {/* Submit Button */}
                <Animatable.View
                  animation="fadeInUp"
                  delay={1400}
                >
                  <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                  >
                    <LinearGradient
                      colors={isSubmitting ? ['#64748b', '#475569'] : ['#14b8a6', '#2563eb']}
                      style={styles.submitButtonGradient}
                    >
                      {isSubmitting ? (
                        <View style={styles.submitButtonContent}>
                          <ActivityIndicator size="small" color="#fff" />
                          <Text style={[styles.submitButtonText, { marginLeft: 8 }]}>
                            Submitting...
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.submitButtonContent}>
                          <Ionicons name="rocket-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                          <Text style={styles.submitButtonText}>Launch Campaign</Text>
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animatable.View>

                {/* Back to Home Button */}
                <Animatable.View
                  animation="fadeInUp"
                  delay={1500}
                >
                  <TouchableOpacity
                    style={styles.backToHomeButton}
                    onPress={() => navigation.navigate('UserInterface')}
                  >
                    <LinearGradient
                      colors={['rgba(20, 184, 166, 0.1)', 'rgba(37, 99, 235, 0.1)']}
                      style={styles.backToHomeGradient}
                    >
                      <Ionicons name="chevron-back" size={16} color="#14b8a6" />
                      <Text style={styles.backToHomeText}>Back to Home</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animatable.View>

                {/* Review Note */}
                <Animatable.Text 
                  style={styles.reviewNote}
                  animation="fadeIn"
                  delay={1600}
                >
                  <Ionicons name="information-circle-outline" size={14} color="#64748b" />
                  {' '}Your campaign will be reviewed and published within 24 hours
                </Animatable.Text>
              </LinearGradient>
            </Animatable.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blob: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.3,
  },
  blob1: {
    width: 200,
    height: 200,
    top: -50,
    left: -50,
  },
  blob2: {
    width: 150,
    height: 150,
    top: height * 0.3,
    right: -30,
  },
  blob3: {
    width: 120,
    height: 120,
    bottom: height * 0.2,
    left: 30,
  },
  blobGradient: {
    flex: 1,
    borderRadius: 100,
  },
  safeArea: {
    flex: 1,
    paddingTop: 30,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight + 20,
    paddingBottom: 20,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 4,
  },
  backButtonGradient: {
    padding: 8,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  formCardContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  sectionHeader: {
    marginBottom: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionHeaderGradient: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 28,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconGradient: {
    padding: 6,
    borderRadius: 8,
    marginRight: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  inputContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputContainerFocused: {
    borderWidth: 2,
    borderColor: '#14b8a6',
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
  textAreaContainer: {
    minHeight: 120,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 8,
    marginLeft: 4,
    lineHeight: 18,
  },
  currencyInputContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  currencyLabel: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  currencyInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
  categoryButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  categoryButton: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    margin: 4,
  },
  categoryButtonSelected: {
    borderColor: 'transparent',
  },
  categoryButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryButtonText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryButtonTextSelected: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  messageContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    marginTop: 8,
    borderWidth: 1,
  },
  successMessage: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
  },
  errorMessage: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#ef4444',
  },
  infoMessage: {
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderColor: '#14b8a6',
  },
  messageText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    lineHeight: 20,
  },
  submitButton: {
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backToHomeButton: {
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  backToHomeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backToHomeText: {
    fontSize: 15,
    color: '#14b8a6',
    fontWeight: '600',
    marginLeft: 6,
  },
  reviewNote: {
    textAlign: 'center',
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
  },
});
export default CampaignCreationScreen;