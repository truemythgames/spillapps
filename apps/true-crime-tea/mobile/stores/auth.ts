import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import * as AppleAuthentication from "expo-apple-authentication";
import Constants from "expo-constants";
import { api } from "@/lib/api";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

const extra = Constants.expoConfig?.extra as
  | { googleWebClientId?: string; googleIosClientId?: string }
  | undefined;

const googleWebClientId =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ||
  extra?.googleWebClientId?.trim();
const googleIosClientId =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() ||
  extra?.googleIosClientId?.trim();

// Google Sign-In requires a native build; gracefully degrade in Expo Go
let GoogleSignin: any = null;
try {
  GoogleSignin = require("@react-native-google-signin/google-signin").GoogleSignin;
  GoogleSignin.configure({
    iosClientId: googleIosClientId,
    webClientId: googleWebClientId,
  });
} catch {
  // native module unavailable (Expo Go) — Google sign-in disabled
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  hydrate: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  hydrate: async () => {
    try {
      const [token, userJson] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);
      if (token && userJson) {
        const user = JSON.parse(userJson) as AuthUser;
        set({ user, isAuthenticated: true });
      }
    } catch {
      // corrupt data — treat as logged out
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithGoogle: async () => {
    if (!GoogleSignin) {
      throw new Error("Google Sign-In requires a native build. Run `expo prebuild` first.");
    }
    await GoogleSignin.hasPlayServices();
    const result = await GoogleSignin.signIn();
    const idToken = result.data?.idToken;
    if (!idToken) throw new Error("No ID token from Google");

    const { session_token, user: serverUser } = await api.signIn(idToken, "google");

    const user: AuthUser = {
      id: serverUser.id,
      email: serverUser.email,
      name: serverUser.name,
      avatar: serverUser.picture,
    };

    await SecureStore.setItemAsync(TOKEN_KEY, session_token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  signInWithApple: async () => {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) throw new Error("No identity token from Apple");

    const { session_token, user: serverUser } = await api.signIn(
      credential.identityToken,
      "apple"
    );

    const user: AuthUser = {
      id: serverUser.id,
      email: serverUser.email || credential.email || "",
    };

    if (credential.fullName) {
      const name = [credential.fullName.givenName, credential.fullName.familyName]
        .filter(Boolean)
        .join(" ");
      if (name) user.name = name;
    }

    await SecureStore.setItemAsync(TOKEN_KEY, session_token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  signOut: async () => {
    try {
      GoogleSignin?.signOut();
    } catch {
      // not signed in with Google — fine
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    set({ user: null, isAuthenticated: false });
  },
}));
