import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RecentStopsScreen({ navigation }) {
  const [recentStops, setRecentStops] = useState([]);

  useEffect(() => {
    const loadRecentStops = async () => {
      try {
        const stops = await AsyncStorage.getItem('recentStops');
        if (stops) {
          setRecentStops(JSON.parse(stops));
        }
      } catch (error) {
        console.error('Error loading recent stops:', error);
      }
    };

    loadRecentStops();
  }, []);

  const clearRecentStops = async () => {
    try {
      await AsyncStorage.removeItem('recentStops');
      setRecentStops([]);
    } catch (error) {
      console.error('Error clearing recent stops:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recently Viewed Stops</Text>
        {recentStops.length > 0 && (
          <TouchableOpacity onPress={clearRecentStops}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {recentStops.length > 0 ? (
        <FlatList
          data={recentStops}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.stopItem}
              onPress={() => navigation.navigate('Map', { stopId: item.id })}
            >
              <Icon name="directions-bus" size={24} color="#3498db" />
              <View style={styles.stopInfo}>
                <Text style={styles.stopName}>{item.name}</Text>
                <Text style={styles.stopRoutes}>Routes: {item.routes.join(', ')}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#CCCCCC" />
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="info-outline" size={50} color="#CCCCCC" />
          <Text style={styles.emptyText}>No recently viewed stops</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
  },
  clearText: {
    color: '#3498db',
    fontSize: 16,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  stopInfo: {
    flex: 1,
    marginLeft: 15,
  },
  stopName: {
    fontSize: 18,
    color: '#333333',
  },
  stopRoutes: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 15,
    fontSize: 18,
    color: '#666666',
  },
});