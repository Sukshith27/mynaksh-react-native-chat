import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import MessageBubble from '../components/MessageBubble';
import InputBar from '../components/InputBar';

function ChatScreen() {
  const messages = useSelector((s) => s.chat.messages);
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Astrologer Vikram</Text>
        <TouchableOpacity style={styles.endBtn} onPress={() => {}}>
          <Text style={styles.endBtnText}>End Chat</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        contentContainerStyle={styles.list}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        inverted={false}
      />

      <InputBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  title: { fontSize: 18, fontWeight: '600' },
  endBtn: { padding: 8 },
  endBtnText: { color: '#e53935' },
  list: { padding: 12 },
});

export default ChatScreen;
