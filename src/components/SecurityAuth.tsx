import { useState } from "react";
import { UserProfile } from "../types";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Fingerprint, 
  KeyRound, 
  CheckCircle2, 
  Smartphone, 
  Lock, 
  QrCode, 
  RefreshCw,
  AlertCircle
} from "lucide-react";

interface SecurityAuthProps {
  user: UserProfile;
  onSecurityUpdate: (toggle2FA?: boolean, toggleBiometrics?: boolean) => void;
  darkMode: boolean;
}

export default function SecurityAuth({
  user,
  onSecurityUpdate,
  darkMode,
}: SecurityAuthProps) {
  const [showBiometricsModal, setShowBiometricsModal] = useState(false);
  const [isCalibratingBiometrics, setIsCalibratingBiometrics] = useState(false);
  const [biometricsSuccess, setBiometricsSuccess] = useState(false);

  const [show2faSetup, setShow2faSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [secretKey] = useState("FIEL-9284-SEC");
  const [validationError, setValidationError] = useState("");
  const [twoFactorSuccess, setTwoFactorSuccess] = useState(false);

  const handleToggleBiometrics = () => {
    if (user.isBiometricsConfigured) {
      // Disable instantly
      onSecurityUpdate(undefined, false);
    } else {
      // Trigger calibration flow
      setShowBiometricsModal(true);
      setIsCalibratingBiometrics(true);
      setBiometricsSuccess(false);
      
      setTimeout(() => {
        setIsCalibratingBiometrics(false);
        setBiometricsSuccess(true);
        setTimeout(() => {
          onSecurityUpdate(undefined, true);
          setShowBiometricsModal(false);
        }, 1500);
      }, 2500);
    }
  };

  const handleToggle2FA = () => {
    if (user.isTwoFactorEnabled) {
      onSecurityUpdate(false, undefined);
    } else {
      setShow2faSetup(true);
      setVerificationCode("");
      setValidationError("");
      setTwoFactorSuccess(false);
    }
  };

  const handleVerify2FACode = () => {
    if (verificationCode.length < 6) {
      setValidationError("O código de verificação deve conter 6 números.");
      return;
    }
    
    setValidationError("");
    setTwoFactorSuccess(true);
    
    setTimeout(() => {
      onSecurityUpdate(true, undefined);
      setShow2faSetup(false);
    }, 1500);
  };

  return (
    <div id="security-auth-section" className={`rounded-2xl border ${
      darkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
    } p-5 shadow-lg`}>
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-zinc-500/10">
        <div className={`p-3 rounded-xl ${
          user.isTwoFactorEnabled && user.isBiometricsConfigured
            ? "bg-emerald-500/10 text-emerald-500"
            : "bg-amber-500/10 text-amber-500 animate-pulse"
        }`}>
          {user.isTwoFactorEnabled && user.isBiometricsConfigured ? (
            <ShieldCheck className="w-6 h-6" />
          ) : (
            <ShieldAlert className="w-6 h-6" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold tracking-tight flex items-center gap-1.5">
            Segurança & Autenticação Avançada
          </h3>
          <p className="text-xs text-zinc-500">Ative camadas adicionais de criptografia e proteção para transações QR Code.</p>
        </div>
      </div>

      {/* Security Health status box */}
      <div className={`p-4 rounded-xl mb-6 flex items-center justify-between border ${
        user.isTwoFactorEnabled && user.isBiometricsConfigured
          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500"
          : "bg-amber-500/5 border-amber-500/20 text-amber-500"
      }`}>
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 shrink-0" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Status da Conta: {user.isTwoFactorEnabled && user.isBiometricsConfigured ? "Totalmente Protegido" : "Proteção Moderada"}
            </h4>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              {user.isTwoFactorEnabled && user.isBiometricsConfigured
                ? "Sua conta utiliza autenticação de dois fatores e biometria para autorizar pagamentos."
                : "Ative a autenticação de dois fatores (2FA) e a biometria para aumentar a segurança."
              }
            </p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest ${
          user.isTwoFactorEnabled && user.isBiometricsConfigured ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
        }`}>
          {user.isTwoFactorEnabled && user.isBiometricsConfigured ? "Nível Alto" : "Nível Médio"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        
        {/* Biometrics Config Toggle (Card 1) */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          darkMode ? "bg-zinc-800/25 border-zinc-800" : "bg-zinc-50 border-zinc-200"
        }`}>
          <div>
            <div className="flex justify-between items-start mb-2">
              <Fingerprint className="w-7 h-7 text-emerald-500" />
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                user.isBiometricsConfigured ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-500/10 text-zinc-400"
              }`}>
                {user.isBiometricsConfigured ? "Ativo" : "Inativo"}
              </span>
            </div>
            <h4 className="font-bold text-sm">Login Biométrico Rápido</h4>
            <p className="text-xs text-zinc-500 mt-1 leading-snug">
              Utilize o leitor de impressão digital ou reconhecimento facial nativo do dispositivo para entrar no app e autorizar compras.
            </p>
          </div>
          <button
            id="toggle-biometrics-btn"
            onClick={handleToggleBiometrics}
            className={`w-full py-2 rounded-xl text-xs font-bold mt-4 transition-all border ${
              user.isBiometricsConfigured
                ? "border-red-500/30 text-red-500 hover:bg-red-500/10 bg-red-500/5"
                : "bg-emerald-500 hover:bg-emerald-600 text-white shadow"
            }`}
          >
            {user.isBiometricsConfigured ? "Desativar Biometria" : "Configurar Biometria agora"}
          </button>
        </div>

        {/* 2FA Config Toggle (Card 2) */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          darkMode ? "bg-zinc-800/25 border-zinc-800" : "bg-zinc-50 border-zinc-200"
        }`}>
          <div>
            <div className="flex justify-between items-start mb-2">
              <KeyRound className="w-7 h-7 text-emerald-500" />
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                user.isTwoFactorEnabled ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-500/10 text-zinc-400"
              }`}>
                {user.isTwoFactorEnabled ? "Ativo" : "Inativo"}
              </span>
            </div>
            <h4 className="font-bold text-sm">Autenticação de Dois Fatores (2FA)</h4>
            <p className="text-xs text-zinc-500 mt-1 leading-snug">
              Gera chaves criptográficas de segurança extras a cada 30 segundos no celular para proteção de saques de cupons e pagamentos.
            </p>
          </div>
          <button
            id="toggle-2fa-btn"
            onClick={handleToggle2FA}
            className={`w-full py-2 rounded-xl text-xs font-bold mt-4 transition-all border ${
              user.isTwoFactorEnabled
                ? "border-red-500/30 text-red-500 hover:bg-red-500/10 bg-red-500/5"
                : "bg-emerald-500 hover:bg-emerald-600 text-white shadow"
            }`}
          >
            {user.isTwoFactorEnabled ? "Desativar Autenticação 2FA" : "Configurar Código 2FA"}
          </button>
        </div>

      </div>

      {/* Simulated Device Audit Log */}
      <div>
        <h4 className="font-bold text-xs text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Smartphone className="w-3.5 h-3.5" />
          Dispositivos & Auditoria Recente
        </h4>
        <div className={`p-3 rounded-xl border space-y-2 text-xs divide-y divide-zinc-500/5 ${
          darkMode ? "bg-zinc-800/10 border-zinc-800" : "bg-zinc-50 border-zinc-200"
        }`}>
          <div className="flex justify-between items-center py-1.5 first:pt-0">
            <div>
              <p className="font-bold">iPhone 15 Pro Max (Dispositivo Atual)</p>
              <p className="text-[10px] text-zinc-500">São Paulo, Brasil • Há 2 minutos</p>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-500">Sessão Ativa</span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <div>
              <p className="font-bold">Acesso Autorizado via QR Code</p>
              <p className="text-[10px] text-zinc-500">Posto Petrobras Av. Paulista • Há 1 dia</p>
            </div>
            <span className="text-[10px] font-bold text-zinc-400">Verificado</span>
          </div>
        </div>
      </div>

      {/* Biometrics Calibration Modal */}
      {showBiometricsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-sm rounded-2xl border ${
            darkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
          } p-6 shadow-2xl text-center relative animate-scale-up`}>
            
            <Fingerprint className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-pulse" />
            <h4 className="font-bold text-base">Leitor Biométrico Ativo</h4>
            
            {isCalibratingBiometrics ? (
              <div className="py-4">
                <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto mb-3"></div>
                <p className="text-xs text-zinc-400">Calibrando impressão digital segura do dispositivo...</p>
              </div>
            ) : biometricsSuccess ? (
              <div className="py-4 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-emerald-500">Biometria Cadastrada com Sucesso!</p>
              </div>
            ) : null}

          </div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {show2faSetup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-sm rounded-2xl border ${
            darkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
          } p-6 shadow-2xl relative animate-scale-up`}>
            
            <button 
              id="close-2fa-btn"
              onClick={() => setShow2faSetup(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 font-bold text-sm"
            >
              Cancelar
            </button>

            <h4 className="font-bold text-base flex items-center gap-1.5 mb-2">
              <KeyRound className="w-5 h-5 text-emerald-500 animate-bounce" />
              Configurar Autenticador 2FA
            </h4>
            <p className="text-xs text-zinc-500 mb-4">
              Escaneie o QR Code abaixo no Google Authenticator ou Microsoft Authenticator para obter códigos dinâmicos.
            </p>

            <div className="flex flex-col items-center bg-white p-3 rounded-xl border border-zinc-200 w-fit mx-auto mb-4">
              <QrCode className="w-28 h-28 text-zinc-900" />
              <span className="text-[10px] font-mono font-bold text-zinc-500 mt-1">{secretKey}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Digite o código gerado no app para validar</label>
                <input
                  id="setup-2fa-code"
                  type="text"
                  placeholder="Ex: 349284"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  className={`w-full px-3 py-2 rounded-lg border text-sm text-center font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    darkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                  }`}
                />
              </div>

              {validationError && (
                <p className="text-red-500 text-[10px] font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {validationError}
                </p>
              )}

              {twoFactorSuccess && (
                <p className="text-emerald-500 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Autenticação Ativada com Sucesso!
                </p>
              )}

              <button
                id="validate-2fa-btn"
                onClick={handleVerify2FACode}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs"
              >
                Validar e Ativar 2FA
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
