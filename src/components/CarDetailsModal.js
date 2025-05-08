
import React, { useState } from 'react';
import {
    Image,
    Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';


export function CarDetailsModal({modalVisible,setModalVisible,selectedCar,navigation,sellerId}){
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <Modal
    animationType="slide"
    transparent={false}
    visible={modalVisible}
    onRequestClose={() => setModalVisible(false)}>
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
              </View>

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
                      {selectedCar.user?.email || 'No contact information'}
                    </Text>
                    <Text className="font-medium text-gray-800">
                      {selectedCar.user?.phoneNumber ||
                        'No contact information'}
                      {console.log('no phone ?', selectedCar.user)}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {selectedCar.createdAt
                        ? `Member  since ${new Date(
                            selectedCar.user.createdAt,
                          ).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })}`
                        : 'Member date not available'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Action Button */}
      <View className="p-4 border-t border-gray-200 bg-white">
        <TouchableOpacity
          className="bg-violet-600 py-3 rounded-lg items-center flex-row justify-center"
          onPress={() => {
              navigation.navigate('Messages', { sellerId })}
          }
          activeOpacity={0.8}>
          <Icon name="phone" size={18} color="white" />
          <Text className="text-white bg-violet-600 font-medium ml-2">
            Contact Seller
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
  );
}






