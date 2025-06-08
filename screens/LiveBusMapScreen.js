import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import BottomNav from '../components/BottomNav';

export default function LiveBusMapScreen({ navigation }) {
  const initialRegion = {
    latitude: 42.9856,
    longitude: -81.2453,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        zoomEnabled={true}
        scrollEnabled={true}
      />
      <BottomNav navigation={navigation} current="LiveBusMap" />
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
});
