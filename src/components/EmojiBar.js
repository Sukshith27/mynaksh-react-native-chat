import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const EMOJIS = ['🙏', '✨', '🌙', '🔥', '❤️'];

export default function EmojiBar({ onSelect }) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {EMOJIS.map((e) => (
        <TouchableOpacity key={e} style={styles.emojiBtn} onPress={() => onSelect(e)}>
          <Text style={styles.emoji}>{e}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 8,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  emojiBtn: { padding: 6 },
  emoji: { fontSize: 22 },
});
