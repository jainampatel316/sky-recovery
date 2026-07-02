import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import { getChatHistory, sendChatMessage } from '../services/api';

interface Message { role: 'user' | 'assistant' | 'ai'; text: string; }

const QUICK_PROMPTS = [
  "Refund eligibility?",
  "Get hotel voucher?",
];

export default function ChatPopover({ passengerId }: { passengerId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Hi! I'm SkyRecover AI. I'm here to help you navigate your flight disruption." },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load chat history
    getChatHistory(passengerId).then(history => {
      if (history && history.length > 0) {
        setMessages(prev => [
          prev[0], // Keep the initial greeting
          ...history.map((m: any) => ({
            role: m.role === 'assistant' ? 'ai' : m.role,
            text: m.text
          }))
        ]);
      }
    }).catch(console.error);
  }, [passengerId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    
    const newMessages: Message[] = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setInput('');
    setTyping(true);
    
    try {
      const response = await sendChatMessage(passengerId, text);
      setMessages(prev => [...prev, { role: 'ai', text: response.text }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${error.message}` }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="w-80 md:w-96 bg-card border border-[--card-border] rounded-xl shadow-2xl animate-fade-in flex flex-col h-[500px]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[--card-border] bg-gradient-to-r from-violet-600 to-purple-600 rounded-t-xl shrink-0">
        <div className="w-8 h-8 rounded-full bg-card/20 flex items-center justify-center">
          <Bot size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">AI Assistant</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-[10px] text-violet-200">Online</span>
          </div>
        </div>
        <div className="ml-auto">
          <Sparkles size={16} className="text-violet-200" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[--background]">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in-up`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              m.role === 'ai' ? 'bg-violet-100' : 'bg-[--muted]'
            }`}>
              {m.role === 'ai' ? <Bot size={12} className="text-violet-600" /> : <User size={12} className="text-[--muted-foreground]" />}
            </div>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
              m.role === 'ai'
                ? 'bg-card border border-[--card-border] text-[--foreground] rounded-tl-sm'
                : 'bg-violet-600 text-white rounded-tr-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-2 animate-fade-in">
            <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
              <Bot size={12} className="text-violet-600" />
            </div>
            <div className="bg-card border border-[--card-border] px-3 py-2 rounded-xl rounded-tl-sm flex items-center gap-1">
              {[0,1,2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-[--muted-foreground] animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-3 py-2 bg-card flex gap-1.5 flex-wrap border-t border-[--card-border] shrink-0">
        {QUICK_PROMPTS.map(p => (
          <button key={p} onClick={() => send(p)}
            className="text-[10px] px-2.5 py-1 border border-[--card-border] rounded-full hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 transition-colors text-[--muted-foreground]">
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 bg-card flex gap-2 rounded-b-xl shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
          placeholder="Ask a question..."
          className="flex-1 px-3 py-2 rounded-lg border border-[--card-border] text-xs focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition-colors"
        />
        <button onClick={() => send(input)} disabled={!input.trim()}
          className="w-8 h-8 flex items-center justify-center bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-40">
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
