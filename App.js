// App.js
import React, { useState, useEffect } from 'react';
import { View, Button, Alert, StyleSheet, Text } from 'react-native';
import { Audio } from 'expo-av';
import * as Permissions from 'expo-permissions';
import VoiceNoteList from './components/VoiceNoteList';
import VoiceNPlayer from './components/VoiceNotePlayer';
import { saveVoiceNotes, getVoiceNotes, deleteVoiceNote } from './utils/storage';

const App = () => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [savedRecording, setSavedRecording] = useState(null);

  useEffect(() => {
    const fetchVoiceNotes = async () => {
      const savedRecordings = await getVoiceNotes();
      setRecordings(savedRecordings);
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
      setSavedRecording(null); // Reset saved recording when a new recording starts
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false);
      setSavedRecording({ uri, date: new Date().toLocaleString() });
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const saveRecording = async () => {
    if (savedRecording) {
      const updatedRecordings = [...recordings, savedRecording];
      setRecordings(updatedRecordings);
      await saveVoiceNotes(updatedRecordings); // Save new recording to local storage
      setSavedRecording(null); // Reset saved recording after saving
    }
  };

  const handleDeleteRecording = async (uri) => {
    await deleteVoiceNote(uri);
    const updatedRecordings = recordings.filter((recording) => recording.uri !== uri);
    setRecordings(updatedRecordings);
  };

  return (
    <View style={styles.container}>
      <Button
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={isRecording ? stopRecording : startRecording}
      />
      {savedRecording && (
        <Button title="Save Recording" onPress={saveRecording} />
      )}
      <VoiceNoteList recordings={recordings} onDelete={handleDeleteRecording} />
      <VoiceNPlayer recordings={recordings} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
