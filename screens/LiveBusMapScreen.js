import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";
import stops from "../assets/stops.json";
import { ensureRecentData, getCachedArrivals } from "../services/arrivalTimes";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LiveBusMapScreen() {
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState("");
  const [nearbyStops, setNearbyStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const mapRef = useRef(null);
  const [favoriteStops, setFavoriteStops] = useState([]);

  const handleStopPress = async (stop) => {
    setSelectedStop(null); // Clear the previous stop and force spinner
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
    await ensureRecentData(); // Refresh if needed
    return getCachedArrivals(stopId); // Get arrivals from cached data
  };

  const fetchLocationAndNearbyStops = async () => {
    setLoading(true);
    setError("");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permission to access location was denied");
      }

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
      ensureRecentData(); // Refresh cache silently in background
    }, 60000); // Every 60 seconds

    return () => clearInterval(interval); // Cleanup
  }, []);

  useEffect(() => {
    // Load favorite stops from AsyncStorage
    const loadFavorites = async () => {
      try {
        const favs = await AsyncStorage.getItem('favoriteStops');
        if (favs) setFavoriteStops(JSON.parse(favs));
      } catch {}
    };
    loadFavorites();
  }, []);

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
      >
        {nearbyStops.map((stop) => (
          <Marker
            key={stop.stop_id}
            coordinate={{
              latitude: parseFloat(stop.lat),
              longitude: parseFloat(stop.lon),
            }}
            title={stop.name}
            description={`Stop ID: ${stop.stop_id}`}
            onPress={() => handleStopPress(stop)}
          >
            <View style={styles.stopMarker} />
          </Marker>
        ))}
      </MapView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              backgroundColor: "transparent",
            }}
          >
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: "white",
                  padding: 20,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ fontSize: 18, fontWeight: "bold", flex: 1 }}>
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

                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={{ color: "blue", marginTop: 20 }}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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
  stopMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "green", // Changed to green
    borderWidth: 2,
    borderColor: "white",
  },
  map: {
    flex: 1,
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
  locateButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    backgroundColor: "#007bff",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
