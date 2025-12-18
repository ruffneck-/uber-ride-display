import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Driver from "./pages/Driver";
import Display from "./pages/Display";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/display" replace />} />
        <Route path="/driver" element={<Driver />} />
        <Route path="/display" element={<Display />} />
      </Routes>
    </BrowserRouter>
  );
}
