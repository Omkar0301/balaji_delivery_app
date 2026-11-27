import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ImageProps,
  Pressable,
  Text,
} from 'react-native';
import { Colors } from '../../theme/colors';

export interface ProgressiveImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  fallbackEmoji?: string;
  borderRadius?: number;
  maxWidth?: number;
}

function optimizeImageUri(uri: string, maxWidth: number): string {
  if (!uri || !uri.includes('images.unsplash.com')) return uri;
  if (uri.includes('w=')) {
    return uri.replace(/w=\d+/, `w=${maxWidth}`);
  }
  const sep = uri.includes('?') ? '&' : '?';
  return `${uri}${sep}w=${maxWidth}&auto=format&fit=crop&q=75`;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  uri,
  fallbackEmoji = '🥦',
  borderRadius = 0,
  maxWidth = 400,
  style,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const optimizedUri = optimizeImageUri(uri, maxWidth);

  return (
    <View style={[styles.container, { borderRadius }, style]}>
      {/* Show placeholder while image is resolving */}
      {loading && !error && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: Colors.surfaceMuted, borderRadius },
          ]}
        />
      )}

      {/* Actual Remote Image */}
      {!error && (
        <Image
          source={{ uri: optimizedUri }}
          style={[styles.image, { borderRadius }]}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          {...props}
        />
      )}

      {/* Graceful Fallback if image fails to load */}
      {error && (
        <Pressable
          onPress={() => {
            setError(false);
            setLoading(true);
          }}
          style={[styles.fallbackContainer, { borderRadius }]}
        >
          <Text style={styles.fallbackEmoji}>{fallbackEmoji}</Text>
          <Text style={styles.fallbackText}>Tap to retry</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.surfaceContainerLow,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5E9',
    padding: 8,
  },
  fallbackEmoji: {
    fontSize: 28,
  },
  fallbackText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '700',
    marginTop: 2,
  },
});
