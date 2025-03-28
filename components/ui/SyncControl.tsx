import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useMongoDB } from '@/providers/mongodb-provider';
import { initLocalStorageDB, clearLocalStorageDB, isLocalStorageDBActive, stopLocalStorageDB } from '@/lib/local-storage-db';
import { connectToDatabase } from '@/lib/database';

export function SyncControl() {
  const { isOnline, isLoading, syncWithDatabase, reconnect } = useMongoDB();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [isReconnecting, setIsReconnecting] = React.useState(false);
  const [syncResult, setSyncResult] = React.useState<string | null>(null);
  const [usingLocalStorage, setUsingLocalStorage] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Check if local storage DB is active
    const checkLocalStorage = async () => {
      const isActive = await isLocalStorageDBActive();
      setUsingLocalStorage(isActive);
    };
    
    checkLocalStorage();
  }, [isOnline]);

  const handleSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setSyncResult(null);
    
    try {
      const success = await syncWithDatabase();
      setSyncResult(success ? 'Sync completed successfully' : 'Sync failed');
    } catch (error) {
      setSyncResult('Error during sync');
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
      
      // Clear result message after 3 seconds
      setTimeout(() => {
        setSyncResult(null);
      }, 3000);
    }
  };

  const handleReconnect = async () => {
    if (isReconnecting) return;
    
    setIsReconnecting(true);
    setSyncResult(null);
    
    try {
      const success = await reconnect();
      setSyncResult(success ? 'Connected to MongoDB' : 'Connection failed');
    } catch (error) {
      setSyncResult('Error connecting');
      console.error('Reconnection error:', error);
    } finally {
      setIsReconnecting(false);
      
      // Clear result message after 3 seconds
      setTimeout(() => {
        setSyncResult(null);
      }, 3000);
    }
  };

  const toggleLocalStorage = async () => {
    if (isReconnecting || isSyncing) return;

    if (usingLocalStorage) {
      // Stop or clear the local storage DB
      Alert.alert(
        'Local Storage Options',
        'What would you like to do with the local storage database?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Clear Data',
            style: 'destructive',
            onPress: async () => {
              try {
                await clearLocalStorageDB();
                setSyncResult('Local storage database cleared');
                setTimeout(() => setSyncResult(null), 3000);
              } catch (error) {
                console.error('Failed to clear local storage DB:', error);
                setSyncResult('Failed to clear local storage');
                setTimeout(() => setSyncResult(null), 3000);
              }
            },
          },
          {
            text: 'Stop DB',
            style: 'destructive',
            onPress: async () => {
              try {
                await stopLocalStorageDB();
                setUsingLocalStorage(false);
                setSyncResult('Local storage database stopped');
                setTimeout(() => setSyncResult(null), 3000);
              } catch (error) {
                console.error('Failed to stop local storage DB:', error);
                setSyncResult('Failed to stop local storage');
                setTimeout(() => setSyncResult(null), 3000);
              }
            },
          },
        ]
      );
    } else {
      // Initialize the local storage DB
      try {
        setIsReconnecting(true);
        await initLocalStorageDB();
        await connectToDatabase(); // Connect to the local storage DB
        setUsingLocalStorage(true);
        setSyncResult('Local storage database initialized');
        setTimeout(() => setSyncResult(null), 3000);
      } catch (error) {
        console.error('Failed to initialize local storage DB:', error);
        setSyncResult('Failed to initialize local storage');
        setTimeout(() => setSyncResult(null), 3000);
      } finally {
        setIsReconnecting(false);
      }
    }
  };

  // Only show local storage option in development
  const showDevOptions = __DEV__;

  return (
    <View className="flex flex-col bg-gray-100 dark:bg-gray-800 rounded-md mb-2">
      {/* Connection status row */}
      <View className="flex flex-row items-center justify-between p-2">
        <View className="flex flex-row items-center space-x-2">
          <View 
            className={`w-3 h-3 rounded-full ${
              isOnline ? 'bg-green-500' : 'bg-red-500'
            }`} 
          />
          <Text className="text-sm dark:text-white">
            {isOnline 
              ? usingLocalStorage 
                ? 'Using Local Storage DB'
                : 'Connected to MongoDB' 
              : 'Offline Mode'}
          </Text>
        </View>
        
        <View className="flex flex-row space-x-2">
          {!isOnline && (
            <TouchableOpacity 
              className="px-3 py-1 rounded-md bg-yellow-500"
              onPress={handleReconnect}
              disabled={isReconnecting}
            >
              {isReconnecting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white">Connect</Text>
              )}
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            className={`px-3 py-1 rounded-md ${
              isOnline ? 'bg-blue-500' : 'bg-gray-400'
            }`}
            onPress={handleSync}
            disabled={!isOnline || isSyncing}
          >
            {isSyncing || isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white">Sync</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Dev options row - only in development */}
      {showDevOptions && (
        <View className="border-t border-gray-200 dark:border-gray-700 p-2">
          <TouchableOpacity 
            className={`px-3 py-1 rounded-md ${
              usingLocalStorage ? 'bg-red-500' : 'bg-purple-500'
            } self-start`}
            onPress={toggleLocalStorage}
            disabled={isReconnecting || isSyncing}
          >
            <Text className="text-white">
              {isReconnecting ? 'Please wait...' : usingLocalStorage ? 'Manage Local Storage' : 'Initialize Local Storage DB'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Status message */}
      {syncResult && (
        <View className="absolute bottom-0 left-0 right-0 p-1 bg-black bg-opacity-70">
          <Text className="text-xs text-center text-white">{syncResult}</Text>
        </View>
      )}
    </View>
  );
} 