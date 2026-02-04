import * as Network from 'expo-network';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text, useThemeColor } from '@/components/Themed';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const bannerBg = useThemeColor({}, 'banner');
  const bannerTextColor = useThemeColor({}, 'bannerText');

  useEffect(() => {
    const checkNetwork = async () => {
      const state = await Network.getNetworkStateAsync();
      const offline = !(state.isConnected && state.isInternetReachable);
      setIsOffline(offline);
    };

    checkNetwork();

    const subscription = Network.addNetworkStateListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable);
      setIsOffline(offline);
    });

    return () => subscription.remove();
  }, []);

  if (!isOffline) return null;

  return (
    <View style={[styles.banner, { backgroundColor: bannerBg }]}>
      <Text style={[styles.text, { color: bannerTextColor }]}>
        You're offline — cached verses only
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});
