import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import AuthProvider from "./context/AuthProvider";
import Navbar from "./components/Navbar";

import Inicio from "./pages/Inicio";

function App(){
    return(
        <BrowserRouter>
            <AuthProvider>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Inicio />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App;