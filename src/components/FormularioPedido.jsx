import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { useAuth } from "../context/AuthProvider";
import { useRestauranteStore } from "../store/restauranteStore";
import { ESTADOS_DOCUMENTOS } from "../firebase";

import ModalConfirmar from "./ModalConfirmar";

import IconoEditar from "../icons/IconoEditar";
import IconoBorrar from "../icons/IconoBorrar";
import IconoMenos from "../icons/IconoMenos";
import IconoMas from "../icons/IconoMas";
import IconoFlechaSalir from "../icons/IconoFlechaSalir";

function FormularioPedido({ linea=false }) {
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

    const [showModal, setShowModal] = useState(false);
    const [showModalCompletar, setShowModalCompletar] = useState(false);

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

    const handleSubmit = async (e, completado=false) => {
        if(e) e.preventDefault();

        // Si no hay pedidos, no se hace nada
        if(pedidosForm.length === 0) return;
        // Si se le da al boton de completar pero no hay pedidos, solo guardar los cambios
        if(completado && pedidosForm.every(pedido => pedido.cantidad === 0)) handleSubmit();

        // Si algún pedido tiene un id, es porque ya pasó por la base de datos, por lo tanto se está editando
        const editando = pedidosForm.some(pedido => pedido.id);

        if (!editando) {
            // Agregar productos nuevos (no edición)
            await agregarPedido(usuario.uid, mesa.id, pedidosForm.map(pedido => ({...pedido, completado})));
        } else {
            // Editar productos
            await editarPedido(usuario.uid, mesa.id, pedidosForm.map(pedido => ({...pedido, completado})));
        }
        navigate("/");
    };

    const handleSalir = () => {
        navigate("/");
    }

    const handleBorrarMesa = async () => {
        await borrarMesa(mesa.id);
        navigate("/");
    }

    const handleBorrarConfirm = () => setShowModal(true);

    const handleCompletarConfirm = () => setShowModalCompletar(true);

    const handleCompletarPedido = async () => {
        await handleSubmit(undefined, true);
        setShowModalCompletar(false);
        // TODO: toast para decir si se completó, dependiendo de si existían pedidos
    }

    const handleRestablecerPedido = () => {
        const nuevosPedidos = pedidosForm.map(pedido => {
            // Si el pedido es local, se elimina del array
            if(!pedido.id) return undefined;
            // Si el pedido ya está en la db, se marca para borrar
            return { ...pedido, cantidad: 0, estado: ESTADOS_DOCUMENTOS.BORRADO }
        }).filter(Boolean);

        setPedidosForm(nuevosPedidos);
    }

    useEffect(() => {
        if (mesas?.length > 0)
            setMesa(mesas.find(mesa => mesa.id === id) ?? null);
    }, [mesas]);

    useEffect(() => {
        const pedidosFiltrados = pedidos?.filter(
            pedido => pedido.idMesa === id &&
            !pedido.completado
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
            <ModalConfirmar
                className={"bg-white flex flex-col gap-8 p-8 rounded"}
                showModal={showModal}
            >
                <h2 className="text-center font-bold text-xl">¿Estás seguro de que deseas eliminar {linea ? "este pedido" : "esta mesa"}?</h2>

                <div className="flex flex-wrap gap-4">
                    <button onClick={() => setShowModal(false)} className="flex-1 min-w-fit bg-slate-800 text-white px-4 py-2 rounded cursor-pointer">Cancelar</button>
                    <button onClick={handleBorrarMesa} className="flex-1 min-w-fit bg-red-500 text-white px-4 py-2 rounded cursor-pointer">Eliminar</button>
                </div>
            </ModalConfirmar>
            <ModalConfirmar
                className={"bg-white flex flex-col gap-8 p-8 rounded"}
                showModal={showModalCompletar}
            >
                <h2 className="text-center font-bold text-xl">¿Estás seguro de que deseas completar el pedido?</h2>

                <div className="flex flex-wrap gap-4">
                    <button onClick={() => setShowModalCompletar(false)} className="flex-1 min-w-fit bg-slate-800 text-white px-4 py-2 rounded cursor-pointer">Cancelar</button>
                    <button onClick={handleCompletarPedido} className="flex-1 min-w-fit bg-green-700 text-white px-4 py-2 rounded cursor-pointer">Completar</button>
                </div>
            </ModalConfirmar>

            <div className="flex flex-col gap-2">
                {
                    !linea && (
                        <span
                            className={`self-center text-right font-bold text-sm px-4 border-2 rounded-full ${
                                pedidosForm.length ? "text-red-500 border-red-500" : "text-green-500 border-green-500"
                            }`}
                        >
                            {pedidosForm.length ? "Ocupada" : "Libre"}
                        </span>
                    )
                }

                {!editandoNombre ? (
                    <>
                        <div className="flex flex-col justify-center items-center gap-1">
                            <h1 className="text-center text-2xl font-bold">
                                {mesa.nombre}
                            </h1>
                        </div>
                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={handleSalir}
                                aria-label="Salir de la mesa"
                            >
                                <IconoFlechaSalir className="size-7 text-slate-800 transition-transform hover:-translate-x-1" />
                            </button>
                            <button
                                className="ml-auto"
                                onClick={() => setEditandoNombre(true)}
                                aria-label="Editar nombre de mesa"
                            >
                                <IconoEditar className="size-7 text-orange-400 transition-transform hover:-translate-y-1" />
                            </button>
                            <button
                                onClick={handleBorrarConfirm}
                                aria-label="Borrar mesa"
                            >
                                <IconoBorrar className="size-7 text-red-500 transition-transform hover:-translate-y-1" />
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
                        {/* Productos disponibles */}
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
                                            src={producto.url ?? "https://placehold.co/150"}
                                            alt={`Imagen de ${producto.nombre}`}
                                            className="w-full h-32 object-contain object-center mb-2"
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
                                            <IconoMenos className="size-8" />
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
                                            <IconoMas className="size-8" />
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </section>

                        {/* Productos seleccionados */}
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

                        {/* Total de la venta */}
                        <span className="block text-right text-lg font-semibold mt-4">
                            Total: $
                            {pedidosForm.reduce(
                                (acc, ac) => acc + ac.precio * ac.cantidad,
                                0
                            )}
                        </span>

                        {/* Botones del formulario */}
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={handleRestablecerPedido}
                                type="button"
                                className="flex-1 min-w-fit bg-red-600 text-white px-4 py-2 rounded"
                            >
                                Restablecer
                            </button>
                            <button className="flex-1 min-w-fit bg-slate-800 text-white px-4 py-2 rounded">
                                Guardar cambios
                            </button>
                            <button
                                onClick={handleCompletarConfirm}
                                type="button"
                                className="flex-1 min-w-fit bg-green-700 text-white px-4 py-2 rounded"
                            >
                                Completar
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </main>
    );
}

export default FormularioPedido;
