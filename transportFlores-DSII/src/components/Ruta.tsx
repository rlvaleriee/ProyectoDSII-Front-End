import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import type { IRuta } from '../Interfaces/IRuta';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MapaProps {
  handleViewChange: (view: 'dashboard') => void;
}

const Mapa: React.FC<MapaProps> = ({ handleViewChange }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const directions = useRef<MapboxDirections | null>(null);
  const [rutaGuardada, setRutaGuardada] = useState<string>('');
  const [ultimaRuta, setUltimaRuta] = useState<any | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-108.242637, 25.672577],
      zoom: 13,
    });

    directions.current = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: 'metric',
      profile: 'mapbox/driving',
      interactive: true,
      controls: { inputs: true, instructions: true },
    });

    map.current.addControl(directions.current, 'top-left');

    directions.current.on('route', (e: any) => {
      if (e?.route?.[0]) {
        setUltimaRuta(e.route[0]);
        setRutaGuardada(''); 
        console.log('📍 Nueva ruta calculada');
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Función para obtener nombre del lugar usando geocoding reverso
  const getPlaceNameFromCoordinates = async (lng: number, lat: number): Promise<string> => {
    try {
      console.log(`🌍 Buscando nombre para coordenadas: ${lat}, ${lng}`);
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&limit=1&language=es&types=place,locality,neighborhood,address`
      );
      
      if (!response.ok) {
        throw new Error(`Error en geocoding: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`🌍 Respuesta geocoding para ${lat}, ${lng}:`, data);
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        
        // Priorizar diferentes tipos de nombres
        let placeName = feature.place_name || feature.text || '';
        
        // Si el nombre es muy largo, intentar obtener una versión más corta
        if (placeName.length > 100) {
          // Intentar usar solo el nombre principal sin la dirección completa
          if (feature.text) {
            placeName = feature.text;
          }
          
          // Si aún es muy largo, obtener partes relevantes
          if (placeName.length > 100) {
            const parts = feature.place_name.split(',');
            if (parts.length >= 2) {
              placeName = `${parts[0].trim()}, ${parts[parts.length - 1].trim()}`;
            }
          }
        }
        
        console.log(`✅ Nombre encontrado: "${placeName}"`);
        return placeName.trim();
      }
      
      console.log(`⚠️ No se encontró nombre para ${lat}, ${lng}, usando coordenadas`);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      
    } catch (error) {
      console.error(`❌ Error en geocoding reverso para ${lat}, ${lng}:`, error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const testSimpleRoute = async () => {
    try {
      const testData = {
        Origen: "San Salvador, El Salvador",
        Destino: "Santa Ana, El Salvador",
        Distancia: 65.5
      };

      console.log('🧪 PROBANDO CON DATOS SIMPLES:');
      console.log('🧪 Datos a enviar:', testData);

      const response = await fetch('http://localhost:5226/api/Ruta/Nuevo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testData),
      });

      console.log('🧪 RESPUESTA:', {
        status: response.status,
        statusText: response.statusText
      });

      const responseText = await response.text();
      console.log('🧪 Response Text:', responseText);

      if (response.ok) {
        const data = JSON.parse(responseText);
        alert(`✅ Test exitoso!\nRuta creada con ID: ${data.rutaId}`);
      } else {
        const errorData = JSON.parse(responseText);
        let errorMsg = `Status: ${response.status}\n`;
        if (errorData.mensaje) errorMsg += `Mensaje: ${errorData.mensaje}\n`;
        if (errorData.errores) errorMsg += `Errores: ${errorData.errores.join(', ')}`;
        alert(`❌ Test falló:\n${errorMsg}`);
      }
    } catch (error) {
      console.error('🧪 ERROR:', error);
      alert(`❌ Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const saveRoute = async () => {
    if (!ultimaRuta) {
      alert('No hay ruta calculada. Por favor, calcula una ruta primero.');
      return;
    }

    if (!directions.current) {
      alert('Error: Sistema de direcciones no disponible.');
      return;
    }

    setGuardando(true);

    try {
      // Obtener datos básicos de la ruta
      const leg = ultimaRuta.legs[0];
      const distanciaKm = leg.distance / 1000;

      console.log('📏 Distancia calculada:', distanciaKm, 'km');

      // Obtener coordenadas de origen y destino
      const originObj = directions.current.getOrigin();
      const destinationObj = directions.current.getDestination();

      console.log('📍 Objetos origen/destino:', { originObj, destinationObj });

      if (!originObj || !destinationObj) {
        throw new Error('No se pudieron obtener las coordenadas de origen y destino');
      }

      // Extraer coordenadas
      let origenCoords: [number, number] | null = null;
      let destinoCoords: [number, number] | null = null;

      // Extraer coordenadas del origen
      if (originObj && typeof originObj === 'object' && 'geometry' in originObj && originObj.geometry.coordinates) {
        origenCoords = [originObj.geometry.coordinates[0], originObj.geometry.coordinates[1]];
      }

      // Extraer coordenadas del destino
      if (destinationObj && typeof destinationObj === 'object' && 'geometry' in destinationObj && destinationObj.geometry.coordinates) {
        destinoCoords = [destinationObj.geometry.coordinates[0], destinationObj.geometry.coordinates[1]];
      }

      if (!origenCoords || !destinoCoords) {
        throw new Error('No se pudieron extraer las coordenadas');
      }

      console.log('📍 Coordenadas extraídas:', {
        origen: origenCoords,
        destino: destinoCoords
      });

      // Convertir coordenadas a nombres de lugares
      console.log('🌍 Iniciando geocoding reverso...');
      
      const [origenNombre, destinoNombre] = await Promise.all([
        getPlaceNameFromCoordinates(origenCoords[0], origenCoords[1]),
        getPlaceNameFromCoordinates(destinoCoords[0], destinoCoords[1])
      ]);

      console.log('🌍 Nombres obtenidos:', {
        origen: origenNombre,
        destino: destinoNombre
      });

      // Validar que obtuvimos nombres válidos
      if (!origenNombre || !destinoNombre) {
        throw new Error('No se pudieron obtener los nombres de los lugares');
      }

      // Crear objeto final con nombres de lugares
      const nuevaRuta = {
        Origen: origenNombre,
        Destino: destinoNombre,
        Distancia: Math.round(distanciaKm * 100) / 100
      };

      console.log('📤 RUTA FINAL A GUARDAR:', nuevaRuta);
      console.log('📤 JSON a enviar:', JSON.stringify(nuevaRuta, null, 2));

      // Validar datos antes de enviar
      if (nuevaRuta.Distancia <= 0) {
        throw new Error('Distancia inválida');
      }

      if (nuevaRuta.Origen.length > 190 || nuevaRuta.Destino.length > 190) {
        console.warn('⚠️ Nombres muy largos, truncando...');
        nuevaRuta.Origen = nuevaRuta.Origen.substring(0, 190);
        nuevaRuta.Destino = nuevaRuta.Destino.substring(0, 190);
      }

      // Enviar al servidor
      const response = await fetch('http://localhost:5226/api/Ruta/Nuevo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(nuevaRuta),
      });

      console.log('📥 Respuesta del servidor:', response.status);

      const responseText = await response.text();
      console.log('📥 Texto de respuesta:', responseText);

      if (response.ok) {
        const data = JSON.parse(responseText);
        console.log('✅ Ruta guardada exitosamente:', data);
        
        setRutaGuardada(
          `✅ Ruta guardada exitosamente (#${data.rutaId}): ${nuevaRuta.Origen} ➜ ${nuevaRuta.Destino} (${nuevaRuta.Distancia} km)`
        );
        
        setTimeout(() => setRutaGuardada(''), 8000);
      } else {
        const errorData = JSON.parse(responseText);
        console.error('❌ Error del servidor:', errorData);
        
        let errorMessage = 'Error al guardar la ruta:\n\n';
        if (errorData.mensaje) errorMessage += `${errorData.mensaje}\n`;
        if (errorData.errores && Array.isArray(errorData.errores)) {
          errorMessage += '\nErrores:\n' + errorData.errores.join('\n');
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('❌ ERROR GENERAL:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}\n\nRevisa la consola para más detalles.`);
    } finally {
      setGuardando(false);
    }
  };

  const debugDirections = () => {
    if (!directions.current) {
      console.log('❌ No hay directions disponible');
      return;
    }

    const origin = directions.current.getOrigin();
    const destination = directions.current.getDestination();
    
    console.log('🐛 DEBUG COMPLETO:');
    console.log('🐛 Origin:', origin);
    console.log('🐛 Destination:', destination);
    
    if (ultimaRuta) {
      console.log('🐛 Última ruta:', ultimaRuta);
      console.log('🐛 Pasos de la ruta:', ultimaRuta.legs[0]?.steps);
    }
    
    alert('Debug completo enviado a la consola.');
  };

  const limpiarRuta = () => {
    if (directions.current) {
      directions.current.removeRoutes();
      setUltimaRuta(null);
      setRutaGuardada('');
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Barra de controles */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          backgroundColor: '#f8f9fa',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          borderBottom: '1px solid #ddd',
        }}
      >
        <button
          onClick={saveRoute}
          disabled={!ultimaRuta || guardando}
          style={{
            padding: '8px 16px',
            backgroundColor: ultimaRuta && !guardando ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: ultimaRuta && !guardando ? 'pointer' : 'not-allowed',
            opacity: ultimaRuta && !guardando ? 1 : 0.6,
          }}
        >
          {guardando ? '🌍 Obteniendo lugares...' : '💾 Guardar ruta'}
        </button>

        <button
          onClick={limpiarRuta}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ffc107',
            color: '#212529',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          🗑️ Limpiar
        </button>

        <button
          onClick={() => handleViewChange('dashboard')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Dashboard
        </button>

        {ultimaRuta && (
          <div style={{ 
            marginLeft: 'auto', 
            fontSize: '14px', 
            color: '#495057',
            display: 'flex',
            gap: '15px'
          }}>
            <span>📏 {(ultimaRuta.legs[0].distance / 1000).toFixed(2)} km</span>
            <span>⏱️ {Math.round(ultimaRuta.legs[0].duration / 60)} min</span>
          </div>
        )}
      </div>

      {/* Mapa */}
      <div ref={mapContainer} style={{ width: '100%', height: '600px' }} />

      {/* Notificación de éxito */}
      {rutaGuardada && (
        <div
          style={{
            position: 'absolute',
            top: 80,
            right: 10,
            zIndex: 30,
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: 15,
            borderRadius: 8,
            width: 400,
            fontSize: 14,
            border: '1px solid #c3e6cb',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            lineHeight: 1.4,
          }}
        >
          {rutaGuardada}
        </div>
      )}

      {/* Indicador de carga durante geocoding */}
      {guardando && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 40,
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: 20,
            borderRadius: 8,
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ 
            width: 20, 
            height: 20, 
            border: '2px solid #fff', 
            borderTop: '2px solid transparent', 
            borderRadius: '50%',
            animation: 'spin 1s linear infinite' 
          }}></div>
          Obteniendo nombres de lugares...
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Mapa;