import 'setimmediate';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Font from 'expo-font';
import { debounce } from 'lodash';
import { View, Text, Pressable, Animated, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Ionicons } from '@expo/vector-icons';
import tw from './tailwind';
import { User, Player, Preset } from './types';
import PlayerComponent from './components/PlayerComponent';
import PlayerSettings from './components/PlayerSettings';
import GameHistory from './components/GameHistory';
import GameTimer from './components/GameTimer';
import DiceRoller from './components/DiceRoller';
import CardSearch from './components/CardSearch';
import MultiplayerSetup from './components/MultiplayerSetup';
import RoomCodeDisplay from './components/RoomCodeDisplay';
import WelcomeScreen from './components/WelcomeScreen';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import PasswordReset from './components/PasswordReset';
import Account from './components/Account';
import { signOut } from '@react-native-firebase/auth';
import firebase from './src/firebaseConfig';

import { updateGameState, listenToGameState, createGame, joinGame } from './src/utils/firebase';
import OpponentsSection from './components/OpponentsSection';

const loadFonts = async () => {
  await Font.loadAsync({
    'dicefont': require('./assets/dice/dicefont.ttf'),
  });
};

interface MainContentProps {
  user: User | null;
}

const MainContent: React.FC<MainContentProps> = ({ user }) => {
  const [screen, setScreen] = useState<'welcome' | 'multiplayerSetup' | 'game'>('welcome');
  const [showAccount, setShowAccount] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [currentPreset, setCurrentPreset] = useState<Preset | null>(null);
  const [showSettings, setShowSettings] = useState<number | string | null>(null);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [changeBuffer, setChangeBuffer] = useState<Record<number | string, Record<string, number>>>({});
  const [showGameTimer, setShowGameTimer] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showMiniTimer, setShowMiniTimer] = useState(false);
  const [miniTimerOpacity] = useState(new Animated.Value(1));
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [showCardSearch, setShowCardSearch] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [showJoinPopup, setShowJoinPopup] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedOpponent, setSelectedOpponent] = useState<Player | null>(null);
  type IoniconsName = 'person-add' | 'refresh' | 'clipboard' | 'list' | 'save-outline' | 'search' | 'dice' | 'timer';

  const playersRef = useRef(players);
  const gameHistoryRef = useRef(gameHistory);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    gameHistoryRef.current = gameHistory;
  }, [gameHistory]);

  useEffect(() => {
    if (isMultiplayer && gameId) {
      const unsubscribe = listenToGameState(gameId, (newGameState) => {
        if (newGameState) {
          setPlayers(newGameState.players);
          setGameHistory(newGameState.gameHistory);
          setGameEnded(newGameState.gameEnded);

          if (newGameState.gameEnded) {
            const winner = newGameState.players.find((p: Player) => p.hasCrown);
            if (winner) {
              console.log(`Game ended. Winner: ${winner.name}`);
              // Update current player if it exists
              if (currentPlayer) {
                const updatedCurrentPlayer = newGameState.players.find((p: Player) => p.id === currentPlayer.id);
                if (updatedCurrentPlayer) {
                  setCurrentPlayer(updatedCurrentPlayer);
                }
              }
            }
          }
        }
      });
      return () => unsubscribe();
    }
  }, [isMultiplayer, gameId, currentPlayer]);

  const loadPresets = async () => {
    try {
      const savedPresets = await AsyncStorage.getItem('presets');
      if (savedPresets) {
        setPresets(JSON.parse(savedPresets));
      }
    } catch (error) {
      console.error('Failed to load presets', error);
    }
  };

  useEffect(() => {
    loadPresets();
  }, []);

  useEffect(() => {
    const saveGameState = async () => {
      try {
        await AsyncStorage.setItem('gameState', JSON.stringify({
          players,
          gameHistory,
          gameEnded
        }));
      } catch (error) {
        console.error('Failed to save game state', error);
      }
    };

    saveGameState();
  }, [players, gameHistory, gameEnded]);

  useEffect(() => {
    const loadGameState = async () => {
      try {
        const savedState = await AsyncStorage.getItem('gameState');
        if (savedState) {
          const { players: savedPlayers, gameHistory: savedHistory, gameEnded: savedGameEnded } = JSON.parse(savedState);
          const playersWithStats = savedPlayers.map((player: Partial<Player>) => ({
            ...player,
            stats: player.stats || {
              gamesPlayed: 0,
              wins: 0,
              totalLifeGained: 0,
              totalLifeLost: 0,
              totalCommanderDamageDealt: 0,
              totalCommanderDamageReceived: 0,
              totalPoisonCountersGiven: 0,
              totalPoisonCountersReceived: 0
            }
          }));
          setPlayers(playersWithStats as Player[]);
          setGameHistory(savedHistory);
          setGameEnded(savedGameEnded);
        }
      } catch (error) {
        console.error('Failed to load game state', error);
      }
    };

    loadGameState();
  }, []);

  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      runTimer();
    } else if (!isTimerActive && timerInterval) {
      clearInterval(timerInterval);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isTimerActive, timerDuration]);

  const handleSignOut = async () => {
    const auth = firebase.auth();
    try {
      await signOut(auth);
      // The onAuthStateChanged listener in App.tsx will handle updating the UI
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const savePresetWithIds = async () => {
    if (presetName.trim() === '') return;

    const newPreset: Preset = {
      id: Date.now().toString(),
      name: presetName,
      players,
      gameState: null
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);

    try {
      await AsyncStorage.setItem('presets', JSON.stringify(updatedPresets));
      setPresetName('');
      setShowSavePresetModal(false);
    } catch (error) {
      console.error('Failed to save preset', error);
    }
  };

  const loadPresetByIds = (presetId: number | string) => {
    const preset = presets.find(p => p.id === presetId);

    if (preset) {
      setPlayers(preset.players);

      const currentPlayerFromPreset = preset.players.find(p => p.id === currentPlayer?.id);

      if (currentPlayerFromPreset) {
        setCurrentPlayer(currentPlayerFromPreset);
      }

      setShowPresetModal(false);
    }
  };

  const debouncedSyncGameState = useCallback(
    debounce((gameState) => {
      if (isMultiplayer && gameId) {
        updateGameState(gameId, {
          ...gameState,
          players: playersRef.current,
          gameHistory: gameHistoryRef.current,
        });
      }
    }, 300),
    [isMultiplayer, gameId]
  );

  const updateLocalState = (
    newPlayers: Player[],
    newGameHistory: string[],
    newGameEnded: boolean
  ) => {
    setPlayers(newPlayers);
    setGameHistory(newGameHistory);
    setGameEnded(newGameEnded);
  };

  const syncGameState = useCallback(() => {
    if (isMultiplayer && gameId) {
      updateGameState(gameId, {
        players,
        gameHistory,
        gameEnded
      });
    }
  }, [isMultiplayer, gameId, players, gameHistory, gameEnded]);


  function generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  const handleStartLocalGame = () => {
    setIsMultiplayer(false);
    setScreen('game');
  };

  const handleHostSession = () => {
    setScreen('multiplayerSetup');
  };

  const handleCreateGame = async () => {
    const hostId = generateUniqueId();
    const newGameId = await createGame(hostId);
    if (newGameId) {
      const newPlayer: Player = {
        id: hostId,
        name: 'Host',
        life: 40,
        manaColor: 'white',
        commanderDamage: 0,
        poisonCounters: 0,
        isDead: false,
        icon: 'https://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=0',
        hasCrown: false,
        stats: getDefaultStats(),
        isHost: true,
      };
      setPlayers([newPlayer]);
      setCurrentPlayer(newPlayer);
      handleGameStart(newGameId, true);
      setScreen('game');

      await updateGameState(newGameId, {
        players: [newPlayer],
        gameHistory: [],
        gameEnded: false
      });

      logEvent('Game created');
    } else {
      console.error('Failed to create game');
    }
  };

  const handleJoinGame = async (id: string) => {
    const playerId = generateUniqueId();
    const joined = await joinGame(id, playerId);
    if (joined) {
      setShowJoinPopup(true);
      handleGameStart(id, false);
      setScreen('game');
      setGameHistory([]);
      logEvent('Joined game');
    } else {
      console.error('Failed to join game');
    }
  };

  const handlePlayerJoin = async () => {
    if (newPlayerName.trim() && gameId) {
      const playerId = generateUniqueId();
      const newPlayer: Player = {
        id: playerId,
        name: newPlayerName,
        life: 40,
        manaColor: 'blue',
        commanderDamage: 0,
        poisonCounters: 0,
        isDead: false,
        icon: 'https://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=0',
        hasCrown: false,
        stats: getDefaultStats(),
        isHost: false,
      };
      setPlayers(prevPlayers => [...prevPlayers, newPlayer]);
      setCurrentPlayer(newPlayer);

      const updatedGameState = {
        players: [...players, newPlayer],
        gameHistory,
        gameEnded
      };
      await updateGameState(gameId, updatedGameState);

      setShowJoinPopup(false);
      setNewPlayerName('');
      logEvent(`${newPlayer.name} joined the game`);
    }
  };

  const handleOpponentPress = (opponent: Player) => {
    setSelectedOpponent(opponent);
  };

  const handleBack = async () => {
    setScreen('welcome');
    setIsMultiplayer(false);
    setGameId(null);
    setIsHost(false);
    setRoomCode(null);
    setCurrentPlayer(null);
    setPlayers([]);
    setGameHistory([]);
    setGameEnded(false);
    setShowJoinPopup(false);
    setNewPlayerName('');
    setSelectedOpponent(null);
    setShowSettings(null);
    setShowPresetModal(false);
    setShowSavePresetModal(false);
    setShowHistory(false);
    setShowGameTimer(false);
    setShowMiniTimer(false);
    setShowDiceRoller(false);
    setShowCardSearch(false);
    setTimerDuration(0);
    setIsTimerActive(false);
    setTimeLeft(0);
    setChangeBuffer({});
    setCurrentPreset(null);
    const updatedPresets = presets.map(p => ({ ...p, gameState: null }));
    setPresets(updatedPresets);
    try {
      await AsyncStorage.setItem('presets', JSON.stringify(updatedPresets));
    } catch (error) {
      console.error('Failed to reset presets', error);
    }
  };

  const processEventQueue = useCallback(() => {
    if (eventQueueRef.current.length > 0) {
      const event = eventQueueRef.current.shift();
      if (event) {
        setGameHistory(prevHistory => {
          const history = Array.isArray(prevHistory) ? prevHistory : [];
          return [...history, `[${new Date().toLocaleTimeString()}] ${event}`];
        });
      }
      setTimeout(processEventQueue, 0);
    }
  }, []);

  const logEvent = useCallback((event: string) => {
    if (event === undefined) {
      console.warn('Attempted to log undefined event');
      return;
    }
    console.log('Logging event:', event);
    setGameHistory(prevHistory => {
      const history = Array.isArray(prevHistory) ? prevHistory : [];
      const newHistory = [...history, `[${new Date().toLocaleTimeString()}] ${event}`];
      console.log('New game history:', newHistory);
      return newHistory;
    });
  }, []);

  const handleGameStart = (newGameId: string | null, host: boolean) => {
    if (newGameId) {
      setGameId(newGameId);
      setIsHost(host);
      setIsMultiplayer(true);
      setRoomCode(newGameId);
    } else {
      setIsMultiplayer(false);
      setGameId(null);
      setIsHost(false);
      setRoomCode(null);
    }
  };

  const savePreset = async () => {
    if (presetName.trim() === '') return;

    const newPreset: Preset = {
      id: Date.now().toString(),
      name: presetName,
      players: players.map(p => ({
        ...p,
        life: 40,
        commanderDamage: 0,
        poisonCounters: 0,
        isDead: false,
        stats: p.stats || getDefaultStats()
      })),
      gameState: null
    };
    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    try {
      await AsyncStorage.setItem('presets', JSON.stringify(updatedPresets));
      setPresetName('');
      setShowSavePresetModal(false);
    } catch (error) {
      console.error('Failed to save preset', error);
    }
  };

  const editPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setPresetName(preset.name);
      setCurrentPreset(preset);
      setShowSavePresetModal(true);
    }
  };

  const deletePreset = async (presetId: string) => {
    const updatedPresets = presets.filter(p => p.id !== presetId);
    setPresets(updatedPresets);
    try {
      await AsyncStorage.setItem('presets', JSON.stringify(updatedPresets));
    } catch (error) {
      console.error('Failed to delete preset', error);
    }
  };

  const loadPreset = (preset: Preset) => {
    if (preset.gameState) {
      setPlayers(preset.gameState.players);
      setGameHistory(preset.gameState.gameHistory);
      setGameEnded(preset.gameState.gameEnded);
    } else {
      setPlayers(preset.players.map(p => ({
        ...p,
        life: 40,
        commanderDamage: 0,
        poisonCounters: 0,
        isDead: false,
        stats: p.stats || getDefaultStats()
      })));
      setGameHistory([]);
      setGameEnded(false);
    }
    setCurrentPreset(preset);
    setShowPresetModal(false);
  };

  const getDefaultStats = () => ({
    gamesPlayed: 0,
    wins: 0,
    totalLifeGained: 0,
    totalLifeLost: 0,
    totalCommanderDamageDealt: 0,
    totalCommanderDamageReceived: 0,
    totalPoisonCountersGiven: 0,
    totalPoisonCountersReceived: 0,
  });

  const saveCurrentGameState = async () => {
    if (currentPreset) {
      const updatedPreset = {
        ...currentPreset,
        players: players,
        gameState: {
          players,
          gameHistory,
          gameEnded
        }
      };
      const updatedPresets = presets.map(p => p.id === updatedPreset.id ? updatedPreset : p);
      setPresets(updatedPresets);
      setCurrentPreset(updatedPreset);
      try {
        await AsyncStorage.setItem('presets', JSON.stringify(updatedPresets));
        logEvent("Current game state saved.");
      } catch (error) {
        console.error('Failed to save current game state', error);
      }
    } else {
      const newPreset: Preset = {
        id: Date.now().toString(),
        name: `Game ${Date.now()}`,
        players: players,
        gameState: {
          players,
          gameHistory,
          gameEnded
        }
      };
      const updatedPresets = [...presets, newPreset];
      setPresets(updatedPresets);
      setCurrentPreset(newPreset);
      try {
        await AsyncStorage.setItem('presets', JSON.stringify(updatedPresets));
        logEvent("New preset created with current game state.");
      } catch (error) {
        console.error('Failed to save new preset', error);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const eventQueueRef = useRef<string[]>([]);

  const logBufferedChanges = () => {
    Object.entries(changeBuffer).forEach(([playerId, changes]) => {
      const player = players.find(p => p.id === String(playerId));
      if (player) {
        Object.entries(changes).forEach(([changeType, amount]) => {
          if (amount !== 0) {
            const action = amount > 0 ? 'gained' : 'lost';
            const absAmount = Math.abs(amount);
            switch (changeType) {
              case 'life':
                logEvent(`${player.name} ${action} ${absAmount} life. New total: ${player.life}`);
                break;
              case 'commanderDamage':
                logEvent(`${player.name} received ${absAmount} commander damage. Total: ${player.commanderDamage}`);
                break;
              case 'poisonCounters':
                logEvent(`${player.name} ${action} ${absAmount} poison counters. Total: ${player.poisonCounters}`);
                break;
            }
          }
        });
      }
    });
    setChangeBuffer({});
  };

  const bufferChange = (playerId: number | string, changeType: string, amount: number) => {
    setChangeBuffer(prev => {
      const playerBuffer = prev[playerId] || {};
      return {
        ...prev,
        [playerId]: {
          ...playerBuffer,
          [changeType]: (playerBuffer[changeType] || 0) + amount
        }
      };
    });
  };

  const handleLifeChange = (playerId: string, amount: number) => {
    setPlayers(prevPlayers => {
      const newPlayers = prevPlayers.map(p => {
        if (p.id === playerId) {
          const newLife = Math.max(0, p.life + amount);
          const isDead = newLife <= 0;
          if (isDead && !p.isDead) {
            logEvent(`${p.name} has been eliminated!`);
          }
          return { ...p, life: newLife, isDead };
        }
        return p;
      });

      const updatedPlayer = newPlayers.find(p => p.id === playerId);
      if (updatedPlayer) {
        const event = `${updatedPlayer.name} ${amount > 0 ? 'gained' : 'lost'} ${Math.abs(amount)} life. New total: ${updatedPlayer.life}`;
        logEvent(event);

        if (isMultiplayer && gameId) {
          updateGameState(gameId, {
            players: newPlayers,
            gameHistory: [...gameHistoryRef.current, `[${new Date().toLocaleTimeString()}] ${event}`],
            gameEnded
          });
        }
      }

      if (currentPlayer && currentPlayer.id === playerId) {
        setCurrentPlayer(updatedPlayer || currentPlayer);
      }

      checkGameEnd(newPlayers);
      return newPlayers;
    });
  };

  const handleCommanderDamageChange = (playerId: string, amount: number) => {
    setPlayers(prevPlayers => {
      const newPlayers = prevPlayers.map(p => {
        if (p.id === playerId) {
          const newCommanderDamage = Math.max(0, p.commanderDamage + amount);
          const newLife = Math.max(0, p.life - amount);
          const isDead = newLife <= 0 || newCommanderDamage >= 21;
          if (isDead && !p.isDead) {
            logEvent(`${p.name} has been eliminated by commander damage!`);
          }
          return { ...p, commanderDamage: newCommanderDamage, life: newLife, isDead };
        }
        return p;
      });

      const updatedPlayer = newPlayers.find(p => p.id === playerId);
      if (updatedPlayer) {
        const event = `${updatedPlayer.name} received ${amount} commander damage. New total: ${updatedPlayer.commanderDamage}`;
        logEvent(event);

        if (isMultiplayer && gameId) {
          updateGameState(gameId, {
            players: newPlayers,
            gameHistory: [...gameHistoryRef.current, `[${new Date().toLocaleTimeString()}] ${event}`],
            gameEnded
          });
        }
      }

      if (currentPlayer && currentPlayer.id === playerId) {
        setCurrentPlayer(updatedPlayer || currentPlayer);
      }

      checkGameEnd(newPlayers);
      return newPlayers;
    });
  };

  const handlePoisonCountersChange = (playerId: string, amount: number) => {
    setPlayers(prevPlayers => {
      const newPlayers = prevPlayers.map(p => {
        if (p.id === playerId) {
          const newPoisonCounters = Math.max(0, p.poisonCounters + amount);
          const isDead = newPoisonCounters >= 10;
          if (isDead && !p.isDead) {
            logEvent(`${p.name} has been eliminated by poison!`);
          }
          return { ...p, poisonCounters: newPoisonCounters, isDead };
        }
        return p;
      });

      const updatedPlayer = newPlayers.find(p => p.id === playerId);
      if (updatedPlayer) {
        const event = `${updatedPlayer.name} ${amount > 0 ? 'received' : 'removed'} ${Math.abs(amount)} poison counter${Math.abs(amount) !== 1 ? 's' : ''}. New total: ${updatedPlayer.poisonCounters}`;
        logEvent(event);

        if (isMultiplayer && gameId) {
          updateGameState(gameId, {
            players: newPlayers,
            gameHistory: [...gameHistoryRef.current, `[${new Date().toLocaleTimeString()}] ${event}`],
            gameEnded
          });
        }
      }

      if (currentPlayer && currentPlayer.id === playerId) {
        setCurrentPlayer(updatedPlayer || currentPlayer);
      }

      checkGameEnd(newPlayers);
      return newPlayers;
    });
  };

  const getPlayerContainerStyle = (totalPlayers: number, index: number) => {
    if (totalPlayers === 1) return 'w-full aspect-[3/4]';
    if (totalPlayers === 2) return 'w-1/2 aspect-[3/4]';
    if (totalPlayers === 3) return index === 2 ? 'w-full aspect-[3/4]' : 'w-1/2 aspect-[3/4]';
    return 'w-1/2 aspect-[3/4]';
  };

  const addPlayer = () => {
    if (players.length < 4) {
      const manaColors = ['white', 'blue', 'black', 'red', 'green'];
      const newPlayer: Player = {
        id: (players.length + 1).toString(),
        name: `Player ${players.length + 1}`,
        life: 40,
        manaColor: manaColors[players.length % manaColors.length],
        commanderDamage: 0,
        poisonCounters: 0,
        isDead: false,
        icon: 'https://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=0',
        hasCrown: false,
        stats: getDefaultStats(),
        isHost: false
      };
      setPlayers([...players, newPlayer]);
      logEvent(`${newPlayer.name} has joined the game.`);
      setIsMultiplayer(true);
      setRoomCode(gameId);
    }
    syncGameState();
  };

  const removePlayer = (playerId: number | string) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      setPlayers(players.filter(p => p.id !== playerId));
      logEvent(`${player.name} has been removed from the game.`);
    }
    syncGameState();
  };

  const handleTimeUp = () => {
    logEvent("Time's up!");
    blinkMiniTimer();
    if (timerInterval) clearInterval(timerInterval);
    setIsTimerActive(false);
  };

  const blinkMiniTimer = () => {
    Animated.sequence([
      Animated.timing(miniTimerOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(miniTimerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(miniTimerOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(miniTimerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start(() => setShowMiniTimer(false));
  };

  const runTimer = () => {
    if (timerInterval) clearInterval(timerInterval);

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          setIsTimerActive(false);
          handleTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    setTimerInterval(interval);
  };

  const handleDiceRoll = (result: number) => {
    logEvent(`Dice roll result: ${result}`);
  };

  const resetGame = async () => {
    const resetPlayers = players.map(player => ({
      ...player,
      life: 40,
      commanderDamage: 0,
      poisonCounters: 0,
      isDead: false,
      hasCrown: false
    }));

    const newGameHistory = ["Game has been reset. New game starting!"];

    setPlayers(resetPlayers);
    setGameEnded(false);
    setGameHistory(newGameHistory);

    if (currentPlayer) {
      const updatedCurrentPlayer = resetPlayers.find(p => p.id === currentPlayer.id);
      if (updatedCurrentPlayer) {
        setCurrentPlayer(updatedCurrentPlayer);
      }
    }

    if (isMultiplayer && gameId) {
      await updateGameState(gameId, {
        players: resetPlayers,
        gameHistory: newGameHistory,
        gameEnded: false
      });
    }

    if (currentPreset) {
      const updatedPreset = {
        ...currentPreset,
        players: resetPlayers,
        gameState: null
      };
      const updatedPresets = presets.map(p => p.id === updatedPreset.id ? updatedPreset : p);
      setPresets(updatedPresets);
      setCurrentPreset(updatedPreset);
      try {
        await AsyncStorage.setItem('presets', JSON.stringify(updatedPresets));
      } catch (error) {
        console.error('Failed to save reset game state', error);
      }
    }
  };

  const updatePlayer = (updatedPlayer: Player) => {
    setPlayers(prevPlayers => {
      const newPlayers = prevPlayers.map(p => p.id === updatedPlayer.id ? updatedPlayer : p);
      if (isMultiplayer && gameId) {
        updateGameState(gameId, {
          players: newPlayers,
          gameHistory: gameHistory ? [...gameHistory, `${updatedPlayer.name}'s information has been updated.`] : [`${updatedPlayer.name}'s information has been updated.`],
          gameEnded
        });
      }
      return newPlayers;
    });

    if (currentPlayer && currentPlayer.id === updatedPlayer.id) {
      setCurrentPlayer(updatedPlayer);
    }

    logEvent(`${updatedPlayer.name}'s information has been updated.`);
  };

  const handleGameEnd = useCallback(async (winnerId: string) => {
    if (gameEnded) return;

    const winner = players.find(p => p.id === winnerId);
    if (winner) {
      console.log('Handling game end. Winner:', winner.name);
      const winEvent = `${winner.name} has won the game!`;
      const updatedPlayers = players.map(p => {
        const playerStats = p.stats || getDefaultStats();
        return {
          ...p,
          hasCrown: p.id === winnerId,
          isDead: p.id !== winnerId,
          stats: {
            ...playerStats,
            gamesPlayed: playerStats.gamesPlayed + 1,
            wins: p.id === winnerId ? playerStats.wins + 1 : playerStats.wins,
            totalLifeGained: playerStats.totalLifeGained + (p.life > 40 ? p.life - 40 : 0),
            totalLifeLost: playerStats.totalLifeLost + (p.life < 40 ? 40 - p.life : 0),
            totalCommanderDamageDealt: playerStats.totalCommanderDamageDealt + p.commanderDamage,
            totalCommanderDamageReceived: playerStats.totalCommanderDamageReceived + (p.life <= 0 && p.commanderDamage >= 21 ? 21 : 0),
            totalPoisonCountersGiven: playerStats.totalPoisonCountersGiven + p.poisonCounters,
            totalPoisonCountersReceived: playerStats.totalPoisonCountersReceived + (p.life <= 0 && p.poisonCounters >= 10 ? 10 : 0),
          }
        };
      });
      logEvent(winEvent);
      const updatedGameHistory = [...gameHistory, `[${new Date().toLocaleTimeString()}] ${winEvent}`];

      const newGameState = {
        players: updatedPlayers,
        gameHistory: updatedGameHistory,
        gameEnded: true
      };

      // Update local state
      setPlayers(updatedPlayers);
      setGameHistory(updatedGameHistory);
      setGameEnded(true);

      // Update Firebase state
      if (isMultiplayer && gameId) {
        await updateGameState(gameId, newGameState);
      }

      if (currentPreset) {
        const updatedPreset = {
          ...currentPreset,
          players: updatedPlayers,
          gameState: null
        };
        const updatedPresets = presets.map(p => p.id === updatedPreset.id ? updatedPreset : p);
        setPresets(updatedPresets);
        setCurrentPreset(updatedPreset);
        try {
          await AsyncStorage.setItem('presets', JSON.stringify(updatedPresets));
        } catch (error) {
          console.error('Failed to save updated preset', error);
        }
      }

      try {
        await AsyncStorage.setItem('gameState', JSON.stringify(newGameState));
      } catch (error) {
        console.error('Failed to save game state', error);
      }

      logEvent(winEvent);
    }
    syncGameState();
  }, [players, gameEnded, currentPreset, presets, gameHistory, isMultiplayer, gameId, logEvent, getDefaultStats]);

  const updatePlayersAndCheckEnd = useCallback(() => {
    setPlayers(prevPlayers => {
      const alivePlayers = prevPlayers.filter(p => !p.isDead); -
        console.log('Checking game end. Alive players:', alivePlayers.length);
      if (prevPlayers.length > 1 && alivePlayers.length === 1 && !gameEnded) {
        console.log('Game should end. Winner:', alivePlayers[0].name);
        handleGameEnd(alivePlayers[0].id);
      }
      return prevPlayers;
    });
  }, [gameEnded, handleGameEnd]);


  const checkGameEnd = useCallback((currentPlayers: Player[]) => {
    if (gameEnded) return;

    const alivePlayers = currentPlayers.filter(p => !p.isDead);
    console.log('Checking game end. Alive players:', alivePlayers.length);

    if (currentPlayers.length > 1 && alivePlayers.length === 1) {
      console.log('Game should end. Winner:', alivePlayers[0].name);
      handleGameEnd(alivePlayers[0].id);
    }
  }, [gameEnded, handleGameEnd]);

  const actionItems: Array<{
    icon: IoniconsName;
    color: string;
    onPress: () => void;
    disabled?: boolean;
  }> = [
      { icon: 'person-add', color: 'blue-400', onPress: addPlayer, disabled: gameEnded || players.length >= 4 },
      { icon: 'refresh', color: 'red-400', onPress: resetGame },
      { icon: 'clipboard', color: 'yellow-400', onPress: () => setShowPresetModal(true) },
      { icon: 'list', color: 'orange-400', onPress: () => setShowHistory(true) },
      { icon: 'save-outline', color: 'green-400', onPress: saveCurrentGameState },
      { icon: 'search', color: 'purple-400', onPress: () => setShowCardSearch(true) },
      { icon: 'dice', color: 'pink-400', onPress: () => setShowDiceRoller(true) },
      { icon: 'timer', color: 'indigo-400', onPress: () => setShowGameTimer(true) },
    ];

  const AccountButton = () => (
    <Pressable
      style={tw`absolute top-4 right-4 z-10`}
      onPress={() => setShowAccount(true)}
    >
      <Ionicons name="ellipsis-horizontal" size={24} color="#60A5FA" />
    </Pressable>
  );

  return (
    <View style={tw`flex-1 bg-gray-900 pt-12`}>
      <AccountButton />
      {(screen as 'welcome' | 'multiplayerSetup' | 'game') === 'welcome' && (
        <WelcomeScreen
          onStartLocalGame={handleStartLocalGame}
          onHostSession={handleHostSession}
        />
      )}
      {(screen as 'welcome' | 'multiplayerSetup' | 'game') === 'multiplayerSetup' && (
        <MultiplayerSetup
          onCreateGame={handleCreateGame}
          onJoinGame={handleJoinGame}
          onBack={handleBack}
        />
      )}
      {(screen as 'welcome' | 'multiplayerSetup' | 'game') === 'game' && (
        <>
          <Pressable onPress={handleBack} style={tw`ml-6 mb-4`}>
            <Ionicons name="arrow-back-circle-sharp" size={38} color="#60A5FA" />
          </Pressable>
          {roomCode && <RoomCodeDisplay roomCode={roomCode} />}
          {showMiniTimer && (
            <Animated.View style={[tw`absolute top-4 right-4 bg-gray-800 p-2 rounded-lg`, { opacity: miniTimerOpacity }]}>
              <Text style={tw`text-white font-bold`}>{formatTime(timeLeft)}</Text>
            </Animated.View>
          )}
          {isMultiplayer && currentPlayer ? (
            <View key={currentPlayer.id} style={tw`w-full aspect-[3/4]`}>
              <PlayerComponent
                player={currentPlayer}
                onLifeChange={(amount) => handleLifeChange(currentPlayer.id, amount)}
                onCommanderDamageChange={(amount) => handleCommanderDamageChange(currentPlayer.id, amount)}
                onPoisonCountersChange={(amount) => handlePoisonCountersChange(currentPlayer.id, amount)}
                onSettingsPress={() => setShowSettings(currentPlayer.id)}
                onRemove={() => removePlayer(currentPlayer.id)}
                disabled={gameEnded || currentPlayer.isDead}
              />
              <OpponentsSection
                opponents={players.filter(p => p.id !== currentPlayer.id)}
                onOpponentPress={handleOpponentPress}
              />
            </View>
          ) : (
            <View style={tw`flex-1 flex-row flex-wrap justify-center items-stretch p-2`}>
              {players.map((player, index) => (
                <View key={player.id} style={tw`${getPlayerContainerStyle(players.length, index)}`}>
                  <PlayerComponent
                    player={player}
                    onLifeChange={(amount) => {
                      handleLifeChange(player.id, amount);
                      updatePlayersAndCheckEnd();
                    }}
                    onCommanderDamageChange={(amount) => {
                      handleCommanderDamageChange(player.id, amount);
                      updatePlayersAndCheckEnd();
                    }}
                    onPoisonCountersChange={(amount) => {
                      handlePoisonCountersChange(player.id, amount);
                      updatePlayersAndCheckEnd();
                    }}
                    onSettingsPress={() => setShowSettings(player.id)}
                    onRemove={() => removePlayer(player.id)}
                    disabled={gameEnded || player.isDead}
                  />
                </View>
              ))}
            </View>
          )}
          <View style={tw`flex-row justify-center p-4 bg-gray-800 rounded-t-2xl`}>
            {actionItems.map((item, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => tw`mx-2 p-2 ${pressed ? 'bg-gray-700' : 'bg-gray-800'} rounded-full`}
                onPress={item.onPress}
                disabled={item.disabled}
              >
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={item.disabled ? '#4B5563' : tw.color(item.color)}
                />
              </Pressable>
            ))}
          </View>

          <PlayerSettings
            visible={showSettings !== null}
            player={players.find(p => p.id === showSettings) || null}
            onUpdate={(updatedPlayer) => {
              if (updatedPlayer) {
                updatePlayer(updatedPlayer);
              }
              setShowSettings(null);
            }}
            onClose={() => setShowSettings(null)}
          />

          <Account visible={showAccount} onClose={() => setShowAccount(false)} />

          {/* Preset Modal */}
          <Modal visible={showPresetModal} animationType="slide" transparent={true}>
            <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
              <View style={tw`bg-white p-4 rounded-lg w-4/5`}>
                <Text style={tw`text-lg font-bold mb-2`}>Presets</Text>
                {presets.map(preset => (
                  <View key={preset.id} style={tw`flex-row items-center justify-between mb-2`}>
                    <Pressable
                      style={tw`flex-1 bg-blue-100 p-2 rounded mr-2`}
                      onPress={() => loadPreset(preset)}
                    >
                      <Text>{preset.name}</Text>
                    </Pressable>
                    <Pressable onPress={() => editPreset(preset.id)}>
                      <Ionicons name="pencil" size={24} color="blue" />
                    </Pressable>
                    <Pressable onPress={() => deletePreset(preset.id)}>
                      <Ionicons name="trash" size={24} color="red" />
                    </Pressable>
                  </View>
                ))}
                <Pressable
                  style={tw`bg-green-500 p-2 rounded mt-2`}
                  onPress={() => setShowSavePresetModal(true)}
                >
                  <Text style={tw`text-white text-center`}>Save Current as Preset</Text>
                </Pressable>
                <Pressable
                  style={tw`bg-red-500 p-2 rounded mt-2`}
                  onPress={() => setShowPresetModal(false)}
                >
                  <Text style={tw`text-white text-center`}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          {/* Save Preset Modal */}
          <Modal visible={showSavePresetModal} animationType="slide" transparent={true}>
            <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
              <View style={tw`bg-white p-4 rounded-lg w-4/5`}>
                <TextInput
                  style={tw`border border-gray-300 rounded p-2 mb-4`}
                  value={presetName}
                  onChangeText={setPresetName}
                  placeholder="Enter preset name"
                />
                <Pressable onPress={savePreset} style={tw`bg-blue-500 p-2 rounded mb-2`}>
                  <Text style={tw`text-white text-center font-bold`}>Save Preset</Text>
                </Pressable>
                <Pressable onPress={() => setShowSavePresetModal(false)} style={tw`bg-red-500 p-2 rounded`}>
                  <Text style={tw`text-white text-center font-bold`}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          <Modal visible={showDiceRoller} animationType="slide" transparent={true}>
            <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
              <View style={tw`bg-white p-4 rounded-lg w-4/5`}>
                <DiceRoller onRoll={handleDiceRoll} />
                <Pressable
                  style={tw`bg-red-500 p-2 rounded mt-4`}
                  onPress={() => setShowDiceRoller(false)}
                >
                  <Text style={tw`text-white text-center font-bold`}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          {/* Game Timer Modal */}
          <Modal visible={showGameTimer} animationType="slide" transparent={true}>
            <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
              <View style={tw`bg-white p-4 rounded-lg w-4/5`}>
                <GameTimer
                  onTimeUp={handleTimeUp}
                  duration={timerDuration}
                  timeLeft={timeLeft}
                  isActive={isTimerActive}
                  onDurationChange={(newDuration) => {
                    setTimerDuration(newDuration);
                    setTimeLeft(newDuration);
                    setShowMiniTimer(true);
                  }}
                  onActiveChange={(active) => {
                    setIsTimerActive(active);
                    setShowMiniTimer(true);
                  }}
                />
                <Pressable
                  style={tw`bg-red-500 p-2 rounded mt-4`}
                  onPress={() => {
                    setShowGameTimer(false);
                    setShowMiniTimer(true);
                  }}
                >
                  <Text style={tw`text-white text-center font-bold`}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          <Modal visible={showJoinPopup} animationType="slide" transparent={true}>
            <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
              <View style={tw`bg-white p-4 rounded-lg w-4/5`}>
                <Text style={tw`text-lg font-bold mb-2`}>Enter Your Name</Text>
                <TextInput
                  style={tw`border border-gray-300 rounded p-2 mb-4`}
                  value={newPlayerName}
                  onChangeText={setNewPlayerName}
                  placeholder="Your Name"
                />
                <Pressable
                  onPress={handlePlayerJoin}
                  style={tw`bg-blue-500 p-2 rounded`}
                >
                  <Text style={tw`text-white text-center font-bold`}>Join Game</Text>
                </Pressable>
              </View>
            </View>
          </Modal>


          <Modal visible={!!selectedOpponent} animationType="slide" transparent={true}>
            <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
              <View style={tw`bg-white p-4 rounded-lg w-4/5`}>
                {selectedOpponent && (
                  <PlayerComponent
                    player={players.find(p => p.id === selectedOpponent.id) || selectedOpponent}
                    isSmall={false}
                    disabled={true}
                  />
                )}
                <Pressable
                  style={tw`bg-blue-500 p-2 rounded mt-4`}
                  onPress={() => setSelectedOpponent(null)}
                >
                  <Text style={tw`text-white text-center font-bold`}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          <GameHistory
            visible={showHistory}
            history={gameHistory}
            onClose={() => setShowHistory(false)}
          />

          <CardSearch
            visible={showCardSearch}
            onClose={() => setShowCardSearch(false)}
          />
        </>
      )}
    </View>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authScreen, setAuthScreen] = useState<'signIn' | 'signUp' | 'passwordReset'>('signIn');

  const initializeFonts = useCallback(async () => {
    await loadFonts();
    setFontsLoaded(true);
  }, []);

  useEffect(() => {
    initializeFonts();
  }, [initializeFonts]);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!fontsLoaded) {
    return <View style={tw`flex-1 justify-center items-center`}><Text>Loading...</Text></View>;
  }

  const handleSignIn = (user: User) => {
    setUser(user);
  };

  const handleSignUp = (user: User) => {
    setUser(user);
  };

  const handlePasswordReset = () => {
    setAuthScreen('signIn');
  };

  const handleSwitchToSignUp = () => setAuthScreen('signUp');
  const handleSwitchToSignIn = () => setAuthScreen('signIn');
  const handleSwitchToPasswordReset = () => setAuthScreen('passwordReset');

  if (!user) {
    switch (authScreen) {
      case 'signUp':
        return (
          <SignUp
            onSignUp={handleSignUp}
            onSwitchToSignIn={handleSwitchToSignIn}
          />
        );
      case 'passwordReset':
        return (
          <PasswordReset
            onResetSuccess={handlePasswordReset}
            onSwitchToSignIn={handleSwitchToSignIn}
          />
        );
      default:
        return (
          <SignIn
            onSignIn={handleSignIn}
            onSwitchToSignUp={handleSwitchToSignUp}
            onSwitchToResetPassword={handleSwitchToPasswordReset}
          />
        );
    }
  }

  return <MainContent user={user} />;
}