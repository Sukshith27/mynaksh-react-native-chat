import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { clearReplyTo, addMessage } from '../redux/chatSlice';

function InputBar() {
  const dispatch = useDispatch();
  const replyToId = useSelector((s) => s.chat.replyToId);
  const messages = useSelector((s) => s.chat.messages);
  const [value, setValue] = useState('');

  const replyMessage = replyToId ? messages.find((m) => m.id === replyToId) : null;

  const onSend = () => {
    if (value.trim().length === 0) return;
    const newMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: value.trim(),
      timestamp: Date.now(),
      type: 'text',
      replyTo: replyToId || undefined,
    };
    dispatch(addMessage(newMsg));
    setValue('');
    if (replyToId) dispatch(clearReplyTo());
  };

  return (
    <View style={styles.container}>
      {replyMessage ? (
        <View style={styles.replyPreview}>
          <Text style={styles.replyLabel}>Replying to</Text>
          <Text style={styles.replyText} numberOfLines={1} ellipsizeMode="tail">
            {replyMessage.text}
          </Text>
          <TouchableOpacity onPress={() => dispatch(clearReplyTo())}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder="Type a message"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={onSend}>
          <Text style={{ color: '#fff' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#ddd' },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 12, height: 44 },
  sendBtn: { backgroundColor: '#3b82f6', padding: 10, marginLeft: 8, borderRadius: 8 },
  replyPreview: { backgroundColor: '#fff4e5', padding: 8, borderRadius: 8, marginBottom: 8 },
  replyLabel: { color: '#8a6234', fontSize: 12, marginBottom: 4 },
  replyText: { color: '#333' },
  cancel: { color: '#e53935', marginTop: 4 },
});

export default InputBar;
