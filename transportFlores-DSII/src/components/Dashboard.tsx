import { Row, Col, Card, Button } from 'reactstrap';

type DashboardProps = {
  handleViewChange: (newView: 'dashboard' | 'clientes' | 'unidades' | 'envios') => void;
};

export default function Dashboard({ handleViewChange }: DashboardProps) {
  return (
    <>
      <h2 className="fw-bold mb-4">Dashboard</h2>
      <Row className="g-4">
        <Col md="6" lg="3">
          <Card body className="text-center shadow-sm border-0">
            <i className="bi bi-people-fill fs-1 text-primary mb-3"></i>
            <h5 className="mb-3">Lista de Clientes</h5>
            <Button color="primary" onClick={() => handleViewChange('clientes')}>
              Ver Clientes
            </Button>
          </Card>
        </Col>

        <Col md="6" lg="3">
          <Card body className="text-center shadow-sm border-0">
            <i className="bi bi-person-plus-fill fs-1 text-success mb-3"></i>
            <h5 className="mb-3">Registrar Cliente</h5>
            <Button color="success" onClick={() => handleViewChange('clientes')}>
              Nuevo Cliente
            </Button>
          </Card>
        </Col>

        <Col md="6" lg="3">
          <Card body className="text-center shadow-sm border-0">
            <i className="bi bi-truck-front-fill fs-1 text-info mb-3"></i>
            <h5 className="mb-3">Lista de Unidades</h5>
            <Button color="info" onClick={() => handleViewChange('unidades')}>
              Ver Unidades
            </Button>
          </Card>
        </Col>

        <Col md="6" lg="3">
          <Card body className="text-center shadow-sm border-0">
            <i className="bi bi-send-check-fill fs-1 text-warning mb-3"></i>
            <h5 className="mb-3">Lista de Envíos</h5>
            <Button color="warning" onClick={() => handleViewChange('envios')}>
              Ver Envíos
            </Button>
          </Card>
        </Col>
      </Row>
    </>
  );
}
