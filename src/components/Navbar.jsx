import { Link } from "react-router";
import { useAuth } from "../context/AuthProvider";
import { useRef } from "react";

import IconoSalir from "../icons/IconoSalir";
import IconoMenu from "../icons/IconoMenu";
import { useRestauranteStore } from "../store/restauranteStore";

function Navbar() {
    const inputRef = useRef(null);
    const { usuario, iniciarSesionGoogle, cerrarSesion } = useAuth();

    const restaurante = useRestauranteStore(state => state.restaurante);

    const cerrarNav = () => {
        inputRef.current.checked = false;
    }

    return (
        <nav className="flex flex-wrap gap-4 justify-between items-center p-4 h-14 bg-gray-800 text-white sticky top-0 z-50">
            <input ref={inputRef} className="peer hidden" type="checkbox" id="menu-toggle" />

            {usuario && <span className="hidden md:inline">{restaurante?.usuario}</span>}

            <div className="hidden peer-checked:flex fixed top-0 left-0 w-full h-dvh bg-gray-800 flex-col justify-center items-center gap-4 md:static md:w-auto md:h-auto md:bg-transparent md:flex md:flex-row md:ml-auto z-40">
                <Link onClick={cerrarNav} to="/">Inicio</Link>

                {!usuario ? (
                    <button onClick={() => {
                        iniciarSesionGoogle();
                        cerrarNav();
                    }}>
                        Iniciar sesión
                    </button>
                ) : (
                    <>
                        <Link onClick={cerrarNav} to="/registrar-producto">Registrar producto</Link>
                        <Link onClick={cerrarNav} to="/ventas-completadas">Ventas</Link>
                        <Link onClick={cerrarNav} to="/gastos">Gastos</Link>
                        <button className="flex gap-2 group" aria-label="Cerrar sesión" onClick={() => {
                            cerrarSesion();
                            cerrarNav();
                        }}>
                            <IconoSalir />
                            <span className="md:hidden">Cerrar sesión</span>
                        </button>
                    </>
                )}
            </div>

            <label
                htmlFor="menu-toggle"
                className="ml-auto cursor-pointer md:hidden z-50"
            >
                <IconoMenu />
            </label>
        </nav>
    );
}

export default Navbar;
