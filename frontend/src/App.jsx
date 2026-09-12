import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import "./App.css";

import Layout from "./Layout";
import Assessment from "./pages/Assessment";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/assessment"
          element={
            <Layout>
              <Assessment />
            </Layout>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
