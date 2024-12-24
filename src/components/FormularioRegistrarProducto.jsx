import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthProvider";
import { useRestauranteStore } from "../store/restauranteStore";

function FormularioRegistrarProducto({ setShowCategoriaForm }) {
    const { register, handleSubmit, formState, reset } = useForm({
        defaultValues: {
            fileFoto: undefined,
            nombre: "",
            precio: "",
            categorias: [],
        },
    });
    const [foto, setFoto] = useState(null);

    const { usuario } = useAuth();

    const categorias = useRestauranteStore(state => state.categorias);
    const agregarProducto = useRestauranteStore(state => state.agregarProducto);

    const handleFoto = (e) => {
        // Se crea un blob temporal que sirve para mostrar la imagen que está por subirse en ese momento
        setFoto(URL.createObjectURL(e.target.files[0]));
    }

    const onSubmit = async (data) => {
        await agregarProducto(usuario.uid, {
            fileFoto: data.fileFoto[0],
            nombre: data.nombre,
            precio: data.precio,
            categorias: data.categorias
        });
        reset();
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="lg:max-h-[calc(100dvh-90px)] overflow-auto flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <label
                    className="bg-slate-800 text-white px-4 py-2 rounded text-center cursor-pointer"
                    htmlFor="foto"
                >Subir foto</label>
                <input
                    type="file"
                    id="foto"
                    accept="image/*"
                    hidden
                    {...register("fileFoto", {
                        onChange: (e) => handleFoto(e),
                    })}
                />
                <img className="w-[90%] max-w-72 mx-auto" src={foto} />
            </div>

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
