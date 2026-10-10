import type { FC } from "react";

/**
 * CommunityHeroLandscape
 * Ultra-Compact, Perfectly Proportioned Panoramic Skyline:
 * - Reduced height (200px viewBox) with all dead space removed
 * - Full-height drawing fits completely on both Home Page and Auth pages without any cut-off
 * - Natural green landscaping: lush emerald, fresh spring green, soft olive/sage, and silver birch trees
 * - Iconic modern corporate architecture matching the website: Royal blue (#0072f5), sky blue (#38bdf8), crisp titanium white (#ffffff), and deep navy (#0f2b5c)
 * - Cozy, naturally proportioned Scandinavian white houses with dot windows and warm cedar roofs
 */
export const CommunityHeroLandscape: FC<{
  className?: string;
  preserveAspectRatio?: string;
}> = ({ className = "", preserveAspectRatio = "none" }) => {
  return (
    <div className={`relative w-full min-w-full overflow-hidden select-none pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 1600 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block w-full h-full min-w-full"
        preserveAspectRatio={preserveAspectRatio}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <style>{`
            @keyframes softFloat {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-1.5px); }
            }
            .anim-float { animation: softFloat 4s ease-in-out infinite; }
          `}</style>

          {/* PALETTE GRADIENTS */}

          {/* 1. Deep Navy Mountain Ridge */}
          <linearGradient id="mtnNavy" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#0f2347" />
          </linearGradient>

          {/* 2. Primary Sky Glass / Royal Blue Facade */}
          <linearGradient id="bldgRoyal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* 3. Deep Blue Shadow Facet */}
          <linearGradient id="bldgNavyFacet" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0c4a6e" />
            <stop offset="100%" stopColor="#082f49" />
          </linearGradient>

          {/* 4. Natural Green Hill Gradients */}
          <linearGradient id="hillNaturalBack" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d8f3dc" />
            <stop offset="100%" stopColor="#b7e4c7" />
          </linearGradient>

          <linearGradient id="hillNaturalMid" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#74c69d" />
            <stop offset="100%" stopColor="#52b788" />
          </linearGradient>

          <linearGradient id="shrubForestDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2d6a4f" />
            <stop offset="100%" stopColor="#1b4332" />
          </linearGradient>

          {/* 5. Tree Foliage Gradients */}
          <linearGradient id="treeLeafyGreen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#52b788" />
            <stop offset="100%" stopColor="#2d6a4f" />
          </linearGradient>

          <linearGradient id="treeOliveSage" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a3b18a" />
            <stop offset="100%" stopColor="#588157" />
          </linearGradient>

          <linearGradient id="treeSpringGreen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#95d5b2" />
            <stop offset="100%" stopColor="#52b788" />
          </linearGradient>

          <linearGradient id="woodWarmHoney" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e2ba86" />
            <stop offset="100%" stopColor="#c58f5e" />
          </linearGradient>

          {/* 6. Soft Clouds */}
          <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* ========================================================= */}
        {/* LAYER 1: SKY ELEMENTS (CLOUDS & BIRDS)                    */}
        {/* ========================================================= */}
        <g fill="url(#cloudGrad)">
          {/* Cloud 1 */}
          <path d="M555,24 L625,24 Q634,24 634,18 Q634,12 623,12 Q621,4 606,4 Q599,4 593,8 Q588,5 577,5 Q566,5 564,15 Q555,17 555,24 Z" />
          {/* Cloud 2 */}
          <path d="M665,16 L730,16 Q737,16 737,11 Q737,6 726,6 Q722,-1 711,-1 Q704,-1 698,3 Q694,1 685,1 Q675,1 673,9 Q665,11 665,16 Z" />
          {/* Cloud 3 */}
          <path d="M925,28 L1000,28 Q1008,28 1008,22 Q1008,16 997,16 Q995,7 980,7 Q973,7 968,11 Q962,8 952,8 Q939,8 937,18 Q925,20 925,28 Z" />
          {/* Cloud 4 */}
          <path d="M1100,32 L1155,32 Q1162,32 1162,27 Q1162,23 1152,23 Q1149,17 1139,17 Q1134,17 1129,20 Q1125,18 1118,18 Q1110,18 1108,25 Q1100,27 1100,32 Z" />
          {/* Cloud 5 */}
          <path d="M1350,36 L1415,36 Q1422,36 1422,31 Q1422,26 1411,26 Q1408,19 1397,19 Q1390,19 1385,23 Q1380,20 1372,20 Q1362,20 1360,28 Q1350,30 1350,36 Z" />
        </g>

        {/* Soaring Birds */}
        <g fill="#0284c7" opacity="0.75" className="anim-float">
          <path d="M580,10 Q583,7 586,10 Q589,7 592,10 Q589,8 586,11 Q583,8 580,10 Z" />
          <path d="M596,5 Q599,2 602,5 Q605,2 608,5 Q605,3 602,6 Q599,3 596,5 Z" />
          <path d="M614,8 Q617,5 620,8 Q623,5 626,8 Q623,6 620,9 Q617,6 614,8 Z" />

          <path d="M1270,18 Q1273,15 1276,18 Q1279,15 1282,18 Q1279,16 1276,19 Q1273,16 1270,18 Z" />
          <path d="M1285,14 Q1288,11 1291,14 Q1294,11 1297,14 Q1294,12 1291,15 Q1288,12 1285,14 Z" />

          <path d="M1390,22 Q1393,19 1396,22 Q1399,19 1402,22 Q1399,20 1396,23 Q1393,20 1390,22 Z" />
        </g>

        {/* ========================================================= */}
        {/* LAYER 2: BACKGROUND DEEP NAVY MOUNTAIN SILHOUETTE         */}
        {/* ========================================================= */}
        <path
          d="M0,75 
             Q70,55 140,58 
             Q210,62 280,82 
             Q340,75 400,60 
             Q460,45 520,48 
             Q580,52 630,72 
             L630,88 L850,88 L850,75 
             Q920,78 980,95 
             L1150,95 L1150,78 
             Q1250,68 1330,72 
             Q1420,55 1500,72 
             Q1560,80 1600,75 
             L1600,200 L0,200 Z"
          fill="url(#mtnNavy)"
        />

        {/* ========================================================= */}
        {/* LAYER 3: MIDGROUND SKYSCRAPERS & TOWERS                   */}
        {/* ========================================================= */}

        {/* --- LEFT CLUSTER: TWIN WHITE TOWERS (x=90 - 250) --- */}
        <g>
          {/* Tower 1 */}
          <rect x="94" y="65" width="72" height="70" fill="#ffffff" stroke="#0f2347" strokeWidth="1.8" />
          <rect x="90" y="62" width="80" height="4" fill="#0f2347" />
          {[0, 1, 2, 3].map((row) => (
            <g key={`tw1-${row}`} transform={`translate(102, ${70 + row * 14})`}>
              <rect x="0" y="0" width="6" height="7" fill="#0284c7" />
              <rect x="13" y="0" width="6" height="7" fill="#0284c7" />
              <rect x="26" y="0" width="6" height="7" fill="#0284c7" />
              <rect x="39" y="0" width="6" height="7" fill="#0284c7" />
              <rect x="52" y="0" width="6" height="7" fill="#0284c7" />
            </g>
          ))}

          {/* Tower 2 */}
          <rect x="178" y="65" width="72" height="70" fill="#ffffff" stroke="#0f2347" strokeWidth="1.8" />
          <rect x="174" y="62" width="80" height="4" fill="#0f2347" />
          {[0, 1, 2, 3].map((row) => (
            <g key={`tw2-${row}`} transform={`translate(186, ${70 + row * 14})`}>
              <rect x="0" y="0" width="6" height="7" fill="#0284c7" />
              <rect x="13" y="0" width="6" height="7" fill="#0284c7" />
              <rect x="26" y="0" width="6" height="7" fill="#0284c7" />
              <rect x="39" y="0" width="6" height="7" fill="#0284c7" />
              <rect x="52" y="0" width="6" height="7" fill="#0284c7" />
            </g>
          ))}
        </g>

        {/* --- CENTER-LEFT CLUSTER (x=560 - 760) --- */}
        {/* Slender White Tower */}
        <g>
          <rect x="565" y="55" width="58" height="85" fill="#ffffff" stroke="#0f2347" strokeWidth="1.5" />
          <rect x="560" y="52" width="68" height="4" fill="#0f2347" />
          {[0, 1, 2, 3, 4].map((row) => (
            <g key={`tmid1-${row}`} transform={`translate(573, ${60 + row * 14})`}>
              <rect x="0" y="0" width="7" height="7" fill="#0284c7" />
              <rect x="15" y="0" width="7" height="7" fill="#0284c7" />
              <rect x="30" y="0" width="7" height="7" fill="#0284c7" />
            </g>
          ))}
        </g>

        {/* Blue Grid Skyscraper (x=660, y=40) */}
        <g>
          <rect x="660" y="40" width="68" height="100" fill="url(#bldgRoyal)" stroke="#0f2347" strokeWidth="1.8" />
          <rect x="728" y="40" width="34" height="100" fill="url(#bldgNavyFacet)" stroke="#0f2347" strokeWidth="1.8" />
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <g key={`bldgg-${row}`} transform={`translate(668, ${48 + row * 14})`}>
              <rect x="0" y="0" width="8" height="7" fill="#ffffff" />
              <rect x="13" y="0" width="8" height="7" fill="#ffffff" />
              <rect x="26" y="0" width="8" height="7" fill="#ffffff" />
              <rect x="39" y="0" width="8" height="7" fill="#ffffff" />
            </g>
          ))}
        </g>

        {/* --- HERO TALLEST SKYSCRAPER WITH ANGLED ROOF & PINSTRIPES (x=760 - 870) --- */}
        <g>
          <polygon
            points="760,42 820,20 820,140 760,140"
            fill="#ffffff"
            stroke="#0f2347"
            strokeWidth="1.8"
          />
          {[8, 18, 28, 38, 48].map((ox) => (
            <line
              key={`pinstripe-${ox}`}
              x1={760 + ox}
              y1={42 - ox * 0.36}
              x2={760 + ox}
              y2={140}
              stroke="#0284c7"
              strokeWidth="2"
            />
          ))}

          {/* 3D Side Shadow Facet */}
          <polygon
            points="820,20 870,36 870,140 820,140"
            fill="url(#bldgRoyal)"
            stroke="#0f2347"
            strokeWidth="1.8"
          />
          {[12, 24, 36].map((ox) => (
            <line
              key={`shadowlines-${ox}`}
              x1={820 + ox}
              y1={20 + ox * 0.32}
              x2={820 + ox}
              y2={140}
              stroke="#0f2347"
              strokeWidth="1.8"
            />
          ))}
        </g>

        {/* --- MODERN HORIZONTAL-LOUVRED HIGH-RISE (x=870 - 1025) --- */}
        <g>
          <polygon
            points="870,62 950,46 950,140 870,140"
            fill="#38bdf8"
            stroke="#0f2347"
            strokeWidth="1.8"
          />
          <rect x="950" y="68" width="75" height="72" fill="#7dd3fc" stroke="#0f2347" strokeWidth="1.8" />

          {/* Louvers */}
          {[0, 1, 2, 3, 4, 5, 6].map((r) => (
            <line
              key={`hstripes1-${r}`}
              x1="871"
              y1={64 + r * 10}
              x2="949"
              y2={64 + r * 10}
              stroke="#ffffff"
              strokeWidth="2"
            />
          ))}
          {[0, 1, 2, 3, 4, 5].map((r) => (
            <line
              key={`hstripes2-${r}`}
              x1="951"
              y1={74 + r * 10}
              x2="1024"
              y2={74 + r * 10}
              stroke="#ffffff"
              strokeWidth="1.8"
            />
          ))}
        </g>

        {/* --- RIGHT CLUSTER SKYSCRAPERS (x=1140 - 1385) --- */}
        {/* Right Hero Skyscraper */}
        <g>
          <polygon
            points="1140,50 1200,30 1200,140 1140,140"
            fill="#ffffff"
            stroke="#0f2347"
            strokeWidth="1.8"
          />
          {[8, 18, 28, 38, 48].map((ox) => (
            <line
              key={`rpinstripe-${ox}`}
              x1={1140 + ox}
              y1={50 - ox * 0.33}
              x2={1140 + ox}
              y2={140}
              stroke="#0284c7"
              strokeWidth="2"
            />
          ))}

          {/* 3D Side Facet */}
          <polygon
            points="1200,30 1235,42 1235,140 1200,140"
            fill="url(#bldgRoyal)"
            stroke="#0f2347"
            strokeWidth="1.8"
          />
          {[10, 20].map((ox) => (
            <line
              key={`rshadowlines-${ox}`}
              x1={1200 + ox}
              y1={30 + ox * 0.34}
              x2={1200 + ox}
              y2={140}
              stroke="#0f2347"
              strokeWidth="1.8"
            />
          ))}
        </g>

        {/* Right Grid Tower (x=1235 - 1315) */}
        <g>
          <rect x="1235" y="55" width="80" height="85" fill="url(#bldgRoyal)" stroke="#0f2347" strokeWidth="1.8" />
          {[0, 1, 2, 3, 4].map((row) => (
            <g key={`rbldgg-${row}`} transform={`translate(1244, ${62 + row * 14})`}>
              <rect x="0" y="0" width="8" height="7" fill="#ffffff" />
              <rect x="15" y="0" width="8" height="7" fill="#ffffff" />
              <rect x="30" y="0" width="8" height="7" fill="#ffffff" />
              <rect x="45" y="0" width="8" height="7" fill="#ffffff" />
            </g>
          ))}
        </g>

        {/* Right White Tower (x=1315 - 1385) */}
        <g>
          <rect x="1315" y="70" width="65" height="70" fill="#ffffff" stroke="#0f2347" strokeWidth="1.8" />
          <rect x="1310" y="67" width="75" height="4" fill="#0f2347" />
          {[0, 1, 2, 3].map((row) => (
            <g key={`rwht-${row}`} transform={`translate(1325, ${75 + row * 14})`}>
              <rect x="0" y="0" width="6" height="7" fill="#0284c7" />
              <rect x="15" y="0" width="6" height="7" fill="#0284c7" />
              <rect x="30" y="0" width="6" height="7" fill="#0284c7" />
            </g>
          ))}
        </g>

        {/* ========================================================= */}
        {/* LAYER 4: NATURAL MIDGROUND ROLLING HILLS & GREENERY       */}
        {/* ========================================================= */}
        <path
          d="M0,115 
             Q120,98 250,108 
             Q400,118 520,100 
             Q640,84 770,102 
             Q900,120 1040,102 
             Q1180,86 1310,105 
             Q1450,122 1600,108 
             L1600,200 L0,200 Z"
          fill="url(#hillNaturalBack)"
        />

        {/* Midground Cottages */}
        <g transform="translate(18, 100)">
          <polygon points="35,0 0,20 70,20" fill="#2d6a4f" stroke="#1b4332" strokeWidth="1.2" />
          <rect x="0" y="20" width="70" height="24" fill="#d8f3dc" stroke="#1b4332" strokeWidth="1.2" />
          <rect x="10" y="25" width="12" height="9" fill="#ffffff" />
          <rect x="32" y="25" width="12" height="9" fill="#ffffff" />
        </g>

        <g transform="translate(480, 94)">
          <polygon points="40,0 0,22 80,22" fill="#2d6a4f" stroke="#1b4332" strokeWidth="1.2" />
          <rect x="0" y="22" width="80" height="26" fill="#d8f3dc" stroke="#1b4332" strokeWidth="1.2" />
          <rect x="12" y="27" width="12" height="10" fill="#ffffff" />
          <rect x="34" y="27" width="12" height="10" fill="#ffffff" />
          <rect x="56" y="30" width="10" height="18" fill="#1b4332" />
        </g>

        <g transform="translate(1360, 102)">
          <polygon points="35,0 0,18 70,18" fill="#2d6a4f" stroke="#1b4332" strokeWidth="1.2" />
          <rect x="0" y="18" width="70" height="22" fill="#d8f3dc" stroke="#1b4332" strokeWidth="1.2" />
          <rect x="12" y="23" width="10" height="8" fill="#ffffff" />
          <rect x="32" y="23" width="10" height="8" fill="#ffffff" />
        </g>

        {/* Midground Trees */}
        <g>
          <path d="M260,112 Q272,82 284,112 Z" fill="url(#treeLeafyGreen)" stroke="#1b4332" strokeWidth="1.2" />
          <line x1="272" y1="108" x2="272" y2="128" stroke="#4a3728" strokeWidth="2" />

          <path d="M295,108 Q305,78 315,108 Z" fill="#ffffff" stroke="#1b4332" strokeWidth="1.2" />
          <line x1="305" y1="104" x2="305" y2="126" stroke="#4a3728" strokeWidth="2" />

          <path d="M328,110 Q340,78 351,110 Z" fill="url(#woodWarmHoney)" stroke="#1b4332" strokeWidth="1.2" />
          <line x1="340" y1="106" x2="340" y2="128" stroke="#4a3728" strokeWidth="2" />

          <circle cx="410" cy="120" r="18" fill="#52b788" />
          <circle cx="440" cy="118" r="15" fill="#40916c" />
        </g>

        <g>
          <path d="M732,118 Q743,88 754,118 Z" fill="#ffffff" stroke="#1b4332" strokeWidth="1.2" />
          <line x1="743" y1="114" x2="743" y2="136" stroke="#4a3728" strokeWidth="2" />

          <path d="M768,114 Q778,85 788,114 Z" fill="url(#treeSpringGreen)" stroke="#1b4332" strokeWidth="1.2" />
          <line x1="778" y1="110" x2="778" y2="134" stroke="#4a3728" strokeWidth="2" />

          <path d="M890,118 Q900,88 910,118 Z" fill="url(#treeLeafyGreen)" stroke="#1b4332" strokeWidth="1.2" />
          <line x1="900" y1="114" x2="900" y2="136" stroke="#4a3728" strokeWidth="2" />

          <circle cx="945" cy="116" r="14" fill="#52b788" />
          <line x1="945" y1="116" x2="945" y2="135" stroke="#4a3728" strokeWidth="2" />
        </g>

        <g>
          <path d="M1295,118 Q1306,90 1316,118 Z" fill="#ffffff" stroke="#1b4332" strokeWidth="1.2" />
          <line x1="1306" y1="114" x2="1306" y2="136" stroke="#4a3728" strokeWidth="2" />

          <path d="M1328,116 Q1338,88 1348,116 Z" fill="url(#woodWarmHoney)" stroke="#1b4332" strokeWidth="1.2" />
          <line x1="1338" y1="112" x2="1338" y2="136" stroke="#4a3728" strokeWidth="2" />

          <circle cx="1515" cy="118" r="15" fill="#40916c" />
          <line x1="1515" y1="118" x2="1515" y2="138" stroke="#4a3728" strokeWidth="2" />
        </g>

        {/* ========================================================= */}
        {/* LAYER 5: FOREGROUND NATURAL GREEN MOUNDS & SHRUBS         */}
        {/* ========================================================= */}
        <path
          d="M0,140 
             Q100,128 220,144 
             Q340,160 480,136 
             Q620,118 760,140 
             Q900,162 1040,140 
             Q1180,118 1320,144 
             Q1460,166 1600,144 
             L1600,200 L0,200 Z"
          fill="url(#hillNaturalMid)"
        />

        {/* Forest Green Base Shrub Clusters */}
        <g fill="url(#shrubForestDark)">
          <circle cx="95" cy="150" r="22" />
          <circle cx="215" cy="146" r="19" />
          <circle cx="560" cy="142" r="20" />
          <circle cx="680" cy="138" r="24" />
          <circle cx="880" cy="144" r="22" />
          <circle cx="1060" cy="138" r="20" />
          <circle cx="1230" cy="144" r="24" />
          <circle cx="1380" cy="150" r="20" />
        </g>

        {/* ========================================================= */}
        {/* LAYER 6: FOREGROUND ICONIC HOUSES (COMPACT & PROPORTIONATE)*/}
        {/* ========================================================= */}

        {/* --- HOUSE FG-1 (Far Left White Gabled Dot House) --- */}
        <g transform="translate(0, 162)">
          <polygon points="28,0 0,16 56,16" fill="#2d6a4f" stroke="#0f2347" strokeWidth="1.5" />
          <rect x="0" y="16" width="56" height="22" fill="#ffffff" stroke="#0f2347" strokeWidth="1.5" />
          <circle cx="14" cy="24" r="2.2" fill="#0f2347" />
          <circle cx="28" cy="24" r="2.2" fill="#0f2347" />
          <circle cx="42" cy="24" r="2.2" fill="#0f2347" />
          <circle cx="14" cy="32" r="2.2" fill="#0f2347" />
          <circle cx="28" cy="32" r="2.2" fill="#0f2347" />
          <circle cx="42" cy="32" r="2.2" fill="#0f2347" />
        </g>

        {/* --- HOUSE FG-2 (Left Companion Cottage) --- */}
        <g transform="translate(100, 164)">
          <polygon points="0,10 32,0 76,0 76,36 0,36" fill="#ffffff" stroke="#0f2347" strokeWidth="1.5" />
          <polygon points="32,0 76,0 76,11 32,11" fill="url(#woodWarmHoney)" stroke="#0f2347" strokeWidth="1.5" />
        </g>

        {/* --- HOUSE FG-3 (Left Soft Mint/Blue Window House) --- */}
        <g transform="translate(220, 158)">
          <polygon points="48,0 0,18 96,18" fill="#2d6a4f" stroke="#0f2347" strokeWidth="1.5" />
          <rect x="0" y="18" width="96" height="24" fill="#d8f3dc" stroke="#0f2347" strokeWidth="1.5" />
          {[0, 1].map((r) => (
            <g key={`fgh3-${r}`} transform={`translate(10, ${22 + r * 9})`}>
              <rect x="0" y="0" width="8" height="6" fill="#ffffff" stroke="#0f2347" strokeWidth="0.8" />
              <rect x="16" y="0" width="8" height="6" fill="#ffffff" stroke="#0f2347" strokeWidth="0.8" />
              <rect x="32" y="0" width="8" height="6" fill="#ffffff" stroke="#0f2347" strokeWidth="0.8" />
              <rect x="48" y="0" width="8" height="6" fill="#ffffff" stroke="#0f2347" strokeWidth="0.8" />
              <rect x="64" y="0" width="8" height="6" fill="#ffffff" stroke="#0f2347" strokeWidth="0.8" />
            </g>
          ))}
        </g>

        {/* --- HOUSE FG-4 (ICONIC WHITE GABLE DOT HOUSE LEFT) --- */}
        <g transform="translate(340, 154)">
          <polygon points="40,0 0,20 80,20" fill="#ffffff" stroke="#0f2347" strokeWidth="1.8" />
          <rect x="0" y="20" width="80" height="26" fill="#ffffff" stroke="#0f2347" strokeWidth="1.8" />
          {[0, 1].map((r) => (
            <g key={`fgdots1-${r}`} transform={`translate(12, ${24 + r * 9})`}>
              <rect x="0" y="0" width="4.5" height="4.5" rx="0.8" fill="#0f2347" />
              <rect x="15" y="0" width="4.5" height="4.5" rx="0.8" fill="#0f2347" />
              <rect x="30" y="0" width="4.5" height="4.5" rx="0.8" fill="#0f2347" />
              <rect x="45" y="0" width="4.5" height="4.5" rx="0.8" fill="#0f2347" />
            </g>
          ))}
        </g>

        {/* --- HOUSE FG-5 (Slanted Shed Cottage with Wood Slats) --- */}
        <g transform="translate(535, 158)">
          <polygon points="0,14 32,0 80,18 80,42 0,42" fill="#ffffff" stroke="#0f2347" strokeWidth="1.5" />
          <rect x="32" y="18" width="48" height="24" fill="url(#woodWarmHoney)" stroke="#0f2347" strokeWidth="1.5" />
          <line x1="32" y1="18" x2="80" y2="18" stroke="#0f2347" strokeWidth="1.5" />
          {/* Slats */}
          <polygon points="30,0 82,18 82,22 30,4" fill="#2d6a4f" stroke="#0f2347" strokeWidth="1.5" />
          {[0, 1, 2, 3].map((sl) => (
            <line
              key={`slat-${sl}`}
              x1={36 + sl * 11}
              y1={3 + sl * 4}
              x2={36 + sl * 11}
              y2={7 + sl * 4}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          ))}
        </g>

        {/* --- HOUSE FG-6 [CENTERPIECE HERO WHITE GABLE DOT HOUSE] --- */}
        <g transform="translate(640, 142)">
          <polygon points="46,0 0,26 92,26" fill="#ffffff" stroke="#0f2347" strokeWidth="2" />
          <line x1="46" y1="0" x2="46" y2="26" stroke="#2d6a4f" strokeWidth="1.8" />
          <polygon points="46,0 92,26 88,26 46,2" fill="#2d6a4f" opacity="0.3" />

          <rect x="0" y="26" width="92" height="32" fill="#ffffff" stroke="#0f2347" strokeWidth="2" />
          {[0, 1, 2].map((r) => (
            <g key={`herodots-${r}`} transform={`translate(14, ${31 + r * 8})`}>
              <rect x="0" y="0" width="4.5" height="4.5" rx="0.8" fill="#0f2347" />
              <rect x="18" y="0" width="4.5" height="4.5" rx="0.8" fill="#0f2347" />
              <rect x="36" y="0" width="4.5" height="4.5" rx="0.8" fill="#0f2347" />
              <rect x="54" y="0" width="4.5" height="4.5" rx="0.8" fill="#0f2347" />
            </g>
          ))}
        </g>

        {/* --- HOUSE FG-7 (Modern Shed-Roof Cottage + White Outbuilding) --- */}
        <g transform="translate(800, 156)">
          <polygon points="0,0 52,18 52,44 0,44" fill="url(#woodWarmHoney)" stroke="#0f2347" strokeWidth="1.5" />
          <line x1="0" y1="0" x2="52" y2="18" stroke="#0f2347" strokeWidth="2.5" />
          <rect x="10" y="24" width="10" height="9" fill="#ffffff" stroke="#0f2347" strokeWidth="0.8" />
          <rect x="26" y="28" width="10" height="9" fill="#ffffff" stroke="#0f2347" strokeWidth="0.8" />

          <g transform="translate(52, 16)">
            <polygon points="14,0 0,11 28,11" fill="#ffffff" stroke="#0f2347" strokeWidth="1.5" />
            <rect x="0" y="11" width="28" height="17" fill="#ffffff" stroke="#0f2347" strokeWidth="1.5" />
          </g>
        </g>

        {/* --- HOUSE FG-8 (WHITE GABLE DOT HOUSE RIGHT-CENTER) --- */}
        <g transform="translate(950, 156)">
          <polygon points="36,0 0,18 72,18" fill="#ffffff" stroke="#0f2347" strokeWidth="1.8" />
          <rect x="0" y="18" width="72" height="26" fill="#ffffff" stroke="#0f2347" strokeWidth="1.8" />
          {[0, 1].map((r) => (
            <g key={`fgdots2-${r}`} transform={`translate(12, ${23 + r * 9})`}>
              <rect x="0" y="0" width="4.5" height="4.5" rx="0.8" fill="#0f2347" />
              <rect x="15" y="0" width="4.5" height="4.5" rx="0.8" fill="#0f2347" />
              <rect x="30" y="0" width="4.5" height="4.5" rx="0.8" fill="#0f2347" />
            </g>
          ))}
        </g>

        {/* --- HOUSE FG-9 (Striped Roof Cottage) --- */}
        <g transform="translate(1035, 164)">
          <polygon points="0,0 36,0 72,16 72,36 0,36" fill="#d8f3dc" stroke="#0f2347" strokeWidth="1.5" />
          <polygon points="0,0 36,0 72,16 0,16" fill="url(#woodWarmHoney)" stroke="#0f2347" strokeWidth="1.5" />
          {[0, 1, 2, 3].map((sl) => (
            <line
              key={`rslat-${sl}`}
              x1={8 + sl * 12}
              y1="0"
              x2={8 + sl * 12}
              y2={sl > 1 ? 8 : 16}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          ))}
          <rect x="14" y="22" width="10" height="9" fill="#ffffff" />
          <rect x="36" y="22" width="10" height="9" fill="#ffffff" />
        </g>

        {/* --- HOUSE FG-10 (WHITE GABLE DOT HOUSE FAR RIGHT) --- */}
        <g transform="translate(1190, 155)">
          <polygon points="38,0 0,20 76,20" fill="#ffffff" stroke="#0f2347" strokeWidth="1.8" />
          <rect x="0" y="20" width="76" height="25" fill="#ffffff" stroke="#0f2347" strokeWidth="1.8" />
          {[0, 1].map((r) => (
            <g key={`fgdots3-${r}`} transform={`translate(12, ${24 + r * 9})`}>
              <rect x="0" y="0" width="4.5" height="4.5" rx="0.8" fill="#0f2347" />
              <rect x="15" y="0" width="4.5" height="4.5" rx="0.8" fill="#0f2347" />
              <rect x="30" y="0" width="4.5" height="4.5" rx="0.8" fill="#0f2347" />
            </g>
          ))}
        </g>

        {/* --- HOUSE FG-11 (Far Right Companion Cottage) --- */}
        <g transform="translate(1280, 162)">
          <rect x="0" y="0" width="44" height="38" fill="#b7e4c7" stroke="#0f2347" strokeWidth="1.5" />
          {[0, 1].map((r) => (
            <g key={`fgrw-${r}`} transform={`translate(8, ${8 + r * 12})`}>
              <rect x="0" y="0" width="7" height="7" fill="#ffffff" />
              <rect x="14" y="0" width="7" height="7" fill="#ffffff" />
            </g>
          ))}
        </g>

        {/* ========================================================= */}
        {/* LAYER 7: FOREGROUND NATURAL TREES & PLANTS                */}
        {/* ========================================================= */}
        {/* Left Section */}
        <g>
          {/* White Silver Birch */}
          <path d="M58,168 Q70,140 82,168 Z" fill="#ffffff" stroke="#1b4332" strokeWidth="1.5" />
          <line x1="70" y1="165" x2="70" y2="185" stroke="#4a3728" strokeWidth="2" />

          {/* Leafy Green Teardrop Tree */}
          <path d="M78,172 Q88,148 98,172 Z" fill="url(#treeLeafyGreen)" stroke="#1b4332" strokeWidth="1.5" />
          <line x1="88" y1="169" x2="88" y2="188" stroke="#4a3728" strokeWidth="2" />

          {/* Warm Amber Tree */}
          <path d="M155,175 Q165,150 175,175 Z" fill="url(#woodWarmHoney)" stroke="#1b4332" strokeWidth="1.5" />
          <line x1="165" y1="172" x2="165" y2="190" stroke="#4a3728" strokeWidth="2" />
        </g>

        {/* Center-Left Section */}
        <g>
          {/* Conifer in Forest Greens */}
          <polygon points="460,165 452,185 468,185" fill="#1b4332" stroke="#0f2347" strokeWidth="1.2" />
          <polygon points="460,156 454,173 466,173" fill="#2d6a4f" stroke="#0f2347" strokeWidth="1.2" />
          <polygon points="460,146 455,160 465,160" fill="#52b788" stroke="#0f2347" strokeWidth="1.2" />
          <line x1="460" y1="182" x2="460" y2="195" stroke="#4a3728" strokeWidth="2" />

          {/* White Teardrop */}
          <path d="M485,172 Q497,146 509,172 Z" fill="#ffffff" stroke="#1b4332" strokeWidth="1.5" />
          <line x1="497" y1="169" x2="497" y2="188" stroke="#4a3728" strokeWidth="2" />

          {/* Olive/Sage Lollipop */}
          <circle cx="530" cy="170" r="12" fill="url(#treeOliveSage)" stroke="#1b4332" strokeWidth="1.5" />
          <line x1="530" y1="180" x2="530" y2="192" stroke="#4a3728" strokeWidth="2" />
        </g>

        {/* Right of Hero House */}
        <g>
          <path d="M750,172 Q760,144 770,172 Z" fill="#ffffff" stroke="#1b4332" strokeWidth="1.5" />
          <line x1="760" y1="169" x2="760" y2="188" stroke="#4a3728" strokeWidth="2" />

          <circle cx="792" cy="174" r="11" fill="url(#treeSpringGreen)" stroke="#1b4332" strokeWidth="1.5" />
          <line x1="792" y1="182" x2="792" y2="194" stroke="#4a3728" strokeWidth="2" />
        </g>

        {/* Right Section */}
        <g>
          <path d="M922,176 Q933,150 944,176 Z" fill="#ffffff" stroke="#1b4332" strokeWidth="1.5" />
          <line x1="933" y1="173" x2="933" y2="192" stroke="#4a3728" strokeWidth="2" />

          <path d="M946,178 Q955,155 964,178 Z" fill="url(#woodWarmHoney)" stroke="#1b4332" strokeWidth="1.5" />
          <line x1="955" y1="175" x2="955" y2="192" stroke="#4a3728" strokeWidth="2" />

          <path d="M1145,174 Q1156,146 1167,174 Z" fill="#ffffff" stroke="#1b4332" strokeWidth="1.5" />
          <line x1="1156" y1="171" x2="1156" y2="192" stroke="#4a3728" strokeWidth="2" />

          <circle cx="1185" cy="176" r="11" fill="url(#treeLeafyGreen)" stroke="#1b4332" strokeWidth="1.5" />
          <line x1="1185" y1="184" x2="1185" y2="194" stroke="#4a3728" strokeWidth="2" />

          {/* Natural Pine Far Right */}
          <polygon points="1350,170 1344,188 1356,188" fill="#1b4332" stroke="#0f2347" strokeWidth="1.2" />
          <polygon points="1350,162 1345,176 1355,176" fill="#2d6a4f" stroke="#0f2347" strokeWidth="1.2" />
          <polygon points="1350,154 1346,166 1354,166" fill="#52b788" stroke="#0f2347" strokeWidth="1.2" />
          <line x1="1350" y1="185" x2="1350" y2="196" stroke="#4a3728" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
};

export default CommunityHeroLandscape;
