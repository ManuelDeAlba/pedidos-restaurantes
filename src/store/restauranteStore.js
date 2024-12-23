import { create } from "zustand";
import { borrarCategoria, borrarMesa, borrarPedido, borrarProducto, editarMesa, editarPedido, ESTADOS_DOCUMENTOS, obtenerCategorias, obtenerMesas, obtenerPedidos, obtenerProductos, obtenerRestaurante, registrarCategoria, registrarMesa, registrarPedido, registrarProducto } from "../firebase";

export const useRestauranteStore = create((set, get) => ({
    restaurante: undefined,
    categorias: undefined,
    productos: undefined,
    mesas: undefined,
    pedidos: undefined,
    obtenerRestaurante: async (usuario) => {
        const restaurante = await obtenerRestaurante(usuario);
        
        set({ restaurante: restaurante ?? null });
        
        return restaurante;
    },
    agregarCategoria: async (uid, datos) => {
        const nuevaCategoria = await registrarCategoria({
            uid,
            categoria: datos.categoria
        });

        return nuevaCategoria;
    },
    agregarProducto: async (uid, producto) => {
        const nuevoProducto = await registrarProducto({
            uid,
            nombre: producto.nombre,
            precio: producto.precio,
            categorias: producto.categorias,
        });

        return nuevoProducto;
    },
    agregarMesa: async ({uid, nombre="Mesa nueva", linea=false}) => {
        const mesa = await registrarMesa({
            uid,
            nombre,
            linea
        });

        return mesa;
    },
    agregarPedido: async (uid, idMesa, pedidos) => {
        const promesas = pedidos.map(async pedido => {
            await registrarPedido({
                uid,
                idMesa,
                idProducto: pedido.idProducto,
                nombre: pedido.nombre,
                precio: pedido.precio,
                cantidad: pedido.cantidad,
            });
        })
        await Promise.all(promesas);
    },
    editarMesa: async (idMesa, nombre) => {
        await editarMesa(idMesa, nombre);
    },
    editarPedido: async (uid, idMesa, pedidos) => {
        const promesas = pedidos.map(async pedido => {
            if(pedido.estado == ESTADOS_DOCUMENTOS.EDITADO){
                await editarPedido(pedido.id, {
                    cantidad: pedido.cantidad,
                });
            } else if(pedido.estado == ESTADOS_DOCUMENTOS.BORRADO) {
                await borrarPedido(pedido.id);
            } else if(pedido.estado === ESTADOS_DOCUMENTOS.NUEVO){
                // Si no tiene estado, es un pedido nuevo
                await registrarPedido({
                    uid,
                    idMesa,
                    idProducto: pedido.idProducto,
                    nombre: pedido.nombre,
                    precio: pedido.precio,
                    cantidad: pedido.cantidad,
                });
            }
        })
        await Promise.all(promesas);
    },
    borrarCategoria: async (idCategoria) => {
        await borrarCategoria(idCategoria);
    },
    borrarProducto: async (idProducto) => {
        await borrarProducto(idProducto);
    },
    borrarMesa: async (idMesa) => {
        await borrarMesa(idMesa);
    },
    obtenerCategoriasRealTime: (uid) => {
        const unsubscribe = obtenerCategorias(uid, (categorias) => {
            set({ categorias: categorias ?? null });
        });
        return unsubscribe;
    },
    obtenerProductosRealTime: (uid) => {
        const unsubscribe = obtenerProductos(uid, (productos) => {
            set({ productos: productos ?? null });
        });
        return unsubscribe;
    },
    obtenerMesasRealTime: (uid) => {
        const unsubscribe = obtenerMesas(uid, (mesas) => {
            set({ mesas: mesas ?? null });
        });
        return unsubscribe;
    },
    obtenerPedidosRealTime: (uid) => {
        const unsubscribe = obtenerPedidos(uid, (pedidos) => {
            set({ pedidos: pedidos ?? null });
        });
        return unsubscribe;
    },
}))