import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';
import { setReplyTo } from '../redux/chatSlice';

function MessageBubble({ message }) {
  const dispatch = useDispatch();
  const translateX = useSharedValue(0);
  const isEvent = message.type === 'event';

  const onReply = (id) => {
    dispatch(setReplyTo(id));
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      // only allow right swipe
      if (e.translationX > 0) translateX.value = Math.min(e.translationX, 130);
    })
    .onEnd(() => {
      const threshold = 80;
      if (translateX.value > threshold) {
        // set reply state on JS thread
        runOnJS(onReply)(message.id);
      }
      translateX.value = withSpring(0, { damping: 12, stiffness: 200 });
    });

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const rIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, 30, 80], [0, 0.6, 1]),
    transform: [{ translateX: interpolate(translateX.value, [0, 130], [-20, 10]) }],
  }));

  const containerStyle = [styles.container, message.sender === 'user' ? styles.userContainer : styles.otherContainer];

  return (
    <View style={styles.wrapper}>
      {/* Reply icon shown as user swipes */}
      <Animated.View style={[styles.replyIcon, rIconStyle]} pointerEvents="none">
        <Text style={{ fontSize: 18 }}>↩️</Text>
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[containerStyle, rStyle]}>
          {isEvent ? (
            <Text style={styles.eventText}>{message.text}</Text>
          ) : (
            <>
              <Text style={styles.text}>{message.text}</Text>
              {message.reaction ? <Text style={styles.reaction}>{message.reaction}</Text> : null}
            </>
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12, position: 'relative' },
  container: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 12,
  },
  userContainer: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  otherContainer: {
    backgroundColor: '#F1F0F0',
    alignSelf: 'flex-start',
  },
  replyIcon: {
    position: 'absolute',
    left: -40,
    top: '50%',
    marginTop: -12,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  eventText: {
    alignSelf: 'center',
    color: '#666',
  },
  text: { color: '#111' },
  reaction: { marginTop: 6 },
});

export default MessageBubble;
