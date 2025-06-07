import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomNav from '../components/BottomNav';

export default function SettingsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Feedback')}>
        <Text style={styles.buttonText}>💬 Feedback</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>⚙️ Settings</Text>
      </TouchableOpacity>
      <BottomNav navigation={navigation} current="Settings" />
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
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#f3f6fa',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 16,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonText: {
    fontSize: 17,
    color: '#222',
    fontWeight: '600',
  },
}); 