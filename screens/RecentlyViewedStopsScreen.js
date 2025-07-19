import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getRecentStops } from '../services/recentStops';
import BottomNav from '../components/BottomNav';
import { ThemeContext } from '../ThemeContext';

export default function RecentlyViewedStopsScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const [recentStops, setRecentStops] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getRecentStops();
      setRecentStops(data);
    };

    const unsubscribe = navigation.addListener('focus', fetchData);
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: theme.card }]}
      onPress={() => navigation.navigate('RouteMap', { routeId: item.id })}
    >
      <View style={[styles.circle, { backgroundColor: `#${item.color}` }]}>
        <Text style={[styles.circleText, { color: theme.text }]}>{parseInt(item.id, 10)}</Text>
      </View>
      <Text style={[styles.name, { color: theme.text }]}>{item.longName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Recently Viewed Routes</Text>
      <FlatList
        data={recentStops}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      <BottomNav navigation={navigation} current="Recent" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 12,
    textAlign: 'center',
  },
  list: { paddingBottom: 80 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    padding: 14,
    borderRadius: 10,
    elevation: 1,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  circleText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
});
