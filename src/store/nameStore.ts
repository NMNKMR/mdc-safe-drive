import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type NameState = {
  name: string;
  setName: (name: string) => void;
};

export const useNameStore = create<NameState>()(
  persist(
    (set) => ({
      name: "",
      setName: (name) => set({ name }),
    }),
    {
      name: "name",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
