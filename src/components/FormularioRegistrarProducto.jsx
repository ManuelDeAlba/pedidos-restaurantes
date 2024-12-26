import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import imageCompression from "browser-image-compression";

import { useAuth } from "../context/AuthProvider";
import { useRestauranteStore } from "../store/restauranteStore";

const defaultFormValues = {
    fileFoto: undefined,
    nombre: "",
    precio: "",
    categorias: [],
}

function FormularioRegistrarProducto({ setShowCategoriaForm, productoEditando, setProductoEditando, limpiarFormulario, setLimpiarFormulario }) {
    const { register, handleSubmit, formState, reset, getValues, setValue } = useForm({
        defaultValues: defaultFormValues,
    });
    const [foto, setFoto] = useState(null);

    const { usuario } = useAuth();

    const categorias = useRestauranteStore(state => state.categorias);
    const agregarProducto = useRestauranteStore(state => state.agregarProducto);
    const editarProducto = useRestauranteStore(state => state.editarProducto);

    const handleFoto = async (e) => {
        const file = e.target.files[0];
        if(!file) return;

        // Se comprime la imagen y se crea un Blob temporal para mostrar la imagen
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 300,
            useWebWorker: true,
            fileType: "image/webp"
        }

        const compressedBlob = await imageCompression(file, options);
        
        setValue("fileFoto", compressedBlob) // Se sobreescribe el File por la versión comprimida
        setFoto(URL.createObjectURL(compressedBlob)); // Se crea la URL con el Blob para la previsualización
    }

    const onSubmit = async (data) => {
        if(!productoEditando){
            await agregarProducto(usuario.uid, {
                fileFoto: data.fileFoto,
                nombre: data.nombre,
                precio: data.precio,
                categorias: data.categorias
            });
        } else {
            const { fileFoto: [file] } = getValues();

            // Si file no existe, se manda undefined, lo que significa que la imagen no se edita
            // Si file existe, se manda la nueva imagen
            await editarProducto({
                id: productoEditando.id,
                nombre: data.nombre,
                precio: data.precio,
                categorias: data.categorias,
                fileFoto: file,
            })
        }
        reset(defaultFormValues);
        setFoto(null);
        setProductoEditando(false);
    }

    useEffect(() => {
        if (!productoEditando) return;

        reset({
            nombre: productoEditando.nombre,
            precio: productoEditando.precio,
            categorias: productoEditando.categorias.map(categoria => categoria),
        });
        setFoto(productoEditando.url);
    }, [productoEditando])

    useEffect(() => {
        if(!limpiarFormulario) return;

        reset(defaultFormValues);
        setFoto(null);
        setLimpiarFormulario(false);
        setProductoEditando(false);
    }, [limpiarFormulario])

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
                        <option
                            key={categoria.id}
                            value={categoria.id}
                        >
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
                {
                    !productoEditando ? "Registrar producto" : "Editar producto"
                }
            </button>
        </form>
    );
}

export default FormularioRegistrarProducto;
