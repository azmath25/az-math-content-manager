// shared/js/firebase-config.js
// Centralized Firebase configuration

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCYrw8aLDGtbKXdou7YweLVBKLFXHyl9SM",
  authDomain: "az-math.firebaseapp.com",
  projectId: "az-math",
  storageBucket: "az-math.firebasestorage.app",
  messagingSenderId: "49046309945",
  appId: "1:49046309945:web:a3be9525705860c75191e8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

console.log('✓ Firebase initialized');
