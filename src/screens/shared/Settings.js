import React, {useState} from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import {useAuthUserContext} from '../../contexts/AuthUserContext';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const SOCIAL_OPTIONS = [
  { name: 'Telegram', icon: 'send' },
  { name: 'Instagram', icon: 'instagram' },
  { name: 'Tiktok', icon: 'music-note' },
  { name: 'Facebook', icon: 'facebook' },
  { name: 'Twitter', icon: 'twitter' },
  { name: 'LinkedIn', icon: 'linkedin' },
];

export function Settings() {
  const {authUser, setAuthUser} = useAuthUserContext();
  const [isEditable, setIsEditable] = useState(false);
  const [username, setUsername] = useState(authUser?.username || '');
  const [phoneNumber, setPhoneNumber] = useState(authUser?.phoneNumber || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [socialMedia, setSocialMedia] = useState(authUser.socialMedia || []);
  const [adding, setAdding] = useState(false);
  const [newSocial, setNewSocial] = useState({ name: '', link: '' });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const [saving, setSaving] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigation = useNavigation();

  const handleSave = async () => {
    if (!username || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (oldPassword && (!newPassword || !confirmPassword)) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match.');
      return;
    }

    console.log(username, phoneNumber, oldPassword, newPassword);

    try {
      const response = await axios.post(
        'http://localhost:4000/api/auth/update',
        {
          userId: authUser._id,
          username,
          phoneNumber,
          oldPassword,
          newPassword,
        },
      );
      if (response.data?.message)
        Alert.alert('Success', 'Profile updated successfully.');
      else
        Alert.alert(
          'Error',
          'Failed to update profile. Please try again later.',
        );

      setIsEditable(false);
    } catch (error) {
      console.log(error);
    }
  };

  // Unified handler for updating social media
  const updateSocialMedia = async (updatedSocialMedia) => {
    setSocialMedia(updatedSocialMedia);
    setAuthUser(prev => ({ ...prev, socialMedia: updatedSocialMedia }));
    await axios.post('http://localhost:4000/api/auth/update', {
      userId: authUser._id,
      socialMedia: updatedSocialMedia
    });
  };

  // Add new social media
  const handleAddSocial = () => {
    setNewSocial({ name: '', link: '' });
    setSelectedName('');
    setModalVisible(true);
  };

  // Save new social media
  const handleSaveSocial = async () => {
    if (!newSocial.name || !newSocial.link) return;
    setSaving(true);
    try {
      const updated = [...socialMedia, newSocial];
      await updateSocialMedia(updated);
      setModalVisible(false);
    } finally {
      setSaving(false);
    }
  };

  // Remove social media
  const handleRemove = async (idx) => {
    const updated = socialMedia.filter((_, i) => i !== idx);
    await updateSocialMedia(updated);
  };


  const handleLogout = () => {
    setAuthUser(null);
    navigation.navigate('Login'); // or navigation.navigate('Login') depending on your stack
  };
  


  return (
    <ScrollView>
      <View className="flex-1 p-4 bg-white">
        <Text className="text-gray-800 text-3xl text-center mb-4">Settings</Text>

        {/* Account Info Card */}
        <View className="bg-white rounded-2xl shadow-md p-5 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">Account Info</Text>
          <View className="mb-4">
            <Text className="text-gray-700 mb-1">Username</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
              <Icon name="account" size={20} color="#7c3aed" />
              <TextInput
                className="flex-1 p-2 text-gray-900"
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
                editable={isEditable}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
          <View className="mb-2">
            <Text className="text-gray-700 mb-1">Phone Number</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
              <Icon name="phone" size={20} color="#7c3aed" />
              <TextInput
                className="flex-1 p-2 text-gray-900"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                editable={isEditable}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        {/* Password Section Card */}
        <View className="bg-white rounded-2xl shadow-md p-5 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">Change Password</Text>
          <View className="mb-4">
            <Text className="text-gray-700 mb-1">Old Password</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
              <Icon name="lock" size={20} color="#7c3aed" />
              <TextInput
                className="flex-1 p-2 text-gray-900"
                placeholder="Enter your old password"
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry={!showOldPassword}
                editable={isEditable}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity onPress={() => setShowOldPassword(v => !v)}>
                <Icon name={showOldPassword ? 'eye-off' : 'eye'} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
          <View className="mb-4">
            <Text className="text-gray-700 mb-1">New Password</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
              <Icon name="lock-outline" size={20} color="#7c3aed" />
              <TextInput
                className="flex-1 p-2 text-gray-900"
                placeholder="Enter your new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                editable={isEditable}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity onPress={() => setShowNewPassword(v => !v)}>
                <Icon name={showNewPassword ? 'eye-off' : 'eye'} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
          <View className="mb-2">
            <Text className="text-gray-700 mb-1">Confirm Password</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
              <Icon name="lock-check" size={20} color="#7c3aed" />
              <TextInput
                className="flex-1 p-2 text-gray-900"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={isEditable}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(v => !v)}>
                <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-end space-x-3 mb-6">
          <TouchableOpacity
            className={`px-5 py-2 rounded-lg ${isEditable ? 'bg-gray-200' : 'bg-violet-600'}`}
            onPress={() => setIsEditable(!isEditable)}
          >
            <Text className={`font-semibold ${isEditable ? 'text-gray-700' : 'text-white'}`}>{isEditable ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
          {isEditable && (
            <TouchableOpacity
              className="px-5 py-2 rounded-lg bg-violet-600"
              onPress={handleSave}
            >
              <Text className="font-semibold text-white">Save</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Social Media Section (only for non-buyers) */}
        {authUser.role !== 'buyer' && (
          <>
            <Text className="text-lg font-bold text-gray-900 mb-2 mt-6">Social Media</Text>
            {socialMedia.length === 0 && (
              <Text className="text-gray-400 mb-2">No social media links added.</Text>
            )}
            {socialMedia.map((sm, idx) => (
              <View key={idx} className="flex-row items-center bg-white rounded-xl p-3 mb-2 shadow-sm">
                <Icon name={SOCIAL_OPTIONS.find(opt => opt.name === sm.name)?.icon || 'web'} size={22} color="#7c3aed" className="mr-2" />
                <Text className="font-semibold text-gray-800 mr-2 min-w-[80px]">{sm.name}</Text>
                <Text className="flex-1 text-blue-700 underline" numberOfLines={1}>{sm.link}</Text>
                <TouchableOpacity onPress={() => handleRemove(idx)} className="ml-2 p-1 rounded-full bg-red-100">
                  <Icon name="close" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              className="flex-row items-center justify-center mt-2 bg-violet-600 py-2 rounded-xl"
              onPress={handleAddSocial}
            >
              <Icon name="plus" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Add Social Media</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
              <View className="flex-1 justify-center items-center bg-black bg-opacity-40">
                <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md">
                  <Text className="text-lg font-bold mb-4 text-violet-700">Add Social Media</Text>
                  <Text className="mb-2 text-gray-700">Platform</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                    {SOCIAL_OPTIONS.map(opt => (
                      <TouchableOpacity
                        key={opt.name}
                        className={`flex-row items-center px-3 py-2 mr-2 rounded-full border ${selectedName === opt.name ? 'bg-violet-100 border-violet-600' : 'bg-gray-100 border-gray-200'}`}
                        onPress={() => {
                          setSelectedName(opt.name);
                          setNewSocial(prev => ({ ...prev, name: opt.name }));
                        }}
                      >
                        <Icon name={opt.icon} size={20} color={selectedName === opt.name ? '#7c3aed' : '#6B7280'} />
                        <Text className={`ml-2 font-semibold ${selectedName === opt.name ? 'text-violet-700' : 'text-gray-700'}`}>{opt.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <Text className="mb-2 text-gray-700">Link</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg p-3 text-black mb-4 bg-gray-50"
                    placeholder="Enter link (e.g. https://t.me/username)"
                    value={newSocial.link}
                    onChangeText={link => setNewSocial(prev => ({ ...prev, link }))}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                  <View className="flex-row justify-end space-x-2">
                    <TouchableOpacity onPress={() => setModalVisible(false)} className="px-4 py-2 rounded-lg bg-gray-200">
                      <Text className="text-gray-700 font-semibold">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`px-4 py-2 rounded-lg ${!newSocial.name || !newSocial.link ? 'bg-violet-300' : 'bg-violet-600'}`}
                      disabled={!newSocial.name || !newSocial.link || saving}
                      onPress={handleSaveSocial}
                    >
                      <Text className="text-white font-semibold">{saving ? 'Saving...' : 'Save'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </>
        )}

<TouchableOpacity
  className="mt-6 bg-red-600 py-3 rounded-xl items-center"
  onPress={handleLogout}
>
  <Text className="text-white font-semibold text-lg">Logout</Text>
</TouchableOpacity>

      </View>
    </ScrollView>
  );
}
