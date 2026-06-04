/**
 * preferencesStore
 * ----------------
 * App preference toggles surfaced on the Settings screen. Persisted so choices
 * survive restarts. These flags are not wired to drive behaviour yet — they
 * hold the user's intent until the relevant features consume them.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type PreferencesState = {
  /** Auto-start recording a trip when motion is detected. */
  autoDriveDetection: boolean;
  /** Real-time audio feedback for harsh events. */
  voiceCoaching: boolean;
  setAutoDriveDetection: (on: boolean) => void;
  setVoiceCoaching: (on: boolean) => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      autoDriveDetection: true,
      voiceCoaching: false,
      setAutoDriveDetection: (autoDriveDetection) => set({ autoDriveDetection }),
      setVoiceCoaching: (voiceCoaching) => set({ voiceCoaching }),
    }),
    {
      name: "preferences",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
