const firebase = require('firebase-admin');
const logger = require('../logger');

const firebaseConfigJson = Buffer.from(process.env.FIREBASE_CONFIG_B64, 'base64').toString('utf-8');
const firebaseConfig = JSON.parse(firebaseConfigJson);

firebase.initializeApp({
  credential: firebase.credential.cert(firebaseConfig),
});

const db = firebase.firestore();
const usersCache = {};

async function loadUserCache() {
  // Load users cache
  try {
    const usersSnapshot = await db.collection('users').get();
    usersSnapshot.docs.forEach(doc => {
      usersCache[doc.id] = doc.data();
    });
    logger.debug(`Loaded ${usersSnapshot.size} users into cache`);
  } catch (error) {
    logger.error('Error loading users cache from firebase:', error);
  }
}

function getUsersList() {
  return usersCache;
}

async function getUser(userId) {
  try {
    // Check if user is in cache
    if (usersCache[userId]) {
      logger.debug(`Getting user ${userId} from cache:`, usersCache[userId]);
      return usersCache[userId];
    }

    // Get user from firebase
    const user = await db.collection('users').doc(userId).get();
    if (!user.exists) {
      logger.debug(`User ${userId} not found in firebase`);
      return null;
    }

    usersCache[userId] = user.data();
    logger.debug(`Getting user ${userId} from firebase:`, user.data());
    return user.data();
  } catch (error) {
    logger.error(`Error getting user ${userId} from firebase:`, error);
    throw error;
  }
}

async function setUser(userId, data) {
  try {
    await db.collection('users').doc(userId).set(data, { merge: true });
    usersCache[userId] = data;
    logger.debug(`User ${userId} data updated in firebase:`, data);
  } catch (error) {
    logger.error(`Error updating user ${userId} data in firebase:`, error);
    throw error;
  }
}

module.exports = { loadUserCache, getUsersList, getUser, setUser };
