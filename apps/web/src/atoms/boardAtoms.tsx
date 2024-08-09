import { atom } from 'jotai';

type User = {
  id: string;
  name: string | null;
  email: string | null;
};

export const userAtom = atom<User | null>(null);
export const selectedBoardIdAtom = atom<string | null>(null);
export const sidebarOpenAtom = atom(false);