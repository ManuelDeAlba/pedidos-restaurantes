import { useAuth } from "../context/AuthProvider";

import { useRestauranteStore } from "../store/restauranteStore";
import CardMesa from "../components/CardMesa";
import { useNavigate } from "react-router";
import IconoMas from "../icons/IconoMas";

function Inicio() {
    const { usuario, iniciarSesionGoogle } = useAuth();
    const navigate = useNavigate();

    const agregarMesa = useRestauranteStore(state => state.agregarMesa);
    
    const restaurante = useRestauranteStore(state => state.restaurante);
    const mesas = useRestauranteStore(state => state.mesas);


    const handlePedidoLinea = async () => {
        const mesaVirtual = await agregarMesa({
            uid: usuario.uid,
            nombre: "Pedido nuevo",
            linea: true
        });
        navigate(`/pedido-en-linea/${mesaVirtual.id}`);
    }

    if (usuario === null) {
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
    } else if (usuario === undefined || restaurante === undefined || mesas === undefined) {
        return <h1 className="text-center text-3xl font-bold my-8">Cargando...</h1>;
    }

    return (
        <main className="relative container mx-auto p-8 mb-8">
            <h1 className="text-center font-bold text-2xl mb-8">Restaurante de {restaurante.usuario}</h1>

            <section className="grid grid-cols-[repeat(auto-fill,minmax(min(180px,100%),1fr))] [grid-auto-rows:200px;] gap-8 my-8">
                {
                    mesas.filter(mesas => !mesas.linea).length > 0 &&
                        mesas.filter(mesas => !mesas.linea).map((mesa, index) => (
                            <CardMesa mesa={mesa} key={index} />
                        ))
                }

                <button
                    onClick={() => agregarMesa({ uid: usuario.uid })}
                    className="size-full p-4 border-4 border-slate-800 rounded flex flex-col justify-center items-center font-semibold"
                >
                    <IconoMas className="size-10" />
                    Agregar mesa
                </button>
            </section>

            {
                mesas.filter(mesas => mesas.linea).length > 0 && (
                    <>
                        <h2 className="my-8 text-center font-bold text-xl">Pedidos en línea</h2>
                        <section className="grid grid-cols-[repeat(auto-fill,minmax(min(180px,100%),1fr))] [grid-auto-rows:200px;] gap-8 my-8">
                            {
                                mesas.filter(mesas => mesas.linea).map((mesa, index) => (
                                    <CardMesa mesa={mesa} key={index} />
                                ))
                            }
                        </section>
                    </>
                )
            }

            <button
                onClick={handlePedidoLinea}
                className="fixed bottom-4 inset-x-8 border-4 border-slate-800 bg-slate-800 text-white p-3 rounded hover:bg-white hover:text-slate-800"
            >Registrar pedido en línea</button>
        </main>
    );
}

export default Inicio;
