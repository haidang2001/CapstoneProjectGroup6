import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import stops from "../assets/stops.json";
import { ensureRecentData, getCachedArrivals } from "../services/arrivalTimes";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LiveBusMapScreen({ route, navigation }) {
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState("");
  const [nearbyStops, setNearbyStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [favoriteStops, setFavoriteStops] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("Never refreshed");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mapRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleStopPress = async (stop) => {
    setSelectedStop(null);
    setModalVisible(true);
    const arrivals = await fetchArrivalTimesForStop(stop.stop_id);
    setSelectedStop({ ...stop, arrivals });
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const fetchArrivalTimesForStop = async (stopId) => {
    await ensureRecentData();
    return getCachedArrivals(stopId);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.5, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    try {
      await ensureRecentData(true);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      
      if (selectedStop) {
        const arrivals = await fetchArrivalTimesForStop(selectedStop.stop_id);
        setSelectedStop({ ...selectedStop, arrivals });
      }
      
      if (!route.params?.stop) {
        await fetchLocationAndNearbyStops();
      }
    } catch (err) {
      console.error("Refresh failed:", err);
      setLastUpdated("Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchLocationAndNearbyStops = async () => {
    if (route.params?.stop) return;
    
    setLoading(true);
    setError("");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") throw new Error("Permission to access location was denied");

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
      });

      const currentUserLocation = location.coords;
      setUserLocation(currentUserLocation);

      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: currentUserLocation.latitude,
            longitude: currentUserLocation.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          },
          1000
        );
      }

      const radius = 2000;
      const filtered = stops.filter((stop) => {
        const distance = calculateDistance(
          currentUserLocation.latitude,
          currentUserLocation.longitude,
          parseFloat(stop.lat),
          parseFloat(stop.lon)
        );
        return distance <= radius;
      });

      setNearbyStops(filtered);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      setError(err.message);
      setUserLocation(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocationAndNearbyStops();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      ensureRecentData();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favs = await AsyncStorage.getItem('favoriteStops');
        if (favs) setFavoriteStops(JSON.parse(favs));
      } catch {}
    };
    loadFavorites();
  }, []);

  useEffect(() => {
    const stopFromNav = route.params?.stop;
    if (stopFromNav) {
      const region = {
        latitude: parseFloat(stopFromNav.lat),
        longitude: parseFloat(stopFromNav.lon),
      };
      
      setUserLocation(region);

      if (mapRef.current) {
        mapRef.current.animateToRegion({ ...region, latitudeDelta: 0.005, longitudeDelta: 0.005 }, 1000);
      }
      handleStopPress(stopFromNav);

      const radius = 2000;
      const filtered = stops.filter((stop) => {
        const distance = calculateDistance(
          region.latitude,
          region.longitude,
          parseFloat(stop.lat),
          parseFloat(stop.lon)
        );
        return distance <= radius;
      });
      setNearbyStops(filtered);
      setLoading(false);
    }
  }, [route.params?.stop]);

  const isFavorite = (stopId) => favoriteStops.includes(stopId);

  const toggleFavorite = async (stop) => {
    let updatedFavorites;
    if (isFavorite(stop.stop_id)) {
      updatedFavorites = favoriteStops.filter(id => id !== stop.stop_id);
    } else {
      updatedFavorites = [...favoriteStops, stop.stop_id];
    }
    setFavoriteStops(updatedFavorites);
    await AsyncStorage.setItem('favoriteStops', JSON.stringify(updatedFavorites));
  };

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
      {/* Last Updated Timestamp */}
      <Animated.View style={[styles.timestampContainer, { opacity: fadeAnim }]}>
        <Ionicons name="time-outline" size={16} color="white" />
        <Text style={styles.timestampText}>Updated: {lastUpdated}</Text>
        {isRefreshing && <ActivityIndicator size="small" color="white" style={styles.refreshSpinner} />}
      </Animated.View>

      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        zoomEnabled
        scrollEnabled
        onMapReady={() => {
          const stopFromNav = route.params?.stop;
          if (stopFromNav) {
            const region = {
              latitude: parseFloat(stopFromNav.lat),
              longitude: parseFloat(stopFromNav.lon),
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            };
            mapRef.current.animateToRegion(region, 1000);
          }
        }}
      >
        {nearbyStops.map((stop) => (
          <Marker
            key={stop.stop_id}
            coordinate={{
              latitude: parseFloat(stop.lat),
              longitude: parseFloat(stop.lon),
            }}
            title={stop.name}
            onPress={() => handleStopPress(stop)}
          >
            <View style={[
              styles.stopMarker,
              { backgroundColor: isFavorite(stop.stop_id) ? 'red' : 'green' }
            ]} />
          </Marker>
        ))}
      </MapView>

      {/* Stop Info Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  {/* Arrival Times Section */}
                  <Text style={styles.modalTitle}>
                    Arrival Times for {selectedStop?.name}
                  </Text>
                  {selectedStop && (
                    <TouchableOpacity onPress={() => toggleFavorite(selectedStop)}>
                      <MaterialIcons
                        name={isFavorite(selectedStop.stop_id) ? 'favorite' : 'favorite-border'}
                        size={28}
                        color={isFavorite(selectedStop.stop_id) ? 'red' : '#aaa'}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {selectedStop?.arrivals ? (
                  selectedStop.arrivals.length > 0 ? (
                    selectedStop.arrivals.map((arrival, index) => (
                      <Text key={index}>
                        🚌 Route {arrival.route} → {arrival.time} (
                        {arrival.inMinutes} min)
                      </Text>
                    ))
                  ) : (
                    <Text>No upcoming buses in the next hour.</Text>
                  )
                ) : (
                  <ActivityIndicator size="small" color="#007bff" />
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.refreshButton}
                    onPress={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <Ionicons 
                      name="refresh" 
                      size={20} 
                      color={isRefreshing ? "#aaa" : "#007AFF"} 
                    />
                    <Text style={styles.refreshButtonText}>Refresh</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Current Location Button */}
      <TouchableOpacity
        style={styles.locateButton}
        onPress={() => {
          navigation.setParams({ stop: null });
          fetchLocationAndNearbyStops();
        }}
      >
        <MaterialIcons name="my-location" size={24} color="white" />
      </TouchableOpacity>

      {/* Refresh Button */}
      {/* <TouchableOpacity
        style={styles.floatingRefresh}
        onPress={handleRefresh}
        disabled={isRefreshing}
      >
        <Ionicons 
          name="refresh" 
          size={24} 
          color={isRefreshing ? "#aaa" : "white"} 
        />
      </TouchableOpacity> */}
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
  timestampContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timestampText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
  },
  refreshSpinner: {
    marginLeft: 10,
  },
  stopMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "white",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
  },
  retryText: {
    color: "white",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#007AFF',
    marginLeft: 8,
  },
  closeButtonText: {
    color: 'blue',
  },
  locateButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007bff',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  floatingRefresh: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#007bff',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});