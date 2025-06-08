import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import MapView, { Marker, Polyline, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import routes from '../assets/routes.json';
import trips from '../assets/trips.json';
import stopTimes from '../assets/stop_times.json';
import stops from '../assets/stops.json';
import shapes from '../assets/shapes.json';

const { width } = Dimensions.get('window');

export default function RouteMapScreen({ route, navigation }) {
  const { routeId } = route.params;
  const [routeData, setRouteData] = useState(null);
  const [routeStops, setRouteStops] = useState([]);
  const [polylineCoords, setPolylineCoords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Find the route
    const r = routes.find(r => r.id === routeId || r.route_id === routeId);
    setRouteData(r);
    console.log('Selected route:', r);
    if (!r) return;

    // 2. Find a trip for this route (use the first one)
    const trip = trips.find(t => t.route_id === routeId || t.route_id === r.route_id || t.route_id === r.id);
    console.log('Selected trip:', trip);
    if (!trip) return;

    // 3. Get the shape points for this trip
    const shapePoints = Array.isArray(shapes[trip.shape_id])
      ? shapes[trip.shape_id]
          .sort((a, b) => a.sequence - b.sequence)
          .map(pt => ({
            latitude: pt.lat,
            longitude: pt.lon
          }))
      : [];
    console.log('Shape points:', shapePoints);

    setPolylineCoords(shapePoints);

    // 4. Get stop_times for this trip, ordered by stop_sequence
    const times = stopTimes
      .filter(st => st.trip_id === trip.trip_id)
      .sort((a, b) => parseInt(a.stop_sequence) - parseInt(b.stop_sequence));
    console.log('Stop times:', times);

    // 5. Get stop details for each stop_time
    const stopsForRoute = times.map(st => stops.find(s => s.stop_id === st.stop_id)).filter(Boolean);
    console.log('Stops for route:', stopsForRoute);
    if (stopsForRoute.length > 0) {
      console.log('First stop coordinates:', stopsForRoute[0].lat, stopsForRoute[0].lon,stopsForRoute[0].name);
      console.log('Parsed first stop coordinates:', parseFloat(stopsForRoute[0].lat), parseFloat(stopsForRoute[0].lon));
    }

    setRouteStops(stopsForRoute);

    setLoading(false);
  }, [routeId]);

  if (loading || !routeData) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
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
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#222" />
        </TouchableOpacity>
        <View style={[styles.circle, { backgroundColor: `#${routeData.color}` }]}> 
          <Text style={styles.circleText}>{parseInt(routeData.id, 10)}</Text>
        </View>
        <Text style={styles.routeName} numberOfLines={1}>{routeData.longName}</Text>
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
            key={stop.stop_id}
            coordinate={{ latitude: parseFloat(stop.lat), longitude: parseFloat(stop.lon) }}
            title={stop.name}
            description={`Stop #${idx + 1}`}
            tracksViewChanges={false}
            zIndex={999}
            flat={true}
            onCalloutPress={() => {}}
          >
            <Callout>
              <View style={{ backgroundColor: 'white', padding: 10, borderRadius: 5, minWidth: 80, minHeight: 40 }}>
                <Text style={{ fontWeight: 'bold', color: 'black' }}>{stop.name}</Text>
                <Text style={{ color: 'black' }}>Stop #{idx + 1}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
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
}); 