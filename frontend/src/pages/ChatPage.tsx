import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles } from 'lucide-react';

interface Message { role: 'user' | 'ai'; text: string; }

const FAQ_RESPONSES: Record<string, string> = {
  cancel:      "Your flight has been cancelled due to weather or operational reasons. You are eligible for a full refund, a complimentary meal voucher, and priority rebooking on the next available flight. You can also request hotel accommodation if there is no alternative flight today.",
  delay:       "Flight delays can be frustrating. If your flight is delayed by more than 2 hours, you are eligible for a meal voucher. If the delay exceeds 8 hours, we will also arrange hotel accommodation. You can rebook on an alternative flight or wait for your original flight.",
  refund:      "You are eligible for a full refund since your flight was disrupted by the airline. For cancelled flights, refunds are processed within 5–7 business days to your original payment method. You can initiate the refund directly from your recovery dashboard.",
  compensation: "Based on airline regulations, you may be entitled to compensation of $200–$600 depending on the delay duration and your loyalty tier. Gold and Platinum members receive enhanced compensation. This is in addition to any refund you choose.",
  hotel:       "Hotel vouchers are provided when the next available flight is on the following day, or when your delay exceeds 8 hours. A recovery agent can arrange hotel booking at a partnered hotel near the airport.",
  meal:        "Complimentary meal vouchers are issued automatically for disruptions. For cancellations, one meal voucher is provided. For delays over 2 hours, a voucher for up to $25 is available. Please collect it from the SkyRecover desk at the airport.",
  rebook:      "We have identified alternative flights on the same route. Our AI engine recommends the earliest available flight with the best connection time. You can accept the recommendation or choose another flight from the available options panel.",
  seat:        "When rebooking, every effort is made to preserve your original seat class. Business class passengers will always be rebooked in Business class or better. Economy passengers will be accommodated in the same class on the next available flight.",
  default:     "I'm the SkyRecover AI Assistant. I can help you with questions about your cancelled or delayed flight, refund eligibility, compensation, meal vouchers, hotel accommodation, and rebooking options. What would you like to know?",
};

function getAIResponse(input: string): string {
  const l = input.toLowerCase();
  if (l.includes('cancel')) return FAQ_RESPONSES.cancel;
  if (l.includes('delay')) return FAQ_RESPONSES.delay;
  if (l.includes('refund') || l.includes('money')) return FAQ_RESPONSES.refund;
  if (l.includes('compensation') || l.includes('compensat')) return FAQ_RESPONSES.compensation;
  if (l.includes('hotel') || l.includes('accommodation')) return FAQ_RESPONSES.hotel;
  if (l.includes('meal') || l.includes('food') || l.includes('voucher')) return FAQ_RESPONSES.meal;
  if (l.includes('rebook') || l.includes('alternative') || l.includes('next flight')) return FAQ_RESPONSES.rebook;
  if (l.includes('seat') || l.includes('class') || l.includes('business')) return FAQ_RESPONSES.seat;
  return FAQ_RESPONSES.default;
}

const QUICK_PROMPTS = [
  "Why was my flight cancelled?",
  "Am I eligible for a refund?",
  "What compensation do I get?",
  "Can I get a hotel voucher?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Hi! I'm SkyRecover AI. I'm here to help you navigate your flight disruption. Ask me anything about your recovery options, refunds, compensation, or vouchers." },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const response = getAIResponse(text);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
      setTyping(false);
    }, 900);
  };

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-9rem)] flex flex-col animate-fade-in-up">
      <div className="bg-card border border-[--card-border] rounded-xl flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[--card-border] bg-gradient-to-r from-violet-600 to-purple-600 rounded-t-xl">
          <div className="w-9 h-9 rounded-full bg-card/20 flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">SkyRecover AI Assistant</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-xs text-violet-200">Online — Powered by AI</span>
            </div>
          </div>
          <div className="ml-auto">
            <Sparkles size={18} className="text-violet-200" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in-up`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                m.role === 'ai' ? 'bg-violet-100' : 'bg-[--muted]'
              }`}>
                {m.role === 'ai' ? <Bot size={14} className="text-violet-600" /> : <User size={14} className="text-[--muted-foreground]" />}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                m.role === 'ai'
                  ? 'bg-[--muted] text-[--foreground] rounded-tl-sm'
                  : 'bg-violet-600 text-white rounded-tr-sm'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                <Bot size={14} className="text-violet-600" />
              </div>
              <div className="bg-[--muted] px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                {[0,1,2].map(i => (
                  <span key={i} className="w-2 h-2 rounded-full bg-[--muted-foreground] animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick prompts */}
        <div className="px-4 pb-2 flex gap-2 flex-wrap">
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={() => send(p)}
              className="text-xs px-3 py-1.5 border border-[--card-border] rounded-full hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 transition-colors text-[--muted-foreground]">
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 pb-4 flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Ask about your flight disruption..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-[--card-border] text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition-colors"
          />
          <button onClick={() => send(input)} disabled={!input.trim()}
            className="w-10 h-10 flex items-center justify-center bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-40">
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
