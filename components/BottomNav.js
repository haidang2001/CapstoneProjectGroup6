import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const navItems = [
  { label: 'Home', icon: '🏠', route: 'Home' },
  { label: 'Route', icon: '🗂️', route: 'Route' },
  { label: 'Favorite', icon: '⭐', route: 'FavoriteStops' },
  { label: 'Maps', icon: '🗺️', route: 'LiveBusMap' },
  { label: 'Setting', icon: '⚙️', route: 'Settings' },
];

export default function BottomNav({ navigation, current }) {
  return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={styles.navItem}
          onPress={() => navigation.navigate(item.route)}
        >
          <Text style={styles.navIcon}>{item.icon}</Text>
          <Text style={current === item.route ? styles.navLabelActive : styles.navLabel}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    borderTopWidth: 1,
    borderTopColor: '#ececec',
    backgroundColor: '#fff',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 13,
    color: '#7a8599',
  },
  navLabelActive: {
    fontSize: 13,
    color: '#222',
    fontWeight: 'bold',
  },
}); 