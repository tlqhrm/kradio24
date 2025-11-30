import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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

  const addFavorite = useCallback(async (station: RadioStation) => {
    setFavorites(prev => {
      const newFavorites = [...prev, station];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  const removeFavorite = useCallback(async (stationId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.filter((s) => s.id !== stationId);
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((stationId: string) => {
    return favorites.some((s) => s.id === stationId);
  }, [favorites]);

  const toggleFavorite = useCallback(async (station: RadioStation) => {
    if (isFavorite(station.id)) {
      await removeFavorite(station.id);
    } else {
      await addFavorite(station);
    }
  }, [isFavorite, removeFavorite, addFavorite]);

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
