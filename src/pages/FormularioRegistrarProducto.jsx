import { useForm } from 'react-hook-form';
import { useRestauranteStore } from '../store/restauranteStore';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthProvider';

function FormularioRegistrarProducto(){
    const { register, handleSubmit, formState } = useForm({
        defaultValues: {
            nombre: "",
            precio: ""
        }
    });
    const navigate = useNavigate();
    const { usuario } = useAuth();

    const agregarProducto = useRestauranteStore(state => state.agregarProducto);

    const onSubmit = async (data) => {
        await agregarProducto(usuario.uid, {
            nombre: data.nombre,
            precio: data.precio
        });
        navigate("/");
    }

    return(
        <main className="container mx-auto p-8">
            <h1 className="text-center text-2xl font-bold">Registrar producto</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 my-8">
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
        </main>
    )
}

export default FormularioRegistrarProducto;