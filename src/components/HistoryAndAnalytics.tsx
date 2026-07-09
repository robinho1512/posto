import { useState, useMemo } from "react";
import { FuelingRecord, UserProfile } from "../types";
import { 
  History, 
  TrendingUp, 
  Sparkles, 
  Calendar, 
  Coins, 
  Flame, 
  BarChart3, 
  ChevronRight, 
  Download, 
  ArrowUpRight,
  TrendingDown,
  Mail,
  Info,
  CheckCircle2
} from "lucide-react";

interface HistoryAndAnalyticsProps {
  history: FuelingRecord[];
  user: UserProfile;
  darkMode: boolean;
}

export default function HistoryAndAnalytics({
  history,
  user,
  darkMode,
}: HistoryAndAnalyticsProps) {
  const [selectedMonth, setSelectedMonth] = useState<"Todos" | "Julho" | "Junho">("Todos");
  const [activeMetric, setActiveMetric] = useState<"spent" | "liters">("spent");
  const [showReportEmail, setShowReportEmail] = useState(false);
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState("");

  const filteredHistory = useMemo(() => {
    return history.filter(h => {
      if (selectedMonth === "Todos") return true;
      if (selectedMonth === "Julho") return h.date.includes("-07-") || h.date.includes("Jul");
      if (selectedMonth === "Junho") return h.date.includes("-06-") || h.date.includes("Jun");
      return true;
    });
  }, [history, selectedMonth]);

  // Statistics calculation
  const stats = useMemo(() => {
    let totalSpent = 0;
    let totalLiters = 0;
    let totalPoints = 0;

    filteredHistory.forEach(h => {
      totalSpent += h.totalCost;
      totalLiters += h.liters;
      totalPoints += h.pointsEarned;
    });

    // Simulated savings of R$ 0.42 per liter compared to regional maximum prices
    const savings = parseFloat((totalLiters * 0.42).toFixed(2));

    return {
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      totalLiters: parseFloat(totalLiters.toFixed(1)),
      totalPoints,
      savings,
    };
  }, [filteredHistory]);

  // Simulated monthly chart data for custom SVG rendering
  // representing May, June, July
  const chartData = [
    { month: "Maio", spent: 180, liters: 32 },
    { month: "Junho", spent: 339.38, liters: 77.5 },
    { month: "Julho", spent: stats.totalSpent, liters: stats.totalLiters }
  ];

  const triggerMonthlyEmailReport = () => {
    setIsSendingReport(true);
    setTimeout(() => {
      setIsSendingReport(false);
      setReportSuccess(`Relatório Mensal enviado com sucesso para ${user.email}!`);
      setTimeout(() => setReportSuccess(""), 4000);
    }, 1800);
  };

  const getFuelBadge = (type: string) => {
    const labels: Record<string, string> = {
      gasoline: "Gasolina",
      ethanol: "Etanol",
      diesel: "Diesel",
      premiumGas: "Aditivada"
    };

    const colors: Record<string, string> = {
      gasoline: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      ethanol: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      diesel: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      premiumGas: "bg-purple-500/10 text-purple-500 border-purple-500/20"
    };

    return (
      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${colors[type] || "bg-zinc-500/10"}`}>
        {labels[type] || type}
      </span>
    );
  };

  // SVG Chart sizing & calculation
  const maxVal = useMemo(() => {
    const vals = chartData.map(d => activeMetric === "spent" ? d.spent : d.liters);
    return Math.max(...vals, 10) * 1.15; // padding factor
  }, [chartData, activeMetric]);

  return (
    <div id="history-and-analytics-section" className={`rounded-2xl border ${
      darkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
    } p-5 shadow-lg`}>
      
      {/* Header and Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 pb-5 border-b border-zinc-500/10">
        <div>
          <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-500" />
            Consumo & Histórico de Gastos
          </h3>
          <p className="text-xs text-zinc-500">Veja o histórico detalhado e gráficos dinâmicos de sua economia.</p>
        </div>

        <div className="flex items-center gap-1.5 self-stretch md:self-auto">
          {(["Todos", "Julho", "Junho"] as const).map(m => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedMonth === m
                  ? "bg-emerald-500 text-white shadow-sm"
                  : darkMode ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-xl border ${darkMode ? "bg-zinc-800/25 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
          <div className="flex justify-between items-center text-zinc-500 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Gasto</span>
            <Coins className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-lg font-black tracking-tight">R$ {stats.totalSpent.toFixed(2)}</span>
          <p className="text-[10px] text-zinc-500 mt-0.5">Em combustível cadastrado</p>
        </div>

        <div className={`p-4 rounded-xl border ${darkMode ? "bg-zinc-800/25 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
          <div className="flex justify-between items-center text-zinc-500 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Litros Abastecidos</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <span className="text-lg font-black tracking-tight">{stats.totalLiters} <span className="text-xs font-semibold">L</span></span>
          <p className="text-[10px] text-zinc-500 mt-0.5">Média: R$ {(stats.totalSpent / (stats.totalLiters || 1)).toFixed(2)}/L</p>
        </div>

        <div className={`p-4 rounded-xl border ${darkMode ? "bg-zinc-800/25 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
          <div className="flex justify-between items-center text-zinc-500 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Economia Mensal</span>
            <TrendingDown className="w-4 h-4 text-emerald-500 animate-pulse" />
          </div>
          <span className="text-lg font-black tracking-tight text-emerald-500">R$ {stats.savings.toFixed(2)}</span>
          <p className="text-[10px] text-zinc-500 mt-0.5">Frente à média de mercado</p>
        </div>

        <div className={`p-4 rounded-xl border ${darkMode ? "bg-zinc-800/25 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
          <div className="flex justify-between items-center text-zinc-500 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Metas de Economia</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-lg font-black tracking-tight">
            {Math.min(100, Math.floor((stats.savings / user.monthlySavingsGoal) * 100))}%
          </span>
          <p className="text-[10px] text-zinc-500 mt-0.5">Meta: R$ {user.monthlySavingsGoal.toFixed(2)}</p>
        </div>
      </div>

      {/* Interactive Custom SVG Chart */}
      <div className={`p-5 rounded-2xl border mb-6 ${darkMode ? "bg-zinc-800/15 border-zinc-800" : "bg-zinc-50/50 border-zinc-200"}`}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="font-bold text-xs flex items-center gap-1">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              Economia e Desempenho Mensal
            </h4>
            <p className="text-[10px] text-zinc-500">Selecione uma métrica para atualizar as colunas.</p>
          </div>
          <div className="flex gap-1 border border-zinc-500/10 p-0.5 rounded-lg text-[10px]">
            <button
              onClick={() => setActiveMetric("spent")}
              className={`px-2.5 py-1 rounded font-semibold ${activeMetric === "spent" ? "bg-emerald-500 text-white shadow-sm" : "text-zinc-500"}`}
            >
              Gasto (R$)
            </button>
            <button
              onClick={() => setActiveMetric("liters")}
              className={`px-2.5 py-1 rounded font-semibold ${activeMetric === "liters" ? "bg-emerald-500 text-white shadow-sm" : "text-zinc-500"}`}
            >
              Litragem (L)
            </button>
          </div>
        </div>

        {/* Custom SVG Responsive Bar Chart Container */}
        <div className="h-44 w-full relative">
          <svg className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
            {/* Grid Lines */}
            <line x1="40" y1="20" x2="100%" y2="20" stroke={darkMode ? "#27272a" : "#f1f5f9"} strokeWidth="1" />
            <line x1="40" y1="65" x2="100%" y2="65" stroke={darkMode ? "#27272a" : "#f1f5f9"} strokeWidth="1" />
            <line x1="40" y1="110" x2="100%" y2="110" stroke={darkMode ? "#27272a" : "#f1f5f9"} strokeWidth="1" />
            <line x1="40" y1="140" x2="100%" y2="140" stroke={darkMode ? "#52525b" : "#cbd5e1"} strokeWidth="1.5" />

            {/* Y Axis labels */}
            <text x="30" y="24" textAnchor="end" fill="#71717a" className="text-[9px] font-bold font-mono">
              {activeMetric === "spent" ? `R$ ${Math.round(maxVal * 0.85)}` : `${Math.round(maxVal * 0.85)}L`}
            </text>
            <text x="30" y="69" textAnchor="end" fill="#71717a" className="text-[9px] font-bold font-mono">
              {activeMetric === "spent" ? `R$ ${Math.round(maxVal * 0.5)}` : `${Math.round(maxVal * 0.5)}L`}
            </text>
            <text x="30" y="114" textAnchor="end" fill="#71717a" className="text-[9px] font-bold font-mono">
              {activeMetric === "spent" ? `R$ ${Math.round(maxVal * 0.15)}` : `${Math.round(maxVal * 0.15)}L`}
            </text>
            <text x="30" y="144" textAnchor="end" fill="#71717a" className="text-[9px] font-bold font-mono">0</text>

            {/* Drawing Bars */}
            {chartData.map((data, idx) => {
              const val = activeMetric === "spent" ? data.spent : data.liters;
              const height = (val / maxVal) * 120;
              const barWidth = 35;
              const totalBars = chartData.length;
              // Calculate responsive positions
              const xPos = 65 + idx * 110;

              return (
                <g key={data.month} className="group cursor-pointer">
                  {/* Background interactive highlight zone */}
                  <rect
                    x={xPos - 20}
                    y="5"
                    width={barWidth + 40}
                    height="145"
                    fill="transparent"
                    className="hover:fill-emerald-500/5 transition-colors"
                  />

                  {/* Main Bar with gradients */}
                  <rect
                    x={xPos}
                    y={140 - height}
                    width={barWidth}
                    height={height}
                    rx="4"
                    fill="#10B981"
                    className="transition-all duration-500 hover:fill-emerald-400"
                  />

                  {/* Top glowing cap on bar */}
                  <rect
                    x={xPos}
                    y={140 - height}
                    width={barWidth}
                    height="4"
                    rx="1"
                    fill="#34D399"
                  />

                  {/* Floating tooltip on hover */}
                  <text
                    x={xPos + barWidth / 2}
                    y={140 - height - 8}
                    textAnchor="middle"
                    fill={darkMode ? "#FFFFFF" : "#0F172A"}
                    className="text-[10px] font-black hidden group-hover:block transition-all bg-zinc-900 px-1 py-0.5 rounded shadow"
                  >
                    {activeMetric === "spent" ? `R$ ${val.toFixed(1)}` : `${val.toFixed(1)} Litros`}
                  </text>

                  {/* Label under bar */}
                  <text
                    x={xPos + barWidth / 2}
                    y="156"
                    textAnchor="middle"
                    fill="#71717a"
                    className="text-[10px] font-bold"
                  >
                    {data.month}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Action Buttons: Request automatic report */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h5 className="font-bold text-xs flex items-center gap-1">
            <Mail className="w-4 h-4 text-emerald-500 animate-pulse" />
            Relatórios Automáticos Mensais
          </h5>
          <p className="text-[10px] text-zinc-500">
            Nossos servidores enviam relatórios e extratos de fidelidade todo dia 1 no seu e-mail: <strong>{user.email}</strong>
          </p>
        </div>
        <button
          id="btn-trigger-report"
          onClick={() => setShowReportEmail(true)}
          className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 self-stretch sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          Gerar Relatório Agora
        </button>
      </div>

      {/* Fueling History Log list */}
      <div>
        <h4 className="font-bold text-xs flex items-center gap-1.5 mb-3">
          <Calendar className="w-4 h-4 text-emerald-500" />
          Histórico Detalhado de Abastecimentos ({filteredHistory.length})
        </h4>

        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredHistory.map((rec) => (
            <div
              key={rec.id}
              className={`p-3 rounded-xl border flex justify-between items-center gap-4 transition-all ${
                darkMode ? "bg-zinc-800/20 border-zinc-800/80" : "bg-zinc-50/50 border-zinc-100"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  darkMode ? "bg-zinc-800" : "bg-white"
                } border border-zinc-500/10`}>
                  <ArrowUpRight className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-bold text-xs truncate">{rec.stationName}</h5>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[9px] text-zinc-500 font-semibold font-mono">
                      {new Date(rec.date).toLocaleDateString("pt-BR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {getFuelBadge(rec.fuelType)}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-black block text-zinc-800 dark:text-zinc-100">
                  R$ {rec.totalCost.toFixed(2)}
                </span>
                <span className="text-[10px] font-semibold text-zinc-400 block">
                  {rec.liters}L x R$ {rec.pricePerLiter.toFixed(2)}
                </span>
                <span className="text-[9px] font-bold text-amber-500 mt-0.5 block">
                  +{rec.pointsEarned} pontos
                </span>
              </div>
            </div>
          ))}

          {filteredHistory.length === 0 && (
            <div className="text-center py-6 text-zinc-500 text-xs">
              Nenhum abastecimento cadastrado para este período.
            </div>
          )}
        </div>
      </div>

      {/* Dynamic email simulated modal preview */}
      {showReportEmail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-lg rounded-2xl border ${
            darkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
          } p-6 shadow-2xl relative animate-scale-up`}>
            
            <button 
              id="report-close-btn"
              onClick={() => setShowReportEmail(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 font-bold text-sm"
            >
              Fechar
            </button>

            <h4 className="font-bold text-base flex items-center gap-1.5 mb-2">
              <Mail className="w-5 h-5 text-emerald-500 animate-bounce" />
              Enviar Relatório Mensal por E-mail
            </h4>
            <p className="text-xs text-zinc-500">
              O sistema consolidará os gastos do mês corrente e enviará um relatório em formato HTML diagramado profissionalmente para o e-mail cadastrado.
            </p>

            {/* Email mock container */}
            <div className={`my-4 p-4 rounded-xl border max-h-[250px] overflow-y-auto text-left text-xs ${
              darkMode ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
            }`}>
              <div className="border-b border-zinc-500/10 pb-2 mb-3">
                <p><strong>De:</strong> automatico@postofiel.com.br</p>
                <p><strong>Para:</strong> {user.email}</p>
                <p><strong>Assunto:</strong> Relatório Consolidado de Despesas de Combustível - {selectedMonth === "Todos" ? "Julho" : selectedMonth} 2026</p>
              </div>

              <div className="space-y-3 font-sans">
                <h3 className="text-sm font-bold text-emerald-500">Demonstrativo de Economia PostoFiel</h3>
                <p>Olá, <strong>{user.name}</strong>!</p>
                <p>Aqui está seu resumo completo:</p>
                <ul className="space-y-1 list-disc pl-4">
                  <li><strong>Total Gasto:</strong> R$ {stats.totalSpent.toFixed(2)}</li>
                  <li><strong>Litros Consumidos:</strong> {stats.totalLiters} L</li>
                  <li><strong>Preço Médio Estimado:</strong> R$ {(stats.totalSpent / (stats.totalLiters || 1)).toFixed(2)} / Litro</li>
                  <li><strong>Sua Economia este mês:</strong> R$ {stats.savings.toFixed(2)}</li>
                  <li><strong>Seu Saldo de Pontos:</strong> {user.points} pts (Nível {user.tier})</li>
                </ul>
                <p className="text-[10px] text-zinc-500 mt-4">PostoFiel Applet Cloud Run Core Container.</p>
              </div>
            </div>

            {reportSuccess && (
              <p className="text-xs font-bold text-emerald-500 mb-3 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {reportSuccess}
              </p>
            )}

            <button
              id="report-send-action-btn"
              onClick={triggerMonthlyEmailReport}
              disabled={isSendingReport}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              {isSendingReport ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  Enviando relatório...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Enviar Relatório de Despesas p/ meu E-mail
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
