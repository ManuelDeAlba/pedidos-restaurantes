import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthProvider";

import { useRestauranteStore } from "../store/restauranteStore";

import CardMesa from "../components/CardMesa";
import IconoMas from "../icons/IconoMas";
import IconoEditar from "../icons/IconoEditar";

function Inicio() {
    const { usuario, iniciarSesionGoogle } = useAuth();
    const navigate = useNavigate();

    const [nombreRestaurante, setNombreRestaurante] = useState("");
    const [editandoNombre, setEditandoNombre] = useState(false);

    const restaurante = useRestauranteStore(state => state.restaurante);
    const editarNombreRestaurante = useRestauranteStore(state => state.editarNombreRestaurante);
    
    const agregarMesa = useRestauranteStore(state => state.agregarMesa);
    const mesas = useRestauranteStore(state => state.mesas);

    const handleAgregarMesa = async (uid) => {
        const promesa = agregarMesa({ uid });
        await toast.promise(promesa, {
            loading: "Agregando mesa...",
            success: "Mesa agregada",
            error: "Error al agregar mesa",
        });
    }

    const handlePedidoLinea = async () => {
        const promesa = agregarMesa({
            uid: usuario.uid,
            nombre: "Pedido nuevo",
            linea: true
        });
        const mesaVirtual = await toast.promise(promesa, {
            loading: "Creando pedido en línea...",
            success: "Pedido en línea creado",
            error: "Error al crear pedido en línea",
        });
        navigate(`/pedido-en-linea/${mesaVirtual.id}`);
    }

    const handleEditarRestaurante = async (e) => {
        e.preventDefault();

        const promesa = editarNombreRestaurante(restaurante.id, nombreRestaurante);
        await toast.promise(promesa, {
            loading: "Editando nombre de restaurante...",
            success: "Nombre de restaurante editado",
            error: "Error al editar nombre de restaurante",
        });

        setEditandoNombre(false);
    }

    useEffect(() => {
        if(!restaurante) return;

        setNombreRestaurante(restaurante.nombre);
    }, [restaurante])

    if (usuario === null) {
        return (
            <main className="flex flex-col items-center my-10">
                <h1 className="text-center text-3xl font-bold mb-8">Inicia sesión para continuar</h1>
                <button
                    className="bg-slate-800 text-white px-4 py-2 rounded-sm"
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
            {
                !editandoNombre ? (
                    <div className="grid grid-cols-[1fr_auto] mb-4">
                        <h1 className="text-center font-bold text-2xl">{restaurante.nombre}</h1>

                        <button
                            className="ml-auto"
                            onClick={() => setEditandoNombre(true)}
                            aria-label="Editar nombre de restaurante"
                        >
                            <IconoEditar className="size-7 text-orange-400 transition-transform hover:-translate-y-1" />
                        </button>
                    </div>
                ) : (
                    <form
                        className="flex flex-wrap gap-4 mb-4"
                        onSubmit={handleEditarRestaurante}
                    >
                        <input
                            type="text"
                            value={nombreRestaurante}
                            onChange={e => setNombreRestaurante(e.target.value)}
                            className="max-w-full flex-grow-3 py-1 px-2 border-2 border-slate-800 rounded-sm"
                        />
                        <button className="flex-1 bg-slate-800 text-white px-4 py-2 rounded-sm cursor-pointer">Aceptar</button>
                    </form>
                )
            }

            <section className="grid grid-cols-[repeat(auto-fill,minmax(min(180px,100%),1fr))] [grid-auto-rows:200px;] gap-8 my-8">
                {
                    mesas.filter(mesas => !mesas.linea).length > 0 &&
                        mesas.filter(mesas => !mesas.linea).map((mesa, index) => (
                            <CardMesa mesa={mesa} key={index} />
                        ))
                }

                <button
                    onClick={() => handleAgregarMesa(usuario.uid)}
                    className="size-full p-4 border-4 border-slate-800 rounded-sm flex flex-col justify-center items-center font-semibold"
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
                                    <CardMesa linea={true} mesa={mesa} key={index} />
                                ))
                            }
                        </section>
                    </>
                )
            }

            <button
                onClick={handlePedidoLinea}
                className="fixed bottom-4 inset-x-8 border-4 border-slate-800 bg-slate-800 text-white p-3 rounded-sm hover:bg-white hover:text-slate-800"
            >Registrar pedido en línea</button>
        </main>
    );
}

export default Inicio;
