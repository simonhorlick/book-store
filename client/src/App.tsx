import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Books } from "./Books";
import { Checkout } from "./Checkout";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/books" element={<Books />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="*" element={<Navigate to="/books" />} />
      </Routes>
    </BrowserRouter>
  );
}
