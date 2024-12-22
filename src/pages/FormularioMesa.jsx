import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { useAuth } from "../context/AuthProvider";
import { useRestauranteStore } from "../store/restauranteStore";
import { ESTADOS_DOCUMENTOS } from "../firebase";

function FormularioMesa() {
    const { id } = useParams();
    const { usuario } = useAuth();
    const navigate = useNavigate();

    const categorias = useRestauranteStore(state => state.categorias);
    const productos = useRestauranteStore(state => state.productos);
    const mesas = useRestauranteStore(state => state.mesas);
    const pedidos = useRestauranteStore(state => state.pedidos);

    const agregarPedido = useRestauranteStore(state => state.agregarPedido);
    const editarPedido = useRestauranteStore(state => state.editarPedido);
    const editarMesa = useRestauranteStore(state => state.editarMesa);
    const borrarMesa = useRestauranteStore(state => state.borrarMesa);

    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [mesa, setMesa] = useState(undefined);
    const [pedidosForm, setPedidosForm] = useState([]);
    const [editandoNombre, setEditandoNombre] = useState(false);

    const handleCategoriaClick = (idCategoria) => {
        if (categoriaSeleccionada === idCategoria) setCategoriaSeleccionada(null);
        else setCategoriaSeleccionada(idCategoria);
    }

    const handleProductoPedido = (producto, cantidad) => {
        setPedidosForm(prevPedidos => {
            const pedido = prevPedidos.find(
                pedido => pedido.idProducto === producto.id
            );

            // Si no hay pedido y la cantidad es menor o igual a 0, no se hace nada
            if (!pedido && cantidad <= 0) return prevPedidos;

            // Si no hay pedido y la cantidad es mayor a 0, se agrega un nuevo pedido
            if (!pedido && cantidad > 0) {
                return [
                    ...prevPedidos,
                    {
                        idProducto: producto.id,
                        nombre: producto.nombre,
                        precio: producto.precio,
                        cantidad: cantidad,
                        estado: ESTADOS_DOCUMENTOS.NUEVO,
                    },
                ];
            }

            // Verificar si el pedido es nuevo y no se encuentra en la db
            const local = !Boolean(pedido.id);

            if (local) {
                if (pedido.cantidad + cantidad <= 0) {
                    // Si el pedido es local y la cantidad es menor o igual a 0, se elimina del array
                    return prevPedidos.filter(
                        pedido => pedido.idProducto !== producto.id
                    );
                } else {
                    // Si el pedido es local y la cantidad es mayor a 0, se actualiza la cantidad
                    return prevPedidos.map(pedido => {
                        if (pedido.idProducto === producto.id) {
                            return {
                                ...pedido,
                                cantidad: pedido.cantidad + cantidad,
                            };
                        }
                        return pedido;
                    });
                }
            } else {
                if (pedido.cantidad + cantidad <= 0) {
                    // Si ya está en la db y la cantidad es menor o igual a 0, se marca para borrar
                    return prevPedidos.map(pedido => {
                        if (pedido.idProducto === producto.id) {
                            return {
                                ...pedido,
                                cantidad: 0,
                                // Marcar para borrar en la db
                                estado: ESTADOS_DOCUMENTOS.BORRADO,
                            };
                        }
                        return pedido;
                    });
                } else {
                    // Si ya está en la db y la cantidad es mayor a 0, se actualiza la cantidad
                    return prevPedidos.map(pedido => {
                        if (pedido.idProducto === producto.id) {
                            return {
                                ...pedido,
                                cantidad: pedido.cantidad + cantidad,
                                // Marcar para editar en la db y evitar actualizaciones innecesarias
                                estado: ESTADOS_DOCUMENTOS.EDITADO,
                            };
                        }
                        return pedido;
                    });
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

        navigate("/");
    };

    useEffect(() => {
        if (mesas?.length > 0)
            setMesa(mesas.find(mesa => mesa.id === id) ?? null);
    }, [mesas]);

    useEffect(() => {
        const pedidosFiltrados = pedidos?.filter(
            pedido => pedido.idMesa === id
        );
        setPedidosForm(pedidosFiltrados);
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
            <div className="flex flex-col gap-2">
                <span
                    className={`self-center text-right font-bold text-sm px-4 border-2 rounded-full ${
                        pedidosForm.length ? "text-red-500 border-red-500" : "text-green-500 border-green-500"
                    }`}
                >
                    {pedidosForm.length ? "Ocupada" : "Libre"}
                </span>

                {!editandoNombre ? (
                    <>
                        <div className="flex flex-col justify-center items-center gap-1">
                            <h1 className="text-center text-2xl font-bold">
                                {mesa.nombre}
                            </h1>
                        </div>
                        <div className="flex self-end gap-4 mb-4">
                            <button
                                onClick={() => setEditandoNombre(true)}
                                aria-label="Editar nombre de mesa"
                            >
                                <svg
                                    className="size-7 text-orange-400 transition-transform hover:-translate-y-1"
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
                                    <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                                    <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                                    <path d="M16 5l3 3" />
                                </svg>
                            </button>
                            <button
                                onClick={() => borrarMesa(mesa.id)}
                                aria-label="Borrar mesa"
                            >
                                <svg
                                    className="size-7 text-red-500 transition-transform hover:-translate-y-1"
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
                                    <path d="M4 7l16 0" />
                                    <path d="M10 11l0 6" />
                                    <path d="M14 11l0 6" />
                                    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                                    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                                </svg>
                            </button>
                        </div>
                    </>
                ) : (
                    <form
                        className="flex flex-wrap gap-4 mb-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            editarMesa(mesa.id, mesa.nombre);
                            setEditandoNombre(false);
                        }}
                    >
                        <input
                            type="text"
                            value={mesa.nombre}
                            onChange={e =>
                                setMesa({ ...mesa, nombre: e.target.value })
                            }
                            className="max-w-full flex-grow-[3] py-1 px-2 border-2 border-slate-800 rounded"
                        />
                        <button className="flex-1 bg-slate-800 text-white px-4 py-2 rounded cursor-pointer">Aceptar</button>
                    </form>
                )}
            </div>

            {productos.length > 0 && (
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col lg:flex-row gap-10 my-8"
                >
                    {/* Filtros */}
                    <div className="flex-grow flex flex-wrap gap-2 lg:flex-col lg:max-h-max lg:sticky lg:top-20">
                        {categorias.map(categoria => (
                            <button
                                key={categoria.id}
                                className={`whitespace-nowrap flex-1 border-2 border-slate-800 ${categoriaSeleccionada === categoria.id ? "bg-slate-800 text-white" : "text-slate-800"} text-lg px-4 py-1 rounded`}
                                type="button"
                                onClick={() => handleCategoriaClick(categoria.id)}
                            >
                                {categoria.categoria}
                            </button>
                        ))}
                    </div>

                    <div className="flex-grow-[5] flex flex-col gap-4">
                        <section className="grid grid-cols-[repeat(auto-fill,minmax(min(200px,100%),1fr))] gap-4">
                            {productos.filter(producto => categoriaSeleccionada === null || producto.categorias.includes(categoriaSeleccionada)).map(producto => (
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
                                        <button
                                            onClick={() =>
                                                handleProductoPedido(producto, -1)
                                            }
                                            type="button"
                                            className="size-10 flex justify-center items-center bg-slate-800 text-white/80 border-2 border-slate-800 rounded-full hover:bg-transparent hover:text-slate-800"
                                            aria-label="Restar cantidad de producto"
                                        >
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
                                            {pedidosForm.find(
                                                pedido =>
                                                    pedido.idProducto == producto.id
                                            )?.cantidad ?? 0}
                                        </span>
                                        <button
                                            onClick={() =>
                                                handleProductoPedido(producto, 1)
                                            }
                                            type="button"
                                            className="size-10 flex justify-center items-center bg-slate-800 text-white/80 border-2 border-slate-800 rounded-full hover:bg-transparent hover:text-slate-800"
                                            aria-label="Sumar cantidad de producto"
                                        >
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
                                {pedidosForm
                                    ?.filter(pedido => pedido.cantidad > 0)
                                    ?.map((pedido, index) => (
                                        <li
                                            className="flex justify-between"
                                            key={index}
                                        >
                                            <span>{pedido.nombre}</span>
                                            <span>
                                                {pedido.cantidad} x ${pedido.precio}{" "}
                                                = ${pedido.cantidad * pedido.precio}
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
                                Borrar pedido
                            </button>
                            <button className="flex-1 min-w-28 bg-slate-800 text-white px-4 py-2 rounded">
                                Guardar
                            </button>
                        </div>
                    </div>
                </form>
            )}
            {/* // TODO Boton de completar para subir a la db como completados o mover al historial */}
        </main>
    );
}

export default FormularioMesa;
