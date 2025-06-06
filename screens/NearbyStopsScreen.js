import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { getNearbyStops } from '../services/nearbyStops';

export default function NearbyStopsScreen({ navigation }) {
  const [nearbyStops, setNearbyStops] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStops = async () => {
    setError('');
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const stops = await getNearbyStops(
        location.coords.latitude,
        location.coords.longitude,
        0.5
      );
      setNearbyStops(stops);
    } catch (err) {
      setError('Failed to fetch bus stops: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStops();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚏 Nearby Bus Stops</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <ActivityIndicator size="large" color="#007bff" /> : null}

      <FlatList
        data={nearbyStops}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.stopName}>{item.name}</Text>
            <Text style={styles.stopInfo}>Distance: {item.distance.toFixed(2)} km</Text>
          </View>
        )}
        ListEmptyComponent={
          !loading && !error && (
            <Text style={styles.emptyText}>No nearby bus stops found.</Text>
          )
        }
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchStops}>
          <Text style={styles.buttonText}>🔄 Refresh</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => navigation.navigate('LiveBusMap')}
        >
          <Text style={styles.buttonText}>🗺️ Live Bus Map</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  stopName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  stopInfo: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  mapButton: {
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});