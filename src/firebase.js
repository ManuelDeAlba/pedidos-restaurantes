// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, onSnapshot, orderBy, query, setDoc, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export async function registrarRestaurante(usuario) {
    const nuevoRestaurante = {
        id: usuario.uid,
        usuario: usuario.displayName,
        email: usuario.email,
        createdAt: new Date(),
    }

    await setDoc(doc(db, "restaurantes", usuario.uid), nuevoRestaurante);

    return nuevoRestaurante;
}

export async function obtenerRestaurante(usuario){
    const restaurante = await getDoc(doc(db, `restaurantes/${usuario.uid}`));

    // Si el restaurante existe, devuelve sus datos
    if(restaurante.exists()){
        return restaurante.data();
    }

    // Si no existe, lo registra y lo devuelve
    return await registrarRestaurante(usuario);
}

export async function registrarProducto(producto) {
    // TODO: Lo de las imágenes lo dejamos para después
    const nuevoProducto = {
        id: Date.now() + producto.uid,
        creador: producto.uid,
        nombre: producto.nombre,
        precio: producto.precio,
    }

    // Crear un documento en la subcolección productos de la colección del restaurante
    await setDoc(doc(db, "productos", nuevoProducto.id), nuevoProducto);

    return nuevoProducto;
}

export async function registrarMesa(mesa){
   const nuevaMesa = {
        id: Date.now() + mesa.uid,
        creador: mesa.uid,
        nombre: mesa.nombre,
    }

    await setDoc(doc(db, "mesas", nuevaMesa.id), nuevaMesa);

    return nuevaMesa;
}

export async function registrarPedido(pedido){
    const nuevoPedido = {
        id: Date.now() + pedido.uid,
        creador: pedido.uid,
        idMesa: pedido.idMesa,
        nombre: pedido.nombre,
        precio: pedido.precio,
        cantidad: pedido.cantidad
    }

    await setDoc(doc(db, "pedidos", nuevoPedido.id), nuevoPedido);

    return nuevoPedido;
}

// TODO: Extraer la lógica porque se repite casi todo
export function obtenerProductos(uid, callback){
    const q = query(collection(db, "productos"), where("creador", "==", uid), orderBy("nombre"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const productos = [];
        querySnapshot.forEach((doc) => {
            productos.push(doc.data());
        });
        callback(productos);
    });

    return unsubscribe;
}

export function obtenerMesas(uid, callback){
    const q = query(collection(db, "mesas"), where("creador", "==", uid), orderBy("id"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const mesas = [];
        querySnapshot.forEach((doc) => {
            mesas.push(doc.data());
        });
        callback(mesas);
    });

    return unsubscribe;
}

export function obtenerPedidos(uid, callback){
    const q = query(collection(db, "pedidos"), where("creador", "==", uid), orderBy("id"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const pedidos = [];
        querySnapshot.forEach((doc) => {
            pedidos.push(doc.data());
        });
        callback(pedidos);
    });

    return unsubscribe;
}