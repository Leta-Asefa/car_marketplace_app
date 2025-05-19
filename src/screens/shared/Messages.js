import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
  Image,
  Platform,
  ActivityIndicator,
  Clipboard,
  Alert,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import ImageViewing from 'react-native-image-viewing';
import {useAuthUserContext} from '../../contexts/AuthUserContext';
import {useSocketContext} from '../../contexts/SocketContext';
import {useRoute} from '@react-navigation/native';

export const Messages = () => {
  const route = useRoute();
  const sellerId = route.params?.sellerId;
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [visible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const {authUser: user} = useAuthUserContext();
  const socket = useSocketContext();
  const flatListRef = useRef(null);
  console.log('socket ', socket);
  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/chat/get_conversations/${user._id}`,
        );
        setConversations(res.data);
      } catch (err) {
        console.error('Error loading conversations', err);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    const handleConversation = async () => {
      if (!sellerId || conversations.length === 0) return;
  
      const existingConversation = conversations.find(conv =>
        conv.participants.some(participant => participant._id === sellerId),
      );
  
      // If the selected conversation is not the one with sellerId, update it
      if (
        !selected ||
        !selected.participants.some(p => p._id === sellerId)
      ) {
        if (existingConversation) {
          setSelected(existingConversation);
        } else {
          try {
            await axios.get(
              `http://localhost:4000/api/chat/create_conversations/${user._id}/${sellerId}`,
            );
            const res = await axios.get(
              `http://localhost:4000/api/chat/get_conversations/${user._id}`,
            );
            setConversations(res.data);
  
            const newConv = res.data.find(conv =>
              conv.participants.some(p => p._id === sellerId),
            );
            if (newConv) setSelected(newConv);
          } catch (err) {
            console.error('Error creating or fetching conversation', err);
          }
        }
      }
    };
  
    handleConversation();
  }, [sellerId, conversations, selected]);
  
  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (newMessage) => {
        if (newMessage.receiverId === user._id) {
          console.log('New message received', newMessage);

          setConversations((prevConversations) => {
            const conversationExists = prevConversations.some(
              (conv) => conv._id === newMessage.conversation._id
            );

            if (conversationExists) {
              // Update the messages of the existing conversation
              return prevConversations.map((conv) => {
                if (conv._id === newMessage.conversation._id) {
                  return {
                    ...conv,
                    messages: [...conv.messages, newMessage],
                  };
                }
                return conv;
              });
            } else {
              // Add the new conversation
              return [...prevConversations, newMessage.conversation];
            }
          });

          // Update the selected conversation if it matches the new message's conversation
          setSelected((prevSelected) => {
            if (prevSelected && prevSelected._id === newMessage.conversation._id) {
              return {
                ...prevSelected,
                messages: [...prevSelected.messages, newMessage],
              };
            }
            return prevSelected;
          });
        }
      });

      return () => {
        socket.off('newMessage');
      };
    }
  }, [socket, user._id]);

  const handleImageUpload = async () => {
    try {
      const options = {
        mediaType: 'photo',
        quality: 0.8,
      };

      launchImageLibrary(options, async response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else if (response.assets && response.assets[0].uri) {
          const uri = response.assets[0].uri;
          const type = response.assets[0].type || 'image/jpeg';
          const name = response.assets[0].fileName || `photo_${Date.now()}.jpg`;

          setUploading(true);

          const formData = new FormData();
          formData.append('file', {
            uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
            type,
            name,
          });
          formData.append('upload_preset', 'ml_default');

          const cloudinaryResponse = await axios.post(
            'https://api.cloudinary.com/v1_1/dpavrc7wd/image/upload',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            },
          );

          const imageUrl = cloudinaryResponse.data.secure_url;
          sendMessage(imageUrl, true);
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
    }
  };

  const sendMessage = async (content = messageText, isImage = false) => {
    const receiver = selected?.participants.find(p => p._id !== user._id);
    if (!receiver || (!content.trim() && !isImage)) return;

    try {
      const res = await axios.post(
        `http://localhost:4000/api/chat/send/${receiver._id}`,
        {
          message: content, // Removed the [IMAGE] prefix
          senderId: user._id,
          isImage: isImage,
        },
      );

      const newMsg = res.data;
      setSelected(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          isImage ? {...newMsg, isImage: true} : newMsg,
        ],
      }));
      setMessageText('');
      setUploading(false);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    } catch (err) {
      console.error('Send failed', err);
      setUploading(false);
    }
  };

  const prepareImagesForViewer = () => {
    if (!selected || !selected.messages) return [];
    return selected.messages
      .filter(msg => msg.isImage && msg.message) // Ensure message exists and isImage is true
      .map(msg => ({uri: msg.message})); // No need to replace [IMAGE] prefix anymore
  };

  const openImageViewer = index => {
    const images = prepareImagesForViewer();
    // Find the index of the tapped image in the filtered array
    const imageMessages = selected.messages.filter(msg => msg.isImage);
    const imageIndex = imageMessages.findIndex(
      msg => msg._id === selected.messages[index]._id,
    );

    if (imageIndex >= 0) {
      setCurrentImageIndex(imageIndex);
      setIsVisible(true);
    }
  };

  const renderConversationItem = ({item}) => {
    const otherUser = item.participants.find(p => p._id !== user._id);
    const lastMessage = item.messages[item.messages.length - 1];
    console.log('conversation other user ', otherUser, otherUser?.username);
    return (
      <TouchableOpacity
        className="flex-row items-center p-4 border-b border-gray-100"
        onPress={() => {
          setSelected(item);
          setShowConversationModal(false);
        }}>
        <View className="w-12 h-12 rounded-full bg-violet-600 justify-center items-center mr-3">
          <Text className="text-white font-bold text-lg">
            {otherUser?.username?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-gray-800">
            {otherUser?.username || 'Unknown'}
          </Text>
          <Text className="text-gray-500 text-sm" numberOfLines={1}>
            {lastMessage?.isImage
              ? '📷 Image'
              : lastMessage?.message || 'No messages yet'}
          </Text>
        </View>
        <Text className="text-gray-400 text-xs">
          {lastMessage
            ? new Date(lastMessage.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMessageItem = ({item, index}) => {
    const isMe = item.senderId === user._id;
    const isImage = item.isImage;
    const imageUrl = isImage ? item.message : null;

    const handleCopyText = () => {
      Clipboard.setString(item.message);
      Alert.alert('Copied', 'Message copied to clipboard');
    };

    return (
      <View className={`max-w-[80%] mb-3 ${isMe ? 'self-end' : 'self-start'}`}>
        {isImage ? (
          <TouchableOpacity
            className={`rounded-xl overflow-hidden ${
              isMe ? 'bg-blue-500' : 'bg-gray-200'
            }`}
            onPress={() => openImageViewer(index)}>
            <Image
              source={{uri: imageUrl}}
              className="w-64 h-64"
              resizeMode="cover"
            />
            <Text
              className={`text-xs p-1 ${
                isMe ? 'text-blue-100' : 'text-gray-500'
              }`}>
              {new Date(item.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onLongPress={handleCopyText} delayLongPress={300}>
            <View
              className={`p-3 rounded-xl ${
                isMe
                  ? 'bg-blue-500 rounded-br-none'
                  : 'bg-gray-200 rounded-bl-none'
              }`}>
              <Text className={isMe ? 'text-white' : 'text-gray-800'}>
                {item.message}
              </Text>
              <Text
                className={`text-xs mt-1 ${
                  isMe ? 'text-blue-100' : 'text-gray-500'
                }`}>
                {new Date(item.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Image Viewer */}
      <ImageViewing
        images={prepareImagesForViewer()}
        imageIndex={currentImageIndex}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
        backgroundColor="black"
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
      />

      {/* Header */}
      <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => setShowConversationModal(true)}>
          {selected ? (
            <>
              <View className="w-8 h-8 rounded-full bg-violet-500 justify-center items-center mr-2">
                <Text className="text-white font-bold">
                  {selected.participants
                    .find(p => p._id !== user._id)
                    ?.username?.charAt(0)
                    .toUpperCase() || 'U'}
                </Text>
              </View>
              <Text className="font-semibold text-gray-800 mr-1">
                {selected.participants.find(p => p._id !== user._id)
                  ?.username || 'Unknown'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#333" />
            </>
          ) : (
            <>
              <Text className="text-gray-500 mr-1">Select conversation</Text>
              <Ionicons name="chevron-down" size={18} color="#333" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Messages Area */}
      {selected ? (
        <>
          <FlatList
            ref={flatListRef}
            data={selected.messages}
            keyExtractor={item => item._id}
            renderItem={renderMessageItem}
            className="p-4"
            contentContainerStyle={{paddingBottom: 10}}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({animated: true})
            }
            onLayout={() => flatListRef.current?.scrollToEnd({animated: true})}
          />

          {/* Message Input */}
          <View className="flex-row items-center p-3 border-t border-gray-200 bg-gray-50">
            <TouchableOpacity
              className="p-2 mr-1"
              onPress={handleImageUpload}
              disabled={uploading}>
              {uploading ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Feather name="paperclip" size={22} color="#666" />
              )}
            </TouchableOpacity>
            <TextInput
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type a message..."
              className="flex-1 bg-white text-black p-2 px-4 rounded-full border border-gray-300 max-h-20"
              multiline
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              className="p-2 ml-1"
              onPress={() => sendMessage()}
              disabled={!messageText.trim() && !uploading}>
              <Ionicons
                name="send"
                size={22}
                color={messageText.trim() ? '#007AFF' : '#7c3aed'}
              />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View className="flex-1 justify-center items-center opacity-50">
          <Feather name="message-square" size={48} color="#ddd" />
          <Text className="text-gray-500 mt-4">
            Select a conversation to start chatting
          </Text>
        </View>
      )}

      {/* Conversations Modal */}
      <Modal
        visible={showConversationModal}
        animationType="slide"
        onRequestClose={() => setShowConversationModal(false)}>
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="font-bold text-lg">Conversations</Text>
            <TouchableOpacity onPress={() => setShowConversationModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={conversations}
            keyExtractor={item => item._id}
            renderItem={renderConversationItem}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};
