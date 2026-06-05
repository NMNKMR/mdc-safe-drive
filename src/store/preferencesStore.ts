import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type PreferencesState = {
  /** Theme: light, dark, or follow the system setting. */
  themeMode: ThemeMode;
  /** Auto-start recording a trip when motion is detected. */
  autoDriveDetection: boolean;
  /** Real-time audio feedback for harsh events. */
  voiceCoaching: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setAutoDriveDetection: (on: boolean) => void;
  setVoiceCoaching: (on: boolean) => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      themeMode: "system",
      autoDriveDetection: true,
      voiceCoaching: false,
      setThemeMode: (themeMode) => set({ themeMode }),
      setAutoDriveDetection: (autoDriveDetection) =>
        set({ autoDriveDetection }),
      setVoiceCoaching: (voiceCoaching) => set({ voiceCoaching }),
    }),
    {
      name: "preferences",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
