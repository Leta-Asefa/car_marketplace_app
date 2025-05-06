import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  Image,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const {height} = Dimensions.get('window');

export const BrowseCars = () => {
  const [query, setQuery] = useState('');
  const [filteredCars, setFilteredCars] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showTypeFilters, setShowTypeFilters] = useState(false);
  const [showPriceFilters, setShowPriceFilters] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const carTypes = ['SUV', 'Sedan', 'Electric', 'Hatchback', 'Truck'];
  const priceRanges = [
    {label: 'Under $10K', value: '0-10000'},
    {label: '$10K-$20K', value: '10000-20000'},
    {label: '$20K-$30K', value: '20000-30000'},
    {label: '$30K-$40K', value: '30000-40000'},
    {label: 'Over $40K', value: '40000+'},
  ];

  // Fetch initial cars on first render
  useEffect(() => {
    const fetchInitialCars = async () => {
      try {
        const response = await fetch(
          'http://localhost:4000/api/car/latestcars',
        );
        const data = await response.json();
        setFilteredCars(data);
      } catch (error) {
        console.error('Error fetching initial cars:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialCars();
  }, []);

  // Search functionality
  useEffect(() => {
    if (query.length > 2) {
      const debounceTimer = setTimeout(() => {
        fetch(`http://localhost:4000/api/car/search/${query}`)
          .then(response => response.json())
          .then(data => setFilteredCars(data))
          .catch(error => console.error('Error fetching cars:', error));
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [query]);

  const renderCarItem = ({item}) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedCar(item);
        setModalVisible(true);
      }}
      className="w-[48%] bg-white p-0.5 mb-3 rounded-lg shadow-sm border border-gray-100"
      activeOpacity={0.8}>
      <Image
        source={{uri: item.images[0]}}
        className="w-full h-32 rounded-lg mb-2"
        resizeMode="center"
      />
      <View className="flex-row justify-between items-center mb-1">
        <Text className="font-bold text-sm text-gray-800" numberOfLines={1}>
          {item.brand} {item.model}
        </Text>
      </View>
      <Text className="text-green-600 font-semibold text-sm mb-1">
        ${item.price}
      </Text>
      <View className="flex-row items-center">
        <Text className="text-xs text-gray-500 mr-1">{item.year}</Text>
        <Text className="text-xs text-gray-500"> • </Text>
        <Text className="text-xs text-gray-500">{item.mileage} mi</Text>
      </View>
      <View className="flex-row items-center mt-1">
        <Icon name="location-on" size={12} color="#6B7280" />
        <Text className="text-xs text-gray-500 ml-1" numberOfLines={1}>
          {item.location}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-700">Loading cars...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 p-3">
      {/* Search Header */}
      <View className="mb-4">
        <Text className="text-2xl font-bold text-gray-900 mb-1">
          Find Your Perfect Car
        </Text>
        <Text className="text-sm text-gray-500">
          Search our premium inventory
        </Text>
      </View>

      {/* Search Bar */}
      <View className="relative mb-3">
        <TextInput
          className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 pl-12"
          placeholder="Search by make, model, or feature..."
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
        />
        <Icon
          name="search"
          size={20}
          color="#9CA3AF"
          className="absolute left-3 top-3"
        />
        <TouchableOpacity
          className="absolute right-3 top-3"
          onPress={() => setShowFilters(!showFilters)}>
          <Icon
            name={showFilters ? 'filter-list-off' : 'filter-list'}
            size={20}
            color="#3b82f6"
          />
        </TouchableOpacity>
      </View>

      {/* Filter Section */}
      {showFilters && (
        <View className="mb-4 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
          <TouchableOpacity
            className="flex-row justify-between items-center mb-2"
            onPress={() => setShowTypeFilters(!showTypeFilters)}>
            <Text className="text-sm font-medium text-gray-700">
              Vehicle Type
            </Text>
            <Icon
              name={
                showTypeFilters ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
              }
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {showTypeFilters && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3">
              {carTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  onPress={() =>
                    setSelectedType(type === selectedType ? null : type)
                  }
                  className={`px-3 py-1.5 mr-2 rounded-full ${
                    selectedType === type ? 'bg-blue-600' : 'bg-gray-100'
                  }`}
                  activeOpacity={0.7}>
                  <Text
                    className={`text-xs ${
                      selectedType === type ? 'text-white' : 'text-gray-700'
                    }`}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity
            className="flex-row justify-between items-center mb-2"
            onPress={() => setShowPriceFilters(!showPriceFilters)}>
            <Text className="text-sm font-medium text-gray-700">
              Price Range
            </Text>
            <Icon
              name={
                showPriceFilters ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
              }
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {showPriceFilters && (
            <View className="flex-row flex-wrap">
              {priceRanges.map(range => (
                <TouchableOpacity
                  key={range.value}
                  onPress={() =>
                    setSelectedPrice(
                      range.value === selectedPrice ? null : range.value,
                    )
                  }
                  className={`px-3 py-1.5 mr-2 mb-2 rounded-lg ${
                    selectedPrice === range.value
                      ? 'bg-blue-600'
                      : 'bg-gray-100'
                  }`}
                  activeOpacity={0.7}>
                  <Text
                    className={`text-xs ${
                      selectedPrice === range.value
                        ? 'text-white'
                        : 'text-gray-700'
                    }`}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Results Count */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-sm font-medium text-gray-700">
          {filteredCars.length}{' '}
          {filteredCars.length === 1 ? 'Result' : 'Results'}
        </Text>
        <TouchableOpacity className="flex-row items-center">
          <Text className="text-sm text-blue-600 mr-1">Sort By</Text>
          <Icon name="sort" size={16} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Car List in 2-column grid */}
      <FlatList
        data={filteredCars}
        renderItem={renderCarItem}
        keyExtractor={item => item._id}
        numColumns={2}
        columnWrapperStyle={{justifyContent: 'space-between'}}
        contentContainerStyle={{paddingBottom: 20}}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-10 w-full">
            <Icon name="search-off" size={40} color="#9CA3AF" />
            <Text className="text-gray-500 mt-2">
              No cars found. Try a different search.
            </Text>
          </View>
        }
      />

      {/* Full-screen Car Detail Modal */}
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
              <Icon name="arrow-back" size={24} color="#3b82f6" />
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
            const slide = Math.round(nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width);
            setCurrentIndex(slide);
          }}
          scrollEventThrottle={16}
        >
          {selectedCar.images?.filter(img => img).length > 0 ? (
            selectedCar.images
              .filter(img => img)
              .map((image, index) => (
                <View
                  key={index}
                  className="w-screen flex justify-center items-center"
                >
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
            {selectedCar.images.filter(img => img).map((_, index) => (
              <View 
                key={index} 
                className={`h-2 w-2 mx-1 rounded-full ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-400'
                }`}
              />
            ))}
          </View>
        )}
        
        {/* Image Counter */}
        {selectedCar.images?.filter(img => img).length > 0 && (
          <View className="absolute top-2 right-2 bg-black bg-opacity-50 px-2 py-1 rounded-full">
            <Text className="text-white text-xs">
              {currentIndex + 1}/{selectedCar.images.filter(img => img).length}
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
                        
                        {selectedCar.status === 'approved'
                            ? <Icon name="verified" size={16} color="#0a0" />
                            : <Icon name="close" size={16} color="#a00" />}
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
                        <Text className="text-sm text-gray-500">
                          {selectedCar.createdAt
                            ? `Member since ${new Date(
                                selectedCar.createdAt,
                              ).getFullYear()}`
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
              className="bg-blue-600 py-3 rounded-lg items-center flex-row justify-center"
              onPress={() => console.log('Contact dealer')}
              activeOpacity={0.8}>
              <Icon name="phone" size={18} color="white" />
              <Text className="text-white font-medium ml-2">
                Contact Seller
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
