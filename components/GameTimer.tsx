import React from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from '../tailwind';

interface GameTimerProps {
  onTimeUp: () => void;
  duration: number;
  timeLeft: number;
  isActive: boolean;
  onDurationChange: (duration: number) => void;
  onActiveChange: (isActive: boolean) => void;
}

const GameTimer: React.FC<GameTimerProps> = ({ 
  onTimeUp, 
  duration, 
  timeLeft,
  isActive, 
  onDurationChange, 
  onActiveChange 
}) => {
  const startTimer = () => {
    if (timeLeft === 0) {
      onDurationChange(duration);
    }
    onActiveChange(true);
  };

  const stopTimer = () => {
    onActiveChange(false);
  };

  const resetTimer = () => {
    onActiveChange(false);
    onDurationChange(duration);
  };

  const setTimerDuration = (minutes: number) => {
    const newDuration = minutes * 60;
    onDurationChange(newDuration);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const TimerButton = ({ onPress, color, text }: { onPress: () => void; color: string; text: string }) => (
    <Pressable
      style={({ pressed }) => tw`${pressed ? `${color}-700` : `${color}-600`} p-3 rounded-lg mb-3`}
      onPress={onPress}
    >
      <Text style={tw`text-white font-semibold text-center`}>{text}</Text>
    </Pressable>
  );

  return (
    <View style={tw`bg-gray-800 p-6 rounded-lg`}>
      <Text style={tw`text-2xl font-bold text-center mb-2 text-blue-400`}>Game Timer</Text>
      <Text style={tw`text-4xl font-bold text-center mb-6 text-white`}>
        {formatTime(timeLeft)}
      </Text>
      <View style={tw`flex-row justify-around mb-6`}>
        {[5, 10, 15].map((minutes) => (
          <Pressable 
            key={minutes}
            onPress={() => setTimerDuration(minutes)} 
            style={({ pressed }) => tw`${pressed ? 'bg-indigo-700' : 'bg-indigo-600'} px-4 py-2 rounded-lg`}
          >
            <Text style={tw`text-white font-semibold`}>{minutes} min</Text>
          </Pressable>
        ))}
      </View>
      <TimerButton onPress={startTimer} color="bg-green" text="Start Timer" />
      <TimerButton onPress={stopTimer} color="bg-red" text="Stop Timer" />
      <TimerButton onPress={resetTimer} color="bg-yellow" text="Reset Timer" />
    </View>
  );
};

export default GameTimer;