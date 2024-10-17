import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import tw from '../tailwind';
import { Player } from '../types';
import PlayerComponent from './PlayerComponent';
import { Ionicons } from '@expo/vector-icons';

interface OpponentsViewProps {
  opponents: Player[];
  onOpponentPress: (opponent: Player) => void;
}

const OpponentsView: React.FC<OpponentsViewProps> = ({ opponents, onOpponentPress }) => {
  return (
    <View style={tw`mt-6 bg-gray-800 rounded-lg p-4`}>
      <Text style={tw`text-xl font-bold mb-4 text-blue-400`}>Opponents</Text>
      <ScrollView 
        horizontal={true} 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw`pb-2`}
      >
        {opponents.map(opponent => (
          <Pressable 
            key={opponent.id.toString()} 
            onPress={() => onOpponentPress(opponent)} 
            style={tw`mr-4 last:mr-0`}
          >
            <View style={tw`items-center`}>
              <PlayerComponent
                player={opponent}
                isSmall={true}
                disabled={true}
              />
              <Text style={tw`mt-2 text-white font-semibold`}>{opponent.name}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default OpponentsView;