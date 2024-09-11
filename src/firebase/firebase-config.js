// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyAC_30Oles6X8WoEKyS4GAg0uLCRXPeboQ",
  authDomain: "ot-mantos-inst.firebaseapp.com",
  projectId: "ot-mantos-inst",
  storageBucket: "ot-mantos-inst.appspot.com",
  messagingSenderId: "408405544999",
  appId: "1:408405544999:web:f111aeb56d6bf3491c7e02",
  measurementId: "G-5548CW7PE9"
};

// Use this to initialize the firebase App
// Inicializa Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)

export default app;