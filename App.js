import React, { useState, useEffect } from 'react';
import { View, Button, Alert, StyleSheet, TextInput, TouchableOpacity, Text } from 'react-native';
import { Audio } from 'expo-av';
import * as Permissions from 'expo-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VoiceNoteList from './components/VoiceNoteList';
import Header from './components/Header';
import Settings from './components/Settings';

// ErrorBoundary component to catch any errors in the app
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.log(error, info);
  }

  render() {
    if (this.state.hasError) {
      return <Text style={styles.errorText}>Something went wrong!</Text>;
    }
    return this.props.children;
  }
}

const App = () => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [recordingName, setRecordingName] = useState('');
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [settings, setSettings] = useState({
    maxDuration: 60,
    selectedDate: '',
    selectedTime: '',
  });

  useEffect(() => {
    const fetchVoiceNotes = async () => {
      try {
        const savedRecordings = await AsyncStorage.getItem('voiceNotes');
        if (savedRecordings !== null) {
          setRecordings(JSON.parse(savedRecordings));
        }
      } catch (error) {
        console.error('Failed to fetch recordings', error);
      }
    };

    const getPermissions = async () => {
      const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Audio recording permission is required');
      }
    };

    getPermissions();
    fetchVoiceNotes();
  }, []);

  const startRecording = async () => {
    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setShowSaveButton(false);
      setRecordingName('');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      setIsRecording(false);
      setShowSaveButton(true);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const saveRecording = async () => {
    const uri = recording.getURI();
    const newRecording = { 
      uri, 
      name: recordingName || 'Unnamed Recording', 
      date: new Date().toLocaleString() 
    };
    const updatedRecordings = [...recordings, newRecording];
    setRecordings(updatedRecordings);

    try {
      await AsyncStorage.setItem('voiceNotes', JSON.stringify(updatedRecordings));
    } catch (error) {
      console.error('Failed to save recording', error);
    }
    setShowSaveButton(false);
  };

  const handleDeleteRecording = async (uri) => {
    const updatedRecordings = recordings.filter((recording) => recording.uri !== uri);
    setRecordings(updatedRecordings);

    try {
      await AsyncStorage.setItem('voiceNotes', JSON.stringify(updatedRecordings));
    } catch (error) {
      console.error('Failed to delete recording', error);
    }
  };

  const toggleSettings = () => {
    setIsSettingsVisible(!isSettingsVisible);
  };

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <Header /> {/* Render the header with icons */}
        
        <TouchableOpacity onPress={toggleSettings}>
          <Text style={styles.settingsText}>Settings</Text>
        </TouchableOpacity>

        <Button
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
          onPress={isRecording ? stopRecording : startRecording}
          color="black"
        />
        {showSaveButton && (
          <View>
            <TextInput
              placeholder="Enter recording name"
              value={recordingName}
              onChangeText={setRecordingName}
              style={styles.input}
            />
            <Button
              title="Save Recording"
              onPress={saveRecording}
              color="black"
            />
          </View>
        )}
        <VoiceNoteList recordings={recordings} onDelete={handleDeleteRecording} />

        <Settings
          isVisible={isSettingsVisible}
          onClose={toggleSettings}
          onSaveSettings={saveSettings}
        />
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
    padding: 20,
  },
  input: {
    backgroundColor: 'white',
    padding: 8,
    marginVertical: 5,
    borderRadius: 5,
    width: 200,
    textAlign: 'center',
  },
  settingsText: {
    fontSize: 18,
    color: 'blue',
    marginVertical: 10,
  },
  errorText: {
    fontSize: 20,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default App;



