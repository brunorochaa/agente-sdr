import { Link } from "react-router-dom";

const NotFound = () => (
  <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
    <p className="eyebrow">Erro 404</p>
    <h1 className="mt-3 text-3xl font-semibold tracking-tight">Página não encontrada</h1>
    <p className="mt-3 text-muted-foreground">O endereço pode ter mudado ou não existe mais.</p>
    <Link
      to="/"
      className="mt-8 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      Voltar para o início
    </Link>
  </main>
);

export default NotFound;
