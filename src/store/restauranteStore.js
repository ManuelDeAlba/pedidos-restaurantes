import { create } from "zustand";
import { borrarCategoria, borrarGasto, borrarMesa, borrarPedido, borrarProducto, editarMesa, editarPedido, editarProducto, editarRestaurante, ESTADOS_DOCUMENTOS, limpiarVentas, obtenerCategorias, obtenerGastos, obtenerMesas, obtenerPedidos, obtenerProductos, obtenerRestaurante, registrarCategoria, registrarGasto, registrarMesa, registrarPedido, registrarProducto } from "../firebase";

export const useRestauranteStore = create((set, get) => ({
    restaurante: undefined,
    categorias: undefined,
    productos: undefined,
    mesas: undefined,
    pedidos: undefined,
    gastos: undefined,
    obtenerRestaurante: async (usuario) => {
        const restaurante = await obtenerRestaurante(usuario);
        
        set({ restaurante: restaurante ?? null });
        
        return restaurante;
    },
    editarNombreRestaurante: async (idRestaurante, nombre) => {
        await editarRestaurante({ id: idRestaurante, nombre: nombre.trim() });

        // Se actualiza el nombre del restaurante en el estado
        set((state) => ({
            restaurante: {
                ...state.restaurante,
                nombre: nombre.trim()
            }
        }));
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
            fileFoto: producto.fileFoto,
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
            return await registrarPedido({
                uid,
                idMesa,
                idProducto: pedido.idProducto,
                nombre: pedido.nombre,
                precio: pedido.precio,
                cantidad: pedido.cantidad,
                completado: pedido.completado
            });
        })
        return await Promise.all(promesas);
    },
    agregarGasto: async (uid, gasto, costo) => {
        return await registrarGasto({
            uid,
            gasto,
            costo: parseFloat(costo)
        });
    },
    editarProducto: async (producto) => {
        await editarProducto({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            categorias: producto.categorias,
            fileFoto: producto.fileFoto,
        })
    },
    editarMesa: async (idMesa, nombre) => {
        await editarMesa(idMesa, nombre);
    },
    editarPedido: async (uid, idMesa, pedidos) => {
        const promesas = pedidos.map(async pedido => {
            if(pedido.estado == ESTADOS_DOCUMENTOS.EDITADO){
                await editarPedido(pedido.id, {
                    cantidad: pedido.cantidad,
                    completado: pedido.completado
                });
            } else if(pedido.estado == ESTADOS_DOCUMENTOS.BORRADO) {
                await borrarPedido(pedido.id);
            } else if(pedido.estado === ESTADOS_DOCUMENTOS.NUEVO){
                // Si no tiene estado, es un pedido nuevo (porque puede haber pedidos en la db y aparte los locales)
                await registrarPedido({
                    uid,
                    idMesa,
                    idProducto: pedido.idProducto,
                    nombre: pedido.nombre,
                    precio: pedido.precio,
                    cantidad: pedido.cantidad,
                    completado: pedido.completado
                });
            } else if(pedido.completado == true) {
                await editarPedido(pedido.id, {
                    completado: pedido.completado
                });
            }
        })
        await Promise.all(promesas);
    },
    borrarCategoria: async (idCategoria) => {
        await borrarCategoria(idCategoria);
    },
    borrarGasto: async (idGasto) => {
        await borrarGasto(idGasto);
    },
    borrarProducto: async (idProducto) => {
        await borrarProducto(idProducto);
    },
    borrarMesa: async (idMesa) => {
        await borrarMesa(idMesa);
    },
    limpiarVentas: async (uid) => {
        await limpiarVentas(uid);
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
    obtenerGastosRealTime: (uid) => {
        const unsubscribe = obtenerGastos(uid, (gastos) => {
            set({ gastos: gastos ?? null });
        });
        return unsubscribe;
    }
}))