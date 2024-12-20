import { create } from "zustand";
import { obtenerMesas, obtenerPedidos, obtenerProductos, obtenerRestaurante, registrarMesa, registrarProducto } from "../firebase";

export const useRestauranteStore = create((set, get) => ({
    restaurante: {},
    productos: [],
    mesas: [],
    pedidos: [],
    obtenerRestaurante: async (usuario) => {
        const restaurante = await obtenerRestaurante(usuario);
        
        set({ restaurante });
        
        return restaurante;
    },
    agregarProducto: async (uid, producto) => {
        const nuevoProducto = await registrarProducto({
            uid,
            nombre: producto.nombre,
            precio: producto.precio
        });
        
        return nuevoProducto;
    },
    agregarMesa: async (uid) => {
        const mesa = await registrarMesa({
            uid,
            nombre: "Mesa " + (get().mesas.length + 1),
        });

        return mesa;
    },
    agregarPedido: (usuario) => {
        // const duenoId = usuario.uid;
        // const pedido = await registrarPedido({
        //     uid: duenoId,
        //     idMesa: mesa.id,
        //     nombre: producto.nombre,
        //     precio: producto.precio,
        //     cantidad: 2,
        // })
    },
    obtenerProductosRealTime: (uid) => {
        const unsubscribe = obtenerProductos(uid, (productos) => {
            set({ productos });
        });
        return unsubscribe;
    },
    obtenerMesasRealTime: (uid) => {
        const unsubscribe = obtenerMesas(uid, (mesas) => {
            set({ mesas });
        });
        return unsubscribe;
    },
    obtenerPedidosRealTime: (uid) => {
        const unsubscribe = obtenerPedidos(uid, (pedidos) => {
            set({ pedidos });
        });
        return unsubscribe;
    },
}))