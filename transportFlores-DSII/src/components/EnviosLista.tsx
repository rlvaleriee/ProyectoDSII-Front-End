import { useEffect, useState } from "react";
import { appsettings } from "../settings/appsettings";
import type { IVistaEnvio } from "../Interfaces/IVistaEnvio";
import type { IEnvios } from "../Interfaces/IEnvios"; 
import type { ICliente } from "../Interfaces/ICliente";
import type { IRuta } from "../Interfaces/IRuta";
import { EnviosModal } from "./EnviosModal";
import { Button } from "reactstrap";
import Swal from "sweetalert2";
import { DataTable } from "./DataTable";

interface EnviosListaProps {
  handleViewChange: (view: "dashboard") => void;
}

export function EnviosLista({ handleViewChange }: EnviosListaProps) {
  const [envios, setEnvios] = useState<IVistaEnvio[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEnvio, setSelectedEnvio] = useState<IEnvios | undefined>();
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [rutas, setRutas] = useState<IRuta[]>([]);

  const obtenerClientes = async () => {
    try {
      const response = await fetch(`${appsettings.apiUrl}Cliente/Lista`);
      if (response.ok) {
        const data = await response.json();
        setClientes(data);
      }
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    }
  };

  const obtenerRutas = async () => {
    try {
      const response = await fetch(`${appsettings.apiUrl}Ruta/Lista`);
      if (response.ok) {
        const data = await response.json();
        setRutas(data);
      }
    } catch (error) {
      console.error("Error al obtener rutas:", error);
    }
  };

  const obtenerEnvios = async () => {
    try {
      const response = await fetch(`${appsettings.apiUrl}VistaEnvio/Lista`);
      if (response.ok) {
        const data: IVistaEnvio[] = await response.json();

        const enviosLimpios = data.map(e => ({
          idEnvios: e.idEnvios,
          idCliente: e.idCliente,
          idRuta: e.idRuta,
          fechaSolicitud: e.fechaSolicitud ?? "",
          fechaEntregaEsperada: e.fechaEntregaEsperada ?? "",
          estado: e.estado ?? "",
          mercancia: e.mercancia ?? "",
          peso: e.peso ?? 0,
          volumen: e.volumen ?? 0,
          cliente: e.cliente ?? "Desconocido",
          origen: e.origen ?? "Desconocido",
          destino: e.destino ?? "Desconocido",
          costo: e.costo ?? 0,
        }));

        setEnvios(enviosLimpios);
      }
    } catch (error) {
      console.error("Error al obtener envíos:", error);
    }
  };

  const eliminarEnvio = async (id: number | string) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡Esta acción no se puede deshacer!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      const response = await fetch(`${appsettings.apiUrl}Envio/Eliminar/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        obtenerEnvios();
      }
    }
  };

  // Función para convertir IVistaEnvio a IEnvios
  const convertirVistaEnvioAEnvios = (vistaEnvio: IVistaEnvio): IEnvios => {
    // Función auxiliar para convertir fechas al formato correcto
    const formatearFecha = (fecha: string): string => {
      if (!fecha) return "";
      try {
        const fechaObj = new Date(fecha);
        return fechaObj.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      } catch {
        return fecha; // Si no se puede convertir, devolver como está
      }
    };

    return {
      idEnvios: vistaEnvio.idEnvios,
      idCliente: vistaEnvio.idCliente,
      idRuta: vistaEnvio.idRuta,
      fechaSolicitud: formatearFecha(vistaEnvio.fechaSolicitud),
      fechaEntregaEsperada: formatearFecha(vistaEnvio.fechaEntregaEsperada),
      estado: vistaEnvio.estado,
      mercancia: vistaEnvio.mercancia,
      pesoTotal: vistaEnvio.peso,
      volumenTotal: vistaEnvio.volumen,
      CostoEnvio: vistaEnvio.costo,
    };
  };

  useEffect(() => {
    obtenerEnvios();
    obtenerClientes();
    obtenerRutas();
  }, []);

  const abrirModal = (envio?: IVistaEnvio) => {
    if (envio) {
      console.log("Envío original de la vista:", envio);
      const envioConvertido = convertirVistaEnvioAEnvios(envio);
      console.log("Envío convertido para el modal:", envioConvertido);
      setSelectedEnvio(envioConvertido);
    } else {
      console.log("Abriendo modal para nuevo envío");
      setSelectedEnvio(undefined);
    }
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setSelectedEnvio(undefined);
    setModalOpen(false);
  };

  return (
    <div className="mt-2">
      <div className="d-flex justify-content-between align-items-center mb-3 px-3">
        <h4 className="m-0">Lista de Envíos</h4>
        <div className="d-flex gap-2">
          <Button
            color="secondary"
            size="sm"
            onClick={() => handleViewChange("dashboard")}
          >
            <i className="bi bi-house-door me-2" />
            Inicio
          </Button>
          <Button color="success" size="sm" onClick={() => abrirModal()}>
            <i className="bi bi-plus-circle me-2" />
            Nuevo Envío
          </Button>
        </div>
      </div>

      <DataTable<IVistaEnvio>
        data={envios}
        searchKeys={[
          "estado",
          "mercancia",
          "fechaSolicitud",
          "fechaEntregaEsperada",
          "cliente",
          "origen",
          "destino",
        ]}
        itemsPerPageOptions={[5, 10, 15]}
        defaultItemsPerPage={5}
        onEditar={(envio) => abrirModal(envio)}
        onEliminar={(id) => eliminarEnvio(id)}
        onNuevo={() => abrirModal()}
        columns={[
          { key: "cliente", label: "Cliente" },
          { key: "origen", label: "Origen" },
          { key: "destino", label: "Destino" },
          { key: "fechaSolicitud", label: "Fecha Solicitud" },
          { key: "fechaEntregaEsperada", label: "Fecha Entrega Esperada" },
          { key: "estado", label: "Estado" },
          { key: "mercancia", label: "Mercancía" },
          { key: "peso", label: "Peso (kg)" },
          { key: "volumen", label: "Volumen (m³)" },
          { key: "costo", label: "Costo Envío" },
        ]}
      />

      <EnviosModal
        isOpen={modalOpen}
        toggle={cerrarModal}
        envio={selectedEnvio}
        clientes={clientes}
        rutas={rutas}
        onSuccess={() => {
          cerrarModal();
          obtenerEnvios();
        }}
      />
    </div>
  );
}