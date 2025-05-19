import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Feather';
import { useAuthUserContext } from '../../contexts/AuthUserContext';

export function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('buyer');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const {setAuthUser}=useAuthUserContext()
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!email || !username || !password || !confirmPassword || !role || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
  
    // Phone number validation
    const phoneRegex = /^(09|07)\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Invalid Phone Number', 'Phone number must start with 09 or 07 and be 10 digits long');
      return;
    }
  
    // Password length validation
    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long');
      return;
    }
  
    // Confirm password match
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
  
    try {
      const res = await axios.post('http://localhost:4000/api/auth/register', {
        email,
        username,
        password,
        role,
        phoneNumber,
      });
      if (res.data._id) {
        Alert.alert('Success', 'Account created successfully');
        setAuthUser(res.data);
        navigation.navigate('Login');
      } else {
        Alert.alert('Registration failed', 'Please try again');
      }
    } catch (err) {
      Alert.alert(
        'Registration Failed',
        err?.response?.data?.message || 'Something went wrong',
      );
    }
  };
  
  return (
    <View className="flex-1 justify-center px-5 pb-8 bg-white">
      <View className="flex-col justify-center items-center w-full">
        <Image
          source={require('../../assets/logo.png')}
          className="h-32 w-full"
          resizeMode="contain"
        />
        <Text className="text-xl font-bold text-violet-600">Car Hub</Text>
      </View>

      <Text className="text-xl font-bold text-violet-600 text-center mb-2">
        Create Account
      </Text>

      <Text className="text-sm text-gray-600 mb-1">Email</Text>
      <TextInput
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        className="border  border-gray-300 rounded-lg px-4 py-1.5 mb-2 text-gray-800"
        value={email}
        onChangeText={setEmail}
      />

      <Text className="test-sm text-gray-600 mb-1">Username</Text>
      <TextInput
        placeholder="your username"
        className="border border-gray-300 rounded-lg px-4 py-1.5 mb-2 text-gray-800"
        value={username}
        onChangeText={setUsername}
      />

      <Text className="test-sm text-gray-600 mb-1">Phone Number</Text>
      <TextInput
        placeholder="+1234567890"
        keyboardType="phone-pad"
        className="border border-gray-300 rounded-lg px-4 py-1.5 mb-2 text-gray-800"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      <Text className="test-sm text-gray-600 mb-1">Password</Text>
      <View className="relative mb-2">
        <TextInput
          placeholder="••••••••"
          secureTextEntry={!showPass}
          className="border border-gray-300 rounded-lg px-4 py-1.5 pr-12 text-gray-800"
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          className="absolute right-1.5 top-1.5"
          onPress={() => setShowPass(!showPass)}>
          <Icon name="eye" size={18} color="#000" />
        </TouchableOpacity>
      </View>

      <Text className="test-sm text-gray-600 mb-1">Confirm Password</Text>
      <View className="relative mb-2">
        <TextInput
          placeholder="••••••••"
          secureTextEntry={!showConfirmPass}
          className="border border-gray-300 rounded-lg px-4 py-1.5 pr-12 text-gray-800"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          className="absolute right-1.5 top-1.5"
          onPress={() => setShowConfirmPass(!showConfirmPass)}>
          <Icon name="eye" size={18} color="#000" />
        </TouchableOpacity>
      </View>

      <Text className="test-sm text-gray-600 mb-1">Role</Text>
      <View className="flex-row mb-3 space-x-1">
        <TouchableOpacity
          className={`py-1 flex-1 h-8 rounded-lg border ${
            role === 'buyer'
              ? 'bg-violet-600 border-violet-600'
              : 'border-gray-300'
          }`}
          onPress={() => setRole('buyer')}>
          <Text
            className={`text-center  font-semibold ${
              role === 'buyer' ? 'text-white' : 'text-gray-800'
            }`}>
            Buyer
          </Text>
        </TouchableOpacity>


        <TouchableOpacity
          className={`flex-1 py-1 h-8 rounded-lg border ${
            role === 'seller'
              ? 'bg-violet-600 border-violet-600'
              : 'border-gray-300'
          }`}
          onPress={() => setRole('seller')}>
          <Text
            className={`text-center font-semibold ${
              role === 'seller' ? 'text-white' : 'text-gray-800'
            }`}>
            Seller
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="bg-violet-600 rounded-lg py-1.5"
        onPress={handleRegister}>
        <Text className="text-white text-center font-semibold">
          Register
        </Text>
      </TouchableOpacity>

      <View className="flex-row justify-center mt-3">
        <Text className="text-gray-600">Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text className="text-violet-600 ml-1 font-semibold">Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
