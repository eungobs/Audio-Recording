import React, { useState, useEffect } from 'react'; // Import React and its hooks (useState, useEffect)
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
} from 'react-native'; // Import core components from React Native
import { Audio } from 'expo-av'; // Import Audio from Expo AV for recording and playback
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage for persistent storage
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for icons

export default function App() {
  // State to manage the current recording object
  const [recording, setRecording] = useState(null);

  // State to store all recordings
  const [recordings, setRecordings] = useState([]);

  // State to manage the currently playing sound object
  const [sound, setSound] = useState(null);

  // State to track which recording is currently playing
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  // State to manage the search query for filtering recordings
  const [searchQuery, setSearchQuery] = useState('');

  // State to store filtered recordings based on the search query
  const [filteredRecordings, setFilteredRecordings] = useState([]);

  // State to control the visibility of the settings modal
  const [modalVisible, setModalVisible] = useState(false);

  // State to track the duration of the current recording
  const [recordingDuration, setRecordingDuration] = useState(0);

  // State to manage app settings (record quality, block calls, permissions)
  const [settings, setSettings] = useState({
    recordQuality: false,
    blockCalls: false,
    permissions: false,
  });

  // Variable to store the interval ID for the recording timer
  let intervalId = null;

  // Function to configure audio settings for recording and playback
  const configureAudioSettings = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true, // Allow recording on iOS
        playsInSilentModeIOS: true, // Play audio in silent mode on iOS
        staysActiveInBackground: true, // Keep the app active in the background
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX, // Handle audio interruptions on iOS
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX, // Handle audio interruptions on Android
        shouldDuckAndroid: true, // Lower the volume of other apps while recording/playing
        playThroughEarpieceAndroid: false, // Play audio through the speaker, not the earpiece
      });
    } catch (error) {
      console.error('Error configuring audio mode:', error); // Log errors if audio configuration fails
    }
  };

  // Function to toggle a setting (recordQuality, blockCalls, permissions)
  const toggleSetting = (setting) => {
    setSettings((prev) => ({
      ...prev, // Keep existing settings
      [setting]: !prev[setting], // Toggle the specified setting
    }));
  };

  // Function to start recording
  const startRecording = async () => {
    try {
      // Request microphone permissions
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        // Configure audio settings
        await configureAudioSettings();

        // Start recording with high-quality settings
        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        setRecording(recording); // Set the current recording object
        setRecordingDuration(0); // Reset the recording duration

        // Start a timer to update the recording duration every second
        intervalId = setInterval(() => {
          setRecordingDuration((prevDuration) => prevDuration + 1);
        }, 1000);
      } else {
        // Show an alert if permission is denied
        Alert.alert('Permission denied', 'Cannot access microphone');
      }
    } catch (error) {
      console.error('Failed to start recording', error); // Log errors if recording fails
    }
  };

  // Function to stop recording
  const stopRecording = async () => {
    setRecording(null); // Clear the current recording object
    if (recording) {
      await recording.stopAndUnloadAsync(); // Stop and unload the recording
      const uri = recording.getURI(); // Get the URI of the recording
      const duration = Math.ceil(recording._finalDurationMillis / 1000); // Calculate the duration in seconds

      // Prompt the user to name the recording
      const name = prompt('Enter a name for this recording:');
      if (!name) {
        // Show an alert if no name is provided
        Alert.alert('Name is required', 'Please enter a valid name for the recording.');
        return;
      }

      // Create a new recording object
      const newRecording = { uri, duration, name };

      // Update the recordings list
      const updatedRecordings = [...recordings, newRecording];
      setRecordings(updatedRecordings);
      setFilteredRecordings(updatedRecordings);
      await saveRecordings(updatedRecordings); // Save the updated list to AsyncStorage
    }

    clearInterval(intervalId); // Clear the recording timer
  };

  // Function to toggle playback of a recording
  const togglePlayRecording = async (uri, index) => {
    try {
      if (sound) {
        // Stop and unload the currently playing sound
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);

        // If the same recording is playing, stop it
        if (currentlyPlaying === index) {
          setCurrentlyPlaying(null);
          return;
        }
      }

      // Create a new sound object for playback
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        {
          shouldPlay: true, // Start playback immediately
          volume: 1.0, // Set volume to max
          isLooping: false, // Do not loop the recording
        }
      );
      setSound(newSound); // Set the current sound object
      setCurrentlyPlaying(index); // Set the currently playing index

      // Update playback status when the recording finishes
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setSound(null); // Clear the sound object
          setCurrentlyPlaying(null); // Clear the currently playing index
        }
      });
    } catch (error) {
      console.error('Error toggling playback', error); // Log errors if playback fails
    }
  };

  // Function to save recordings to AsyncStorage
  const saveRecordings = async (data) => {
    try {
      await AsyncStorage.setItem('@recordings', JSON.stringify(data)); // Save recordings as a JSON string
    } catch (error) {
      console.error('Failed to save recordings', error); // Log errors if saving fails
    }
  };

  // Function to load recordings from AsyncStorage
  const loadRecordings = async () => {
    try {
      const data = await AsyncStorage.getItem('@recordings'); // Retrieve recordings from AsyncStorage
      if (data) {
        const parsedRecordings = JSON.parse(data); // Parse the JSON string
        setRecordings(parsedRecordings); // Set the recordings state
        setFilteredRecordings(parsedRecordings); // Set the filtered recordings state
      }
    } catch (error) {
      console.error('Failed to load recordings', error); // Log errors if loading fails
    }
  };

  // Function to delete a recording
  const deleteRecording = async (index) => {
    const updatedRecordings = recordings.filter((_, i) => i !== index); // Remove the recording at the specified index
    setRecordings(updatedRecordings); // Update the recordings state
    setFilteredRecordings(updatedRecordings); // Update the filtered recordings state
    await saveRecordings(updatedRecordings); // Save the updated list to AsyncStorage

    // If the deleted recording is currently playing, stop it
    if (index === currentlyPlaying) {
      if (sound) {
        sound.stopAsync();
        sound.unloadAsync();
      }
      setSound(null); // Clear the sound object
      setCurrentlyPlaying(null); // Clear the currently playing index
    }
  };

  // Function to handle search queries
  const handleSearch = (query) => {
    setSearchQuery(query); // Update the search query state
    if (query.trim() === '') {
      // If the query is empty, show all recordings
      setFilteredRecordings(recordings);
    } else {
      // Filter recordings based on the query
      const filtered = recordings.filter((recording) =>
        recording.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredRecordings(filtered); // Update the filtered recordings state
    }
  };

  // useEffect to configure audio settings and load recordings when the app starts
  useEffect(() => {
    configureAudioSettings();
    loadRecordings();
    return () => {
      if (intervalId) clearInterval(intervalId); // Cleanup the interval when the component unmounts
    };
  }, []);

  // Function to format duration in seconds to "mm:ss" format
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60); // Calculate minutes
    const secs = seconds % 60; // Calculate seconds
    return `${minutes}:${secs < 10 ? '0' + secs : secs}`; // Return formatted string
  };

  // Render the app UI
  return (
    <View style={styles.container}>
      {/* Settings button to open the modal */}
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
            {/* Button to toggle record quality setting */}
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: settings.recordQuality ? 'green' : 'gray' },
              ]}
              onPress={() => toggleSetting('recordQuality')}
            >
              <Text style={styles.modalOption}>Record Quality</Text>
            </TouchableOpacity>
            {/* Button to toggle block calls setting */}
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: settings.blockCalls ? 'green' : 'gray' },
              ]}
              onPress={() => toggleSetting('blockCalls')}
            >
              <Text style={styles.modalOption}>Block Calls While Recording</Text>
            </TouchableOpacity>
            {/* Button to toggle permissions setting */}
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: settings.permissions ? 'green' : 'gray' },
              ]}
              onPress={() => toggleSetting('permissions')}
            >
              <Text style={styles.modalOption}>Permissions</Text>
            </TouchableOpacity>
            {/* Button to close the modal */}
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeModal}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Search bar to filter recordings by name */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search recordings by name..."
        placeholderTextColor="#aaa"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {/* Microphone button to start/stop recording */}
      <TouchableOpacity
        style={[
          styles.microphone,
          { backgroundColor: recording ? 'red' : 'gray' },
        ]}
        onPress={recording ? stopRecording : startRecording}
      >
        <Ionicons name={recording ? 'pause' : 'mic'} size={60} color="white" />
      </TouchableOpacity>

      {/* Display the current recording duration */}
      {recording && <Text style={styles.duration}>{formatDuration(recordingDuration)}</Text>}

      {/* List of recordings */}
      <FlatList
        data={filteredRecordings}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.recordingItem}>
            {/* Display recording name */}
            <Text style={styles.recordingText}>{item.name}</Text>
            {/* Display recording duration */}
            <Text style={styles.recordingText}>
              Duration: {formatDuration(item.duration)}
            </Text>
            {/* Buttons to play/stop and delete the recording */}
            <View style={styles.recordingActions}>
              <TouchableOpacity onPress={() => togglePlayRecording(item.uri, index)}>
                <Ionicons
                  name={currentlyPlaying === index ? 'stop-circle' : 'play-circle'}
                  size={30}
                  color={currentlyPlaying === index ? 'red' : 'green'}
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

// Styles for the app
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c2b',
    padding: 20,
  },
  searchBar: {
    height: 50,
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 10,
    color: 'white',
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#333',
  },
  microphone: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  duration: {
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
    marginBottom: 20,
  },
  recordingItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  recordingText: {
    color: 'white',
  },
  recordingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  settingsIcon: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  optionButton: {
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOption: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeModal: {
    textAlign: 'center',
    color: 'red',
    fontWeight: 'bold',
    marginTop: 20,
    fontSize: 18,
  },
});