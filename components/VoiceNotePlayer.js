// components/VoiceNotePlayer.js
import React, { useState, useEffect } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

const VoiceNotePlayer = ({ uri }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [duration, setDuration] = useState(null); // Store total duration of the recording
  const [position, setPosition] = useState(0); // Track current position during playback

  // Load and prepare the sound for playback
  const loadSound = async () => {
    try {
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false }
      );
      setSound(newSound);
      setDuration(Math.floor(status.durationMillis / 1000)); // Store duration in seconds
    } catch (error) {
      console.error("Error loading sound:", error);
    }
  };

  // Function to play or stop the sound
  const handlePlayback = async () => {
    if (!sound) {
      await loadSound();
    }

    if (isPlaying) {
      // Stop playback
      await sound.stopAsync();
      setIsPlaying(false);
      setPosition(0); // Reset position
      setRemainingTime(null); // Reset remaining time
    } else {
      // Play the recording
      await sound.playAsync();
      setIsPlaying(true);

      // Start tracking playback position and update countdown
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isPlaying) {
          setPosition(Math.ceil(status.positionMillis / 1000)); // Update position in seconds
          setRemainingTime(duration - Math.ceil(status.positionMillis / 1000)); // Remaining time countdown
        }
        if (status.didJustFinish) {
          setIsPlaying(false);
          setPosition(0);
          setRemainingTime(null); // Reset remaining time once finished
        }
      });
    }
  };

  // Format time in MM:SS format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' + secs : secs}`;
  };

  useEffect(() => {
    // Load the sound when URI is passed
    if (uri) {
      loadSound();
    }

    // Cleanup sound when the component unmounts
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [uri]);

  return (
    <View style={styles.container}>
      <Button
        title={isPlaying ? 'Stop' : 'Play'}
        onPress={handlePlayback}
        color="black"
      />
      {remainingTime !== null && (
        <Text style={styles.timerText}>
          Time remaining: {formatTime(remainingTime)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  timerText: {
    color: 'white', // White text for dark background
    marginTop: 5,
  },
});

export default VoiceNotePlayer;




