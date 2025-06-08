import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { MaterialIcons } from '@expo/vector-icons'; // For the location button icon
import stops from '../assets/stops.json'; // Import stop data

export default function LiveBusMapScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState('');
  const [nearbyStops, setNearbyStops] = useState([]);
  const mapRef = useRef(null); // Add ref for MapView

  // Haversine formula to calculate distance between two lat/lon points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in metres
    return d; // distance in meters
  };

  const fetchLocationAndNearbyStops = async () => {
    setLoading(true);
    setError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
      });
      const currentUserLocation = location.coords;
      setUserLocation(currentUserLocation);

      // Animate map to current location if ref is available
      if (mapRef.current && currentUserLocation) {
        mapRef.current.animateToRegion({
          latitude: currentUserLocation.latitude,
          longitude: currentUserLocation.longitude,
          latitudeDelta: 0.005, // Closer zoom
          longitudeDelta: 0.005, // Closer zoom
        }, 1000); // Animation duration
      }

      // Filter stops within a reasonable radius (e.g., 2000 meters = 2 km)
      const radius = 2000; 
      const filtered = stops.filter(stop => {
        const distance = calculateDistance(
          currentUserLocation.latitude,
          currentUserLocation.longitude,
          parseFloat(stop.lat),
          parseFloat(stop.lon)
        );
        return distance <= radius;
      });
      setNearbyStops(filtered);

    } catch (err) {
      setError(err.message);
      setUserLocation(null); // Clear location if error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocationAndNearbyStops();
  }, []);

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchLocationAndNearbyStops}
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
        ref={mapRef} // Assign the ref
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false} // Will use custom button instead
        zoomEnabled={true}
        scrollEnabled={true}
      >
        {nearbyStops.map((stop) => (
          <Marker
            key={stop.stop_id}
            coordinate={{ latitude: parseFloat(stop.lat), longitude: parseFloat(stop.lon) }}
            title={stop.name} // Display stop name
            description={`Stop ID: ${stop.stop_id}`}
          >
            <View style={styles.stopMarker} />
          </Marker>
        ))}
      </MapView>

      {/* Locate Me Button */}
      <TouchableOpacity 
        style={styles.locateButton}
        onPress={fetchLocationAndNearbyStops}
      >
        <MaterialIcons name="my-location" size={24} color="white" />
      </TouchableOpacity>
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
  retryButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  stopMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'green', // Changed to green
    borderWidth: 2,
    borderColor: 'white',
  },
  locateButton: {
    position: 'absolute',
    bottom: 100, // Adjust as needed to avoid overlap with bottom system gestures
    right: 20,
    backgroundColor: '#007bff',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
