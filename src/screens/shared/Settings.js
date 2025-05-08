import React, {useState} from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {useAuthUserContext} from '../../contexts/AuthUserContext';
import axios from 'axios';

export function Settings() {
  const {authUser} = useAuthUserContext();
  const [isEditable, setIsEditable] = useState(false);
  const [username, setUsername] = useState(authUser?.username || '');
  const [phoneNumber, setPhoneNumber] = useState(authUser?.phoneNumber || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  return (
    <ScrollView>
      <View className="flex-1 p-4 bg-white">
        <Text className="text-gray-800 text-3xl text-center  mb-4">
          Settings
        </Text>

        <Text className="text-black text-sm mb-2">Username</Text>
        <TextInput
          className="border border-gray-300 rounded p-2 mb-4"
          placeholder="Enter your username"
          value={username}
          onChangeText={setUsername}
          editable={isEditable}
        />

        <Text className="text-black text-sm mb-2">Phone Number</Text>
        <TextInput
          className="border border-gray-300 rounded p-2 mb-4"
          placeholder="Enter your phone number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          editable={isEditable}
        />

        {isEditable && (
          <>
            <Text className="text-black text-sm mb-2">Old Password</Text>
            <TextInput
              className="border border-gray-300 rounded p-2 mb-4 text-black"
              placeholder="Enter your old password"
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
            />

            <Text className="text-black text-sm mb-2">New Password</Text>
            <TextInput
              className="border border-gray-300 rounded p-2 mb-4 text-black"
              placeholder="Enter your new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <Text className="text-black text-sm mb-2">Confirm Password</Text>
            <TextInput
              className="border border-gray-300 rounded p-2 mb-4 text-black"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </>
        )}

        <TouchableOpacity
          className={`bg-blue-500 rounded p-2 mb-4 ${
            isEditable ? 'bg-red-600' : 'bg-green-600'
          }`}
          onPress={() => setIsEditable(!isEditable)}>
          <Text
            className={`text-white ${
              isEditable ? 'bg-red-600' : 'bg-green-600'
            } text-center`}>
            {isEditable ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>

        {isEditable && (
          <TouchableOpacity
            className="bg-violet-600 rounded p-2"
            onPress={handleSave}>
            <Text className="text-white text-center">Save</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
