// UnidadesLista.tsx
import { useState, useEffect } from "react";
import { appsettings } from "../settings/appsettings";
import Swal from "sweetalert2";
import type { IUnidades } from "../Interfaces/IUnidades";
import { Container, Row, Col, Table, Button } from "reactstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { UnidadesModal } from "./UnidadesModal";

interface UnidadesListaProps {
  handleViewChange: (
    view:| 'dashboard') => void;
}

export function UnidadesLista({ handleViewChange }: UnidadesListaProps) {
  const [unidades, setUnidades] = useState<IUnidades[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUnidad, setSelectedUnidad] = useState<IUnidades>();

  const toggleModal = () => setModalOpen(!modalOpen);

  const onNuevo = () => {
    setSelectedUnidad(undefined);
    toggleModal();
  };

  const onEditar = (u: IUnidades) => {
    setSelectedUnidad(u);
    toggleModal();
  };

  const obtenerUnidades = async () => {
    try {
      const resp = await fetch(`${appsettings.apiUrl}Unidades/Lista`);
      if (resp.ok) {
        setUnidades(await resp.json());
      } else {
        console.error("Error en la respuesta:", resp.status);
      }
    } catch (err) {
      console.error("Error al obtener unidades:", err);
    }
  };

  useEffect(() => {
    obtenerUnidades();
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
        const r = await fetch(
          `${appsettings.apiUrl}Unidades/Eliminar/${id}`,
          { method: "DELETE" }
        );
        if (r.ok) obtenerUnidades();
      }
    });
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col sm={{ size: 8, offset: 2 }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="m-0">Lista de Unidades</h4>
            <div className="d-flex gap-2">
              <Button
                className="btn btn-secondary btn-sm shadow-sm"
                onClick={() => handleViewChange("dashboard")}
              >
                <i className="bi bi-house-door me-2" /> Inicio
              </Button>
              <Button color="success" onClick={onNuevo}>
                <i className="bi bi-plus-circle me-2" /> Nueva Unidad
              </Button>
            </div>
          </div>

          <Table
            bordered
            hover
            responsive
            className="align-middle text-center table-striped table-bordered"
          >
            <thead>
              <tr>
                <th>Tipo Unidad</th>
                <th>Placa</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Año</th>
                <th>Estado</th>
                <th>Kilometraje Actual</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {unidades.map((item) => (
                <tr key={item.idUnidades}>
                  <td>{item.tipoUnidad}</td>
                  <td>{item.placa}</td>
                  <td>{item.marca}</td>
                  <td>{item.modelo}</td>
                  <td>{item.año}</td>
                  <td>{item.estado}</td>
                  <td>{item.kilometrajeActual}</td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <Button
                        className="btn btn-sm btn-primary"
                        onClick={() => onEditar(item)}
                      >
                        <i className="bi bi-pencil-square me-1" />
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        onClick={() => Eliminar(item.idUnidades!)}
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

      <UnidadesModal
        isOpen={modalOpen}
        toggle={toggleModal}
        unidad={selectedUnidad}
        onSuccess={obtenerUnidades}
      />
    </Container>
  );
}
