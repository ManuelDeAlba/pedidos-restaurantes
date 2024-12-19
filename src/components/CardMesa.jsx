function CardMesa({ mesa }){
    return(
        <article className={`size-full flex flex-col cursor-pointer border-4 ${mesa.ordenes.length ? "border-red-500" : "border-slate-800"} rounded p-4`}>
            <h2 className="text-2xl font-bold">{mesa.nombre}</h2>

            <span className={`block text-right ${mesa.ordenes.length ? "text-red-500" : "text-green-500"}`}>
                { mesa.ordenes.length ? "Ocupada" : "Libre" }
            </span>

            <ul className="flex-grow my-4">
                {mesa.ordenes.slice(0, 2).map((orden, index) => (
                    <li className="flex justify-between" key={index}>
                        <span>{orden.nombre}</span>
                        <span>{orden.cantidad} x ${orden.precio}</span>
                    </li>
                ))}
            </ul>
            <span className="block text-right text-lg font-semibold">Total: ${mesa.ordenes.reduce((acc, ac) => acc + ac.precio * ac.cantidad, 0)}</span>
        </article>
    )
}

export default CardMesa;