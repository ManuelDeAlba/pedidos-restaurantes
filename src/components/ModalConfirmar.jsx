function ModalConfirmar({ children, className, showModal }){
    return(
        <div className={`fixed flex justify-center items-center inset-0 bg-black/70 z-50 ${showModal ? "opacity-100" : "opacity-0 pointer-events-none"} transition-opacity`}>
            <div className={className}>
                {children}
            </div>
        </div>
    )
}

export default ModalConfirmar;