import { Link } from "react-router";
import { useAuth } from "../context/AuthProvider";
import { useRef } from "react";

function Navbar() {
    const inputRef = useRef(null);
    const { usuario, iniciarSesionGoogle, cerrarSesion } = useAuth();

    const cerrarNav = () => {
        inputRef.current.checked = false;
    }

    return (
        <nav className="flex flex-wrap gap-4 justify-between items-center p-4 h-14 bg-gray-800 text-white">
            <input ref={inputRef} className="peer hidden" type="checkbox" id="menu-toggle" />

            {usuario && <span>{usuario.displayName}</span>}

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
                        <Link onClick={cerrarNav} to="/historial">Historial</Link>
                        <button className="flex gap-2 group" onClick={() => {
                            cerrarSesion();
                            cerrarNav();
                        }}>
                            <svg
                                className="size-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path
                                    stroke="none"
                                    d="M0 0h24v24H0z"
                                    fill="none"
                                />
                                <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                                <path d="M9 12h12l-3 -3" />
                                <path d="M18 15l3 -3" />
                            </svg>
                            <span className="md:hidden">Cerrar sesión</span>
                        </button>
                    </>
                )}
            </div>

            <label
                htmlFor="menu-toggle"
                className="ml-auto cursor-pointer md:hidden z-50"
            >
                <svg
                    className="fill-current text-white/80"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                >
                    <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
                </svg>
            </label>
        </nav>
    );
}

export default Navbar;
