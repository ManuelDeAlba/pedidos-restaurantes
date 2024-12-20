import { useRestauranteStore } from "../store/RestauranteStore";

function CardMesa({ mesa }){
    const pedidos = useRestauranteStore(state => state.pedidos).filter(pedido => pedido.idMesa === mesa.id);

    return(
        <article className={`size-full flex flex-col cursor-pointer border-4 ${pedidos.length ? "border-red-500" : "border-slate-800"} rounded p-4`}>
            <h2 className="text-2xl font-bold">{mesa.nombre}</h2>

            <span className={`block text-right ${pedidos.length ? "text-red-500" : "text-green-500"}`}>
                { pedidos.length ? "Ocupada" : "Libre" }
            </span>

            <ul className="flex-grow my-4">
                {pedidos.slice(0, 2).map((orden, index) => (
                    <li className="flex justify-between" key={index}>
                        <span>{orden.nombre}</span>
                        <span>{orden.cantidad} x ${orden.precio}</span>
                    </li>
                ))}
            </ul>
            <span className="block text-right text-lg font-semibold">Total: ${pedidos.reduce((acc, ac) => acc + ac.precio * ac.cantidad, 0)}</span>
        </article>
    )
}

export default CardMesa;