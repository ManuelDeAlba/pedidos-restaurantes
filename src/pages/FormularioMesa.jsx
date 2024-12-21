import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";
import { useAuth } from "../context/AuthProvider";
import { useRestauranteStore } from "../store/RestauranteStore";
import { ESTADOS_DOCUMENTOS } from "../firebase";

function FormularioMesa() {
    const { id } = useParams();
    const { usuario } = useAuth();

    const mesas = useRestauranteStore(state => state.mesas);
    const pedidos = useRestauranteStore(state => state.pedidos);
    const productos = useRestauranteStore(state => state.productos);

    const agregarPedido = useRestauranteStore(state => state.agregarPedido);
    const editarPedido = useRestauranteStore(state => state.editarPedido);

    const [mesa, setMesa] = useState(undefined);
    const [pedidosForm, setPedidosForm] = useState([]);

    const handleProductoPedido = (producto, cantidad) => {
        setPedidosForm(prevPedidos => {
            const pedido = prevPedidos.find(pedido => pedido.idProducto === producto.id);

            // Si no hay pedido y la cantidad es mayor a 0, se agrega un nuevo pedido
            if(!pedido && cantidad > 0){
                return [
                    ...prevPedidos,
                    {
                        idProducto: producto.id,
                        nombre: producto.nombre,
                        precio: producto.precio,
                        cantidad: cantidad
                    }
                ]
            }

            // Verificar si el pedido es nuevo y no se encuentra en la db
            const local = !Boolean(pedido.id);

            if(local){
                if(pedido.cantidad + cantidad <= 0){
                    // Si el pedido es local y la cantidad es menor o igual a 0, se elimina del array
                    return prevPedidos.filter(pedido => pedido.idProducto !== producto.id);
                } else {
                    // Si el pedido es local y la cantidad es mayor a 0, se actualiza la cantidad
                    return prevPedidos.map(pedido => {
                        if(pedido.idProducto === producto.id){
                            return {
                                ...pedido,
                                cantidad: pedido.cantidad + cantidad
                            }
                        }
                        return pedido;
                    })
                }
            } else {
                if(pedido.cantidad + cantidad <= 0){
                    // Si ya está en la db y la cantidad es menor o igual a 0, se marca para borrar
                    return prevPedidos.map(pedido => {
                        if(pedido.idProducto === producto.id){
                            return {
                                ...pedido,
                                cantidad: 0,
                                // Marcar para borrar en la db
                                estado: ESTADOS_DOCUMENTOS.BORRADO
                            }
                        }
                        return pedido;
                    });
                } else {
                    // Si ya está en la db y la cantidad es mayor a 0, se actualiza la cantidad
                    return prevPedidos.map(pedido => {
                        if(pedido.idProducto === producto.id){
                            return {
                                ...pedido,
                                cantidad: pedido.cantidad + cantidad,
                                // Marcar para editar en la db y evitar actualizaciones innecesarias
                                estado: ESTADOS_DOCUMENTOS.EDITADO
                            }
                        }
                        return pedido;
                    })
                }
            }
        });
    };

    const handleSubmit = async e => {
        e.preventDefault();

        // Si algún pedido tiene un id, es porque ya pasó por la base de datos, por lo tanto se está editando
        const editando = pedidosForm.some(pedido => pedido.id);

        if (!editando) {
            // Agregar productos nuevos (no edición)
            await agregarPedido(usuario.uid, mesa.id, pedidosForm);
        } else {
            // Editar productos
            await editarPedido(usuario.uid, mesa.id, pedidosForm);
        }
    };

    useEffect(() => {
        if (mesas?.length > 0) setMesa(mesas.find(mesa => mesa.id === id) ?? null);
    }, [mesas]);

    useEffect(() => {
        const pedidosFiltrados = pedidos?.filter(
            pedido => pedido.idMesa === id
        );
        if (pedidosFiltrados?.length > 0) setPedidosForm(pedidosFiltrados);
    }, [pedidos]);

    if (mesa === undefined || pedidos === undefined || productos === undefined)
        return (
            <main className="container mx-auto p-8">
                <h1 className="text-center text-3xl font-bold">Cargando...</h1>
            </main>
        );
    else if (mesa === null) return <Navigate to="/" />;

    return (
        <main className="container mx-auto p-8">
            <h1 className="text-center text-2xl font-bold">{mesa.nombre}</h1>
            <span
                className={`block text-right ${
                    pedidosForm.length ? "text-red-500" : "text-green-500"
                }`}
            >
                {pedidosForm.length ? "Ocupada" : "Libre"}
            </span>

            {productos.length > 0 && (
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-10 my-8"
                >
                    <section className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                        {productos.map(producto => (
                            <article key={producto.id}>
                                <button
                                    className="w-full border-2 border-slate-800 text-slate-800 text-lg px-4 py-2 rounded"
                                    onClick={() =>
                                        handleProductoPedido(producto, 1)
                                    }
                                    type="button"
                                >
                                    <img
                                        src="https://placehold.co/150"
                                        alt={`Imagen de ${producto.nombre}`}
                                        className="w-full h-32 object-cover object-center mb-2"
                                    />
                                    {producto.nombre}
                                </button>

                                <div className="flex gap-4 justify-center items-center mt-2">
                                    <button onClick={() => handleProductoPedido(producto, -1)} type="button" className="size-10 flex justify-center items-center bg-slate-800 text-white/80 border-2 border-slate-800 rounded-full hover:bg-transparent hover:text-slate-800">
                                        <svg
                                            className="size-8"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path
                                                stroke="none"
                                                d="M0 0h24v24H0z"
                                                fill="none"
                                            />
                                            <path d="M5 12l14 0" />
                                        </svg>
                                    </button>
                                    <span className="text-2xl font-semibold">
                                        {
                                            pedidosForm.find(
                                                pedido =>
                                                    pedido.idProducto ==
                                                    producto.id
                                            )?.cantidad ?? 0
                                        }
                                    </span>
                                    <button onClick={() => handleProductoPedido(producto, 1)} type="button" className="size-10 flex justify-center items-center bg-slate-800 text-white/80 border-2 border-slate-800 rounded-full hover:bg-transparent hover:text-slate-800">
                                        <svg
                                            className="size-8"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path
                                                stroke="none"
                                                d="M0 0h24v24H0z"
                                                fill="none"
                                            />
                                            <path d="M12 5l0 14" />
                                            <path d="M5 12l14 0" />
                                        </svg>
                                    </button>
                                </div>
                            </article>
                        ))}
                    </section>

                    {pedidosForm.length > 0 && (
                        <ul>
                            {pedidosForm.map((pedido, index) => (
                                <li
                                    className="flex justify-between"
                                    key={index}
                                >
                                    <span>{pedido.nombre}</span>
                                    <span>
                                        {pedido.cantidad} x ${pedido.precio} = $
                                        {pedido.cantidad * pedido.precio}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <span className="block text-right text-lg font-semibold mt-4">
                        Total: $
                        {pedidosForm.reduce(
                            (acc, ac) => acc + ac.precio * ac.cantidad,
                            0
                        )}
                    </span>

                    <div className="flex flex-wrap gap-4">
                        <button
                            className="flex-1 min-w-28 bg-slate-800 text-white px-4 py-2 rounded"
                            type="button"
                        >
                            Cancelar
                        </button>
                        <button className="flex-1 min-w-28 bg-slate-800 text-white px-4 py-2 rounded">
                            Aceptar pedido
                        </button>
                    </div>
                </form>
            )}
            {/* // TODO Boton de completar para subir a la db como completados o mover al historial */}
        </main>
    );
}

export default FormularioMesa;
