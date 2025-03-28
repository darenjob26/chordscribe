import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import MongoDBTest from '@/tests/mongodb.test';

export default function MongoDBTestScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <MongoDBTest />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 