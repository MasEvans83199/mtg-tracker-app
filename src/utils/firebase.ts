import firebase from '../firebaseConfig';
const db = firebase.database();

export const createGame = async (hostId: string): Promise<string | null> => {
  const gameRef = db.ref('games').push();
  const gameId = gameRef.key;
  await gameRef.set({
    hostId,
    players: {},
    gameState: null,
  });
  return gameId;
};

export const joinGame = async (gameId: string, playerId: string): Promise<boolean> =>  {
  const gameRef = db.ref(`games/${gameId}`);
  const snapshot = await gameRef.once('value');
  if (snapshot.exists()) {
    await gameRef.child('players').update({ [playerId]: true });
    return true;
  }
  return false;
};

export const updateGameState = async (gameId: string, gameState: any) => {
  if (!gameId || !gameState) {
      console.error('Invalid gameId or gameState');
      return;
  }

  let sanitizedGameHistory = [];
  
  if (gameState.gameHistory && Array.isArray(gameState.gameHistory)) {
      sanitizedGameHistory = gameState.gameHistory.filter((event: any) => event !== undefined && event !== null);
  }

  const sanitizedGameState = {
      players: gameState.players || [],
      gameHistory: sanitizedGameHistory,
      gameEnded: gameState.gameEnded || false,
      hostLeft: gameState.hostLeft || false
  };

  try {
      await db.ref(`games/${gameId}/gameState`).set(sanitizedGameState);
  } catch (error) {
      console.error('Error updating game state:', error);
      throw error;
  }
}

export const listenToGameState = (gameId: string, callback: (gameState: any) => void) => {
  const gameRef = db.ref(`games/${gameId}/gameState`);
  gameRef.on('value', (snapshot) => {
    const gameState = snapshot.val();
    if (gameState) {
      callback(gameState);
    }
  });
  return () => gameRef.off('value');
};
