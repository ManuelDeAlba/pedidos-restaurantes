import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useRestauranteStore } from "../store/restauranteStore";

const TIPOS_GRAFICA = {
    LINEA: 1,
    BARRAS: 2
}

function GraficasVentas({ filtroFechas }){
    const pedidos = useRestauranteStore(state => state.pedidos);

    const [datosGrafica, setDatosGrafica] = useState(undefined);
    const [productosDisponibles, setProductosDisponibles] = useState(undefined);
    const [productosSeleccionados, setProductosSeleccionados] = useState(undefined);
    const [tipoGrafica, setTipoGrafica] = useState(TIPOS_GRAFICA.LINEA);

    const handleSelect = (e) => {
        const selected = Array.from(e.target.selectedOptions).map(option => option.value);
        setProductosSeleccionados(selected);
    }

    // Guardar los productos que ya tienen ventas para poder seleccionarlos en la gráfica
    useEffect(() => {
        if(pedidos === undefined) return;
        const pedidosFiltrados = pedidos
                .filter(pedido => pedido.completado) // Filtrar solamente los pedidos completados
                .filter(pedido => pedido.fecha >= (filtroFechas?.minFecha ?? 0) && pedido.fecha <= (filtroFechas?.maxFecha ?? Date.now())); // Filtrar por fecha

        // Guardar los productos que ya tienen ventas para poder seleccionarlos en la gráfica
        setProductosDisponibles([...new Set(pedidosFiltrados.map(pedido => pedido.nombre).sort((a, b) => a.localeCompare(b)))]);
    }, [pedidos, filtroFechas])

    // Convertir los datos para la gráfica
    useEffect(() => {
        if(pedidos === undefined) return;
        const pedidosFiltrados = pedidos.filter(pedido => pedido.completado) // Filtrar solamente los pedidos completados
        .filter(pedido => pedido.fecha >= (filtroFechas?.minFecha ?? 0) && pedido.fecha <= (filtroFechas?.maxFecha ?? Date.now())); // Filtrar por fecha

        // Agrupar los pedidos por día
        const agrupadosFecha = Object.groupBy(pedidosFiltrados, (pedido) => new Date(pedido.fecha).toLocaleDateString().replaceAll("/", "_"));

        // Obtener solamente los pedidos agrupados en un array (ignorando la llave de la fecha que no necesitamos)
        const arrayPedidos = Object.values(agrupadosFecha);

        // Crear un array con los datos para la gráfica {fecha: "2021-09-01", producto1: 5, producto2: 10}
        const arr = arrayPedidos.map(pedidosDia => {
            let obj = {};
            obj.fecha = pedidosDia[0].fecha;

            pedidosDia.forEach(pedido => {
                productosSeleccionados?.forEach(producto => {
                    if(obj[producto] === undefined) obj[producto] = 0;

                    if(pedido.nombre.replaceAll(" ", "_") === producto){
                        obj[producto] += pedido.cantidad;
                    }
                })
            });

            return obj;
        })
        setDatosGrafica(arr.toSorted((a,b) => a.fecha - b.fecha).map(obj => ({
            ...obj,
            fecha: new Date(obj.fecha).toLocaleDateString()
        })));
    }, [productosSeleccionados, filtroFechas])
    
    return(
        productosDisponibles !== undefined && (
            <section className="flex flex-col items-center justify-center gap-4 my-8">
                <p>Selecciona los productos para mostrar en la gráfica</p>
                <select className="w-[90%] max-w-(--breakpoint-md) py-1 px-2 border-2 border-slate-800 rounded-sm" onChange={handleSelect} multiple>
                    {
                        productosDisponibles.map((producto, index) => (
                            <option key={index} value={producto.replaceAll(" ", "_")} selected={productosSeleccionados?.includes(producto.replaceAll(" ", "_"))}>{producto}</option>
                        ))
                    }
                </select>
                
                <p>Selecciona el tipo de gráfica a utilizar</p>
                <div className="flex gap-4">
                    <label className="flex gap-2">
                        <input
                            type="radio"
                            name="grafica"
                            value={TIPOS_GRAFICA.LINEA}
                            defaultChecked={tipoGrafica === TIPOS_GRAFICA.LINEA}
                            onInput={() => setTipoGrafica(TIPOS_GRAFICA.LINEA)}
                        />
                        Líneas
                    </label>
                    <label className="flex gap-2">
                        <input
                            type="radio"
                            name="grafica"
                            value={TIPOS_GRAFICA.BARRAS}
                            defaultChecked={tipoGrafica === TIPOS_GRAFICA.BARRAS}
                            onInput={() => setTipoGrafica(TIPOS_GRAFICA.BARRAS)}
                        />
                        Barras
                    </label>
                </div>
                

                {
                    tipoGrafica === TIPOS_GRAFICA.LINEA ? (
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={datosGrafica}>
                                <XAxis dataKey="fecha" />
                                <YAxis />
                                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                                <Legend verticalAlign="top" height={36}/>
                                <Tooltip />
                                {
                                    productosSeleccionados?.length > 0 && productosSeleccionados.map((producto, index) => (
                                        <Line key={index} type="monotone" dataKey={producto} stroke={`hsl(${(360/productosSeleccionados.length) * index}, 100%, 40%)`} strokeWidth={3} />
                                    ))
                                }
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        tipoGrafica === TIPOS_GRAFICA.BARRAS && (
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={datosGrafica}>
                                    <XAxis dataKey="fecha" />
                                    <YAxis />
                                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                                    <Legend verticalAlign="top" height={36}/>
                                    <Tooltip />
                                    {
                                        productosSeleccionados?.length > 0 && productosSeleccionados.map((producto, index) => (
                                            <Bar key={index} type="monotone" dataKey={producto} fill={`hsl(${(360/productosSeleccionados.length) * index}, 100%, 40%)`} strokeWidth={3} />
                                        ))
                                    }
                                </BarChart>
                            </ResponsiveContainer>
                        )
                    )
                }
            </section>
        )
    )
}

export default GraficasVentas;