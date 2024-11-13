import React, { useState, useEffect } from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import * as Permissions from 'expo-permissions';
import VoiceNoteList from './components/VoiceNoteList';  // This should be for listing voice notes
import VoiceNPlayer from './components/VoiceNotePlayer';    // This should be for the player component
import { saveVoiceNotes, getVoiceNotes, deleteVoiceNote } from './utils/storage';  // Import storage functions

const App = () => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    // Get voice notes from storage on app load
    const fetchVoiceNotes = async () => {
      const savedRecordings = await getVoiceNotes();
      setRecordings(savedRecordings);
    };

    // Ask for microphone permission
    const getPermissions = async () => {
      const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Audio recording permission is required');
      }
    };
    getPermissions();
    fetchVoiceNotes(); // Fetch saved recordings
  }, []);

  // Start recording
  const startRecording = async () => {
    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  // Stop recording
  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false);
      const newRecording = { uri, date: new Date().toLocaleString() };
      const updatedRecordings = [...recordings, newRecording];
      setRecordings(updatedRecordings);
      await saveVoiceNotes(updatedRecordings);  // Save new voice note to storage
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  // Delete a recording
  const handleDeleteRecording = async (uri) => {
    await deleteVoiceNote(uri); // Delete from storage
    const updatedRecordings = recordings.filter((recording) => recording.uri !== uri);
    setRecordings(updatedRecordings);  // Update the local state
  };

  return (
    <View style={styles.container}>
      <Button
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={isRecording ? stopRecording : startRecording}
      />
      <VoiceNoteList recordings={recordings} onDelete={handleDeleteRecording} />
      {/* Add VoiceNPlayer component to play the voice notes */}
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
