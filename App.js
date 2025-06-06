import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import NearbyStopsScreen from './screens/NearbyStopsScreen';
import LiveBusMapScreen from './screens/LiveBusMapScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="NearbyStops">
        <Stack.Screen 
          name="NearbyStops" 
          component={NearbyStopsScreen}
          options={{ title: 'Nearby Bus Stops' }}
        />
        <Stack.Screen 
          name="LiveBusMap" 
          component={LiveBusMapScreen}
          options={{ title: 'Live Bus Map' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}