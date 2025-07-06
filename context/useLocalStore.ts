import { create } from 'zustand';

interface LocalStore {
    barcode: string;
    setBarcode: (bc: string) => void;
}

export const useLocalStore = create<LocalStore>()(
    (set) => ({
        barcode: "",
        setBarcode: (bc) =>
            set(() => ({ barcode: bc })),
    }),
);