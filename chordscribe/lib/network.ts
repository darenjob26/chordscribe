import NetInfo from '@react-native-community/netinfo';

export const isNetworkAvailable = async (): Promise<boolean> => {
  const netState = await NetInfo.fetch();
  return netState.isConnected ?? false;
};

export const subscribeToNetworkChanges = (callback: (isConnected: boolean) => void) => {
  return NetInfo.addEventListener(state => {
    callback(state.isConnected ?? false);
  });
}; 