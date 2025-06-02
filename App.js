import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import NearbyStopsScreen from './screens/NearbyStopsScreen';
import LiveBusMapScreen from './screens/LiveBusMapScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="NearbyStops">
        <Stack.Screen name="NearbyStops" component={NearbyStopsScreen} />
        <Stack.Screen
          name="LiveBusMap"
          component={LiveBusMapScreen}
          options={{ title: 'Live Bus Map' }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
