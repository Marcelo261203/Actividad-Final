import { Platform } from 'react-native';

export const getKeyboardBehavior = () => {
  return Platform.OS === 'ios' ? 'padding' : 'height';
};

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export const getKeyboardVerticalOffset = () => {
  if (isWeb) return 0;
  return isIOS ? 0 : 0;
};
