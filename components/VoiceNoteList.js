import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import VoiceNotePlayer from './VoiceNotePlayer';

const VoiceNoteList = ({ recordings, onDelete }) => {
  return (
    <View style={styles.container}>
      {recordings.length === 0 ? (
        <Text>No voice notes recorded yet.</Text>
      ) : (
        recordings.map((item) => (
          <View key={item.uri} style={styles.listItem}>
            <Text style={styles.nameText}>{item.name}</Text> {/* Display recording name */}
            <Text>{item.date}</Text>
            <VoiceNotePlayer uri={item.uri} />
            <Button title="Delete" onPress={() => onDelete(item.uri)} />
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  listItem: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
  },
  nameText: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default VoiceNoteList;
