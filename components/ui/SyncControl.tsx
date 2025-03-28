import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, TextInput } from 'react-native';
import { useMongoDB } from '@/lib/providers/MongoDBProvider';

export function SyncControl() {
  const { isConnected, connecting, error, connect, disconnect, setCustomURI } = useMongoDB();
  const [uri, setUri] = useState('');
  const [showUriInput, setShowUriInput] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Update status message when connection status changes
  useEffect(() => {
    if (connecting) {
      setStatusMessage('Connecting to database...');
    } else if (isConnected) {
      setStatusMessage('Connected to MongoDB');
    } else if (error) {
      setStatusMessage(`Error: ${error}`);
    } else {
      setStatusMessage('Not connected to database');
    }
  }, [isConnected, connecting, error]);

  // Handle connect button press
  const handleConnect = async () => {
    if (isConnected) {
      Alert.alert(
        'Already Connected',
        'You are already connected to MongoDB.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    await connect();
  };

  // Handle disconnect button press
  const handleDisconnect = async () => {
    if (!isConnected) {
      Alert.alert(
        'Not Connected',
        'You are not currently connected to MongoDB.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    Alert.alert(
      'Confirm Disconnect',
      'Are you sure you want to disconnect from MongoDB?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disconnect', 
          style: 'destructive',
          onPress: async () => {
            await disconnect();
          }
        }
      ]
    );
  };

  // Handle URI submission
  const handleUriSubmit = async () => {
    if (!uri.trim()) {
      Alert.alert('Invalid URI', 'Please enter a valid MongoDB URI');
      return;
    }
    
    await setCustomURI(uri);
    setShowUriInput(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Database Connection</Text>
      
      <View style={styles.statusContainer}>
        <Text style={[
          styles.statusText,
          isConnected ? styles.connected : styles.disconnected
        ]}>
          {statusMessage}
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title={isConnected ? "Reconnect" : "Connect"}
          onPress={handleConnect}
          disabled={connecting}
        />
        
        <Button
          title="Disconnect"
          onPress={handleDisconnect}
          disabled={!isConnected || connecting}
          color="red"
        />
      </View>
      
      <View style={styles.customUriContainer}>
        <Button
          title={showUriInput ? "Hide URI Input" : "Set Custom URI"}
          onPress={() => setShowUriInput(!showUriInput)}
        />
        
        {showUriInput && (
          <View style={styles.uriInputContainer}>
            <TextInput
              style={styles.uriInput}
              placeholder="mongodb://hostname:port/database"
              value={uri}
              onChangeText={setUri}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Button title="Apply" onPress={handleUriSubmit} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusContainer: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusText: {
    fontSize: 14,
  },
  connected: {
    color: 'green',
  },
  disconnected: {
    color: 'red',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  customUriContainer: {
    marginTop: 8,
  },
  uriInputContainer: {
    marginTop: 8,
  },
  uriInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
}); 