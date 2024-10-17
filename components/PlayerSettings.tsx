import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Modal, Image } from 'react-native';
import tw from '../tailwind';
import { Player } from '../types';
import CardArtSelector from './CardArtSelector';
import PlayerStats from './PlayerStats';

interface PlayerSettingsProps {
  visible: boolean;
  player: Player | null;
  onUpdate: (player: Player) => void;
  onClose: () => void;
}

const PlayerSettings: React.FC<PlayerSettingsProps> = ({ visible, player, onUpdate, onClose }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [showCardArtSelector, setShowCardArtSelector] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (player) {
      setName(player.name);
      setIcon(player.icon);
    }
  }, [player]);

  const handleUpdate = () => {
    if (player) {
      onUpdate({ ...player, name, icon });
    }
    onClose();
  };

  const handleSelectArt = (artUrl: string | null) => {
    if (artUrl) {
      setIcon(artUrl);
    }
    setShowCardArtSelector(false);
  };

  if (!player) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-80`}>
        <View style={tw`bg-gray-800 p-6 rounded-lg w-11/12 max-w-md`}>
          <Text style={tw`text-2xl font-bold mb-4 text-blue-400`}>Player Settings</Text>
          <TextInput
            style={tw`bg-gray-700 text-white border border-gray-600 rounded-lg p-3 mb-4`}
            value={name}
            onChangeText={setName}
            placeholder="Enter player name"
            placeholderTextColor="#9CA3AF"
          />
          <Pressable
            style={({ pressed }) => tw`${pressed ? 'bg-blue-700' : 'bg-blue-600'} p-3 rounded-lg mb-3`}
            onPress={() => setShowCardArtSelector(true)}
          >
            <Text style={tw`text-white text-center font-semibold`}>Change Card Art</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => tw`${pressed ? 'bg-purple-700' : 'bg-purple-600'} p-3 rounded-lg mb-3`}
            onPress={() => setShowStats(true)}
          >
            <Text style={tw`text-white text-center font-semibold`}>View Player Stats</Text>
          </Pressable>
          {icon && (
            <Image
              source={{ uri: icon }}
              style={tw`w-24 h-24 rounded-lg self-center mb-4`}
            />
          )}
          <View style={tw`flex-row justify-between`}>
            <Pressable
              style={({ pressed }) => tw`${pressed ? 'bg-green-700' : 'bg-green-600'} p-3 rounded-lg flex-1 mr-2`}
              onPress={handleUpdate}
            >
              <Text style={tw`text-white text-center font-semibold`}>Update</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => tw`${pressed ? 'bg-red-700' : 'bg-red-600'} p-3 rounded-lg flex-1 ml-2`}
              onPress={onClose}
            >
              <Text style={tw`text-white text-center font-semibold`}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
      <Modal visible={showCardArtSelector} animationType="slide">
        <View style={tw`flex-1 bg-gray-900`}>
          <CardArtSelector onSelectArt={handleSelectArt} />
          <View style={tw`bg-gray-900 p-4`}>
            <Pressable
              style={({ pressed }) => tw`${pressed ? 'bg-red-700' : 'bg-red-600'} p-3 rounded-lg`}
              onPress={() => setShowCardArtSelector(false)}
            >
              <Text style={tw`text-white text-center font-semibold`}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal visible={showStats} animationType="fade">
        <View style={tw`flex-1 bg-gray-900 p-4`}>
          {player && player.stats ? (
            <PlayerStats stats={player.stats} name={player.name} />
          ) : (
            <Text style={tw`text-white text-center text-lg`}>No stats available</Text>
          )}
          <Pressable
            style={({ pressed }) => tw`${pressed ? 'bg-red-700' : 'bg-red-600'} p-3 mt-4 rounded-lg`}
            onPress={() => setShowStats(false)}
          >
            <Text style={tw`text-white text-center font-semibold`}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </Modal>
  );
};

export default PlayerSettings;