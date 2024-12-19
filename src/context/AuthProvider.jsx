import { useState, useEffect, createContext, useContext } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router";

const provider = new GoogleAuthProvider();

const authContext = createContext();

export function useAuth() {
    return useContext(authContext);
}

function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(undefined);
    const navigate = useNavigate();

    // Actualizar el estado de la sesión en tiempo real
    useEffect(() => {
        onAuthStateChanged(auth, usuario => {
            if (usuario) {
                setUsuario(usuario);
            } else {
                setUsuario(null);
            }
        });
    }, []);

    const iniciarSesionGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const usuario = result.user;

            return {
                token,
                usuario,
            };
        } catch (e) {
            const errorCode = error?.code;
            const errorMessage = error?.message;
            // The email of the user's account used.
            const email = error?.customData?.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);

            console.log({ errorCode, errorMessage, email, credential });
        }
    }

    const cerrarSesion = async () => {
        try {
            await signOut(auth);
            navigate("/");
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <authContext.Provider value={{
            usuario,
            iniciarSesionGoogle,
            cerrarSesion
        }}>{children}</authContext.Provider>
    );
}

export default AuthProvider;
