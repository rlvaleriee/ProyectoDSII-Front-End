import { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";
import Swal from "sweetalert2";
import type { IEnvios } from "../Interfaces/IEnvios";
import type { ICliente } from "../Interfaces/ICliente";
import type { IRuta } from "../Interfaces/IRuta";
import { appsettings } from "../settings/appsettings";

interface EnviosModalProps {
  isOpen: boolean;
  toggle: () => void;
  envio?: IEnvios;
  clientes: ICliente[];
  rutas: IRuta[];
  onSuccess: () => void;
}

// Tipo para el estado del formulario que permite strings temporalmente en campos numéricos
type FormDataState = Omit<IEnvios, 'pesoTotal' | 'volumenTotal' | 'CostoEnvio'> & {
  pesoTotal: number | string;
  volumenTotal: number | string;
  CostoEnvio: number | string;
};

export function EnviosModal({ 
  isOpen, 
  toggle, 
  envio, 
  clientes, 
  rutas, 
  onSuccess 
}: EnviosModalProps) {
  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const obtenerFechaActual = () => {
    const fecha = new Date();
    return fecha.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<FormDataState>({
    idCliente: 0,
    idRuta: 0,
    fechaSolicitud: obtenerFechaActual(),
    fechaEntregaEsperada: obtenerFechaActual(),
    estado: "",
    mercancia: "",
    pesoTotal: 0,
    volumenTotal: 0,
    CostoEnvio: 0,
  });

  useEffect(() => {
    if (isOpen) {
      console.log("Modal abierto. Envío recibido:", envio);
      if (envio) {
        // Editando: cargar datos del envío
        const datosFormulario = {
          idEnvios: envio.idEnvios,
          idCliente: envio.idCliente,
          idRuta: envio.idRuta,
          fechaSolicitud: envio.fechaSolicitud,
          fechaEntregaEsperada: envio.fechaEntregaEsperada,
          estado: envio.estado,
          mercancia: envio.mercancia,
          pesoTotal: envio.pesoTotal,
          volumenTotal: envio.volumenTotal,
          CostoEnvio: envio.CostoEnvio,
        };
        console.log("Datos que se cargarán en el formulario:", datosFormulario);
        setFormData(datosFormulario);
      } else {
        // Nuevo: resetear con valores por defecto
        const datosNuevos = {
          idCliente: 0,
          idRuta: 0,
          fechaSolicitud: obtenerFechaActual(),
          fechaEntregaEsperada: obtenerFechaActual(),
          estado: "",
          mercancia: "",
          pesoTotal: 0,
          volumenTotal: 0,
          CostoEnvio: 0,
        };
        console.log("Nuevo envío, datos iniciales:", datosNuevos);
        setFormData(datosNuevos);
      }
    }
  }, [envio, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: 
        type === "number"
          ? value === "" ? "" : Number(value) // Permitir string vacío temporalmente
          : name === "idCliente" || name === "idRuta"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.idCliente || !formData.idRuta) {
      Swal.fire("Error", "Debe seleccionar un cliente y una ruta.", "error");
      return;
    }

    try {
      // Preparar datos para envío, convirtiendo strings vacíos a 0
      const dataToSend = {
        ...formData,
        pesoTotal: formData.pesoTotal === "" ? 0 : Number(formData.pesoTotal),
        volumenTotal: formData.volumenTotal === "" ? 0 : Number(formData.volumenTotal),
        CostoEnvio: formData.CostoEnvio === "" ? 0 : Number(formData.CostoEnvio),
      };

      const method = formData.idEnvios ? "PUT" : "POST";
      const url =
        method === "PUT"
          ? `${appsettings.apiUrl}Envio/Editar`
          : `${appsettings.apiUrl}Envio/Nuevo`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        Swal.fire({
          title: method === "PUT" ? "Envío actualizado" : "Envío creado",
          icon: "success",
        });
        onSuccess();
        toggle();
      } else {
        const text = await response.text();
        Swal.fire("Error", text, "error");
      }
    } catch (error) {
      Swal.fire("Error", String(error), "error");
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>
        {formData.idEnvios ? "Editar Envío" : "Nuevo Envío"}
      </ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="idCliente">Cliente</Label>
            <Input
              type="select"
              id="idCliente"
              name="idCliente"
              value={formData.idCliente}
              onChange={handleChange}
            >
              <option value={0}>Seleccione...</option>
              {clientes.map((c) => (
                <option key={c.idClientes} value={c.idClientes}>
                  {c.nombreCliente}
                </option>
              ))}
            </Input>
          </FormGroup>

          <FormGroup>
            <Label for="idRuta">Ruta</Label>
            <Input
              type="select"
              id="idRuta"
              name="idRuta"
              value={formData.idRuta}
              onChange={handleChange}
            >
              <option value={0}>Seleccione...</option>
              {rutas.map((r) => (
                <option key={r.idRutas} value={r.idRutas}>
                  {r.origen} - {r.destino}
                </option>
              ))}
            </Input>
          </FormGroup>

          <FormGroup>
            <Label for="fechaSolicitud">Fecha Solicitud</Label>
            <Input
              type="date"
              id="fechaSolicitud"
              name="fechaSolicitud"
              value={formData.fechaSolicitud}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label for="fechaEntregaEsperada">Fecha Entrega Esperada</Label>
            <Input
              type="date"
              id="fechaEntregaEsperada"
              name="fechaEntregaEsperada"
              value={formData.fechaEntregaEsperada}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label for="estado">Estado</Label>
            <Input
              type="select"
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
            >
              <option value="">Seleccione...</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Camino">En Camino</option>
              <option value="Entregado">Entregado</option>
            </Input>
          </FormGroup>

          <FormGroup>
            <Label for="mercancia">Mercancía</Label>
            <Input
              type="text"
              id="mercancia"
              name="mercancia"
              value={formData.mercancia}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label for="pesoTotal">Peso Total (kg)</Label>
            <Input
              type="number"
              step="0.01"
              id="pesoTotal"
              name="pesoTotal"
              value={formData.pesoTotal}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label for="volumenTotal">Volumen Total (m³)</Label>
            <Input
              type="number"
              step="0.01"
              id="volumenTotal"
              name="volumenTotal"
              value={formData.volumenTotal}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label for="CostoEnvio">Costo Envío</Label>
            <Input
              type="number"
              step="0.01"
              id="CostoEnvio"
              name="CostoEnvio"
              value={formData.CostoEnvio}
              onChange={handleChange}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Cancelar
        </Button>
        <Button color="primary" onClick={handleSubmit}>
          {formData.idEnvios ? "Actualizar" : "Crear"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}