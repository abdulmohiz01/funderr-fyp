import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '../services/ApiService';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Dummy data for initial UI

export default function AdminPortalScreen({ navigation }) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectCampaignId, setRejectCampaignId] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]); // Keep for future user management
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('campaigns');
  const [role, setRole] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const checkRoleAndFetchCampaigns = async () => {
      const userRole = await AsyncStorage.getItem('userRole');
      setRole(userRole);
      if (userRole !== 'admin') {
        setAccessDenied(true);
        setTimeout(() => {
          navigation.replace('UserInterface');
        }, 2000);
        return;
      }
      setLoading(true);
      try {
        const pendingCampaigns = await ApiService.listCampaigns('pending');
        setCampaigns(pendingCampaigns);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };
    checkRoleAndFetchCampaigns();
  }, []);

  // Approve campaign
  const handleApprove = async (id) => {
    setLoading(true);
    try {
      await ApiService.approveCampaign(id);
      // Refresh campaigns
      const pendingCampaigns = await ApiService.listCampaigns('pending');
      setCampaigns(pendingCampaigns);
    } catch (error) {
      console.error('Approve error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reject campaign
  const handleReject = (id) => {
    setRejectCampaignId(id);
    setShowRejectModal(true);
  };

  const submitReject = async () => {
    if (!rejectCampaignId) return;
    setLoading(true);
    try {
      await ApiService.rejectCampaign(rejectCampaignId, rejectReason || 'Not approved by admin');
      setShowRejectModal(false);
      setRejectReason('');
      setRejectCampaignId(null);
      // Refresh campaigns
      const pendingCampaigns = await ApiService.listCampaigns('pending');
      setCampaigns(pendingCampaigns);
    } catch (error) {
      console.error('Reject error:', error);
    } finally {
      setLoading(false);
    }
  };
  if (accessDenied) {
    return (
      <LinearGradient colors={["#764ba2", "#feca57", "#ff6b6b"]} style={styles.background}>
        <View style={styles.container}>
          <Text style={styles.heading}>Access Denied</Text>
          <Text style={{ color: '#fff', fontSize: 18, marginTop: 12 }}>You do not have permission to view this page.</Text>
        </View>
      </LinearGradient>
    );
  }

  // ...existing code...
  return (
    <LinearGradient colors={["#764ba2", "#feca57", "#ff6b6b"]} style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Admin Portal</Text>
        <View style={styles.tabBar}>
          <TouchableOpacity onPress={() => setTab('campaigns')} style={[styles.tab, tab === 'campaigns' && styles.activeTab]}>
            <Ionicons name="list" size={20} color={tab === 'campaigns' ? '#fff' : '#764ba2'} />
            <Text style={[styles.tabText, tab === 'campaigns' && styles.activeTabText]}>Campaigns</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('users')} style={[styles.tab, tab === 'users' && styles.activeTab]}>
            <MaterialIcons name="people" size={20} color={tab === 'users' ? '#fff' : '#764ba2'} />
            <Text style={[styles.tabText, tab === 'users' && styles.activeTabText]}>Users</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#764ba2" />
        ) : tab === 'campaigns' ? (
          <View style={styles.section}>
            {campaigns.map(c => (
              <View key={c._id} style={styles.card}>
                <Text style={styles.cardTitle}>{c.title}</Text>
                <Text>Status: {c.status}</Text>
                <Text>Creator: {c.creatorName}</Text>
                <Text>Goal: {c.goal}</Text>
                <Text>Raised: {c.raised}</Text>
                <Text>Category: {c.category}</Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleApprove(c._id)}><Text>Approve</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleReject(c._id)}><Text>Reject</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            {users.map(u => (
              <View key={u.id} style={styles.card}>
                <Text style={styles.cardTitle}>{u.name}</Text>
                <Text>Email: {u.email}</Text>
                <Text>Role: {u.role}</Text>
                <Text>Status: {u.status}</Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.actionBtn}><Text>Edit</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}><Text>Ban</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}><Text>Assign Role</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      {/* Reject Reason Modal */}
      <Modal
        visible={showRejectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.3)'}}>
          <View style={{backgroundColor:'#fff', padding:24, borderRadius:16, width:'80%'}}>
            <Text style={{fontWeight:'bold', fontSize:18, marginBottom:12, color:'#764ba2'}}>Enter Rejection Reason</Text>
            <TextInput
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="Reason for rejection"
              style={{borderWidth:1, borderColor:'#feca57', borderRadius:8, padding:10, marginBottom:16}}
              multiline
            />
            <View style={{flexDirection:'row', justifyContent:'flex-end'}}>
              <TouchableOpacity style={[styles.actionBtn, {backgroundColor:'#eee'}]} onPress={() => setShowRejectModal(false)}>
                <Text style={{color:'#764ba2'}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={submitReject}>
                <Text>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    padding: 24,
    alignItems: 'center',
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textShadowColor: '#764ba2',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  activeTab: {
    backgroundColor: '#764ba2',
  },
  tabText: {
    fontSize: 18,
    marginLeft: 8,
    color: '#764ba2',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#fff',
  },
  section: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '95%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#764ba2',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#764ba2',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionBtn: {
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#feca57',
    borderRadius: 8,
  },
});
