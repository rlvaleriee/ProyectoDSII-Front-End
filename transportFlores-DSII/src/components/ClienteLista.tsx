// ClienteLista.tsx
import { useState, useEffect } from "react";
import { appsettings } from "../settings/appsettings";
import Swal from "sweetalert2";
import type { ICliente } from "../Interfaces/ICliente";
import { Container, Row, Col, Table, Button } from "reactstrap";
import { ClienteModal } from "./ClienteModal";

interface ClienteListaProps {
  handleViewChange: (
    view:| "dashboard") => void;
}

export function ClienteLista({ handleViewChange }: ClienteListaProps) {
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<ICliente>();

  const toggleModal = () => setModalOpen(!modalOpen);

  const onNuevo = () => {
    setSelectedCliente(undefined);
    toggleModal();
  };

  const onEditar = (c: ICliente) => {
    setSelectedCliente(c);
    toggleModal();
  };

  const obtenerClientes = async () => {
    try {
      const response = await fetch(`${appsettings.apiUrl}Cliente/Lista`);
      if (response.ok) {
        const data = await response.json();
        setClientes(data);
      } else {
        console.error("Error en la respuesta:", response.status);
      }
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    }
  };

  useEffect(() => {
    obtenerClientes();
  }, []);

  const Eliminar = (id: number) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await fetch(
          `${appsettings.apiUrl}Cliente/Eliminar/${id}`,
          { method: "DELETE" }
        );
        if (response.ok) obtenerClientes();
      }
    });
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col sm={{ size: 8, offset: 2 }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="m-0">Lista de Clientes</h4>
            <div className="d-flex gap-2">
              {/* Regresa al dashboard */}
              <Button
                className="btn btn-secondary btn-sm shadow-sm"
                onClick={() => handleViewChange("dashboard")}
              >
                <i className="bi bi-house-door me-2" />
                Inicio
              </Button>

              {/* Abre el modal para crear */}
              <Button color="success" onClick={onNuevo}>
                <i className="bi bi-plus-circle me-2" />
                Nuevo Cliente
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
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Tipo Cliente</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((item) => (
                <tr key={item.idClientes}>
                  <td>{item.nombreCliente}</td>
                  <td>{item.direccion}</td>
                  <td>{item.telefono}</td>
                  <td>{item.email}</td>
                  <td>{item.tipoCliente}</td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      {/* Edita desde el modal */}
                      <Button
                        className="btn btn-sm btn-primary"
                        onClick={() => onEditar(item)}
                      >
                        <i className="bi bi-pencil-square me-1" />
                      </Button>
                      {/* Elimina */}
                      <Button
                        size="sm"
                        color="danger"
                        onClick={() => Eliminar(item.idClientes!)}
                      >
                        <i className="bi bi-trash me-1" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* Modal de Crear/Editar */}
      <ClienteModal
        isOpen={modalOpen}
        toggle={toggleModal}
        cliente={selectedCliente}
        onSuccess={obtenerClientes}
      />
    </Container>
  );
}
