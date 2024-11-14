// components/VoiceNotePlayer.js
import React, { useState, useEffect } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import Svg, { Line } from 'react-native-svg';

const VoiceNotePlayer = ({ uri }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [duration, setDuration] = useState(null);
  const [oscillogramData, setOscillogramData] = useState([]);

  const loadSound = async () => {
    if (uri) {
      try {
        const { sound: newSound, status } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: false }
        );
        setSound(newSound);

        if (status.isLoaded && status.durationMillis) {
          const durationInSeconds = Math.floor(status.durationMillis / 1000);
          setDuration(durationInSeconds);
          setRemainingTime(durationInSeconds);
          generateOscillogram(durationInSeconds); // Generate oscillogram data
        }
      } catch (error) {
        console.error("Error loading sound:", error);
      }
    }
  };

  const handlePlayback = async () => {
    if (!sound) {
      await loadSound();
    }

    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      if (isPlaying) {
        await sound.stopAsync();
        setIsPlaying(false);
        setRemainingTime(duration);
      } else {
        await sound.playAsync();
        setIsPlaying(true);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isPlaying) {
            const currentPosition = Math.floor(status.positionMillis / 1000);
            setRemainingTime(duration - currentPosition);
          }
          if (status.didJustFinish) {
            setIsPlaying(false);
            setRemainingTime(duration);
          }
        });
      }
    } else {
      console.error("Sound is not loaded.");
    }
  };

  // Function to generate dummy oscillogram data
  const generateOscillogram = (duration) => {
    const data = [];
    const numberOfLines = 50; // Number of lines in the oscillogram
    for (let i = 0; i < numberOfLines; i++) {
      data.push(Math.sin((i / numberOfLines) * Math.PI * 2) * 50); // Generate sine wave data
    }
    setOscillogramData(data);
  };

  const formatTime = (seconds) => {
    if (seconds == null) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    if (uri) {
      loadSound();
    }
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

      {/* Oscillogram Visualization */}
      <View style={styles.oscillogramContainer}>
        <Svg height="100" width="100%">
          {oscillogramData.map((yValue, index) => (
            <Line
              key={index}
              x1={`${(index / oscillogramData.length) * 100}%`}
              y1={50 - yValue}
              x2={`${((index + 1) / oscillillogramData.length) * 100}%`}
              y2={50 - yValue}
              stroke="white"
              strokeWidth="2"
            />
          ))}
        </Svg>
      </View>
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
  oscillogramContainer: {
    width: '100%',
    height: 100,
    marginTop: 10,
    backgroundColor: '#222', // Background for the oscillogram
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VoiceNotePlayer;