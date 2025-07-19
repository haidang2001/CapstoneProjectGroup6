import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import BottomNav from '../components/BottomNav';
import { addToRecentStops } from '../services/recentStops'; // ✅ Import added

const routes = require('../assets/routes.json');

export default function RouteScreen({ navigation }) {
  const [search, setSearch] = useState('');

  const filteredRoutes = routes.filter(route =>
    route.longName.toLowerCase().includes(search.toLowerCase()) ||
    route.id.includes(search)
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.routeItem}
      onPress={() => {
        addToRecentStops(item); // ✅ Save to recent
        navigation.navigate('RouteMap', { routeId: item.id });
      }}
    >
      <View style={[styles.circle, { backgroundColor: `#${item.color}` }]}>
        <Text style={styles.circleText}>{parseInt(item.id, 10)}</Text>
      </View>
      <View style={styles.routeInfo}>
        <Text style={styles.routeName}>{item.longName}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search Route"
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#8E9BAE"
      />
      <FlatList
        data={filteredRoutes}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
      <BottomNav navigation={navigation} current="Route" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafcff',
  },
  searchBar: {
    marginTop: 50,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 20,
    backgroundColor: '#f0f4f8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 18,
    color: '#222',
  },
  listContent: {
    paddingBottom: 80,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    padding: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  circleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
  },
});
