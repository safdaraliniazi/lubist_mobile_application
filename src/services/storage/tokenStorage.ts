import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'lubist_access_token';
const REFRESH_TOKEN_KEY = 'lubist_refresh_token';
const USER_KEY = 'lubist_user';

export async function setTokens(accessToken: string, refreshToken: string) {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch (e) {}
  } else {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export async function getAccessToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (e) {
      return null;
    }
  }
  return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (e) {
      return null;
    }
  }
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function setUser(user: any) {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {}
  } else {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  }
}

export async function getUser(): Promise<any | null> {
  let userStr: string | null = null;
  if (Platform.OS === 'web') {
    try {
      userStr = localStorage.getItem(USER_KEY);
    } catch (e) {}
  } else {
    userStr = await SecureStore.getItemAsync(USER_KEY);
  }
  return userStr ? JSON.parse(userStr) : null;
}

export async function clearAuth() {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {}
  } else {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  }
}
