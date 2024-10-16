import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import tw from '../tailwind';

interface SignUpProps {
  onSignUp: (user: any) => void;
  onSwitchToSignIn: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUp, onSwitchToSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      console.log('User account created & signed in!');
      onSignUp(userCredential.user);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'That email address is already in use!');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'That email address is invalid!');
      } else {
        Alert.alert('Error', error.message);
      }
      console.error(error);
    }
  };

  return (
    <View style={tw`flex-1 justify-center items-center p-4`}>
      <Text style={tw`text-2xl font-bold mb-6`}>Sign Up</Text>
      <TextInput
        style={tw`w-full bg-gray-100 rounded-md p-2 mb-4`}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={tw`w-full bg-gray-100 rounded-md p-2 mb-6`}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Pressable
        style={tw`w-full bg-blue-500 rounded-md p-3 items-center`}
        onPress={handleSignUp}
      >
        <Text style={tw`text-white font-semibold`}>Sign Up</Text>
      </Pressable>
      <Pressable
        style={tw`mt-4`}
        onPress={onSwitchToSignIn}
      >
        <Text style={tw`text-blue-500`}>Already have an account? Sign In</Text>
      </Pressable>
    </View>
  );
};

export default SignUp;