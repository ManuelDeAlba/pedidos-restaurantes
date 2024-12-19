import { create } from "zustand";

export const useRestauranteStore = create((set, get) => ({
    mesas: [
        {
            nombre: "Mesa 1",
            ordenes: [
                {
                    nombre: "Taco de discada",
                    precio: 15,
                    cantidad: 2,
                },
                {
                    nombre: "Coca Cola 500ml",
                    precio: 20,
                    cantidad: 1,
                }
            ]
        }
    ],
    agregarMesa: () => {
        // TODO: Agregar la mesa a la lista de mesas y a la base de datos
        const prevMesas = get().mesas;
        set(() => ({
            mesas: [
                ...get().mesas,
                {
                    nombre: `Mesa ${prevMesas.length + 1}`,
                    ordenes: [],
                },
            ],
        }));
    },
}))