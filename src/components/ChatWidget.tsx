import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, MessageSquare, RotateCw, X } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { onOpenChat } from "@/lib/chat-events";
import { cn } from "@/lib/utils";

const SESSION_KEY = "sdr_session_id";
const MAX_LENGTH = 1000;

const WELCOME_FALLBACK =
  "Olá! Sou o assistente virtual da ERP360. Como posso ajudar você hoje com a gestão da sua empresa?";

const SUGGESTIONS = [
  "Quero conhecer os planos",
  "Meu estoque vive desatualizado",
  "Quero agendar uma demonstração",
];

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  failed?: boolean;
}

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `session_${crypto.randomUUID()}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/** Quando a função recusa por excesso de uso (429), ela explica o motivo em pt-BR. */
async function rateLimitMessage(error: unknown): Promise<string | null> {
  const response = (error as { context?: unknown } | null)?.context;
  if (!(response instanceof Response) || response.status !== 429) return null;
  try {
    return (await response.json()).error ?? null;
  } catch {
    return null;
  }
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/** Mostra o texto com links clicáveis (ex.: link da reunião). */
function MessageText({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return (
    <>
      {parts.map((part, index) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noreferrer"
            className="break-all font-medium underline underline-offset-2"
          >
            {part}
          </a>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-2" aria-label="Digitando">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [sessionId] = useState(getSessionId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Carrega o histórico só quando o chat é aberto pela primeira vez
  // (assim, quem só lê a página não gera chamadas à função).
  useEffect(() => {
    if (!isOpen || historyLoaded) return;
    setHistoryLoaded(true);

    supabase.functions
      .invoke("sdr-chat", { body: { action: "history", sessionId } })
      .then(({ data, error }) => {
        if (error) throw error;
        const history: { role: Message["role"]; content: string; created_at?: string }[] =
          data?.messages ?? [];
        setMessages(
          history.map((m) => ({
            role: m.role,
            content: m.content,
            timestamp: m.created_at ? new Date(m.created_at) : new Date(),
          })),
        );
      })
      .catch((error) => {
        console.error("Erro ao carregar histórico:", error);
        setMessages([{ role: "assistant", content: WELCOME_FALLBACK, timestamp: new Date() }]);
      });
  }, [isOpen, historyLoaded, sessionId]);

  // Botões da página podem abrir o chat com um texto sugerido.
  useEffect(
    () =>
      onOpenChat((draft) => {
        setIsOpen(true);
        if (draft) setInput(draft);
        setTimeout(() => inputRef.current?.focus(), 50);
      }),
    [],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  // Ajusta a altura do campo conforme o texto.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input, isOpen]);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || isLoading) return;

      setMessages((prev) => [
        ...prev.filter((m) => !m.failed),
        { role: "user", content, timestamp: new Date() },
      ]);
      setInput("");
      setNotice(null);
      setIsLoading(true);

      try {
        const { data, error } = await supabase.functions.invoke("sdr-chat", {
          body: { sessionId, message: content },
        });
        if (error || !data?.response) throw error ?? new Error(data?.error);

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response, timestamp: new Date() },
        ]);
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        setNotice(await rateLimitMessage(error));
        setMessages((prev) =>
          prev.map((m, i) => (i === prev.length - 1 ? { ...m, failed: true } : m)),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, sessionId],
  );

  const retry = (message: Message) => {
    setMessages((prev) => prev.filter((m) => m !== message));
    send(message.content);
  };

  const showSuggestions = !isLoading && historyLoaded && messages.length <= 1;

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-primary py-3.5 pl-4 pr-5 text-sm font-medium text-primary-foreground shadow-xl shadow-primary/30 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Abrir chat com especialista"
        >
          <MessageSquare className="h-4 w-4" />
          Falar com especialista
        </button>
      )}

      {isOpen && (
        <section
          role="dialog"
          aria-label="Chat com especialista ERP360"
          className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-chat-background duration-200 animate-in fade-in slide-in-from-bottom-2 sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[620px] sm:max-h-[calc(100vh-2.5rem)] sm:w-[400px] sm:rounded-3xl sm:border sm:shadow-2xl"
        >
          {/* Cabeçalho */}
          <header className="flex items-center justify-between border-b bg-gradient-to-b from-card to-muted/40 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <LogoMark className="h-9 w-9" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Assistente ERP360</p>
                <p className="text-xs text-muted-foreground">Responde em segundos</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Fechar chat"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {/* Mensagens */}
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5" aria-live="polite">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={idx}
                  className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap px-3.5 py-2.5 text-sm leading-relaxed",
                      isUser
                        ? "rounded-2xl rounded-br-sm bg-chat-bubble-user text-background"
                        : "rounded-2xl rounded-bl-sm border bg-chat-bubble-assistant",
                      msg.failed && "opacity-60",
                    )}
                  >
                    <MessageText text={msg.content} />
                  </div>
                  {msg.failed ? (
                    <button
                      type="button"
                      onClick={() => retry(msg)}
                      className="flex items-center gap-1 text-xs font-medium text-destructive hover:underline"
                    >
                      <RotateCw className="h-3 w-3" />
                      Não enviada. Tentar de novo
                    </button>
                  ) : (
                    <span className="px-1 font-mono text-[10px] text-muted-foreground">
                      {formatTime(msg.timestamp)}
                    </span>
                  )}
                </div>
              );
            })}

            {(isLoading || (isOpen && !historyLoaded)) && (
              <div className="w-fit rounded-2xl rounded-bl-sm border bg-card px-3">
                <TypingIndicator />
              </div>
            )}

            {notice && (
              <p
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
              >
                {notice}
              </p>
            )}

            {showSuggestions && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    className="rounded-full border bg-card px-3 py-1.5 text-xs transition-colors hover:border-primary hover:text-primary"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Campo de mensagem */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t bg-card p-3"
          >
            <div className="flex items-end gap-2 rounded-2xl border bg-background px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Escreva sua mensagem"
                maxLength={MAX_LENGTH}
                aria-label="Mensagem"
                className="max-h-[120px] flex-1 resize-none bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-30"
                aria-label="Enviar mensagem"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Assistente com IA. Nome, e-mail e o que você contar aqui são usados só para o contato
              comercial.
            </p>
          </form>
        </section>
      )}
    </>
  );
};
