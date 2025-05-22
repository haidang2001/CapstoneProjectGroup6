import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import NearbyStopsScreen from './screens/NearbyStopsScreen';
import MapScreen from './screens/MapScreen';
import RecentStopsScreen from './screens/RecentStopsScreen';
import SplashScreenComponent from './screens/SplashScreen';

const Stack = createStackNavigator();

// Prevent native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load any resources here (fonts, API calls, etc.)
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate loading
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
      <Stack.Navigator 
        initialRouteName="Map"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#3498db',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Map" 
          component={MapScreen} 
          options={{ title: 'Live Bus Map' }} 
        />
        <Stack.Screen 
          name="NearbyStops" 
          component={NearbyStopsScreen} 
          options={{ title: 'Nearby Stops' }} 
        />
        <Stack.Screen 
          name="RecentStops" 
          component={RecentStopsScreen} 
          options={{ title: 'Recent Stops' }} 
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
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