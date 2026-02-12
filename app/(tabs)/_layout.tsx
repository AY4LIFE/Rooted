import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { FocusModeOverlay } from '@/components/FocusModeOverlay';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { getFocusMode } from '@/services/focusMode';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayChecked, setOverlayChecked] = useState(false);

  const tint = Colors[colorScheme ?? 'light'].tint;
  const bg = Colors[colorScheme ?? 'light'].background;
  const border = Colors[colorScheme ?? 'light'].border;

  useEffect(() => {
    // Check focus mode on first render (entry from intro)
    getFocusMode().then((enabled) => {
      if (enabled) {
        setShowOverlay(true);
      }
      setOverlayChecked(true);
    });
  }, []);

  const handleOverlayDismiss = useCallback(() => {
    setShowOverlay(false);
  }, []);

  return (
    <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        tabBarStyle: {
          backgroundColor: bg,
          borderTopColor: border,
          borderTopWidth: 1,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
          headerRight: () => (
            <Link href="/note/new" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="plus"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      />
    </Tabs>
    {overlayChecked && (
      <FocusModeOverlay visible={showOverlay} onDismiss={handleOverlayDismiss} />
    )}
    </View>
  );
}
