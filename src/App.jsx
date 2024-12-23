import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import AuthProvider from "./context/AuthProvider";
import Navbar from "./components/Navbar";

import Inicio from "./pages/Inicio";
import FormularioPedidoMesa from "./pages/FormularioPedidoMesa";
import FormularioPedidoLinea from "./pages/FormularioPedidoLinea";
import FormularioRegistrarProducto from "./pages/FormularioRegistrarProducto";

function App(){
    return(
        <BrowserRouter>
            <AuthProvider>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Inicio />} />
                    <Route path="/mesa/:id" element={<FormularioPedidoMesa />} />
                    <Route path="/pedido-en-linea/:id" element={<FormularioPedidoLinea />} />
                    <Route path="registrar-producto" element={<FormularioRegistrarProducto />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App;