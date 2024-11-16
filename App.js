import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  Alert,
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

  useEffect(() => {
    loadRecordings();
  }, []);

  return (
    <View style={styles.container}>
      <Ionicons name="settings-sharp" size={30} color="white" style={styles.settingsIcon} />

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

      <FlatList
        data={filteredRecordings}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.recordingItem}>
            <Text style={styles.recordingText}>
              {item.name} - {item.duration}s
            </Text>
            <View style={styles.recordingActions}>
              <TouchableOpacity onPress={() => togglePlayRecording(item.uri, index)}>
                <Ionicons
                  name={currentlyPlaying === index ? 'stop' : 'play'}
                  size={24}
                  color={currentlyPlaying === index ? 'red' : 'green'}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteRecording(index)}>
                <Ionicons name="trash" size={24} color="red" />
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
    alignItems: 'center',
  },
  searchBar: {
    backgroundColor: '#2c2c4b',
    color: 'white',
    width: '100%',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  microphone: {
    marginTop: 20,
    backgroundColor: '#2c2c4b',
    padding: 30,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2c2c4b',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
  },
  recordingText: {
    color: 'white',
    fontSize: 16,
  },
  recordingActions: {
    flexDirection: 'row',
    gap: 10,
  },
  settingsIcon: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
});
