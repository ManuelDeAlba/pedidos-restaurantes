import { useState, useEffect, createContext, useContext } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { useNavigate } from "react-router";
import { auth } from "../firebase";
import { useRestauranteStore } from "../store/restauranteStore";

const provider = new GoogleAuthProvider();

const authContext = createContext();

export function useAuth() {
    return useContext(authContext);
}

function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(undefined);
    const navigate = useNavigate();

    const obtenerRestaurante = useRestauranteStore(state => state.obtenerRestaurante);
    const obtenerCategoriasRealTime = useRestauranteStore(state => state.obtenerCategoriasRealTime);
    const obtenerProductosRealTime = useRestauranteStore(state => state.obtenerProductosRealTime);
    const obtenerMesasRealTime = useRestauranteStore(state => state.obtenerMesasRealTime);
    const obtenerPedidosRealTime = useRestauranteStore(state => state.obtenerPedidosRealTime);

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

    useEffect(() => {
        if(usuario === null) return navigate("/"); // Si no existe usuario, redirigir a la página de inicio
        else if(usuario === undefined) return; // Si no se ha cargado el usuario todavía, no hacer nada

        // Obtener los datos del restaurante al cargar la página
        // Si el restaurante del usuario no existe, registrarlo
        obtenerRestaurante(usuario);
        console.log("Subscribing to real-time updates");
        const unsubscribeProductos = obtenerProductosRealTime(usuario.uid);
        const unsubscribeMesas = obtenerMesasRealTime(usuario.uid);
        const unsubscribePedidos = obtenerPedidosRealTime(usuario.uid);
        const unsubscribeCategorias = obtenerCategoriasRealTime(usuario.uid);

        return () => {
            console.log("Unsubscribing from real-time updates");
            unsubscribeProductos();
            unsubscribeMesas();
            unsubscribePedidos();
            unsubscribeCategorias();
        }
    }, [usuario])

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
