import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthProvider";
import { useRestauranteStore } from "../store/restauranteStore";

function FormularioRegistrarProducto({ setShowCategoriaForm }) {
    const { register, handleSubmit, formState, reset } = useForm({
        defaultValues: {
            nombre: "",
            precio: "",
            categorias: [],
        },
    });

    const { usuario } = useAuth();

    const categorias = useRestauranteStore(state => state.categorias);
    const agregarProducto = useRestauranteStore(state => state.agregarProducto);

    const onSubmit = async (data) => {
        await agregarProducto(usuario.uid, {
            nombre: data.nombre,
            precio: data.precio,
            categorias: data.categorias
        });
        reset();
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* // TODO: Poder agregar una imagen */}
            <div className="flex flex-col gap-1">
                <label htmlFor="nombre">Nombre del producto</label>
                <input
                    className="py-1 px-2 border-2 border-slate-800 rounded"
                    type="text"
                    {...register("nombre", {
                        required: {
                            value: true,
                            message: "El nombre es requerido",
                        },
                    })}
                />
                {formState.errors.nombre && (
                    <span className="text-red-500">
                        {formState.errors.nombre.message}
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor="precio">Precio</label>
                <input
                    className="py-1 px-2 border-2 border-slate-800 rounded"
                    type="text"
                    {...register("precio", {
                        required: {
                            value: true,
                            message: "El precio es requerido",
                        },
                        pattern: {
                            value: /\d+/g,
                            message: "Solo se permiten números",
                        },
                    })}
                />
                {formState.errors.precio && (
                    <span className="text-red-500">
                        {formState.errors.precio.message}
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor="categorias">Categoría</label>
                <select
                    multiple
                    className="py-1 px-2 border-2 border-slate-800 rounded"
                    {...register("categorias", {
                        required: {
                            value: true,
                            message: "Selecciona una o más categorías",
                        },
                    })}
                >
                    {categorias?.map(categoria => (
                        <option key={categoria.id} value={categoria.id}>
                            {categoria.categoria}
                        </option>
                    ))}
                </select>
                {formState.errors.categorias && (
                    <span className="text-red-500">
                        {formState.errors.categorias.message}
                    </span>
                )}
                <button
                    type="button"
                    onClick={() => setShowCategoriaForm(true)}
                    className="self-end underline"
                >
                    Editar categorías
                </button>
            </div>

            <button className="bg-slate-800 text-white px-4 py-2 rounded">
                Registrar
            </button>
        </form>
    );
}

export default FormularioRegistrarProducto;
