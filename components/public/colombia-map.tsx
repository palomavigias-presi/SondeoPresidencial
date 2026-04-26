"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { formatNumber, formatPercent } from "@/lib/utils";
import { normalizeGeoName } from "@/lib/geojson-name-map";
import { DEPARTMENT_REGION } from "@/lib/colombia-geo";

interface DepartmentData {
  department: string;
  total: number;
}

interface Props {
  data: DepartmentData[];
  totalParticipants: number;
  geoUrl?: string;
}

interface FeatureProps {
  NOMBRE_DPT?: string;
  DPTO?: string;
}
interface Feature {
  rsmKey: string;
  properties: FeatureProps;
}

interface Hover {
  name: string;
  total: number;
  region: string | null;
  pct: number;
  x: number;
  y: number;
}

// Colombia bounding box: aprox lon -82..-66, lat -5..14
// react-simple-maps usa proyección Mercator por defecto. Para Colombia conviene
// "geoMercator" centrada en el país.
const COLOMBIA_CENTER: [number, number] = [-74, 4.6];
const SCALE = 1700;

export function ColombiaMap({
  data,
  totalParticipants,
  geoUrl = "/colombia-departments.geo.json",
}: Props) {
  const totalsByDept = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of data) m.set(d.department, d.total);
    return m;
  }, [data]);

  const max = useMemo(
    () => Math.max(0, ...data.map((d) => d.total)),
    [data],
  );

  const [hover, setHover] = useState<Hover | null>(null);
  const [position, setPosition] = useState<{
    coordinates: [number, number];
    zoom: number;
  }>({ coordinates: COLOMBIA_CENTER, zoom: 1 });
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Cerrar tooltip si se hace clic fuera
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setHover(null);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white"
    >
      {/* Leyenda flotante */}
      <div className="absolute right-2 top-2 z-10 flex flex-col items-end gap-1 rounded-md border border-slate-200 bg-white/90 p-1.5 shadow-glow backdrop-blur sm:right-3 sm:top-3 sm:gap-2 sm:p-2">
        <p className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">
          Participantes
        </p>
        <div className="flex items-center gap-1">
          <span className="font-mono text-[9px] text-brand-muted">0</span>
          <div className="flex h-1.5 w-16 overflow-hidden rounded-full sm:w-28">
            {[0.1, 0.25, 0.45, 0.7, 0.95].map((opacity) => (
              <div
                key={opacity}
                className="flex-1"
                style={{ background: `rgba(0, 56, 147, ${opacity})` }}
              />
            ))}
          </div>
          <span className="font-mono text-[9px] text-brand-muted">
            {formatNumber(max)}
          </span>
        </div>
      </div>

      {/* Controles de zoom */}
      <div className="absolute bottom-2 right-2 z-10 flex flex-col gap-1 sm:bottom-3 sm:right-3">
        <button
          aria-label="Acercar"
          onClick={() =>
            setPosition((p) => ({ ...p, zoom: Math.min(p.zoom * 1.5, 8) }))
          }
          className="h-7 w-7 rounded-md border border-slate-200 bg-white text-base font-bold text-brand-deep shadow-sm transition hover:bg-brand-bg sm:h-8 sm:w-8 sm:text-lg"
        >
          +
        </button>
        <button
          aria-label="Alejar"
          onClick={() =>
            setPosition((p) => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }))
          }
          className="h-7 w-7 rounded-md border border-slate-200 bg-white text-base font-bold text-brand-deep shadow-sm transition hover:bg-brand-bg sm:h-8 sm:w-8 sm:text-lg"
        >
          −
        </button>
        <button
          aria-label="Reset"
          onClick={() =>
            setPosition({ coordinates: COLOMBIA_CENTER, zoom: 1 })
          }
          className="h-7 w-7 rounded-md border border-slate-200 bg-white text-[10px] font-mono uppercase text-brand-deep shadow-sm transition hover:bg-brand-bg sm:h-8 sm:w-8"
        >
          ⌖
        </button>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: SCALE, center: COLOMBIA_CENTER }}
        width={800}
        height={900}
        style={{
          width: "100%",
          height: "auto",
          maxHeight: 520,
          display: "block",
        }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={(p) =>
            setPosition({
              coordinates: p.coordinates as [number, number],
              zoom: p.zoom,
            })
          }
          maxZoom={8}
          minZoom={1}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: Feature[] }) =>
              geographies.map((geo) => {
                const rawName = geo.properties.NOMBRE_DPT;
                const dept = normalizeGeoName(rawName);
                const total = dept ? totalsByDept.get(dept) ?? 0 : 0;
                const intensity =
                  max <= 0 || total === 0
                    ? 0
                    : Math.min(
                        1,
                        Math.log10(total + 1) / Math.log10(max + 1) || 0.05,
                      );
                const fill =
                  total === 0
                    ? "#F1F5F9"
                    : `rgba(0, 56, 147, ${0.18 + intensity * 0.78})`;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo as never}
                    onMouseEnter={(e) => {
                      const rect = wrapperRef.current?.getBoundingClientRect();
                      const pct =
                        totalParticipants > 0 ? total / totalParticipants : 0;
                      setHover({
                        name: dept ?? rawName ?? "—",
                        total,
                        region: dept ? DEPARTMENT_REGION[dept] ?? null : null,
                        pct,
                        x: e.clientX - (rect?.left ?? 0),
                        y: e.clientY - (rect?.top ?? 0),
                      });
                    }}
                    onMouseMove={(e) => {
                      const rect = wrapperRef.current?.getBoundingClientRect();
                      setHover((h) =>
                        h
                          ? {
                              ...h,
                              x: e.clientX - (rect?.left ?? 0),
                              y: e.clientY - (rect?.top ?? 0),
                            }
                          : h,
                      );
                    }}
                    onMouseLeave={() => setHover(null)}
                    onClick={(e) => {
                      // En mobile reemplaza al hover
                      const rect = wrapperRef.current?.getBoundingClientRect();
                      const pct =
                        totalParticipants > 0 ? total / totalParticipants : 0;
                      setHover({
                        name: dept ?? rawName ?? "—",
                        total,
                        region: dept ? DEPARTMENT_REGION[dept] ?? null : null,
                        pct,
                        x: e.clientX - (rect?.left ?? 0),
                        y: e.clientY - (rect?.top ?? 0),
                      });
                    }}
                    style={{
                      default: {
                        fill,
                        stroke: "#0D1B4B",
                        strokeWidth: 0.4,
                        outline: "none",
                        transition: "fill 200ms",
                      },
                      hover: {
                        fill: total > 0 ? "#FFCD00" : "#E5E7EB",
                        stroke: "#0D1B4B",
                        strokeWidth: 0.8,
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: "#CE1126",
                        stroke: "#0D1B4B",
                        strokeWidth: 0.8,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {hover ? (
        <div
          className="pointer-events-none absolute z-20 min-w-[180px] rounded-md border border-slate-200 bg-brand-ink p-3 text-xs text-white shadow-glow"
          style={{
            left: Math.min(hover.x + 12, 600),
            top: hover.y + 12,
          }}
        >
          <p className="font-semibold text-white">{hover.name}</p>
          {hover.region ? (
            <p className="text-[10px] text-white/60">Región: {hover.region}</p>
          ) : null}
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-brand-accent">
                Participantes
              </p>
              <p className="mono-stat text-base font-semibold">
                {formatNumber(hover.total)}
              </p>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-brand-accent">
                % nacional
              </p>
              <p className="mono-stat text-base font-semibold">
                {formatPercent(hover.pct)}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="border-t border-slate-200 bg-brand-bg px-4 py-3 text-[11px] text-brand-muted">
        <span className="font-mono uppercase tracking-widest">
          Mapa interactivo
        </span>{" "}
        · pasa el cursor (o toca) un departamento para ver su detalle. Usa los
        botones <span className="font-mono">+</span> /{" "}
        <span className="font-mono">−</span> para acercar.
      </div>
    </div>
  );
}
