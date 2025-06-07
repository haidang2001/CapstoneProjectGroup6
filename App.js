import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import LiveBusMapScreen from './screens/LiveBusMapScreen';
import RouteScreen from './screens/RouteScreen';
import FavoriteStopsScreen from './screens/FavoriteStopsScreen';
import SettingsScreen from './screens/SettingsScreen';
import FeedbackScreen from './screens/FeedbackScreen';

const Stack = createStackNavigator();

export default function App() {
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
