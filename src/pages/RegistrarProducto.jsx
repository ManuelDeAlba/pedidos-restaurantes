import { useState } from 'react';
import toast from 'react-hot-toast';

import { useRestauranteStore } from '../store/restauranteStore';

import FormularioRegistrarProducto from '../components/FormularioRegistrarProducto';
import FormularioRegistrarCategoria from '../components/FormularioRegistrarCategoria';
import ModalConfirmar from '../components/ModalConfirmar';

import IconoBorrar from '../icons/IconoBorrar';
import IconoEditar from '../icons/IconoEditar';

const listFormatter = new Intl.ListFormat('es', {
    type: "conjunction"
});

function RegistrarProducto(){
    // Estado para mostrar el formulario necesario (registrar producto o agregar categoría)
    const [showCategoriaForm, setShowCategoriaForm] = useState(false);

    const [productoEditando, setProductoEditando] = useState(undefined);
    const [limpiarFormulario, setLimpiarFormulario] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [idProducto, setIdProducto] = useState(null);

    const productos = useRestauranteStore(state => state.productos);
    const borrarProducto = useRestauranteStore(state => state.borrarProducto);

    const categorias = useRestauranteStore(state => state.categorias);

    const handleBorrar = async () => {
        if(!idProducto) return;

        const promesa = borrarProducto(idProducto);
        await toast.promise(promesa, {
            loading: "Borrando producto...",
            success: "Producto borrado",
            error: "Error al borrar producto",
        });

        setLimpiarFormulario(true);
        setShowModal(false);
    }

    const handleBorrarConfirm = (idProducto) => {
        setShowModal(true);
        setIdProducto(idProducto);
    }

    return(
        <main className="container mx-auto p-8">
            <ModalConfirmar
                className={"bg-white flex flex-col gap-8 p-8 rounded"}
                showModal={showModal}
            >
                <h2 className="text-center font-bold text-xl">¿Estás seguro de que deseas eliminar este producto?</h2>

                <div className="flex flex-wrap gap-4">
                    <button onClick={() => setShowModal(false)} className="flex-1 min-w-fit bg-slate-800 text-white px-4 py-2 rounded cursor-pointer">Cancelar</button>
                    <button onClick={handleBorrar} className="flex-1 min-w-fit bg-red-500 text-white px-4 py-2 rounded cursor-pointer">Eliminar</button>
                </div>
            </ModalConfirmar>

            <h1 className="text-center text-2xl font-bold">Registrar producto</h1>

            <div className='flex flex-col lg:grid md:grid-cols-3 relative gap-8 my-8'>
                <div className="col-span-1 lg:h-max lg:sticky lg:top-20">
                    {
                        !showCategoriaForm ? (
                            <FormularioRegistrarProducto
                                setShowCategoriaForm={setShowCategoriaForm}
                                productoEditando={productoEditando}
                                setProductoEditando={setProductoEditando}
                                limpiarFormulario={limpiarFormulario}
                                setLimpiarFormulario={setLimpiarFormulario}
                            />
                        ) : (
                            <FormularioRegistrarCategoria setShowCategoriaForm={setShowCategoriaForm} />
                        )
                    }
                </div>

                {
                    productos === undefined ? (
                        <h1 className="col-span-2 text-center text-3xl font-bold my-8">Cargando...</h1>
                    ) : (
                        productos?.length > 0 ? (
                            <section className="col-span-2 grid grid-cols-[repeat(auto-fill,minmax(min(180px,100%),1fr))] gap-8 text-center">
                                {productos.map(producto => (
                                    <article key={producto.id} className="flex flex-col gap-2 border-2 border-slate-800 rounded p-4">
                                        <div className="flex flex-wrap gap-2 justify-end">
                                            <button
                                                onClick={() => setProductoEditando(producto)}
                                                aria-label="Editar producto"
                                            >
                                                <IconoEditar className="size-7 text-orange-400 transition-transform hover:-translate-y-1" />
                                            </button>
                                            <button
                                                onClick={() => handleBorrarConfirm(producto.id)}
                                                aria-label="Borrar producto"
                                            >
                                                <IconoBorrar className="size-7 text-red-500 transition-transform hover:-translate-y-1" />
                                            </button>
                                        </div>
                                        <img
                                            src={producto.url ?? "https://placehold.co/150"}
                                            alt={`Imagen de ${producto.nombre}`}
                                            className="w-full h-32 object-contain object-center mb-2"
                                        />
                                        <h2 className="text-xl font-bold text-black/80">{producto.nombre}</h2>
                                        <span className="flex-1 self-end text-lg font-bold text-slate-800">${producto.precio}</span>
                                        <span>{
                                            listFormatter.format(
                                                categorias?.filter(categoria => producto.categorias.includes(categoria.id)).map(categoria => categoria.categoria)
                                            )
                                        }</span>
                                    </article>
                                ))}
                            </section>
                        ) : (
                            <h1 className="col-span-2 text-center text-3xl font-bold my-8">No hay productos registrados</h1>
                        )
                    )
                }
            </div>
        </main>
    )
}

export default RegistrarProducto;