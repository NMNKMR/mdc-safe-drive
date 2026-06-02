import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type UsernameState = {
  username: string;
  setUsername: (username: string) => void;
};

export const useUsernameStore = create<UsernameState>()(
  persist(
    (set) => ({
      username: "",
      setUsername: (username) => set({ username }),
    }),
    {
      name: "username",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
