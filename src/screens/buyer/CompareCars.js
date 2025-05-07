import React, {useState} from 'react';
import {
  View,
  TextInput,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import {Image} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // or use MaterialIcons/Ionicons

export const CompareCars = () => {
  const [query1, setQuery1] = useState('');
  const [query2, setQuery2] = useState('');
  const [results1, setResults1] = useState([]);
  const [results2, setResults2] = useState([]);
  const [car1, setCar1] = useState(null);
  const [car2, setCar2] = useState(null);

  const searchCar = async (query, setter) => {
    try {
      const res = await axios.get(
        `http://localhost:4000/api/car/search/${query}`,
      );
      console.log('compare cars', res.data);
      setter(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const renderCarCard = car => {
    if (!car)
      return (
        <View className="bg-gray-200 rounded-2xl h-56 justify-center items-center">
          <Text className="text-gray-700">
            Search and Select a car to view its details
          </Text>
        </View>
      );
    return (
      <ScrollView horizontal className="flex-row gap-4 px-2 py-2">
        <View className="bg-white rounded-2xl shadow  flex-row overflow-scroll">
          {/* 1. Images + Title */}

          {car.images.map((url, idx) => {
            return (
              <View className="flex-col" key={idx}>
                <Image
                  key={idx}
                  source={{uri: url}}
                  className="w-96 h-44 rounded-lg mr-2"
                  resizeMode="contain"
                />
                {idx === 0 && (
                  <Text className="text-center text-lg font-bold">
                    {car.title}
                  </Text>
                )}
              </View>
            );
          })}

          {/* 2. Description + Location */}
          <View className="p-4 w-[300px] justify-center">
            <View className="mb-3">
              <Text className="text-gray-600 font-semibold mb-1">
                Description
              </Text>
              <Text className="text-xs text-gray-500">{car.description}</Text>
            </View>
            <View className="flex-row items-center mt-3">
              <Icon name="map" size={16} color="#6B7280" />
              <Text className="ml-1 text-xs text-gray-600">{car.location}</Text>
            </View>
          </View>

          {/* 3. Specs */}
          <View className="py-4 px-10 w-[300px] justify-center space-y-2">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center ">
                <Icon name="invert-colors" size={16} color="#4B5563" />
                <Text className="ml-2 text-gray-600"> Color : </Text>
              </View>
              <Text className="ml-2 text-gray-600 "> {car.color}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center ">
                <Icon name="gas-station" size={16} color="#4B5563" />
                <Text className="ml-2 text-gray-600"> Fuel : </Text>
              </View>
              <Text className="ml-2 text-gray-600"> {car.fuel}</Text>
            </View>
            <View className="flex-row items-center  justify-between">
              <View className="flex-row items-center ">
                <Icon name="trending-up" size={16} color="#4B5563" />
                <Text className="ml-2 text-gray-600"> Mileage : </Text>
              </View>
              <Text className="ml-2 text-gray-600"> {car.mileage}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center ">
                <Icon name="car-settings" size={16} color="#4B5563" />
                <Text className="ml-2 text-gray-600"> Transmission : </Text>
              </View>
              <Text className="ml-2 text-gray-600"> {car.transmission}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center ">
                <Icon name="tag" size={16} color="#111827" />
                <Text className="ml-2 text-gray-900 font-semibold">
                  {' '}
                  Price :{' '}
                </Text>
              </View>
              <Text className="ml-2 text-gray-900 font-semibold">
                {' '}
                ${car.price}
              </Text>
            </View>
          </View>

          {/* 4. Seller Info + Contact */}
          <View className="p-4 w-[300px] justify-between">
            <View>
              <View className="flex-row items-center mb-2">
                <Icon name="account-settings" size={16} color="#374151" />
                <Text className="ml-2 text-gray-700">
                  Seller: {car.user.username}
                </Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Icon name="cellphone" size={16} color="#374151" />
                <Text className="ml-2 text-gray-700">
                  Contact : {car.user.phoneNumber}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Icon name="calendar" size={16} color="#6B7280" />
                <Text className="ml-2 text-gray-500">
                  Member since :{' '}
                  {new Date(car.user.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>

            <TouchableOpacity className="bg-violet-600  rounded-xl pt-1 pb-2 flex-row justify-center items-center gap-2">
              <Icon name="message" size={12} color="#fff" />
              <Text className="text-white text-center font-semibold">
                Contact Seller
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <View className="flex-1 p-4 pt-2 bg-gray-50">
      <View className="mb-0">
        <Text className="text-lg font-bold text-gray-900 mb-1">
          Find And Compare Your Perfect Car
        </Text>
      </View>

      {/* First Car Search */}
      <Text className="font-semibold mb-2">Search Car 1</Text>
      <TextInput
        value={query1}
        onChangeText={text => {
          setQuery1(text);
          searchCar(text, setResults1);
        }}
        placeholder="Search by title..."
        className="border border-gray-700 rounded-xl px-4 py-2 mb-2 bg-white"
      />
      {results1.length > 0 && (
        <View className="mb-4 bg-white rounded-xl">
          {results1.map(item => (
            <TouchableOpacity
              key={item._id}
              onPress={() => {
                setCar1(item);
                setQuery1(item.title);
                setResults1([]);
              }}
              className="px-4 py-2 border-b border-gray-200">
              <Text className="font-bold text-sm">
                {item.title}
                <Text className="text-gray-500 text-xs font-normal">
                  {' '}
                  ({item.bodyType} || {item.model})
                </Text>{' '}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {renderCarCard(car1)}

      {/* Second Car Search */}
      <Text className="font-semibold mt-3 mb-2">Search Car 2</Text>
      <TextInput
        value={query2}
        onChangeText={text => {
          setQuery2(text);
          searchCar(text, setResults2);
        }}
        placeholder="Search by title..."
        className="border border-gray-700 rounded-xl px-4 py-2 mb-2 bg-white"
      />
      {results2.length > 0 && (
        <View className="mb-4 bg-white rounded-xl">
          {results2.map(item => (
            <TouchableOpacity
              key={item._id}
              onPress={() => {
                setCar2(item);
                setQuery2(item.title);
                setResults2([]);
              }}
              className="px-4 py-2 border-b border-gray-200">
              <Text className="font-bold text-sm">
                {item.title}
                <Text className="text-gray-500 text-xs font-normal">
                  {' '}
                  ({item.bodyType} || {item.model})
                </Text>{' '}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {renderCarCard(car2)}
    </View>
  );
};
