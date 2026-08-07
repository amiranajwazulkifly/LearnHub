import { BrowserRouter } from "react-router-dom";
import CoursesPage from "./pages/admin/CoursesPage";

import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
