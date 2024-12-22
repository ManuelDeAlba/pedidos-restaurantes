import { useForm } from 'react-hook-form';
import { useRestauranteStore } from '../store/restauranteStore';
import { useAuth } from '../context/AuthProvider';

function FormularioRegistrarProducto(){
    const { register, handleSubmit, formState, reset } = useForm({
        defaultValues: {
            nombre: "",
            precio: ""
        }
    });
    const { usuario } = useAuth();

    const productos = useRestauranteStore(state => state.productos);
    const agregarProducto = useRestauranteStore(state => state.agregarProducto);
    const borrarProducto = useRestauranteStore(state => state.borrarProducto);

    const onSubmit = async (data) => {
        await agregarProducto(usuario.uid, {
            nombre: data.nombre,
            precio: data.precio
        });
        reset();
    }

    return(
        <main className="container mx-auto p-8">
            <h1 className="text-center text-2xl font-bold">Registrar producto</h1>

            <div className='relative flex flex-col lg:flex-row gap-8 my-8'>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 flex-grow h-max sticky top-20">
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

                    <button className="bg-slate-800 text-white px-4 py-2 rounded">Registrar</button>
                </form>

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
                                        <span className="self-end text-lg font-bold text-slate-800">${producto.precio}</span>
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