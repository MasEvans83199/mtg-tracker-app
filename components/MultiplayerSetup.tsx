import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Image } from 'react-native';
import tw from '../tailwind';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

interface MultiplayerSetupProps {
  onCreateGame: () => void;
  onJoinGame: (gameId: string, currentUser: FirebaseAuthTypes.User | null) => void;
  onBack: () => void;
  currentUser: FirebaseAuthTypes.User | null;
}

const MultiplayerSetup: React.FC<MultiplayerSetupProps> = ({ onCreateGame, onJoinGame, onBack, currentUser }) => {
  const [gameId, setGameId] = useState('');

  const getManaImage = (color: string) => {
    switch (color) {
      case 'W': return require('../assets/mana/white.png');
      case 'U': return require('../assets/mana/blue.png');
      case 'B': return require('../assets/mana/black.png');
      case 'R': return require('../assets/mana/red.png');
      case 'G': return require('../assets/mana/green.png');
      default: return null;
    }
  };

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
          onPress={() => onJoinGame(gameId, currentUser)}
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

      <View style={tw`flex-row justify-center`}>
        {['W', 'U', 'B', 'R', 'G'].map((color) => (
          <Image
            key={color}
            source={getManaImage(color)}
            style={tw`w-8 h-8 rounded-full mr-2`}
          />
        ))}
      </View>
    </View>
  );
};

export default MultiplayerSetup;