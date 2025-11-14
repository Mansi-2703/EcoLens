import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const GlacierMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [glacierData, setGlacierData] = useState(null);
  const [showGlaciers, setShowGlaciers] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Free glacier data source (Natural Earth glaciers)
  const glacierGeoJSONUrl = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_glaciated_areas.geojson';

  useEffect(() => {
    if (map.current) return; // initialize map only once

    // Satellite style as default
    const satelliteStyle = {
      version: 8,
      sources: {
        'satellite': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          attribution: 'Esri World Imagery'
        },
        'labels': {
          type: 'vector',
          tiles: [
            'https://tiles.stadiamaps.com/data/openmaptiles/{z}/{x}/{y}.pbf'
          ],
          attribution: '© Stadia Maps, © OpenMapTiles © OpenStreetMap contributors'
        }
      },
      layers: [
        {
          id: 'satellite',
          type: 'raster',
          source: 'satellite'
        },
        {
          id: 'country-labels',
          type: 'symbol',
          source: 'labels',
          'source-layer': 'place',
          filter: ['==', 'class', 'country'],
          layout: {
            'text-field': '{name_en}',
            'text-size': 12,
            'text-anchor': 'center',
            'text-justify': 'center'
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#000000',
            'text-halo-width': 1
          },
          minzoom: 1,
          maxzoom: 8
        },
        {
          id: 'state-labels',
          type: 'symbol',
          source: 'labels',
          'source-layer': 'place',
          filter: ['==', 'class', 'state'],
          layout: {
            'text-field': '{name_en}',
            'text-size': 10,
            'text-anchor': 'center',
            'text-justify': 'center'
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#000000',
            'text-halo-width': 1
          },
          minzoom: 4,
          maxzoom: 10
        },
        {
          id: 'city-labels',
          type: 'symbol',
          source: 'labels',
          'source-layer': 'place',
          filter: ['in', 'class', 'city', 'town', 'village'],
          layout: {
            'text-field': '{name_en}',
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              5, 8,
              10, 12,
              15, 16
            ],
            'text-anchor': 'center',
            'text-justify': 'center'
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#000000',
            'text-halo-width': 1
          },
          minzoom: 5,
          maxzoom: 16
        }
      ]
    };

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: satelliteStyle,
      center: [0, 20], // [lng, lat]
      zoom: 2,
      attributionControl: false
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(new maplibregl.AttributionControl(), 'bottom-right');

    // Load glacier data
    fetch(glacierGeoJSONUrl)
      .then(response => response.json())
      .then(data => {
        console.log('Glacier data loaded:', data);
        if (data.features && data.features.length > 0) {
          console.log('Sample feature properties:', data.features[0].properties);
        }
        setGlacierData(data);
      })
      .catch(error => {
        console.error('Error loading glacier data:', error);
      });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapLoaded && glacierData && map.current) {
      // Add glacier source
      if (!map.current.getSource('glaciers')) {
        map.current.addSource('glaciers', {
          type: 'geojson',
          data: glacierData
        });
      }

      // Add glacier layers
      if (!map.current.getLayer('glacier-fill')) {
        map.current.addLayer({
          id: 'glacier-fill',
          type: 'fill',
          source: 'glaciers',
        paint: {
            'fill-color': [
              'match',
              ['get', 'scalerank'],
              0, '#1e40af', // Deep blue for large glaciers
              1, '#1e40af',
              2, '#1e40af',
              3, '#3b82f6', // Bright blue for medium glaciers
              4, '#3b82f6',
              5, '#3b82f6',
              6, '#60a5fa', // Light blue for small glaciers
              7, '#60a5fa',
              8, '#60a5fa',
              9, '#60a5fa',
              10, '#60a5fa',
              '#60a5fa' // Default
            ],
            'fill-opacity': showGlaciers ? 0.7 : 0
          }
        });
      }

      if (!map.current.getLayer('glacier-outline')) {
        map.current.addLayer({
          id: 'glacier-outline',
          type: 'line',
          source: 'glaciers',
          paint: {
            'line-color': '#ffffff',
            'line-width': 1,
            'line-opacity': showGlaciers ? 1 : 0
          }
        });
      }

      // Add glacier labels (simplified - using centroid approximation)
      if (!map.current.getLayer('glacier-labels')) {
        map.current.addLayer({
          id: 'glacier-labels',
          type: 'symbol',
          source: 'glaciers',
          layout: {
            'text-field': '{name}', // Assuming name field exists
            'text-size': 12,
            'text-anchor': 'center',
            'text-justify': 'center',
            'text-allow-overlap': false,
            'text-ignore-placement': false
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#000000',
            'text-halo-width': 1
          },
          minzoom: 6,
          maxzoom: 12
        });
      }
    }
  }, [mapLoaded, glacierData, showGlaciers]);

  const toggleGlaciers = () => {
    setShowGlaciers(!showGlaciers);
  };

  const filterByRegion = (region) => {
    setSelectedRegion(region);
    if (map.current && map.current.getLayer('glacier-fill')) {
      let filter = null;
      if (region !== 'all') {
        // Simple region filtering based on longitude/latitude bounds
        const regionBounds = {
          arctic: { bounds: [-180, 60, 180, 90], center: [0, 75], zoom: 3 },
          alps: { bounds: [5, 45, 15, 48], center: [10, 46.5], zoom: 7 },
          himalayas: { bounds: [70, 25, 95, 40], center: [82.5, 32.5], zoom: 6 },
          andes: { bounds: [-80, -55, -60, 10], center: [-70, -22.5], zoom: 4 },
          alaska: { bounds: [-170, 55, -130, 70], center: [-150, 62.5], zoom: 5 }
        };
        const regionData = regionBounds[region];
        if (regionData) {
          filter = ['within', {
            type: 'Polygon',
            coordinates: [[
              [regionData.bounds[0], regionData.bounds[1]],
              [regionData.bounds[2], regionData.bounds[1]],
              [regionData.bounds[2], regionData.bounds[3]],
              [regionData.bounds[0], regionData.bounds[3]],
              [regionData.bounds[0], regionData.bounds[1]]
            ]]
          }];
          // Zoom to the region
          map.current.flyTo({
            center: regionData.center,
            zoom: regionData.zoom,
            duration: 2000
          });
        }
      } else {
        // Reset to world view when 'all' is selected
        map.current.flyTo({
          center: [0, 20],
          zoom: 2,
          duration: 2000
        });
      }
      map.current.setFilter('glacier-fill', filter);
      map.current.setFilter('glacier-outline', filter);
      map.current.setFilter('glacier-labels', filter);
    }
  };

  return (
    <div className="glacier-map-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1,
        background: 'rgba(15, 23, 42, 0.9)',
        padding: '10px',
        borderRadius: '8px',
        color: '#f1f5f9'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Glacier Layers</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={showGlaciers}
              onChange={toggleGlaciers}
            />
            Show Glaciers
          </label>
          <div>
            <label style={{ fontSize: '12px', marginBottom: '5px', display: 'block' }}>Region Filter:</label>
            <select
              value={selectedRegion}
              onChange={(e) => filterByRegion(e.target.value)}
              style={{
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #475569',
                borderRadius: '4px',
                padding: '4px',
                fontSize: '12px'
              }}
            >
              <option value="all">All Regions</option>
              <option value="arctic">Arctic</option>
              <option value="alps">Alps</option>
              <option value="himalayas">Himalayas</option>
              <option value="andes">Andes</option>
              <option value="alaska">Alaska</option>
            </select>
          </div>
        </div>
      </div>

      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default GlacierMap;
