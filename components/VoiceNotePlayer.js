import React, { useState } from 'react';
import { Button } from 'react-native';
import { Audio } from 'expo-av';

const VoiceNotePlayer = ({ uri }) => {
  const [sound, setSound] = useState();

  const playAudio = async () => {
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    );
    setSound(sound);
  };

  return <Button title="Play" onPress={playAudio} />;
};

export default VoiceNotePlayer;

