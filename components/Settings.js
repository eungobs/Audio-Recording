import React, { useState } from 'react';
import { View, Text, Button, Modal, TextInput, StyleSheet } from 'react-native';

const Settings = ({ isVisible, onClose, onSaveSettings }) => {
  const [maxDuration, setMaxDuration] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleSave = () => {
    // Save the settings
    const settings = {
      maxDuration,
      selectedDate,
      selectedTime,
    };
    onSaveSettings(settings);
    onClose(); // Close the modal
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Settings</Text>
          
          <Text>Maximum Duration (in seconds):</Text>
          <TextInput
            value={maxDuration}
            onChangeText={setMaxDuration}
            keyboardType="numeric"
            style={styles.input}
          />

          <Text>Select Date:</Text>
          <TextInput
            value={selectedDate}
            onChangeText={setSelectedDate}
            placeholder="YYYY-MM-DD"
            style={styles.input}
          />

          <Text>Select Time:</Text>
          <TextInput
            value={selectedTime}
            onChangeText={setSelectedTime}
            placeholder="HH:MM"
            style={styles.input}
          />

          <Button title="Save Settings" onPress={handleSave} color="black" />
          <Button title="Close" onPress={onClose} color="red" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark background for modal
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginVertical: 10,
    width: 250,
    borderRadius: 5,
  },
});

export default Settings;
