import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

// Splash screen component with Lottie animation
// Displays bus animation and calls callback when complete
export default function AppSplashScreen({ onAnimationFinish }) {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/bus-animation.json')}
        autoPlay
        loop={false}
        style={styles.animation}
        onAnimationFinish={onAnimationFinish}
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
}); # Adds empty line
