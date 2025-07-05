import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import stops from '../assets/stops.json';
import BottomNav from '../components/BottomNav';
import { MaterialIcons } from '@expo/vector-icons';

export default function FavoriteStopsScreen({ navigation }) {
  const [favoriteStops, setFavoriteStops] = useState([]);

  const loadFavorites = useCallback(async () => {
    try {
      const favs = await AsyncStorage.getItem('favoriteStops');
      if (favs) setFavoriteStops(JSON.parse(favs));
      else setFavoriteStops([]);
    } catch {
      setFavoriteStops([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const removeFavorite = async (stopId) => {
    const updated = favoriteStops.filter(id => id !== stopId);
    setFavoriteStops(updated);
    await AsyncStorage.setItem('favoriteStops', JSON.stringify(updated));
  };

  const favoriteStopObjs = stops.filter(stop => favoriteStops.includes(stop.stop_id));

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Favorite Stops</Text> */}
      {favoriteStopObjs.length === 0 ? (
        <Text style={styles.emptyText}>No favorite stops yet.</Text>
      ) : (
        <FlatList
          data={favoriteStopObjs}
          keyExtractor={item => item.stop_id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('LiveBusMap', { stop: item })}>
              <View style={styles.stopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stopName}>{item.name}</Text>
                </View>
                <TouchableOpacity onPress={() => removeFavorite(item.stop_id)}>
                  <MaterialIcons name="delete" size={24} color="#d00" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
      <BottomNav navigation={navigation} current="FavoriteStops" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafcff',
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 40,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  stopName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
  },
  stopId: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
}); 