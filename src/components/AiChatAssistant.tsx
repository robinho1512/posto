import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { 
  Bot, 
  Send, 
  MessageSquare, 
  User, 
  Activity, 
  Sparkles,
  HelpCircle,
  Clock
} from "lucide-react";

interface AiChatAssistantProps {
  darkMode: boolean;
}

export default function AiChatAssistant({ darkMode }: AiChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m_init",
      sender: "assistant",
      text: "Olá! Sou o **FielBot**, o assistente inteligente 24 horas do PostoFiel. Posso te ajudar a encontrar o posto mais barato hoje, consultar seus pontos de fidelidade, sugerir prêmios para resgatar ou tirar qualquer dúvida do app. Como posso te ajudar?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestions = [
    "Qual posto tem o menor preço de Gasolina?",
    "Como funciona o acúmulo de pontos?",
    "Quantos pontos custa o Café Expresso?",
    "Onde fica o Posto Shell Europa?"
  ];

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: ChatMessage = {
      id: "m_" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-8) // Send recent message history for memory context
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: ChatMessage = {
          id: "m_assistant_" + Date.now(),
          sender: "assistant",
          text: data.text,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error("Erro na resposta");
      }
    } catch (err) {
      // Local fallback in case server has issues
      setTimeout(() => {
        const fallbackMessage: ChatMessage = {
          id: "m_assistant_fallback_" + Date.now(),
          sender: "assistant",
          text: "Olá! Desculpe, tive uma oscilação na conexão com a nuvem, mas posso te adiantar as regras de fidelidade: você ganha **1 ponto por cada Real gasto** em pagamentos de combustível via QR Code no app! Temos café de graça por 100 pontos e lavagem por 400 pontos.",
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, fallbackMessage]);
      }, 1000);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div id="ai-chat-section" className={`rounded-2xl border flex flex-col h-[520px] overflow-hidden ${
      darkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
    } shadow-lg`}>
      
      {/* Header */}
      <div className="p-4 border-b border-zinc-500/10 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/30">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 animate-bounce" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-zinc-900"></span>
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">FielBot - Chat Integrado 24h</h3>
            <p className="text-[10px] text-zinc-500 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" />
              Sempre online • Inteligência Gemini
            </p>
          </div>
        </div>
        
        <div className="text-right shrink-0">
          <span className="text-[9px] uppercase font-bold text-zinc-400 bg-zinc-500/10 px-2 py-1 rounded flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Suporte Ativo
          </span>
        </div>
      </div>

      {/* Suggestion list */}
      {messages.length === 1 && (
        <div className="p-3 border-b border-zinc-500/5 bg-zinc-100/30 dark:bg-zinc-800/10">
          <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mb-2 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> Perguntas frequentes (Toque para enviar)
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSendMessage(s)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-left shrink-0 transition-all border ${
                  darkMode 
                    ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300" 
                    : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-600"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
        {messages.map((m) => {
          const isAssistant = m.sender === "assistant";
          return (
            <div key={m.id} className={`flex gap-3 max-w-[85%] ${isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
              {/* Profile Icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-zinc-500/10 shadow-sm ${
                isAssistant ? "bg-emerald-500 text-white" : "bg-white dark:bg-zinc-800 text-zinc-600"
              }`}>
                {isAssistant ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message text bubble */}
              <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                isAssistant 
                  ? darkMode ? "bg-zinc-800 text-zinc-100" : "bg-zinc-100 text-zinc-800"
                  : "bg-emerald-500 text-white"
              }`}>
                <p className="whitespace-pre-wrap">
                  {/* Clean simulation of simple markdown formatting */}
                  {m.text.split("**").map((part, i) => i % 2 === 1 ? <strong key={i} className="font-extrabold">{part}</strong> : part)}
                </p>
                <span className="text-[8px] opacity-60 block mt-1.5 text-right font-mono">
                  {new Date(m.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-zinc-500/10 bg-emerald-500 text-white shadow-sm">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div className={`p-3 rounded-2xl text-xs flex gap-1 items-center ${
              darkMode ? "bg-zinc-800 text-zinc-100" : "bg-zinc-100 text-zinc-800"
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Inputs box */}
      <div className="p-3 border-t border-zinc-500/10 bg-zinc-50/80 dark:bg-zinc-800/10">
        <div className="relative flex items-center gap-2">
          <input
            id="chat-input"
            type="text"
            placeholder="Pergunte ao FielBot..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputText)}
            className={`flex-1 px-4 py-2.5 pr-10 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              darkMode 
                ? "bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500" 
                : "bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400"
            }`}
          />
          <button
            id="chat-send-btn"
            onClick={() => handleSendMessage(inputText)}
            className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-md shrink-0 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
