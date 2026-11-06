import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LangProvider } from "./lib/i18n";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Privacidade from "./pages/Privacidade";

const App = () => (
  <LangProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </LangProvider>
);

export default App;
