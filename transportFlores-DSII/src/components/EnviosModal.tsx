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
  onSuccess: () => void;
}

export function EnviosModal({ isOpen, toggle, envio, onSuccess }: EnviosModalProps) {
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [rutas, setRutas] = useState<IRuta[]>([]);

  const [formData, setFormData] = useState<IEnvios>({
    idEnvios: 0,
    idCliente: 0,
    idRuta: 0,
    fechaSolicitud: "",
    fechaEntregaEsperada: "",
    estado: "",
    mercancia: "",
    pesoTotal: 0,
    volumenTotal: 0,
    CostoEnvio: 0,
  });

  useEffect(() => {
    if (envio) {
      setFormData({ ...envio });
    } else {
      setFormData({
        idEnvios: 0,
        idCliente: 0,
        idRuta: 0,
        fechaSolicitud: "",
        fechaEntregaEsperada: "",
        estado: "",
        mercancia: "",
        pesoTotal: 0,
        volumenTotal: 0,
        CostoEnvio: 0,
      });
    }
  }, [envio, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const clientesResp = await fetch(`${appsettings.apiUrl}Cliente/Lista`);
        if (clientesResp.ok) setClientes(await clientesResp.json());

        const rutasResp = await fetch(`${appsettings.apiUrl}Ruta/Lista`);
        if (rutasResp.ok) setRutas(await rutasResp.json());
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    fetchData();
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" || e.target.tagName === "SELECT"
          ? value === "" ? 0 : Number(value)
          : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.idCliente || !formData.idRuta) {
      Swal.fire("Error", "Debe seleccionar un cliente y una ruta.", "error");
      return;
    }

    try {
      const method = formData.idEnvios && formData.idEnvios > 0 ? "PUT" : "POST";
      const url =
        method === "PUT"
          ? `${appsettings.apiUrl}Envio/Editar`
          : `${appsettings.apiUrl}Envio/Nuevo`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
        {formData.idEnvios && formData.idEnvios > 0 ? "Editar Envío" : "Nuevo Envío"}
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
                <option key={r.idRuta} value={r.idRuta}>
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
          {formData.idEnvios && formData.idEnvios > 0 ? "Actualizar" : "Crear"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
