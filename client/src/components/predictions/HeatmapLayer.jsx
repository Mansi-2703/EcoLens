import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';

const HeatmapLayerComponent = ({ map, forecastData, currentHour, visible }) => {
  const sourceId = 'temperature-heatmap-source';
  const layerId = 'temperature-heatmap-layer';

  useEffect(() => {
    if (!map || !forecastData || !visible) {
      // Remove layer if not visible or no data
      if (map && map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map && map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
      return;
    }

    // Create heatmap data for current hour
    const temp = forecastData.hourly.temperature_2m[currentHour];
    const features = [{
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [forecastData.longitude, forecastData.latitude]
      },
      properties: {
        temperature: temp
      }
    }];

    const geojson = {
      type: 'FeatureCollection',
      features: features
    };

    // Add or update source
    if (map.getSource(sourceId)) {
      map.getSource(sourceId).setData(geojson);
    } else {
      map.addSource(sourceId, {
        type: 'geojson',
        data: geojson
      });
    }

    // Add or update layer
    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'temperature'],
            -10, 10,
            0, 15,
            10, 20,
            20, 25,
            30, 30
          ],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'temperature'],
            -10, '#0000ff',
            0, '#0080ff',
            10, '#00ff80',
            20, '#ffff00',
            30, '#ff8000',
            40, '#ff0000'
          ],
          'circle-opacity': 0.6
        }
      });
    }

    return () => {
      if (map && map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map && map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    };
  }, [map, forecastData, currentHour, visible]);

  return null; // This component doesn't render anything directly
};

export default HeatmapLayerComponent;
