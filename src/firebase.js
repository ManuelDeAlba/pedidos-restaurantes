// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, onSnapshot, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore";
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

// Posibles estados para saber si un documento se tiene que borrar o si fue editado o no hubo cambios
export const ESTADOS_DOCUMENTOS = {
    BORRADO: 0,
    SIN_CAMBIOS: 1,
    EDITADO: 2,
    NUEVO: 3
}

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
        id: Date.now() + pedido.idProducto,
        creador: pedido.uid,
        idMesa: pedido.idMesa,
        idProducto: pedido.idProducto,
        nombre: pedido.nombre,
        precio: pedido.precio,
        cantidad: pedido.cantidad
    }

    await setDoc(doc(db, "pedidos", nuevoPedido.id), nuevoPedido);

    return nuevoPedido;
}

export async function editarMesa(idMesa, nombre){
    console.log(idMesa, nombre);
    try{
        await updateDoc(doc(db, "mesas", idMesa), { nombre });
    } catch(error){
        console.error("Error al editar la mesa", error);
    }
}

export async function editarPedido(id, cambios){
    try{
        await updateDoc(doc(db, "pedidos", id), cambios);
    } catch(error){
        console.error("Error al editar el pedido", error);
    }
}

export async function borrarMesa(idMesa){
    try{
        await deleteDoc(doc(db, "mesas", idMesa));
    } catch(error){
        console.error("Error al borrar la mesa", error);
    }
}

export async function borrarPedido(id){
    try{
        await deleteDoc(doc(db, "pedidos", id));
    } catch(error){
        console.error("Error al borrar el pedido", error);
    }
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