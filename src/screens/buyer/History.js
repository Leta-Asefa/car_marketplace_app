import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useAuthUserContext} from '../../contexts/AuthUserContext';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {CarDetailsModal} from '../../components/CarDetailsModal';

export const History = () => {
  const {authUser, setAuthUser} = useAuthUserContext();
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const openModal = async item => {
    console.log('opening modal');
    try {
      const res = await axios.get(
        `http://localhost:4000/api/car/get/${item.carId}`,
        {withCredentials: true},
      );
      console.log('fetched car ', res.data);
      if (res.data._id) {
        setSelectedItem(res.data);
        setModalVisible(true);
      } else setSelectedItem(item);
    } catch (error) {}
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get(
        `http://localhost:4000/api/auth/${authUser._id}/search_history`,
        {withCredentials: true},
      );
      console.log('fetched history ', res.data);
      if (res.data) {
        setAuthUser(prevAuthUser => ({
          ...prevAuthUser,
          searchHistory: res.data,
        }));
      }
    } catch (error) {
      console.error('Error refreshing search history', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = ({item}) => (
    <Pressable
      onPress={() => openModal(item)}
      className="bg-white p-4 rounded-xl mb-3 shadow-sm flex-row justify-between items-center">
      <View>
        <Text className="text-base font-semibold">
          {item.brand} - {item.model}
        </Text>
        <Text className="text-sm text-gray-500">
          {item.location.split(',')[0]}
        </Text>
        <Text className="text-xs text-gray-400">Year: {item.year}</Text>
      </View>
      <Icon name="remove-red-eye" size={20} color="#6B7280" />
    </Pressable>
  );

  return (
    <View className="flex-1 bg-gray-100 p-4">

      <View className="flex-row justify-between  mb-2 ">
        <Text className="text-xl font-bold mb-4">Search History</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Icon name="refresh" size={25} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={authUser?.searchHistory || []}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <CarDetailsModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        selectedCar={selectedItem}
        navigation={navigation}
        sellerId={selectedItem?.user._id}
      />
      {console.log('selectedItem ', selectedItem)}
    </View>
  );
};
