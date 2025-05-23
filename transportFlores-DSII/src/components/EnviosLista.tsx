// EnviosLista.tsx
import { useState, useEffect } from "react";
import { appsettings } from "../settings/appsettings";
import Swal from "sweetalert2";
import type { IEnvios } from "../Interfaces/IEnvios";
import { Container, Row, Col, Table, Button } from "reactstrap";
import { EnviosModal } from "./EnviosModal";
import "bootstrap-icons/font/bootstrap-icons.css";

interface EnviosListaProps {
  handleViewChange: (view: 'dashboard') => void;
}

export function EnviosLista({ handleViewChange }: EnviosListaProps) {
  const [envios, setEnvios] = useState<IEnvios[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEnvio, setSelectedEnvio] = useState<IEnvios>();

  const toggleModal = () => setModalOpen(!modalOpen);

  const obtenerEnvios = async () => {
    try {
      const response = await fetch(`${appsettings.apiUrl}Envio/Lista`);
      if (response.ok) {
        setEnvios(await response.json());
      }
    } catch (error) {
      console.error("Error al obtener envíos:", error);
    }
  };

  useEffect(() => {
    obtenerEnvios();
  }, []);

  const onNuevo = () => {
    setSelectedEnvio(undefined);
    toggleModal();
  };

  const onEditar = (envio: IEnvios) => {
    setSelectedEnvio(envio);
    toggleModal();
  };

  const Eliminar = (id: number) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await fetch(`${appsettings.apiUrl}Envio/Eliminar/${id}`, {
          method: "DELETE"
        });
        if (response.ok) obtenerEnvios();
      }
    });
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col sm={{ size: 8, offset: 2 }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="m-0">Lista de Envíos</h4>
            <div className="d-flex gap-2">
              <Button
                className="btn btn-secondary btn-sm shadow-sm"
                onClick={() => handleViewChange("dashboard")}
              >
                <i className="bi bi-house-door me-2" />
                Inicio
              </Button>
              <Button color="success" onClick={onNuevo}>
                <i className="bi bi-plus-circle me-2" />
                Nuevo Envío
              </Button>
            </div>
          </div>

          <Table
            bordered
            hover
            responsive
            className="align-middle text-center table-striped table-bordered text-nowrap"
          >
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Ruta</th>
                <th>Fecha Solicitud</th>
                <th>Entrega Esperada</th>
                <th>Estado</th>
                <th>Mercancía</th>
                <th>Peso (kg)</th>
                <th>Volumen (m³)</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {envios.map((item) => (
                <tr key={item.idEnvios}>
                  <td>{item.idCliente}</td>
                  <td>{item.idRuta}</td>
                  <td>{item.fechaSolicitud}</td>
                  <td>{item.fechaEntregaEsperada}</td>
                  <td>{item.estado}</td>
                  <td>{item.mercancia}</td>
                  <td>{item.pesoTotal}</td>
                  <td>{item.volumenTotal}</td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        onClick={() => onEditar(item)}
                      >
                        <i className="bi bi-pencil-square" />
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        onClick={() => Eliminar(item.idEnvios!)}
                      >
                        <i className="bi bi-trash" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      <EnviosModal
        isOpen={modalOpen}
        toggle={toggleModal}
        envio={selectedEnvio}
        onSuccess={obtenerEnvios}
      />
    </Container>
  );
}
