import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { setReplyTo, addReaction } from '../redux/chatSlice';
import EmojiBar from './EmojiBar';
import ReactionPill from './ReactionPill';
import AIFeedback from './AIFeedback';

function MessageBubble({ message }) {
  const dispatch = useDispatch();
  const translateX = useRef(new Animated.Value(0)).current;
  const isEvent = message.type === 'event';
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const emojiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(emojiAnim, {
      toValue: showEmojiBar ? 1 : 0,
      duration: 160,
      useNativeDriver: true,
    }).start();
  }, [showEmojiBar, emojiAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) translateX.setValue(Math.min(gestureState.dx, 130));
      },
      onPanResponderRelease: (_, gestureState) => {
        const threshold = 80;
        if (gestureState.dx > threshold) {
          dispatch(setReplyTo(message.id));
        }
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      },
      onPanResponderTerminationRequest: () => true,
      onStartShouldSetResponderCapture: () => false,
    })
  ).current;

  const onLongPress = () => {
    // show emoji bar anchored at this message
    setShowEmojiBar(true);
  };

  const onSelectEmoji = (emoji) => {
    dispatch(addReaction({ messageId: message.id, emoji }));
    setShowEmojiBar(false);
  };

  const rStyle = { transform: [{ translateX }] };

  const rEmojiStyle = {
    opacity: emojiAnim,
    transform: [
      { translateY: emojiAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) },
      { scale: emojiAnim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) },
    ],
  };

  return (
    <View style={[styles.wrapper, message.reaction && message.reaction.length > 0 ? styles.wrapperWithReactions : null]}>
      <Animated.View
        style={[
          styles.replyIcon,
          {
            opacity: translateX.interpolate({ inputRange: [0, 30, 80], outputRange: [0, 0.6, 1] }),
            transform: [{ translateX: translateX.interpolate({ inputRange: [0, 130], outputRange: [-20, 10] }) }],
          },
        ]}
        pointerEvents="none"
      >
        <Text style={{ fontSize: 18 }}>↩️</Text>
      </Animated.View>

      <Animated.View
        style={[styles.container, message.sender === 'user' ? styles.userContainer : styles.otherContainer, rStyle]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity activeOpacity={0.9} onLongPress={onLongPress}>
          {isEvent ? (
            <Text style={styles.eventText}>{message.text}</Text>
          ) : (
            <>
              <Text style={styles.text}>{message.text}</Text>
            </>
          )}
        </TouchableOpacity>

        {/* AI feedback UI (like/dislike + chips) shown only when AI message explicitly allows feedback */}
        {message.sender === 'ai_astrologer' && message.hasFeedback ? <AIFeedback messageId={message.id} /> : null}

        {/* WhatsApp-like reaction pills partially overlay the message */}
        {message.reaction && message.reaction.length > 0 ? (
  <Animated.View
    style={[
      styles.reactionOverlap,
      message.sender === 'user'
        ? styles.reactionRightOverlap
        : styles.reactionLeftOverlap,
    ]}
    pointerEvents="none"
  >
    <ReactionPill emojis={message.reaction} compact />
  </Animated.View>
) : null}

<Animated.View
  pointerEvents={showEmojiBar ? 'auto' : 'none'}
  style={[
    styles.emojiBarWrapper,
    rEmojiStyle,
    message.sender === 'user' ? styles.emojiRight : styles.emojiLeft,
  ]}
>
  <EmojiBar onSelect={onSelectEmoji} />
</Animated.View>

      </Animated.View>
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
  emojiBarWrapper: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: 8,
    zIndex: 10,
  },
  emojiLeft: { left: 0 },
  emojiRight: { right: 0 },
  reactionOverlap: {
    position: 'absolute',
    bottom: -10,
    zIndex: 20,
  },
  reactionLeftOverlap: {
    left: 10,
  },
  reactionRightOverlap: {
    right: 10,
  },  wrapperWithReactions: {
    marginBottom: 28,
  },});

export default MessageBubble;
