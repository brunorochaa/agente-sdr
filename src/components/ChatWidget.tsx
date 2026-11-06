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

type HistoryStatus = "idle" | "loading" | "ready";

/** Identifica a conversa do visitante. Nunca derruba a página, mesmo sem acesso ao localStorage. */
function getSessionId(): string {
  const create = () =>
    `session_${
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`
    }`;

  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = create();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    // Safari com cookies bloqueados, navegação privada antiga etc.: a conversa vale só nesta aba.
    return create();
  }
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

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * Mostra o texto com links clicáveis (ex.: link da reunião).
 * A pontuação no fim da frase ("...cal.com/x.") não entra no link.
 */
function MessageText({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+[^\s).,;:!?])/g);
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
    <div className="flex items-center gap-1 px-1 py-2" role="status">
      <span className="sr-only">Assistente digitando</span>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          aria-hidden="true"
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
  const [historyStatus, setHistoryStatus] = useState<HistoryStatus>("idle");
  const [notice, setNotice] = useState<string | null>(null);
  const [sessionId] = useState(getSessionId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Carrega o histórico só quando o chat é aberto pela primeira vez
  // (assim, quem só lê a página não gera chamadas à função).
  useEffect(() => {
    if (!isOpen || historyStatus !== "idle") return;
    setHistoryStatus("loading");

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
      })
      // Só aqui o chat passa a aceitar envio: antes disso, o histórico poderia
      // sobrescrever uma mensagem que o visitante acabou de mandar.
      .finally(() => setHistoryStatus("ready"));
  }, [isOpen, historyStatus, sessionId]);

  // Botões da página podem abrir o chat com um texto sugerido.
  useEffect(
    () =>
      onOpenChat((draft) => {
        setIsOpen(true);
        if (draft) setInput(draft);
      }),
    [],
  );

  // Foco: ao abrir, vai para o campo; ao fechar, volta para o botão que abriu o chat.
  useEffect(() => {
    if (isOpen) {
      wasOpen.current = true;
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      launcherRef.current?.focus();
    }
  }, [isOpen]);

  // Esc fecha o chat; no celular (tela cheia) a página de trás não rola.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    const fullScreen = window.matchMedia?.("(max-width: 639px)").matches ?? false;
    const previousOverflow = document.body.style.overflow;
    if (fullScreen) document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [messages, isLoading, isOpen]);

  // Ajusta a altura do campo conforme o texto.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input, isOpen]);

  const ready = historyStatus === "ready";

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || isLoading || !ready) return;

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
    [isLoading, ready, sessionId],
  );

  const retry = (message: Message) => {
    setMessages((prev) => prev.filter((m) => m !== message));
    send(message.content);
  };

  const showSuggestions = !isLoading && ready && messages.length <= 1;

  return (
    <>
      {!isOpen && (
        <button
          ref={launcherRef}
          type="button"
          onClick={() => setIsOpen(true)}
          aria-haspopup="dialog"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-primary py-3.5 pl-4 pr-4 text-sm font-medium text-primary-foreground shadow-xl shadow-primary/30 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:pr-5"
        >
          <MessageSquare className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden="true" />
          {/* No celular só o ícone aparece, mas o nome acessível continua o mesmo texto */}
          <span className="sr-only sm:not-sr-only">Falar com especialista</span>
        </button>
      )}

      {isOpen && (
        <section
          role="dialog"
          aria-modal="true"
          aria-label="Chat com especialista ERP360"
          className="fixed inset-0 z-50 flex h-[100dvh] flex-col overflow-hidden bg-chat-background duration-200 animate-in fade-in slide-in-from-bottom-2 sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[620px] sm:max-h-[calc(100vh-2.5rem)] sm:w-[400px] sm:rounded-3xl sm:border sm:shadow-2xl"
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
              className="rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                      className="flex items-center gap-1 text-xs font-medium text-destructive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

            {(isLoading || historyStatus === "loading") && (
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
                    className="rounded-full border bg-card px-3 py-1.5 text-xs transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  // isComposing: não envia enquanto o teclado ainda está montando um caractere (IME)
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Escreva sua mensagem"
                maxLength={MAX_LENGTH}
                aria-label="Mensagem"
                // 16px no celular: abaixo disso o iPhone dá zoom ao tocar no campo
                className="max-h-[120px] flex-1 resize-none bg-transparent py-1 text-base outline-none placeholder:text-muted-foreground sm:text-sm"
              />
              <button
                type="submit"
                disabled={isLoading || !ready || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-30"
                aria-label="Enviar mensagem"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Assistente com IA. Nome, e-mail e o que você contar aqui são usados só para o contato
              comercial.{" "}
              <a
                href="/privacidade"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-2 hover:text-foreground"
              >
                Privacidade
              </a>
            </p>
          </form>
        </section>
      )}
    </>
  );
};
