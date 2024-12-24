import { useEffect, useState } from "react";
import { useRestauranteStore } from "../store/restauranteStore";

function VentasCompletadas(){
    const pedidos = useRestauranteStore(state => state.pedidos);
    const [pedidosAgrupados, setPedidosAgrupados] = useState(undefined);

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
        })

        setPedidosAgrupados(totales);
    }, [pedidos])

    if(pedidosAgrupados === undefined) return (
        <main className="container mx-auto p-8">
            <h1 className="text-center text-3xl font-bold">Cargando...</h1>
        </main>
    )

    return(
        <main className="container mx-auto p-8">
            <h1 className="text-center text-2xl font-bold">Ventas completadas</h1>

            <section className="flex flex-col gap-4 my-8">
                {
                    pedidosAgrupados.length > 0 && (
                        pedidosAgrupados.map((pedidos, index) => (
                            <article key={index}>
                                <h2 className="text-2xl font-bold mb-2">Fecha: {new Date(pedidos[0].fecha).toLocaleDateString()}</h2>
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
        </main>
    )
}

export default VentasCompletadas;