import { useEffect, useState } from "react";
import { appsettings } from "../settings/appsettings";
import type { IFacturacion } from "../Interfaces/IFacturacion";
import type { IDetalleFacturacion } from "../Interfaces/IDetalleFacturacion";
import type { ICliente } from "../Interfaces/ICliente";
import { FacturacionModal } from "./FacturacionModal";
import { Button } from "reactstrap";
import Swal from "sweetalert2";
import { DataTable } from "./DataTable";

interface FacturacionListaProps {
  handleViewChange: (view: "dashboard") => void;
}

export function FacturacionLista({ handleViewChange }: FacturacionListaProps) {
  const [facturaciones, setFacturaciones] = useState<IFacturacion[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedFacturacion, setSelectedFacturacion] = useState<IFacturacion | undefined>();
  const [clientes, setClientes] = useState<ICliente[]>([]);

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

  const obtenerFacturaciones = async (): Promise<void> => {
    try {
      const response = await fetch(`${appsettings.apiUrl}Facturacion/Lista`);
      if (response.ok) {
        const rawData = await response.json();

        const data: IFacturacion[] = Array.isArray(rawData) 
          ? rawData.map((item: any) => ({
              IdFacturacion: Number(item.idFacturacion) || 0,
              IdCliente: Number(item.idCliente) || 0,
              NombreCliente: String(item.nombreCliente || "Cliente Desconocido"),
              FechaFactura: String(item.fechaFactura || ""),
              MontoTotal: Number(item.montoTotal) || 0,
              EstadoPago: String(item.estadoPago || "Pendiente"),
              IdEnvio: Number(item.idEnvio) || 0,
            }))
          : [];

        setFacturaciones(data);
      } else {
        setFacturaciones([]);
      }
    } catch (error) {
      console.error("Error al obtener facturaciones:", error);
      setFacturaciones([]);
    }
  };

  const obtenerDetallesFacturacion = async (idFacturacion: number): Promise<IDetalleFacturacion[]> => {
    try {
      const response = await fetch(`${appsettings.apiUrl}DetalleFacturacion/PorFactura/${idFacturacion}`);
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) 
          ? data.map((item: any) => ({
              IdDetalleFacturacion: Number(item.idDetalleFacturacion) || 0,
              Detalle: String(item.detalle || ""),
              Precio: Number(item.precio) || 0,
            }))
          : [];
      }
      return [];
    } catch (error) {
      console.error("Error al obtener detalles:", error);
      return [];
    }
  };

  const descargarFacturaPDF = async (facturacion: IFacturacion): Promise<void> => {
    try {
      // Mostrar loading
      Swal.fire({
        title: 'Generando PDF...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Obtener detalles
      const detalles = await obtenerDetallesFacturacion(facturacion.IdFacturacion);
      
      // Generar PDF
      await generarPDFFactura(facturacion, detalles);
      
      Swal.close();
    } catch (error) {
      console.error("Error al generar PDF:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo generar el PDF",
        icon: "error"
      });
    }
  };

  const generarPDFFactura = async (facturacion: IFacturacion, detalles: IDetalleFacturacion[]): Promise<void> => {
    const contenidoPDF = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Factura ${facturacion.IdFacturacion}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #2c5aa0;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2c5aa0;
          }
          .invoice-title {
            font-size: 32px;
            font-weight: bold;
            color: #2c5aa0;
          }
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .info-box {
            width: 45%;
          }
          .info-box h3 {
            margin: 0 0 10px 0;
            color: #2c5aa0;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          .info-box p {
            margin: 5px 0;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .table th, .table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          .table th {
            background-color: #2c5aa0;
            color: white;
            font-weight: bold;
          }
          .table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .total-section {
            margin-top: 30px;
            text-align: right;
          }
          .total-box {
            display: inline-block;
            border: 2px solid #2c5aa0;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .total-amount {
            font-size: 24px;
            font-weight: bold;
            color: #2c5aa0;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          .status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status.pagado {
            background-color: #d4edda;
            color: #155724;
          }
          .status.pendiente {
            background-color: #fff3cd;
            color: #856404;
          }
          .status.vencido {
            background-color: #f8d7da;
            color: #721c24;
          }
          .status.cancelado {
            background-color: #f8d7da;
            color: #721c24;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">
            🚚 SISTEMA DE ENVÍOS
          </div>
          <div class="invoice-title">
            FACTURA
          </div>
        </div>

        <div class="info-section">
          <div class="info-box">
            <h3>📋 Información de Factura</h3>
            <p><strong>Número:</strong> #${facturacion.IdFacturacion.toString().padStart(6, '0')}</p>
            <p><strong>Fecha:</strong> ${new Date(facturacion.FechaFactura).toLocaleDateString('es-ES')}</p>
            <p><strong>Estado:</strong> <span class="status ${facturacion.EstadoPago.toLowerCase()}">${facturacion.EstadoPago}</span></p>
            <p><strong>ID Envío:</strong> #${facturacion.IdEnvio}</p>
          </div>
          
          <div class="info-box">
            <h3>👤 Información del Cliente</h3>
            <p><strong>Cliente:</strong> ${facturacion.NombreCliente}</p>
            <p><strong>ID Cliente:</strong> ${facturacion.IdCliente}</p>
            <p><strong>Fecha de Emisión:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </div>

        <h3>📦 Detalles del Servicio</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th style="text-align: right;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${detalles.map(detalle => `
              <tr>
                <td>${detalle.Detalle}</td>
                <td style="text-align: right;">$${detalle.Precio.toFixed(2)}</td>
              </tr>
            `).join('')}
            ${detalles.length === 0 ? `
              <tr>
                <td>Servicio de envío</td>
                <td style="text-align: right;">$${facturacion.MontoTotal.toFixed(2)}</td>
              </tr>
            ` : ''}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-box">
            <p style="margin: 0 0 10px 0;">TOTAL A PAGAR</p>
            <div class="total-amount">$${facturacion.MontoTotal.toFixed(2)}</div>
          </div>
        </div>

        <div class="footer">
          <p>Gracias por confiar en nuestros servicios de envío</p>
          <p>Esta factura fue generada automáticamente el ${new Date().toLocaleString('es-ES')}</p>
        </div>
      </body>
      </html>
    `;

    // Crear ventana para imprimir/guardar como PDF
    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(contenidoPDF);
      ventana.document.close();
      
      // Esperar a que cargue y luego mostrar diálogo de impresión
      ventana.onload = () => {
        setTimeout(() => {
          ventana.print();
        }, 100);
      };
    }
  };

  useEffect(() => {
    obtenerFacturaciones();
    obtenerClientes();
  }, []);

  const abrirModal = (facturacion?: IFacturacion): void => {
    setSelectedFacturacion(facturacion);
    setModalOpen(true);
  };

  const cerrarModal = (): void => {
    setSelectedFacturacion(undefined);
    setModalOpen(false);
  };

  const onSuccessModal = (): void => {
    cerrarModal();
    obtenerFacturaciones();
  };

  return (
    <div className="mt-2">
      <div className="d-flex justify-content-between align-items-center mb-3 px-3">
        <h4 className="m-0">Lista de Facturaciones</h4>
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
            Nueva Facturación
          </Button>
        </div>
      </div>

      <DataTable<IFacturacion>
        data={facturaciones}
        searchKeys={["IdFacturacion", "NombreCliente", "EstadoPago"]}
        itemsPerPageOptions={[5, 10, 15]}
        defaultItemsPerPage={5}
        
        onNuevo={() => abrirModal()}
        columns={[
          { 
            key: "IdFacturacion", 
            label: "# Factura",
            render: (item: IFacturacion) => `#${item.IdFacturacion.toString().padStart(6, '0')}`
          },
          {
            key: "IdCliente",
            label: "Cliente",
            render: (item: IFacturacion) => {
              const cliente = clientes.find(c => c.idClientes === item.IdCliente);
              return cliente ? cliente.nombreCliente : "Cliente desconocido";
            }
          },
          { 
            key: "FechaFactura", 
            label: "Fecha",
            render: (item: IFacturacion) => new Date(item.FechaFactura).toLocaleDateString('es-ES')
          },
          { 
            key: "MontoTotal", 
            label: "Monto Total",
            render: (item: IFacturacion) => `$${item.MontoTotal.toFixed(2)}`
          },
          { 
            key: "EstadoPago", 
            label: "Estado",
            render: (item: IFacturacion) => (
              <span 
                className={`badge ${
                  item.EstadoPago.toLowerCase() === 'pagado' ? 'bg-success' :
                  item.EstadoPago.toLowerCase() === 'pendiente' ? 'bg-warning' :
                  item.EstadoPago.toLowerCase() === 'cancelado' ? 'bg-secondary' :
                  'bg-danger'
                }`}
              >
                {item.EstadoPago}
              </span>
            )
          },
          {
            key: "acciones",
            label: "PDF",
            render: (item: IFacturacion) => (
              <Button
                color="primary"
                size="sm"
                onClick={() => descargarFacturaPDF(item)}
                title="Descargar Factura en PDF"
              >
                <i className="bi bi-file-earmark-pdf" />
              </Button>
            )
          }
        ]}
      />

      <FacturacionModal
        isOpen={modalOpen}
        toggle={cerrarModal}
        facturacion={selectedFacturacion}
        clientes={clientes}
        onSuccess={onSuccessModal}
      />
    </div>
  );
}