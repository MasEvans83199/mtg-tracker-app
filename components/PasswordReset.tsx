import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import tw from '../tailwind';

interface PasswordResetProps {
  onResetSuccess: () => void;
  onSwitchToSignIn: () => void;
}

const PasswordReset: React.FC<PasswordResetProps> = ({ onResetSuccess, onSwitchToSignIn }) => {
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);

  const handleSendResetEmail = async () => {
    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert('Success', 'Password reset email sent. Please check your inbox.');
      setIsCodeSent(true);
    } catch (error: any) {
      if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'That email address is invalid!');
      } else if (error.code === 'auth/user-not-found') {
        Alert.alert('Error', 'No user found with this email address.');
      } else {
        Alert.alert('Error', error.message);
      }
      console.error(error);
    }
  };

  const handleConfirmReset = async () => {
    try {
      await auth().confirmPasswordReset(resetCode, newPassword);
      Alert.alert('Success', 'Your password has been reset successfully.');
      onResetSuccess();
    } catch (error: any) {
      if (error.code === 'auth/invalid-action-code') {
        Alert.alert('Error', 'The reset code is invalid or expired.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Error', 'The new password is too weak. Please choose a stronger password.');
      } else {
        Alert.alert('Error', error.message);
      }
      console.error(error);
    }
  };

  return (
    <View style={tw`flex-1 justify-center items-center p-4`}>
      <Text style={tw`text-2xl font-bold mb-6`}>Reset Password</Text>
      {!isCodeSent ? (
        <>
          <TextInput
            style={tw`w-full bg-gray-100 rounded-md p-2 mb-4`}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Pressable
            style={tw`w-full bg-blue-500 rounded-md p-3 items-center`}
            onPress={handleSendResetEmail}
          >
            <Text style={tw`text-white font-semibold`}>Send Reset Email</Text>
          </Pressable>
        </>
      ) : (
        <>
          <TextInput
            style={tw`w-full bg-gray-100 rounded-md p-2 mb-4`}
            placeholder="Reset Code"
            value={resetCode}
            onChangeText={setResetCode}
          />
          <TextInput
            style={tw`w-full bg-gray-100 rounded-md p-2 mb-4`}
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <Pressable
            style={tw`w-full bg-blue-500 rounded-md p-3 items-center`}
            onPress={handleConfirmReset}
          >
            <Text style={tw`text-white font-semibold`}>Confirm Reset</Text>
          </Pressable>
        </>
      )}
      <Pressable
        style={tw`mt-4`}
        onPress={onSwitchToSignIn}
      >
        <Text style={tw`text-blue-500`}>Back to Sign In</Text>
      </Pressable>
    </View>
  );
};

export default PasswordReset;