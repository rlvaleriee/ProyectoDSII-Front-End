// EnviosModal.tsx
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
  Button
} from "reactstrap";
import Swal from "sweetalert2";
import type { IEnvios } from "../Interfaces/IEnvios";
import { appsettings } from "../settings/appsettings";

interface EnviosModalProps {
  isOpen: boolean;
  toggle: () => void;
  envio?: IEnvios;
  onSuccess: () => void;
}

export function EnviosModal({
  isOpen,
  toggle,
  envio,
  onSuccess
}: EnviosModalProps) {
  const [formData, setFormData] = useState<IEnvios>({
    idEnvios: envio?.idEnvios ?? 0,
    idCliente: envio?.idCliente ?? 0,
    idRuta: envio?.idRuta ?? 0,
    fechaSolicitud: envio?.fechaSolicitud ?? "",
    fechaEntregaEsperada: envio?.fechaEntregaEsperada ?? "",
    estado: envio?.estado ?? "",
    mercancia: envio?.mercancia ?? "",
    pesoTotal: envio?.pesoTotal ?? 0,
    volumenTotal: envio?.volumenTotal ?? 0
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
        volumenTotal: 0
      });
    }
  }, [envio, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        e.target.type === "number" ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async () => {
    try {
      const method = envio ? "PUT" : "POST";
      const url = envio
        ? `${appsettings.apiUrl}Envio/Editar`
        : `${appsettings.apiUrl}Envio/Nuevo`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        Swal.fire({
          title: envio ? "Envío actualizado" : "Envío creado",
          icon: "success"
        });
        onSuccess();
        toggle();
      } else {
        const text = await response.text();
        Swal.fire("Error", text, "error");
      }
    } catch (err) {
      Swal.fire("Error", String(err), "error");
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>
        {envio ? "Editar Envío" : "Nuevo Envío"}
      </ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="idCliente">Cliente (ID)</Label>
            <Input
              type="number"
              id="idCliente"
              name="idCliente"
              value={formData.idCliente}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="idRuta">Ruta (ID)</Label>
            <Input
              type="number"
              id="idRuta"
              name="idRuta"
              value={formData.idRuta}
              onChange={handleChange}
            />
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
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Cancelar
        </Button>
        <Button color="primary" onClick={handleSubmit}>
          {envio ? "Actualizar" : "Crear"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}