// components/VoiceNotePlayer.js
import React, { useState, useEffect } from 'react';
import { Button } from 'react-native';
import { Audio } from 'expo-av';

const VoiceNotePlayer = ({ uri }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return sound ? () => sound.unloadAsync() : undefined;
  }, [sound]);

  const playAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      return;
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    );

    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        setIsPlaying(false);
        newSound.unloadAsync();
        setSound(null);
      }
    });

    setSound(newSound);
    setIsPlaying(true);
  };

  return (
    <Button title={isPlaying ? 'Stop' : 'Play'} onPress={playAudio} />
  );
};

export default VoiceNotePlayer;
