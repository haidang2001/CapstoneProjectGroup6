import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import * as SplashScreen from 'expo-splash-screen';

// Prevent native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function AppSplashScreen({ onAnimationFinish }) {
  useEffect(() => {
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
      if (onAnimationFinish) {
        onAnimationFinish();
      }
    };

    // Hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      hideSplash();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/bus-animation.json')}
        autoPlay
        loop={false}
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  animation: {
    width: 300,
    height: 300,
  },
});