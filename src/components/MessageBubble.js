import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function MessageBubble({ message }) {
  const isUser = message.sender === 'user';
  const containerStyle = [
    styles.container,
    isUser ? styles.userContainer : styles.otherContainer,
  ];

  return (
    <View style={containerStyle}>
      {message.type === 'event' ? (
        <Text style={styles.eventText}>{message.text}</Text>
      ) : (
        <>
          <Text style={styles.text}>{message.text}</Text>
          {message.reaction ? <Text style={styles.reaction}>{message.reaction}</Text> : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
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
  eventText: {
    alignSelf: 'center',
    color: '#666',
  },
  text: { color: '#111' },
  reaction: { marginTop: 6 },
});

export default MessageBubble;
