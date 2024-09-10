// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAC_30Oles6X8WoEKyS4GAg0uLCRXPeboQ",
  authDomain: "ot-mantos-inst.firebaseapp.com",
  projectId: "ot-mantos-inst",
  storageBucket: "ot-mantos-inst.appspot.com",
  messagingSenderId: "408405544999",
  appId: "1:408405544999:web:f111aeb56d6bf3491c7e02",
  measurementId: "G-5548CW7PE9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;