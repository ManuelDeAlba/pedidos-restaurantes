function ModalConfirmar({ children, className, showModal, mensaje, cancelarMensaje, aceptarMensaje, onCancel, onAccept }){
    return(
        <div className={`fixed flex justify-center items-center inset-0 bg-black/70 z-50 ${showModal ? "opacity-100" : "opacity-0 pointer-events-none"} transition-opacity`}>
            <div className="bg-white flex flex-col gap-8 p-8 rounded">
                <h2 className="text-center font-bold text-xl">{mensaje}</h2>

                {children && (
                    <div className={className}>
                        {children}
                    </div>
                )}

                <div className="flex flex-wrap gap-4">
                    <button onClick={onCancel} className="flex-1 min-w-fit bg-slate-800 text-white px-4 py-2 rounded cursor-pointer">{cancelarMensaje}</button>
                    <button onClick={onAccept} className="flex-1 min-w-fit bg-red-500 text-white px-4 py-2 rounded cursor-pointer">{aceptarMensaje}</button>
                </div>
            </div>
        </div>
    )
}

export default ModalConfirmar;