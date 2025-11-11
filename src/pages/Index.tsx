import { ChatWidget } from "@/components/ChatWidget";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="text-center max-w-4xl px-6">
        <div className="mb-8 inline-block">
          <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-[var(--shadow-elevated)]">
            <svg
              className="h-10 w-10 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>
        
        <h1 className="mb-4 text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          ERP360
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Sistema completo de gestão empresarial que unifica todos os processos do seu negócio em uma única plataforma inteligente.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-[var(--shadow-chat)] transition-all">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Gestão Financeira</h3>
            <p className="text-sm text-muted-foreground">Controle total sobre contas, fluxo de caixa e relatórios financeiros</p>
          </div>
          
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-[var(--shadow-chat)] transition-all">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 mx-auto">
              <svg className="h-6 w-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Estoque Inteligente</h3>
            <p className="text-sm text-muted-foreground">Gestão automatizada de inventário com alertas e previsões</p>
          </div>
          
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-[var(--shadow-chat)] transition-all">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Relatórios Avançados</h3>
            <p className="text-sm text-muted-foreground">Dashboards e análises em tempo real para decisões estratégicas</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-8 rounded-2xl border border-border">
          <h2 className="text-2xl font-bold mb-3">Pronto para transformar sua gestão?</h2>
          <p className="text-muted-foreground mb-4">
            Converse com nosso assistente virtual e descubra como o ERP360 pode revolucionar seu negócio.
          </p>
          <p className="text-sm text-primary font-semibold">
            👉 Clique no ícone de chat no canto inferior direito
          </p>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
};

export default Index;
