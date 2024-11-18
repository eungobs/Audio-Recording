Voice Recorder App
Overview
The Voice Recorder App is a React Native application that allows users to record audio, play back recordings, and manage their audio files. It utilizes Expo's audio capabilities and AsyncStorage for data persistence. The app supports searching and filtering recordings, as well as settings management through a modal interface.

Features
Audio Recording: Record audio with options for high-quality settings.
Playback Controls: Play, pause, and stop recorded audio.
Manage Recordings: View, delete, and search recordings efficiently.
Settings Modal: Access various settings options for user preferences.
Technologies Used
React Native: For building the mobile application.
Expo AV: For handling audio recording and playback.
AsyncStorage: For local data storage of recordings.
React Native Vector Icons: For icons used in the UI.
Installation

Clone the repository:
git clone https://github.com/eungobs/Audio-Recording.git
Navigate into the project directory:


cd voice-recorder-app
Install dependencies:


npm install
Start the Expo server:


expo start
Usage
Record Audio:
Press the microphone button to start and stop recording. You will be prompted to enter a name for your recording after stopping.

Playback Recordings:
Tap the play icon next to a recording to listen to it. The play icon changes to a stop icon while the audio is playing.

Manage Recordings:
Use the trash icon to delete a recording. Utilize the search bar to filter recordings by name.

Settings:
Tap the settings icon to open a modal where you can view various options (Note: Currently, the options are just alerts and do not perform any actions).

Code Structure
The main component of the app is the App function, which contains the logic for recording, playback, and managing recordings. Here’s a brief outline of the key functions:

startRecording: Requests microphone permissions and starts audio recording.
stopRecording: Stops the recording, prompts for a name, and saves the recording.
togglePlayRecording: Plays or stops a selected recording.
saveRecordings: Saves the recordings to AsyncStorage.
loadRecordings: Loads saved recordings from AsyncStorage.
deleteRecording: Deletes a selected recording from the list.
handleSearch: Filters recordings based on the search query.
Project Location
The project is located on the master branch of the repository.