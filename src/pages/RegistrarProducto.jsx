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

    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const categorias = useRestauranteStore(state => state.categorias);

    const handleCategoriaClick = (idCategoria) => {
        if (categoriaSeleccionada === idCategoria) setCategoriaSeleccionada(null);
        else setCategoriaSeleccionada(idCategoria);
    }

    const handleEditarProducto = producto => {
        setProductoEditando(producto);
        window.scrollTo(0, 0);
    }

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
                showModal={showModal}
                mensaje="¿Estás seguro de que deseas eliminar este producto?"
                aceptarMensaje="Eliminar"
                aceptarColor="bg-red-500"
                onCancel={() => setShowModal(false)}
                onAccept={handleBorrar}
            />

            <h1 className="text-center text-2xl font-bold mb-8">Registrar producto</h1>


            <div className="relative grid gap-8 my-8 grid-cols-1 md:grid-cols-3 [grid-template-areas:'formularios''filtros''productos'] md:[grid-template-areas:'filtros_filtros_filtros''formularios_productos_productos']">
                {/* Formularios producto y categorías */}
                <div className="mb-8 lg:mb-0 lg:h-max lg:sticky lg:top-20 [grid-area:formularios]">
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
                
                {/* Filtros */}
                <div className="grow flex flex-wrap gap-2 lg:max-h-max [grid-area:filtros]">
                    {categorias?.map(categoria => (
                        <button
                            key={categoria.id}
                            className={`whitespace-nowrap flex-1 border-2 border-slate-800 ${categoriaSeleccionada === categoria.id ? "bg-slate-800 text-white" : "text-slate-800"} text-lg px-4 py-1 rounded-sm`}
                            type="button"
                            onClick={() => handleCategoriaClick(categoria.id)}
                        >
                            {categoria.categoria}
                        </button>
                    ))}
                </div>

                {
                    productos === undefined ? (
                        <h1 className="text-center text-3xl font-bold my-8 [grid-area:productos]">Cargando...</h1>
                    ) : (
                        productos?.length > 0 ? (
                            <section className="grid grid-cols-[repeat(auto-fill,minmax(min(180px,100%),1fr))] gap-8 text-center [grid-area:productos]">
                                {/* Lista de productos */}
                                {productos.filter(producto => categoriaSeleccionada === null || producto.categorias.includes(categoriaSeleccionada)).map(producto => (
                                    <article key={producto.id} className="flex flex-col gap-y-1 max-h-fit border-2 border-slate-800 rounded-sm p-4">
                                        <div className="flex flex-wrap gap-2 justify-end">
                                            <button
                                                onClick={() => handleEditarProducto(producto)}
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
                                        <h2 className="text-xl font-bold text-black/80">{producto.nombre}</h2>
                                        <img
                                            src={producto.url ?? "https://placehold.co/150"}
                                            alt={`Imagen de ${producto.nombre}`}
                                            className="w-full h-32 object-contain object-center mb-2"
                                        />
                                        <span className="flex-1 self-end text-lg font-bold text-black/70">${producto.precio}</span>
                                        <div className="flex flex-wrap gap-1">
                                            {
                                                categorias?.filter(categoria => producto.categorias.includes(categoria.id)).map(categoria => (
                                                    <span className="flex-1 text-sm border border-slate-800 rounded-full px-2 py-1" key={categoria.id}>{categoria.categoria}</span>
                                                ))
                                            }
                                        </div>
                                    </article>
                                ))}
                            </section>
                        ) : (
                            <h1 className="text-center text-3xl font-bold my-8 [grid-area:productos]">No hay productos registrados</h1>
                        )
                    )
                }
            </div>
        </main>
    )
}

export default RegistrarProducto;