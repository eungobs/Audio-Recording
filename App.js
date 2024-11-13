// App.js
import React, { useState, useEffect } from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import * as Permissions from 'expo-permissions';
import VoiceNoteList from './components/VoiceNoteList';
import VoiceNPlayer from './components/VoiceNotePlayer';
import { saveVoiceNotes, getVoiceNotes, deleteVoiceNote } from './utils/storage';

const App = () => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [showSaveButton, setShowSaveButton] = useState(false);

  useEffect(() => {
    const fetchVoiceNotes = async () => {
      const savedRecordings = await getVoiceNotes();
      setRecordings(savedRecordings || []);
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
    const newRecording = { uri, date: new Date().toLocaleString() };
    const updatedRecordings = [...recordings, newRecording];
    setRecordings(updatedRecordings);
    await saveVoiceNotes(updatedRecordings);
    setShowSaveButton(false);
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
        color="black"  // Black button text
      />
      {showSaveButton && (
        <Button
          title="Save Recording"
          onPress={saveRecording}
          color="black"  // Black button text
        />
      )}
      <VoiceNoteList recordings={recordings} onDelete={handleDeleteRecording} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',  // Dark grey background
    padding: 20,
  },
});

export default App;


