import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthProvider";
import { useRestauranteStore } from "../store/restauranteStore";

import ModalConfirmar from "../components/ModalConfirmar";
import IconoBorrar from "../icons/IconoBorrar";

function Gastos(){
    const { register, handleSubmit, reset, formState } = useForm({
        defaultValues: {
            gasto: "",
            costo: ""
        }
    });

    const { usuario } = useAuth();

    const [gastosAgrupados, setGastosAgrupados] = useState(undefined);
    const [showModal, setShowModal] = useState(false);
    const [idGasto, setIdGasto] = useState(null);

    const gastos = useRestauranteStore(state => state.gastos);
    const agregarGasto = useRestauranteStore(state => state.agregarGasto);
    const borrarGasto = useRestauranteStore(state => state.borrarGasto);
    
    const onSubmit = async data => {
        const promesa = agregarGasto(usuario.uid, data.gasto, data.costo);
        
        await toast.promise(promesa, {
            loading: "Agregando gasto...",
            success: "Gasto agregado",
            error: "No se pudo agregar el gasto",
        })

        reset();
    }

    const handleBorrarGasto = async () => {
        const promesa = borrarGasto(idGasto);

        await toast.promise(promesa, {
            loading: "Borrando gasto...",
            success: "Gasto borrado",
            error: "Error al borrar gasto",
        });
        
        setShowModal(false);
    }

    const handleBorrarConfirm = async idGasto => {
        setShowModal(true);
        setIdGasto(idGasto);
    }

    useEffect(() => {
        if(!gastos) return;

        // Agrupar los gastos por día
        const agrupadosFecha = Object.groupBy(gastos, (gasto) => new Date(gasto.fecha).toLocaleDateString().replaceAll("/", "_"));

        // Obtener solamente los gastos agrupados en un array (ignorando la llave de la fecha que no necesitamos)
        const arrayGastos = Object.values(agrupadosFecha);

        // Calcular los totales para mostrar en las ventas completadas
        const totales = arrayGastos.sort((a, b) => new Date(a[0].fecha)- new Date(b[0].fecha));

        setGastosAgrupados(totales);
    }, [gastos])

    return(
        <main className="container mx-auto p-8">
            <ModalConfirmar
                showModal={showModal}
                mensaje="¿Estás seguro de que deseas eliminar este gasto?"
                aceptarMensaje="Eliminar"
                aceptarColor="bg-red-500"
                onCancel={() => setShowModal(false)}
                onAccept={handleBorrarGasto}
            />

            <h1 className="text-center font-bold text-2xl">Gastos</h1>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                <label className="flex flex-col gap-1">
                    Nombre del gasto
                    <input
                        className="py-1 px-2 border-2 border-slate-800 rounded"
                        type="text"
                        {...register("gasto", {
                            required: {
                                value: true,
                                message: "El nombre del gasto es requerido",
                            },
                        })}
                    />
                    {formState.errors.gasto && (
                        <span className="text-red-500">
                            {formState.errors.gasto.message}
                        </span>
                    )}
                </label>

                <label className="flex flex-col gap-1">
                    Costo
                    <input
                        className="py-1 px-2 border-2 border-slate-800 rounded"
                        type="text"
                        {...register("costo", {
                            required: {
                                value: true,
                                message: "El costo es requerido",
                            },
                            pattern: {
                                value: /\d+/g,
                                message: "Solo se permiten números",
                            },
                        })}
                    />
                    {formState.errors.costo && (
                        <span className="text-red-500">
                            {formState.errors.costo.message}
                        </span>
                    )}
                </label>

                <button className="bg-slate-800 text-white px-4 py-2 rounded">Agregar</button>
            </form>

            <section className="my-8">
                {
                    gastos === undefined ? (
                        <h2 className="font-bold text-xl text-center mt-8">Cargando los gastos...</h2>
                    ) : (
                        gastos.length > 0 ? (
                            gastosAgrupados?.map((gastos, index) => (
                                <article key={index}>
                                    <h2 className="text-2xl font-bold mb-2">Fecha: {new Date(gastos[0].fecha).toLocaleDateString()}</h2>
                                    <ul className="flex flex-col gap-2">
                                        {
                                            gastos.map((gasto, index) => (
                                                <li key={index} className="flex justify-between">
                                                    <div className="flex gap-2 items-center">
                                                        <span>{gasto.gasto}</span>
                                                        <button
                                                            onClick={() => handleBorrarConfirm(gasto.id)}
                                                            aria-label="Borrar gasto"
                                                        >
                                                            <IconoBorrar className="size-7 text-red-500 transition-transform hover:translate-x-1" />
                                                        </button>
                                                    </div>
                                                    <span>${gasto.costo}</span>
                                                </li>
                                            ))
                                        }
                                        <li className="font-bold text-end">Gasto total: ${gastos.reduce((acc, ac) => acc + ac.costo, 0)}</li>
                                    </ul>
                                </article>
                            ))
                        ) : (
                            <h2 className="font-bold text-xl text-center mt-8">No hay gastos registrados</h2>
                        )
                    )
                }
            </section>
        </main>
    )
}

export default Gastos;