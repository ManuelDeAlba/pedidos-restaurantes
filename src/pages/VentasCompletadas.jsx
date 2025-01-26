import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthProvider";
import { useRestauranteStore } from "../store/restauranteStore";

import ModalConfirmar from "../components/ModalConfirmar";
import GraficasVentas from "../components/GraficasVentas";

const timeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
const dateFormatter = new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'full',
    timeZone: timeZone
});

function VentasCompletadas(){
    const { usuario } = useAuth();

    const pedidos = useRestauranteStore(state => state.pedidos);
    const limpiarVentas = useRestauranteStore(state => state.limpiarVentas);
    
    const [pedidosAgrupados, setPedidosAgrupados] = useState(undefined);
    const [showModal, setShowModal] = useState(false);

    // Agrupar los pedidos por día y por producto para mostrar en la lista de ventas
    useEffect(() => {
        if(pedidos === undefined) return;
        const pedidosFiltrados = pedidos.filter(pedido => pedido.completado);

        // Agrupar los pedidos por día
        const agrupadosFecha = Object.groupBy(pedidosFiltrados, (pedido) => new Date(pedido.fecha).toLocaleDateString().replaceAll("/", "_"));

        // Obtener solamente los pedidos agrupados en un array (ignorando la llave de la fecha que no necesitamos)
        const arrayPedidos = Object.values(agrupadosFecha);

        // Agrupar los pedidos por producto
        const agrupadosProducto = arrayPedidos.map(pedidos => {
            const obj = Object.groupBy(pedidos, (pedido) => pedido.idProducto);
            return Object.values(obj);
        })

        // Calcular los totales para mostrar en las ventas completadas
        const totales = agrupadosProducto.map(pedidos => {
            return pedidos.map(pedido => {
                // Calcular el total de cada producto, retornar el nombre del producto, el total, la fecha y la cantidad de productos
                return {
                    nombre: pedido[0].nombre,
                    total: pedido.reduce((acc, ac) => acc + ac.precio * ac.cantidad, 0),
                    fecha: pedido[0].fecha,
                    cantidad: pedido.reduce((acc, ac) => acc + ac.cantidad, 0)
                }
            })
        }).sort((a, b) => new Date(b[0].fecha) - new Date(a[0].fecha));

        setPedidosAgrupados(totales);
    }, [pedidos])

    const handleLimpiarVentas = async () => {
        if(!usuario) return;

        // Limpiar los pedidos completados
        const promesa = limpiarVentas(usuario.uid);
        await toast.promise(promesa, {
            loading: "Limpiando ventas...",
            success: "Ventas limpiadas",
            error: "Error al limpiar ventas",
        })
        
        setShowModal(false);
    }

    if(pedidosAgrupados === undefined) return (
        <main className="container mx-auto p-8">
            <h1 className="text-center text-3xl font-bold">Cargando...</h1>
        </main>
    )

    if(pedidosAgrupados.length === 0) return (
        <main className="container mx-auto p-8">
            <h1 className="text-center text-3xl font-bold">No hay ventas completadas</h1>
        </main>
    )

    return(
        <main className="container mx-auto p-8">
            <ModalConfirmar
                showModal={showModal}
                mensaje="¿Estás seguro de que deseas limpiar las ventas"
                aceptarMensaje="Eliminar"
                aceptarColor="bg-red-500"
                onCancel={() => setShowModal(false)}
                onAccept={handleLimpiarVentas}
            />
                

            <h1 className="text-center text-2xl font-bold">Ventas completadas</h1>

            <GraficasVentas />

            <section className="flex flex-col gap-4 my-8">
                {
                    pedidosAgrupados.length > 0 && (
                        pedidosAgrupados.map((pedidos, index) => (
                            <article key={index}>
                                <h3 className="text-2xl font-bold mb-2">{dateFormatter.format(new Date(pedidos[0].fecha))}</h3>
                                <ul className="flex flex-col">
                                    {
                                        pedidos.map((pedido, index) => (
                                            <li key={index} className="flex justify-between">
                                                <span>{pedido.nombre} x{pedido.cantidad}</span>
                                                <span>${pedido.total}</span>
                                            </li>
                                        ))
                                    }
                                    <li className="font-bold text-end">Venta total: ${pedidos.reduce((acc, ac) => acc + ac.total, 0)}</li>
                                </ul>
                            </article>
                        ))
                    )
                }
            </section>

            <button className="block ml-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={() => setShowModal(true)}>Limpiar ventas</button>
        </main>
    )
}

export default VentasCompletadas;