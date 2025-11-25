import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RadioStation } from '@/types/radio';

interface StationOrderContextType {
  getOrderedStations: (stations: RadioStation[]) => RadioStation[];
  updateStationOrder: (orderedStations: RadioStation[]) => Promise<void>;
  isLoading: boolean;
}

const StationOrderContext = createContext<StationOrderContextType | undefined>(undefined);

const STORAGE_KEY = '@kradio24:station_order';

export function StationOrderProvider({ children }: { children: React.ReactNode }) {
  const [stationOrder, setStationOrder] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 저장된 순서 불러오기
  useEffect(() => {
    loadStationOrder();
  }, []);

  const loadStationOrder = async () => {
    try {
      const savedOrder = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedOrder) {
        setStationOrder(JSON.parse(savedOrder));
      }
    } catch (error) {
      console.error('Failed to load station order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 순서대로 정렬된 방송국 목록 반환
  const getOrderedStations = useCallback((stations: RadioStation[]): RadioStation[] => {
    if (stationOrder.length === 0) {
      return stations;
    }

    // 저장된 순서대로 정렬
    const ordered = [...stations].sort((a, b) => {
      const indexA = stationOrder.indexOf(a.id);
      const indexB = stationOrder.indexOf(b.id);

      // 둘 다 순서에 있으면 순서대로
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      // A만 순서에 있으면 A가 앞으로
      if (indexA !== -1) return -1;
      // B만 순서에 있으면 B가 앞으로
      if (indexB !== -1) return 1;
      // 둘 다 없으면 원래 순서 유지
      return 0;
    });

    return ordered;
  }, [stationOrder]);

  // 순서 업데이트 및 저장
  const updateStationOrder = useCallback(async (orderedStations: RadioStation[]) => {
    try {
      const newOrder = orderedStations.map(station => station.id);
      console.log('Saving new station order:', newOrder);
      setStationOrder(newOrder);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder)).then();
      console.log('Station order saved successfully.');
    } catch (error) {
      console.error('Failed to save station order:', error);
    }
  }, []);

  return (
    <StationOrderContext.Provider value={{ getOrderedStations, updateStationOrder, isLoading }}>
      {children}
    </StationOrderContext.Provider>
  );
}

export function useStationOrder() {
  const context = useContext(StationOrderContext);
  if (!context) {
    throw new Error('useStationOrder must be used within StationOrderProvider');
  }
  return context;
}
