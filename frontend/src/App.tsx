import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";
import ToastViewport from "./components/common/ToastViewport";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastViewport />
    </BrowserRouter>
  );
}

export default App;
