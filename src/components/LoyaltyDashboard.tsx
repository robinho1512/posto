import { useState } from "react";
import { UserProfile, LoyaltyReward } from "../types";
import { 
  Award, 
  Sparkles, 
  CheckCircle, 
  Coffee, 
  Flame, 
  Droplet, 
  Percent, 
  Share2, 
  Instagram, 
  Facebook, 
  Send,
  User,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

interface LoyaltyDashboardProps {
  user: UserProfile;
  onRedeemReward: (pointsCost: number, rewardTitle: string) => void;
  onShareReward: (extraPoints: number) => void;
  darkMode: boolean;
}

export default function LoyaltyDashboard({
  user,
  onRedeemReward,
  onShareReward,
  darkMode,
}: LoyaltyDashboardProps) {
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"rewards" | "perks">("rewards");
  const [showVoucher, setShowVoucher] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState("");

  const rewards: LoyaltyReward[] = [
    { id: "r1", title: "Café Expresso Grátis", pointsCost: 100, description: "Resgate um café expresso aromático em qualquer conveniência credenciada.", category: "Conveniência" },
    { id: "r2", title: "R$ 15 Desconto Combustível", pointsCost: 300, description: "Desconto direto de R$ 15,00 no seu próximo abastecimento via QR Code.", category: "Desconto" },
    { id: "r3", title: "Lava Jato Completo", pointsCost: 400, description: "Lavagem completa externa com cera protetora de alta qualidade.", category: "Serviço" },
    { id: "r4", title: "Troca de Óleo Grátis", pointsCost: 1200, description: "Troca completa do óleo lubrificante do motor com filtro incluso.", category: "Serviço" },
  ];

  const handleRedeem = (reward: LoyaltyReward) => {
    if (user.points < reward.pointsCost) {
      setSuccessMsg(`Saldo insuficiente. Você precisa de mais ${reward.pointsCost - user.points} pontos para resgatar.`);
      setTimeout(() => setSuccessMsg(""), 3500);
      return;
    }

    onRedeemReward(reward.pointsCost, reward.title);
    setShowVoucher(reward.title);
    setSuccessMsg(`Sucesso! Cupom resgatado.`);
  };

  const handleSocialShare = (platform: string) => {
    onShareReward(15); // Reward user with +15 points for sharing
    setShareFeedback(`Compartilhado com sucesso no ${platform}! Você ganhou +15 pontos de bônus.`);
    setTimeout(() => setShareFeedback(""), 4500);
  };

  // Tier calculation helpers
  const maxPointsForTier = user.tier === "Bronze" ? 600 : user.tier === "Prata" ? 1500 : 3000;
  const currentTierProgress = Math.min(100, Math.floor((user.points / maxPointsForTier) * 100));

  const tierColors = {
    Bronze: { text: "text-amber-700", bg: "bg-amber-100", border: "border-amber-300", badge: "🥉 Bronze" },
    Prata: { text: "text-zinc-600", bg: "bg-zinc-100", border: "border-zinc-300", badge: "🥈 Prata" },
    Ouro: { text: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500", badge: "👑 Ouro" },
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Conveniência": return <Coffee className="w-5 h-5 text-amber-500" />;
      case "Serviço": return <Droplet className="w-5 h-5 text-blue-500" />;
      case "Desconto": return <Percent className="w-5 h-5 text-emerald-500" />;
      default: return <Award className="w-5 h-5 text-zinc-500" />;
    }
  };

  return (
    <div id="loyalty-dashboard-section" className={`rounded-2xl border ${
      darkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
    } p-5 shadow-lg`}>
      
      {/* Loyalty Club Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 pb-5 border-b border-zinc-500/10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Award className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight">Clube Fidelidade PostoFiel</h3>
            <p className="text-xs text-zinc-500">Acumule pontos em cada abastecimento e troque por prêmios e combustíveis gratuitos.</p>
          </div>
        </div>
        
        {/* User Card summary */}
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${tierColors[user.tier].bg} ${tierColors[user.tier].border}`}>
          <div className="p-1.5 bg-white dark:bg-zinc-800 rounded-full text-zinc-600">
            <User className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Seu Nível</p>
            <p className={`text-sm font-extrabold ${tierColors[user.tier].text}`}>{tierColors[user.tier].badge}</p>
          </div>
        </div>
      </div>

      {/* Points & Progress Visual */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        {/* Points Display (5 cols) */}
        <div className={`md:col-span-5 p-5 rounded-2xl border flex flex-col justify-center items-center text-center ${
          darkMode ? "bg-zinc-800/40 border-zinc-800" : "bg-zinc-50 border-zinc-200"
        }`}>
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Pontos Acumulados</span>
          <span className="text-4xl font-black text-amber-500 mt-1 mb-2 tracking-tight">{user.points} <span className="text-xs font-semibold text-zinc-400">pts</span></span>
          <p className="text-xs text-zinc-500 px-3">Sua pontuação aumenta automaticamente a cada transação de QR Code finalizada.</p>
        </div>

        {/* Level Progress (7 cols) */}
        <div className={`md:col-span-7 p-5 rounded-2xl border flex flex-col justify-between ${
          darkMode ? "bg-zinc-800/40 border-zinc-800" : "bg-zinc-50 border-zinc-200"
        }`}>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold">Progresso do Nível</span>
              <span className="text-xs font-bold text-zinc-400">{user.points} / {maxPointsForTier} pts</span>
            </div>
            
            <div className="w-full bg-zinc-300 dark:bg-zinc-700 h-2 rounded-full overflow-hidden mb-2">
              <div 
                style={{ width: `${currentTierProgress}%` }} 
                className="bg-amber-500 h-full rounded-full transition-all duration-1000"
              ></div>
            </div>

            <p className="text-[11px] text-zinc-500 leading-snug">
              {user.tier !== "Ouro" 
                ? `Faltam apenas ${maxPointsForTier - user.points} pontos para você subir de nível e desbloquear descontos especiais!`
                : "Parabéns! Você alcançou o nível máximo do clube de fidelidade PostoFiel com direito a benefícios exclusivos."
              }
            </p>
          </div>

          <div className="flex gap-2 mt-4 pt-2 border-t border-zinc-500/5">
            <span className="text-[9px] uppercase font-bold bg-amber-500/10 text-amber-500 px-2 py-1 rounded">Desconto Aditivo</span>
            <span className="text-[9px] uppercase font-bold bg-amber-500/10 text-amber-500 px-2 py-1 rounded">Atendimento Prioritário</span>
            <span className="text-[9px] uppercase font-bold bg-amber-500/10 text-amber-500 px-2 py-1 rounded">Aniversário Especial</span>
          </div>
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-bold text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Catálogo de Resgate
          </h4>
          <div className="flex rounded-lg p-0.5 border border-zinc-500/10 text-[10px]">
            <button 
              onClick={() => setActiveTab("rewards")}
              className={`px-3 py-1 rounded font-bold transition-all ${activeTab === "rewards" ? "bg-amber-500 text-white shadow-sm" : "text-zinc-500"}`}
            >
              Vouchers Premiados
            </button>
            <button 
              onClick={() => setActiveTab("perks")}
              className={`px-3 py-1 rounded font-bold transition-all ${activeTab === "perks" ? "bg-amber-500 text-white shadow-sm" : "text-zinc-500"}`}
            >
              Benefícios do Nível
            </button>
          </div>
        </div>

        {activeTab === "rewards" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rewards.map((reward) => {
              const canAfford = user.points >= reward.pointsCost;
              return (
                <div 
                  key={reward.id} 
                  className={`p-3.5 rounded-xl border flex gap-3.5 justify-between items-start transition-all ${
                    canAfford 
                      ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60" 
                      : "border-zinc-500/10 opacity-70"
                  }`}
                >
                  <div className="p-2.5 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-500/5 shrink-0">
                    {getCategoryIcon(reward.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs truncate">{reward.title}</h5>
                    <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2 leading-tight">{reward.description}</p>
                    <span className="text-[10px] font-black text-amber-500 block mt-2">{reward.pointsCost} pontos</span>
                  </div>
                  <button
                    id={`redeem-btn-${reward.id}`}
                    onClick={() => handleRedeem(reward)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold tracking-tight shrink-0 transition-all ${
                      canAfford 
                        ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm" 
                        : "bg-zinc-500/10 text-zinc-400 cursor-not-allowed"
                    }`}
                  >
                    Resgatar
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`p-4 rounded-xl border text-center ${darkMode ? "bg-zinc-800/20" : "bg-zinc-50"}`}>
            <p className="text-xs font-semibold">Benefícios Ativos da Categoria {user.tier}</p>
            <ul className="text-xs text-zinc-500 text-left space-y-2 max-w-sm mx-auto mt-3">
              <li className="flex items-center gap-1.5">✔️ Cashback de 1.5% acumulado</li>
              <li className="flex items-center gap-1.5">✔️ Suporte prioritário com atendimento FielBot</li>
              <li className="flex items-center gap-1.5">✔️ Desconto de R$ 0,05 por litro na Gasolina Premium</li>
              {user.tier === "Ouro" && (
                <li className="flex items-center gap-1.5 text-amber-500 font-bold">✔️ Convite exclusivo para jantares de clientes fidelidade</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Social Sharing - Referrals and Conquistas */}
      <div className={`p-4 rounded-xl border ${
        darkMode ? "bg-zinc-800/35 border-zinc-800" : "bg-emerald-50/20 border-emerald-100"
      }`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h5 className="font-bold text-xs flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-emerald-500" />
              Compartilhe Suas Conquistas!
            </h5>
            <p className="text-[10px] text-zinc-500 mt-1">Divulgue ofertas e cupons exclusivos nas redes sociais e ganhe +15 pontos adicionais no seu perfil.</p>
          </div>
          
          <div className="flex gap-1.5 shrink-0">
            <button
              id="share-wa-btn"
              onClick={() => handleSocialShare("WhatsApp")}
              className="p-1.5 rounded-lg bg-emerald-500 text-white hover:scale-105 active:scale-95 transition-all text-xs flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              WhatsApp
            </button>
            <button
              id="share-ig-btn"
              onClick={() => handleSocialShare("Instagram")}
              className="p-1.5 rounded-lg bg-pink-500 text-white hover:scale-105 active:scale-95 transition-all text-xs flex items-center gap-1"
            >
              <Instagram className="w-3.5 h-3.5" />
              Instagram
            </button>
            <button
              id="share-fb-btn"
              onClick={() => handleSocialShare("Facebook")}
              className="p-1.5 rounded-lg bg-blue-600 text-white hover:scale-105 active:scale-95 transition-all text-xs flex items-center gap-1"
            >
              <Facebook className="w-3.5 h-3.5" />
              Facebook
            </button>
          </div>
        </div>

        {shareFeedback && (
          <p className="text-[10px] font-bold text-emerald-500 mt-3 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {shareFeedback}
          </p>
        )}
      </div>

      {/* Dynamic Cupom Voucher Overlay Modal */}
      {showVoucher && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-sm rounded-2xl border ${
            darkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
          } p-6 shadow-2xl text-center relative animate-scale-up`}>
            
            <CheckCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h4 className="font-bold text-lg">Seu Cupom Está Pronto!</h4>
            <p className="text-xs text-zinc-500 mt-1">Apresente este código no caixa para resgatar seu prêmio.</p>

            <div className="my-5 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-dashed border-amber-500/50 flex flex-col items-center">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">CUPOM DE FIDELIDADE</span>
              <span className="text-base font-black text-amber-500 mt-1">{showVoucher}</span>
              
              {/* Fake Barcode SVG */}
              <div className="mt-4 flex gap-0.5 h-8 w-44 items-center justify-center bg-white p-1 rounded">
                <span className="bg-black w-2 h-full"></span>
                <span className="bg-black w-1 h-full"></span>
                <span className="bg-black w-3 h-full"></span>
                <span className="bg-black w-0.5 h-full"></span>
                <span className="bg-black w-1.5 h-full"></span>
                <span className="bg-black w-2.5 h-full"></span>
                <span className="bg-black w-1 h-full"></span>
                <span className="bg-black w-2 h-full"></span>
                <span className="bg-black w-0.5 h-full"></span>
                <span className="bg-black w-3 h-full"></span>
              </div>
              <span className="text-[10px] font-mono mt-1.5 text-zinc-500">PF-{Math.floor(100000 + Math.random() * 900000)}</span>
            </div>

            <button
              id="close-voucher-btn"
              onClick={() => setShowVoucher(null)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all"
            >
              Concluir Resgate
            </button>
          </div>
        </div>
      )}

      {/* General feedback notice */}
      {successMsg && !showVoucher && (
        <div className={`mt-3 p-2.5 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5 ${
          successMsg.includes("insuficiente") ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
        }`}>
          {successMsg.includes("insuficiente") ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {successMsg}
        </div>
      )}

    </div>
  );
}
