// Import the functions you need from the SDKs you need
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBxNDoaKNiw5TGvI6xXI9Resjz2oqs7Vsc",
  authDomain: "two-cents-c71ab.firebaseapp.com",
  projectId: "two-cents-c71ab",
  storageBucket: "two-cents-c71ab.firebasestorage.app",
  messagingSenderId: "849155365583",
  appId: "1:849155365583:web:55fa693389d9e5fdd2b5ba",
  measurementId: "G-DK6EQYJDQF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const firestore = getFirestore(app);