import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";
import { useAuth } from "../context/AuthProvider";
import { useRestauranteStore } from "../store/RestauranteStore";

function FormularioMesa() {
    const { id } = useParams();
    const { usuario } = useAuth();

    const mesas = useRestauranteStore(state => state.mesas);
    const pedidos = useRestauranteStore(state => state.pedidos);
    const productos = useRestauranteStore(state => state.productos);

    const agregarPedido = useRestauranteStore(state => state.agregarPedido);

    const [mesa, setMesa] = useState(null);
    const [pedidosForm, setPedidosForm] = useState([]);

    const handleProductoPedido = producto => {
        setPedidosForm(prevPedidos => {
            const pedido = prevPedidos.find(pedido => pedido.idProducto === producto.id);

            // Si existe un pedido, solo se le suma la cantidad
            if(pedido){
                return prevPedidos.map(pedido => {
                    if(pedido.idProducto === producto.id){
                        return {
                            ...pedido,
                            cantidad: pedido.cantidad + 1
                        }
                    }
                    return pedido;
                });
            }

            // Si no existe el pedido, se agrega a la lista
            return [...prevPedidos, {
                idProducto: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: 1
            }]; 
        });
    };

    const handleSubmit = async e => {
        e.preventDefault();

        // Si algún pedido tiene un id, es porque ya pasó por la base de datos, por lo tanto se está editando
        const editando = pedidosForm.some(pedido => pedido.id);

        console.log(editando ? "Editando" : "Agregando");

        if(!editando){
            // Agregar productos nuevos (no edición)
            await agregarPedido(usuario.uid, mesa.id, pedidosForm);
        } else {
            // Editar productos
            // TODO: Implementar la edición de pedidos
        }
    };

    useEffect(() => {
        if (mesas?.length > 0) setMesa(mesas.find(mesa => mesa.id === id));
    }, [mesas]);

    useEffect(() => {
        const pedidosFiltrados = pedidos?.filter(pedido => pedido.idMesa === id);
        if(pedidosFiltrados?.length > 0) setPedidosForm(pedidosFiltrados);
    }, [pedidos])

    if (mesa === null || pedidos === undefined || productos === undefined)
        return (
            <main className="container mx-auto p-8">
                <h1 className="text-center text-3xl font-bold">Cargando...</h1>
            </main>
        );
    else if (mesa === undefined) return <Navigate to="/" />;

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
                            <button
                                key={producto.id}
                                className="w-full border-2 border-slate-800 text-slate-800 text-lg px-4 py-2 rounded"
                                onClick={() => handleProductoPedido(producto)}
                                type="button"
                            >
                                <img
                                    src="https://placehold.co/150"
                                    alt={`Imagen de ${producto.nombre}`}
                                    className="w-full h-32 object-cover object-center mb-2"
                                />
                                {producto.nombre}
                            </button>
                        ))}
                    </section>

                    {pedidosForm.length > 0 && (
                        <ul>
                            {pedidosForm.map((pedido, index) => (
                                <li className="flex justify-between" key={index}>
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
                        {pedidosForm.reduce((acc, ac) => acc + ac.precio * ac.cantidad, 0)}
                    </span>

                    <div className="flex flex-wrap gap-4">
                        <button className="flex-1 min-w-28 bg-slate-800 text-white px-4 py-2 rounded" type="button">Cancelar</button>
                        <button className="flex-1 min-w-28 bg-slate-800 text-white px-4 py-2 rounded">Aceptar pedido</button>
                    </div>
                </form>
            )}
            {/* // TODO Boton de completar para subir a la db como completados o mover al historial */}
        </main>
    );
}

export default FormularioMesa;
