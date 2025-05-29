export interface IVistaEnvio {
  idEnvios: number;
  idCliente: number;       // agregado para edición
  idRuta: number;          // agregado para edición
  fechaSolicitud: string;
  fechaEntregaEsperada: string;
  estado: string;
  mercancia: string;
  peso: number;
  volumen: number;
  cliente: string;
  origen: string;
  destino: string;
  costo: number;  
}
