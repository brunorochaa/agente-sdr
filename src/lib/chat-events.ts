// Permite que qualquer parte da página abra o chat (opcionalmente com um texto sugerido).

const OPEN_CHAT_EVENT = "erp360:open-chat";

export function openChat(draft?: string) {
  window.dispatchEvent(new CustomEvent<string | undefined>(OPEN_CHAT_EVENT, { detail: draft }));
}

export function onOpenChat(handler: (draft?: string) => void): () => void {
  const listener = (event: Event) => handler((event as CustomEvent<string | undefined>).detail);
  window.addEventListener(OPEN_CHAT_EVENT, listener);
  return () => window.removeEventListener(OPEN_CHAT_EVENT, listener);
}
