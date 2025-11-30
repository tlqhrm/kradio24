import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ActivityIndicator, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

interface AdBannerProps {
  onHeightChange?: (height: number) => void;
}

export default function AdBanner({ onHeightChange }: AdBannerProps) {
  const bannerRef = useRef<BannerAd>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adHeight, setAdHeight] = useState(50);

  // 높이 변경 시 부모에게 알림
  useEffect(() => {
    onHeightChange?.(adHeight);
  }, [adHeight, onHeightChange]);

  const adUnitId = __DEV__
    ? TestIds.BANNER
    : Platform.select({
        ios: 'ca-app-pub-8989747852708874/6982639498',
        android: 'ca-app-pub-8989747852708874/8920190083',
      }) ?? TestIds.BANNER;

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    bannerRef.current?.load();
  };

  return (
    <View
      className="w-full items-center justify-center relative bg-zinc-900"
      style={{ minHeight: adHeight }}
    >
      {!error && (
        <BannerAd
          ref={bannerRef}
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          onAdLoaded={(dimensions) => {
            setIsLoading(false);
            setAdLoaded(true);
            setError(null);
            if (dimensions?.height) {
              setAdHeight(dimensions.height);
            }
          }}
          onAdFailedToLoad={(err) => {
            setIsLoading(false);
            setError(err.message);
            setTimeout(handleRetry, 3000);
          }}
        />
      )}

      {isLoading && !adLoaded && !error && (
        <View className="absolute inset-0 flex-row items-center justify-center bg-zinc-900">
          <ActivityIndicator size="small" color="#10b981" />
          <Text className="text-zinc-400 text-xs ml-1.5">광고 로딩 중...</Text>
        </View>
      )}

      {error && !adLoaded && (
        <View
          className="w-full items-center justify-center bg-zinc-950"
          style={{ minHeight: adHeight }}
        >
          <Text className="text-red-400 text-xs">광고를 불러오지 못했습니다.</Text>
        </View>
      )}
    </View>
  );
}