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
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {CarDetailsModal} from '../../components/CarDetailsModal';
import { useAuthUserContext } from '../../contexts/AuthUserContext';

const {height} = Dimensions.get('window');

export const BrowseCars = () => {
  const navigation = useNavigation();
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
  const [sortBy, setSortBy] = useState(null); // 'price-asc', 'price-desc', 'year-asc', 'year-desc'
  const [showSortOptions, setShowSortOptions] = useState(false);
  const {authUser}=useAuthUserContext()

  const carTypes = ['SUV', 'Sedan', 'Electric', 'Hatchback', 'Truck'];
  const priceRanges = [
    {label: 'Under $10K', value: '0-10000'},
    {label: '$10K-$20K', value: '10000-20000'},
    {label: '$20K-$30K', value: '20000-30000'},
    {label: '$30K-$40K', value: '30000-40000'},
    {label: 'Over $40K', value: '40000-1000000000'},
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
      const debounceTimer = setTimeout(async () => {
        try {
          const response = await axios.get(
            `http://localhost:4000/api/car/search/${query}`,
          );
          console.log('searched ', response.data);
          setFilteredCars(response.data);
        } catch (error) {
          console.log('car search bar ', error);
        }
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [query]);

  const renderCarItem = ({item}) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedCar(item);
        setModalVisible(true);
        addToSearchHistory(item);
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

  const addToSearchHistory = async item => {
    try {
      const res = await axios.post(
        `http://localhost:4000/api/auth/${authUser._id}/search_history`,
        {
          brand: item.brand,
          model: item.model,
          location: item.location,
          year: item.year,
          ownerId: item.user._id,
          carId: item._id,
        },
        {withCredentials: true},
      );
    } catch (error) {
      console.log('adding search history ', error);
    }
  };

  const applyFilters = async () => {
    try {
      setIsLoading(true);

      // Construct price range if selected
      let priceRange = null;
      if (selectedPrice) {
        const [min, max] = selectedPrice.includes('+')
          ? [parseInt(selectedPrice.replace('+', '')), 999999]
          : selectedPrice.split('-').map(Number);
        priceRange = {min, max};
      }

      const response = await axios.post(
        'http://localhost:4000/api/car/filter',
        {
          bodyType: selectedType,
          priceRange: priceRange,
        },
      );
      console.log('filtered range  cars:', response.data);

      setFilteredCars(response.data);
    } catch (error) {
      console.error('Filter error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sortCars = type => {
    let sortedCars = [...filteredCars];

    switch (type) {
      case 'price-asc':
        sortedCars.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-desc':
        sortedCars.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'year-asc':
        sortedCars.sort((a, b) => Number(a.year) - Number(b.year));
        break;
      case 'year-desc':
        sortedCars.sort((a, b) => Number(b.year) - Number(a.year));
        break;
      default:
        // Default sorting (no change)
        break;
    }

    setFilteredCars(sortedCars);
    setSortBy(type);
  };

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
          className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 pl-12"
          placeholder="Search by make, model, or feature..."
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
        />
        <Icon
          name="search"
          size={20}
          color="#9CA3AF"
          style={{position: 'absolute', left: 12, top: 9}}
        />
        <TouchableOpacity
          className="absolute right-3 top-3"
          onPress={() => setShowFilters(!showFilters)}>
          <Icon
            name={showFilters ? 'filter-list-off' : 'filter-list'}
            size={20}
            color="#7c3aed"
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
                    selectedType === type ? 'bg-violet-600' : 'bg-gray-100'
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
                      ? 'bg-violet-600'
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

          {(showPriceFilters || showTypeFilters) && (
            <TouchableOpacity
              className="bg-violet-600 py-2 px-4 rounded-lg items-center mt-2"
              onPress={applyFilters}
              disabled={isLoading}>
              <Text className="text-white font-medium">
                {isLoading ? 'Applying...' : 'Apply Filters'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Results Count */}
      {/* Results Count and Sort Dropdown */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-sm font-medium text-gray-700">
          {filteredCars?.length}{' '}
          {filteredCars?.length === 1 ? 'Result' : 'Results'}
        </Text>

        <View className="relative">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setShowSortOptions(!showSortOptions)}>
            <Text className="text-sm text-violet-600 mr-1">Sort By</Text>
            <Icon
              name={showSortOptions ? 'arrow-drop-up' : 'arrow-drop-down'}
              size={20}
              color="#7c3aed"
            />
          </TouchableOpacity>

          {showSortOptions && (
            <View className="absolute right-0 top-6 bg-white shadow-md rounded-lg p-2 z-10 w-40">
              <TouchableOpacity
                className="py-2 px-3"
                onPress={() => {
                  sortCars('price-asc');
                  setShowSortOptions(false);
                }}>
                <Text
                  className={`${
                    sortBy === 'price-asc' ? 'text-violet-600' : 'text-gray-700'
                  }`}>
                  Price: Low to High
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="py-2 px-3"
                onPress={() => {
                  sortCars('price-desc');
                  setShowSortOptions(false);
                }}>
                <Text
                  className={`${
                    sortBy === 'price-desc'
                      ? 'text-violet-600'
                      : 'text-gray-700'
                  }`}>
                  Price: High to Low
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="py-2 px-3"
                onPress={() => {
                  sortCars('year-asc');
                  setShowSortOptions(false);
                }}>
                <Text
                  className={`${
                    sortBy === 'year-asc' ? 'text-violet-600' : 'text-gray-700'
                  }`}>
                  Year: Oldest
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="py-2 px-3"
                onPress={() => {
                  sortCars('year-desc');
                  setShowSortOptions(false);
                }}>
                <Text
                  className={`${
                    sortBy === 'year-desc' ? 'text-violet-600' : 'text-gray-700'
                  }`}>
                  Year: Newest
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
      <CarDetailsModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        selectedCar={selectedCar}
        navigation={navigation}
        sellerId={selectedCar?.user?._id}
      />
    </View>
  );
};
