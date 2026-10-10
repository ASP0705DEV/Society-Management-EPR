import type { FC } from "react";

export const VisitorStaffIllustration: FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`relative w-full overflow-hidden select-none pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 960 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-h-[440px] object-contain mx-auto"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="visBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="phoneScreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a1936" />
            <stop offset="100%" stopColor="#0f2b5c" />
          </linearGradient>

          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0072f5" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          <linearGradient id="carGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="50%" stopColor="#bfdbfe" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>

          <linearGradient id="scooterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          {/* Delivery Box Gradient */}
          <linearGradient id="deliveryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>

        {/* ------------------------------------------------------------- */}
        {/* BACKGROUND: Glass Gatehouse & Residential Skyline             */}
        {/* ------------------------------------------------------------- */}
        {/* Soft Background Plate */}
        <rect x="240" y="80" width="480" height="340" rx="24" fill="url(#visBgGrad)" />

        {/* Skyline Outline behind Gatehouse */}
        <g opacity="0.45" className="dark:opacity-20">
          <rect x="440" y="110" width="110" height="230" rx="4" fill="#93c5fd" />
          {[0, 1, 2, 3, 4, 5].map((r) => (
            <g key={r}>
              <rect x="455" y={125 + r * 28} width="22" height="14" rx="2" fill="#ffffff" />
              <rect x="485" y={125 + r * 28} width="22" height="14" rx="2" fill="#ffffff" />
              <rect x="515" y={125 + r * 28} width="22" height="14" rx="2" fill="#ffffff" />
            </g>
          ))}
          <rect x="290" y="180" width="90" height="160" rx="4" fill="#bfdbfe" />
          <rect x="580" y="170" width="90" height="170" rx="4" fill="#bfdbfe" />
        </g>

        {/* Gate Portal Canopy Structure */}
        <rect x="220" y="90" width="520" height="28" rx="6" fill="#0072f5" opacity="0.85" />
        <line x1="260" y1="118" x2="260" y2="400" stroke="#0072f5" strokeWidth="8" opacity="0.7" />
        <line x1="700" y1="118" x2="700" y2="400" stroke="#0072f5" strokeWidth="8" opacity="0.7" />

        {/* Ground Platform Shadow */}
        <ellipse cx="480" cy="425" rx="360" ry="25" fill="#0f2b5c" opacity="0.12" />

        {/* ------------------------------------------------------------- */}
        {/* CENTER: Floating Smart Sentinel Tablet / Phone                */}
        {/* ------------------------------------------------------------- */}
        <g>
          {/* Phone Shadow */}
          <rect x="408" y="115" width="144" height="260" rx="24" fill="#000000" opacity="0.18" />
          {/* Outer Phone Case */}
          <rect x="400" y="105" width="144" height="260" rx="24" fill="#1e293b" stroke="#3b82f6" strokeWidth="2.5" />
          {/* Inner Screen */}
          <rect x="406" y="111" width="132" height="248" rx="18" fill="url(#phoneScreenGrad)" />

          {/* Notch Speaker */}
          <rect x="450" y="118" width="44" height="5" rx="2.5" fill="#334155" />

          {/* Screen Content: Sentinel Shield with Guard Icon */}
          <path
            d="M472,150 L502,162 C502,192 487,214 472,224 C457,214 442,192 442,162 Z"
            fill="url(#shieldGrad)"
            stroke="#ffffff"
            strokeWidth="2"
          />
          {/* Shield Emblem Inner Details */}
          <circle cx="472" cy="180" r="14" fill="#ffffff" opacity="0.25" />
          {/* Guard Cap Icon in Shield */}
          <path d="M464,178 C464,172 480,172 480,178 L482,183 L462,183 Z" fill="#facc15" />
          <circle cx="472" cy="186" r="4" fill="#ffffff" />

          {/* App Title on Screen */}
          <rect x="424" y="235" width="96" height="18" rx="4" fill="#0072f5" opacity="0.9" />
          <text x="472" y="248" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle" letterSpacing="0.5">
            SOCIETY GUARD
          </text>

          {/* Digital Verification Status Bar */}
          <rect x="424" y="260" width="96" height="28" rx="6" fill="#162a4d" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="438" cy="274" r="5" fill="#10b981" />
          <text x="450" y="277" fill="#ffffff" fontSize="8" fontWeight="bold">
            GATE VERIFIED
          </text>

          {/* Guard Silhouette avatar thumbnail */}
          <rect x="424" y="295" width="96" height="24" rx="4" fill="#101e38" />
          <circle cx="438" cy="307" r="6" fill="#60a5fa" />
          <line x1="452" y1="304" x2="495" y2="304" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <line x1="452" y1="310" x2="480" y2="310" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* ------------------------------------------------------------- */}
        {/* LEFT: Security Guard with Guard Sentinel Tablet               */}
        {/* ------------------------------------------------------------- */}
        <g>
          {/* Guard Shadow */}
          <ellipse cx="280" cy="420" rx="35" ry="8" fill="#0f2b5c" opacity="0.2" />

          {/* Shoes */}
          <ellipse cx="265" cy="418" rx="14" ry="6" fill="#0f172a" />
          <ellipse cx="295" cy="418" rx="14" ry="6" fill="#0f172a" />

          {/* Trousers (Navy Guard Uniform) */}
          <path d="M256,315 L272,315 L276,415 L260,415 Z" fill="#0f2b5c" />
          <path d="M276,315 L294,315 L302,415 L286,415 Z" fill="#0f2b5c" />
          {/* Belt */}
          <rect x="256" y="310" width="40" height="7" rx="2" fill="#000000" />
          <rect x="272" y="311" width="8" height="5" rx="1" fill="#facc15" />

          {/* Shirt / Uniform Jacket (Sky Blue) */}
          <path d="M250,230 L302,230 L296,312 L254,312 Z" fill="#3b82f6" />
          {/* Uniform Collar */}
          <polygon points="268,230 276,242 284,230" fill="#ffffff" />
          {/* Guard Badge / Epaulettes */}
          <rect x="248" y="232" width="10" height="5" rx="1" fill="#facc15" />
          <rect x="296" y="232" width="10" height="5" rx="1" fill="#facc15" />
          {/* Chest Shield Emblem */}
          <circle cx="288" cy="248" r="4.5" fill="#facc15" />

          {/* Head & Neck */}
          <rect x="270" y="215" width="12" height="16" fill="#fbcfe8" />
          <circle cx="276" cy="205" r="16" fill="#fbcfe8" />
          {/* Guard Peaked Cap */}
          <path d="M258,198 C258,188 294,188 294,198 Z" fill="#0f2b5c" />
          <path d="M254,198 L298,198 L296,203 L256,203 Z" fill="#000000" />
          <circle cx="276" cy="194" r="3" fill="#facc15" />

          {/* Arms holding Mobile / Scanner Tablet */}
          <path d="M250,234 L238,270 L256,280" fill="none" stroke="#3b82f6" strokeWidth="9" strokeLinecap="round" />
          <path d="M300,234 L310,270 L280,282" fill="none" stroke="#3b82f6" strokeWidth="9" strokeLinecap="round" />
          {/* Handheld Device */}
          <rect x="256" y="268" width="24" height="34" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <rect x="260" y="273" width="16" height="24" rx="2" fill="#38bdf8" />
        </g>

        {/* ------------------------------------------------------------- */}
        {/* CENTER-LEFT: Guest / Cab Vehicle (Front Car Arch)            */}
        {/* ------------------------------------------------------------- */}
        <g>
          {/* Car Shadow */}
          <ellipse cx="370" cy="425" rx="70" ry="12" fill="#0f2b5c" opacity="0.18" />

          {/* Car Body Shell (Beetle / Sedan curve from image) */}
          <path
            d="M305,405 C305,370 325,325 365,305 C400,288 440,295 460,345 C475,385 470,410 460,415 L310,415 Z"
            fill="url(#carGrad)"
            stroke="#ffffff"
            strokeWidth="3"
          />
          {/* Car Window */}
          <path
            d="M335,380 C335,345 350,320 380,312 C410,305 435,315 442,350 L442,380 Z"
            fill="#ffffff"
            opacity="0.85"
          />
          {/* Windshield divider */}
          <line x1="390" y1="310" x2="390" y2="380" stroke="#93c5fd" strokeWidth="2.5" />

          {/* Car Wheel */}
          <circle cx="370" cy="415" r="32" fill="#1e293b" />
          <circle cx="370" cy="415" r="18" fill="#ffffff" />
          <circle cx="370" cy="415" r="8" fill="#0072f5" />

          {/* Guest / Cab Badge Label on Wheel Hub / Door */}
          <g>
            <rect x="342" y="375" width="56" height="22" rx="11" fill="#ffffff" stroke="#0072f5" strokeWidth="2" />
            <text x="370" y="390" fill="#0f2b5c" fontSize="10" fontWeight="900" textAnchor="middle">
              Guest
            </text>
          </g>
        </g>

        {/* ------------------------------------------------------------- */}
        {/* CENTER-RIGHT: Delivery Scooter & Cargo Box                   */}
        {/* ------------------------------------------------------------- */}
        <g>
          {/* Scooter Shadow */}
          <ellipse cx="580" cy="425" rx="65" ry="10" fill="#0f2b5c" opacity="0.2" />

          {/* Scooter Mudguard & Body Arch */}
          <path
            d="M515,410 C515,360 550,335 605,340 C635,342 655,370 655,412 L525,415 Z"
            fill="url(#scooterGrad)"
            stroke="#ffffff"
            strokeWidth="3"
          />
          {/* Scooter Wheel */}
          <circle cx="585" cy="412" r="30" fill="#38bdf8" />
          <circle cx="585" cy="412" r="18" fill="#ffffff" />
          <circle cx="585" cy="412" r="7" fill="#0284c7" />

          {/* DELIVERY CARGO BOX (High Visibility Orange as in reference image) */}
          <rect x="540" y="270" width="90" height="75" rx="12" fill="url(#deliveryGrad)" stroke="#ffffff" strokeWidth="3" />
          {/* Speed / Trail streaks */}
          <line x1="635" y1="290" x2="680" y2="290" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
          <line x1="635" y1="305" x2="695" y2="305" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
          <line x1="635" y1="320" x2="670" y2="320" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />

          {/* "Delivery" Label on Box */}
          <text x="585" y="314" fill="#ffffff" fontSize="13" fontWeight="900" fontStyle="italic" textAnchor="middle" letterSpacing="0.5">
            Delivery
          </text>
        </g>

        {/* ------------------------------------------------------------- */}
        {/* RIGHT: Domestic Staff & Maintenance Crew (Overalls, Tools)   */}
        {/* ------------------------------------------------------------- */}
        <g>
          {/* Staff Shadow */}
          <ellipse cx="740" cy="420" rx="45" ry="8" fill="#0f2b5c" opacity="0.2" />

          {/* Staff 1: Electrician / Maintenance Tech (Blue Overalls, Hard Hat) */}
          <g>
            {/* Boots */}
            <ellipse cx="715" cy="418" rx="12" ry="5" fill="#0f172a" />
            <ellipse cx="735" cy="418" rx="12" ry="5" fill="#0f172a" />
            {/* Overalls Legs */}
            <path d="M708,325 L722,325 L722,415 L710,415 Z" fill="#1d4ed8" />
            <path d="M725,325 L740,325 L742,415 L730,415 Z" fill="#1d4ed8" />
            {/* Torso */}
            <path d="M706,250 L742,250 L738,326 L708,326 Z" fill="#1d4ed8" />
            {/* Belt & Tool Hook */}
            <rect x="708" y="322" width="30" height="5" rx="1" fill="#000000" />
            <circle cx="735" cy="330" r="3" fill="#facc15" />
            {/* Head */}
            <circle cx="724" cy="225" r="14" fill="#fed7aa" />
            {/* Hard Hat (Safety Helmet) */}
            <path d="M708,220 C708,210 740,210 740,220 Z" fill="#38bdf8" />
            <ellipse cx="724" cy="220" rx="18" ry="4" fill="#0284c7" />
            {/* Arm with cable coil */}
            <ellipse cx="698" cy="285" rx="10" ry="24" fill="none" stroke="#10b981" strokeWidth="6" />
          </g>

          {/* Staff 2: Domestic Assistant / Facility Professional (Apron / Uniform) */}
          <g>
            {/* Shoes */}
            <ellipse cx="760" cy="418" rx="11" ry="5" fill="#0f172a" />
            <ellipse cx="780" cy="418" rx="11" ry="5" fill="#0f172a" />
            {/* Trousers */}
            <rect x="754" y="325" width="34" height="90" rx="4" fill="#0f2b5c" />
            {/* Uniform Vest (Teal / Emerald) */}
            <rect x="752" y="250" width="36" height="76" rx="6" fill="#0d9488" />
            {/* Head */}
            <circle cx="770" cy="225" r="13" fill="#fed7aa" />
            {/* Hair */}
            <path d="M756,225 C756,215 784,215 784,225 Z" fill="#78350f" />
            {/* Arms holding Service Tool Box */}
            <path d="M752,260 L742,295 L755,310" fill="none" stroke="#0d9488" strokeWidth="7" strokeLinecap="round" />
            {/* Tool Box */}
            <rect x="740" y="305" width="36" height="25" rx="4" fill="#0f172a" stroke="#facc15" strokeWidth="1.5" />
            <rect x="752" y="300" width="12" height="6" rx="2" fill="#94a3b8" />
          </g>

          {/* "Staff" Badge Label */}
          <g>
            <text x="695" y="375" fill="#0f2b5c" fontSize="12" fontWeight="900" fontStyle="italic">
              Staff
            </text>
          </g>
        </g>

        {/* ------------------------------------------------------------- */}
        {/* LAMPPOST & DECORATIVE LEAVES (Visual Framing from image)     */}
        {/* ------------------------------------------------------------- */}
        {/* Lamppost behind Staff */}
        <line x1="740" y1="170" x2="740" y2="280" stroke="#38bdf8" strokeWidth="3" opacity="0.75" />
        <rect x="732" y="152" width="16" height="22" rx="3" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" />
        <circle cx="740" cy="163" r="5" fill="#facc15" />

        {/* Foreground decorative leaves (matching reference aesthetic) */}
        <path d="M210,380 C210,360 230,345 240,365 C240,385 220,400 210,380 Z" fill="#38bdf8" opacity="0.65" />
        <path d="M230,390 C230,370 250,355 260,375 C260,395 240,410 230,390 Z" fill="#0284c7" opacity="0.5" />
        <path d="M780,385 C780,365 800,350 810,370 C810,390 790,405 780,385 Z" fill="#38bdf8" opacity="0.65" />
      </svg>
    </div>
  );
};
export default VisitorStaffIllustration;
