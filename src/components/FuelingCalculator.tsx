import { useState, useEffect } from "react";
import { GasStation, UserProfile } from "../types";
import { 
  Calculator, 
  Fuel, 
  QrCode, 
  Sparkles, 
  ShieldCheck, 
  Fingerprint, 
  KeyRound, 
  CheckCircle2, 
  ArrowRight,
  AlertCircle
} from "lucide-react";

interface FuelingCalculatorProps {
  station: GasStation;
  user: UserProfile;
  onPaymentSuccess: (record: any) => void;
  darkMode: boolean;
}

export default function FuelingCalculator({
  station,
  user,
  onPaymentSuccess,
  darkMode,
}: FuelingCalculatorProps) {
  const [fuelType, setFuelType] = useState<"gasoline" | "ethanol" | "diesel" | "premiumGas">("gasoline");
  const [liters, setLiters] = useState<string>("30");
  const [totalCost, setTotalCost] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrStep, setQrStep] = useState<"scan" | "auth" | "gateway" | "success">("scan");
  const [authCode, setAuthCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const currentPrice = station.prices[fuelType] || 5.00;

  // Sync total cost when liters change
  useEffect(() => {
    if (liters && !isNaN(Number(liters))) {
      const calculated = (Number(liters) * currentPrice).toFixed(2);
      setTotalCost(calculated);
    } else {
      setTotalCost("");
    }
  }, [liters, fuelType, station]);

  const handleLitersChange = (val: string) => {
    setLiters(val);
    if (val && !isNaN(Number(val))) {
      const calculated = (Number(val) * currentPrice).toFixed(2);
      setTotalCost(calculated);
    } else {
      setTotalCost("");
    }
  };

  const handleCostChange = (val: string) => {
    setTotalCost(val);
    if (val && !isNaN(Number(val))) {
      const calculatedLiters = (Number(val) / currentPrice).toFixed(2);
      setLiters(calculatedLiters);
    } else {
      setLiters("");
    }
  };

  const handleStartPayment = () => {
    if (!liters || isNaN(Number(liters)) || Number(liters) <= 0) {
      setErrorMessage("Por favor, insira um volume de combustível válido.");
      return;
    }
    setErrorMessage("");
    setShowQrModal(true);
    setQrStep("scan");
  };

  // Simulate scanning the QR code on the pump
  const handleScanPump = () => {
    setQrStep("auth");
  };

  // Simulate authentication (Biometrics or 2FA)
  const handleAuthenticate = () => {
    // If 2FA is enabled, check code
    if (user.isTwoFactorEnabled) {
      if (authCode.length < 4) {
        setErrorMessage("Código 2FA inválido.");
        return;
      }
    }
    setErrorMessage("");
    setQrStep("gateway");

    // Call API to process payment
    setTimeout(async () => {
      try {
        const response = await fetch("/api/fueling", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationId: station.id,
            fuelType,
            liters: Number(liters),
            paymentMethod: "QR Code",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setQrStep("success");
          setTimeout(() => {
            setShowQrModal(false);
            onPaymentSuccess(data.record);
          }, 2000);
        } else {
          setErrorMessage("Falha ao comunicar com o servidor de pagamento.");
          setQrStep("auth");
        }
      } catch (err) {
        setErrorMessage("Erro de gateway de pagamento.");
        setQrStep("auth");
      }
    }, 2000);
  };

  const fuelLabels = {
    gasoline: "Gasolina Comum",
    ethanol: "Etanol Hidratado",
    diesel: "S10 Diesel",
    premiumGas: "Gasolina Aditivada",
  };

  const pointsEarned = Math.floor(Number(totalCost) || 0);

  return (
    <div id="fueling-calculator-section" className={`rounded-2xl border ${
      darkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
    } p-5 shadow-lg relative`}>
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-500" />
            Simulador de Abastecimento
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Abastecendo no: <strong className="text-zinc-400">{station.name}</strong>
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">
            Preço do Litro
          </span>
          <span className="text-lg font-black text-emerald-500 block mt-1">
            R$ {currentPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Fuel Type Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {(["gasoline", "ethanol", "diesel", "premiumGas"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFuelType(type)}
            className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
              fuelType === type
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold"
                : darkMode 
                  ? "border-zinc-800 hover:border-zinc-700 bg-zinc-800/30 text-zinc-400" 
                  : "border-zinc-200 hover:border-zinc-300 bg-zinc-50 text-zinc-600"
            }`}
          >
            <Fuel className="w-4 h-4" />
            <span className="text-[10px] font-semibold leading-tight">{fuelLabels[type]}</span>
            <span className="text-xs font-extrabold mt-0.5">
              R$ {station.prices[type].toFixed(2)}
            </span>
          </button>
        ))}
      </div>

      {/* Calculator Dual Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold text-zinc-500 mb-1">Litros desejados (L)</label>
          <div className="relative">
            <input
              id="calc-liters-input"
              type="number"
              placeholder="Ex: 40"
              value={liters}
              onChange={(e) => handleLitersChange(e.target.value)}
              className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold ${
                darkMode 
                  ? "bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500" 
                  : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400"
              }`}
            />
            <span className="absolute right-3.5 top-2.5 text-xs text-zinc-400 font-bold">Litros</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 mb-1">Custo Total Atualizado (R$)</label>
          <div className="relative">
            <input
              id="calc-cost-input"
              type="number"
              placeholder="Ex: 200"
              value={totalCost}
              onChange={(e) => handleCostChange(e.target.value)}
              className={`w-full px-4 py-2.5 pr-12 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-extrabold text-emerald-500 ${
                darkMode 
                  ? "bg-zinc-800 border-zinc-700 placeholder-zinc-500" 
                  : "bg-zinc-50 border-zinc-200 placeholder-zinc-400"
              }`}
            />
            <span className="absolute right-3.5 top-2.5 text-xs text-zinc-400 font-bold">R$ Total</span>
          </div>
        </div>
      </div>

      {/* Reward point notification preview */}
      <div className={`p-3 rounded-xl mb-4 flex items-center justify-between ${
        darkMode ? "bg-zinc-800/40 border border-zinc-700/50" : "bg-emerald-50/50 border border-emerald-100"
      }`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <div>
            <p className="text-xs font-bold">Fidelidade PostoFiel</p>
            <p className="text-[10px] text-zinc-500">Ganhe 1 ponto por cada Real gasto abastecendo digitalmente.</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-black text-amber-500">+{pointsEarned} pontos</span>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 text-red-500 text-xs mb-4 font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        id="calc-pay-btn"
        onClick={handleStartPayment}
        className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10"
      >
        <QrCode className="w-5 h-5" />
        Pagar via QR Code no App (R$ {Number(totalCost || 0).toFixed(2)})
      </button>

      {/* QR Code simulated modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-sm rounded-2xl border ${
            darkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
          } p-6 shadow-2xl relative animate-scale-up`}>
            
            <button 
              id="qr-close-btn"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 font-bold text-sm"
            >
              Fechar
            </button>

            {qrStep === "scan" && (
              <div className="text-center py-4">
                <QrCode className="w-24 h-24 text-emerald-500 mx-auto mb-4 border border-zinc-500/10 p-2 rounded-xl bg-white" />
                <h4 className="font-bold text-base">Escaneie o QR Code da Bomba</h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                  Aproxime o app do código QR impresso na bomba do {station.name} para autenticar a liberação segura.
                </p>
                <button
                  id="qr-simulate-scan"
                  onClick={handleScanPump}
                  className="mt-5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 mx-auto transition-all"
                >
                  Simular Leitura do QR Code
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {qrStep === "auth" && (
              <div className="py-4">
                <div className="text-center mb-4">
                  <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                  <h4 className="font-bold text-base">Autenticação Requerida</h4>
                  <p className="text-xs text-zinc-500">
                    Confirme sua identidade para liberar a transação financeira segura.
                  </p>
                </div>

                {user.isBiometricsConfigured ? (
                  <div className="text-center py-4">
                    <button
                      id="qr-biometric-auth"
                      onClick={handleAuthenticate}
                      className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 hover:scale-105 active:scale-95 transition-all mb-3 border border-emerald-500/20"
                    >
                      <Fingerprint className="w-8 h-8 animate-pulse" />
                    </button>
                    <p className="text-xs font-bold text-emerald-500">Biometria Ativa: Toque para Confirmar</p>
                  </div>
                ) : user.isTwoFactorEnabled ? (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-zinc-500">Digite o código 2FA enviado</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                      <input
                        id="qr-2fa-input"
                        type="password"
                        placeholder="Ex: 123456"
                        maxLength={6}
                        value={authCode}
                        onChange={(e) => setAuthCode(e.target.value)}
                        className={`w-full pl-9 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold ${
                          darkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200"
                        }`}
                      />
                    </div>
                    {errorMessage && <p className="text-red-500 text-[10px] font-semibold">{errorMessage}</p>}
                    <button
                      id="qr-2fa-auth"
                      onClick={handleAuthenticate}
                      className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs"
                    >
                      Confirmar Código 2FA
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-xs text-zinc-400 mb-4">
                      Dica: Você pode ativar autenticação Biométrica ou 2FA no painel de Segurança para proteção bancária extra.
                    </p>
                    <button
                      id="qr-instant-auth"
                      onClick={handleAuthenticate}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs"
                    >
                      Confirmar Pagamento Seguro
                    </button>
                  </div>
                )}
              </div>
            )}

            {qrStep === "gateway" && (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto mb-4"></div>
                <h4 className="font-bold text-sm">Contatando Gateway de Pagamento...</h4>
                <p className="text-xs text-zinc-500 mt-1">Conexão segura SSL de R$ {Number(totalCost).toFixed(2)} via QR Code.</p>
              </div>
            )}

            {qrStep === "success" && (
              <div className="text-center py-6">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3 animate-bounce" />
                <h4 className="font-bold text-base text-emerald-500">Abastecimento Autorizado!</h4>
                <p className="text-xs text-zinc-500 mt-1">
                  Bomba liberada. Combustível sendo fornecido!
                </p>
                <div className={`mt-4 p-3 rounded-xl text-left border ${
                  darkMode ? "bg-zinc-800/50 border-zinc-700" : "bg-zinc-50 border-zinc-200"
                }`}>
                  <p className="text-[10px] text-zinc-400">PAGO COM SUCESSO</p>
                  <p className="text-xs font-bold mt-1">{fuelLabels[fuelType]} - {liters} L</p>
                  <p className="text-xs font-extrabold mt-0.5 text-emerald-500">R$ {Number(totalCost).toFixed(2)}</p>
                  <p className="text-[10px] text-amber-500 font-bold mt-2">+{pointsEarned} pontos acumulados</p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
