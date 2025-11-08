export const resolveMessage = (LocalizedStrings, messageKey, fallback) => {
  const hasLocalizedStrings = LocalizedStrings && typeof LocalizedStrings === 'object';

  if (messageKey && typeof messageKey === 'string') {
    const trimmedKey = messageKey.trim();

    if (trimmedKey.length > 0) {
      if (hasLocalizedStrings && LocalizedStrings[trimmedKey]) {
        return LocalizedStrings[trimmedKey];
      }

      return trimmedKey;
    }
  }

  if (typeof fallback === 'string' && fallback.trim().length > 0) {
    if (hasLocalizedStrings && LocalizedStrings[fallback]) {
      return LocalizedStrings[fallback];
    }

    return fallback;
  }

  return '';
};

