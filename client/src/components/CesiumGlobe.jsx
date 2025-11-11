// client/src/components/CesiumGlobe.jsx
import React, { useEffect, useRef, useState } from "react";

/*
  Lazy Cesium viewer:
  - Does NOT import 'cesium' at top-level (avoids pre-transform errors).
  - Dynamically imports Cesium when mounted.
  - Catches and displays any startup errors instead of crashing the whole app.
  - Emits onPick(lat, lon) when user clicks.
*/

export default function CesiumGlobe({ onPick }) {
  const ref = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [errMsg, setErrMsg] = useState(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      setStatus("loading");
      try {
        // dynamic import — resolves via your vite alias (cesium/Cesium.js)
        const module = await import("cesium/Cesium.js");
        const Cesium = module.default || module;
        if (cancelled) return;

        if (!window.CESIUM_BASE_URL) window.CESIUM_BASE_URL = "/cesium";

        const container = ref.current;
        if (!container) throw new Error("Cesium container not found");

        container.style.background = "#000";
        container.style.width = "100%";
        container.style.height = "500px";

        const imageryProvider = new Cesium.UrlTemplateImageryProvider({
          url: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
          credit: "© OpenStreetMap contributors",
          maximumLevel: 19,
        });
        const terrainProvider = new Cesium.EllipsoidTerrainProvider();

        const viewer = new Cesium.Viewer(container, {
          imageryProvider,
          terrainProvider,
          baseLayerPicker: false,
          geocoder: false,
          timeline: false,
          animation: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          infoBox: false,
          skyBox: false,
          skyAtmosphere: false,
        });

        viewerRef.current = viewer;
        setStatus("ready");
        console.log("Cesium viewer created:", viewer);

        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        let pin = null;
        handler.setInputAction((click) => {
          try {
            const cartesian = viewer.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);
            if (!cartesian) return;
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            const lat = Cesium.Math.toDegrees(cartographic.latitude);
            const lon = Cesium.Math.toDegrees(cartographic.longitude);

            if (pin) viewer.entities.remove(pin);
            pin = viewer.entities.add({
              position: Cesium.Cartesian3.fromDegrees(lon, lat),
              point: { pixelSize: 10, color: Cesium.Color.ORANGE, outlineWidth: 2 },
              label: { text: `${lat.toFixed(3)}, ${lon.toFixed(3)}`, pixelOffset: new Cesium.Cartesian2(0, -18) },
            });

            if (typeof onPick === "function") onPick(lat, lon);
          } catch (e) {
            console.warn("Click handler error:", e);
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        viewer.__cesium_internal_handler = handler;
      } catch (err) {
        console.error("Cesium init error:", err);
        setErrMsg(String(err.message || err));
        setStatus("error");
      }
    }

    start();

    return () => {
      cancelled = true;
      try { viewerRef.current?.__cesium_internal_handler?.destroy(); } catch(e){}
      try { viewerRef.current?.destroy?.(); } catch(e){}
    };
  }, [onPick]);

  return (
    <div style={{ position: "relative" }}>
      <div ref={ref} style={{ width: "100%", height: 500, borderRadius: 8, overflow: "hidden" }} />
      {status === "loading" && (
        <div style={{ position: "absolute", top: 12, right: 12, padding: 8, background: "rgba(0,0,0,0.6)", color: "#9ff", borderRadius: 6 }}>
          Loading globe...
        </div>
      )}
      {status === "error" && (
        <div style={{
          position: "absolute", top: 12, right: 12, width: 360, padding: 12, background: "rgba(20,0,0,0.9)",
          color: "#ffbbbb", borderRadius: 8, fontSize: 13, whiteSpace: "pre-wrap", zIndex: 9999
        }}>
          <strong>Globe failed to start</strong>
          <div style={{ marginTop: 8 }}>{errMsg || "Unknown error"}</div>
          <div style={{ marginTop: 8, fontSize: 12, color: "#ddd" }}>
            Check DevTools console for the full error.
          </div>
        </div>
      )}
    </div>
  );
}
