import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import MessageBubble from '../components/MessageBubble';
import InputBar from '../components/InputBar';
import { endSession } from '../redux/chatSlice';
import RatingModal from '../components/RatingModal';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function ChatScreen() {
  const messages = useSelector((s) => s.chat.messages);
  const sessionEnded = useSelector((s) => s.chat.sessionEnded);
  const dispatch = useDispatch();

  const onEnd = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dispatch(endSession());
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Astrologer Vikram</Text>
        <TouchableOpacity style={styles.endBtn} onPress={onEnd}>
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

      {sessionEnded ? <RatingModal /> : null}
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
