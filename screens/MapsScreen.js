import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function MapScreen({ navigation }) {
  const [region, setRegion] = useState(null);
  const [busLocations, setBusLocations] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch bus data from API
  const fetchBusData = async () => {
    try {
      setLoading(true);
      // Mock API call - replace with actual LTC API
      const mockBuses = [
        { 
          id: '1001', 
          position: { latitude: 42.9849, longitude: -81.2453 },
          route: '2'
        }
      ];
      
      const mockRoutes = [
        {
          id: 'route-2',
          points: [
            { lat: 42.9849, lon: -81.2453 },
            { lat: 42.9860, lon: -81.2400 }
          ]
        }
      ];

      setBusLocations(mockBuses);
      setRoutes(mockRoutes);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching bus data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get user location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
      
      await fetchBusData();
    })();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchBusData();
    }, [])
  );

  return (
    <View style={styles.container}>
      {region ? (
        <MapView
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true}
        >
          {busLocations.map(bus => (
            <Marker
              key={bus.id}
              coordinate={{
                latitude: bus.position.latitude,
                longitude: bus.position.longitude,
              }}
            >
              <View style={styles.busMarker}>
                <Icon name="directions-bus" size={24} color="#FFFFFF" />
                <Text style={styles.busRoute}>{bus.route}</Text>
              </View>
            </Marker>
          ))}

          {routes.map(route => (
            <Polyline
              key={route.id}
              coordinates={route.points.map(p => ({
                latitude: p.lat,
                longitude: p.lon
              }))}
              strokeColor="#3498db"
              strokeWidth={4}
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      )}

      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={fetchBusData}
      >
        <Icon name="refresh" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {lastUpdated && (
        <View style={styles.lastUpdated}>
          <Text style={styles.lastUpdatedText}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <LottieView
            source={require('../assets/bus-animation.json')}
            autoPlay
            loop
            style={styles.loadingAnimation}
          />
        </View>
      )}
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
  busMarker: {
    backgroundColor: '#3498db',
    padding: 5,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  busRoute: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 2
  },
  refreshButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 20,
  },
  lastUpdated: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(52, 152, 219, 0.8)',
    padding: 8,
    borderRadius: 5,
  },
  lastUpdatedText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingAnimation: {
    width: 150,
    height: 150,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});