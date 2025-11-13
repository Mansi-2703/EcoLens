import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MapLibreMap = ({ onLocationSelect, selectedLocation, onMapReady }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.stadiamaps.com/styles/alidade_smooth/style.json', // Stadia Alidade Smooth with country labels
      center: [0, 20], // [lng, lat]
      zoom: 2,
      attributionControl: false
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(new maplibregl.AttributionControl(), 'bottom-right');

    // Add satellite imagery toggle
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
    }; // Real terrain satellite style with location labels
    const defaultStyle = 'https://tiles.stadiamaps.com/styles/alidade_smooth/style.json';

    class SatelliteControl {
      onAdd(map) {
        this.map = map;
        this.container = document.createElement('div');
        this.container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        this.button = document.createElement('button');
        this.button.className = 'maplibregl-ctrl-icon';
        this.button.type = 'button';
        this.button.title = 'Toggle satellite view';
        this.button.innerHTML = '🛰️';
        this.button.onclick = () => {
          const currentStyle = this.map.getStyle();
          if (currentStyle.sources && currentStyle.sources.satellite) {
            // Currently in satellite view, switch to default
            this.map.setStyle(defaultStyle);
          } else {
            // Currently in default view, switch to satellite
            this.map.setStyle(satelliteStyle);
          }
        };
        this.container.appendChild(this.button);
        return this.container;
      }

      onRemove() {
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
      }
    }

    map.current.addControl(new SatelliteControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
      if (onMapReady) {
        onMapReady(map.current);
      }
    });

    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      onLocationSelect({ lat, lng });

      // Add a temporary marker on click
      if (marker.current) {
        marker.current.setLngLat([lng, lat]);
      } else {
        marker.current = new maplibregl.Marker()
          .setLngLat([lng, lat])
          .addTo(map.current);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (selectedLocation && map.current && mapLoaded) {
      const { lat, lng } = selectedLocation;

      // Center map on selected location
      map.current.flyTo({
        center: [lng, lat],
        zoom: 10,
        duration: 2000
      });

      // Add or update marker
      if (marker.current) {
        marker.current.setLngLat([lng, lat]);
      } else {
        marker.current = new maplibregl.Marker()
          .setLngLat([lng, lat])
          .addTo(map.current);
      }
    }
  }, [selectedLocation, mapLoaded]);

  return (
    <div className="map-container" style={{ width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapLibreMap;
