import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import tw from '../tailwind';

interface SignInProps {
  onSignIn: (user: any) => void;
  onSwitchToSignUp: () => void;
  onSwitchToResetPassword: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn, onSwitchToSignUp, onSwitchToResetPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      console.log('User signed in!');
      onSignIn(userCredential.user);
    } catch (error: any) {
      if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'That email address is invalid!');
      } else if (error.code === 'auth/user-disabled') {
        Alert.alert('Error', 'This user account has been disabled.');
      } else if (error.code === 'auth/user-not-found') {
        Alert.alert('Error', 'No user found with this email address.');
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Incorrect password.');
      } else {
        Alert.alert('Error', error.message);
      }
      console.error(error);
    }
  };

  return (
    <View style={tw`flex-1 justify-center items-center p-4`}>
      <Text style={tw`text-2xl font-bold mb-6`}>Sign In</Text>
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
        onPress={handleSignIn}
      >
        <Text style={tw`text-white font-semibold`}>Sign In</Text>
      </Pressable>
      <Pressable
        style={tw`mt-4`}
        onPress={onSwitchToSignUp}
      >
        <Text style={tw`text-blue-500`}>Don't have an account? Sign Up</Text>
      </Pressable>
      <Pressable
        style={tw`mt-2`}
        onPress={onSwitchToResetPassword}
      >
        <Text style={tw`text-blue-500`}>Forgot Password?</Text>
      </Pressable>
    </View>
  );
};

export default SignIn;