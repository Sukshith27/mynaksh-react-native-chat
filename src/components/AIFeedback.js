import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setLikeState, setDislikeReasons } from '../redux/chatSlice';

const CHIPS = ['Inaccurate', 'Too Vague', 'Too Long'];

export default function AIFeedback({ messageId }) {
  const dispatch = useDispatch();
  // select raw feedback entry (may be undefined)
  const fb = useSelector((s) => s.chat.feedback[messageId]);

  // local state driven from fb; avoid inline fallback object in selector (that creates a new reference each render)
  const [selected, setSelected] = useState((fb && fb.dislikeReasons) || []);
  const [expanded, setExpanded] = useState(!fb?.liked && selected.length > 0);
  const anim = useRef(new Animated.Value(expanded ? 1 : 0)).current;
  const chipAnimsRef = useRef({});

  useEffect(() => {
    Animated.timing(anim, { toValue: expanded ? 1 : 0, duration: 180, useNativeDriver: true }).start();
  }, [expanded, anim]);

  useEffect(() => {
    const reasons = (fb && fb.dislikeReasons) || [];
    // only update local state if different to avoid update loops
    const same = reasons.length === selected.length && reasons.every((r, i) => selected[i] === r);
    if (!same) setSelected(reasons);

    const shouldExpand = !fb?.liked && reasons.length > 0;
    if (shouldExpand !== expanded) setExpanded(shouldExpand);

    // initialize/animate chip values
    CHIPS.forEach((c) => {
      if (!chipAnimsRef.current[c]) chipAnimsRef.current[c] = new Animated.Value(reasons.includes(c) ? 1 : 0);
      else {
        Animated.timing(chipAnimsRef.current[c], { toValue: reasons.includes(c) ? 1 : 0, duration: 160, useNativeDriver: true }).start();
      }
    });
  }, [fb, selected, expanded]);

  const onLike = () => {
    dispatch(setLikeState({ messageId, liked: true }));
    setExpanded(false);
  };

  const onDislike = () => {
    dispatch(setLikeState({ messageId, liked: false }));
    setExpanded(true);
  };

  const liked = fb?.liked ?? false;

  const toggleChip = (chip) => {
    const next = selected.includes(chip) ? selected.filter((c) => c !== chip) : [...selected, chip];
    setSelected(next);
    dispatch(setDislikeReasons({ messageId, reasons: next }));

    // animate chip
    const animVal = chipAnimsRef.current[chip] || new Animated.Value(0);
    chipAnimsRef.current[chip] = animVal;
    Animated.sequence([
      Animated.timing(animVal, { toValue: next.includes(chip) ? 1 : 0, duration: 160, useNativeDriver: true }),
    ]).start();
  };

  const rStyle = {
    opacity: anim,
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) }, { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }],
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.btn, liked ? styles.btnActive : null]} onPress={onLike}>
          <Text style={liked ? styles.btnTextActive : styles.btnText}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, !liked ? styles.btnActiveDanger : null]} onPress={onDislike}>
          <Text style={!liked ? styles.btnTextActiveDanger : styles.btnText}>Dislike</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.chips, rStyle]} pointerEvents={expanded ? 'auto' : 'none'}>
        {CHIPS.map((c) => {
          const active = selected.includes(c);
          const animVal = chipAnimsRef.current[c] || new Animated.Value(0);
          const scale = animVal.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
          return (
            <Animated.View key={c} style={{ transform: [{ scale }], marginRight: 8 }}>
              <TouchableOpacity style={[styles.chip, active ? styles.chipActive : null]} onPress={() => toggleChip(c)}>
                <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{c}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  row: { flexDirection: 'row', gap: 8 },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#eee',
  },
  btnActive: { backgroundColor: '#D1FAE5' },
  btnActiveDanger: { backgroundColor: '#FEE2E2' },
  btnText: { color: '#111' },
  btnTextActive: { color: '#065F46', fontWeight: '600' },
  btnTextActiveDanger: { color: '#7F1D1D', fontWeight: '600' },
  chips: { marginTop: 8, flexDirection: 'row', gap: 8 },
  chip: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  chipActive: { backgroundColor: '#FEE2E2', borderColor: '#fbcaca' },
  chipText: { color: '#333' },
  chipTextActive: { color: '#7F1D1D', fontWeight: '600' },
});