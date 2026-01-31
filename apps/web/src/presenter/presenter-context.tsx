import { createContext, useContext, useMemo, type ReactNode } from "react";

import { Presenter } from "./presenter";

const PresenterContext = createContext<Presenter | null>(null);

export function PresenterProvider({ children }: { children: ReactNode }) {
  const presenter = useMemo(() => new Presenter(), []);
  return (
    <PresenterContext.Provider value={presenter}>{children}</PresenterContext.Provider>
  );
}

export function usePresenter() {
  const presenter = useContext(PresenterContext);
  if (!presenter) {
    throw new Error("usePresenter must be used within PresenterProvider");
  }
  return presenter;
}
