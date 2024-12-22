import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRestauranteStore } from '../store/restauranteStore';
import { useAuth } from '../context/AuthProvider';

const listFormatter = new Intl.ListFormat('es', {
    type: "conjunction"
});

function FormularioRegistrarProducto(){
    const { register, handleSubmit, formState, reset } = useForm({
        defaultValues: {
            nombre: "",
            precio: "",
            categorias: []
        }
    });
    const { register:registerCategorias, handleSubmit:handleSubmitCategorias, formState:formStateCategorias, reset:resetCategorias } = useForm({
        defaultValues: {
            categoria: ""
        }
    });
    const { usuario } = useAuth();
    const [showCategoriaForm, setShowCategoriaForm] = useState(false);

    const productos = useRestauranteStore(state => state.productos);
    const agregarProducto = useRestauranteStore(state => state.agregarProducto);
    const borrarProducto = useRestauranteStore(state => state.borrarProducto);

    const categorias = useRestauranteStore(state => state.categorias);
    const agregarCategoria = useRestauranteStore(state => state.agregarCategoria);
    const borrarCategoria = useRestauranteStore(state => state.borrarCategoria);

    const onSubmit = async (data) => {
        await agregarProducto(usuario.uid, {
            nombre: data.nombre,
            precio: data.precio,
            categorias: data.categorias
        });
        reset();
    }

    const onSubmitCategorias = async (data) => {
        await agregarCategoria(usuario.uid, {
            categoria: data.categoria
        })
        resetCategorias();
    }

    return(
        <main className="container mx-auto p-8">
            <h1 className="text-center text-2xl font-bold">Registrar producto</h1>

            <div className='relative flex flex-col lg:flex-row gap-8 my-8'>
                <div className="flex-grow lg:h-max lg:sticky lg:top-20">
                    {
                        !showCategoriaForm ? (
                            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                                {/* // TODO: Poder agregar una imagen */}
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="nombre">Nombre del producto</label>
                                    <input className="py-1 px-2 border-2 border-slate-800 rounded" type="text" {...register("nombre", {
                                        required: {
                                            value: true,
                                            message: "El nombre es requerido"
                                        }
                                    })} />
                                    {formState.errors.nombre && <span className="text-red-500">{formState.errors.nombre.message}</span>}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label htmlFor="precio">Precio</label>
                                    <input className="py-1 px-2 border-2 border-slate-800 rounded" type="text" {...register("precio", {
                                        required: {
                                            value: true,
                                            message: "El precio es requerido"
                                        },
                                        pattern: {
                                            value: /\d+/g,
                                            message: "Solo se permiten números"
                                        }
                                    })} />
                                    {formState.errors.precio && <span className="text-red-500">{formState.errors.precio.message}</span>}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label htmlFor="categorias">Categoría</label>
                                    <select multiple className="py-1 px-2 border-2 border-slate-800 rounded" {...register("categorias", {
                                        required: {
                                            value: true,
                                            message: "Selecciona una o más categorías"
                                        }
                                    })}>
                                        {
                                            categorias?.map(categoria => (
                                                <option key={categoria.id} value={categoria.id}>{categoria.categoria}</option>
                                            ))
                                        }
                                    </select>
                                    {formState.errors.categorias && <span className="text-red-500">{formState.errors.categorias.message}</span>}
                                    <button type="button" onClick={() => setShowCategoriaForm(true)} className="self-end underline">Editar categorías</button>
                                </div>

                                <button className="bg-slate-800 text-white px-4 py-2 rounded">Registrar</button>
                            </form>
                        ) : (
                            <div>
                                <form onSubmit={handleSubmitCategorias(onSubmitCategorias)} className="flex flex-col gap-4">
                                    <h2 className="text-center font-bold text-xl">Editar categorías</h2>

                                    <button type="button" className="self-end underline" onClick={() => {
                                        setShowCategoriaForm(false);
                                        resetCategorias();
                                    }}>Regresar</button>

                                    <div className="flex flex-col gap-1">
                                        <label htmlFor="categoria">Nombre de la categoría</label>
                                        <input className="py-1 px-2 border-2 border-slate-800 rounded" type="text" {...registerCategorias("categoria", {
                                            required: {
                                                value: true,
                                                message: "La categoría es requerida"
                                            }
                                        })} />
                                        {formStateCategorias.errors.categoria && <span className="text-red-500">{formStateCategorias.errors.categoria.message}</span>}
                                    </div>

                                    <button className="bg-slate-800 text-white px-4 py-2 rounded">Crear</button>
                                </form>
                                <ul className="flex flex-col gap-2 mt-8">
                                    {
                                        categorias?.map(categoria => (
                                            <li key={categoria.id} className="flex gap-2 justify-between items-center py-1 px-4 border-b-2 border-slate-800">
                                                {categoria.categoria}
                                                <button
                                                    onClick={() => borrarCategoria(categoria.id)}
                                                    aria-label="Borrar producto"
                                                >
                                                    <svg
                                                        className="size-7 text-red-500 transition-transform hover:translate-x-1"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path
                                                            stroke="none"
                                                            d="M0 0h24v24H0z"
                                                            fill="none"
                                                        />
                                                        <path d="M4 7l16 0" />
                                                        <path d="M10 11l0 6" />
                                                        <path d="M14 11l0 6" />
                                                        <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                                                        <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                                                    </svg>
                                                </button>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        )
                    }
                </div>

                {
                    productos === undefined ? (
                        <h1 className="text-center text-3xl font-bold my-8 flex-grow-[4]">Cargando...</h1>
                    ) : (
                        productos?.length > 0 ? (
                            <section className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-8 text-center flex-grow-[4]">
                                {productos.map(producto => (
                                    <article key={producto.id} className="flex flex-col gap-2 border-2 border-slate-800 rounded p-4">
                                        <button
                                            className="self-end"
                                            onClick={() => borrarProducto(producto.id)}
                                            aria-label="Borrar producto"
                                        >
                                            <svg
                                                className="size-7 text-red-500 transition-transform hover:-translate-y-1"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path
                                                    stroke="none"
                                                    d="M0 0h24v24H0z"
                                                    fill="none"
                                                />
                                                <path d="M4 7l16 0" />
                                                <path d="M10 11l0 6" />
                                                <path d="M14 11l0 6" />
                                                <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                                                <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                                            </svg>
                                        </button>
                                        <img
                                            src="https://placehold.co/150"
                                            alt={`Imagen de ${producto.nombre}`}
                                            className="w-full h-32 object-cover object-center mb-2"
                                        />
                                        <h2 className="text-xl font-bold text-black/80">{producto.nombre}</h2>
                                        <span className="flex-1 self-end text-lg font-bold text-slate-800">${producto.precio}</span>
                                        <span>{
                                            listFormatter.format(
                                                categorias.filter(categoria => producto.categorias.includes(categoria.id)).map(categoria => categoria.categoria)
                                            )
                                        }</span>
                                    </article>
                                ))}
                            </section>
                        ) : (
                            <h1 className="text-center text-3xl font-bold my-8 flex-grow-[4]">No hay productos registrados</h1>
                        )
                    )
                }
            </div>
        </main>
    )
}

export default FormularioRegistrarProducto;