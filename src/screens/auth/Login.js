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
import {useAuthUserContext} from '../../contexts/AuthUserContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const {setAuthUser} = useAuthUserContext();
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const res = await axios.post('http://localhost:4000/api/auth/login', {
        email,
        password,
      });
      console.log(res);
      if (res.data._id) {
        setAuthUser(res.data);
      } else Alert.alert('Login in failed !', 'Check your credentials !');
      // Handle token, user context, etc.
    } catch (err) {
      Alert.alert(
        'Login Failed',
        err?.response?.data?.message || 'Something went wrong',
      );
    }
  };

  return (
    <View className="flex-1 justify-center px-5 bg-white">
      <View className="flex-col justify-center items-center w-full">
        <Image
          source={require('../../assets/logo.png')}
          className="h-52 w-full"
          resizeMode="contain"
        />
        <Text className="text-3xl font-bold text-violet-600">Car Hub</Text>
      </View>

      <Text className="text-3xl font-bold text-violet-600 text-center mb-10 ">
        Welcome Back
      </Text>

      <Text className="text-base text-gray-600 mb-1">Email</Text>
      <TextInput
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-gray-800"
        value={email}
        onChangeText={setEmail}
      />

      <Text className="text-base text-gray-600 mb-1">Password</Text>
      <View className="relative mb-6">
        <TextInput
          placeholder="••••••••"
          secureTextEntry={!showPass}
          className="border border-gray-300 rounded-xl px-4 py-3 pr-12 text-gray-800"
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          className="absolute right-3 top-3"
          onPress={() => setShowPass(!showPass)}>
          <Icon name="eye" size={29} color="#000" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="bg-violet-600 rounded-xl py-3"
        onPress={handleLogin}>
        <Text className="text-white text-center text-lg font-semibold">
          Login
        </Text>
      </TouchableOpacity>

      <View className="flex-row justify-center mt-6">
        <Text className="text-gray-600">Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text className="text-violet-600 ml-1 font-semibold">Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
