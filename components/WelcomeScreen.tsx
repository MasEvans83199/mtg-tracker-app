import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import tw from '../tailwind';

interface WelcomeScreenProps {
  onStartLocalGame: () => void;
  onHostSession: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartLocalGame, onHostSession }) => {

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
        <Text style={tw`text-5xl font-bold mb-2 text-blue-400`}>Magic</Text>
        <Text style={tw`text-3xl font-semibold mb-8 text-white`}>the Trackering</Text>
      </View>

      <View style={tw`space-y-6`}>
        <Pressable
          style={({ pressed }) => tw`${pressed ? 'bg-blue-700' : 'bg-blue-600'} p-4 mb-8 rounded-lg shadow-lg transition-colors`}
          onPress={onStartLocalGame}
        >
          <Text style={tw`text-white text-center font-semibold text-lg`}>
            Local Session
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => tw`${pressed ? 'bg-red-700' : 'bg-red-600'} p-4 rounded-lg shadow-lg transition-colors`}
          onPress={onHostSession}
        >
          <Text style={tw`text-white text-center font-semibold text-lg`}>
            Online Session
          </Text>
        </Pressable>
      </View>

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

export default WelcomeScreen;