import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

const NotFound = () => {
  const { t } = useI18n();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">{t.notFound.eyebrow}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{t.notFound.title}</h1>
      <p className="mt-3 text-muted-foreground">{t.notFound.text}</p>
      <Link
        to="/"
        className="mt-8 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        {t.notFound.back}
      </Link>
    </main>
  );
};

export default NotFound;
