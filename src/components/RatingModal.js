import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { endSession, setRating } from '../redux/chatSlice';

export default function RatingModal() {
  const dispatch = useDispatch();
  const visible = useSelector((s) => s.chat.sessionEnded);
  const existing = useSelector((s) => s.chat.rating);
  const [rating, setLocalRating] = useState(existing || 0);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: visible ? 1 : 0, duration: 200, useNativeDriver: true }).start();
  }, [visible, anim]);

  const submit = () => {
    dispatch(setRating(rating));
    Alert.alert('Thanks', `Rating captured: ${rating} stars`);
  };

  const close = () => {
    // Just collapse visually; keep sessionEnded true to indicate session finished
    Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }).start();
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.backdrop, { opacity: anim }]} />
      <Animated.View
        style={[
          styles.container,
          { transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) }], opacity: anim },
        ]}
      >
        <Text style={styles.title}>Rate your session</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <TouchableOpacity key={s} onPress={() => setLocalRating(s)} style={styles.starBtn}>
              <Text style={[styles.star, rating >= s ? styles.starActive : null]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.thanks}>Thank you for the session ❤️</Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.submitBtn} onPress={submit}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={close}>
            <Text style={styles.cancelText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    marginTop: '20%',
    marginHorizontal: 28,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 8,
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  starsRow: { flexDirection: 'row', marginVertical: 8 },
  starBtn: { padding: 8 },
  star: { fontSize: 28, color: '#ddd' },
  starActive: { color: '#F59E0B' },
  thanks: { marginTop: 12, color: '#333' },
  actionsRow: { flexDirection: 'row', marginTop: 16 },
  submitBtn: { backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  submitText: { color: '#fff', fontWeight: '600' },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  cancelText: { color: '#374151' },
});