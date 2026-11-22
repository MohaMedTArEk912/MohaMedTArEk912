// Lightweight telemetry store for real-time camera spatial coordinates
type TelemetryListener = (coords: { x: number; y: number; z: number }) => void;
const listeners = new Set<TelemetryListener>();

let currentCoords = { x: 0, y: 0, z: 7 };

export const cameraTelemetry = {
  getCoords: () => currentCoords,
  update: (x: number, y: number, z: number) => {
    currentCoords = { x: +x.toFixed(1), y: +y.toFixed(1), z: +z.toFixed(1) };
    listeners.forEach((fn) => fn(currentCoords));
  },
  subscribe: (fn: TelemetryListener) => {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};
