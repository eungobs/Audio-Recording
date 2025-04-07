# Voice Recorder App

## Overview

The **Voice Recorder App** is a mobile application that lets you record audio, play back recordings, and manage your audio files. It's built with **React Native** and uses **Expo's audio capabilities** to make recording and playback easy. The app also stores your recordings locally using **AsyncStorage** for data persistence.

## Key Features

1. **Audio Recording**: 
   - You can record audio with options for high-quality settings.
   - The app will ask you to enter a name for your recording after you stop.

2. **Playback Controls**: 
   - Tap the play icon next to a recording to listen to it.
   - The play icon changes to a stop icon while the audio is playing.

3. **Manage Recordings**: 
   - Use the trash icon to delete a recording.
   - Utilize the search bar to filter recordings by name.

4. **Settings Modal**: 
   - Tap the settings icon to open a modal where you can view various options.
   - Currently, the options are just alerts and don't perform any actions.

## Technologies Used

To build this app, the following technologies were used:

- **React Native**: The framework for building the mobile application.
- **Expo AV**: For handling audio recording and playback.
- **AsyncStorage**: For local data storage of recordings.
- **React Native Vector Icons**: For icons used in the UI.

## Getting Started

### Prerequisites

Before you can run the app on your machine, make sure you have:

- **Node.js** (version 16 or higher).
- **Expo CLI** (install globally using `npm install -g expo-cli`).
- **Git** (for downloading the project from GitHub).

### Installation Steps

1. **Clone the Repository**: Download the code for this app from GitHub. Open your terminal and type:
   git clone https://github.com/eungobs/Audio-Recording.git
  

2. **Navigate to the Project Directory**: Change into the project folder with:
   cd voice-recorder-app
  

3. **Install Dependencies**: Download all the necessary packages for the app by typing:
   npm install
  

4. **Start the Expo Server**: To test the app, start the Expo server by running:
  
   expo start
   

## How to Use the App

### Record Audio

- Press the microphone button to start and stop recording.
- You'll be prompted to enter a name for your recording after stopping.

### Playback Recordings

- Tap the play icon next to a recording to listen to it.
- The play icon changes to a stop icon while the audio is playing.

### Manage Recordings

- Use the trash icon to delete a recording.
- Utilize the search bar to filter recordings by name.

### Settings

- Tap the settings icon to open a modal where you can view various options (Note: Currently, the options are just alerts and do not perform any actions).

## Code Structure

The main component of the app is the **App function**, which contains the logic for recording, playback, and managing recordings. Here's a brief outline of the key functions:

- **startRecording**: Requests microphone permissions and starts audio recording.
- **stopRecording**: Stops the recording, prompts for a name, and saves the recording.
- **togglePlayRecording**: Plays or stops a selected recording.
- **saveRecordings**: Saves the recordings to AsyncStorage.
- **loadRecordings**: Loads saved recordings from AsyncStorage.
- **deleteRecording**: Deletes a selected recording from the list.
- **handleSearch**: Filters recordings based on the search query.

