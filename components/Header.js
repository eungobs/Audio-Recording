import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const Header = () => {
  return (
    <View style={styles.header}>
      <MaterialIcons name="search" size={24} color="black" style={styles.icon} />
      <TextInput placeholder="Search" style={styles.searchInput} />
      <MaterialIcons name="settings" size={24} color="black" style={styles.icon} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f5f5f5',
  },
  searchInput: {
    flex: 1,
    padding: 8,
    marginHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  icon: {
    paddingHorizontal: 10,
  },
});

export default Header;
