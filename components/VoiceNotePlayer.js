// components/VoiceNotePlayer.js
import React, { useState, useEffect } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

const VoiceNotePlayer = ({ uri }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0); // Track elapsed time
  const [duration, setDuration] = useState(null); // Store total duration of the recording
  const [position, setPosition] = useState(0); // Track current position during playback

  // Load and prepare the sound for playback
  const loadSound = async () => {
    if (uri) {
      try {
        const { sound: newSound, status } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: false }
        );
        setSound(newSound);
        
        // Ensure we set duration only after sound has been loaded
        if (status.durationMillis) {
          setDuration(Math.floor(status.durationMillis / 1000)); // Store duration in seconds
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

    if (isPlaying) {
      // Stop playback
      await sound.stopAsync();
      setIsPlaying(false);
      setPosition(0); // Reset position
      setElapsedTime(0); // Reset elapsed time
      setRemainingTime(null); // Reset remaining time
    } else {
      // Play the recording
      await sound.playAsync();
      setIsPlaying(true);

      // Start tracking playback position and update countdown
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isPlaying) {
          setPosition(Math.ceil(status.positionMillis / 1000)); // Update position in seconds
          setElapsedTime(Math.floor(status.positionMillis / 1000)); // Update elapsed time
          setRemainingTime(duration - Math.ceil(status.positionMillis / 1000)); // Remaining time countdown
        }
        if (status.didJustFinish) {
          setIsPlaying(false);
          setPosition(0);
          setElapsedTime(0);
          setRemainingTime(null); // Reset remaining time once finished
        }
      });
    }
  };

  // Format time in minutes or seconds
  const formatTime = (seconds) => {
    if (seconds == null) return "0 seconds"; // Handle case where seconds is null
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes > 0) {
      return `${minutes} minutes`; // Show minutes if greater than 0
    } else {
      return `${secs < 10 ? '0' + secs : secs} seconds`; // Otherwise show seconds
    }
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
          Duration: {formatTime(duration)} {/* Show total duration in minutes or seconds */}
        </Text>
      )}

      {elapsedTime !== 0 && (
        <Text style={styles.timerText}>
          Elapsed Time: {formatTime(elapsedTime)} {/* Show real-time elapsed time */}
        </Text>
      )}

      {remainingTime !== null && (
        <Text style={styles.timerText}>
          Time remaining: {formatTime(remainingTime)} {/* Countdown timer */}
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
    color: 'white', // White text for dark background
    marginTop: 5,
  },
  timerText: {
    color: 'white', // White text for dark background
    marginTop: 5,
  },
});

export default VoiceNotePlayer;
