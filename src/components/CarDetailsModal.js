import React, {useState, useEffect} from 'react';
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import axios from 'axios';

import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useAuthUserContext } from '../contexts/AuthUserContext';

export function CarDetailsModal({
  modalVisible,
  setModalVisible,
  selectedCar,
  setSelectedCar,
  navigation,
  sellerId,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [otherPosts, setOtherPosts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const { authUser } = useAuthUserContext();

  useEffect(() => {
    const fetchOtherPosts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/car/get_other_posts/${sellerId}`,
        );
        setOtherPosts(response.data);
      } catch (error) {
        console.error('Error fetching other posts:', error);
      }
    };

    const fetchRecommendations = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/car/recommendations/${selectedCar?.user?._id}`,
        );
        setRecommendations(response.data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    };

    if (sellerId) {
      fetchOtherPosts();
    }

    if (selectedCar?.user?._id) fetchRecommendations();
  }, [sellerId, selectedCar]);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={modalVisible}
      onRequestClose={() => {
        setCurrentIndex(0);
        setModalVisible(false);
      }}>
      <View className="flex-1 bg-white">
        {/* Header with close button */}
        <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            className="p-2">
            <Icon name="arrow-back" size={24} color="#7c3aed" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">
            Vehicle Details
          </Text>
          <View className="w-8" />
        </View>

        <ScrollView className="flex-1">
          {selectedCar && (
            <>
              {/* Image Gallery with Horizontal Scroll */}
              <View className="w-full h-64 bg-gray-50 relative">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  pagingEnabled
                  className="h-full"
                  onScroll={({nativeEvent}) => {
                    const slide = Math.round(
                      nativeEvent.contentOffset.x /
                        nativeEvent.layoutMeasurement.width,
                    );
                    setCurrentIndex(slide);
                  }}
                  scrollEventThrottle={16}>
                  {selectedCar.images?.filter(img => img).length > 0 ? (
                    selectedCar.images
                      .filter(img => img)
                      .map((image, index) => (
                        <View
                          key={index}
                          className="w-screen flex justify-center items-center">
                          <Image
                            source={{uri: image.trim()}}
                            className="w-full h-64"
                            resizeMode="contain"
                          />
                        </View>
                      ))
                  ) : (
                    <View className="w-screen h-64 justify-center items-center">
                      <Icon name="no-photography" size={40} color="#9CA3AF" />
                      <Text className="text-gray-500 mt-2">
                        No images available
                      </Text>
                    </View>
                  )}
                </ScrollView>

                {/* Image Position Indicator */}
                {selectedCar.images?.filter(img => img).length > 0 && (
                  <View className="absolute bottom-2 w-full flex-row justify-center">
                    {selectedCar.images
                      .filter(img => img)
                      .map((_, index) => (
                        <View
                          key={index}
                          className={`h-2 w-2 mx-1 rounded-full ${
                            index === currentIndex
                              ? 'bg-violet-600'
                              : 'bg-gray-400'
                          }`}
                        />
                      ))}
                  </View>
                )}

                {/* Image Counter */}
                {selectedCar.images?.filter(img => img).length > 0 && (
                  <View className="absolute top-2 right-2 bg-black bg-opacity-50 px-2 py-1 rounded-full">
                    <Text className="text-white text-xs">
                      {currentIndex + 1}/
                      {selectedCar.images.filter(img => img).length}
                    </Text>
                  </View>
                )}
              </View>

              {/* Car Details */}
              <View className="p-4">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-gray-900">
                      {selectedCar.title ? `${selectedCar.title} ` : 'Unknown Ttile '}
                    </Text>
                    <Text className="text-xl font-bold text-gray-900">
                      {selectedCar.brand
                        ? `${selectedCar.brand} `
                        : 'Unknown Brand '}
                      {selectedCar.model || 'Unknown Model'}
                    </Text>
                    <Text className="text-gray-500">
                      {selectedCar.year || 'Year N/A'}
                      {' • '}
                      {selectedCar.location || 'Location N/A'}
                    </Text>
                  </View>
                  <Text className="text-xl font-bold text-green-600">
                    {selectedCar.price
                      ? `$${Number(selectedCar.price).toLocaleString()}`
                      : '$N/A'}
                  </Text>
                </View>

                {/* All Specs */}
                <View className="flex-row flex-wrap gap-2 mb-4">
                  {selectedCar.bodyType && (
                    <View className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full">
                      <Icon name="directions-car" size={16} color="#6B7280" />
                      <Text className="text-sm text-gray-600 ml-1">
                        {selectedCar.bodyType}
                      </Text>
                    </View>
                  )}
                  {selectedCar.fuel && (
                    <View className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full">
                      <Icon
                        name="local-gas-station"
                        size={16}
                        color="#6B7280"
                      />
                      <Text className="text-sm text-gray-600 ml-1">
                        {selectedCar.fuel}
                      </Text>
                    </View>
                  )}
                  {selectedCar.mileage && (
                    <View className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full">
                      <Icon name="speed" size={16} color="#6B7280" />
                      <Text className="text-sm text-gray-600 ml-1">
                        {selectedCar.mileage} mi
                      </Text>
                    </View>
                  )}
                  {selectedCar.transmission && (
                    <View className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full">
                      <Icon name="settings" size={16} color="#6B7280" />
                      <Text className="text-sm text-gray-600 ml-1">
                        {selectedCar.transmission}
                      </Text>
                    </View>
                  )}
                  {selectedCar.color && (
                    <View className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full">
                      <FontAwesome
                        name="paint-brush"
                        size={14}
                        color="#6B7280"
                      />
                      <Text className="text-sm text-gray-600 ml-1">
                        {selectedCar.color}
                      </Text>
                    </View>
                  )}
                  {selectedCar.status && (
                    <View className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full">
                      {selectedCar.status === 'approved' ? (
                        <Icon name="verified" size={16} color="#0a0" />
                      ) : (
                        <Icon name="close" size={16} color="#a00" />
                      )}
                      <Text className="text-sm text-gray-600 ml-1">
                        {selectedCar.status === 'approved'
                          ? 'Verified'
                          : 'Unverified'}
                      </Text>
                    </View>
                  )}
                  {selectedCar.vehicleDetails && (
                    <View className="flex-row items-center bg-violet-100 px-3 py-1 rounded-full mr-2 mb-2">
                      <Icon name="directions-car" size={16} color="#7c3aed" />
                      <Text className="text-sm text-violet-700 ml-1 capitalize">
                        {selectedCar.vehicleDetails}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Features, Safety, and Vehicle Details */}
                {(selectedCar.features?.length > 0 ||
                  selectedCar.safety?.length > 0 ||
                  selectedCar.vehicleDetails) && (
                  <View className="mb-6">
                    {selectedCar.features?.length > 0 && (
                      <View className="mb-2">
                        <Text className="text-lg font-semibold text-blue-700 mb-1">
                          Features
                        </Text>
                        {selectedCar.features.map((feature, idx) => (
                          <View
                            key={idx}
                            className="flex-row items-center mb-1">
                            <Icon name="check" size={15} color="#2563eb" />
                            <Text className="text-sm text-blue-700 ml-2">
                              {feature}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {selectedCar.safety?.length > 0 && (
                      <View>
                        <Text className="text-lg font-semibold text-green-700 mb-1">
                          Safety
                        </Text>
                        {selectedCar.safety.map((safety, idx) => (
                          <View
                            key={idx}
                            className="flex-row items-center mb-1">
                            <Icon name="security" size={15} color="#059669" />
                            <Text className="text-sm text-green-700 ml-2">
                              {safety}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Description */}
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-gray-900 mb-2">
                    Description
                  </Text>
                  <Text className="text-gray-700">
                    {selectedCar.description || 'No description available'}
                  </Text>
                </View>

                {/* Seller Info */}
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-gray-900 mb-2">
                    Seller Information
                  </Text>
                  <View className="flex-row items-center">
                    <View className="bg-gray-200 p-2 rounded-full mr-3">
                      <Icon name="person" size={20} color="#6B7280" />
                    </View>
                    <View>
                      <Text className="font-medium text-gray-800">
                        {selectedCar?.user?.email || 'No contact information'}
                      </Text>
                      <Text className="font-medium text-gray-800">
                        {selectedCar?.user?.phoneNumber ||
                          'No contact information'}
                        {console.log('no phone ?', selectedCar?.user)}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {selectedCar.createdAt
                          ? `Member  since ${new Date(
                              selectedCar?.user.createdAt,
                            ).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric',
                            })}`
                          : 'Member date not available'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Other Posts Section */}
                {otherPosts.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-2">
                      Seller's Other Posts
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}>
                      {otherPosts.map(car => (
                        <TouchableOpacity
                          key={car._id}
                          className="mr-4"
                          onPress={() => {
                            setModalVisible(false);
                            setTimeout(() => {
                              setModalVisible(true);
                              setSelectedCar(car);
                            }, 300);
                          }}>
                          <View className="w-40 bg-gray-100 rounded-lg overflow-hidden shadow-md">
                            <Image
                              source={{
                                uri:
                                  car.images[0] ||
                                  'https://via.placeholder.com/150',
                              }}
                              className="w-full h-24"
                              resizeMode="cover"
                            />
                            <View className="p-2">
                              <Text className="text-sm font-bold text-gray-800">
                                {car.title || 'Untitled'}
                              </Text>
                              <Text className="text-xs text-gray-500">
                                {car.year || 'Year N/A'}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Recommendations Section */}
                {recommendations.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-2">
                      Recommended For You
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}>
                      {recommendations.map(car => (
                        <TouchableOpacity
                          key={car._id}
                          className="mr-4"
                          onPress={() => {
                            setModalVisible(false);
                            setTimeout(() => {
                              setModalVisible(true);
                              setSelectedCar(car);
                            }, 300);
                          }}>
                          <View className="w-40 bg-gray-100 rounded-lg overflow-hidden shadow-md">
                            <Image
                              source={{
                                uri:
                                  car.images[0] ||
                                  'https://via.placeholder.com/150',
                              }}
                              className="w-full h-24"
                              resizeMode="cover"
                            />
                            <View className="p-2">
                              <Text className="text-sm font-bold text-gray-800">
                                {car.title || 'Untitled'}
                              </Text>
                              <Text className="text-xs text-gray-500">
                                {car.year || 'Year N/A'}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>

        {/* Action Button */}
        <View className="p-4 pt-1 border-t border-gray-200 bg-white">
          {/* Contact Options */}
          <Text className="text-base font-semibold text-gray-900 mb-2">Contact Options</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3 flex-row">
            {selectedCar?.user?.phoneNumber && (
              <TouchableOpacity
                className="items-center justify-center mr-4 bg-violet-50 p-3 rounded-full"
                onPress={() => {
                  const phone = selectedCar?.user.phoneNumber.replace(/[^\d+]/g, '');
                  Linking.openURL(`tel:${phone}`);
                }}
              >
                <Icon name="phone" size={20} color="green" />
                <Text className="text-xs text-green-600 mt-1">Phone</Text>
              </TouchableOpacity>
            )}
            {selectedCar?.user?.socialMedia?.map((sm, idx) => (
              <TouchableOpacity
                key={idx}
                className="items-center justify-center mr-4 bg-blue-50 p-3 rounded-full"
                onPress={async () => {
                  let url = sm.link;
                  let appUrl = url;
                  if (sm.name.toLowerCase() === 'telegram') {
                    appUrl = url.replace('https://t.me/', 'tg://resolve?domain=');
                  } else if (sm.name.toLowerCase() === 'instagram') {
                    appUrl = url.replace('https://instagram.com/', 'instagram://user?username=');
                  } else if (sm.name.toLowerCase() === 'tiktok') {
                    appUrl = url.replace('https://www.tiktok.com/@', 'snssdk1128://user/profile/');
                  } else if (sm.name.toLowerCase() === 'facebook') {
                    appUrl = url.replace('https://facebook.com/', 'fb://facewebmodal/f?href=https://facebook.com/');
                  } else if (sm.name.toLowerCase() === 'twitter') {
                    appUrl = url.replace('https://twitter.com/', 'twitter://user?screen_name=');
                  } else if (sm.name.toLowerCase() === 'linkedin') {
                    appUrl = url.replace('https://www.linkedin.com/in/', 'linkedin://in/');
                  }
                  try {
                    const supported = await Linking.canOpenURL(appUrl);
                    if (supported) {
                      await Linking.openURL(appUrl);
                    } else {
                      await Linking.openURL(url);
                    }
                  } catch {
                    await Linking.openURL(url);
                  }
                }}
              >
                <Icon name={
                  sm.name.toLowerCase() === 'telegram' ? 'send' :
                  sm.name.toLowerCase() === 'instagram' ? 'camera-alt' :
                  sm.name.toLowerCase() === 'tiktok' ? 'music-note' :
                  sm.name.toLowerCase() === 'facebook' ? 'facebook' :
                  sm.name.toLowerCase() === 'twitter' ? 'twitter' :
                  sm.name.toLowerCase() === 'linkedin' ? 'linkedin' :
                  'web'
                } size={20} color="#2563eb" />
                <Text className="text-xs text-blue-700 mt-1">{sm.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            className="bg-violet-600 py-2 rounded-lg items-center flex-row justify-center"
            onPress={async () => {
              console.log("Seller Id ",sellerId)
             navigation.navigate('Messages', { sellerId });
            }}
            activeOpacity={0.8}>
            <Icon name="chat" size={15} color="white" />
            <Text className="text-white bg-violet-600 font-medium ml-2 text-xs">
              Message Seller Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
