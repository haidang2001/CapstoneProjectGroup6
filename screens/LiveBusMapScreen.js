import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert, TouchableOpacity, Platform } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

export default function LiveBusMapScreen() {
  const [busData, setBusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState('');

  const fetchLiveBusData = async () => {
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return [
        {
          id: 'bus1',
          lat: 42.9849,
          lon: -81.2453,
          route: 'Route 1',
          status: 'On time',
          routeCoords: [
            { latitude: 42.9849, longitude: -81.2453 },
            { latitude: 42.9852, longitude: -81.2468 },
            { latitude: 42.9855, longitude: -81.2500 },
          ],
        },
        {
          id: 'bus2',
          lat: 42.9855,
          lon: -81.2500,
          route: 'Route 2',
          status: 'Delayed',
          routeCoords: [
            { latitude: 42.9855, longitude: -81.2500 },
            { latitude: 42.9858, longitude: -81.2515 },
            { latitude: 42.9860, longitude: -81.2530 },
          ],
        },
      ];
    } catch (err) {
      throw new Error('Failed to fetch bus data');
    }
  };

  const loadLiveBusData = async () => {
    try {
      const data = await fetchLiveBusData();
      setBusData(data);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const getLocation = async () => {
    try {
      // 1. Check permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Permission status:', status);
      
      if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
      }

      // 2. Get current position with timeout
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000, // 15 second timeout
      });
      console.log('Location fetched:', location.coords);
      
      return location.coords;
    } catch (err) {
      console.error('Location error:', err);
      throw err;
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (Platform.OS === 'android' && !Constants.isDevice) {
        throw new Error('Location services only work on physical Android devices');
      }

      // Get user location
      const coords = await getLocation();
      setUserLocation(coords);
      
      // Load bus data
      await loadLiveBusData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRetry = () => {
    loadData();
  };

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRetry}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!userLocation) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {busData.map((bus) => (
          <React.Fragment key={bus.id}>
            <Marker
              coordinate={{ latitude: bus.lat, longitude: bus.lon }}
              title={`Bus ${bus.route}`}
              description={bus.status}
              pinColor={bus.status === 'Delayed' ? 'red' : 'green'}
            />
            <Polyline
              coordinates={bus.routeCoords}
              strokeColor="#007bff"
              strokeWidth={3}
            />
          </React.Fragment>
        ))}
      </MapView>

      <View style={styles.controls}>
        <Text style={styles.infoText}>
          {loading ? 'Updating...' : `${busData.length} buses nearby`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
  retryButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
});