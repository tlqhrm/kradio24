import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RadioStation } from "@/types/radio";

interface FavoritesContextType {
  favorites: RadioStation[];
  addFavorite: (station: RadioStation) => Promise<void>;
  removeFavorite: (stationId: string) => Promise<void>;
  isFavorite: (stationId: string) => boolean;
  toggleFavorite: (station: RadioStation) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_KEY = "@kradio24_favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<RadioStation[]>([]);

  // 앱 시작 시 즐겨찾기 불러오기
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error("즐겨찾기 불러오기 오류:", error);
    }
  };

  const saveFavorites = async (newFavorites: RadioStation[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error("즐겨찾기 저장 오류:", error);
    }
  };

  const addFavorite = async (station: RadioStation) => {
    const newFavorites = [...favorites, station];
    await saveFavorites(newFavorites);
  };

  const removeFavorite = async (stationId: string) => {
    const newFavorites = favorites.filter((s) => s.id !== stationId);
    await saveFavorites(newFavorites);
  };

  const isFavorite = (stationId: string) => {
    return favorites.some((s) => s.id === stationId);
  };

  const toggleFavorite = async (station: RadioStation) => {
    if (isFavorite(station.id)) {
      await removeFavorite(station.id);
    } else {
      await addFavorite(station);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
}