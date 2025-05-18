import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
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
  const [selectedTab, setSelectedTab] = useState('history');
  const [wishlistCars, setWishlistCars] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (selectedTab === 'wishlist') {
      const fetchWishlist = async () => {
        setLoadingWishlist(true);
        try {
          const res = await axios.get(`http://localhost:4000/api/auth/${authUser._id}/wishlist`);
          setWishlistCars(res.data);
        } catch (e) {
          setWishlistCars([]);
        } finally {
          setLoadingWishlist(false);
        }
      };
      fetchWishlist();
    }
  }, [selectedTab, authUser._id]);

  const openModal = async item => {
    if (item.carId) {
      // History item: fetch car by carId
      try {
        const res = await axios.get(
          `http://localhost:4000/api/car/get/${item.carId}`,
          {withCredentials: true},
        );
        if (res.data._id) {
          setSelectedItem(res.data);
          setModalVisible(true);
        } else setSelectedItem(item);
      } catch (error) {}
    } else {
      // Wishlist item: use car object directly
      setSelectedItem(item);
      setModalVisible(true);
    }
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

  const handleRemoveFromWishlist = async (carId) => {
    try {
      await axios.post(`http://localhost:4000/api/auth/${authUser._id}/wishlist`, { carId });
      setWishlistCars(prev => prev.filter(car => car._id !== carId));
      setAuthUser(prev => ({
        ...prev,
        wishList: prev.wishList?.filter(id => id !== carId)
      }));
    } catch {}
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
      {/* Tabs */}
      <View className="flex-row mb-4">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-l-xl ${selectedTab === 'history' ? 'bg-violet-600' : 'bg-white border border-violet-600'}`}
          onPress={() => setSelectedTab('history')}
        >
          <Text className={`text-center font-semibold ${selectedTab === 'history' ? 'text-white' : 'text-violet-600'}`}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 rounded-r-xl ${selectedTab === 'wishlist' ? 'bg-violet-600' : 'bg-white border border-violet-600'}`}
          onPress={() => setSelectedTab('wishlist')}
        >
          <Text className={`text-center font-semibold ${selectedTab === 'wishlist' ? 'text-white' : 'text-violet-600'}`}>Wishlist</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {selectedTab === 'history' ? (
        <>
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
        </>
      ) : (
        <>
          <View className="flex-row justify-between mb-2">
            <Text className="text-xl font-bold mb-4">Wishlist</Text>
            <TouchableOpacity onPress={() => {
              setLoadingWishlist(true);
              axios.get(`http://localhost:4000/api/auth/${authUser._id}/wishlist`).then(res => {
                setWishlistCars(res.data);
              }).finally(() => setLoadingWishlist(false));
            }}>
              <Icon name="refresh" size={25} color="#6B7280" />
            </TouchableOpacity>
          </View>
          {loadingWishlist ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#7c3aed" />
            </View>
          ) : wishlistCars.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Icon name="favorite-border" size={48} color="#d1d5db" />
              <Text className="text-gray-500 mt-4">No cars in your wishlist</Text>
            </View>
          ) : (
            <FlatList
              data={wishlistCars}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => openModal(item)}
                  className="flex-row bg-white p-4 rounded-xl mb-3 shadow-sm items-center">
                  <Image source={{ uri: item.images[0] }} className="w-20 h-20 rounded-lg mr-4" />
                  <View className="flex-1">
                    <Text className="text-base font-semibold">{item.brand} - {item.model}</Text>
                    <Text className="text-xs text-gray-400">Year: {item.year}</Text>
                    <Text className="text-xs text-gray-400">{item.location}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveFromWishlist(item._id)} className="ml-2 p-2 rounded-full bg-red-100">
                    <Icon name="close" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </Pressable>
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}

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
