import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import BottomNav from '../components/BottomNav';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../ThemeContext';

export default function SettingsScreen({ navigation }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const sendFeedback = async () => {
    if (!message.trim()) {
      Alert.alert('Please enter your feedback before sending.');
      return;
    }
    setSending(true);
    try {
      await axios.post('https://formspree.io/f/mdkzvzkq', {
        message,
      });
      Alert.alert('Thank you!', 'Your feedback has been sent.');
      setMessage('');
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Error', 'Could not send feedback.');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Feedback Button */}
      <TouchableOpacity style={[styles.feedbackButton, { backgroundColor: theme.button }]} onPress={() => setModalVisible(true)}>
        <Text style={[styles.feedbackButtonText, { color: theme.buttonText }]}>Feedback</Text>
      </TouchableOpacity>
      {/* Dark Mode Toggle Button */}
      <TouchableOpacity style={[styles.feedbackButton, { backgroundColor: theme.button }]} onPress={toggleTheme}>
        <Text style={[styles.feedbackButtonText, { color: theme.buttonText }]}>Toggle Dark Mode</Text>
      </TouchableOpacity>
      {/* Feedback Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            {/* Close button in top right */}
            <TouchableOpacity
              style={styles.closeIconButton}
              onPress={() => setModalVisible(false)}
              disabled={sending}
            >
              <Ionicons name="close" size={28} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.feedbackLabel, { color: theme.text }]}>Your Feedback</Text>
            <TextInput
              style={[styles.feedbackInput, { color: theme.text, backgroundColor: theme.background }]}
              placeholder="Type your feedback here"
              placeholderTextColor={theme.text + '99'}
              value={message}
              onChangeText={setMessage}
              multiline
              editable={!sending}
            />
            <TouchableOpacity
              style={[styles.feedbackButton, { backgroundColor: theme.button }]}
              onPress={sendFeedback}
              disabled={sending}
            >
              <Text style={[styles.feedbackButtonText, { color: theme.buttonText }]}>{sending ? 'Sending...' : 'Send'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Other settings buttons can go here */}
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
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#f3f6fa',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 16,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonText: {
    fontSize: 17,
    color: '#222',
    fontWeight: '600',
  },
  feedbackButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  feedbackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  feedbackLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    color: '#222',
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
    position: 'relative',
  },
  closeIconButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  closeButton: {
    backgroundColor: '#aaa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 