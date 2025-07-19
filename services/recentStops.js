// services/recentStops.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'recentStops';

export const addToRecentStops = async (route) => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    let recent = json ? JSON.parse(json) : [];

    // Remove duplicate if exists
    recent = recent.filter(item => item.id !== route.id);
    recent.unshift(route); // Add to top
    if (recent.length > 10) recent.pop(); // Limit to 10

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
  } catch (e) {
    console.error('Error saving recent stop:', e);
  }
};

export const getRecentStops = async () => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Error reading recent stops:', e);
    return [];
  }
};
