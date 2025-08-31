// Web-specific platform utilities
export const Platform = {
  OS: 'web',
  select: (obj: any) => obj.web || obj.default || {},
};

export const isWeb = true;
export const isIOS = false;
export const isAndroid = false;

export const getKeyboardBehavior = () => 'height';
export const getKeyboardVerticalOffset = () => 0;

