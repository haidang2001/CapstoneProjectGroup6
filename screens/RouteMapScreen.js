import React, { useEffect, useState, useRef, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, Alert, Image } from 'react-native';
import MapView, { Marker, Polyline, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import routes from '../assets/routes.json';
import trips from '../assets/trips.json';
import stopTimes from '../assets/stop_times.json';
import stops from '../assets/stops.json';
import shapes from '../assets/shapes.json';
import darkMapStyle from '../assets/darkMapStyle.json';
import { Platform } from 'react-native';
import { ThemeContext } from '../ThemeContext';

const { width } = Dimensions.get('window');

export default function RouteMapScreen({ route, navigation }) {
  const { theme } = useContext(ThemeContext);
  const { routeId } = route.params;
  const [routeData, setRouteData] = useState(null);
  const [routeStops, setRouteStops] = useState([]);
  const [polylineCoords, setPolylineCoords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busPositions, setBusPositions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [tripId, setTripId] = useState(null);

  // Fetch real-time bus positions for this route and trip
  const fetchBusPositions = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('http://gtfs.ltconline.ca/Vehicle/VehiclePositions.json');
      const data = await response.json();
      // Filter buses by routeId (route_id in vehicle.trip)
      const filtered = (data?.entity || []).filter(
        bus => bus.vehicle?.trip?.route_id === routeId || bus.vehicle?.trip?.route_id === String(routeId)
      );
      setBusPositions(filtered);
    } catch (error) {
      console.error('Failed to fetch bus positions:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // 1. Find the route
    const r = routes.find(r => r.id === routeId || r.route_id === routeId);
    setRouteData(r);
    if (!r) return;

    // 2. Find all trips for this route
    const routeTrips = trips.filter(t => t.route_id === routeId || t.route_id === r.route_id || t.route_id === r.id);
    if (!routeTrips.length) return;

    // 3. Pick the trip with the longest shape (most shape points)
    let longestTrip = null;
    let maxPoints = 0;
    for (const trip of routeTrips) {
      const shapeArr = Array.isArray(shapes[trip.shape_id]) ? shapes[trip.shape_id] : [];
      if (shapeArr.length > maxPoints) {
        maxPoints = shapeArr.length;
        longestTrip = trip;
      }
    }
    if (!longestTrip) return;
    setTripId(longestTrip.trip_id);

    // 4. Get the shape points for this trip
    const shapePoints = Array.isArray(shapes[longestTrip.shape_id])
      ? shapes[longestTrip.shape_id]
          .sort((a, b) => a.sequence - b.sequence)
          .map(pt => ({
            latitude: pt.lat,
            longitude: pt.lon
          }))
      : [];

    setPolylineCoords(shapePoints);

    // 5. Get stop_times for this trip, ordered by stop_sequence
    const times = stopTimes
      .filter(st => st.trip_id === longestTrip.trip_id)
      .sort((a, b) => parseInt(a.stop_sequence) - parseInt(b.stop_sequence));

    // 6. Get stop details for each stop_time
    const stopsForRoute = times.map(st => stops.find(s => s.stop_id === st.stop_id)).filter(Boolean);
    if (stopsForRoute.length > 0) {
      console.log('First stop coordinates:', stopsForRoute[0].lat, stopsForRoute[0].lon,stopsForRoute[0].name);
      console.log('Parsed first stop coordinates:', parseFloat(stopsForRoute[0].lat), parseFloat(stopsForRoute[0].lon));
    }

    setRouteStops(stopsForRoute);

    setLoading(false);
  }, [routeId]);

  useEffect(() => {
    fetchBusPositions();
  }, [routeId]);

  if (loading || !routeData) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.button} />
      </View>
    );
  }

  // Center map on first stop or polyline point
  const initialRegion = (
    polylineCoords.length > 0 ? polylineCoords[0] :
    routeStops.length > 0 ? { latitude: parseFloat(routeStops[0].lat), longitude: parseFloat(routeStops[0].lon) } :
    { latitude: 42.9849, longitude: -81.2453 }
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header - always light */}
      <View style={[styles.header, { backgroundColor: '#f5f5f5' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#222" />
        </TouchableOpacity>
        <View style={[styles.circle, { backgroundColor: `#${routeData.color}` }]}>
          <Text style={[styles.circleText, { color: '#222' }]}>{parseInt(routeData.id, 10)}</Text>
        </View>
        <Text style={[styles.routeName, { color: '#222' }]} numberOfLines={1}>{routeData.longName}</Text>
      </View>
      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: initialRegion.latitude,
          longitude: initialRegion.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        customMapStyle={theme.background === '#181818' ? darkMapStyle : []}
        zoomEnabled={true}
        scrollEnabled={true}
      >
        {polylineCoords.length > 1 && (
          <Polyline
            coordinates={polylineCoords}
            strokeColor={`#${routeData.color}`}
            strokeWidth={4}
          />
        )}
        {routeStops.map((stop, idx) => (
          <Marker
            key={`${stop.stop_id}_${idx}`}
            coordinate={{ latitude: parseFloat(stop.lat), longitude: parseFloat(stop.lon) }}
            title={Platform.OS === 'android' ? stop.name : undefined}
            description={Platform.OS === 'android' ? `Stop #${idx + 1}` : undefined}
          >
            {Platform.OS === 'ios' && (
              <Callout tooltip={false}>
                 <View style={{ backgroundColor: 'white', padding: 10, borderRadius: 5, minWidth: 80, minHeight: 40 }}>
                <Text style={{ fontWeight: 'bold', color: 'black' }}>{stop.name}</Text>
                <Text style={{ color: 'black' }}>Stop #{idx + 1}</Text>
              </View>
              </Callout>
            )}
          </Marker>
        ))}
        {/* Bus Markers */}
        {busPositions.map((bus, idx) => (
          bus.vehicle?.position && (
            <Marker
              key={`${bus.id || bus.vehicle.vehicle.id}_${idx}`}
              coordinate={{
                latitude: bus.vehicle.position.latitude,
                longitude: bus.vehicle.position.longitude,
              }}
              title={`Bus ${bus.vehicle.vehicle.id}`}
            >
              <Image source={require('../assets/bus-stop.png')} style={{ width: 32, height: 32 }} />
            </Marker>
          )
        ))}
      </MapView>
      {/* Floating Refresh Button */}
      <TouchableOpacity
        style={[styles.floatingRefresh, { backgroundColor: theme.button }]}
        onPress={fetchBusPositions}
        disabled={refreshing}
      >
        {refreshing ? (
          <ActivityIndicator size="small" color={theme.buttonText} />
        ) : (
          <Ionicons name="refresh" size={28} color={theme.buttonText} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    zIndex: 2,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    marginRight: 8,
    padding: 4,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  circleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  routeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    maxWidth: width - 120,
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingRefresh: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007bff',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
}); 