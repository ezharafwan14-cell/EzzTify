import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyDS4Ct3k_ZsaYMkDy97ZaDO4Ikw9cPfgP4",
    authDomain: "ezztify.firebaseapp.com",
    projectId: "ezztify",
    storageBucket: "ezztify.firebasestorage.app",
    messagingSenderId: "1007263884841",
    appId: "1:1007263884841:web:15136f272cf2e9e3211e38"
};


const app = initializeApp(firebaseConfig);


/*
    FIRESTORE
*/

export const db = getFirestore(app);