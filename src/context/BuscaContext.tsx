import { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";

interface BuscaContextType {
  termoBusca: string;
  setTermoBusca: (termo: string) => void;
}

const BuscaContext = createContext<BuscaContextType | undefined>(undefined);

export function BuscaProvider({ children }: { children: ReactNode }) {
  const [termoBusca, setTermoBusca] = useState("");

  return (
    <BuscaContext.Provider value={{ termoBusca, setTermoBusca }}>
      {children}
    </BuscaContext.Provider>
  );
}

export function useBusca() {
  const context = useContext(BuscaContext);
  if (!context) throw new Error("useBusca deve ser usado dentro de BuscaProvider");
  return context;
}
