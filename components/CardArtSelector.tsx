import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, Image, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from '../tailwind';

interface CardArtSelectorProps {
  onSelectArt: (artUrl: string | null) => void;
}

const CardArtSelector: React.FC<CardArtSelectorProps> = ({ onSelectArt }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchCards = useCallback(async (term: string) => {
    if (term.trim() === '') return;

    setLoading(true);
    setError('');

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

  const handleSubmit = () => {
    searchCards(searchTerm);
  };

  interface CardItem {
    id: string;
    name: string;
    image_uris?: {
      art_crop?: string;
    };
  }

  const renderCardItem = ({ item }: { item: CardItem}) => (
    <Pressable
      style={tw`p-2`}
      onPress={() => {
        if (item.image_uris?.art_crop) {
          onSelectArt(item.image_uris.art_crop);
        }
      }}
    >
      <Image
        source={{ uri: item.image_uris?.art_crop || 'default_image_url' }}
        style={tw`w-24 h-24 rounded-lg`}
      />
      <Text style={tw`text-xs mt-2 text-center text-gray-300`}>{item.name}</Text>
    </Pressable>
  );

  return (
    <View style={tw`flex-1 bg-gray-900 p-4`}>
      <Text style={tw`text-2xl font-bold mb-4 text-blue-400`}>Card Art Selector</Text>
      <View style={tw`flex-row mb-6`}>
        <TextInput
          style={tw`flex-1 bg-gray-800 text-white border border-gray-700 rounded-l-lg p-3`}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search for a card"
          placeholderTextColor="#9CA3AF"
        />
        <Pressable
          style={({ pressed }) => tw`${pressed ? 'bg-blue-700' : 'bg-blue-600'} px-6 justify-center rounded-r-lg`}
          onPress={handleSubmit}
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
    </View>
  );
};

export default CardArtSelector;