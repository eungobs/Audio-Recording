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
  const [modalVisible, setModalVisible] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [settings, setSettings] = useState({
    recordQuality: false,
    blockCalls: false,
    permissions: false,
  });

  let intervalId = null;

  const configureAudioSettings = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error configuring audio mode:', error);
    }
  };

  const toggleSetting = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await configureAudioSettings();

        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        setRecording(recording);
        setRecordingDuration(0);

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

    clearInterval(intervalId);
  };

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
        {
          shouldPlay: true,
          volume: 1.0,
          isLooping: false,
        }
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

  const saveRecordings = async (data) => {
    try {
      await AsyncStorage.setItem('@recordings', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save recordings', error);
    }
  };

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

  useEffect(() => {
    configureAudioSettings();
    loadRecordings();
    return () => {
      if (intervalId) clearInterval(intervalId);
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
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: settings.recordQuality ? 'green' : 'gray' },
              ]}
              onPress={() => toggleSetting('recordQuality')}
            >
              <Text style={styles.modalOption}>Record Quality</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: settings.blockCalls ? 'green' : 'gray' },
              ]}
              onPress={() => toggleSetting('blockCalls')}
            >
              <Text style={styles.modalOption}>Block Calls While Recording</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: settings.permissions ? 'green' : 'gray' },
              ]}
              onPress={() => toggleSetting('permissions')}
            >
              <Text style={styles.modalOption}>Permissions</Text>
            </TouchableOpacity>
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
        style={[
          styles.microphone,
          { backgroundColor: recording ? 'red' : 'gray' },
        ]}
        onPress={recording ? stopRecording : startRecording}
      >
        <Ionicons name={recording ? 'pause' : 'mic'} size={60} color="white" />
      </TouchableOpacity>

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
