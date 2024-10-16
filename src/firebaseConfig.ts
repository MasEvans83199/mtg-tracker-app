import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBEccP4qO_lc-A9eXdgaza5P4QIusgAA_o",
  authDomain: "mtg-life-counter-7fba4.firebaseapp.com",
  projectId: "mtg-life-counter-7fba4",
  storageBucket: "mtg-life-counter-7fba4.appspot.com",
  messagingSenderId: "585307040716",
  appId: "1:585307040716:web:14666169eb078e15838b69",
  measurementId: "G-282DCN3CCD",
  databaseURL: "https://mtg-life-counter-7fba4-default-rtdb.firebaseio.com"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.database();

export default firebase;
