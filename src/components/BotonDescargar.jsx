import { cn } from "../lib/utils";

function BotonDescargar({ datos, type="application/json", nombre="descarga", className, children, ...props }){
    const handleDescargarVentas = () => {
        // Si no hay datos, no se puede descargar nada
        if(!datos) toast.error("No hay datos para descargar");

        // Si hay datos, descargar en formato JSON
        const blob = new Blob([JSON.stringify(datos)], { type });
        const url = URL.createObjectURL(blob);

        // Crear un enlace para descargar el archivo
        const a = document.createElement("a");
        a.href = url;
        a.download = `${nombre}-${new Date().toLocaleDateString().replaceAll("/", "-")}.${type.split("/")[1]}`; // Cambiar el nombre del archivo a ventas-YYYY-MM-DD.json
        a.click();

        // Borrar el objeto URL creado para liberar memoria
        URL.revokeObjectURL(url);
    }

    return(
        <button
            className={cn("block text-black/80 hover:text-black/90 underline font-semibold rounded-sm", className)}
            onClick={handleDescargarVentas}
            {...props}
        >{children}</button>
    )
}

export default BotonDescargar;