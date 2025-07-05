import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomNav from '../components/BottomNav';
import * as MailComposer from 'expo-mail-composer';

export default function FeedbackScreen({ navigation }) {
  const sendFeedback = () => {
    MailComposer.composeAsync({
      recipients: ['tdtnguyendang@email.com'], // <-- replace with your feedback email
      subject: 'LTWatch Feedback',
      body: 'Sent from my device',
    });
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feedback</Text>
      <TouchableOpacity style={styles.button} onPress={sendFeedback}>
        <Text style={styles.buttonText}>Send Feedback</Text>
      </TouchableOpacity>
      <BottomNav navigation={navigation} current="Settings" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafcff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 