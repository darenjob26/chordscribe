import NetInfo from '@react-native-community/netinfo';

// for testing
const forceOffline = false;

export const isNetworkAvailable = async (): Promise<boolean> => {
  const netState = await NetInfo.fetch();
  if(forceOffline){
    return false;
  }
  return netState.isConnected ?? false;
};

export const subscribeToNetworkChanges = (callback: (isConnected: boolean) => void) => {
  return NetInfo.addEventListener(state => {
    if(forceOffline){
      callback(false);
    } else {
      callback(state.isConnected ?? false);
    }
  });
}; 