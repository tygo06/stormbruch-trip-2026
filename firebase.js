import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCNUQezBo6Ppxb6vq8FYGbuLObrpaFuIhE",
  authDomain: "stormbruchtrip.firebaseapp.com",
  projectId: "stormbruchtrip",
  storageBucket: "stormbruchtrip.firebasestorage.app",
  messagingSenderId: "650327927334",
  appId: "1:650327927334:web:e9e160e51028cdc40c14e7",
  measurementId: "G-82N93VPX5Q"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);