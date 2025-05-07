import React, { useState } from "react";
import { View, Text, FlatList, Pressable, Modal, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useAuthUserContext } from "../../contexts/AuthUserContext";

export const History = () => {
  const { authUser } = useAuthUserContext();
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => openModal(item)}
      className="bg-white p-4 rounded-xl mb-3 shadow-sm flex-row justify-between items-center"
    >
      <View>
        <Text className="text-base font-semibold">{item.brand} - {item.model}</Text>
        <Text className="text-sm text-gray-500">{item.location.split(",")[0]}</Text>
        <Text className="text-xs text-gray-400">Year: {item.year}</Text>
      </View>
      <Icon name="eye-outline" size={20} color="#6B7280" />
    </Pressable>
  );

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <Text className="text-xl font-bold mb-4">Search History</Text>

      <FlatList
        data={authUser?.searchHistory || []}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center px-4">
          <View className="bg-white w-full rounded-xl p-6 max-h-[80%]">
            <ScrollView>
              <Text className="text-lg font-bold mb-2">Search Details</Text>
              {selectedItem && (
                <>
                  <Text className="mb-1"><Text className="font-semibold">Brand:</Text> {selectedItem.brand}</Text>
                  <Text className="mb-1"><Text className="font-semibold">Model:</Text> {selectedItem.model}</Text>
                  <Text className="mb-1"><Text className="font-semibold">Year:</Text> {selectedItem.year}</Text>
                  <Text className="mb-1"><Text className="font-semibold">Location:</Text> {selectedItem.location}</Text>
                  <Text className="mb-1"><Text className="font-semibold">Car ID:</Text> {selectedItem.carId}</Text>
                  <Text className="mb-1"><Text className="font-semibold">Owner ID:</Text> {selectedItem.ownerId}</Text>
                  <Text className="mb-1"><Text className="font-semibold">Date:</Text> {new Date(selectedItem.date).toLocaleString()}</Text>
                </>
              )}
            </ScrollView>

            <Pressable
              onPress={closeModal}
              className="mt-4 self-end px-4 py-2 bg-blue-600 rounded-full"
            >
              <Text className="text-white font-semibold">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

