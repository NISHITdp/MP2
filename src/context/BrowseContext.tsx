import { createContext, useContext, useState, ReactNode } from 'react';

type BrowseCtx = {
  ids: number[];
  setIds: (next: number[]) => void;
};

const Ctx = createContext<BrowseCtx | undefined>(undefined);

export function BrowseProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<number[]>([]);
  return <Ctx.Provider value={{ ids, setIds }}>{children}</Ctx.Provider>;
}

export function useBrowse() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useBrowse must be used within BrowseProvider');
  return ctx;
}
