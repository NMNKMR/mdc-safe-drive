import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type UserState = {
  name: string;
  username: string;
  setName: (name: string) => void;
  setUsername: (username: string) => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: "",
      username: "",
      setName: (name) => set({ name }),
      setUsername: (username) => set({ username }),
    }),
    {
      name: "user",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
