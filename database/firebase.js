const firebase = require('firebase-admin');
const logger = require('../logger');

const firebaseConfigJson = Buffer.from(process.env.FIREBASE_CONFIG_B64, 'base64').toString('utf-8');
const firebaseConfig = JSON.parse(firebaseConfigJson);

firebase.initializeApp({
  credential: firebase.credential.cert(firebaseConfig),
});

const db = firebase.firestore();

async function getUsers() {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    logger.debug('Getting users list from firebase:', users);
    return users;
  } catch (error) {
    logger.error("Error getting users:", error);
  }
}

async function setUser(userId, userData) {
  try {
    await db.collection('users').doc(userId).set(userData);
    logger.debug("Added user with id:", userId);
  } catch (error) {
    logger.error("Error setting user:", error);
  }
}

module.exports = { getUsers, setUser };
