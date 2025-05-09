import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { useAuthUserContext } from '../../contexts/AuthUserContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';

export function PostList() {
  const { authUser } = useAuthUserContext();
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([null, null, null, null, null, null]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/car/user/${authUser._id}`);
        setCars(response.data);
      } catch (error) {
        console.error('Error fetching cars:', error);
      }
    };

    fetchCars();
  }, [authUser._id]);

  const handleImageSelection = async (index) => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || !response.assets) return;

      const updatedImages = [...selectedImages];
      updatedImages[index] = response.assets[0].uri;
      setSelectedImages(updatedImages);
    });
  };

  const handleDeleteCar = async (carId) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:4000/api/car/${carId}`);
      Alert.alert('Success', 'Car deleted successfully!');
      setCars((prevCars) => prevCars.filter((car) => car._id !== carId));
      setModalVisible(false);
    } catch (error) {
      console.error('Error deleting car:', error);
      Alert.alert('Error', 'Failed to delete car.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCar = async () => {
    if (!selectedCar) return;

    setLoading(true);
    try {
      const uploadedImageUrls = [];

      for (const uri of selectedImages) {
        if (uri && !uri.startsWith('http')) {
          const form = new FormData();
          form.append('file', {
            uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
            type: 'image/jpeg',
            name: `photo_${Date.now()}.jpg`,
          });
          form.append('upload_preset', 'ml_default');

          const res = await axios.post(
            'https://api.cloudinary.com/v1_1/dpavrc7wd/image/upload',
            form,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );

          uploadedImageUrls.push(res.data.secure_url);
        } else if (uri) {
          uploadedImageUrls.push(uri);
        }
      }

      const updatedCar = {
        ...selectedCar,
        images: uploadedImageUrls,
      };

      await axios.put(`http://localhost:4000/api/car/${selectedCar._id}`, updatedCar);
      Alert.alert('Success', 'Car updated successfully!');
      setCars((prevCars) =>
        prevCars.map((car) => (car._id === selectedCar._id ? updatedCar : car))
      );
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating car:', error);
      Alert.alert('Error', 'Failed to update car.');
    } finally {
      setLoading(false);
    }
  };

  const renderCarItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center p-5 mb-4 mx-4 bg-white rounded-xl shadow-lg"
      style={{
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 6
      }}
      onPress={() => {
        setSelectedCar(item);
        setSelectedImages(item.images.length === 6 ? item.images : [...item.images, ...Array(6 - item.images.length).fill(null)]);
        setModalVisible(true);
      }}
    >
      <Image
        source={{ uri: item.images[0] || 'https://via.placeholder.com/150' }}
        className="w-20 h-20 rounded-lg mr-4"
        resizeMode="cover"
      />
      <View className="flex-1">
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-lg font-bold text-gray-800 flex-1" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="text-base font-bold text-indigo-600">${item.price}</Text>
        </View>
        <View className="flex-row items-center">
          <Icon name="car-sport-outline" size={16} color="#6b7280" />
          <Text className="text-sm text-gray-500 ml-1">
            {item.brand} • {item.model}
          </Text>
        </View>
        <View className="flex-row items-center mt-1">
          <Icon name="calendar-outline" size={14} color="#6b7280" />
          <Text className="text-xs text-gray-400 ml-1">
            Posted: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <Icon name="chevron-forward-outline" size={20} color="#d1d5db" />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-6 pb-4 px-6 shadow-sm">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-gray-900">Your Listings</Text>
         
        <Text className="text-gray-500 mt-1">
          {cars.length} {cars.length === 1 ? 'vehicle' : 'vehicles'} listed
        </Text>
        </View>
      </View>

      {/* Main Content */}
      {cars.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-indigo-100 p-6 rounded-full mb-4">
            <Icon name="car-outline" size={40} color="#6366f1" />
          </View>
          <Text className="text-xl font-bold text-gray-800 mb-2">No listings yet</Text>
          <Text className="text-gray-500 text-center mb-6">
            You haven't posted any vehicles. Tap the button below to create your first listing.
          </Text>
          <TouchableOpacity className="bg-indigo-600 px-6 py-3 rounded-full">
            <Text className="text-white font-medium">Add New Vehicle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cars}
          keyExtractor={(item) => item._id}
          renderItem={renderCarItem}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Edit Modal */}
      {selectedCar && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 bg-white">
            {/* Modal Header */}
            <View className="bg-white pt-12 pb-4 px-6 border-b border-gray-100">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-2xl font-bold text-gray-900">Edit Listing</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icon name="close-outline" size={24} color="#9ca3af" />
                </TouchableOpacity>
              </View>
              <Text className="text-gray-500">Update your vehicle details</Text>
            </View>

            <ScrollView className="flex-1 p-6">
              {/* Form Fields */}
              {Object.keys(selectedCar).map((key) => (
                key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && key !== '__v' && key !== 'user' && key !== 'status' && (
                  <View key={key} className="mb-5">
                    <View className="flex-row items-center mb-2">
                      <Icon 
                        name={
                          key === 'title' ? 'document-text-outline' :
                          key === 'description' ? 'create-outline' :
                          key === 'location' ? 'location-outline' :
                          key === 'brand' ? 'car-sport-outline' :
                          key === 'year' ? 'calendar-outline' :
                          key === 'bodyType' ? 'car-outline' :
                          key === 'fuel' ? 'flame-outline' :
                          key === 'mileage' ? 'speedometer-outline' :
                          key === 'model' ? 'build-outline' :
                          key === 'transmission' ? 'swap-horizontal-outline' :
                          key === 'color' ? 'color-palette-outline' :
                          key === 'price' ? 'pricetag-outline' :
                          'help-circle-outline'
                        } 
                        size={18} 
                        color="#6366f1" 
                        className="mr-2" 
                      />
                      <Text className="text-base font-medium text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Text>
                    </View>
                    
                    {key === 'images' ? (
                      <View className="mb-6">
                        <View className="flex-row flex-wrap justify-between">
                          {selectedImages.map((image, index) => (
                            <TouchableOpacity
                              key={index}
                              onPress={() => handleImageSelection(index)}
                              className={`w-[30%] aspect-square mb-3 bg-gray-100 rounded-xl justify-center items-center 
                                ${image ? 'border-2 border-indigo-200' : 'border border-dashed border-gray-300'}`}
                            >
                              {image ? (
                                <Image source={{ uri: image }} className="w-full h-full rounded-xl" />
                              ) : (
                                <View className="items-center">
                                  <Icon name="camera-outline" size={20} color="#9ca3af" />
                                  <Text className="text-xs text-gray-400 mt-1">Photo {index + 1}</Text>
                                </View>
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                        <Text className="text-xs text-gray-400 mt-1">Tap to change images (max 6)</Text>
                      </View>
                    ) : (
                      <TextInput
                        className={`border rounded-lg p-4 bg-white text-gray-800 text-base
                          ${selectedCar[key] ? 'border-indigo-100' : 'border-gray-200'}`}
                        placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').trim()}`}
                        placeholderTextColor="#9ca3af"
                        value={selectedCar[key]}
                        onChangeText={(value) =>
                          setSelectedCar((prev) => ({ ...prev, [key]: value }))
                        }
                        keyboardType={key === 'price' || key === 'mileage' ? 'numeric' : 'default'}
                        multiline={key === 'description'}
                      />
                    )}
                  </View>
                )
              ))}

              {/* Action Buttons */}
              <View className="flex-row justify-between mt-6 mb-8 space-x-3">
                <TouchableOpacity
                  className="flex-1 border border-gray-300 rounded-xl py-3"
                  onPress={() => setModalVisible(false)}
                  disabled={loading}
                >
                  <Text className="text-gray-700 text-center font-medium">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-red-100 rounded-xl py-3"
                  onPress={() => handleDeleteCar(selectedCar._id)}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#ef4444" />
                  ) : (
                    <View className="flex-row items-center justify-center">
                      <Icon name="trash-outline" size={18} color="#ef4444" />
                      <Text className="text-red-600 text-center font-medium ml-2">Delete</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-indigo-600 rounded-xl py-3"
                  onPress={handleEditCar}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <View className="flex-row items-center justify-center">
                      <Icon name="save-outline" size={18} color="white" />
                      <Text className="text-white text-center font-medium ml-2">Save</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}