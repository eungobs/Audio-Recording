import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  Linking
} from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const [recording, setRecording] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [sound, setSound] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecordings, setFilteredRecordings] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [recordingDuration, setRecordingDuration] = useState(0); // Track duration in seconds

  let intervalId = null; // To store the interval for updating recording time

  // Start recording
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        setRecording(recording);
        setRecordingDuration(0); // Reset duration when starting a new recording

        // Update duration every second
        intervalId = setInterval(() => {
          setRecordingDuration((prevDuration) => prevDuration + 1);
        }, 1000);
      } else {
        Alert.alert('Permission denied', 'Cannot access microphone');
      }
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };

  // Stop recording
  const stopRecording = async () => {
    setRecording(null);
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const duration = Math.ceil(recording._finalDurationMillis / 1000);

      const name = prompt('Enter a name for this recording:');
      if (!name) {
        Alert.alert('Name is required', 'Please enter a valid name for the recording.');
        return;
      }

      const newRecording = { uri, duration, name };

      const updatedRecordings = [...recordings, newRecording];
      setRecordings(updatedRecordings);
      setFilteredRecordings(updatedRecordings);
      saveRecordings(updatedRecordings);
    }

    // Clear the interval when stopping the recording
    clearInterval(intervalId);
  };

  // Play or stop recording
  const togglePlayRecording = async (uri, index) => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);

        if (currentlyPlaying === index) {
          setCurrentlyPlaying(null);
          return;
        }
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setCurrentlyPlaying(index);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setSound(null);
          setCurrentlyPlaying(null);
        }
      });
    } catch (error) {
      console.error('Error toggling playback', error);
    }
  };

  // Save recordings to local storage
  const saveRecordings = async (data) => {
    try {
      await AsyncStorage.setItem('@recordings', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save recordings', error);
    }
  };

  // Load recordings from local storage
  const loadRecordings = async () => {
    try {
      const data = await AsyncStorage.getItem('@recordings');
      if (data) {
        const parsedRecordings = JSON.parse(data);
        setRecordings(parsedRecordings);
        setFilteredRecordings(parsedRecordings);
      }
    } catch (error) {
      console.error('Failed to load recordings', error);
    }
  };

  // Delete a recording
  const deleteRecording = (index) => {
    const updatedRecordings = recordings.filter((_, i) => i !== index);
    setRecordings(updatedRecordings);
    setFilteredRecordings(updatedRecordings);
    saveRecordings(updatedRecordings);

    if (index === currentlyPlaying) {
      if (sound) {
        sound.stopAsync();
        sound.unloadAsync();
      }
      setSound(null);
      setCurrentlyPlaying(null);
    }
  };

  // Search recordings by name
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredRecordings(recordings);
    } else {
      const filtered = recordings.filter((recording) =>
        recording.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredRecordings(filtered);
    }
  };

  // Handle Settings option press
  const handleSettingsOption = (option) => {
    setModalVisible(false); // Close modal when an option is selected
    if (option === 'Record Quality') {
      // Implement record quality functionality
      Alert.alert('Record Quality', 'Choose the recording quality here...');
    } else if (option === 'Block Calls While Recording') {
      // Implement block calls functionality
      Alert.alert('Block Calls', 'Block incoming calls while recording...');
    } else if (option === 'Privacy Policy') {
      Linking.openURL('https://www.example.com/privacy-policy'); // Open privacy policy link
    } else if (option === 'Permissions') {
      // Permissions handling
      Alert.alert(
        'Permissions',
        'This app requires access to your microphone. Do you allow access?',
        [
          { text: 'Allow', onPress: () => Alert.alert('Access Granted') },
          { text: 'Not Allow', onPress: () => Alert.alert('Access Denied') },
        ]
      );
    } else if (option === 'Contact Us') {
      Linking.openURL('https://www.example.com/contact-us'); // Open contact us link
    }
  };

  useEffect(() => {
    loadRecordings();
    return () => {
      if (intervalId) clearInterval(intervalId); // Clean up interval on unmount
    };
  }, []);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' + secs : secs}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Ionicons name="settings-sharp" size={30} color="white" style={styles.settingsIcon} />
      </TouchableOpacity>

      {/* Modal for settings options */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalOption} onPress={() => handleSettingsOption('Record Quality')}>
              Record Quality
            </Text>
            <Text style={styles.modalOption} onPress={() => handleSettingsOption('Block Calls While Recording')}>
              Block Calls While Recording
            </Text>
            <Text style={styles.modalOption} onPress={() => handleSettingsOption('Privacy Policy')}>
              Privacy Policy
            </Text>
            <Text style={styles.modalOption} onPress={() => handleSettingsOption('Permissions')}>
              Permissions
            </Text>
            <Text style={styles.modalOption} onPress={() => handleSettingsOption('Contact Us')}>
              Contact Us
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeModal}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TextInput
        style={styles.searchBar}
        placeholder="Search recordings by name..."
        placeholderTextColor="#aaa"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <TouchableOpacity
        style={styles.microphone}
        onPress={recording ? stopRecording : startRecording}
      >
        <Ionicons name={recording ? 'pause' : 'mic'} size={60} color="white" />
      </TouchableOpacity>

      {/* Display recording duration */}
      {recording && <Text style={styles.duration}>{formatDuration(recordingDuration)}</Text>}

      <FlatList
        data={filteredRecordings}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.recordingItem}>
            <Text style={styles.recordingText}>{item.name}</Text>
            <Text style={styles.recordingText}>
              Duration: {formatDuration(item.duration)}
            </Text>
            <View style={styles.recordingActions}>
              <TouchableOpacity onPress={() => togglePlayRecording(item.uri, index)}>
                <Ionicons
                  name={currentlyPlaying === index ? 'stop-circle' : 'play-circle'}
                  size={30}
                  color="white"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteRecording(index)}>
                <Ionicons name="trash" size={30} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c2b',
    paddingTop: 50,
    paddingLeft: 10,
    paddingRight: 10,
  },
  microphone: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  settingsIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 10,
    color: 'white',
  },
  recordingItem: {
    backgroundColor: '#333',
    marginBottom: 10,
    padding: 10,
    borderRadius: 2,
  },
  recordingText: {
    color: 'white',
    fontSize: 16,
  },
  recordingActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: 300,
  },
  modalOption: {
    fontSize: 16,
    marginBottom: 10,
    color: '#007BFF',
  },
  closeModal: {
    color: 'gray',
    textAlign: 'center',
    marginTop: 10,
  },
});
