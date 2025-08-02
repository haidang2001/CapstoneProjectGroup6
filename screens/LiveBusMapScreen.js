import React, { useEffect, useState, useRef, useContext } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Image,
} from "react-native";
import { ScrollView } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import stops from "../assets/stops.json";
import { ensureRecentData, getCachedArrivals } from "../services/arrivalTimes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../ThemeContext";
import darkMapStyle from "../assets/darkMapStyle.json";
// import { reportStop, reportStopInUse } from "../services/firebaseReports";
import { reportStopStatus, checkStopStatus } from "../services/firebaseReports";
import {
  reportBusCrowded,
  getCrowdedReportCount,
} from "../services/firebaseReports";

export default function LiveBusMapScreen({ route, navigation }) {
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState("");
  const [nearbyStops, setNearbyStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [favoriteStops, setFavoriteStops] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("Never refreshed");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stopWarning, setStopWarning] = useState(false);
  const mapRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  // Remove bus position state, fetch, and markers

  // const handleStopPress = async (stop) => {
  //   setSelectedStop({ ...stop, arrivals: [], status: "loading" });
  //   setModalVisible(true);

  //   const [arrivals, status] = await Promise.all([
  //     fetchArrivalTimesForStop(stop.stop_id),
  //     checkStopStatus(stop.stop_id),
  //   ]);

  //   setSelectedStop((prev) => ({
  //     ...prev,
  //     arrivals,
  //     status,
  //   }));
  // };

  const handleStopPress = async (stop) => {
    setModalVisible(true);
    setStopWarning(false); // reset warning first
    setSelectedStop({ ...stop, arrivals: [], status: "loading" });

    try {
      const [arrivals, status] = await Promise.all([
        fetchArrivalTimesForStop(stop.stop_id),
        checkStopStatus(stop.stop_id),
      ]);

      setSelectedStop({
        ...stop,
        arrivals,
        status,
      });

      if (status.notInUseReports >= 3) {
        setStopWarning(true);
      }
    } catch (error) {
      console.error("Error loading stop info:", error);
      setSelectedStop({ ...stop, arrivals: [], status: "error" });
    }
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
    const arrivals = await getCachedArrivals(stopId);

    const enrichedArrivals = await Promise.all(
      arrivals.map(async (arrival) => {
        const crowdedCount = await getCrowdedReportCount(arrival.route, stopId);
        return {
          ...arrival,
          crowded: crowdedCount >= 3,
        };
      })
    );

    return enrichedArrivals;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await ensureRecentData(true);
      setLastUpdated(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );

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
      if (status !== "granted")
        throw new Error("Permission to access location was denied");

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
      setLastUpdated(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch (err) {
      setError(err.message);
      setUserLocation(null);
    } finally {
      setLoading(false);
    }
  };

  // Remove bus position state, fetch, and markers

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
        const favs = await AsyncStorage.getItem("favoriteStops");
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
        mapRef.current.animateToRegion(
          { ...region, latitudeDelta: 0.005, longitudeDelta: 0.005 },
          1000
        );
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

  // Remove bus position state, fetch, and markers

  const isFavorite = (stopId) => favoriteStops.includes(stopId);

  const toggleFavorite = async (stop) => {
    let updatedFavorites;
    if (isFavorite(stop.stop_id)) {
      updatedFavorites = favoriteStops.filter((id) => id !== stop.stop_id);
    } else {
      updatedFavorites = [...favoriteStops, stop.stop_id];
    }
    setFavoriteStops(updatedFavorites);
    await AsyncStorage.setItem(
      "favoriteStops",
      JSON.stringify(updatedFavorites)
    );
  };

  if (error) {
    return (
      <View
        style={[
          styles.centeredContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <Text style={[styles.errorText, { color: theme.text }]}>{error}</Text>
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
      <View
        style={[
          styles.centeredContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.button} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Getting your location...
        </Text>
      </View>
    );
  }
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Last Updated Timestamp */}
      <Animated.View
        style={[
          styles.timestampContainer,
          { opacity: fadeAnim, backgroundColor: theme.card },
        ]}
      >
        <Ionicons name="time-outline" size={16} color={theme.text} />
        <Text style={[styles.timestampText, { color: theme.text }]}>
          Updated: {lastUpdated}
        </Text>
        {isRefreshing && (
          <ActivityIndicator
            size="small"
            color={theme.text}
            style={styles.refreshSpinner}
          />
        )}
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
        customMapStyle={theme.background === "#181818" ? darkMapStyle : []}
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
            <View
              style={[
                styles.stopMarker,
                { backgroundColor: isFavorite(stop.stop_id) ? "red" : "green" },
              ]}
            />
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
              <View
                style={[styles.modalContent, { backgroundColor: theme.card }]}
              >
                {/* Header: Stop Title + Favorite */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    Arrival Times for {selectedStop?.name}
                  </Text>
                  {selectedStop && (
                    <TouchableOpacity
                      onPress={() => toggleFavorite(selectedStop)}
                    >
                      <MaterialIcons
                        name={
                          isFavorite(selectedStop.stop_id)
                            ? "favorite"
                            : "favorite-border"
                        }
                        size={28}
                        color={
                          isFavorite(selectedStop.stop_id) ? "red" : "#aaa"
                        }
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {/* ⚠️ Warning if reported not in use */}
                {stopWarning && (
                  <Text
                    style={{
                      color: "red",
                      fontWeight: "bold",
                      marginBottom: 10,
                    }}
                  >
                    ⚠️ This stop is potentially not in use.
                  </Text>
                )}

                {/* 🚍 Arrival List */}
                {selectedStop?.arrivals ? (
                  <ScrollView style={{ maxHeight: 300 }}>
                    {selectedStop.arrivals.length > 0 ? (
                      selectedStop.arrivals.map((arrival, index) => (
                        <View
                          key={index}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: theme.card,
                            paddingVertical: 10,
                            paddingHorizontal: 10,
                            borderBottomWidth: 0.5,
                            borderBottomColor: "#ccc",
                            borderRadius: 8,
                            marginBottom: 6,
                          }}
                        >
                          {/* Left: Route Number */}
                          <Text
                            style={{
                              fontWeight: "bold",
                              color: theme.text,
                              fontSize: 16,
                              width: 50,
                            }}
                          >
                            {arrival.route}
                          </Text>

                          {/* Center: Destination + Info */}
                          <View style={{ flex: 1, paddingHorizontal: 8 }}>
                            <Text
                              style={{
                                color: theme.text,
                                fontSize: 15,
                                fontWeight: "600",
                              }}
                            >
                              {arrival.headsign || "Bus Destination"}
                            </Text>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginTop: 2,
                              }}
                            >
                              <Text style={{ color: "#4CAF50" }}>
                                Next bus in {arrival.inMinutes} min
                              </Text>
                              {arrival.crowded && (
                                <Text
                                  style={{
                                    color: "white",
                                    backgroundColor: "red",
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    borderRadius: 4,
                                    marginLeft: 8,
                                    fontSize: 11,
                                    fontWeight: "bold",
                                  }}
                                >
                                  Crowded
                                </Text>
                              )}
                            </View>
                          </View>

                          {/* Right: Report Crowded */}
                          <TouchableOpacity
                            onPress={() =>
                              reportBusCrowded(
                                arrival.route,
                                selectedStop.stop_id
                              )
                            }
                            style={{
                              backgroundColor: "orange",
                              paddingVertical: 6,
                              paddingHorizontal: 12,
                              borderRadius: 6,
                            }}
                          >
                            <Text
                              style={{
                                color: "white",
                                fontWeight: "bold",
                                fontSize: 12,
                              }}
                            >
                              Crowded
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))
                    ) : (
                      <Text style={{ color: theme.text }}>
                        No upcoming buses in the next hour.
                      </Text>
                    )}
                  </ScrollView>
                ) : (
                  <ActivityIndicator size="small" color={theme.button} />
                )}

                {/* 🧾 Stop Status Reporting */}
                <View style={{ marginTop: 20 }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: theme.text,
                      marginBottom: 6,
                    }}
                  >
                    Report Stop Status:
                  </Text>
                  <TouchableOpacity
                    onPress={() => reportStop(selectedStop?.stop_id)}
                  >
                    <Text style={{ color: "red", fontWeight: "bold" }}>
                      Report Stop Not In Use
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => reportStopInUse(selectedStop?.stop_id)}
                  >
                    <Text
                      style={{
                        color: "green",
                        fontWeight: "bold",
                        marginTop: 10,
                      }}
                    >
                      Report Stop As In Use
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 🔁 Refresh + Close */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <Ionicons
                      name="refresh"
                      size={20}
                      color={isRefreshing ? "#aaa" : theme.button}
                    />
                    <Text
                      style={[
                        styles.refreshButtonText,
                        { color: theme.button },
                      ]}
                    >
                      Refresh
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={{ color: theme.button }}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Current Location Button */}
      <TouchableOpacity
        style={[styles.locateButton, { backgroundColor: theme.button }]}
        onPress={() => {
          navigation.setParams({ stop: null });
          fetchLocationAndNearbyStops();
        }}
      >
        <MaterialIcons name="my-location" size={24} color={theme.buttonText} />
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
  timestampContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  timestampText: {
    color: "white",
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
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshButtonText: {
    color: "#007AFF",
    marginLeft: 8,
  },
  closeButtonText: {
    color: "blue",
  },
  locateButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#007bff",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  floatingRefresh: {
    position: "absolute",
    bottom: 90,
    right: 20,
    backgroundColor: "#007bff",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
