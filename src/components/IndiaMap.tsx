import React, { useState } from "react";
import {
  MapPin,
  Building2,
  Radio,
  ShieldCheck,
  Navigation,
  Compass,
  CheckCircle2,
  ExternalLink,
  Users,
  DoorOpen,
  Sparkles,
} from "lucide-react";
import type { Society } from "@/types";
import { useData } from "@/stores/use-data";
import { Badge, Button } from "@/components/ui";

interface IndiaMapProps {
  societies: Society[];
  selectedSocietyId?: string | null;
  onSelectSociety?: (society: Society) => void;
  className?: string;
}

/**
 * Geographic projection from India Lat/Long to SVG coordinate space (600x700).
 * India bounding box:
 * Latitude: 8.0° N to 37.5° N
 * Longitude: 68.0° E to 97.5° E
 */
export function projectIndia(lat: number, lng: number, width = 600, height = 700) {
  const minLng = 68.0;
  const maxLng = 97.5;
  const minLat = 8.0;
  const maxLat = 37.5;

  // Clamp values inside India region
  const clampedLng = Math.max(minLng, Math.min(maxLng, lng));
  const clampedLat = Math.max(minLat, Math.min(maxLat, lat));

  // Mercator-approximated linear projection for national scale
  const x = ((clampedLng - minLng) / (maxLng - minLng)) * (width - 130) + 60;
  const y = ((maxLat - clampedLat) / (maxLat - minLat)) * (height - 110) + 45;

  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

// Prominent reference anchor cities in India for geographic orientation
const REFERENCE_CITIES = [
  { name: "New Delhi", lat: 28.6139, lng: 77.209 },
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Pune", lat: 18.5204, lng: 73.8567 },
  { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
];

export function IndiaMap({
  societies,
  selectedSocietyId,
  onSelectSociety,
  className = "",
}: IndiaMapProps) {
  const db = useData((state) => state.db);
  const [hoveredSociety, setHoveredSociety] = useState<Society | null>(null);
  const [activeSocietyId, setActiveSocietyId] = useState<string | null>(
    selectedSocietyId || societies[0]?.id || null
  );

  const activeSoc =
    societies.find((s) => s.id === (activeSocietyId || hoveredSociety?.id)) ||
    societies[0] ||
    null;

  const activeUnits = activeSoc
    ? db.units.filter((u) => u.societyId === activeSoc.id).length
    : 0;
  const activeResidents = activeSoc
    ? db.users.filter((u) => u.societyId === activeSoc.id && u.role === "resident").length
    : 0;
  const activeGates = activeSoc
    ? db.gates.filter((g) => g.societyId === activeSoc.id).length
    : 0;
  const activeSub = activeSoc
    ? db.subscriptions.find((s) => s.societyId === activeSoc.id)
    : null;

  return (
    <div className={`rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm ${className}`}>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
            <p className="text-[11px] font-black uppercase tracking-wider text-blue-600">
              India Live Society Deployment Radar
            </p>
          </div>
          <h2 className="text-lg md:text-xl font-black text-slate-900 mt-0.5">
            Geographic Coverage & Sentinel Nodes
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Real-time geospatial telemetry of communities secured by AI Smartgate Estate OS
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2">
          <Radio size={16} className="text-emerald-500 animate-pulse shrink-0" />
          <div className="text-right">
            <p className="text-xs font-black text-slate-900 leading-none">
              {societies.length} Society Node{societies.length === 1 ? "" : "s"}
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              100% Online
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Vector Map & Telemetry Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 items-center">
        {/* SVG Map Canvas */}
        <div className="lg:col-span-7 relative flex items-center justify-center bg-gradient-to-b from-blue-50/40 via-slate-50/60 to-white rounded-2xl border border-slate-200/90 p-4 min-h-[420px] overflow-hidden">
          {/* Subtle Grid Lat/Long Lines */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.45]">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="0.75" strokeDasharray="2 3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>
          </div>

          {/* Geographic Coordinates Overlay watermark */}
          <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-400 select-none flex items-center gap-1.5 bg-white/80 backdrop-blur px-2 py-1 rounded-lg border border-slate-200">
            <Compass size={12} className="text-blue-500" />
            <span>IND · 8°4'N - 37°6'N | 68°7'E - 97°25'E</span>
          </div>

          <svg
            viewBox="0 0 600 700"
            className="w-full h-auto max-h-[440px] select-none relative z-10 drop-shadow-sm"
          >
            <defs>
              {/* Gradient for India Landmass */}
              <linearGradient id="indiaLandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="50%" stopColor="#eff6ff" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>

              {/* Pulse glow filter */}
              <filter id="beaconGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* India Main Landmass SVG Path */}
            <path
              d="
                M 215,65
                C 225,50 240,42 255,50
                C 270,58 285,75 295,95
                C 305,115 315,130 330,145
                L 355,165
                C 375,175 400,190 420,195
                C 425,188 435,185 442,192
                C 450,200 445,210 455,212
                C 470,215 485,212 495,210
                C 515,198 535,202 548,220
                C 555,235 550,255 540,275
                C 532,295 530,315 522,330
                C 512,342 498,335 488,320
                C 475,305 465,315 460,335
                C 452,350 435,360 420,370
                C 395,410 375,445 350,480
                C 330,510 305,550 280,590
                C 260,620 248,645 238,665
                C 232,670 226,670 222,662
                C 215,640 205,600 195,560
                C 185,520 178,475 168,435
                C 158,400 148,375 130,365
                C 105,370 85,355 80,335
                C 78,318 95,305 118,300
                C 138,290 148,270 155,245
                C 165,210 185,170 198,135
                C 205,105 210,80 215,65
                Z
              "
              fill="url(#indiaLandGradient)"
              stroke="#94a3b8"
              strokeWidth="1.8"
              strokeLinejoin="round"
              className="transition-colors duration-300"
            />

            {/* Gujarat Kathiawar Peninsula Accent Detail */}
            <path
              d="
                M 130,365
                C 112,368 95,360 88,348
                C 82,336 92,324 110,320
                C 125,316 135,330 130,365
                Z
              "
              fill="#dbeafe"
              stroke="#94a3b8"
              strokeWidth="1.2"
              opacity="0.8"
            />

            {/* Sri Lanka Outline for Geographic Orientation */}
            <path
              d="M 275,675 C 285,670 290,680 286,695 C 282,705 275,705 272,695 C 270,685 272,678 275,675 Z"
              fill="#e2e8f0"
              stroke="#cbd5e1"
              strokeWidth="1"
            />

            {/* Andaman & Nicobar Reference Dots */}
            <g fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8">
              <ellipse cx="530" cy="540" rx="3" ry="8" />
              <ellipse cx="536" cy="570" rx="2.5" ry="6" />
              <ellipse cx="542" cy="610" rx="2" ry="7" />
            </g>

            {/* Lakshadweep Reference Dots */}
            <g fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8">
              <circle cx="160" cy="570" r="2.5" />
              <circle cx="155" cy="590" r="2.5" />
              <circle cx="158" cy="610" r="2.5" />
            </g>

            {/* Regional State Contour Guidelines */}
            <g stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 3" fill="none">
              {/* Northern divide */}
              <path d="M 200,160 Q 260,180 320,150" />
              {/* Central India divide */}
              <path d="M 160,280 Q 280,310 400,280" />
              {/* Deccan / Southern divide */}
              <path d="M 170,420 Q 250,430 350,420" />
              {/* Karnataka / Tamil Nadu divide */}
              <path d="M 195,540 Q 240,550 280,590" />
            </g>

            {/* Reference Anchor Cities (Soft Dots + Labels) */}
            {REFERENCE_CITIES.map((city) => {
              const pos = projectIndia(city.lat, city.lng);
              const isBengaluru = city.name === "Bengaluru";
              return (
                <g key={city.name} className="pointer-events-none opacity-60">
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isBengaluru ? 3.5 : 2.5}
                    fill={isBengaluru ? "#0284c7" : "#64748b"}
                  />
                  <text
                    x={pos.x + 5}
                    y={pos.y + 3}
                    fontSize="9"
                    fontWeight="700"
                    fill="#64748b"
                    fontFamily="system-ui, sans-serif"
                  >
                    {city.name}
                  </text>
                </g>
              );
            })}

            {/* Active Registered Societies Markers on India Map */}
            {societies.map((society, idx) => {
              // Extract coordinates or fallback to Bengaluru default
              const lat = typeof society.latitude === "number" ? society.latitude : 12.9716;
              const lng = typeof society.longitude === "number" ? society.longitude : 77.5946;
              const pos = projectIndia(lat, lng);

              const isSelected = (activeSocietyId || hoveredSociety?.id) === society.id;

              return (
                <g
                  key={society.id}
                  className="cursor-pointer group"
                  onClick={() => {
                    setActiveSocietyId(society.id);
                    onSelectSociety?.(society);
                  }}
                  onMouseEnter={() => setHoveredSociety(society)}
                  onMouseLeave={() => setHoveredSociety(null)}
                >
                  {/* Outer animated radar ripples */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="24"
                    fill="#0284c7"
                    opacity="0.15"
                    className="animate-ping"
                    style={{ animationDuration: "2.8s", animationDelay: `${idx * 0.4}s` }}
                  />
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="15"
                    fill="#0284c7"
                    opacity="0.25"
                  />

                  {/* Concentric beacon core */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="7.5"
                    fill="#0284c7"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    filter="url(#beaconGlow)"
                    className="transition-transform group-hover:scale-125 origin-center"
                  />

                  {/* Pin Center Glow */}
                  <circle cx={pos.x} cy={pos.y} r="3" fill="#ffffff" />

                  {/* Floating Society Badge Label */}
                  <g
                    transform={`translate(${pos.x + 12}, ${pos.y - 14})`}
                    className="transition-transform group-hover:-translate-y-1"
                  >
                    <rect
                      x="0"
                      y="-12"
                      width={Math.max(120, society.name.length * 6.8 + 36)}
                      height="24"
                      rx="12"
                      fill={isSelected ? "#0f2b5c" : "#ffffff"}
                      stroke={isSelected ? "#0072f5" : "#cbd5e1"}
                      strokeWidth="1.5"
                      filter="drop-shadow(0 2px 4px rgba(15,43,92,0.12))"
                    />
                    <circle
                      cx="10"
                      cy="0"
                      r="4"
                      fill={isSelected ? "#38bdf8" : "#10b981"}
                    />
                    <text
                      x="20"
                      y="3.5"
                      fontSize="9.5"
                      fontWeight="800"
                      fill={isSelected ? "#ffffff" : "#0f2b5c"}
                      fontFamily="system-ui, sans-serif"
                    >
                      {society.name.length > 20
                        ? `${society.name.slice(0, 18)}…`
                        : society.name}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Map legend footer */}
          <div className="absolute bottom-3 inset-x-4 flex items-center justify-between text-[11px] font-bold text-slate-600 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="flex items-center gap-1.5 text-blue-600">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-ping" />
              Active Sentinel Hub
            </span>
            <span className="text-slate-500 font-mono text-[10px]">
              GPS Sync: Active
            </span>
          </div>
        </div>

        {/* Telemetry Sidebar Details */}
        <div className="lg:col-span-5 space-y-4">
          {activeSoc ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {activeSoc.photo ? (
                    <img
                      src={activeSoc.photo}
                      alt={activeSoc.name}
                      className="h-14 w-14 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-100 text-blue-700 font-black text-xl shrink-0">
                      <Building2 size={24} />
                    </div>
                  )}
                  <div>
                    <Badge tone="good">Operational Node</Badge>
                    <h3 className="font-black text-base text-slate-900 mt-1 leading-tight">
                      {activeSoc.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin size={12} className="text-blue-500 shrink-0" />
                      {activeSoc.city || "Bengaluru"}, {activeSoc.state || "Karnataka"}
                    </p>
                  </div>
                </div>
              </div>

              {/* GPS Coordinates telemetry badge */}
              <div className="rounded-xl border border-blue-200/80 bg-blue-50/70 p-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-black text-blue-900 flex items-center gap-1.5">
                    <Navigation size={13} className="text-blue-600" />
                    Verified Geolocation
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">
                    WGS 84 GPS
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-700 pt-1">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">
                      Latitude
                    </span>
                    <span className="font-bold">
                      {typeof activeSoc.latitude === "number"
                        ? `${activeSoc.latitude.toFixed(4)}° N`
                        : "12.9716° N"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">
                      Longitude
                    </span>
                    <span className="font-bold">
                      {typeof activeSoc.longitude === "number"
                        ? `${activeSoc.longitude.toFixed(4)}° E`
                        : "77.5946° E"}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-1 truncate">
                  Address: {activeSoc.address}
                </p>
              </div>

              {/* Society Metrics breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <p className="text-base font-black text-slate-900">{activeUnits}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Flats</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <p className="text-base font-black text-blue-600">{activeResidents}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Residents</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <p className="text-base font-black text-emerald-600">{activeGates || 1}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Gates Online</p>
                </div>
              </div>

              {/* Status and Join Code */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                <span className="text-slate-500 font-medium">
                  Society Join Code:{" "}
                  <code className="font-black text-blue-600 bg-blue-100/70 px-1.5 py-0.5 rounded">
                    {activeSoc.code}
                  </code>
                </span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Active SLA
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500 text-xs">
              No society selected. Click a pin on the map.
            </div>
          )}

          {/* Quick list of monitored societies */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-black uppercase tracking-wider text-slate-700">
                Deployed Locations ({societies.length})
              </p>
              <span className="text-[11px] text-blue-600 font-bold">Pan-India</span>
            </div>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {societies.map((soc) => (
                <button
                  type="button"
                  key={soc.id}
                  onClick={() => {
                    setActiveSocietyId(soc.id);
                    onSelectSociety?.(soc);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition flex items-center justify-between ${
                    (activeSocietyId || hoveredSociety?.id) === soc.id
                      ? "border-blue-500 bg-blue-50/70 text-blue-900 font-bold"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin
                      size={14}
                      className={
                        (activeSocietyId || hoveredSociety?.id) === soc.id
                          ? "text-blue-600"
                          : "text-slate-400"
                      }
                    />
                    <span className="truncate">{soc.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 font-medium ml-2">
                    {soc.city}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
