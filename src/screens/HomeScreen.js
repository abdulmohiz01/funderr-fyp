import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  StatusBar
} from 'react-native';
import { MaterialIcons, Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';

// Use useWindowDimensions hook instead of static dimensions to respond to orientation changes
import { useWindowDimensions } from 'react-native';

export default function HomeScreen({ navigation }) {
  // Get dynamic window dimensions for better responsiveness
  const { width, height } = useWindowDimensions();
  
  // Professional crowdfunding stats
  const [stats, setStats] = useState({
    totalRaised: 0,
    activeCampaigns: 0,
    successfulProjects: 0
  });
  
  // Animation state
  const [isVisible, setIsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState(false);
  
  // Animation references
  const logoRef = useRef(null);
  const titleRef = useRef(null);
  const heroRef = useRef(null);
  const statsRefs = [useRef(null), useRef(null), useRef(null)];
  const featureRefs = [useRef(null), useRef(null), useRef(null)];
  const buttonRef = useRef(null);
  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);
  
  useEffect(() => {
    // Trigger initial animations
    setIsVisible(true);
    
    // Sequence animations with timing
    const animationDelay = 300;
    
    setTimeout(() => {
      logoRef.current?.fadeIn(1000);
    }, animationDelay);
    
    setTimeout(() => {
      titleRef.current?.fadeInDown(800);
    }, animationDelay + 400);
    
    setTimeout(() => {
      heroRef.current?.fadeIn(800);
    }, animationDelay + 800);
    
    // Animate stats with staggered effect
    statsRefs.forEach((ref, index) => {
      setTimeout(() => {
        ref.current?.fadeInUp(800);
        if (index === 0) setAnimatedStats(true);
      }, animationDelay + 1200 + (index * 200));
    });
    
    // Animate features
    featureRefs.forEach((ref, index) => {
      setTimeout(() => {
        ref.current?.fadeInUp(800);
      }, animationDelay + 2000 + (index * 300));
    });
    
    setTimeout(() => {
      buttonRef.current?.pulse(1000);
    }, animationDelay + 3200);

    // Simulate real crowdfunding stats with smooth counting animation
    const interval = setInterval(() => {
      setStats(prev => ({
        totalRaised: prev.totalRaised + Math.floor(Math.random() * 50) + 10,
        activeCampaigns: Math.floor(Math.random() * 500) + 1200,
        successfulProjects: Math.floor(Math.random() * 50) + 850
      }));
    }, 8000);

    // Initial stats
    setStats({
      totalRaised: 2547830,
      activeCampaigns: 1247,
      successfulProjects: 892
    });

    return () => clearInterval(interval);
  }, []);
  
  const showHelp = () => {
    Alert.alert('Help & Support', 'Need assistance? Contact our support team at support@funderr.com or browse our FAQ section.');
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Animated Background Patterns - Using Views instead of divs */}
      <View style={styles.backgroundPatterns}>
        <Animatable.View animation="pulse" iterationCount="infinite" duration={3000} style={[styles.bgPattern, styles.bgPattern1]} />
        <Animatable.View animation="bounceIn" iterationCount="infinite" duration={3000} delay={1000} style={[styles.bgPattern, styles.bgPattern2]} />
        <Animatable.View animation="pulse" iterationCount="infinite" duration={4000} delay={2000} style={[styles.bgPattern, styles.bgPattern3]} />
        <Animatable.View animation="pulse" iterationCount="infinite" duration={3000} delay={1500} style={[styles.bgPattern, styles.bgPattern4]} />
        <Animatable.View animation="bounceIn" iterationCount="infinite" duration={5000} delay={3000} style={[styles.bgPattern, styles.bgPattern5]} />
        
        {/* Floating geometric shapes */}
        <Animatable.View animation="rotate" iterationCount="infinite" duration={8000} style={[styles.geometricShape, styles.shape1]} />
        <Animatable.View animation="rotate" iterationCount="infinite" duration={12000} style={[styles.geometricShape, styles.shape2]} />
      </View>

      {/* Modern Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Animatable.View 
            ref={logoRef} 
            animation="fadeIn" 
            duration={1000} 
            delay={300} 
            style={styles.logoContainer}
          >
            <LinearGradient
              colors={['#14b8a6', '#2563eb']}
              style={styles.logoCircle}
            >
              <MaterialIcons name="favorite" size={24} color="white" />
            </LinearGradient>
            <Animatable.Text 
              ref={titleRef}
              animation="fadeInDown" 
              duration={800} 
              delay={700}
              style={styles.headerTitle}
            >
              Funderr
            </Animatable.Text>
          </Animatable.View>
          
          {/* Help button positioned at top-right */}
          <TouchableOpacity onPress={showHelp} style={styles.helpButton}>
            <MaterialIcons name="help-outline" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.body}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroBackgroundElements}>
            <Animatable.View animation="pulse" iterationCount="infinite" duration={6000} style={styles.heroBackground1} />
            <Animatable.View animation="pulse" iterationCount="infinite" duration={8000} style={styles.heroBackground2} />
          </View>
          
          <View style={styles.heroGrid}>
            {/* Hero Text */}
            <Animatable.View
              ref={heroRef}
              animation="fadeInLeft" 
              duration={1000} 
              delay={1100}
              style={styles.heroTextContainer}
            >
              <Text style={styles.heroTitle}>
                Fund Dreams.{'\n'}
                <Text style={styles.heroTitleGradient}>Change Lives.</Text>
              </Text>
              <Text style={styles.heroSubtitle}>
                Connect with meaningful projects and make a lasting impact through secure, transparent crowdfunding.
              </Text>
            </Animatable.View>
            
            {/* Hero Image */}
            <Animatable.View
              animation="fadeInRight" 
              duration={1000} 
              delay={1400}
              style={styles.heroImageContainer}
            >
              <View style={styles.heroImageWrapper}>
                <Image 
                  source={{
                    uri: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
                  }}
                  style={styles.heroImage}
                  defaultSource={{uri: 'https://via.placeholder.com/400x200/2E86AB/ffffff?text=Crowdfunding'}}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.2)']}
                  style={styles.heroImageOverlay}
                />
              </View>
            </Animatable.View>
          </View>
        </View>

        {/* Stats Section - Modern Compact Cards */}
        <View style={styles.statsSection}>
          <View style={styles.statsSectionHeader}>
            <Animatable.Text 
              animation={animatedStats ? "fadeInUp" : undefined}
              duration={700}
              style={styles.sectionTitle}
            >
              Platform Impact
            </Animatable.Text>
            <Animatable.Text 
              animation={animatedStats ? "fadeInUp" : undefined}
              duration={700}
              delay={200}
              style={styles.sectionSubtitle}
            >
              Real numbers from our thriving community
            </Animatable.Text>
          </View>
          
          <View style={styles.statsContainer}>
            <Animatable.View 
              ref={statsRefs[0]}
              animation="fadeInUp"
              duration={800}
              delay={1400}
              style={styles.statCard}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.statIcon}
              >
                <MaterialIcons name="attach-money" size={24} color="white" />
              </LinearGradient>
              <Text style={styles.statValue}>${formatNumber(stats.totalRaised)}</Text>
              <Text style={styles.statLabel}>Total Raised</Text>
            </Animatable.View>

            <Animatable.View 
              ref={statsRefs[1]}
              animation="fadeInUp"
              duration={800}
              delay={1600}
              style={styles.statCard}
            >
              <LinearGradient
                colors={['#14b8a6', '#2563eb']}
                style={styles.statIcon}
              >
                <MaterialIcons name="campaign" size={24} color="white" />
              </LinearGradient>
              <Text style={styles.statValue}>{formatNumber(stats.activeCampaigns)}</Text>
              <Text style={styles.statLabel}>Active Campaigns</Text>
            </Animatable.View>

            <Animatable.View 
              ref={statsRefs[2]}
              animation="fadeInUp"
              duration={800}
              delay={1800}
              style={styles.statCard}
            >
              <LinearGradient
                colors={['#8b5cf6', '#ec4899']}
                style={styles.statIcon}
              >
                <MaterialIcons name="celebration" size={24} color="white" />
              </LinearGradient>
              <Text style={styles.statValue}>{formatNumber(stats.successfulProjects)}</Text>
              <Text style={styles.statLabel}>Success Stories</Text>
            </Animatable.View>
          </View>
        </View>
          
        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featuresSectionHeader}>
            <Text style={styles.featuresSectionTitle}>Why Choose Funderr?</Text>
            <Text style={styles.featuresSectionSubtitle}>Built for transparency, security, and community impact</Text>
          </View>
          
          <Animatable.View 
            ref={featureRefs[0]}
            animation="fadeInUp"
            duration={800}
            delay={2000}
            style={styles.featureCard}
          >
            <View style={styles.featureHeader}>
              <LinearGradient
                colors={['#14b8a6', '#2563eb']}
                style={styles.featureIcon}
              >
                <MaterialIcons name="verified-user" size={32} color="white" />
              </LinearGradient>
              <Text style={styles.featureTitle}>Secure & Verified</Text>
            </View>
            <Text style={styles.featureText}>
              Every campaign is thoroughly vetted. All transactions are encrypted and protected by blockchain technology.
            </Text>
          </Animatable.View>

          <Animatable.View 
            ref={featureRefs[1]}
            animation="fadeInUp"
            duration={800}
            delay={2300}
            style={styles.featureCard}
          >
            <View style={styles.featureHeader}>
              <LinearGradient
                colors={['#8b5cf6', '#ec4899']}
                style={styles.featureIcon}
              >
                <MaterialIcons name="analytics" size={32} color="white" />
              </LinearGradient>
              <Text style={styles.featureTitle}>Full Transparency</Text>
            </View>
            <Text style={styles.featureText}>
              Track exactly how your contributions are used with real-time updates and detailed progress reports.
            </Text>
          </Animatable.View>

          <Animatable.View 
            ref={featureRefs[2]}
            animation="fadeInUp"
            duration={800}
            delay={2600}
            style={styles.featureCard}
          >
            <View style={styles.featureHeader}>
              <LinearGradient
                colors={['#10b981', '#16a34a']}
                style={styles.featureIcon}
              >
                <MaterialIcons name="groups" size={32} color="white" />
              </LinearGradient>
              <Text style={styles.featureTitle}>Community Driven</Text>
            </View>
            <Text style={styles.featureText}>
              Join a community of changemakers. Connect with project creators and fellow supporters worldwide.
            </Text>
          </Animatable.View>
        </View>
        
        {/* Call to Action */}
        <LinearGradient
          colors={['#14b8a6', '#2563eb']}
          style={styles.ctaSection}
        >
          {/* Animated background patterns */}
          <View style={styles.ctaBackgroundPatterns}>
            <Animatable.View animation="pulse" iterationCount="infinite" duration={3000} style={styles.ctaBgPattern1} />
            <Animatable.View animation="pulse" iterationCount="infinite" duration={4000} delay={1000} style={styles.ctaBgPattern2} />
            <Animatable.View animation="pulse" iterationCount="infinite" duration={5000} delay={2000} style={styles.ctaBgPattern3} />
            <Animatable.View animation="pulse" iterationCount="infinite" duration={3500} delay={2500} style={styles.ctaBgPattern4} />
          </View>
          
          <Animatable.View 
            ref={buttonRef}
            animation="pulse" 
            easing="ease-out"
            iterationCount={1}
            duration={1000}
            delay={3200}
            style={styles.ctaContent}
          >
            <Text style={styles.ctaTitle}>Ready to Make a Difference?</Text>
            <Text style={styles.ctaSubtext}>
              Join thousands of supporters making a difference in communities worldwide
            </Text>
          </Animatable.View>
        </LinearGradient>
      </ScrollView>

      {/* Floating Bottom Center Button */}
      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={() => navigation.navigate('SignIn')}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#14b8a6', '#2563eb']}
          style={styles.floatingButtonGradient}
        >
          <MaterialIcons name="rocket-launch" size={20} color="white" style={styles.floatingButtonIcon} />
          <Text style={styles.floatingButtonText}>Start Your Dream</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },

  // Animated Background Patterns
  backgroundPatterns: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  bgPattern: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.1,
  },
  bgPattern1: {
    top: 80,
    left: 40,
    width: 128,
    height: 128,
    backgroundColor: '#14b8a6',
  },
  bgPattern2: {
    top: 160,
    right: 80,
    width: 96,
    height: 96,
    backgroundColor: '#3b82f6',
  },
  bgPattern3: {
    bottom: 160,
    left: '25%',
    width: 80,
    height: 80,
    backgroundColor: '#8b5cf6',
  },
  bgPattern4: {
    top: '33%',
    right: '33%',
    width: 64,
    height: 64,
    backgroundColor: '#10b981',
  },
  bgPattern5: {
    bottom: 80,
    right: 40,
    width: 112,
    height: 112,
    backgroundColor: '#ec4899',
  },
  geometricShape: {
    position: 'absolute',
  },
  shape1: {
    top: '25%',
    left: '50%',
    width: 32,
    height: 32,
    backgroundColor: '#14b8a6',
    opacity: 0.2,
    transform: [{ rotate: '45deg' }],
  },
  shape2: {
    bottom: '33%',
    left: 80,
    width: 24,
    height: 24,
    backgroundColor: '#8b5cf6',
    opacity: 0.15,
    transform: [{ rotate: '12deg' }],
    borderRadius: 4,
  },

  // Modern Header
  header: {
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 12,
    zIndex: 50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  helpButton: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{ translateY: -16 }], // Half of button height to center vertically
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Floating Button
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    left: '50%',
    transform: [{ translateX: -75 }], // Half of button width to center it
    zIndex: 100,
    borderRadius: 30,
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
  },
  floatingButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
  },
  floatingButtonIcon: {
    marginRight: 8,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Body Section
  body: {
    flex: 1,
    zIndex: 10,
  },
  scrollContent: {
    paddingBottom: 0,
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 80,
    position: 'relative',
    backgroundColor: '#f0fdfa',
  },
  heroBackgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroBackground1: {
    position: 'absolute',
    top: -160,
    right: -160,
    width: 320,
    height: 320,
    backgroundColor: '#14b8a6',
    borderRadius: 160,
    opacity: 0.1,
  },
  heroBackground2: {
    position: 'absolute',
    bottom: -128,
    left: -128,
    width: 256,
    height: 256,
    backgroundColor: '#8b5cf6',
    borderRadius: 128,
    opacity: 0.15,
  },
  heroGrid: {
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 10,
  },
  heroTextContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 24,
  },
  heroTitleGradient: {
    color: '#14b8a6',
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
    maxWidth: 600,
  },
  heroImageContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  heroImageWrapper: {
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  heroImage: {
    width: '100%',
    height: 280,
    resizeMode: 'cover',
  },
  heroImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Stats Section - Modern Compact Cards
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 64,
    backgroundColor: 'white',
    zIndex: 10,
  },
  statsSectionHeader: {
    alignItems: 'center',
    marginBottom: 48,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    maxWidth: 600,
    alignSelf: 'center',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Features Section
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 80,
    backgroundColor: '#f9fafb',
    position: 'relative',
  },
  featuresSectionHeader: {
    alignItems: 'center',
    marginBottom: 64,
  },
  featuresSectionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresSectionSubtitle: {
    fontSize: 20,
    color: '#6b7280',
    textAlign: 'center',
  },
  featureCard: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  featureText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginLeft: 88,
  },

  // Call to Action Section
  ctaSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 80,
    position: 'relative',
  },
  ctaBackgroundPatterns: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ctaBgPattern1: {
    position: 'absolute',
    top: 0,
    left: '25%',
    width: 8,
    height: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    opacity: 0.2,
  },
  ctaBgPattern2: {
    position: 'absolute',
    top: 40,
    right: '25%',
    width: 4,
    height: 4,
    backgroundColor: 'white',
    borderRadius: 2,
    opacity: 0.3,
  },
  ctaBgPattern3: {
    position: 'absolute',
    bottom: 80,
    left: '33%',
    width: 6,
    height: 6,
    backgroundColor: 'white',
    borderRadius: 3,
    opacity: 0.25,
  },
  ctaBgPattern4: {
    position: 'absolute',
    bottom: 40,
    right: '33%',
    width: 8,
    height: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    opacity: 0.15,
  },
  ctaContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 24,
  },
  ctaSubtext: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 28,
  },
});
