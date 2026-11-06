import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import Privacidade from "./pages/Privacidade";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/privacidade" element={<Privacidade />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
