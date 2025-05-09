import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
  FlatList,
  ActionSheetIOS,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import { useAuthUserContext } from '../../contexts/AuthUserContext';
import Icon from 'react-native-vector-icons/Ionicons';

const dropdownData = {
  brand: [
    'Audi', 'BMW', 'Chevrolet', 'Ford', 'Honda', 'Hyundai', 'Jaguar', 'Jeep',
    'Kia', 'Land Rover', 'Lexus', 'Mazda', 'Mercedes', 'Nissan', 'Porsche',
    'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
  ],
  model: [
    'A4', 'A6', 'Accord', 'Altima', 'Camry', 'C-Class', 'Civic', 'Corolla',
    'Cruze', 'CX-5', 'E-Class', 'Elantra', 'F-150', 'Golf', 'Malibu', 'Mustang',
    'Passat', 'Sentra', 'Sportage', 'Tucson', 'X3', 'X5'
  ],
  year: Array.from({ length: 30 }, (_, i) => `${2025 - i}`),
  bodyType: [
    'Convertible', 'Coupe', 'Crossover', 'Hatchback', 'Pickup', 'Sedan',
    'SUV', 'Truck', 'Van', 'Wagon'
  ],
  fuel: [
    'CNG', 'Diesel', 'Electric', 'Hybrid', 'LPG', 'Petrol'
  ],
  transmission: [
    'Automatic', 'CVT', 'Dual-Clutch', 'Manual', 'Semi-Automatic'
  ]
};

export const PostCar = () => {
  const { authUser } = useAuthUserContext();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    brand: '',
    year: '',
    bodyType: '',
    fuel: '',
    mileage: '',
    model: '',
    transmission: '',
    color: '',
    price: '',
    images: [],
  });

  const [selectedImages, setSelectedImages] = useState([null, null, null, null, null, null]);
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState({});
  const [modalVisible, setModalVisible] = useState({});
  const [currentField, setCurrentField] = useState(null);

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleImageSelection = async (index) => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.didCancel || !response.assets) return;

      const updatedImages = [...selectedImages];
      updatedImages[index] = response.assets[0].uri;
      setSelectedImages(updatedImages);
    });
  };

  const handlePostCar = async () => {
    setUploading(true);
    try {
      const uploadedImageUrls = [];

      for (const uri of selectedImages) {
        if (uri) {
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
        }
      }

      const requestBody = {
        ...formData,
        user: authUser._id,
        images: uploadedImageUrls,
      };

      await axios.post('http://localhost:4000/api/car/add', requestBody);

      Alert.alert('Success', 'Car posted successfully!');
      setFormData({
        title: '',
        description: '',
        location: '',
        brand: '',
        year: '',
        bodyType: '',
        fuel: '',
        mileage: '',
        model: '',
        transmission: '',
        color: '',
        price: '',
        images: [],
      });
      setSelectedImages([null, null, null, null, null, null]);
      setPreviewVisible(false);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to post car.');
    } finally {
      setUploading(false);
    }
  };

  const showDropdown = (field) => {
    setCurrentField(field);
    setModalVisible((prev) => ({ ...prev, [field]: true }));
  };

  const handleDropdownSelect = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setModalVisible((prev) => ({ ...prev, [field]: false }));
  };

  const inputIcons = {
    title: 'document-text-outline',
    description: 'create-outline',
    location: 'location-outline',
    brand: 'car-sport-outline',
    year: 'calendar-outline',
    bodyType: 'car-outline',
    fuel: 'flame-outline',
    mileage: 'speedometer-outline',
    model: 'build-outline',
    transmission: 'swap-horizontal-outline',
    color: 'color-palette-outline',
    price: 'pricetag-outline',
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <Text className="text-3xl font-bold mb-6 text-violet-700">Post Your Car</Text>

      {Object.keys(formData).map((key) => (
        key !== 'images' && (
          <View key={key} className="mb-6">
            <View className="flex-row items-center mb-2">
              <Icon name={inputIcons[key]} size={20} color="#7c3aed" className="mr-2" />
              <Text className="text-lg font-semibold capitalize text-violet-600">{key}</Text>
            </View>
            {dropdownData[key] ? (
              <TouchableOpacity
                className="border border-gray-300 rounded p-3 bg-white flex-row items-center justify-between"
                onPress={() => showDropdown(key)}
              >
                <Text className="text-gray-700">{formData[key] || `Select ${key}`}</Text>
                <Icon name="chevron-down-outline" size={20} color="#7c3aed" />
              </TouchableOpacity>
            ) : (
              <TextInput
                className="border border-gray-300 rounded p-3 bg-white"
                placeholder={`Enter ${key}`}
                value={formData[key]}
                onChangeText={(value) => handleInputChange(key, value)}
                keyboardType={key === 'price' || key === 'mileage' ? 'numeric' : 'default'}
              />
            )}

            {dropdownData[key] && (
              <Modal
                visible={modalVisible[key]}
                animationType="slide"
                onRequestClose={() => setModalVisible((prev) => ({ ...prev, [key]: false }))}
              >
                <View className="flex-1 bg-white p-4">
                  <Text className="text-xl font-bold mb-4 text-violet-600">Select {key}</Text>
                  <FlatList
                    data={dropdownData[key]}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        className="p-4 border-b border-gray-200"
                        onPress={() => handleDropdownSelect(key, item)}
                      >
                        <Text className="text-lg text-gray-800">{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    className="mt-4 bg-gray-500 rounded p-3"
                    onPress={() => setModalVisible((prev) => ({ ...prev, [key]: false }))}
                  >
                    <Text className="text-white text-center text-lg">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
            )}
          </View>
        )
      ))}

      <Text className="text-lg font-semibold text-violet-600 mb-2">Upload Images</Text>
      <View className="flex-row flex-wrap gap-3 mb-6">
        {selectedImages.map((image, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleImageSelection(index)}
            className="w-24 h-24 bg-gray-200 rounded-xl justify-center items-center shadow-md"
          >
            {image ? (
              <Image source={{ uri: image }} className="w-full h-full rounded-xl" />
            ) : (
              <Icon name="camera-outline" size={28} color="#888" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        className="flex-row justify-center items-center bg-violet-600 rounded-xl py-4 shadow-lg"
        onPress={() => setPreviewVisible(true)}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Icon name="eye-outline" size={20} color="white" />
            <Text className="text-white text-lg font-semibold ml-2">Preview & Post</Text>
          </>
        )}
      </TouchableOpacity>

      <Modal visible={previewVisible} animationType="slide" onRequestClose={() => setPreviewVisible(false)}>
        <ScrollView className="flex-1 bg-white p-4">
          <Text className="text-3xl font-bold mb-4 text-violet-700">Preview Details</Text>

          {Object.entries(formData).map(([key, value]) => (
            key !== 'images' && (
              <View key={key} className="mb-4">
                <Text className="text-sm text-gray-500 font-medium capitalize">{key}</Text>
                <Text className="text-gray-800 text-lg">{value}</Text>
              </View>
            )
          ))}

          <Text className="text-lg font-semibold text-violet-600 mb-2">Selected Images</Text>
          <ScrollView horizontal>
            {selectedImages.map((img, i) => (
              img && (
                <Image
                  key={i}
                  source={{ uri: img }}
                  className="w-32 h-32 rounded-lg mr-3 shadow-md"
                />
              )
            ))}
          </ScrollView>

          <View className="flex-row justify-between mt-6 space-x-2">
            <TouchableOpacity
              className="flex-1 bg-gray-500 rounded-xl py-3 shadow-md"
              onPress={() => setPreviewVisible(false)}
            >
              <Text className="text-white text-center text-lg font-semibold">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-violet-600 rounded-xl py-3 shadow-md"
              onPress={handlePostCar}
            >
              {uploading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center text-lg font-semibold">Confirm Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
};
