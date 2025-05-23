import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<AdminLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
