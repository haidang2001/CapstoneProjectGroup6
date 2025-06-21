import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import LiveBusMapScreen from './screens/LiveBusMapScreen';
import RouteScreen from './screens/RouteScreen';
import FavoriteStopsScreen from './screens/FavoriteStopsScreen';
import SettingsScreen from './screens/SettingsScreen';
import FeedbackScreen from './screens/FeedbackScreen';
import SplashScreenComponent from './screens/SplashScreen';
import * as SplashScreen from 'expo-splash-screen';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import RouteMapScreen from './screens/RouteMapScreen';

const Stack = createStackNavigator();
// Prevent native splash screen from auto-hiding
// SplashScreen.preventAutoHideAsync();
export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load any resources (fonts, API calls, etc.)
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return (
      <View style={styles.container}>
        <SplashScreenComponent />
      </View>
    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Route" 
          component={RouteScreen}
          options={{ title: 'Route Search' }}
        />
        <Stack.Screen 
          name="RouteMap" 
          component={RouteMapScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="FavoriteStops" 
          component={FavoriteStopsScreen}
          options={{ title: 'Favorite Stops' }}
        />
        <Stack.Screen 
          name="LiveBusMap" 
          component={LiveBusMapScreen}
          options={{ title: 'Live Bus Map' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
        <Stack.Screen 
          name="Feedback" 
          component={FeedbackScreen}
          options={{ title: 'Feedback' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});