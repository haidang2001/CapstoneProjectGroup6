// screens/NearbyStopsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { getNearbyStops } from '../services/nearbyStops';

export default function NearbyStopsScreen() {
  const [nearbyStops, setNearbyStops] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStops = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const stops = getNearbyStops(
        location.coords.latitude,
        location.coords.longitude,
        0.5 // radius in kilometers
      );
      console.log("User location:", location.coords);
      console.log("Nearby stops:", stops);
      setNearbyStops(stops);
    };

    fetchStops();
  }, []);

 


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Bus Stops</Text>
      {error ? <Text>{error}</Text> : null}
      <FlatList
        data={nearbyStops}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.item}>{item.name}</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  item: { fontSize: 16, marginBottom: 5 },
});
