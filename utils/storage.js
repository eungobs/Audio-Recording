// utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const VOICE_NOTES_KEY = '@voice_notes';

/**
 * Save voice notes to AsyncStorage
 * @param {Array} voiceNotes - Array of voice note objects
 */
export const saveVoiceNotes = async (voiceNotes) => {
  try {
    const jsonValue = JSON.stringify(voiceNotes);
    await AsyncStorage.setItem(VOICE_NOTES_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving voice notes', error);
  }
};

/**
 * Get voice notes from AsyncStorage
 * @returns {Array} - Array of voice note objects
 */
export const getVoiceNotes = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(VOICE_NOTES_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error getting voice notes', error);
    return [];
  }
};

/**
 * Delete a specific voice note by its URI
 * @param {String} uri - URI of the voice note to delete
 */
export const deleteVoiceNote = async (uri) => {
  try {
    const voiceNotes = await getVoiceNotes();
    const updatedVoiceNotes = voiceNotes.filter((note) => note.uri !== uri);
    await saveVoiceNotes(updatedVoiceNotes);
  } catch (error) {
    console.error('Error deleting voice note', error);
  }
};
