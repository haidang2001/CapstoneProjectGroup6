import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomNav from '../components/BottomNav';

export default function RouteScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Route Search</Text>
      <BottomNav navigation={navigation} current="Route" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafcff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
}); 