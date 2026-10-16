import React, { useState, useRef, useEffect } from 'react';
import { translations, LanguageMode } from '../locales/i18n';
import { AuditReport } from '../types/audit';
import { MessageSquare, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: string;
}

interface ArchitectChatProps {
  auditContext?: AuditReport | null;
  lang: LanguageMode;
}

export const ArchitectChat: React.FC<ArchitectChatProps> = ({ auditContext, lang }) => {
  const t = translations[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        lang === 'ar'
          ? `مرحباً بك. أنا **SI-Modernize AI**، كبير مهندسي النظم ومدقق تقنية المعلومات الرئيسي. لقد قمت بمراجعة المنظومة ${auditContext?.executiveSummary?.systemName || 'الأحادية'}. يمكنك استشارتي في أي وقت حول:\n- معمارية Saga وتفادي مشاكل القفل الموزع (2PC).\n- نمط Transactional Outbox ومزامنة Debezium CDC.\n- استراتيجيات التراجع الآمن (Rollback Strategies) في نمط Strangler Fig.\n- ضمان الامتثال لمعايير PCI-DSS 4.0 وGDPR Art. 32 في الشفرة الحديثة.`
          : `Greetings. I am **SI-Modernize AI**, Principal Enterprise Systems Architect and Lead IT Auditor. I have loaded the audit context for **${auditContext?.executiveSummary?.systemName || 'this legacy enterprise system'}**.\n\nYou can consult me on:\n- Implementing the Saga pattern without distributed 2PC locks\n- Change Data Capture (CDC) with Debezium and the Transactional Outbox pattern\n- Zero-downtime rollback protocols for the Strangler Fig proxy\n- Remediating PCI-DSS 4.0 and GDPR compliance gaps in the target microservice architecture.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = lang === 'ar'
    ? [
        'كيف نطبق نمط Transactional Outbox مع Kafka لضمان عدم ضياع أي معاملة؟',
        'ما هي خطة التراجع (Rollback Plan) في حال حدوث بطء في المرحلة الثانية؟',
        'كيف تلبي الشفرة المعاد هندستها متطلب PCI-DSS 3.4 لحماية بيانات البطاقات؟',
        'هل نستخدم gRPC أم REST للاتصال الداخلي بين الخدمات الدقيقة؟',
      ]
    : [
        'How do we implement the Transactional Outbox pattern with Kafka to guarantee at-least-once delivery?',
        'What is our zero-downtime rollback protocol if Phase 2 traffic cutover suffers latency spikes?',
        'How does the refactored microservice satisfy PCI-DSS Req 3.4 for cardholder data tokenization?',
        'Should we standardize on gRPC or REST for inter-service communication across bounded contexts?',
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        text: m.content,
      }));

      const res = await fetch('/api/chat-architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          auditContext,
          language_mode: lang,
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: data.reply || (lang === 'ar' ? 'حدث خطأ في استجابة المستشار المعماري.' : 'Failed to receive architectural response.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: lang === 'ar' ? `خطأ في الاتصال: ${err.message}` : `Connection error: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{t.chatTitle}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                Active
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">{t.chatSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Gemini 3.8 Flash</span>
        </div>
      </div>

      {/* Suggested Questions Chips */}
      <div className="p-3 bg-slate-950/40 border-b border-slate-800/80 overflow-x-auto flex gap-2 shrink-0">
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-xs whitespace-nowrap bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/80 px-3 py-1.5 rounded-full cursor-pointer transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-indigo-950/80 border border-indigo-800 text-indigo-300'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[82%] rounded-xl p-3.5 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none font-sans'
              }`}
            >
              <div className="whitespace-pre-line font-normal">{msg.content}</div>
              <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                <span>{msg.timestamp}</span>
                {msg.source && <span className="font-mono text-slate-500">[{msg.source}]</span>}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-800 text-indigo-300 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl rounded-tl-none p-3.5 text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>
                {lang === 'ar'
                  ? 'SI-Modernize AI يحلل الاستفسار المعماري...'
                  : 'SI-Modernize AI is formulating architectural counsel...'}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.chatPlaceholder}
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 font-sans"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.send}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
