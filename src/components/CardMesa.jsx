import { Link } from "react-router";
import { useRestauranteStore } from "../store/restauranteStore";

function CardMesa({ mesa }){
    const pedidos = useRestauranteStore(state => state.pedidos)?.filter(pedido => pedido.idMesa === mesa.id);

    if(pedidos === undefined) return null; // Si es undefined, no se ha cargado la información

    return(
        <Link to={`mesa/${mesa.id}`}>
            <article className="relative size-full flex flex-col cursor-pointer border-4 border-slate-800 rounded p-4">
                <span className={`self-end font-bold text-sm px-4 border-2 rounded-full absolute bottom-full left-1/2 -translate-x-1/2 translate-y-1/3 bg-white ${
                    pedidos.length ? "text-red-500 border-red-500" : "text-green-500 border-green-500"
                }`}>
                    { pedidos.length ? "Ocupada" : "Libre" }
                </span>

                <h2 className="text-2xl font-bold">{mesa.nombre}</h2>

                <ul className="flex-grow my-4 overflow-hidden">
                    {pedidos.slice(0, 2).map((orden, index) => (
                        <li className="flex justify-between" key={index}>
                            <span>{orden.nombre}</span>
                        </li>
                    ))}
                </ul>
                <span className="block text-right text-lg font-bold">Total: ${pedidos.reduce((acc, ac) => acc + ac.precio * ac.cantidad, 0)}</span>
            </article>
        </Link>
    )
}

export default CardMesa;