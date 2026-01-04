import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// emojis: array of strings
export default function ReactionPill({ emojis = [], compact = false }) {
  if (!emojis || emojis.length === 0) return null;

  // group counts
  const counts = emojis.reduce((acc, e) => {
    acc[e] = (acc[e] || 0) + 1;
    return acc;
  }, {});

  const items = Object.entries(counts).map(([emoji, count]) => ({ emoji, count }));

  return (
    <View style={styles.container} pointerEvents="box-none">
      {items.map((it) => (
        <View key={it.emoji} style={[styles.pill, compact ? styles.pillCompact : null]}>
          <Text style={[styles.emoji, compact ? styles.emojiCompact : null]}>{it.emoji}</Text>
          {it.count > 1 ? <Text style={[styles.count, compact ? styles.countCompact : null]}>{it.count}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  pill: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
    minHeight: 28,
    minWidth: 28,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
  },
  pillCompact: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 14,
    minHeight: 22,
    minWidth: 22,
  },
  emoji: { fontSize: 14, color: '#fff', marginRight: 6 },
  emojiCompact: { fontSize: 12, marginRight: 4 },
  count: { color: '#fff', fontSize: 12 },
  countCompact: { fontSize: 11 },
});