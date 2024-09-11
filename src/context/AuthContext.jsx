import { auth } from "../firebase/firebase-config.js";
import React, { createContext, useContext } from "react";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut 
} from "firebase/auth";

// Crear el contexto
export const authContext = createContext();

// Hook para acceder al contexto
export const useAuth = () => {
    const context = useContext(authContext);
    if (!context) {
        console.log("Error creando auth context");
    }
    return context;
};

// Proveedor de contexto
export function AuthProvider({ children }) {
    const register = async (email, password) => {
        const response = await createUserWithEmailAndPassword(auth, email, password);
        console.log(response);
    };

    const login = async (email, password) => {
        const response = await signInWithEmailAndPassword(auth, email, password);
        console.log(response);
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    const logout = async () => {
        const responseOut = await signOut(auth);
        console.log(responseOut);
    };

    // Aquí pasamos un objeto en lugar de un array
    return (
        <authContext.Provider value={{ register, login, loginWithGoogle, logout }}>
            {children}
        </authContext.Provider>
    );
}
