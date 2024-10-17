import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { PlayerStats as PlayerStatsType } from '../types';
import tw from '../tailwind';

interface PlayerStatsProps {
  stats: PlayerStatsType;
  name: string;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ stats, name }) => {
  const averageLifeGained = stats.gamesPlayed > 0 ? stats.totalLifeGained / stats.gamesPlayed : 0;
  const averageLifeLost = stats.gamesPlayed > 0 ? stats.totalLifeLost / stats.gamesPlayed : 0;
  const averageCommanderDamageDealt = stats.gamesPlayed > 0 ? stats.totalCommanderDamageDealt / stats.gamesPlayed : 0;
  const averageCommanderDamageReceived = stats.gamesPlayed > 0 ? stats.totalCommanderDamageReceived / stats.gamesPlayed : 0;
  const averagePoisonCountersGiven = stats.gamesPlayed > 0 ? stats.totalPoisonCountersGiven / stats.gamesPlayed : 0;
  const averagePoisonCountersReceived = stats.gamesPlayed > 0 ? stats.totalPoisonCountersReceived / stats.gamesPlayed : 0;
  
  const StatSection = ({ title, data }: { title: string; data: { label: string; value: string | number }[] }) => (
    <View style={tw`mb-6 bg-gray-800 rounded-lg p-4`}>
      <Text style={tw`text-xl font-bold mb-2 text-blue-400`}>{title}</Text>
      {data.map((item, index) => (
        <View key={index} style={tw`flex-row justify-between mb-1`}>
          <Text style={tw`text-gray-300`}>{item.label}:</Text>
          <Text style={tw`text-white font-semibold`}>{item.value}</Text>
        </View>
      ))}
    </View>
  );

  if (!stats) {
    return (
      <ScrollView style={tw`bg-gray-900 p-6`}>
        <Text style={tw`text-3xl font-bold mb-4 text-blue-400`}>{name}'s Statistics</Text>
        <Text style={tw`text-white`}>No statistics available</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={tw`bg-gray-900 p-6`}>
      <Text style={tw`text-3xl font-bold mb-6 text-blue-400`}>{name}'s Statistics</Text>
      
      <StatSection title="Overview" data={[
        { label: "Games Played", value: stats.gamesPlayed },
        { label: "Wins", value: stats.wins },
        { label: "Win Rate", value: `${((stats.wins / stats.gamesPlayed) * 100).toFixed(2)}%` },
      ]} />

      <StatSection title="Life" data={[
        { label: "Total Gained", value: stats.totalLifeGained },
        { label: "Total Lost", value: stats.totalLifeLost },
        { label: "Avg. Gained per Game", value: averageLifeGained.toFixed(2) },
        { label: "Avg. Lost per Game", value: averageLifeLost.toFixed(2) },
      ]} />

      <StatSection title="Commander Damage" data={[
        { label: "Total Dealt", value: stats.totalCommanderDamageDealt },
        { label: "Total Received", value: stats.totalCommanderDamageReceived },
        { label: "Avg. Dealt per Game", value: averageCommanderDamageDealt.toFixed(2) },
        { label: "Avg. Received per Game", value: averageCommanderDamageReceived.toFixed(2) },
      ]} />

      <StatSection title="Poison Counters" data={[
        { label: "Total Given", value: stats.totalPoisonCountersGiven },
        { label: "Total Received", value: stats.totalPoisonCountersReceived },
        { label: "Avg. Given per Game", value: averagePoisonCountersGiven.toFixed(2) },
        { label: "Avg. Received per Game", value: averagePoisonCountersReceived.toFixed(2) },
      ]} />
    </ScrollView>
  );
};

export default PlayerStats;