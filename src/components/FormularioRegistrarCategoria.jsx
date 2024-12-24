import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthProvider";
import { useRestauranteStore } from "../store/restauranteStore";
import IconoBorrar from "../icons/IconoBorrar";

function FormularioRegistrarCategoria({ setShowCategoriaForm }) {
    const { register, handleSubmit, formState, reset } = useForm({
        defaultValues: {
            categoria: "",
        },
    });

    const { usuario } = useAuth();

    const categorias = useRestauranteStore(state => state.categorias);
    const agregarCategoria = useRestauranteStore(state => state.agregarCategoria);
    const borrarCategoria = useRestauranteStore(state => state.borrarCategoria);

    const onSubmit = async data => {
        await agregarCategoria(usuario.uid, {
            categoria: data.categoria,
        });
        reset();
    };

    return (
        <div className="lg:max-h-[calc(100dvh-90px)] overflow-auto">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
            >
                <h2 className="text-center font-bold text-xl">
                    Editar categorías
                </h2>

                <button
                    type="button"
                    className="self-end underline"
                    onClick={() => {
                        setShowCategoriaForm(false);
                        reset();
                    }}
                >
                    Regresar
                </button>

                <div className="flex flex-col gap-1">
                    <label htmlFor="categoria">Nombre de la categoría</label>
                    <input
                        className="py-1 px-2 border-2 border-slate-800 rounded"
                        type="text"
                        {...register("categoria", {
                            required: {
                                value: true,
                                message: "La categoría es requerida",
                            },
                        })}
                    />
                    {formState.errors.categoria && (
                        <span className="text-red-500">
                            {formState.errors.categoria.message}
                        </span>
                    )}
                </div>

                <button className="bg-slate-800 text-white px-4 py-2 rounded">
                    Crear
                </button>
            </form>
            <ul className="flex flex-col gap-2 mt-8">
                {categorias?.map(categoria => (
                    <li
                        key={categoria.id}
                        className="flex gap-2 justify-between items-center py-1 px-4 border-b-2 border-slate-800"
                    >
                        {categoria.categoria}
                        <button
                            onClick={() => borrarCategoria(categoria.id)}
                            aria-label="Borrar producto"
                        >
                            <IconoBorrar className="size-7 text-red-500 transition-transform hover:translate-x-1" />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default FormularioRegistrarCategoria;
