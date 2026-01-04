import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setLikeState, setDislikeReasons, clearFeedback } from '../redux/chatSlice';

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

  // transient saved indicator: show only after user stops interacting (debounced)
  const [saved, setSaved] = useState(false);
  const idleTimerRef = useRef(null); // waits for inactivity before showing saved
  const hideTimerRef = useRef(null); // hides the saved hint after visible timeout

  // micro animations for like/dislike
  const likeAnim = useRef(new Animated.Value(1)).current;
  const dislikeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: expanded ? 1 : 0, duration: 180, useNativeDriver: true }).start();
  }, [expanded, anim]);

  useEffect(() => {
    const reasons = (fb && fb.dislikeReasons) || [];
    // only update local state if different to avoid update loops
    const same = reasons.length === selected.length && reasons.every((r, i) => selected[i] === r);
    if (!same) setSelected(reasons);

    // If the feedback was just set to liked, auto-close the chips.
    if (fb?.liked) {
      if (expanded) setExpanded(false);
    } else {
      // If there are explicit reasons, ensure the chips are open; otherwise preserve manual expansion state
      if (reasons.length > 0 && !expanded) setExpanded(true);
    }

    // initialize/animate chip values
    CHIPS.forEach((c) => {
      if (!chipAnimsRef.current[c]) chipAnimsRef.current[c] = new Animated.Value(reasons.includes(c) ? 1 : 0);
      else {
        Animated.timing(chipAnimsRef.current[c], { toValue: reasons.includes(c) ? 1 : 0, duration: 160, useNativeDriver: true }).start();
      }
    });

    // clear timers on unmount or when fb/selected/expanded changes
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [fb, selected, expanded]);

  const scheduleSavedHint = () => {
    // debounce: wait 500ms after last interaction before showing 'Saved'
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    idleTimerRef.current = setTimeout(() => {
      setSaved(true);
      // hide after 900ms
      hideTimerRef.current = setTimeout(() => setSaved(false), 900);
      idleTimerRef.current = null;
    }, 500);
  };

  const bounce = (animRef) => {
    Animated.sequence([
      Animated.timing(animRef, { toValue: 1.06, duration: 110, useNativeDriver: true }),
      Animated.timing(animRef, { toValue: 1, duration: 110, useNativeDriver: true }),
    ]).start();
  };

  const onLike = () => {
    if (fb?.liked === true) {
      // toggle back to neutral
      dispatch(clearFeedback(messageId));
      setExpanded(false);
    } else {
      dispatch(setLikeState({ messageId, liked: true }));
      setExpanded(false);
    }
    bounce(likeAnim);
    scheduleSavedHint();
  };

  const onDislike = () => {
    if (fb?.liked === false) {
      // already disliked: toggle back to neutral and collapse
      dispatch(clearFeedback(messageId));
      setExpanded(false);
    } else {
      dispatch(setLikeState({ messageId, liked: false }));
      setExpanded(true);
    }
    bounce(dislikeAnim);
    scheduleSavedHint();
  };

  const liked = fb?.liked ?? false;

  const toggleChip = (chip) => {
    const next = selected.includes(chip) ? selected.filter((c) => c !== chip) : [...selected, chip];
    setSelected(next);
    dispatch(setDislikeReasons({ messageId, reasons: next }));

    // schedule debounce-based saved hint
    scheduleSavedHint();

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
        <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
          <TouchableOpacity activeOpacity={0.9} style={[styles.btn, liked ? styles.btnActive : null]} onPress={onLike}>
            <Text style={liked ? styles.btnTextActive : styles.btnText}>Like</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: dislikeAnim }], marginLeft: 8 }}>
          <TouchableOpacity activeOpacity={0.9} style={[styles.btn, !liked ? styles.btnActiveDanger : null]} onPress={onDislike}>
            <Text style={!liked ? styles.btnTextActiveDanger : styles.btnText}>Dislike</Text>
          </TouchableOpacity>
        </Animated.View>

        {saved ? <Text style={styles.saved}>Saved</Text> : null}
      </View>

      <Animated.View style={[styles.chips, rStyle]} pointerEvents={expanded ? 'auto' : 'none'}>
        {CHIPS.map((c) => {
          const active = selected.includes(c);
          const animVal = chipAnimsRef.current[c] || new Animated.Value(0);
          const scale = animVal.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
          return (
            <Animated.View key={c} style={{ transform: [{ scale }], marginRight: 6 }}>
              <TouchableOpacity activeOpacity={0.85} style={[styles.chip, active ? styles.chipActive : null]} onPress={() => toggleChip(c)}>
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f3f3f3',
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: '#FEE2E2', borderColor: '#fca5a5' },
  chipText: { color: '#333', fontSize: 14 },
  chipTextActive: { color: '#7F1D1D', fontWeight: '700' },
  saved: { marginLeft: 12, color: '#065F46', fontWeight: '600' },
});