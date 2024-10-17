import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, FlatList, Image, Modal, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import tw from '../tailwind';

interface Card {
  id: string;
  name: string;
  image_uris?: {
    small: string;
    normal: string;
  };
  oracle_text?: string;
  legalities?: {
    [format: string]: string;
  };
}

interface CardSearchProps {
  visible: boolean;
  onClose: () => void;
}

const CardSearch: React.FC<CardSearchProps> = ({ visible, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCards = useCallback(async (term: string) => {
    if (term.trim() === '') return;
    setLoading(true);
    setError(null);

    try {
      const cachedResults = await AsyncStorage.getItem(`card_search_${term}`);
      if (cachedResults) {
        setSearchResults(JSON.parse(cachedResults));
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(term)}`,
        {
          headers: {
            'User-Agent': 'MTGLifeCounter/1.0',
            'Accept': 'application/json'
          }
        }
      );

      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      const data = await response.json();
      setSearchResults(data.data || []);

      await AsyncStorage.setItem(`card_search_${term}`, JSON.stringify(data.data || []));

    } catch (error: unknown) {
      console.error('Error searching cards:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while searching for cards.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim() !== '') {
      searchCards(searchTerm);
    }
  };

  const resetState = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedCard(null);
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const renderCardItem = ({ item }: { item: Card }) => (
    <Pressable
      style={tw`p-2`}
      onPress={() => setSelectedCard(item)}
    >
      {item.image_uris?.small ? (
        <Image
          source={{ uri: item.image_uris.small }}
          style={tw`w-24 h-32 rounded-lg`}
        />
      ) : (
        <View style={tw`w-24 h-32 bg-gray-700 rounded-lg justify-center items-center`}>
          <Text style={tw`text-white`}>No image</Text>
        </View>
      )}
      <Text style={tw`text-xs mt-2 text-center text-white`}>{item.name}</Text>
    </Pressable>
  );

  const renderLegalities = (legalities: { [format: string]: string }) => {
    const formatOrder = [
      'standard', 'pioneer', 'modern', 'legacy', 'vintage', 'commander', 'pauper', 'brawl', 'historic', 'penny'
    ];

    return (
      <View style={tw`mt-4`}>
        <Text style={tw`text-lg font-bold mb-2 text-blue-400`}>Legalities</Text>
        {formatOrder.map((format) => {
          const legality = legalities[format] || 'not_legal';
          const color = legality === 'legal' ? 'green' : legality === 'restricted' ? 'yellow' : 'red';
          const icon = legality === 'legal' ? 'checkmark-circle' : legality === 'restricted' ? 'alert-circle' : 'close-circle';
          
          return (
            <View key={format} style={tw`flex-row items-center mb-1`}>
              <Ionicons name={icon} size={16} color={color} style={tw`mr-2`} />
              <Text style={tw`capitalize flex-1 text-gray-300`}>{format}</Text>
              <Text style={tw`capitalize text-${color}-500`}>{legality.replace('_', ' ')}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={tw`flex-1 bg-gray-900 p-6`}>
        <Text style={tw`text-3xl font-bold mb-6 text-blue-400`}>Card Search</Text>
        <View style={tw`flex-row mb-6`}>
          <TextInput
            style={tw`flex-1 bg-gray-800 text-white border border-gray-700 rounded-l-lg p-3`}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search for a card"
            placeholderTextColor="#9CA3AF"
            onSubmitEditing={handleSearch}
          />
          <Pressable
            style={({ pressed }) => tw`${pressed ? 'bg-blue-700' : 'bg-blue-600'} px-6 justify-center rounded-r-lg`}
            onPress={handleSearch}
          >
            <Text style={tw`text-white font-semibold`}>Search</Text>
          </Pressable>
        </View>
        {loading && <ActivityIndicator size="large" color="#60A5FA" style={tw`my-4`} />}
        {error && <Text style={tw`text-red-500 mb-4`}>{error}</Text>}
        <FlatList
          data={searchResults}
          renderItem={renderCardItem}
          keyExtractor={item => item.id}
          numColumns={3}
          contentContainerStyle={tw`pb-4`}
        />
        {selectedCard && (
          <Modal visible={!!selectedCard} transparent={true} animationType="fade">
            <View style={tw`flex-1 bg-black bg-opacity-80 justify-center items-center p-4`}>
              <View style={tw`bg-gray-800 p-6 rounded-lg w-full max-w-4xl max-h-[90%]`}>
                <ScrollView>
                  <View style={tw`flex-row mb-4`}>
                    <Image
                      source={{ uri: selectedCard.image_uris?.normal }}
                      style={tw`w-48 h-64 rounded-lg`}
                      resizeMode="contain"
                    />
                    <View style={tw`flex-1 ml-4`}>
                      <Text style={tw`text-2xl font-bold mb-2 text-white`}>{selectedCard.name}</Text>
                      <Text style={tw`text-gray-300 mb-4`}>{selectedCard.oracle_text}</Text>
                    </View>
                  </View>
                  {renderLegalities(selectedCard.legalities || {})}
                </ScrollView>
                <Pressable
                  style={tw`absolute top-2 right-2 bg-red-600 p-2 rounded-full`}
                  onPress={() => setSelectedCard(null)}
                >
                  <Ionicons name="close" size={24} color="white" />
                </Pressable>
              </View>
            </View>
          </Modal>
        )}
        <Pressable
          style={({ pressed }) => tw`${pressed ? 'bg-red-700' : 'bg-red-600'} p-3 rounded-lg mt-6`}
          onPress={handleClose}
        >
          <Text style={tw`text-white text-center font-semibold`}>Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
};


export default CardSearch;