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
    'Automatic', 'CVT', 'Dual-Clutch', 'Manual', 'Semi-Automatic',
  ],
  vehicleDetails: ['New', 'Used', 'Certified Pre-Owned'],
  features: [
    'Air Conditioning',
    'Bluetooth',
    'Navigation',
    'Leather Seats',
    'Sunroof',
    'Backup Camera',
    'Heated Seats',
    'Apple CarPlay',
    'Android Auto',
    'Lane Departure Warning',
  ],
  safety: [
    'ABS',
    'Airbags',
    'Stability Control',
    'Blind Spot Monitor',
    'Forward Collision Warning',
    'Parking Sensors',
  ],
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
    vehicleDetails: '',
    features: [],
    safety: [],
  });

  const handleMultiSelect = (field, value) => {
    setFormData((prev) => {
      const updatedArray = prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value];
      return { ...prev, [field]: updatedArray };
    });
  };

  const [selectedImages, setSelectedImages] = useState([null, null, null, null, null, null]);
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState({});
  const [modalVisible, setModalVisible] = useState(() => {
    const initialState = {};
    Object.keys(dropdownData).forEach((key) => {
      initialState[key] = false;
    });
    return initialState;
  });
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
        vehicleDetails: '',
        features: [],
        safety: [],
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

  const renderDropdown = (key) => (
    <TouchableOpacity
      className={`border rounded-lg p-4 bg-white flex-row items-center justify-between 
        ${formData[key] ? 'border-indigo-100' : 'border-gray-200'}`}
      onPress={() => showDropdown(key)}
    >
      <Text className={`text-base ${formData[key] ? 'text-gray-800' : 'text-gray-400'}`}>
        {Array.isArray(formData[key])
          ? formData[key].length > 0
            ? formData[key].join(', ')
            : `Select ${key}`
          : formData[key] || `Select ${key}`}
      </Text>
      <Icon name="chevron-down-outline" size={18} color="#9ca3af" />
    </TouchableOpacity>
  );

  const renderModal = (key) => (
    <Modal
      visible={modalVisible[key]}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible((prev) => ({ ...prev, [key]: false }))}
    >
      <View className="flex-1 justify-end bg-black bg-opacity-50">
        <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900">Select {key}</Text>
            <TouchableOpacity onPress={() => setModalVisible((prev) => ({ ...prev, [key]: false }))}>
              <Icon name="close-outline" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={dropdownData[key]}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="py-3 border-b border-gray-100"
                onPress={() =>
                  Array.isArray(formData[key])
                    ? handleMultiSelect(key, item)
                    : handleDropdownSelect(key, item)
                }
              >
                <Text
                  className={`text-base ${
                    Array.isArray(formData[key]) && formData[key].includes(item)
                      ? 'text-indigo-600 font-bold'
                      : 'text-gray-800'
                  }`}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View className="h-px bg-gray-100" />}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50 p-6">
      {/* Header Section */}
      <View className="mb-8">
        <Text className="text-3xl font-bold text-gray-900 mb-2">List Your Vehicle</Text>
        <Text className="text-gray-500">Fill in the details to showcase your car to potential buyers</Text>
        <View className="h-1 bg-indigo-100 w-20 mt-2 rounded-full" />
      </View>

      {/* Form Fields */}
      {Object.keys(formData).map((key) => (
        key !== 'images' && (
          <View key={key} className="mb-5">
            <View className="flex-row items-center mb-2">
              <Icon 
                name={inputIcons[key]} 
                size={20} 
                color="#6366f1" 
                className="mr-2" 
              />
              <Text className="text-base font-medium text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </Text>
            </View>
            {dropdownData[key] ? renderDropdown(key) : (
              <TextInput
                className={`border rounded-lg p-4 bg-white text-gray-800 text-base
                  ${formData[key] ? 'border-indigo-100' : 'border-gray-200'}`}
                placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').trim()}`}
                placeholderTextColor="#9ca3af"
                value={formData[key]}
                onChangeText={(value) => handleInputChange(key, value)}
                keyboardType={key === 'price' || key === 'mileage' ? 'numeric' : 'default'}
              />
            )}
            {dropdownData[key] && renderModal(key)}
          </View>
        )
      ))}

      {/* Image Upload Section */}
      <View className="mb-6">
        <View className="flex-row items-center mb-3">
          <Icon name="images-outline" size={20} color="#6366f1" className="mr-2" />
          <Text className="text-base font-medium text-gray-700">Upload Images</Text>
        </View>
        <Text className="text-sm text-gray-500 mb-4">Upload up to 6 photos (first image will be featured)</Text>
        
        <View className="flex-row flex-wrap justify-between">
          {selectedImages.map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleImageSelection(index)}
              className={`w-[30%] aspect-square mb-4 bg-gray-100 rounded-xl justify-center items-center 
                ${image ? 'border-2 border-indigo-200' : 'border border-dashed border-gray-300'}`}
            >
              {image ? (
                <Image source={{ uri: image }} className="w-full h-full rounded-xl" />
              ) : (
                <View className="items-center">
                  <Icon name="camera-outline" size={24} color="#9ca3af" />
                  <Text className="text-xs text-gray-400 mt-1">Photo {index + 1}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Preview Button */}
      <TouchableOpacity
        className={`flex-row justify-center items-center rounded-xl py-4 mb-6
          ${uploading ? 'bg-indigo-300' : 'bg-indigo-600'}`}
        onPress={() => setPreviewVisible(true)}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Icon name="eye-outline" size={20} color="white" />
            <Text className="text-white text-lg font-semibold ml-2">Preview Listing</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Preview Modal */}
      <Modal visible={previewVisible} animationType="slide" onRequestClose={() => setPreviewVisible(false)}>
        <View className="flex-1 bg-white">
          <ScrollView className="p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-gray-900">Listing Preview</Text>
              <TouchableOpacity onPress={() => setPreviewVisible(false)}>
                <Icon name="close-outline" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View className="mb-8">
              <Text className="text-xl font-bold text-gray-900 mb-2">{formData.title || 'Untitled Listing'}</Text>
              <Text className="text-indigo-600 font-medium">${formData.price || '0'}</Text>
            </View>

            {/* Image Gallery */}
            {selectedImages.filter(img => img).length > 0 && (
              <View className="mb-8">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-4">
                  {selectedImages.map((img, i) => (
                    img && (
                      <Image
                        key={i}
                        source={{ uri: img }}
                        className="w-64 h-48 rounded-lg mr-3"
                      />
                    )
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Details Section */}
            <View className="mb-8">
              <Text className="text-lg font-bold text-gray-900 mb-4">Details</Text>
              <View className="bg-gray-50 rounded-xl p-4">
                {Object.entries(formData).map(([key, value]) => (
                  key !== 'images' && key !== 'title' && key !== 'description' && value && (
                    <View key={key} className="flex-row justify-between py-2 border-b border-gray-100 last:border-0">
                      <Text className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Text>
                      <Text className="text-gray-900 font-medium">{value}</Text>
                    </View>
                  )
                ))}
              </View>
            </View>

            {/* Description */}
            {formData.description && (
              <View className="mb-8">
                <Text className="text-lg font-bold text-gray-900 mb-4">Description</Text>
                <Text className="text-gray-700">{formData.description}</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row justify-between space-x-4 mt-6">
              <TouchableOpacity
                className="flex-1 border border-gray-300 rounded-xl py-3"
                onPress={() => setPreviewVisible(false)}
              >
                <Text className="text-gray-700 text-center font-medium">Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-indigo-600 rounded-xl py-3"
                onPress={handlePostCar}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-medium">Confirm Post</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};