// components/VoiceNotePlayer.js
import React, { useState, useEffect } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

const VoiceNotePlayer = ({ uri }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null); // Countdown time
  const [duration, setDuration] = useState(null); // Store total duration of the recording

  // Load and prepare the sound for playback
  const loadSound = async () => {
    if (uri) {
      try {
        const { sound: newSound, status } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: false }
        );
        setSound(newSound);

        // Set duration if the sound is successfully loaded
        if (status.isLoaded && status.durationMillis) {
          const durationInSeconds = Math.floor(status.durationMillis / 1000);
          setDuration(durationInSeconds);
          setRemainingTime(durationInSeconds); // Initialize remaining time with total duration
        }
      } catch (error) {
        console.error("Error loading sound:", error);
      }
    }
  };

  // Function to play or stop the sound
  const handlePlayback = async () => {
    if (!sound) {
      // Load sound if not already loaded
      await loadSound();
    }

    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      if (isPlaying) {
        // Stop playback
        await sound.stopAsync();
        setIsPlaying(false);
        setRemainingTime(duration); // Reset countdown to total duration
      } else {
        // Play the recording
        await sound.playAsync();
        setIsPlaying(true);

        // Start tracking playback status and update countdown
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isPlaying) {
            const currentPosition = Math.floor(status.positionMillis / 1000);
            setRemainingTime(duration - currentPosition); // Update remaining time
          }
          if (status.didJustFinish) {
            setIsPlaying(false);
            setRemainingTime(duration); // Reset countdown to total duration once finished
          }
        });
      }
    } else {
      console.error("Sound is not loaded.");
    }
  };

  // Format time in minutes and seconds
  const formatTime = (seconds) => {
    if (seconds == null) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
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

      {duration !== null && (
        <Text style={styles.durationText}>
          Duration: {formatTime(duration)}
        </Text>
      )}

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
  durationText: {
    color: 'white',
    marginTop: 5,
  },
  timerText: {
    color: 'white',
    marginTop: 5,
  },
});

export default VoiceNotePlayer;
