import React, { useState, useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, Platform } from 'react-native';
import {
  NativeAd,
  NativeAdView,
  NativeMediaView,
  TestIds,
} from 'react-native-google-mobile-ads';

// 네이티브 광고 아이템 높이 (StationRow와 동일)
export const NATIVE_AD_HEIGHT = 80;

interface NativeAdCardProps {
  adIndex: number;
}

export default function NativeAdCard({ adIndex }: NativeAdCardProps) {
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const adUnitId = __DEV__
    ? TestIds.NATIVE
    : Platform.select({
        ios: 'ca-app-pub-8989747852708874/7398406617', // TODO: 실제 ID로 교체
        android: 'ca-app-pub-8989747852708874/2634817484', // TODO: 실제 ID로 교체
      }) ?? TestIds.NATIVE;

  useEffect(() => {
    let isMounted = true;

    const loadAd = async () => {
      try {
        const ad = await NativeAd.createForAdRequest(adUnitId, {
          requestNonPersonalizedAdsOnly: false,
        });

        if (isMounted) {
          setNativeAd(ad);
          setIsLoading(false);
        }
      } catch (err) {
        console.log('Native ad load error:', err);
        if (isMounted) {
          setError(true);
          setIsLoading(false);
        }
      }
    };

    loadAd();

    return () => {
      isMounted = false;
      nativeAd?.destroy();
    };
  }, [adUnitId]);

  // 광고 로드 실패 시 빈 공간 표시 안함
  if (error) {
    return null;
  }

  // 로딩 중
  if (isLoading || !nativeAd) {
    return (
      <View className="px-4 pb-1">
        <View
          className="bg-zinc-800 rounded-xl px-4 py-3 flex-row items-center justify-center border border-zinc-700"
          style={{ minHeight: NATIVE_AD_HEIGHT - 8 }}
        >
          <ActivityIndicator size="small" color="#10b981" />
          <Text className="text-zinc-400 text-xs ml-2">광고 로딩 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="px-4 pb-1">
      <NativeAdView nativeAd={nativeAd}>
        <View
          className="bg-zinc-800 rounded-xl px-4 py-3 flex-row items-center border border-zinc-700"
          style={{ minHeight: NATIVE_AD_HEIGHT - 8 }}
        >
          {/* 광고 아이콘/이미지 */}
          <View className="w-14 h-14 bg-zinc-700 rounded items-center justify-center mr-3 overflow-hidden">
            {nativeAd.icon?.url ? (
              <Image
                source={{ uri: nativeAd.icon.url }}
                style={{ width: 56, height: 56 }}
                resizeMode="cover"
              />
            ) : (
              <NativeMediaView style={{ width: 56, height: 56 }} />
            )}
          </View>

          {/* 광고 정보 */}
          <View className="flex-1">
            <Text className="font-semibold text-white" numberOfLines={1}>
              {nativeAd.headline || '광고'}
            </Text>
            <Text className="text-zinc-300 text-sm" numberOfLines={1}>
              {nativeAd.body || nativeAd.advertiser || ''}
            </Text>
          </View>

          {/* 광고 라벨 */}
          <View className="bg-yellow-600/80 px-2 py-0.5 rounded">
            <Text className="text-white text-xs font-medium">AD</Text>
          </View>
        </View>
      </NativeAdView>
    </View>
  );
}
