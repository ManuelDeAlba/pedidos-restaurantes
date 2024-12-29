// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, onSnapshot, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, uploadBytes, getDownloadURL, deleteObject, ref} from "firebase/storage";

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
export const storage = getStorage(app);

// Posibles estados para saber si un documento se tiene que borrar o si fue editado o no hubo cambios
export const ESTADOS_DOCUMENTOS = {
    BORRADO: 0,
    SIN_CAMBIOS: 1,
    EDITADO: 2,
    NUEVO: 3,
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

export async function registrarCategoria(categoria) {
    const nuevaCategoria = {
        id: Date.now() + categoria.uid,
        creador: categoria.uid,
        categoria: categoria.categoria,
    }

    await setDoc(doc(db, "categoriasProductos", nuevaCategoria.id), nuevaCategoria);

    return nuevaCategoria;
}

export async function registrarProducto(producto) {
    let nuevoProducto = {
        id: Date.now() + producto.uid,
        creador: producto.uid,
        nombre: producto.nombre,
        precio: producto.precio,
        categorias: producto.categorias,
    }

    // Si el producto tiene una foto, subirla
    if(producto.fileFoto){
        try{
            // Subir la foto del producto
            const storageRef = ref(storage, `productos/${nuevoProducto.id}`);
            await uploadBytes(storageRef, producto.fileFoto);
        
            nuevoProducto.url = await getDownloadURL(ref(storage, `productos/${nuevoProducto.id}`));
        } catch(error){
            // Error al subir la foto
            console.error(error);
        }
    }

    try{
        // Crear un documento en la colección de productos
        await setDoc(doc(db, "productos", nuevoProducto.id), nuevoProducto);
    
        return nuevoProducto;
    } catch(error){
        // Error al subir el documento del producto
        console.error(error);
    }

}

export async function registrarMesa(mesa){
    const nuevaMesa = {
        id: Date.now() + mesa.uid,
        creador: mesa.uid,
        nombre: mesa.nombre,
        linea: mesa.linea
    }

    await setDoc(doc(db, "mesas", nuevaMesa.id), nuevaMesa);

    return nuevaMesa;
}

export async function registrarPedido(pedido){
    const nuevoPedido = {
        id: Date.now() + pedido.idProducto,
        fecha: Date.now(),
        creador: pedido.uid,
        idMesa: pedido.idMesa,
        idProducto: pedido.idProducto,
        nombre: pedido.nombre,
        precio: pedido.precio,
        cantidad: pedido.cantidad,
        completado: pedido.completado
    }

    await setDoc(doc(db, "pedidos", nuevoPedido.id), nuevoPedido);

    return nuevoPedido;
}

export async function editarProducto(producto){
    const cambios = {
        nombre: producto.nombre,
        precio: producto.precio,
        categorias: producto.categorias
    }

    try{
        if(producto.fileFoto){
            // Sobreescribir la foto del producto
            const storageRef = ref(storage, `productos/${producto.id}`);
            await uploadBytes(storageRef, producto.fileFoto);
        
            cambios.url = await getDownloadURL(ref(storage, `productos/${producto.id}`));
        }
    } catch(error){
        // Error al subir la foto
        console.error(error);
    }

    try{
        await updateDoc(doc(db, "productos", producto.id), cambios);
    } catch(error){
        console.error("Error al editar el producto", error);
    }
}

export async function editarMesa(idMesa, nombre){
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

export async function borrarCategoria(idCategoria){
    try{
        await deleteDoc(doc(db, "categoriasProductos", idCategoria));
    } catch(error){
        console.error("Error al borrar la categoría", error);
    }
}

export async function borrarProducto(idProducto){
    // Borrar los pedidos del producto que están activos
    try{
        const q = query(collection(db, "pedidos"), where("idProducto", "==", idProducto), where("completado", "==", false));
        const docs = await getDocs(q);
    
        docs.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });
    } catch(error){
        console.error("Error al borrar los pedidos del producto", error);
    }

    // Borrar la foto del producto
    try{
        await deleteObject(ref(storage, `productos/${idProducto}`));
    }catch(error){
        console.error("Error al borrar la foto del producto", error);
    }

    // Borrar el producto
    try{
        await deleteDoc(doc(db, "productos", idProducto));
    } catch(error){
        console.error("Error al borrar el producto", error);
    }
}

export async function borrarMesa(idMesa){
    // Borrar todos los pedidos de la mesa
    try{
        const q = query(collection(db, "pedidos"), where("idMesa", "==", idMesa), where("completado", "==", false));
        const docs = await getDocs(q);
    
        docs.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });
    } catch(error){
        console.error("Error al borrar los pedidos de la mesa", error);
    }

    // Borrar la mesa
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

// Funciones para obtener los datos en tiempo real
function obtenerColeccion({ coleccion, orderBy: ordenarPor, uid, callback }){
    const q = query(collection(db, coleccion), where("creador", "==", uid), orderBy(ordenarPor));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const documentos = [];
        querySnapshot.forEach((doc) => {
            documentos.push(doc.data());
        });
        callback(documentos);
    });

    return unsubscribe;
}

export function obtenerCategorias(uid, callback){
    return obtenerColeccion({
        coleccion: "categoriasProductos",
        orderBy: "categoria",
        uid,
        callback
    });
}

export function obtenerProductos(uid, callback){
    return obtenerColeccion({
        coleccion: "productos",
        orderBy: "nombre",
        uid,
        callback
    });
}

export function obtenerMesas(uid, callback){
    return obtenerColeccion({
        coleccion: "mesas",
        orderBy: "id",
        uid,
        callback
    });
}

export function obtenerPedidos(uid, callback){
    return obtenerColeccion({
        coleccion: "pedidos",
        orderBy: "id",
        uid,
        callback
    });
}