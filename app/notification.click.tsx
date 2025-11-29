import React, { useEffect } from 'react';
import {useRouter, useSegments} from 'expo-router';
import { useAudio } from '@/contexts/AudioContext';
import {View} from "react-native";

export default function NotificationRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (router.canGoBack()) {
      router.back()
    }
  },[router])


  return <View className={"bg-zinc-950 h-screen w-full"}></View>;
}

