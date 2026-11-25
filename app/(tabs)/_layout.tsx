import React, { useState, useEffect } from 'react';
import { Animated } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../src/theme/colors';
import { Motion } from '../../src/theme/motion';
import { useCartContext } from '../../src/context/CartContext';

const AnimatedTabIcon: React.FC<{
  name: React.ComponentProps<typeof MaterialIcons>['name'];
  color: string;
  size: number;
  focused: boolean;
}> = ({ name, color, size, focused }) => {
  const [scale] = useState(() => new Animated.Value(focused ? 1.12 : 1.0));

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.12 : 1.0,
      ...Motion.spring.snappy,
    }).start();
  }, [focused, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <MaterialIcons name={name} color={color} size={size} />
    </Animated.View>
  );
};

export default function TabLayout() {
  const { totalItemCount } = useCartContext();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(8, insets.bottom);
  const tabHeight = 56 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: bottomInset,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name="home"
              color={typeof color === 'string' ? color : Colors.primary}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name="grid-view"
              color={typeof color === 'string' ? color : Colors.textMuted}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarBadge: totalItemCount > 0 ? totalItemCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.secondary,
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: '800',
          },
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name="shopping-bag"
              color={typeof color === 'string' ? color : Colors.textMuted}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name="receipt-long"
              color={typeof color === 'string' ? color : Colors.textMuted}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name="person"
              color={typeof color === 'string' ? color : Colors.textMuted}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
