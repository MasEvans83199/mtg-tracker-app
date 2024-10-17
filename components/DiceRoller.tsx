import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from '../tailwind';

interface DiceRollerProps {
  onRoll: (result: number) => void;
}

const diceTypes = [2, 4, 6, 8, 10, 12, 20];

const diceUnicode: { [key: string]: { [key: number]: string } } = {
  'd2': { 1: '\uf117', 2: '\uf118' },
  'd4': { 1: '\uf12d', 2: '\uf12e', 3: '\uf12f', 4: '\uf130' },
  'd6': { 1: '\uf131', 2: '\uf132', 3: '\uf133', 4: '\uf134', 5: '\uf135', 6: '\uf136' },
  'd8': { 1: '\uf137', 2: '\uf138', 3: '\uf139', 4: '\uf13a', 5: '\uf13b', 6: '\uf13c', 7: '\uf13d', 8: '\uf13e' },
  'd10': { 0: '\uf100', 1: '\uf101', 2: '\uf103', 3: '\uf104', 4: '\uf105', 5: '\uf106', 6: '\uf107', 7: '\uf108', 8: '\uf109', 9: '\uf10a' },
  'd12': { 1: '\uf10b', 2: '\uf10f', 3: '\uf110', 4: '\uf111', 5: '\uf112', 6: '\uf113', 7: '\uf114', 8: '\uf115', 9: '\uf116', 10: '\uf10c', 11: '\uf10d', 12: '\uf10e' },
  'd20': { 1: '\uf119', 2: '\uf124', 3: '\uf126', 4: '\uf127', 5: '\uf128', 6: '\uf129', 7: '\uf12a', 8: '\uf12b', 9: '\uf12c', 10: '\uf11a', 11: '\uf11b', 12: '\uf11c', 13: '\uf11d', 14: '\uf11e', 15: '\uf11f', 16: '\uf120', 17: '\uf121', 18: '\uf122', 19: '\uf123', 20: '\uf125' },
};

const DiceRoller: React.FC<DiceRollerProps> = ({ onRoll }) => {
  const [selectedDice, setSelectedDice] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);

  const rollDice = (sides: number) => {
    const roll = Math.floor(Math.random() * sides) + 1;
    setResult(roll);
    setSelectedDice(sides);
    onRoll(roll);
  };

  const getDiceIcon = (sides: number, result: number | null) => {
    if (result === null) return '';
    return diceUnicode[`d${sides}`][result];
  };

  const getDiceColor = (sides: number) => {
    const colors = {
      2: 'bg-red-600',
      4: 'bg-blue-600',
      6: 'bg-green-600',
      8: 'bg-yellow-600',
      10: 'bg-purple-600',
      12: 'bg-pink-600',
      20: 'bg-indigo-600',
    };
    return colors[sides as keyof typeof colors] || 'bg-gray-600';
  };

  return (
    <View style={tw`bg-gray-800 p-6 rounded-lg`}>
      <Text style={tw`text-2xl font-bold text-center mb-6 text-blue-400`}>Dice Roller</Text>
      <View style={tw`flex-row flex-wrap justify-center mb-6`}>
        {diceTypes.map((sides) => (
          <Pressable
            key={sides}
            style={({ pressed }) => tw`m-2 p-3 ${pressed ? getDiceColor(sides).replace('600', '700') : getDiceColor(sides)} rounded-lg`}
            onPress={() => rollDice(sides)}
          >
            <Text style={tw`text-white font-bold text-lg`}>d{sides}</Text>
          </Pressable>
        ))}
      </View>
      {result !== null && selectedDice !== null && (
        <View style={tw`items-center bg-gray-700 p-4 rounded-lg`}>
          <Text style={[tw`text-7xl mb-4 text-white`, { fontFamily: 'dicefont' }]}>
            {getDiceIcon(selectedDice, result)}
          </Text>
          <Text style={tw`text-3xl font-bold text-white`}>Result: {result}</Text>
        </View>
      )}
    </View>
  );
};

export default DiceRoller;