import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthProvider";
import { useRestauranteStore } from "../store/restauranteStore";

import ModalConfirmar from "../components/ModalConfirmar";
import GraficasVentas from "../components/GraficasVentas";
import IconoOrdenarAscendente from "../icons/IconoOrdenarAscendente";
import IconoOrdenarDescendente from "../icons/IconoOrdenarDescendente";

const timeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
const dateFormatter = new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'full',
    timeZone: timeZone
});

const ORDEN_VENTAS = {
    ASCENDENTE: "ascendente",
    DESCENDENTE: "descendente"
}

function VentasCompletadas(){
    const { usuario } = useAuth();

    const pedidos = useRestauranteStore(state => state.pedidos);
    const limpiarVentas = useRestauranteStore(state => state.limpiarVentas);
    
    const [filtroFechas, setFiltroFechas] = useState({
        minFecha: 0,
        maxFecha: Date.now()
    });
    const [pedidosAgrupados, setPedidosAgrupados] = useState(undefined);
    const [showModal, setShowModal] = useState(false);
    const [ordenVentas, setOrdenVentas] = useState(ORDEN_VENTAS.DESCENDENTE);

    const handleFechas = (e) => {
        // Si se está borrando el contenido de un input date
        if(e.target.value === "") {
            setFiltroFechas({
                ...filtroFechas,
                [e.target.name]: e.target.name === "minFecha" ? 0 : Date.now()
            });
            return;
        }

        // Si se establece otra fecha, convertirla a timestamp
        const fecha = e.target.value.replaceAll("-", "/");
        const timestamp = new Date(fecha).getTime();

        setFiltroFechas({
            ...filtroFechas,
            [e.target.name]: timestamp
        });
    }

    const handleLimpiarFechas = () => {
        setFiltroFechas({
            minFecha: 0,
            maxFecha: Date.now()
        });
    }

    const toggleOrdenVentas = () => {
        if(ordenVentas == ORDEN_VENTAS.ASCENDENTE) setOrdenVentas(ORDEN_VENTAS.DESCENDENTE);
        else setOrdenVentas(ORDEN_VENTAS.ASCENDENTE);
    }

    const ordenarPedidos = (a, b) => {
        if(ordenVentas === ORDEN_VENTAS.DESCENDENTE) return new Date(b[0].fecha) - new Date(a[0].fecha);
        else return new Date(a[0].fecha) - new Date(b[0].fecha);
    }

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

    // Agrupar los pedidos por día y por producto para mostrar en la lista de ventas
    useEffect(() => {
        if(pedidos === undefined) return;
        const pedidosFiltrados = pedidos
                .filter(pedido => pedido.completado) // Filtrar solamente los pedidos completados
                .filter(pedido => pedido.fecha >= (filtroFechas?.minFecha ?? 0) && pedido.fecha <= (filtroFechas?.maxFecha ?? Date.now())); // Filtrar por fecha

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
        }).toSorted(ordenarPedidos);

        setPedidosAgrupados(totales);
    }, [pedidos, filtroFechas])

    useEffect(() => {
        if(!pedidosAgrupados) return;

        const pedidosOrdenados = pedidosAgrupados.toSorted(ordenarPedidos);

        setPedidosAgrupados(pedidosOrdenados);
    }, [ordenVentas])

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
                

            <h1 className="text-center text-2xl font-bold mb-8">Ventas completadas</h1>

            {/* Filtro de fechas */}
            <div className="flex flex-col justify-center items-center gap-2">
                <span>Filtrar por fecha</span>

                <div className="w-full xs:w-auto flex flex-col xs:flex-row gap-4">
                    <input
                        className="py-1 px-2 border-2 border-slate-800 rounded-sm"
                        type="date"
                        name="minFecha"
                        value={typeof filtroFechas.minFecha === "number" ? new Date(filtroFechas.minFecha).toISOString().split("T")[0] : ""}
                        onInput={handleFechas}
                    />
                    <span className="font-bold text-3xl hidden xs:flex">-</span>
                    <input
                        className="py-1 px-2 border-2 border-slate-800 rounded-sm"
                        type="date"
                        name="maxFecha"
                        value={typeof filtroFechas.maxFecha === "number" ? new Date(filtroFechas.maxFecha).toISOString().split("T")[0] : ""}
                        onInput={handleFechas}
                    />
                </div>

                <button className="w-full xs:w-auto bg-slate-800 text-white font-bold py-2 px-4 rounded-sm" onClick={handleLimpiarFechas}>Limpiar</button>
            </div>

            <GraficasVentas filtroFechas={filtroFechas} />

            <section className="flex flex-col gap-4 my-8">
                <button onClick={toggleOrdenVentas} className="mx-auto">
                    {
                        ordenVentas == ORDEN_VENTAS.DESCENDENTE ?
                        <span className="flex gap-2"><IconoOrdenarAscendente /> Ordenar de antiguo a reciente</span> :
                        <span className="flex gap-2"><IconoOrdenarDescendente /> Ordenar de reciente a antiguo</span>
                    }
                </button>
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

            <button className="block ml-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-sm" onClick={() => setShowModal(true)}>Limpiar ventas</button>
        </main>
    )
}

export default VentasCompletadas;