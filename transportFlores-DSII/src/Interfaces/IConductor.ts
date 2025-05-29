import type { IUnidades } from "./IUnidades";

export interface IConductore {
    idConductores?: number;         // Id del conductor, puede ser opcional si se usa al crear el conductor
    nombre: string;                 // Nombre del conductor
    licencia: string;               // Licencia del conductor
    fechaIngreso?: string;          // Fecha de ingreso, opcional si no está definido
    estado: string;                 // Estado del conductor (activo, inactivo, etc.)
    telefono: string;               // Teléfono del conductor
    idVehiculo?: number;            // ID del vehículo asignado al conductor (opcional)
    idVehiculoNavigation?: IUnidades; // Relación con la unidad (vehículo), si es necesario
}
