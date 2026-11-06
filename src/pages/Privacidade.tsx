import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";

const SECTIONS: { title: string; text: string }[] = [
  {
    title: "Quais dados coletamos",
    text: "Só o que você escreve no chat: mensagens, nome, e-mail, empresa, necessidade e prazo. Se agendar uma demonstração, guardamos também o horário e o link da reunião.",
  },
  {
    title: "Para que usamos",
    text: "Para responder suas perguntas, preparar a conversa com o time comercial e agendar a demonstração. Não usamos os dados para outra finalidade.",
  },
  {
    title: "Com quem compartilhamos",
    text: "Com os serviços que fazem o chat funcionar: Supabase (banco de dados), o provedor de IA configurado (Gemini, OpenAI ou Claude), Pipefy (registro do lead) e Cal.com (agenda). As mensagens são enviadas ao provedor de IA para gerar as respostas.",
  },
  {
    title: "Como protegemos",
    text: "O navegador nunca acessa as tabelas do banco: tudo passa por uma função no servidor, e as tabelas não têm acesso público. Há limite de mensagens por sessão para evitar abuso.",
  },
  {
    title: "Seus direitos (LGPD)",
    text: "Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento, pelo próprio chat ou falando com o time comercial.",
  },
  {
    title: "Projeto de demonstração",
    text: "O ERP360 é um produto fictício, criado como desafio técnico. Evite informar dados sensíveis ou reais além do necessário para testar o chat.",
  },
];

const Privacidade = () => {
  useEffect(() => {
    document.title = "Privacidade | ERP360";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="page-container flex h-16 items-center justify-between">
          <Logo />
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar ao site
          </Link>
        </div>
      </header>
      <main className="page-container max-w-3xl py-16">
        <p className="eyebrow mb-4">Privacidade e LGPD</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Como tratamos os seus dados
        </h1>
        <div className="mt-10 space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-semibold">{s.title}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{s.text}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Privacidade;
