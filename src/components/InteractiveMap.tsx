import { useState, useMemo } from "react";
import { GasStation } from "../types";
import { 
  MapPin, 
  Navigation, 
  Filter, 
  Star, 
  Compass, 
  Coffee, 
  Flame, 
  Wifi, 
  Activity, 
  Fuel, 
  ArrowRight,
  TrendingDown,
  Info
} from "lucide-react";

interface InteractiveMapProps {
  stations: GasStation[];
  selectedStation: GasStation | null;
  onSelectStation: (station: GasStation) => void;
  onFuelClick: (station: GasStation) => void;
  darkMode: boolean;
}

export default function InteractiveMap({
  stations,
  selectedStation,
  onSelectStation,
  onFuelClick,
  darkMode,
}: InteractiveMapProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "cheapest" | "closest" | "conveniência">("all");
  const [selectedFuelType, setSelectedFuelType] = useState<"gasoline" | "ethanol" | "diesel" | "premiumGas">("gasoline");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  // Simulated User GPS Location (Centered at Avenida Paulista - Fictional starting point)
  const userCoords = { lat: -23.5645, lng: -46.6620 };

  // Calculate distance on the fly for UI
  const stationsWithDistance = useMemo(() => {
    return stations.map(station => {
      // Very simple Euclidean distance approximation in km for local coordinates
      const dLat = (station.lat - userCoords.lat) * 111;
      const dLng = (station.lng - userCoords.lng) * 111 * Math.cos(userCoords.lat * Math.PI / 180);
      const distance = parseFloat(Math.sqrt(dLat * dLat + dLng * dLng).toFixed(2));
      return { ...station, distance };
    });
  }, [stations]);

  // Filter stations based on state
  const filteredStations = useMemo(() => {
    let result = [...stationsWithDistance];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        s => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)
      );
    }

    // Quick filter tab
    if (activeFilter === "cheapest") {
      result.sort((a, b) => a.prices[selectedFuelType] - b.prices[selectedFuelType]);
    } else if (activeFilter === "closest") {
      result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else if (activeFilter === "conveniência") {
      result = result.filter(s => s.features.includes("Loja de Conveniência"));
    }

    return result;
  }, [stationsWithDistance, activeFilter, selectedFuelType, searchQuery]);

  // Find cheapest station for highlight
  const cheapestStationId = useMemo(() => {
    if (stations.length === 0) return "";
    let minId = stations[0].id;
    let minPrice = stations[0].prices[selectedFuelType];
    stations.forEach(s => {
      if (s.prices[selectedFuelType] < minPrice) {
        minPrice = s.prices[selectedFuelType];
        minId = s.id;
      }
    });
    return minId;
  }, [stations, selectedFuelType]);

  const brandColors = {
    Petrobras: { bg: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500", pin: "#10B981" },
    Ipiranga: { bg: "bg-yellow-500", text: "text-yellow-600", border: "border-yellow-500", pin: "#F59E0B" },
    Shell: { bg: "bg-red-500", text: "text-red-500", border: "border-red-500", pin: "#EF4444" },
    Ale: { bg: "bg-orange-500", text: "text-orange-500", border: "border-orange-500", pin: "#F97316" },
    Independent: { bg: "bg-gray-500", text: "text-gray-500", border: "border-gray-500", pin: "#6B7280" },
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case "Loja de Conveniência": return <Coffee className="w-3.5 h-3.5" />;
      case "Lava Jato": return <Flame className="w-3.5 h-3.5" />;
      case "Wi-Fi": return <Wifi className="w-3.5 h-3.5" />;
      default: return <Activity className="w-3.5 h-3.5" />;
    }
  };

  const mapCenter = { lat: -23.565, lng: -46.660 };
  const mapScale = 6000; // Zoom multiplier

  const getSvgCoords = (lat: number, lng: number) => {
    const x = 200 + (lng - mapCenter.lng) * mapScale * 1.5;
    const y = 200 - (lat - mapCenter.lat) * mapScale;
    return { x, y };
  };

  const handleStartRoute = () => {
    setIsNavigating(true);
    setTimeout(() => {
      setIsNavigating(false);
    }, 4500);
  };

  return (
    <div id="interactive-map-section" className={`grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-2xl overflow-hidden border ${
      darkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
    } p-5 shadow-lg`}>
      
      {/* Search & List Controls - Left Side (4 Cols) */}
      <div className="lg:col-span-5 flex flex-col h-[520px]">
        <div className="mb-4">
          <h2 className="text-xl font-bold tracking-tight mb-2 flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-500" />
            Buscador de Postos & Preços
          </h2>
          <p className="text-xs text-zinc-500 mb-4">
            Compare preços de combustíveis em tempo real nos postos credenciados de São Paulo.
          </p>
          
          <input
            id="station-search"
            type="text"
            placeholder="Buscar por nome ou endereço..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              darkMode 
                ? "bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500" 
                : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400"
            }`}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1.5">
          <button
            id="filter-all"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              activeFilter === "all"
                ? "bg-emerald-500 text-white shadow-sm"
                : darkMode ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-400" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
            }`}
          >
            Todos
          </button>
          <button
            id="filter-cheapest"
            onClick={() => setActiveFilter("cheapest")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1 ${
              activeFilter === "cheapest"
                ? "bg-emerald-500 text-white shadow-sm"
                : darkMode ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-400" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            Mais Baratos
          </button>
          <button
            id="filter-closest"
            onClick={() => setActiveFilter("closest")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              activeFilter === "closest"
                ? "bg-emerald-500 text-white shadow-sm"
                : darkMode ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-400" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
            }`}
          >
            Mais Próximos
          </button>
          <button
            id="filter-store"
            onClick={() => setActiveFilter("conveniência")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              activeFilter === "conveniência"
                ? "bg-emerald-500 text-white shadow-sm"
                : darkMode ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-400" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
            }`}
          >
            Loja Conveniência
          </button>
        </div>

        {/* Fuel selector to compare prices */}
        <div className={`p-2 rounded-xl mb-3 flex justify-between items-center ${darkMode ? "bg-zinc-800/50" : "bg-zinc-100/70"}`}>
          <span className="text-xs font-semibold px-2 text-zinc-500">Comparar:</span>
          <div className="flex gap-1">
            {(["gasoline", "ethanol", "diesel", "premiumGas"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedFuelType(type)}
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                  selectedFuelType === type
                    ? "bg-emerald-600 text-white shadow-sm"
                    : darkMode ? "hover:bg-zinc-700 text-zinc-400" : "hover:bg-zinc-200 text-zinc-600"
                }`}
              >
                {type === "gasoline" ? "Gasolina" : type === "ethanol" ? "Etanol" : type === "diesel" ? "Diesel" : "Premium"}
              </button>
            ))}
          </div>
        </div>

        {/* Station List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredStations.map((station) => {
            const isSelected = selectedStation?.id === station.id;
            const isCheapest = station.id === cheapestStationId;
            const brandInfo = brandColors[station.brand] || brandColors.Independent;

            return (
              <div
                id={`station-item-${station.id}`}
                key={station.id}
                onClick={() => onSelectStation(station)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/10 shadow-sm"
                    : darkMode 
                      ? "border-zinc-800 hover:border-zinc-700 bg-zinc-800/25 hover:bg-zinc-800/50" 
                      : "border-zinc-200 hover:border-zinc-300 bg-zinc-50 hover:bg-zinc-100/50"
                }`}
              >
                <div className="flex justify-between items-start gap-1">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${brandInfo.bg}`}></span>
                      <h4 className="font-semibold text-sm leading-snug">{station.name}</h4>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1">{station.address}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-medium block text-zinc-500">
                      {station.distance} km de você
                    </span>
                    <span className="text-xs font-extrabold text-emerald-500 block mt-0.5">
                      R$ {station.prices[selectedFuelType].toFixed(2)}/L
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-2.5 pt-2.5 border-t border-zinc-500/10">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[11px] font-semibold">{station.rating}</span>
                    <div className="flex gap-1 ml-2">
                      {station.features.slice(0, 2).map((feat, i) => (
                        <span 
                          key={i} 
                          title={feat} 
                          className={`p-1 rounded ${darkMode ? "bg-zinc-800 text-zinc-400" : "bg-zinc-200 text-zinc-600"}`}
                        >
                          {getFeatureIcon(feat)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {isCheapest && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white">
                      Melhor Preço
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredStations.length === 0 && (
            <div className="text-center py-12 text-zinc-500">
              <Compass className="w-8 h-8 mx-auto mb-2 opacity-40 animate-pulse" />
              <p className="text-sm font-semibold">Nenhum posto encontrado</p>
              <p className="text-xs mt-1">Experimente remover alguns filtros.</p>
            </div>
          )}
        </div>
      </div>

      {/* SVG Interactive Map View - Right Side (7 Cols) */}
      <div className="lg:col-span-7 h-[520px] rounded-xl overflow-hidden relative border border-zinc-500/10 bg-sky-50 dark:bg-zinc-950 flex flex-col shadow-inner">
        
        {/* Real-time map background with paths */}
        <div className="absolute inset-0 select-none">
          <svg className="w-full h-full opacity-80" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="userGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Street Grid Mapping of São Paulo Center */}
            {/* Avenida Paulista */}
            <line x1="20" y1="280" x2="380" y2="100" stroke={darkMode ? "#27272a" : "#cbd5e1"} strokeWidth="14" strokeLinecap="round" />
            <line x1="20" y1="280" x2="380" y2="100" stroke={darkMode ? "#18181b" : "#e2e8f0"} strokeWidth="1" strokeDasharray="5,5" />
            <text x="310" y="115" transform="rotate(-25 310 115)" fill={darkMode ? "#71717a" : "#64748b"} className="text-[8px] font-mono font-bold">Av. Paulista</text>

            {/* Alameda Santos */}
            <line x1="20" y1="305" x2="380" y2="125" stroke={darkMode ? "#1f1f22" : "#e2e8f0"} strokeWidth="6" strokeLinecap="round" />

            {/* Rua Augusta */}
            <line x1="100" y1="50" x2="260" y2="350" stroke={darkMode ? "#27272a" : "#cbd5e1"} strokeWidth="10" strokeLinecap="round" />
            <text x="145" y="145" transform="rotate(62 145 145)" fill={darkMode ? "#71717a" : "#64748b"} className="text-[8px] font-mono font-bold">Rua Augusta</text>

            {/* Avenida Rebouças */}
            <line x1="50" y1="120" x2="190" y2="370" stroke={darkMode ? "#27272a" : "#cbd5e1"} strokeWidth="12" strokeLinecap="round" />
            <text x="80" y="220" transform="rotate(60 80 220)" fill={darkMode ? "#71717a" : "#64748b"} className="text-[8px] font-mono font-bold">Av. Rebouças</text>

            {/* Av. Brigadeiro Luis Antonio */}
            <line x1="260" y1="50" x2="360" y2="350" stroke={darkMode ? "#27272a" : "#cbd5e1"} strokeWidth="8" strokeLinecap="round" />

            {/* Av. Europa */}
            <line x1="20" y1="350" x2="180" y2="350" stroke={darkMode ? "#1f1f22" : "#cbd5e1"} strokeWidth="10" strokeLinecap="round" />
            <text x="60" y="342" fill={darkMode ? "#71717a" : "#64748b"} className="text-[8px] font-mono font-bold">Av. Europa</text>

            {/* Parque Trianon-Masp green park indicator */}
            <rect x="180" y="160" width="40" height="30" rx="4" fill="#059669" fillOpacity="0.25" stroke="#059669" strokeOpacity="0.4" strokeWidth="1" />
            <text x="184" y="177" fill="#059669" className="text-[6px] font-bold">Parque Trianon</text>

            {/* Route path line if selected & navigating */}
            {selectedStation && (
              <>
                {/* Draw route from User starting point to Station */}
                <path
                  d={`M ${getSvgCoords(userCoords.lat, userCoords.lng).x} ${getSvgCoords(userCoords.lat, userCoords.lng).y} 
                     L ${getSvgCoords(selectedStation.lat, selectedStation.lng).x} ${getSvgCoords(selectedStation.lat, selectedStation.lng).y}`}
                  stroke="#10B981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  strokeDasharray="4,4"
                  className={isNavigating ? "animate-[dash_2s_linear_infinite]" : ""}
                />
              </>
            )}

            {/* User GPS location circle */}
            <circle cx={getSvgCoords(userCoords.lat, userCoords.lng).x} cy={getSvgCoords(userCoords.lat, userCoords.lng).y} r="24" fill="url(#userGlow)" />
            <circle cx={getSvgCoords(userCoords.lat, userCoords.lng).x} cy={getSvgCoords(userCoords.lat, userCoords.lng).y} r="6" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
          </svg>
        </div>

        {/* Station Markers on the Map */}
        <div className="absolute inset-0 pointer-events-none">
          {filteredStations.map((station) => {
            const coords = getSvgCoords(station.lat, station.lng);
            const isSelected = selectedStation?.id === station.id;
            const brandInfo = brandColors[station.brand] || brandColors.Independent;

            return (
              <button
                id={`map-pin-${station.id}`}
                key={station.id}
                onClick={() => onSelectStation(station)}
                style={{ left: `${coords.x}px`, top: `${coords.y}px` }}
                className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-300"
              >
                <div className="relative">
                  <MapPin
                    className={`w-7 h-7 filter drop-shadow-md transition-transform duration-300 ${
                      isSelected ? "scale-125 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" : `${brandInfo.text} fill-white`
                    }`}
                  />
                  {/* Brand first letter as badge */}
                  <span className="absolute inset-0 top-1 text-[8px] font-extrabold text-center text-zinc-800 flex items-start justify-center">
                    {station.brand === "Independent" ? "B" : station.brand[0]}
                  </span>

                  {/* Pop up price preview on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-zinc-900 text-white text-[10px] py-1 px-2 rounded font-bold shadow-lg whitespace-nowrap z-50">
                    {station.name} <br />
                    <span className="text-emerald-400">R$ {station.prices[selectedFuelType].toFixed(2)}/L</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border border-zinc-500/10 p-3 rounded-xl shadow-lg pointer-events-auto transition-all z-10 flex flex-col gap-2">
          {selectedStation ? (
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-bold text-xs flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${brandColors[selectedStation.brand].bg}`}></span>
                    {selectedStation.name}
                  </h5>
                  <p className="text-[10px] text-zinc-500 line-clamp-1">{selectedStation.address}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-extrabold text-emerald-500">
                    R$ {selectedStation.prices[selectedFuelType].toFixed(2)} / Litro
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-zinc-500/10">
                <button
                  id="map-btn-navigate"
                  onClick={handleStartRoute}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  {isNavigating ? "Navegando..." : "Traçar Rota"}
                </button>
                <button
                  id="map-btn-fuel"
                  onClick={() => onFuelClick(selectedStation)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Fuel className="w-3.5 h-3.5" />
                  Abastecer Aqui
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-zinc-500 py-1">
              <Info className="w-4 h-4 text-emerald-500 shrink-0" />
              <p className="text-xs">
                Selecione um posto no mapa ou na lista ao lado para ver rotas, preços e iniciar o abastecimento digital com acúmulo de pontos de fidelidade.
              </p>
            </div>
          )}
        </div>

        {/* GPS Active indicator top-right */}
        <div className="absolute top-4 right-4 bg-zinc-900/80 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          Simulação GPS Ativa
        </div>

        {/* Interactive street status overlay when navigating */}
        {isNavigating && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-20 transition-all animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-2xl max-w-xs text-center text-white">
              <Navigation className="w-10 h-10 text-emerald-400 mx-auto mb-3 animate-bounce" />
              <h4 className="font-bold text-sm">Simulador de Navegação</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Traçando melhor trajeto via Rua Augusta... <br />
                <strong>Tempo estimado:</strong> 4 min (1.8 km)
              </p>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full animate-[progress_4.5s_ease-out_forwards]"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
