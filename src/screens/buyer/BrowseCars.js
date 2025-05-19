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
import {useAuthUserContext} from '../../contexts/AuthUserContext';

const {height} = Dimensions.get('window');

const dropdownData = {
  brand: [
    'Audi',
    'BMW',
    'Chevrolet',
    'Ford',
    'Honda',
    'Hyundai',
    'Jaguar',
    'Jeep',
    'Kia',
    'Land Rover',
    'Lexus',
    'Mazda',
    'Mercedes',
    'Nissan',
    'Porsche',
    'Subaru',
    'Tesla',
    'Toyota',
    'Volkswagen',
    'Volvo',
  ],
  model: [
    'A4',
    'A6',
    'Accord',
    'Altima',
    'Camry',
    'C-Class',
    'Civic',
    'Corolla',
    'Cruze',
    'CX-5',
    'E-Class',
    'Elantra',
    'F-150',
    'Golf',
    'Malibu',
    'Mustang',
    'Passat',
    'Sentra',
    'Sportage',
    'Tucson',
    'X3',
    'X5',
  ],
  year: Array.from({length: 30}, (_, i) => `${2025 - i}`),
  bodyType: [
    'Convertible',
    'Coupe',
    'Crossover',
    'Hatchback',
    'Pickup',
    'Sedan',
    'SUV',
    'Truck',
    'Van',
    'Wagon',
  ],
  fuel: ['CNG', 'Diesel', 'Electric', 'Hybrid', 'LPG', 'Petrol'],
  transmission: ['Automatic', 'CVT', 'Dual-Clutch', 'Manual', 'Semi-Automatic'],
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
  const {authUser, setAuthUser} = useAuthUserContext();

  const [filters, setFilters] = useState({
    bodyType: '',
    brand: '',
    model: '',
    priceRange: null,
    vehicleDetails: '',
    transmission: '',
    fuelType: '',
    features: [],
    safety: [],
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const carTypes = ['SUV', 'Sedan', 'Electric', 'Hatchback', 'Truck'];
  const priceRanges = [
    {label: 'Under $10K', value: '0-10000'},
    {label: '$10K-$20K', value: '10000-20000'},
    {label: '$20K-$30K', value: '20000-30000'},
    {label: '$30K-$40K', value: '30000-40000'},
    {label: 'Over $40K', value: '40000-1000000000'},
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  // Fetch initial cars on first render
  const fetchInitialCars = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/car/latestcars');
      const data = await response.json();
      setFilteredCars(data);
    } catch (error) {
      console.error('Error fetching initial cars:', error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
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

  // Reset page if filteredCars length is less than current page
  useEffect(() => {
    if ((currentPage - 1) * perPage >= filteredCars.length) {
      setCurrentPage(1);
    }
  }, [filteredCars]);

  // If search text is cleared, fetch initial cars
  useEffect(() => {
    if (query.length === 0) {
      fetchInitialCars();
    }
  }, [query]);

  const renderCarItem = ({item}) => {
    const isInWishlist = authUser?.wishList?.includes(item._id);

    const toggleWishlist = async () => {
      try {
        await axios.post(
          `http://localhost:4000/api/auth/${authUser._id}/wishlist`,
          {carId: item._id},
          {withCredentials: true},
        );

        // Update the authUser state
        setAuthUser(prevAuthUser => {
          const updatedWishList = isInWishlist
            ? prevAuthUser.wishList.filter(id => id !== item._id)
            : [...prevAuthUser.wishList, item._id];

          return {...prevAuthUser, wishList: updatedWishList};
        });
      } catch (error) {
        console.error('Error toggling wishlist:', error);
      }
    };

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedCar(item);
          setModalVisible(true);
          addToSearchHistory(item);
        }}
        className="w-[48%] bg-white p-0.5 mb-3 rounded-lg shadow-sm border border-gray-100"
        activeOpacity={0.8}>
        <View className="relative">
          <Image
            source={{uri: item.images[0]}}
            className="w-full h-32 rounded-lg mb-2"
            resizeMode="center"
          />
          {/* Top Left Heart Icon */}
          <TouchableOpacity
            className="absolute top-2 left-2 z-10 bg-white/80 rounded-full p-0.5"
            onPress={toggleWishlist}>
            <Icon
              name={isInWishlist ? 'favorite' : 'favorite-border'}
              size={20}
              color="#f00"
            />
          </TouchableOpacity>
          {/* Top Right Vehicle Details */}
          {item.vehicleDetails && (
            <View
              className={`absolute top-2 right-2 z-10  px-1 py-0.5 rounded-full ${
                item.vehicleDetails === 'New' ? 'bg-green-600' : 'bg-gray-400'
              }`}>
              <Text className="text-xs text-white font-semibold capitalize">
                {item.vehicleDetails}
              </Text>
            </View>
          )}
        </View>
        <View className=" mb-1">
          <Text
            className="font-bold w-full text-xs text-gray-800"
            numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="font-bold text-xs text-gray-800" numberOfLines={1}>
            {item.brand} {item.model}
          </Text>
        </View>
        <Text className="text-green-600 font-semibold text-xs mb-1">
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
  };

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

  // Calculate paginated data
  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );
  const totalPages = Math.ceil(filteredCars.length / perPage);

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
          className="bg-white text-black p-2 rounded-xl shadow-sm border border-gray-200 pl-12"
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
      </View>

      {/* Advanced Filters Button */}
      <TouchableOpacity
        className="flex-row items-center justify-center mb-4 bg-violet-600 py-2 rounded-xl"
        onPress={() => setShowAdvancedFilters(true)}>
        <Icon name="tune" size={20} color="white" />
        <Text className="text-white font-semibold ml-2">Advanced Filters</Text>
      </TouchableOpacity>

      {/* Advanced Filters Modal */}
      <Modal
        visible={showAdvancedFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAdvancedFilters(false)}>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-40">
          <View className="bg-white rounded-2xl p-6 w-11/12 max-w-2xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-violet-700">
                Advanced Filters
              </Text>
              <TouchableOpacity onPress={() => setShowAdvancedFilters(false)}>
                <Icon name="close" size={24} color="#7c3aed" />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={{maxHeight: height * 0.6}}
              showsVerticalScrollIndicator={false}>
              {/* Brand */}
              <Text className="mb-1 text-gray-700">Brand</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-3 flex-row">
                {dropdownData.brand.map(b => (
                  <TouchableOpacity
                    key={b}
                    className={`px-3 py-1.5 mr-2 rounded-full ${
                      filters.brand === b ? 'bg-violet-600' : 'bg-gray-100'
                    }`}
                    onPress={() =>
                      setFilters(f => ({...f, brand: f.brand === b ? '' : b}))
                    }>
                    <Text
                      className={`${
                        filters.brand === b ? 'text-white' : 'text-gray-700'
                      }`}>
                      {b}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {/* Model */}
              <Text className="mb-1 text-gray-700">Model</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-3 flex-row">
                {dropdownData.model.map(m => (
                  <TouchableOpacity
                    key={m}
                    className={`px-3 py-1.5 mr-2 rounded-full ${
                      filters.model === m ? 'bg-violet-600' : 'bg-gray-100'
                    }`}
                    onPress={() =>
                      setFilters(f => ({...f, model: f.model === m ? '' : m}))
                    }>
                    <Text
                      className={`${
                        filters.model === m ? 'text-white' : 'text-gray-700'
                      }`}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {/* Body Type */}
              <Text className="mb-1 text-gray-700">Body Type</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-3 flex-row">
                {dropdownData.bodyType.map(bt => (
                  <TouchableOpacity
                    key={bt}
                    className={`px-3 py-1.5 mr-2 rounded-full ${
                      filters.bodyType === bt ? 'bg-violet-600' : 'bg-gray-100'
                    }`}
                    onPress={() =>
                      setFilters(f => ({
                        ...f,
                        bodyType: f.bodyType === bt ? '' : bt,
                      }))
                    }>
                    <Text
                      className={`${
                        filters.bodyType === bt ? 'text-white' : 'text-gray-700'
                      }`}>
                      {bt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {/* Price Range */}
              <Text className="mb-1 text-gray-700">Price Range</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-3 flex-row">
                {[
                  {label: 'Under $10K', value: {min: 0, max: 10000}},
                  {label: '$10K-$20K', value: {min: 10000, max: 20000}},
                  {label: '$20K-$30K', value: {min: 20000, max: 30000}},
                  {label: '$30K-$40K', value: {min: 30000, max: 40000}},
                  {label: 'Over $40K', value: {min: 40000, max: 100000000}},
                ].map(range => (
                  <TouchableOpacity
                    key={range.label}
                    className={`px-3 py-1.5 mr-2 rounded-full ${
                      JSON.stringify(filters.priceRange) ===
                      JSON.stringify(range.value)
                        ? 'bg-violet-600'
                        : 'bg-gray-100'
                    }`}
                    onPress={() =>
                      setFilters(f => ({
                        ...f,
                        priceRange:
                          JSON.stringify(f.priceRange) ===
                          JSON.stringify(range.value)
                            ? null
                            : range.value,
                      }))
                    }>
                    <Text
                      className={`${
                        JSON.stringify(filters.priceRange) ===
                        JSON.stringify(range.value)
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {/* Transmission */}
              <Text className="mb-1 text-gray-700">Transmission</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-3 flex-row">
                {dropdownData.transmission.map(t => (
                  <TouchableOpacity
                    key={t}
                    className={`px-3 py-1.5 mr-2 rounded-full ${
                      filters.transmission === t
                        ? 'bg-violet-600'
                        : 'bg-gray-100'
                    }`}
                    onPress={() =>
                      setFilters(f => ({
                        ...f,
                        transmission: f.transmission === t ? '' : t,
                      }))
                    }>
                    <Text
                      className={`${
                        filters.transmission === t
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {/* Fuel Type */}
              <Text className="mb-1 text-gray-700">Fuel Type</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-3 flex-row">
                {dropdownData.fuel.map(fuel => (
                  <TouchableOpacity
                    key={fuel}
                    className={`px-3 py-1.5 mr-2 rounded-full ${
                      filters.fuelType === fuel
                        ? 'bg-violet-600'
                        : 'bg-gray-100'
                    }`}
                    onPress={() =>
                      setFilters(f => ({
                        ...f,
                        fuelType: f.fuelType === fuel ? '' : fuel,
                      }))
                    }>
                    <Text
                      className={`${
                        filters.fuelType === fuel
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}>
                      {fuel}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {/* Vehicle Details (radio) */}
              <Text className="mb-1 text-gray-700">Vehicle Details</Text>
              <View className="flex-row mb-3">
                {dropdownData.vehicleDetails.map(vd => (
                  <TouchableOpacity
                    key={vd}
                    className={`px-3 py-1.5 mr-2 rounded-full border ${
                      filters.vehicleDetails === vd
                        ? 'bg-violet-600 border-violet-600'
                        : 'bg-gray-100 border-gray-200'
                    }`}
                    onPress={() =>
                      setFilters(f => ({
                        ...f,
                        vehicleDetails: f.vehicleDetails === vd ? '' : vd,
                      }))
                    }>
                    <Text
                      className={`${
                        filters.vehicleDetails === vd
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}>
                      {vd}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* Features (multi-select) */}
              <Text className="mb-1 text-gray-700">Features</Text>
              <View className="flex-row flex-wrap mb-3">
                {dropdownData.features.map(feature => (
                  <TouchableOpacity
                    key={feature}
                    className={`px-3 py-1.5 mr-2 mb-2 rounded-full border ${
                      filters.features.includes(feature)
                        ? 'bg-violet-600 border-violet-600'
                        : 'bg-gray-100 border-gray-200'
                    }`}
                    onPress={() =>
                      setFilters(f => ({
                        ...f,
                        features: f.features.includes(feature)
                          ? f.features.filter(x => x !== feature)
                          : [...f.features, feature],
                      }))
                    }>
                    <Text
                      className={`${
                        filters.features.includes(feature)
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}>
                      {feature}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* Safety (multi-select) */}
              <Text className="mb-1 text-gray-700">Safety</Text>
              <View className="flex-row flex-wrap mb-3">
                {dropdownData.safety.map(safety => (
                  <TouchableOpacity
                    key={safety}
                    className={`px-3 py-1.5 mr-2 mb-2 rounded-full border ${
                      filters.safety.includes(safety)
                        ? 'bg-violet-600 border-violet-600'
                        : 'bg-gray-100 border-gray-200'
                    }`}
                    onPress={() =>
                      setFilters(f => ({
                        ...f,
                        safety: f.safety.includes(safety)
                          ? f.safety.filter(x => x !== safety)
                          : [...f.safety, safety],
                      }))
                    }>
                    <Text
                      className={`${
                        filters.safety.includes(safety)
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}>
                      {safety}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            {/* Buttons */}
            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                className="px-6 py-2 rounded-lg bg-gray-200"
                onPress={() => {
                  setFilters({
                    bodyType: '',
                    brand: '',
                    model: '',
                    priceRange: null,
                    vehicleDetails: '',
                    transmission: '',
                    fuelType: '',
                    features: [],
                    safety: [],
                  });
                  setQuery('');
                  fetchInitialCars();
                }}>
                <Text className="text-gray-700 font-semibold">
                  Clear Filters
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-6 py-2 rounded-lg bg-violet-600"
                onPress={async () => {
                  setShowAdvancedFilters(false);
                  setIsLoading(true);
                  try {
                    const response = await axios.post(
                      'http://localhost:4000/api/car/filter',
                      filters,
                    );
                    setFilteredCars(response.data);
                  } catch {}
                  setIsLoading(false);
                }}>
                <Text className="text-white font-semibold">Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
        data={paginatedCars}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <View className="flex-row justify-center items-center mt-2 mb-4 space-x-2">
          <TouchableOpacity
            className={`px-3 py-1 rounded-full border border-gray-300 bg-white ${
              currentPage === 1 ? 'opacity-50' : 'active:bg-violet-100'
            }`}
            disabled={currentPage === 1}
            onPress={() => setCurrentPage(p => Math.max(1, p - 1))}>
            <Icon name="chevron-left" size={20} color="#7c3aed" />
          </TouchableOpacity>
          {[...Array(totalPages)].map((_, idx) => (
            <TouchableOpacity
              key={idx}
              className={`mx-1 px-3 py-1 rounded-full border ${
                currentPage === idx + 1
                  ? 'bg-violet-600 border-violet-600'
                  : 'bg-white border-gray-300'
              }`}
              onPress={() => setCurrentPage(idx + 1)}>
              <Text
                className={`${
                  currentPage === idx + 1
                    ? 'text-white font-bold'
                    : 'text-gray-700'
                }`}>
                {idx + 1}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            className={`px-3 py-1 rounded-full border border-gray-300 bg-white ${
              currentPage === totalPages ? 'opacity-50' : 'active:bg-violet-100'
            }`}
            disabled={currentPage === totalPages}
            onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
            <Icon name="chevron-right" size={20} color="#7c3aed" />
          </TouchableOpacity>
        </View>
      )}

      {/* Full-screen Car Detail Modal */}
      <CarDetailsModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        selectedCar={selectedCar}
        setSelectedCar={setSelectedCar}
        navigation={navigation}
        sellerId={selectedCar?.user?._id}
      />
    </View>
  );
};
