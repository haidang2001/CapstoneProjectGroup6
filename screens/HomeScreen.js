import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, ScrollView } from 'react-native';
import BottomNav from '../components/BottomNav';

const cardData = [
  {
    title: 'Route Search',
    description: 'Find the best route to your destination.',
    image: require('../assets/bus-route.png'),
    onPress: 'Route',
  },
  {
    title: 'Favorite Stops',
    description: 'Keep track of your favorite stops.',
    image: require('../assets/bus-stop.png'),
    onPress: 'FavoriteStops',
  },
  {
    title: 'Live Map',
    description: 'See where your bus is in real time.',
    image: require('../assets/bus-map.png'),
    onPress: 'LiveBusMap',
  },
];

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>TransitPal</Text>
        <Text style={styles.subtitle}>Your personal transit assistant.</Text>
        <View style={styles.cardsContainer}>
          {cardData.map((card, idx) => (
            <TouchableOpacity
              key={card.title}
              style={styles.card}
              onPress={() => navigation.navigate(card.onPress)}
              activeOpacity={0.8}
            >
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDesc}>{card.description}</Text>
              </View>
              <Image source={card.image}  style={styles.cardImage} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <BottomNav navigation={navigation} current="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafcff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 12,
    color: '#222',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 24,
    marginTop: 8,
  },
  cardsContainer: {
    gap: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 15,
    color: '#4a6fa5',
  },
  cardImage: {
    width: 70,
    height: 56,
    borderRadius: 10,
    marginLeft: 16,
    backgroundColor: '#eee',

    // width: '100%',
  // aspectRatio: 16 / 9,
  resizeMode: 'contain',
  },
}); 