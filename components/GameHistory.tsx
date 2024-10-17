import React from 'react';
import { View, Text, Modal, ScrollView, Pressable } from 'react-native';
import tw from '../tailwind';

interface GameHistoryProps {
  visible: boolean;
  history: string[];
  onClose: () => void;
}

const GameHistory: React.FC<GameHistoryProps> = ({ visible, history, onClose }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-80`}>
        <View style={tw`bg-gray-800 p-6 rounded-lg w-11/12 max-w-md h-4/5`}>
          <Text style={tw`text-2xl font-bold mb-4 text-blue-400`}>Game History</Text>
          <ScrollView 
            style={tw`mb-4 bg-gray-700 rounded-lg p-4`}
            contentContainerStyle={tw`pb-4`}
          >
            {history && history.length > 0 ? (
              history.map((event, index) => (
                <View key={index} style={tw`mb-2 bg-gray-600 p-3 rounded-lg`}>
                  <Text style={tw`text-white`}>{event}</Text>
                </View>
              ))
            ) : (
              <Text style={tw`text-gray-400 italic`}>No history available</Text>
            )}
          </ScrollView>
          <Pressable 
            onPress={onClose} 
            style={({ pressed }) => tw`${pressed ? 'bg-red-700' : 'bg-red-600'} p-3 rounded-lg`}
          >
            <Text style={tw`text-white text-center font-semibold`}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default GameHistory;