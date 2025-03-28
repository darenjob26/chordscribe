import React from 'react';
import { View, Text, ScrollView, Button, StyleSheet, ActivityIndicator, TextInput, Platform, Switch } from 'react-native';
import { PlaybookService } from '@/lib/services/playbook-service';
import { 
  connectToDatabase, 
  disconnectFromDatabase, 
  isConnectedToDatabase, 
  setMongoDBURI, 
  getConnectionErrorMessage,
  getDebugLog,
  clearDebugLog 
} from '@/lib/database';
import { IPlaybook, ISong } from '@/lib/models';

// Test results type
type TestResult = {
  name: string;
  status: 'running' | 'success' | 'failure';
  message?: string;
};

// Alternative connection URIs to try
const ALTERNATIVE_URIS = [
  'mongodb://127.0.0.1:27017/chordscribe',
  'mongodb://localhost:27017/chordscribe',
  'mongodb://0.0.0.0:27017/chordscribe'
];

// Component to run MongoDB tests
export default function MongoDBTest() {
  const [results, setResults] = React.useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);
  const [customUri, setCustomUri] = React.useState('');
  const [detailedError, setDetailedError] = React.useState<string>('');
  const [showDebugLogs, setShowDebugLogs] = React.useState(false);
  const [debugLogs, setDebugLogs] = React.useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = React.useState({
    isConnected: isConnectedToDatabase(),
    error: getConnectionErrorMessage(),
  });
  const [createdIds, setCreatedIds] = React.useState<{
    playbookId?: string;
    songId?: string;
  }>({});

  // Update connection status and debug logs periodically
  React.useEffect(() => {
    const checkConnection = () => {
      setConnectionStatus({
        isConnected: isConnectedToDatabase(),
        error: getConnectionErrorMessage(),
      });
      setDebugLogs(getDebugLog());
    };

    // Check immediately
    checkConnection();
    
    // Then check every 2 seconds
    const interval = setInterval(checkConnection, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Add test result
  const addResult = (name: string, status: 'running' | 'success' | 'failure', message?: string) => {
    setResults(prev => [...prev, { name, status, message }]);
  };

  // Update last test result
  const updateLastResult = (status: 'success' | 'failure', message?: string) => {
    setResults(prev => {
      const newResults = [...prev];
      const lastResult = newResults[newResults.length - 1];
      if (lastResult) {
        lastResult.status = status;
        if (message) lastResult.message = message;
      }
      return newResults;
    });
  };

  // Helper function to safely get ID string
  const getIdString = (doc: any): string => {
    if (!doc || !doc._id) return '';
    return doc._id.toString ? doc._id.toString() : String(doc._id);
  };

  // Show environment details for troubleshooting
  const getEnvironmentInfo = (): string => {
    return `Platform: ${Platform.OS} ${Platform.Version}\n` +
           `Running on: ${Platform.OS === 'web' ? 'Web Browser' : 'Native Device'}\n` +
           `App Version: ${require('../package.json').version}`;
  };
  
  // Reset debug logs
  const resetDebugLogs = () => {
    clearDebugLog();
    setDebugLogs([]);
  };

  // Test database connection
  const testConnection = async (): Promise<boolean> => {
    addResult('Database Connection', 'running');
    resetDebugLogs();
    try {
      // Reset detailed error
      setDetailedError('');
      
      const connected = await connectToDatabase();
      if (connected) {
        updateLastResult('success', 'Connected to MongoDB successfully');
        return true;
      } else {
        const errorMsg = getConnectionErrorMessage();
        updateLastResult('failure', `Failed to connect to MongoDB: ${errorMsg}`);
        setDetailedError(`Connection Error: ${errorMsg}\n\n${getEnvironmentInfo()}`);
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      updateLastResult('failure', `Error connecting to MongoDB: ${errorMessage}`);
      setDetailedError(`Connection Exception: ${errorMessage}\n\n${getEnvironmentInfo()}`);
      return false;
    }
  };

  // Try alternative connection strings
  const tryAlternativeConnections = async (): Promise<boolean> => {
    addResult('Try Alternative URIs', 'running');
    resetDebugLogs();
    
    for (const uri of ALTERNATIVE_URIS) {
      try {
        // First disconnect if already connected
        if (isConnectedToDatabase()) {
          await disconnectFromDatabase();
        }
        
        // Add a temporary result instead of updating the current one
        console.log(`Trying URI: ${uri}`);
        
        const connected = await setMongoDBURI(uri);
        if (connected) {
          updateLastResult('success', `Connected successfully with URI: ${uri}`);
          return true;
        }
      } catch (error: any) {
        console.warn(`Failed with URI ${uri}:`, error);
        // Continue with next URI
      }
    }
    
    updateLastResult('failure', 'All alternative URIs failed');
    return false;
  };

  // Test getting all playbooks
  const testGetAllPlaybooks = async (): Promise<boolean> => {
    addResult('Get All Playbooks', 'running');
    try {
      const playbooks = await PlaybookService.getAllPlaybooks();
      updateLastResult('success', `Successfully retrieved ${playbooks.length} playbooks`);
      return true;
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      updateLastResult('failure', `Error getting playbooks: ${errorMessage}`);
      return false;
    }
  };

  // Test creating a playbook
  const testCreatePlaybook = async (): Promise<string | null> => {
    addResult('Create Playbook', 'running');
    try {
      const data = {
        name: `Test Playbook ${new Date().toISOString()}`,
        description: 'This is a test playbook created during MongoDB testing'
      };
      
      const playbook = await PlaybookService.createPlaybook(data);
      const playbookId = getIdString(playbook);
      updateLastResult('success', `Created playbook with ID: ${playbookId}`);
      return playbookId;
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      updateLastResult('failure', `Error creating playbook: ${errorMessage}`);
      return null;
    }
  };

  // Test getting a playbook by ID
  const testGetPlaybookById = async (id: string): Promise<boolean> => {
    addResult('Get Playbook by ID', 'running');
    try {
      const playbook = await PlaybookService.getPlaybookById(id);
      if (playbook) {
        updateLastResult('success', `Retrieved playbook: ${playbook.name}`);
        return true;
      } else {
        updateLastResult('failure', 'Playbook not found');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      updateLastResult('failure', `Error getting playbook: ${errorMessage}`);
      return false;
    }
  };

  // Test updating a playbook
  const testUpdatePlaybook = async (id: string): Promise<boolean> => {
    addResult('Update Playbook', 'running');
    try {
      const data = {
        name: `Updated Test Playbook ${new Date().toISOString()}`,
        description: 'This playbook was updated during testing'
      };
      
      const updatedPlaybook = await PlaybookService.updatePlaybook(id, data);
      if (updatedPlaybook) {
        updateLastResult('success', `Playbook updated to: ${updatedPlaybook.name}`);
        return true;
      } else {
        updateLastResult('failure', 'Failed to update playbook');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      updateLastResult('failure', `Error updating playbook: ${errorMessage}`);
      return false;
    }
  };

  // Test adding a song to a playbook
  const testAddSongToPlaybook = async (playbookId: string): Promise<string | null> => {
    addResult('Add Song to Playbook', 'running');
    try {
      const songData: Partial<ISong> = {
        title: `Test Song ${new Date().toISOString()}`,
        key: 'C',
        sections: [
          {
            name: 'Verse',
            lines: [
              {
                chords: [
                  {
                    root: 'C',
                    quality: 'maj',
                    interval: '',
                    timing: 0
                  },
                  {
                    root: 'G',
                    quality: '',
                    interval: '',
                    timing: 4
                  }
                ]
              }
            ]
          }
        ]
      } as any;
      
      const updatedPlaybook = await PlaybookService.addSongToPlaybook(playbookId, songData);
      if (updatedPlaybook && updatedPlaybook.songs && updatedPlaybook.songs.length > 0) {
        const song = updatedPlaybook.songs[updatedPlaybook.songs.length - 1] as ISong;
        const songId = getIdString(song);
        updateLastResult('success', `Added song with ID: ${songId}`);
        return songId;
      } else {
        updateLastResult('failure', 'Failed to add song to playbook');
        return null;
      }
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      updateLastResult('failure', `Error adding song to playbook: ${errorMessage}`);
      return null;
    }
  };

  // Test updating a song
  const testUpdateSong = async (playbookId: string, songId: string): Promise<boolean> => {
    addResult('Update Song', 'running');
    try {
      const songData: Partial<ISong> = {
        title: `Updated Test Song ${new Date().toISOString()}`,
        key: 'D',
      };
      
      const updatedPlaybook = await PlaybookService.updateSongInPlaybook(playbookId, songId, songData);
      if (updatedPlaybook) {
        updateLastResult('success', 'Song updated successfully');
        return true;
      } else {
        updateLastResult('failure', 'Failed to update song');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      updateLastResult('failure', `Error updating song: ${errorMessage}`);
      return false;
    }
  };

  // Test deleting a song
  const testDeleteSong = async (playbookId: string, songId: string): Promise<boolean> => {
    addResult('Delete Song', 'running');
    try {
      const updatedPlaybook = await PlaybookService.deleteSongFromPlaybook(playbookId, songId);
      if (updatedPlaybook) {
        updateLastResult('success', 'Song deleted successfully');
        return true;
      } else {
        updateLastResult('failure', 'Failed to delete song');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      updateLastResult('failure', `Error deleting song: ${errorMessage}`);
      return false;
    }
  };

  // Test deleting a playbook
  const testDeletePlaybook = async (id: string): Promise<boolean> => {
    addResult('Delete Playbook', 'running');
    try {
      const success = await PlaybookService.deletePlaybook(id);
      if (success) {
        updateLastResult('success', 'Playbook deleted successfully');
        return true;
      } else {
        updateLastResult('failure', 'Failed to delete playbook');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      updateLastResult('failure', `Error deleting playbook: ${errorMessage}`);
      return false;
    }
  };

  // Test disconnection
  const testDisconnection = async (): Promise<boolean> => {
    addResult('Database Disconnection', 'running');
    try {
      const disconnected = await disconnectFromDatabase();
      if (disconnected) {
        updateLastResult('success', 'Disconnected from MongoDB successfully');
        return true;
      } else {
        updateLastResult('failure', 'Failed to disconnect from MongoDB');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      updateLastResult('failure', `Error disconnecting from MongoDB: ${errorMessage}`);
      return false;
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    setCreatedIds({});
    setDetailedError('');
    resetDebugLogs();

    // Start connection test
    const connected = await testConnection();
    
    // If regular connection fails, try alternative URIs
    if (!connected) {
      const alternativeConnected = await tryAlternativeConnections();
      if (!alternativeConnected) {
        setIsRunning(false);
        return;
      }
    }

    // Get all playbooks
    await testGetAllPlaybooks();

    // Create a playbook
    const playbookId = await testCreatePlaybook();
    if (!playbookId) {
      await testDisconnection();
      setIsRunning(false);
      return;
    }

    setCreatedIds(prev => ({ ...prev, playbookId }));

    // Get the playbook by ID
    const found = await testGetPlaybookById(playbookId);
    if (!found) {
      await testDeletePlaybook(playbookId);
      await testDisconnection();
      setIsRunning(false);
      return;
    }

    // Update the playbook
    const updated = await testUpdatePlaybook(playbookId);
    if (!updated) {
      await testDeletePlaybook(playbookId);
      await testDisconnection();
      setIsRunning(false);
      return;
    }

    // Add a song to the playbook
    const songId = await testAddSongToPlaybook(playbookId);
    if (!songId) {
      await testDeletePlaybook(playbookId);
      await testDisconnection();
      setIsRunning(false);
      return;
    }

    setCreatedIds(prev => ({ ...prev, songId }));

    // Update the song
    const songUpdated = await testUpdateSong(playbookId, songId);
    if (!songUpdated) {
      await testDeleteSong(playbookId, songId);
      await testDeletePlaybook(playbookId);
      await testDisconnection();
      setIsRunning(false);
      return;
    }

    // Delete the song
    const songDeleted = await testDeleteSong(playbookId, songId);
    if (!songDeleted) {
      await testDeletePlaybook(playbookId);
      await testDisconnection();
      setIsRunning(false);
      return;
    }

    // Delete the playbook
    await testDeletePlaybook(playbookId);

    // Disconnect from the database
    await testDisconnection();

    setIsRunning(false);
  };

  // Clean up if tests were interrupted
  const cleanUp = async () => {
    addResult('Clean Up', 'running');
    try {
      const { playbookId, songId } = createdIds;
      
      if (playbookId && songId) {
        await PlaybookService.deleteSongFromPlaybook(playbookId, songId);
      }
      
      if (playbookId) {
        await PlaybookService.deletePlaybook(playbookId);
      }
      
      await disconnectFromDatabase();
      updateLastResult('success', 'Clean up completed successfully');
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      updateLastResult('failure', `Error during clean up: ${errorMessage}`);
    }
    
    setCreatedIds({});
  };

  // Test custom connection
  const testCustomConnection = async () => {
    if (!customUri.trim()) {
      alert('Please enter a MongoDB URI');
      return;
    }
    
    addResult('Custom Connection', 'running');
    resetDebugLogs();
    try {
      // Disconnect first if connected
      if (isConnectedToDatabase()) {
        await disconnectFromDatabase();
      }
      
      const connected = await setMongoDBURI(customUri.trim());
      if (connected) {
        updateLastResult('success', 'Connected to custom MongoDB URI successfully');
      } else {
        const errorMsg = getConnectionErrorMessage();
        updateLastResult('failure', `Failed to connect to custom URI: ${errorMsg}`);
      }
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      updateLastResult('failure', `Error connecting to custom URI: ${errorMessage}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>MongoDB Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Connection Status:</Text>
        <Text style={[
          styles.statusText, 
          connectionStatus.isConnected ? styles.statusConnected : styles.statusDisconnected
        ]}>
          {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
        </Text>
        {connectionStatus.error && (
          <Text style={styles.errorText}>Error: {connectionStatus.error}</Text>
        )}
        <Text style={styles.environmentInfo}>{getEnvironmentInfo()}</Text>
      </View>
      
      <View style={styles.uriContainer}>
        <Text style={styles.uriLabel}>MongoDB URI:</Text>
        <TextInput
          style={styles.uriInput}
          value={customUri}
          onChangeText={setCustomUri}
          placeholder="mongodb://127.0.0.1:27017/chordscribe"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Button
          title="Connect"
          onPress={testCustomConnection}
          disabled={isRunning}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Run Tests" 
          onPress={runAllTests} 
          disabled={isRunning} 
        />
        
        <Button 
          title="Try Alternative URIs" 
          onPress={tryAlternativeConnections}
          disabled={isRunning} 
          color="#2196F3"
        />
        
        <Button 
          title="Clean Up" 
          onPress={cleanUp} 
          disabled={isRunning || !createdIds.playbookId} 
          color="orange"
        />
      </View>
      
      <View style={styles.debugContainer}>
        <View style={styles.debugHeader}>
          <Text style={styles.debugTitle}>Debug Logs:</Text>
          <View style={styles.debugToggleContainer}>
            <Text style={styles.debugToggleLabel}>Show Logs</Text>
            <Switch 
              value={showDebugLogs} 
              onValueChange={setShowDebugLogs}
            />
          </View>
        </View>
        
        {showDebugLogs && (
          <ScrollView style={styles.debugLogScroll}>
            {debugLogs.map((log, index) => (
              <Text key={index} style={styles.debugLogEntry}>{log}</Text>
            ))}
            {debugLogs.length === 0 && (
              <Text style={styles.debugLogEmpty}>No logs available yet. Try connecting first.</Text>
            )}
          </ScrollView>
        )}
        
        <Button 
          title="Clear Debug Logs" 
          onPress={resetDebugLogs}
          color="#795548"
        />
      </View>
      
      {detailedError ? (
        <View style={styles.detailedErrorContainer}>
          <Text style={styles.detailedErrorTitle}>Detailed Error Information:</Text>
          <ScrollView style={styles.detailedErrorScroll}>
            <Text style={styles.detailedErrorText}>{detailedError}</Text>
          </ScrollView>
        </View>
      ) : null}
      
      {results.length === 0 && !isRunning && !detailedError && (
        <Text style={styles.info}>
          Press "Run Tests" to test MongoDB connection and CRUD operations
        </Text>
      )}
      
      {isRunning && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Running tests...</Text>
        </View>
      )}
      
      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          
          {results.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultName}>{result.name}</Text>
                <View 
                  style={[
                    styles.resultStatus,
                    result.status === 'running' ? styles.running :
                    result.status === 'success' ? styles.success :
                    styles.failure
                  ]} 
                />
              </View>
              
              {result.message && (
                <Text 
                  style={[
                    styles.resultMessage,
                    result.status === 'failure' && styles.failureMessage
                  ]}
                >
                  {result.message}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusConnected: {
    color: '#4caf50',
  },
  statusDisconnected: {
    color: '#f44336',
  },
  errorText: {
    color: '#f44336',
    marginTop: 4,
  },
  environmentInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  uriContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  uriLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  uriInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  info: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  debugContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  debugToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  debugToggleLabel: {
    marginRight: 8,
    fontSize: 14,
  },
  debugLogScroll: {
    maxHeight: 200,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 8,
  },
  debugLogEntry: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    color: '#333',
    marginBottom: 2,
  },
  debugLogEmpty: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
  },
  detailedErrorContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  detailedErrorTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#d32f2f',
  },
  detailedErrorScroll: {
    maxHeight: 150,
  },
  detailedErrorText: {
    color: '#d32f2f',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
  },
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  resultItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
  },
  resultStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  running: {
    backgroundColor: '#ffcc00',
  },
  success: {
    backgroundColor: '#4caf50',
  },
  failure: {
    backgroundColor: '#f44336',
  },
  resultMessage: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
  },
  failureMessage: {
    color: '#f44336',
  },
}); 