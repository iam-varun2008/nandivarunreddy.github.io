/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import Loading from "../components/Loading";

interface LoadingType {
  isLoading: boolean;
  setIsLoading: (state: boolean) => void;
  setLoading: (percent: number) => void;
}

export const LoadingContext = createContext<LoadingType | null>(null);

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(() => {
    // Skip loading on mobile
    if (window.innerWidth <= 768) return false;
    return true;
  });
  const [loading, setLoading] = useState(0);

  const value = {
    isLoading,
    setIsLoading,
    setLoading,
  };
  useEffect(() => {
    let cancelled = false;
    let startTimer: number | undefined;
    delete document.documentElement.dataset.loaderComplete;

    if (window.innerWidth <= 768) {
      import("../components/utils/initialFX").then((module) => {
        if (module.initialFX && !cancelled) {
          startTimer = window.setTimeout(() => {
            if (cancelled) return;
            module.initialFX();
            document.documentElement.dataset.loaderComplete = "true";
            window.dispatchEvent(new Event("portfolio:loader-complete"));
          }, 100);
        }
      });
    }
    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
    };
  }, []);

  return (
    <LoadingContext.Provider value={value as LoadingType}>
      {isLoading && <Loading percent={loading} />}
      <main className="main-body">{children}</main>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
