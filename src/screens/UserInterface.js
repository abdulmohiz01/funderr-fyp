import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  SafeAreaView,
  Alert,
  Platform,
  Animated,
  Easing,
  StatusBar,
  Dimensions,
  ImageBackground
} from 'react-native';

const { width, height } = Dimensions.get('window');
import { LinearGradient } from 'expo-linear-gradient';
import { ethers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '../services/ApiService';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

const CROWDFUNDING_QUOTE =
  'Small contributions create extraordinary change';



// Define image paths (will be dynamically loaded)
const imageMapping = {
  // General UI images
  mainpage: require('../assets/mainpage.jpg'),
  bg: require('../assets/bg.jpg'),
  roleSelection: require('../assets/RoleSelection.jpg'),
  mute: require('../assets/Mute.jpg'),
  dad: require('../assets/Dad.jpg'),
  vet: require('../assets/vet.jpeg'),
  // Category images for explore screen
  water: require('../assets/Water.jpg'),
  education: require('../assets/Book for kids.jpg'),
  emergency: require('../assets/Disaster.jpeg'),
  art: require('../assets/Arts education.jpg'),
  health: require('../assets/Aid.jpg'),
  sports: require('../assets/Youth sport.jpg'),
  food: require('../assets/Community garden.jpeg'),
};

// Define campaigns with image keys instead of direct references
// Trending campaigns from backend
// ...existing code...

// Helper function to get category image
const getCategoryImage = (category) => {
  if (!category) return imageMapping.mainpage;
  const categoryKey = category.toLowerCase().trim();
  
  // Direct match first
  if (imageMapping[categoryKey]) {
    return imageMapping[categoryKey];
  }
  
  // Fuzzy matching for common variations
  if (categoryKey.includes('water') || categoryKey.includes('clean')) return imageMapping.water;
  if (categoryKey.includes('education') || categoryKey.includes('school') || categoryKey.includes('learning')) return imageMapping.education;
  if (categoryKey.includes('emergency') || categoryKey.includes('disaster') || categoryKey.includes('relief')) return imageMapping.emergency;
  if (categoryKey.includes('art') || categoryKey.includes('culture') || categoryKey.includes('creative')) return imageMapping.art;
  if (categoryKey.includes('health') || categoryKey.includes('medical') || categoryKey.includes('healthcare')) return imageMapping.health;
  if (categoryKey.includes('sport') || categoryKey.includes('athletic') || categoryKey.includes('fitness')) return imageMapping.sports;
  if (categoryKey.includes('food') || categoryKey.includes('nutrition') || categoryKey.includes('hunger')) return imageMapping.food;
  
  // Default fallback to ensure we always return an image
  return imageMapping.mainpage;
};

// Helper function to get category icon name
const getCategoryIcon = (category) => {
  if (!category) return 'category';
  const categoryKey = category.toLowerCase().trim();
  
  if (categoryKey.includes('water') || categoryKey.includes('clean')) return 'water-drop';
  if (categoryKey.includes('education') || categoryKey.includes('school') || categoryKey.includes('learning')) return 'school';
  if (categoryKey.includes('emergency') || categoryKey.includes('disaster') || categoryKey.includes('relief')) return 'warning';
  if (categoryKey.includes('art') || categoryKey.includes('culture') || categoryKey.includes('creative')) return 'palette';
  if (categoryKey.includes('health') || categoryKey.includes('medical') || categoryKey.includes('healthcare')) return 'medical-services';
  if (categoryKey.includes('sport') || categoryKey.includes('athletic') || categoryKey.includes('fitness')) return 'sports-soccer';
  if (categoryKey.includes('food') || categoryKey.includes('nutrition') || categoryKey.includes('hunger')) return 'restaurant';
  
  return 'category';
};

// Helper function to get consistent campaign image (used by both cards and modal)
const getCampaignImageSource = (campaign, isExplore = false) => {
  let imageSource;
  
  if (isExplore) {
    // For explore cards, always use category image
    imageSource = getCategoryImage(campaign.category);
    console.log(`Explore card - Campaign: ${campaign.title}, Category: ${campaign.category}, Image:`, imageSource);
  } else {
    // For regular cards and modal, try campaign imageKey first, then fallback to category image
    try {
      if (campaign.imageKey && imageMapping[campaign.imageKey]) {
        imageSource = imageMapping[campaign.imageKey];
        console.log(`Using campaign imageKey: ${campaign.imageKey} for ${campaign.title}`);
      } else {
        imageSource = getCategoryImage(campaign.category);
        console.log(`Using category image for ${campaign.title}, Category: ${campaign.category}`);
      }
    } catch (e) {
      console.warn(`Error loading image for campaign: ${campaign.title}`, e);
      imageSource = getCategoryImage(campaign.category);
    }
  }
  
  // Final safety check to ensure we have a valid image source
  if (!imageSource) {
    console.warn(`No image source found for campaign: ${campaign.title}, using mainpage fallback`);
    imageSource = imageMapping.mainpage;
  }
  
  return imageSource;
};

const UserInterface = ({ navigation }) => {
  // Fetch trending campaigns (approved only)
  useEffect(() => {
    const fetchTrendingCampaigns = async () => {
      try {
        const campaigns = await ApiService.listCampaigns('approved');
        // apply overrides from AsyncStorage
        try {
          const overridesRaw = await AsyncStorage.getItem('campaignOverrides');
          const overrides = overridesRaw ? JSON.parse(overridesRaw) : {};
          const applied = (campaigns || []).filter(c => {
            const id = c._id || c.id;
            const ov = overrides[id];
            return !(ov && ov.deleted);
          }).map(c => {
            const id = c._id || c.id;
            const ov = overrides[id];
            if (ov && typeof ov.raised === 'number') return { ...c, raised: ov.raised };
            return c;
          });
          setTrendingCampaigns(applied);
          setCampaignOverrides(overrides || {});
        } catch (e) {
          console.warn('Failed to apply campaign overrides', e);
          setTrendingCampaigns(campaigns);
        }
      } catch (error) {
        console.error('Error fetching trending campaigns:', error);
      }
    };
    fetchTrendingCampaigns();
  }, []);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [showExplore, setShowExplore] = useState(false);
  const [trendingCampaigns, setTrendingCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [donateAmount, setDonateAmount] = useState('');
  const [donatedCampaigns, setDonatedCampaigns] = useState([]);
  const [campaignOverrides, setCampaignOverrides] = useState({}); // { [id]: { raised?: number, deleted?: true } }
  // Wallet connection state
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletProviderType, setWalletProviderType] = useState(null); // 'injected' | 'walletconnect' | null
  const [ethersProvider, setEthersProvider] = useState(null);
  const [ethersSigner, setEthersSigner] = useState(null);
  const [signedMessage, setSignedMessage] = useState(null);
  // Extract the route name to determine which tab we're on
  const activeRoute = useRoute();
  // Listen for navigation params to trigger campaign refresh
  useFocusEffect(
    React.useCallback(() => {
      if (activeRoute?.params?.refreshCampaigns && userProfile && userProfile.id) {
        const fetchUserCampaigns = async () => {
          try {
            const campaigns = await ApiService.getUserCampaigns(userProfile.id);
            // apply any local overrides
            try {
              const overridesRaw = await AsyncStorage.getItem('campaignOverrides');
              const overrides = overridesRaw ? JSON.parse(overridesRaw) : {};
              const applied = (campaigns || []).filter(c => {
                const id = c._id || c.id;
                const ov = overrides[id];
                return !(ov && ov.deleted);
              }).map(c => {
                const id = c._id || c.id;
                const ov = overrides[id];
                if (ov && typeof ov.raised === 'number') return { ...c, raised: ov.raised };
                return c;
              });
              setUserCampaigns(applied);
            } catch (e) {
              console.warn('Failed to apply campaign overrides to user campaigns', e);
              setUserCampaigns(campaigns);
            }
          } catch (error) {
            console.error('Error refreshing user campaigns:', error);
          }
        };
        fetchUserCampaigns();
      }
    }, [activeRoute?.params?.refreshCampaigns, userProfile])
  );
  const [activeTab, setActiveTab] = useState('trending');
  const [search, setSearch] = useState('');
  useFocusEffect(
    React.useCallback(() => {
      const loadUserData = async () => {
        try {
          // Get stored profile data
          const profileData = await AsyncStorage.getItem('userProfile');
          if (profileData) {
            let parsedProfile = JSON.parse(profileData);
            // Ensure id is set from _id if missing
            if (!parsedProfile.id && parsedProfile._id) {
              parsedProfile.id = parsedProfile._id;
            }
            // Load donated campaigns for this user if any
            try {
              const key = `donatedCampaigns:${parsedProfile.id || parsedProfile._id}`;
              const stored = await AsyncStorage.getItem(key);
              if (stored) setDonatedCampaigns(JSON.parse(stored));
            } catch (e) {
              console.warn('Failed to load donated campaigns', e);
            }
            setUserProfile(parsedProfile);
          } else {
            // Check if we at least have email
            const userEmail = await AsyncStorage.getItem('userEmail');
            if (userEmail) {
              setUserProfile({ email: userEmail });
            }
          }
        } catch (error) {
          console.error('Failed to load user data:', error);
        }
      };
      loadUserData();
      return () => {}; // Cleanup function
    }, [])
  );

  // Fetch user's campaigns when userProfile is set and has a valid id
  useEffect(() => {
    const fetchUserCampaigns = async () => {
      console.log('Fetching user campaigns for userProfile:', userProfile);
      if (userProfile && userProfile.id) {
        try {
          const campaigns = await ApiService.getUserCampaigns(userProfile.id);
          console.log('Fetched campaigns:', campaigns);
          setUserCampaigns(campaigns);
        } catch (error) {
          console.error('Error fetching user campaigns:', error);
        }
      } else {
        console.warn('userProfile or userProfile.id is missing, cannot fetch campaigns');
      }
    };
    fetchUserCampaigns();
  }, [userProfile]);
// Handle profile view
  // Fetch user data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const loadUserData = async () => {
        try {
          // Get user role
          const role = await AsyncStorage.getItem('userRole');
          setUserRole(role);

          // If no role, force user to RoleSelection
          if (!role) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'RoleSelection' }]
            });
            return;
          }
          // Get stored profile data
          const profileData = await AsyncStorage.getItem('userProfile');
          if (profileData) {
            let parsedProfile = JSON.parse(profileData);
            if (!parsedProfile.id && parsedProfile._id) {
              parsedProfile.id = parsedProfile._id;
            }
            setUserProfile(parsedProfile);
          } else {
            // Check if we at least have email
            const userEmail = await AsyncStorage.getItem('userEmail');
            if (userEmail) {
              setUserProfile({ email: userEmail });
            }
          }
          // Fetch user's campaigns for notification
          try {
            if (userProfile && userProfile.id) {
              const campaigns = await ApiService.getUserCampaigns(userProfile.id);
              setUserCampaigns(campaigns);
            }
          } catch (error) {
            console.error('Error fetching user campaigns:', error);
          }
        } catch (error) {
          console.error('Failed to load user data:', error);
        }
      };

      loadUserData();
      return () => {}; // Cleanup function
    }, [])
  );// Handle profile view
  const handleProfileOpen = async () => {
    setShowProfile(true);
    setProfileLoading(true);
    setProfileError(null);
    
    try {
      // Use ApiService to get the user profile
      const { ApiService } = require('../services/ApiService');
      const profileData = await ApiService.getUserProfile();
      
      if (profileData) {
        setUserProfile({
          ...profileData,
          avatar: imageMapping.roleSelection,
          // Ensure name is set - use a default if not available
          name: profileData.name || 
                profileData.fullName || 
                (profileData.role === 'donor' ? 'Donor User' : 'Campaign Creator')
        });
      } else {
        throw new Error('Profile not found');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileError('Profile not found or failed to load.');
      
      // Fallback to basic data from AsyncStorage if API call fails
      try {
        const userEmail = await AsyncStorage.getItem('userEmail');
        const userRole = await AsyncStorage.getItem('userRole');
        
        if (userEmail) {
          setUserProfile({
            email: userEmail,
            name: userRole === 'donor' ? 'Donor User' : 'Campaign Creator',
            role: userRole,
            avatar: imageMapping.roleSelection
          });
          setProfileError(null); // Clear error if we can show something
        }
      } catch (fallbackError) {
        console.error('Fallback profile fetch failed:', fallbackError);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Instead of removing all user data, we'll:
      // 1. Store a backup of important user information
      const userEmail = await AsyncStorage.getItem('userEmail');
      const userRole = await AsyncStorage.getItem('userRole');
      const userProfile = await AsyncStorage.getItem('userProfile');
      
      // 2. Remove authentication token to log out
      await AsyncStorage.removeItem('userToken');
      
      // 3. Store a flag indicating this is a returning user
      await AsyncStorage.setItem('returningUser', 'true');
      
      // 4. Preserve the email for easier login next time
      if (userEmail) {
        await AsyncStorage.setItem('lastEmail', userEmail);
      }
      
      // 5. Store profile data in a backup key
      if (userProfile) {
        await AsyncStorage.setItem('savedUserProfile', userProfile);
      }
      
      // 6. Store user role in a backup key
      if (userRole) {
        await AsyncStorage.setItem('savedUserRole', userRole);
      }
      
      // Navigate to auth stack
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }]
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', 'Please try again');
    }
  };const renderCampaignCard = (campaign, index, isExplore = false) => {
    // Use consistent image source logic for both cards and modal
    const imageSource = getCampaignImageSource(campaign, isExplore);

    if (isExplore) {
      // Render the explore card style with image at top (two per row)
      return (
        <Animatable.View
          key={campaign.id}
          animation="fadeInUp"
          duration={700}
          delay={index * 100}
          style={styles.exploreCardContainer}
        >
          <View style={styles.exploreCard}>
            {/* Campaign Image at Top */}
            <View style={styles.exploreCardImageContainer}>
              <Image 
                source={imageSource}
                style={styles.exploreCardImage}
                resizeMode="cover"
              />
              <View style={styles.exploreCardOverlay}>
                <View style={styles.categoryBadge}>
                  <MaterialIcons 
                    name={getCategoryIcon(campaign.category)} 
                    size={16} 
                    color="#14b8a6" 
                    style={{ marginRight: 4 }} 
                  />
                  <Text style={styles.categoryText}>{campaign.category}</Text>
                </View>
              </View>
            </View>
            
            {/* Campaign Details */}
            <View style={styles.exploreCardContent}>
              <Text style={styles.exploreCardTitle}>{campaign.title}</Text>
              <Text style={styles.exploreCardDesc} numberOfLines={2}>{campaign.desc}</Text>
              
              <View style={styles.fundingInfo}>
                <Text style={styles.fundingAmount}>ETH {campaign.raised.toLocaleString()}</Text>
                <Text style={styles.fundingGoal}>of ETH {campaign.goal.toLocaleString()}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.viewCampaignButton} 
                onPress={() => { setSelectedCampaign(campaign); setShowCampaignModal(true); }}
              >
                <Text style={styles.viewCampaignText}>View Campaign</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animatable.View>
      );
    }

    // Standard campaign card for non-explore view
    return (
      <Animatable.View
        key={campaign.id}
        animation="fadeInUp"
        duration={700}
        delay={index * 150} // Staggered animation
      >
        <TouchableOpacity 
          style={styles.campaignCard}
          onPress={() => Alert.alert('Campaign Details', `You selected: ${campaign.title}`)}
          activeOpacity={0.7}
        >
          <Image 
            source={imageSource} 
            style={styles.campaignImage}
            defaultSource={Platform.OS === 'android' ? imageMapping.mainpage : undefined}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.campaignTitle}>{campaign.title}</Text>
            <Text style={styles.campaignDesc}>{campaign.desc}</Text>
            {campaign.raised && (
              <Text style={styles.campaignDesc}>
                ETH {campaign.raised.toLocaleString()} of ETH {campaign.goal.toLocaleString()}
              </Text>
            )}
            <TouchableOpacity style={[styles.viewCampaignButton, {alignSelf: 'flex-start', marginTop: 8}]} onPress={() => { setSelectedCampaign(campaign); setShowCampaignModal(true); }}>
              <Text style={styles.viewCampaignText}>View Campaign</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animatable.View>
    );
  };  // Function to handle campaign creation
  const handleStartCampaign = () => {
    navigation.navigate('CampaignCreation');
  };
  
  // Function to handle exploring campaigns
  const handleExplore = () => {
    setShowExplore(true);
    setActiveTab('trending'); // Default to trending tab when opening explore
  };

  // Handle donate action (static / local state only)
  const handleDonate = () => {
    const amt = Number(donateAmount);
    if (!selectedCampaign || !amt || isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid donation amount');
      return;
    }
    const campaignId = selectedCampaign._id || selectedCampaign.id;

    // Prevent donating more than remaining required amount (if a numeric goal exists)
    try {
      const goalVal = selectedCampaign && selectedCampaign.goal !== undefined && selectedCampaign.goal !== null ? Number(selectedCampaign.goal) : Infinity;
      const raisedVal = selectedCampaign && selectedCampaign.raised !== undefined && selectedCampaign.raised !== null ? Number(selectedCampaign.raised) : 0;
      const remaining = isFinite(goalVal) ? Math.max(0, goalVal - raisedVal) : Infinity;
      if (remaining <= 0) {
        Alert.alert('Campaign fully funded', 'This campaign has already reached its goal.');
        return;
      }
      if (isFinite(remaining) && amt > remaining) {
        Alert.alert('Amount exceeds remaining target', `You can only donate up to ${remaining} ETH to this campaign.`);
        return;
      }
    } catch (e) {
      // If parsing fails, fall back to default behavior (allow donation)
      console.warn('Failed to validate donation amount against campaign goal', e);
    }

    (async () => {
      try {
        // Try updating on backend first
        const updatedRemote = await ApiService.updateCampaign(campaignId, { raised: (selectedCampaign.raised || 0) + amt });

        // If updated successfully, apply remote response to local state
        setTrendingCampaigns(prev => prev.map(c => (c._id === campaignId || c.id === campaignId) ? { ...c, raised: updatedRemote.raised } : c).filter(c => (c.raised || 0) < (c.goal || Infinity)));
        setUserCampaigns(prev => prev.map(c => (c._id === campaignId || c.id === campaignId) ? { ...c, raised: updatedRemote.raised } : c).filter(c => (c.raised || 0) < (c.goal || Infinity)));

        // If goal reached or exceeded, delete remotely and locally
        if ((updatedRemote.raised || 0) >= (updatedRemote.goal || Infinity)) {
          try {
            await ApiService.deleteCampaign(campaignId);
          } catch (e) {
            console.warn('Failed to delete campaign remotely', e);
          }
          setTrendingCampaigns(prev => prev.filter(c => !(c._id === campaignId || c.id === campaignId)));
          setUserCampaigns(prev => prev.filter(c => !(c._id === campaignId || c.id === campaignId)));
          // Congratulate donor locally
          try { Alert.alert('Thank you!', 'This donation completed the campaign.'); } catch (e) { /* ignore for web fallback */ }
        }

        // Reconciliation: remove any local override for this campaign since server accepted the change
        try {
          const overridesRaw = await AsyncStorage.getItem('campaignOverrides');
          const overrides = overridesRaw ? JSON.parse(overridesRaw) : {};
          if (overrides && (overrides[campaignId] || overrides[campaignId] === 0)) {
            delete overrides[campaignId];
            await AsyncStorage.setItem('campaignOverrides', JSON.stringify(overrides));
            setCampaignOverrides(overrides);
          }
        } catch (e) {
          console.warn('Failed to reconcile campaign override after remote update', e);
        }

      } catch (err) {
        console.warn('Remote update failed, falling back to local update', err);

        // Local fallback: update in-memory
        setTrendingCampaigns(prev => {
          const updated = prev.map(c => {
            if ((c.id && c.id === campaignId) || (c._id && c._id === campaignId)) {
              return { ...c, raised: (c.raised || 0) + amt };
            }
            return c;
          });
          return updated.filter(c => (c.raised || 0) < (c.goal || Infinity));
        });

        setUserCampaigns(prev => {
          const updated = prev.map(c => {
            if ((c.id && c.id === campaignId) || (c._id && c._id === campaignId)) {
              return { ...c, raised: (c.raised || 0) + amt };
            }
            return c;
          });
          // Determine if campaign reached its goal after local update
          try {
            const matching = updated.find(c => (c._id === campaignId || c.id === campaignId));
            if (matching && isFinite(matching.goal) && (matching.raised || 0) >= matching.goal) {
              try { Alert.alert('Thank you!', 'This donation completed the campaign.'); } catch (e) { }
            }
          } catch (e) { }
          return updated.filter(c => (c.raised || 0) < (c.goal || Infinity));
        });
      }
    })();

    // (donatedCampaigns is updated below once to avoid duplicates)

    // Persist campaign override (raised or deleted) so it survives reloads
    (async () => {
      try {
        const overridesRaw = await AsyncStorage.getItem('campaignOverrides');
        const overrides = overridesRaw ? JSON.parse(overridesRaw) : {};
        const current = overrides[campaignId] || {};
        const newRaised = (current.raised || selectedCampaign.raised || 0) + amt;
        if (newRaised >= (selectedCampaign.goal || Infinity)) {
          overrides[campaignId] = { deleted: true };
        } else {
          overrides[campaignId] = { ...current, raised: newRaised };
        }
        await AsyncStorage.setItem('campaignOverrides', JSON.stringify(overrides));
        setCampaignOverrides(overrides);
      } catch (e) {
        console.warn('Failed to persist campaign override', e);
      }
    })();

    // Add to donatedCampaigns for this user (avoid duplicates)
    setDonatedCampaigns(prev => {
      const exists = prev.some(c => (c.id && c.id === (selectedCampaign.id || selectedCampaign._id)) || (c._id && c._id === (selectedCampaign._id || selectedCampaign.id)));
      if (exists) return prev.map(c => {
        if ((c.id && c.id === selectedCampaign.id) || (c._id && c._id === selectedCampaign._id)) {
          return { ...c, raised: (c.raised || 0) + amt };
        }
        return c;
      });
      const newEntry = { ...(selectedCampaign || {}), raised: (selectedCampaign.raised || 0) + amt };
      const updated = [newEntry, ...prev];

      // Persist to AsyncStorage per-user if available
      (async () => {
        try {
          if (userProfile && (userProfile.id || userProfile._id)) {
            const key = `donatedCampaigns:${userProfile.id || userProfile._id}`;
            await AsyncStorage.setItem(key, JSON.stringify(updated));
          }
        } catch (e) {
          console.warn('Failed to persist donated campaigns', e);
        }
      })();

      return updated;
    });

    // Close modal and reset amount
    setShowCampaignModal(false);
    setSelectedCampaign(null);
    setDonateAmount('');
  };

  // Wallet helpers
  const connectWallet = async () => {
    // Web - injected provider (MetaMask)
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          setEthersProvider(provider);
          setEthersSigner(signer);
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
          setWalletProviderType('injected');
          setWalletModalOpen(false);
          return;
        }
      } catch (e) {
        console.warn('User rejected wallet connection or error occurred', e);
        Alert.alert('Wallet Connection Failed', 'Please allow the connection in your wallet.');
        return;
      }
    }

    // Mobile or no injected provider - show guidance
    Alert.alert('No Web3 Wallet Detected', 'Please install MetaMask (desktop) or connect using WalletConnect (mobile)');
  };

  const signTestMessage = async () => {
    if (!ethersSigner) {
      Alert.alert('No signer', 'Connect wallet first');
      return;
    }
    try {
      const msg = `Funderr test signature @ ${new Date().toISOString()}`;
      const signature = await ethersSigner.signMessage(msg);
      setSignedMessage(signature);
      Alert.alert('Signed', 'Message signed successfully');
    } catch (e) {
      console.warn('Signing failed', e);
      Alert.alert('Signing failed', 'Please approve the signing in your wallet.');
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress(null);
    setWalletProviderType(null);
  };

  // Computed: remaining amount for the selected campaign (in ETH)
  const selectedRemaining = (() => {
    if (!selectedCampaign) return Infinity;
    const goalVal = selectedCampaign.goal !== undefined && selectedCampaign.goal !== null ? Number(selectedCampaign.goal) : Infinity;
    const raisedVal = selectedCampaign.raised !== undefined && selectedCampaign.raised !== null ? Number(selectedCampaign.raised) : 0;
    return isFinite(goalVal) ? Math.max(0, goalVal - raisedVal) : Infinity;
  })();

  // Is the Donate button currently disabled due to goal reached or input exceeding remaining?
  const donateExceedsRemaining = (() => {
    const amt = Number(donateAmount);
    if (!isFinite(selectedRemaining)) return false; // no limit
    // Only consider "exceeds remaining" when user has entered a valid numeric amount
    if (donateAmount === '' || donateAmount == null) return false;
    if (isNaN(amt)) return false;
    return amt > selectedRemaining;
  })();

  // Separate flag to determine if Donate button should be disabled (invalid input or exceeds remaining)
  const donateDisabled = (() => {
    const amt = Number(donateAmount);
    if (!donateAmount || donateAmount.trim() === '') return true; // require input
    if (isNaN(amt) || amt <= 0) return true; // invalid numeric
    if (isFinite(selectedRemaining) && amt > selectedRemaining) return true; // over limit
    return false;
  })();

  // Handler that clamps the entered donation amount to the remaining amount (if there is a limit)
  const handleDonateAmountChange = (val) => {
    // Allow empty string
    if (!val || val.trim() === '') {
      setDonateAmount('');
      return;
    }
    // Allow numeric input, but clamp to remaining when finite
    const parsed = Number(val);
    if (isNaN(parsed)) {
      // keep as-is to allow user to edit; validation prevents non-numeric donations
      setDonateAmount(val);
      return;
    }
    if (isFinite(selectedRemaining) && parsed > selectedRemaining) {
      setDonateAmount(String(selectedRemaining));
      return;
    }
    setDonateAmount(String(val));
  };
  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, [navigation]);
  
  return (
  <View style={{flex: 1}}>
    
      {/* Only render Campaign History Modal and its container when showHistory is true */}
      {showHistory && (
        <View style={styles.modalBackdrop50}>
          <View style={styles.historyModal}>
            <View style={styles.historyTitleContainer}>
              <LinearGradient
                colors={['#14b8a6', '#9370DB']}
                style={styles.historyTitleGradient}
              >
                <MaterialIcons name="history" size={24} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.historyTitle}>Your Campaign History</Text>
              </LinearGradient>
            </View>
            <ScrollView style={styles.historyScroll} showsVerticalScrollIndicator={false}>
              {userCampaigns.length === 0 ? (
                <View style={styles.emptyHistoryContainer}>
                  <MaterialIcons name="history" size={48} color="#cbd5e1" />
                  <Text style={styles.emptyHistoryText}>No campaigns found</Text>
                  <Text style={styles.emptyHistorySubtext}>Your campaign history will appear here</Text>
                </View>
              ) : (
                userCampaigns.map(campaign => (
                  <View key={campaign._id} style={styles.historyItem}>
                    <View style={styles.historyItemHeader}>
                      <MaterialIcons 
                        name={campaign.status === 'approved' ? 'check-circle' : campaign.status === 'rejected' ? 'cancel' : 'schedule'} 
                        size={20} 
                        color={campaign.status === 'pending' ? '#14b8a6' : campaign.status === 'rejected' ? '#ef4444' : '#10b981'} 
                      />
                      <Text style={styles.historyItemTitle}>{campaign.title}</Text>
                    </View>
                    <View style={[
                      styles.historyItemStatus, 
                      {backgroundColor: campaign.status === 'pending' ? 'rgba(20, 184, 166, 0.1)' : 
                                      campaign.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 
                                      'rgba(16, 185, 129, 0.1)',
                       borderColor: campaign.status === 'pending' ? '#14b8a6' : 
                                   campaign.status === 'rejected' ? '#ef4444' : 
                                   '#10b981'}
                    ]}>
                      <Text style={[styles.historyItemStatusText, {
                        color: campaign.status === 'pending' ? '#14b8a6' : 
                               campaign.status === 'rejected' ? '#ef4444' : 
                               '#10b981'
                      }]}>
                        {campaign.status.toUpperCase()}
                      </Text>
                    </View>
                    {campaign.status === 'rejected' && (
                      <TouchableOpacity onPress={() => {setSelectedReason(campaign.rejectionReason || 'No reason provided'); setShowReasonModal(true);}} style={styles.seeDetailsBtn}>
                        <MaterialIcons name="info-outline" size={16} color="#fff" style={{ marginRight: 4 }} />
                        <Text style={styles.seeDetailsText}>See Details</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity style={styles.historyCloseBtn} onPress={() => setShowHistory(false)}>
              <LinearGradient
                colors={['#9370DB', '#14b8a6']}
                style={styles.historyCloseBtnGradient}
              >
                <MaterialIcons name="close" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.historyCloseText}>Close</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Campaign View Modal */}
      {showCampaignModal && selectedCampaign && (() => {
        const modalImageSource = getCampaignImageSource(selectedCampaign, false);
        console.log(`Modal - Campaign: ${selectedCampaign.title}, Image:`, modalImageSource);
        return (
          <View style={styles.modalBackdrop}>
            <View style={styles.campaignModal}>
              <Image
                source={modalImageSource}
                style={styles.campaignModalImage}
                resizeMode="cover"
              />
              <View style={styles.campaignTitleContainer}>
                <LinearGradient
                  colors={['#9370DB', '#14b8a6']}
                  style={styles.campaignTitleGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <MaterialIcons name="campaign" size={24} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.campaignModalTitle}>{selectedCampaign.title}</Text>
                </LinearGradient>
              </View>
              <Text style={styles.campaignModalDesc}>{selectedCampaign.desc}</Text>

            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={['#9370DB', '#14b8a6']}
                  style={[styles.progressFill, { width: `${Math.min(100, ((selectedCampaign.raised||0) / (selectedCampaign.goal||1)) * 100)}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              <Text style={styles.progressText}>Raised: ETH {selectedCampaign.raised || 0} / {selectedCampaign.goal || 'N/A'}</Text>
            </View>

            <TextInput
              placeholder='Enter amount to donate (ETH)'
              value={donateAmount}
              onChangeText={handleDonateAmountChange}
              keyboardType='numeric'
              style={styles.donateInput}
            />

            {/* Remaining and validation hints */}
            {isFinite(selectedRemaining) && (
              <Text style={styles.remainingText}>Remaining: {selectedRemaining} ETH</Text>
            )}
            {(donateAmount && !isNaN(Number(donateAmount)) && donateExceedsRemaining) && (
              <Text style={styles.errorText}>Amount exceeds remaining target</Text>
            )}

            <View style={styles.campaignModalActions}>
              <TouchableOpacity
                onPress={handleDonate}
                style={[donateDisabled && styles.primaryBtnDisabled]}
                disabled={donateDisabled}
              >
                <LinearGradient
                  colors={donateDisabled ? ['rgba(148, 112, 219, 0.4)', 'rgba(148, 112, 219, 0.4)'] : ['#9370DB', '#14b8a6']}
                  style={styles.primaryBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.primaryBtnText}>Donate to Campaign</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setShowCampaignModal(false); setSelectedCampaign(null); setDonateAmount(''); }} style={styles.closeLink}>
                <Text style={styles.closeLinkText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        );
      })()}

      {/* Wallet Modal */}
      {walletModalOpen && (
        <View style={styles.modalBackdrop}>
          <View style={styles.walletModal}>
            <Text style={styles.walletModalTitle}>Wallet Connection</Text>
            {walletConnected ? (
              <View>
                <Text style={styles.walletConnectedText}>Connected: {walletAddress}</Text>
                <TouchableOpacity onPress={() => { disconnectWallet(); setWalletModalOpen(false); }} style={styles.disconnectBtn}>
                  <Text style={styles.disconnectBtnText}>Disconnect</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.walletModalHelp}>Connect your web3 wallet to interact with blockchain features.</Text>
                <TouchableOpacity onPress={connectWallet} style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>Connect Wallet</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { Alert.alert('Mobile Wallet', 'Use WalletConnect-enabled wallets.'); }} style={styles.helpLink}>
                  <Text style={styles.helpLinkText}>Need help? Connect via WalletConnect (coming soon)</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity onPress={() => setWalletModalOpen(false)} style={styles.closeModalLink}>
              <Text style={styles.closeLinkText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Reason Modal */}
      {showReasonModal && (
        <View style={styles.modalBackdrop}>
          <View style={styles.reasonModal}>
            <View style={styles.reasonTitleContainer}>
              <LinearGradient
                colors={['#ef4444', '#dc2626']}
                style={styles.reasonTitleGradient}
              >
                <MaterialIcons name="error-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.reasonTitle}>Rejection Reason</Text>
              </LinearGradient>
            </View>
            <View style={styles.reasonContent}>
              <MaterialIcons name="info-outline" size={20} color="#64748b" style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={styles.reasonText}>{selectedReason}</Text>
            </View>
            <TouchableOpacity style={styles.reasonCloseBtn} onPress={() => setShowReasonModal(false)}>
              <LinearGradient
                colors={['#9370DB', '#181818ff']}
                style={styles.reasonCloseBtnGradient}
              >
                <MaterialIcons name="close" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.reasonCloseBtnText}>Close</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Modern Background with Animated Patterns - HomeScreen Style */}
      <View style={styles.backgroundPatterns}>
        <Animatable.View animation="pulse" iterationCount="infinite" duration={3000} style={[styles.bgPattern, styles.bgPattern1]} />
        <Animatable.View animation="bounceIn" iterationCount="infinite" duration={3000} delay={1000} style={[styles.bgPattern, styles.bgPattern2]} />
        <Animatable.View animation="pulse" iterationCount="infinite" duration={4000} delay={2000} style={[styles.bgPattern, styles.bgPattern3]} />
        <Animatable.View animation="pulse" iterationCount="infinite" duration={3000} delay={1500} style={[styles.bgPattern, styles.bgPattern4]} />
        <Animatable.View animation="bounceIn" iterationCount="infinite" duration={5000} delay={3000} style={[styles.bgPattern, styles.bgPattern5]} />
      </View>
      <SafeAreaView style={[styles.safeArea, {flex: 1}]}>      
        {/* Modern Header - Properly Aligned */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {/* Left side - Home button */}
            <View style={styles.headerLeft}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Home')}
                style={styles.homeButton}
              >
                <LinearGradient
                  colors={['#9370DB', '#14b8a6']}
                  style={styles.homeIconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="home" size={24} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            {/* Center - Logo and Title */}
            <Animatable.View 
              animation="fadeIn" 
              duration={1000} 
              delay={300} 
              style={styles.headerCenter}
            >
              <LinearGradient
                colors={['#14b8a6', '#2563eb']}
                style={styles.logoCircle}
              >
                <MaterialIcons name="favorite" size={24} color="white" />
              </LinearGradient>
              <Animatable.Text 
                animation="fadeInDown" 
                duration={800} 
                delay={700}
                style={styles.headerTitle}
              >
                Funderr
              </Animatable.Text>
            </Animatable.View>
            
            {/* Right side - Admin, Wallet, and Profile buttons */}
            <View style={styles.headerRight}>
              {userRole === 'admin' && (
                <TouchableOpacity
                  style={styles.headerIconButton}
                  onPress={() => navigation.navigate('AdminPortal')}
                >
                  <Ionicons name="shield-checkmark" size={24} color="#6b7280" />
                </TouchableOpacity>
              )}
              
              {(userRole === 'donor' || userRole === 'campaign_creator') && (
                <TouchableOpacity
                  style={styles.headerIconButton}
                  onPress={() => setWalletModalOpen(true)}
                >
                  <LinearGradient
                    colors={walletConnected ? ['#10b981', '#14b8a6'] : ['#9370DB', '#14b8a6']}
                    style={styles.headerIconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="wallet" size={24} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={handleProfileOpen}
              >
                <LinearGradient
                  colors={['#9370DB', '#14b8a6']}
                  style={styles.headerIconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="person-circle" size={24} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      
      <ScrollView 
        style={styles.mainScrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section - HomeScreen Style */}
        <View style={styles.heroSection}>
          <View style={styles.heroBackgroundElements}>
            <Animatable.View animation="pulse" iterationCount="infinite" duration={6000} style={styles.heroBackground1} />
            <Animatable.View animation="pulse" iterationCount="infinite" duration={8000} style={styles.heroBackground2} />
          </View>
          
          <View style={styles.heroGrid}>
            <Animatable.View
              animation="fadeInUp" 
              duration={1000} 
              delay={300}
              style={styles.heroTextContainer}
            >
              <Text style={styles.heroTitle}>
                Fund Dreams.{'\n'}
                <Text style={styles.heroTitleGradient}>Change Lives.</Text>
              </Text>
              <Text style={styles.heroSubtitle}>
                Connect with meaningful projects and make a lasting impact through secure, transparent crowdfunding.
              </Text>
              
              {/* Action Buttons */}
              <View style={styles.heroButtonContainer}>
                {userRole === 'campaign_creator' ? (
                  <Animatable.View animation="fadeIn" duration={800} delay={800} style={styles.heroButtonsGroup}>
                    <TouchableOpacity 
                      style={styles.primaryActionButton}
                      onPress={handleStartCampaign}
                    >
                      <LinearGradient
                        colors={['#14b8a6', '#2563eb']}
                        style={styles.primaryActionButtonGradient}
                      >
                        <MaterialIcons name="rocket-launch" size={20} color="white" style={{marginRight: 8}} />
                        <Text style={styles.primaryActionButtonText}>Start Campaign</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.secondaryActionButton}
                      onPress={() => setShowHistory(true)}
                    >
                      <MaterialIcons name="history" size={20} color="#14b8a6" style={{marginRight: 8}} />
                      <Text style={styles.secondaryActionButtonText}>History</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.outlineActionButton}
                      onPress={handleExplore}
                    >
                      <MaterialIcons name="explore" size={20} color="#14b8a6" style={{marginRight: 8}} />
                      <Text style={styles.outlineActionButtonText}>Explore</Text>
                    </TouchableOpacity>
                  </Animatable.View>
                ) : (
                  <Animatable.View animation="fadeIn" duration={800} delay={600}>
                    <TouchableOpacity 
                      style={styles.primaryActionButton}
                      onPress={handleExplore}
                    >
                      <LinearGradient
                        colors={['#14b8a6', '#2563eb']}
                        style={styles.primaryActionButtonGradient}
                      >
                        <MaterialIcons name="explore" size={20} color="white" style={{marginRight: 8}} />
                        <Text style={styles.primaryActionButtonText}>Explore Campaigns</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animatable.View>
                )}
              </View>
            </Animatable.View>
          </View>
        </View>

        {/* Quote Container - HomeScreen Style */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={1000} 
          delay={900}
          style={styles.quoteContainer}
        >
          <View style={styles.quoteCard}>
            <MaterialIcons name="format-quote" size={28} color="#14b8a6" style={styles.quoteIcon} />
            <Text style={styles.quoteText}>
              "{CROWDFUNDING_QUOTE}"
            </Text>
            <Text style={styles.quoteAuthor}>— Inspiration for Change</Text>
          </View>
        </Animatable.View>

      {/* Only render campaigns section when showExplore is true, nothing otherwise */}
      {showExplore ? (
        <View style={styles.campaignsSection}>
          {/* Exploration view - HomeScreen Style */}
          <View style={styles.exploreSection}>
            <View style={styles.exploreSectionHeader}>
              <Animatable.Text animation="fadeInDown" duration={900} style={styles.exploreTitle}>
                Explore Campaigns
              </Animatable.Text>
              <Text style={styles.exploreSubtitle}>
                Discover meaningful projects making a difference
              </Text>
            </View>
            
            <View style={styles.exploreContainer}>
              <TouchableOpacity 
                style={styles.closeExploreBtn}
                onPress={() => setShowExplore(false)}
              >
                <Ionicons name="close-circle" size={28} color="#ef4444" />
              </TouchableOpacity>
              
              {/* Search Bar in Explore View */}
            <Animatable.View 
              style={styles.searchContainer}
              animation="fadeIn"
              duration={500}
            >
              <Ionicons name="search" size={22} color="#14b8a6" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by title, description or category..."
                placeholderTextColor="#9ca3af"
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              {search.trim() !== '' && (
                <TouchableOpacity onPress={() => setSearch('')} style={styles.clearSearchButton}>
                  <Ionicons name="close-circle" size={18} color="#6b7280" />
                </TouchableOpacity>
              )}
            </Animatable.View>
              {/* Search Results Count */}
            {search.trim() !== '' && (
              <View style={styles.searchResultsContainer}>
                <Text style={styles.searchResultsText}>
                  {activeTab === 'trending' 
                    ? trendingCampaigns.filter(campaign => 
                        campaign.title.toLowerCase().includes(search.toLowerCase()) ||
                        (campaign.description ? campaign.description.toLowerCase().includes(search.toLowerCase()) : false) ||
                        campaign.category.toLowerCase().includes(search.toLowerCase())
                      ).length 
                    : donatedCampaigns.filter(campaign => 
                        campaign.title.toLowerCase().includes(search.toLowerCase()) ||
                        (campaign.description ? campaign.description.toLowerCase().includes(search.toLowerCase()) : false) ||
                        campaign.category.toLowerCase().includes(search.toLowerCase())
                      ).length
                  } results found for "{search}"
                </Text>
              </View>
            )}
            
            {/* Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'trending' && styles.activeTab]}
                onPress={() => setActiveTab('trending')}
              >
                <Text style={[styles.tabText, activeTab === 'trending' && styles.activeTabText]}>Trending Campaigns</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'donated' && styles.activeTab]}
                onPress={() => setActiveTab('donated')}
              >
                <Text style={[styles.tabText, activeTab === 'donated' && styles.activeTabText]}>Donated Campaigns</Text>
              </TouchableOpacity>
            </View>
              {/* Show two campaigns per row */}
            {activeTab === 'trending' ? (
              <View style={styles.exploreCampaignsList}>
                {trendingCampaigns
                  .filter(campaign => 
                    search.trim() === '' || 
                    campaign.title.toLowerCase().includes(search.toLowerCase()) ||
                    campaign.description.toLowerCase().includes(search.toLowerCase()) ||
                    campaign.category.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((campaign, index) => renderCampaignCard(campaign, index, true))}
                {trendingCampaigns.filter(campaign => 
                  search.trim() !== '' && 
                  !campaign.title.toLowerCase().includes(search.toLowerCase()) &&
                  !campaign.description.toLowerCase().includes(search.toLowerCase()) &&
                  !campaign.category.toLowerCase().includes(search.toLowerCase())
                ).length === trendingCampaigns.length && (
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsText}>No campaigns found matching "{search}"</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.exploreCampaignsList}>
                {donatedCampaigns && donatedCampaigns.length > 0 ? (
                  donatedCampaigns
                    .filter(campaign => search.trim() === '' || campaign.title.toLowerCase().includes(search.toLowerCase()) || campaign.description.toLowerCase().includes(search.toLowerCase()) || campaign.category.toLowerCase().includes(search.toLowerCase()))
                    .map((campaign, index) => renderCampaignCard(campaign, index, true))
                ) : (
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsText}>You haven't donated to any campaigns yet.</Text>
                  </View>
                )}
              </View>
            )}
            </View>
          </View>
        </View>
      ) : null}
      {showProfile && (
        <View style={styles.profileModalOverlay}>
          <View style={styles.profileModal}>
            <TouchableOpacity style={styles.closeProfileBtn} onPress={() => setShowProfile(false)}>
              <Ionicons name="close" size={24} color="#9370DB" />
            </TouchableOpacity>
            
            {profileLoading ? (
              <View style={styles.profileLoadingContainer}>
                <Animatable.Text animation="pulse" iterationCount="infinite" style={styles.profileLoadingText}>
                  Loading Profile...
                </Animatable.Text>
              </View>
            ) : profileError ? (
              <View style={styles.profileErrorContainer}>
                <MaterialIcons name="error-outline" size={40} color="#f44336" />
                <Text style={styles.profileErrorText}>{profileError}</Text>
              </View>
            ) : userProfile ? (
              <ScrollView showsVerticalScrollIndicator={false} style={styles.profileScrollView}>
                <Animatable.View animation="fadeIn" duration={500} style={styles.profileContent}>
                  <Image 
                    source={userProfile.avatar || imageMapping.roleSelection} 
                    style={styles.profileAvatar}
                    defaultSource={imageMapping.roleSelection}
                  />
                  
                  <Animatable.Text animation="fadeInUp" delay={100} style={styles.profileName}>
                    {userProfile.name || userProfile.fullName || 'User'}
                  </Animatable.Text>
                  
                  <LinearGradient
                    colors={['#9370DB', '#14b8a6']}
                    style={styles.profileRoleBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <MaterialIcons 
                      name={userProfile.role === 'donor' ? 'favorite' : 'campaign'} 
                      size={16} 
                      color="#fff" 
                      style={styles.profileRoleIcon} 
                    />
                    <Text style={styles.profileRoleText}>
                      {userProfile.role === 'donor' ? 'Donor' : 'Campaign Creator'}
                    </Text>
                  </LinearGradient>
                  
                  <Animatable.View animation="fadeInUp" delay={200} style={styles.profileDetailSection}>
                    <Text style={styles.profileLabel}>Email:</Text>
                    <Text style={styles.profileValue}>{userProfile.email}</Text>
                  
                    {userProfile.phone && (
                      <>
                        <Text style={styles.profileLabel}>Phone:</Text>
                        <Text style={styles.profileValue}>{userProfile.phone}</Text>
                      </>
                    )}
                    
                    {userProfile.address && (
                      <>
                        <Text style={styles.profileLabel}>Address:</Text>
                        <Text style={styles.profileValue}>{userProfile.address}</Text>
                      </>
                    )}
                    
                    {userProfile.organization && (
                      <>
                        <Text style={styles.profileLabel}>Organization:</Text>
                        <Text style={styles.profileValue}>{userProfile.organization}</Text>
                      </>
                    )}
                    
                    {userProfile.role === 'donor' && userProfile.paymentMethods && (
                      <>
                        <Text style={styles.profileLabel}>Payment Methods:</Text>
                        <Text style={styles.profileValue}>{userProfile.paymentMethods}</Text>
                      </>
                    )}
                    
                    {userProfile.role === 'campaign' && userProfile.campaignCount && (
                      <>
                        <Text style={styles.profileLabel}>Campaigns Created:</Text>
                        <Text style={styles.profileValue}>{userProfile.campaignCount}</Text>
                      </>
                    )}
                  </Animatable.View>
                  
                  <TouchableOpacity 
                    onPress={handleLogout}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={['#9370DB', '#14b8a6']}
                      style={styles.logoutButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <MaterialIcons name="logout" size={18} color="#fff" style={{marginRight: 8}} />
                      <Text style={styles.logoutButtonText}>Log Out</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animatable.View>
              </ScrollView>
            ) : (
              <View style={styles.profileErrorContainer}>
                <Text style={styles.profileErrorText}>No profile found</Text>
              </View>
            )}
          </View>
        </View>
      )}
      </ScrollView>
    </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    minHeight: '100%',
    backgroundColor: '#f9fafb',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  mainScrollView: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollViewContent: {
    flexGrow: 1,
    backgroundColor: '#f9fafb',
  },
  
  // Header Styles
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  homeButton: {
    padding: 4,
    borderRadius: 12,
    shadowColor: '#9370DB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  homeIconGradient: {
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconButton: {
    padding: 4,
    borderRadius: 12,
    shadowColor: '#9370DB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  headerIconGradient: {
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },  noResultsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  searchResultsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  searchResultsText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  mainActionButton: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 30,
    marginHorizontal: 8,
    marginBottom: 16,
    minWidth: 180,
    alignItems: 'center',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#feca57',
  },
  mainActionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 1,
    textShadowColor: '#ff6b6b',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  animatedGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 0,
    borderWidth: 0,
    shadowColor: '#fff',
    shadowOpacity: 0.1,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoTitle: {
    display: 'none',
  },
  logoTitleAnimated: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#764ba2',
    textAlign: 'center',
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 1,
    marginVertical: 8,
    flexShrink: 1,
  },
  startCampaignButton: {
    backgroundColor: '#C19A6B', // Bronze-gold color
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  startCampaignText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  heroBackground: {
    // No longer used, background image removed
    display: 'none',
  },
  heroOverlay: {
    minHeight: height * 0.45,
    width: '100%',
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: 'rgba(147, 112, 219, 0.10)',
    borderRadius: 32,
    shadowColor: '#fff',
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    flexWrap: 'wrap',
  },  mainActionButton: {
    backgroundColor: '#9370DB', // Purple color for the Start Your Campaign button
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    marginHorizontal: 8,
    marginBottom: 16,
    minWidth: 180,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  mainActionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },  quoteContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  quote: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#374151',
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 28,
  },  campaignsSection: {
    backgroundColor: '#f7f9fc',
    paddingVertical: 8,
    marginTop: 8,
    minHeight: 0,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9370DB',
    textAlign: 'center',
    opacity: 0.7,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
  },  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#9370DB', // Purple color
  },
  profileIconContainer: {
    backgroundColor: '#f0eaff',
    borderRadius: 20,
    padding: 6,
    marginLeft: 8,
    elevation: 2,
  },  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    backgroundColor: 'transparent',
  },
  clearSearchButton: {
    padding: 4,
  },tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#14b8a6', // Teal color
  },
  tabText: {
    fontSize: 16,
    color: '#6b7280', // Gray color
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  campaignsList: {
    flex: 1,
    marginHorizontal: 20,
  },  campaignCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#9370DB', // Purple color
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  campaignImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 16,
    resizeMode: 'cover',
    backgroundColor: '#e6e8fa',
  },
  campaignTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9370DB', // Purple color
    marginBottom: 4,
  },  campaignDesc: {
    fontSize: 14,
    color: '#555',
  },
  fundingText: {
    fontSize: 12,
    color: '#9370DB',
    fontWeight: '600',
    marginTop: 4,
  },
  // Explore view styles
  exploreContainer: {
    flex: 1,
    backgroundColor: '#f7f9fc',
    padding: 10,
    paddingBottom: 20,
  },
  exploreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  exploreTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeExploreBtn: {
    padding: 5,
  },
  exploreCampaignsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  exploreCardContainer: {
    width: '48%',
    marginBottom: 15,
  },
  


  
  // Category Image Header Styles
  categoryImageContainer: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  categoryImageHeader: {
    height: 100,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryImageStyle: {
    borderRadius: 16,
  },
  categoryImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  categoryHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  categoryIcon: {
    marginRight: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  categoryHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  exploreCard: {
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  exploreCardBg: {
    height: 120,
    width: '100%',
  },
  exploreCardImageContainer: {
    height: 120,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  exploreCardImage: {
    height: 120,
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  exploreCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#14b8a6',
  },
  exploreCardContent: {
    padding: 10,
  },
  exploreCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  exploreCardDesc: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  fundingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  fundingAmount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  fundingGoal: {
    fontSize: 13,
    color: '#777',
    marginLeft: 5,
  },  viewCampaignButton: {
    backgroundColor: '#14b8a6', // Changed to teal
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  viewCampaignText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  profileModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(147, 112, 219, 0.3)', // Purple color with opacity
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  profileModal: {
    width: 320,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#9370DB',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(147, 112, 219, 0.2)',
  },
  profileScrollView: {
    width: '100%',
    maxHeight: '100%',
  },
  profileContent: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  closeProfileBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 2,
    backgroundColor: 'rgba(147, 112, 219, 0.15)',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#9370DB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  profileLoadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  profileLoadingText: {
    fontSize: 18,
    color: '#9370DB',
    fontWeight: '600',
  },
  profileErrorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  profileErrorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
  },
  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    marginTop: 16,
    borderWidth: 4,
    borderColor: '#9370DB',
    shadowColor: '#9370DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  profileName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#9370DB',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  profileRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#9370DB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  profileRoleIcon: {
    marginRight: 4,
  },
  profileRoleText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  profileDetailSection: {
    width: '100%',
    paddingTop: 16,
    paddingHorizontal: 8,
    borderTopWidth: 2,
    borderTopColor: 'rgba(147, 112, 219, 0.3)',
    backgroundColor: 'rgba(147, 112, 219, 0.03)',
    borderRadius: 12,
    marginTop: 8,
  },
  profileLabel: {
    fontSize: 15,
    color: '#9370DB',
    marginTop: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  profileValue: {
    fontSize: 16,
    color: '#4a5568',
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 22,
  },
  logoutButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9370DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  
  // HomeScreen Style Components
  backgroundElement1: {
    position: 'absolute',
    top: 100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(20, 184, 166, 0.05)',
  },
  backgroundElement2: {
    position: 'absolute',
    bottom: 200,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(37, 99, 235, 0.03)',
  },
  
  // Hero Section
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
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
    top: -50,
    right: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(20, 184, 166, 0.06)',
  },
  heroBackground2: {
    position: 'absolute',
    bottom: -80,
    left: -120,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(37, 99, 235, 0.04)',
  },
  heroGrid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTextContainer: {
    zIndex: 1,
    alignItems: 'center',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1f2937',
    lineHeight: 48,
    marginBottom: 16,
    textAlign: 'center',
  },
  heroTitleGradient: {
    color: '#14b8a6',
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#6b7280',
    lineHeight: 28,
    marginBottom: 32,
    maxWidth: 500,
    textAlign: 'center',
  },
  heroButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroButtonsGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  primaryActionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryActionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  primaryActionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActionButton: {
    backgroundColor: 'white',
    borderColor: '#14b8a6',
    borderWidth: 2,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionButtonText: {
    color: '#14b8a6',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineActionButton: {
    backgroundColor: 'transparent',
    borderColor: '#14b8a6',
    borderWidth: 2,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineActionButtonText: {
    color: '#14b8a6',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Quote Section
  quoteCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(243, 244, 246, 0.8)',
  },
  quoteIcon: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#374151',
    lineHeight: 28,
    marginBottom: 16,
  },
  quoteAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14b8a6',
    alignSelf: 'flex-end',
  },
  
  // Explore Section
  exploreSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  exploreSectionHeader: {
    marginBottom: 20,
  },
  exploreTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  exploreSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
});

// NOTE: styles added below by patch - keep grouped for readability
const extraStyles = StyleSheet.create({
  modalBackdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 200
  },
  modalBackdrop50: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', zIndex: 99, width: '50%', margin: 'auto',
    backgroundColor: 'rgba(20, 184, 166, 0.1)'
  },
  historyModal: {
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 24, 
    width: '90%', 
    maxWidth: 450,
    maxHeight: '80%',
    shadowColor: '#9370DB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(147, 112, 219, 0.2)'
  },
  historyTitleContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#9370DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  historyTitleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20
  },
  historyTitle: { 
    fontWeight: '700', 
    fontSize: 20, 
    color: '#fff', 
    textAlign: 'center',
    letterSpacing: 0.5
  },
  historyScroll: { 
    maxHeight: 350,
    paddingHorizontal: 4
  },
  historyItem: { 
    marginBottom: 16, 
    padding: 16, 
    borderRadius: 12, 
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: 'rgba(147, 112, 219, 0.1)',
    shadowColor: '#9370DB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  historyItemTitle: { 
    fontWeight: '600',
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 6
  },
  emptyHistoryContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20
  },
  emptyHistoryText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 12,
    textAlign: 'center'
  },
  emptyHistorySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center'
  },
  historyItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  historyItemStatus: { 
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    marginTop: 4
  },
  historyItemStatusText: {
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center'
  },
  seeDetailsBtn: { 
    marginTop: 12, 
    backgroundColor: '#ef4444', 
    borderRadius: 8, 
    padding: 8, 
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  seeDetailsText: { 
    color: '#fff',
    fontWeight: '600',
    fontSize: 12
  },
  historyCloseBtn: { 
    marginTop: 24, 
    borderRadius: 12, 
    alignSelf: 'center',
    overflow: 'hidden',
    shadowColor: '#9370DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  historyCloseBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    minWidth: 140
  },
  historyCloseText: { 
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center'
  },

  campaignModal: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 24, 
    width: '90%', 
    maxWidth: 520,
    shadowColor: '#9370DB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  campaignModalImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },
  campaignTitleContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#9370DB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  campaignTitleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  campaignModalTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#fff', 
    textAlign: 'center',
    letterSpacing: 0.5,
    flex: 1,
  },
  campaignModalDesc: { 
    color: '#4a5568', 
    marginBottom: 16, 
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  progressContainer: { width: '100%', marginBottom: 16 },
  progressTrack: { 
    height: 16, 
    backgroundColor: 'rgba(148, 112, 219, 0.1)', 
    borderRadius: 12, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148, 112, 219, 0.2)',
  },
  progressFill: { 
    height: '100%', 
    borderRadius: 12,
  },
  progressText: { 
    textAlign: 'center', 
    marginTop: 8, 
    color: '#9370DB',
    fontSize: 15,
    fontWeight: '600',
  },
  donateInput: { 
    borderWidth: 2, 
    borderColor: 'rgba(148, 112, 219, 0.3)', 
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: 'rgba(148, 112, 219, 0.05)',
    color: '#4a5568',
  },
  campaignModalActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  primaryBtn: { 
    paddingVertical: 14, 
    paddingHorizontal: 24, 
    borderRadius: 12,
    shadowColor: '#9370DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryBtnText: { 
    color: '#000000ff', 
    fontWeight: '700', 
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
    backgroundColor: ''

  },
  closeLink: { 
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(148, 112, 219, 0.1)',
  },
  closeLinkText: { 
    color: '#9370DB', 
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
  },

  remainingText: { 
    fontSize: 14, 
    color: '#14b8a6', 
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: { 
    fontSize: 14, 
    color: '#ef4444', 
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryBtnDisabled: { 
    opacity: 0.6,
  },

  walletModal: { backgroundColor: '#fff', borderRadius: 12, padding: 18, width: '85%', maxWidth: 420 },
  walletModalTitle: { fontSize: 18, fontWeight: 'bold', color: '#764ba2', marginBottom: 8 },
  walletConnectedText: { marginBottom: 8 },
  disconnectBtn: { backgroundColor: '#f44336', padding: 10, borderRadius: 8 },
  disconnectBtnText: { color: '#fff' },
  walletModalHelp: { marginBottom: 10 },
  helpLink: { padding: 8 },
  helpLinkText: { color: '#764ba2' },
  closeModalLink: { marginTop: 12, alignSelf: 'flex-end' },

  reasonModal: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 24, 
    width: '88%',
    maxWidth: 400,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)'
  },
  reasonTitleContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  reasonTitleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20
  },
  reasonTitle: { 
    fontWeight: '700', 
    fontSize: 18, 
    color: '#fff', 
    textAlign: 'center',
    letterSpacing: 0.5
  },
  reasonContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.1)',
    marginBottom: 20
  },
  reasonText: { 
    color: '#374151', 
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
    fontWeight: '500'
  },
  reasonCloseBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#9370DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  reasonCloseBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24
  },
  reasonCloseBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
});

// Merge extraStyles into styles object by copying properties so existing code can reference styles.* uniformly
Object.assign(styles, extraStyles);

export default UserInterface;