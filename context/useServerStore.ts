import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ServerStore {
    localIp: string;
    setLocalIp: (bc: string) => void;
}

export const useServerStore = create<ServerStore>()(
    persist(
        (set) => ({
            localIp: "",
            setLocalIp: (ip) =>
                set(() => ({ localIp: ip })),
        }),
        {
            name: 'server-storage', // Unique name for your storage item
            storage: createJSONStorage(() => AsyncStorage), // Specify AsyncStorage as the storage engine
        }
    )
);