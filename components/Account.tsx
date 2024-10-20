import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Modal, ScrollView, Image } from 'react-native';
import tw from '../tailwind';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import CardArtSelector from './CardArtSelector';

interface AccountProps {
    visible: boolean;
    onClose: () => void;
}

const Account: React.FC<AccountProps> = ({ visible, onClose }) => {
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [photoURL, setPhotoURL] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [showCardArtSelector, setShowCardArtSelector] = useState(false);
    const [showNameInput, setShowNameInput] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);

    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                setDisplayName(currentUser.displayName || '');
                setPhotoURL(currentUser.photoURL || 'https://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=0');
            }
        });
        return () => unsubscribe();
    }, []);

    const handleChangePassword = async () => {
        if (!user) return;
        try {
            await user.updatePassword(newPassword);
            setMessage('Password updated successfully');
            setNewPassword('');
            setCurrentPassword('');
            setShowPasswordInput(false);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to update password. Please try again.');
        }
    };

    const handleChangeName = async () => {
        if (!user) return;
        try {
            await user.updateProfile({ displayName: displayName });
            setMessage('Name updated successfully');
            setShowNameInput(false);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to update name. Please try again.');
        }
    };

    const handleSelectArt = async (artUrl: string | null) => {
        if (!user || !artUrl) return;
        try {
            await user.updateProfile({ photoURL: artUrl });
            setPhotoURL(artUrl);
            setMessage('Card art updated successfully');
            setShowCardArtSelector(false);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to update card art. Please try again.');
        }
    };

    if (!user) {
        return null;
    }

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
                <ScrollView contentContainerStyle={tw`flex-grow justify-center`}>
                    <View style={tw`bg-gray-800 p-6 rounded-lg w-11/12 max-w-md m-4`}>
                        <Text style={tw`text-3xl font-bold mb-6 text-blue-400`}>Account</Text>
                        
                        <Text style={tw`text-white mb-2 text-lg`}>Email: {user.email}</Text>
                        
                        <View style={tw`mb-4`}>
                            <Text style={tw`text-white mb-2 text-lg`}>Name: {displayName || 'Not set'}</Text>
                            {!showNameInput && (
                                <Pressable
                                    style={tw`bg-blue-500 p-2 rounded`}
                                    onPress={() => setShowNameInput(true)}
                                >
                                    <Text style={tw`text-white text-center`}>Change Name</Text>
                                </Pressable>
                            )}
                            {showNameInput && (
                                <View>
                                    <TextInput
                                        style={tw`bg-gray-700 text-white p-2 rounded mb-2`}
                                        value={displayName}
                                        onChangeText={setDisplayName}
                                        placeholder="New Name"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                    <Pressable
                                        style={tw`bg-green-500 p-2 rounded`}
                                        onPress={handleChangeName}
                                    >
                                        <Text style={tw`text-white text-center`}>Update Name</Text>
                                    </Pressable>
                                </View>
                            )}
                        </View>

                        <View style={tw`mb-4`}>
                            <Text style={tw`text-white mb-2 text-lg`}>Password</Text>
                            {!showPasswordInput && (
                                <Pressable
                                    style={tw`bg-blue-500 p-2 rounded`}
                                    onPress={() => setShowPasswordInput(true)}
                                >
                                    <Text style={tw`text-white text-center`}>Change Password</Text>
                                </Pressable>
                            )}
                            {showPasswordInput && (
                                <View>
                                    <View style={tw`flex-row items-center mb-2`}>
                                        <TextInput
                                            style={tw`bg-gray-700 text-white p-2 rounded flex-1`}
                                            secureTextEntry={!showPassword}
                                            value={currentPassword}
                                            onChangeText={setCurrentPassword}
                                            placeholder="Current Password"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                        <Pressable onPress={() => setShowPassword(!showPassword)} style={tw`ml-2`}>
                                            <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="white" />
                                        </Pressable>
                                    </View>
                                    <TextInput
                                        style={tw`bg-gray-700 text-white p-2 rounded mb-2`}
                                        secureTextEntry
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        placeholder="New Password"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                    <Pressable
                                        style={tw`bg-green-500 p-2 rounded`}
                                        onPress={handleChangePassword}
                                    >
                                        <Text style={tw`text-white text-center`}>Update Password</Text>
                                    </Pressable>
                                </View>
                            )}
                        </View>

                        <View style={tw`mb-4`}>
                            <Text style={tw`text-white mb-2 text-lg`}>Card Art</Text>
                            {photoURL ? (
                                <Image
                                    source={{ uri: photoURL }}
                                    style={tw`w-full h-40 rounded-lg mb-2 shadow-lg`}
                                    resizeMode="contain"
                                />
                            ) : (
                                <Text style={tw`text-gray-400 mb-2`}>No card art set</Text>
                            )}
                            <Pressable
                                style={tw`bg-blue-500 p-2 rounded`}
                                onPress={() => setShowCardArtSelector(true)}
                            >
                                <Text style={tw`text-white text-center`}>Change Card Art</Text>
                            </Pressable>
                        </View>

                        {message && (
                            <Text style={tw`text-green-400 mb-4 text-center`}>{message}</Text>
                        )}

                        <Pressable
                            style={tw`bg-red-500 p-2 rounded mt-4`}
                            onPress={onClose}
                        >
                            <Text style={tw`text-white text-center`}>Close</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </View>

            <Modal visible={showCardArtSelector} animationType="slide">
                <CardArtSelector onSelectArt={handleSelectArt} />
                <Pressable
                    style={tw`bg-red-500 p-2 m-4 rounded`}
                    onPress={() => setShowCardArtSelector(false)}
                >
                    <Text style={tw`text-white text-center font-bold`}>Close</Text>
                </Pressable>
            </Modal>
        </Modal>
    );
};

export default Account;