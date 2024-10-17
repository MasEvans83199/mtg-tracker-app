import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import tw from '../tailwind';

interface MultiplayerSetupProps {
  onCreateGame: () => void;
  onJoinGame: (gameId: string) => void;
  onBack: () => void;
}

const MultiplayerSetup: React.FC<MultiplayerSetupProps> = ({ onCreateGame, onJoinGame, onBack }) => {
  const [gameId, setGameId] = useState('');

  return (
    <View style={tw`flex-1 justify-between bg-gray-900 px-6 py-12`}>
      <View style={tw`items-center`}>
        <Text style={tw`text-3xl font-bold mb-2 text-blue-400`}>Multiplayer Setup</Text>
      </View>

      <View style={tw`space-y-6`}>
        <Pressable 
          style={({ pressed }) => tw`${pressed ? 'bg-blue-700' : 'bg-blue-600'} p-4 mb-6 rounded-lg shadow-lg transition-colors`}
          onPress={onCreateGame}
        >
          <Text style={tw`text-white text-center font-semibold text-lg`}>Create Game</Text>
        </Pressable>

        <View style={tw`items-center`}>
          <Text style={tw`text-lg text-gray-400 mb-2`}>Or</Text>
          <TextInput
            style={tw`bg-gray-800 text-white border border-gray-700 rounded-lg p-3 w-full my-4`}
            value={gameId}
            onChangeText={setGameId}
            placeholder="Enter Game ID"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <Pressable 
          style={({ pressed }) => tw`${pressed ? 'bg-green-700' : 'bg-green-600'} p-4 rounded-lg shadow-lg transition-colors`}
          onPress={() => onJoinGame(gameId)}
        >
          <Text style={tw`text-white text-center font-semibold text-lg`}>Join Game</Text>
        </Pressable>
      </View>

      <Pressable 
        style={({ pressed }) => tw`${pressed ? 'bg-gray-700' : 'bg-gray-600'} p-4 rounded-lg shadow-lg transition-colors -mt-6`}
        onPress={onBack}
      >
        <Text style={tw`text-white text-center font-semibold text-lg`}>Back</Text>
      </Pressable>

      <View style={tw`flex-row justify-center space-x-2 mt-8`}>
        {['W', 'U', 'B', 'R', 'G'].map((color) => (
          <View key={color} style={tw`w-8 h-8 mr-2 rounded-full ${getManaColor(color)}`} />
        ))}
      </View>
    </View>
  );
};

const getManaColor = (color: string) => {
  switch (color) {
    case 'W': return 'bg-yellow-300';
    case 'U': return 'bg-blue-500';
    case 'B': return 'bg-gray-700';
    case 'R': return 'bg-red-500';
    case 'G': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

export default MultiplayerSetup;