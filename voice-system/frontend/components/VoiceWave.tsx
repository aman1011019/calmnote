import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  withSequence,
  cancelAnimation
} from 'react-native-reanimated';

export default function VoiceWave({ isListening }: { isListening: boolean }) {
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const scale3 = useSharedValue(1);

  useEffect(() => {
    if (isListening) {
      // Create organic, slightly offset wavy oscillation
      scale1.value = withRepeat(withSequence(withTiming(1.6, { duration: 400 }), withTiming(1, { duration: 400 })), -1, true);
      
      setTimeout(() => {
        scale2.value = withRepeat(withSequence(withTiming(1.8, { duration: 400 }), withTiming(1, { duration: 400 })), -1, true);
      }, 150);
      
      setTimeout(() => {
        scale3.value = withRepeat(withSequence(withTiming(1.5, { duration: 400 }), withTiming(1, { duration: 400 })), -1, true);
      }, 300);
    } else {
      // Calm down smoothly
      cancelAnimation(scale1);
      cancelAnimation(scale2);
      cancelAnimation(scale3);
      scale1.value = withTiming(1);
      scale2.value = withTiming(1);
      scale3.value = withTiming(1);
    }
  }, [isListening, scale1, scale2, scale3]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.bar, { transform: [{ scaleY: scale1 }] }]} />
      <Animated.View style={[styles.bar, { transform: [{ scaleY: scale2 }] }]} />
      <Animated.View style={[styles.bar, { transform: [{ scaleY: scale3 }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 100,
  },
  bar: {
    width: 14,
    height: 35,
    backgroundColor: '#6366f1',
    borderRadius: 7,
  }
});
