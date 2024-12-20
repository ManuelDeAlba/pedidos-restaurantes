import { useAuth } from "../context/AuthProvider";

import { useRestauranteStore } from "../store/RestauranteStore";
import CardMesa from "../components/CardMesa";

function Inicio() {
    const { usuario, iniciarSesionGoogle } = useAuth();

    const agregarMesa = useRestauranteStore(state => state.agregarMesa);
    
    const restaurante = useRestauranteStore(state => state.restaurante);
    const mesas = useRestauranteStore(state => state.mesas);
    

    if (usuario === undefined) {
        return <h1 className="text-center text-3xl font-bold my-8">Cargando...</h1>;
    } else if (usuario === null) {
        return (
            <main className="flex flex-col items-center my-10">
                <h1 className="text-center text-3xl font-bold mb-8">Inicia sesión para continuar</h1>
                <button
                    className="bg-slate-800 text-white px-4 py-2 rounded"
                    onClick={iniciarSesionGoogle}
                >
                    Iniciar sesión
                </button>
            </main>
        );
    }

    return (
        <main className="relative container mx-auto p-8">
            <h1 className="text-center font-bold text-2xl mb-8">Restaurante de {restaurante.usuario}</h1>
            <section className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] [grid-auto-rows:200px;] gap-8">
                {mesas.length > 0 &&
                    mesas.map((mesa, index) => (
                        <CardMesa mesa={mesa} key={index} />
                    ))}

                <button
                    onClick={() => agregarMesa(usuario.uid)}
                    className="size-full p-4 border-4 border-slate-800 rounded flex flex-col justify-center items-center"
                >
                    <svg
                        className="size-10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M12 5l0 14" />
                        <path d="M5 12l14 0" />
                    </svg>
                    Agregar mesa
                </button>
            </section>

            <button className="fixed bottom-4 inset-x-8 border-4 border-slate-800 bg-slate-800 text-white p-3 rounded hover:bg-white hover:text-slate-800">Registrar pedido en línea</button>
        </main>
    );
}

export default Inicio;
