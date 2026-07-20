import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import MainContainer from "./components/MainContainer";
import { LoadingProvider } from "./context/LoadingProvider";
import "./App.css";

const CharacterModel = lazy(() => import("./components/Character"));

const App = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route
          path="/"
          element={
            <LoadingProvider>
              <MainContainer>
                <Suspense fallback={null}>
                  <CharacterModel />
                </Suspense>
              </MainContainer>
            </LoadingProvider>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
