import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { Toaster } from "react-hot-toast";

import AuthProvider from "./context/AuthProvider";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";

import Inicio from "./pages/Inicio";
import FormularioPedidoMesa from "./pages/FormularioPedidoMesa";
import FormularioPedidoLinea from "./pages/FormularioPedidoLinea";
import RegistrarProducto from "./pages/RegistrarProducto";
import VentasCompletadas from "./pages/VentasCompletadas";

function App(){
    return(
        <BrowserRouter>
            <AuthProvider>
                <Toaster />
                <Navbar />
                <ScrollToTop>
                    <Routes>
                        <Route path="/" element={<Inicio />} />
                        <Route path="/mesa/:id" element={<FormularioPedidoMesa />} />
                        <Route path="/pedido-en-linea/:id" element={<FormularioPedidoLinea />} />
                        <Route path="/registrar-producto" element={<RegistrarProducto />} />
                        <Route path="/ventas-completadas" element={<VentasCompletadas />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </ScrollToTop>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App;