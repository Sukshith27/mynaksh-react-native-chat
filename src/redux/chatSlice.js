import { createSlice } from '@reduxjs/toolkit';

const initialMessages = [
  {
    id: '1',
    sender: 'system',
    text: 'Your session with Astrologer Vikram has started.',
    timestamp: 1734681480000,
    type: 'event',
  },
  {
    id: '2',
    sender: 'user',
    text: "Namaste. I am feeling very anxious about my current job. Can you look at my chart?",
    timestamp: 1734681600000,
    type: 'text',
  },
  {
    id: '3',
    sender: 'ai_astrologer',
    text: "Namaste! I am analyzing your birth details. Currently, you are running through Shani Mahadasha. This often brings pressure but builds resilience.",
    timestamp: 1734681660000,
    type: 'ai',
    hasFeedback: true,
    feedbackType: 'liked',
  },
  {
    id: '4',
    sender: 'human_astrologer',
    text: "I see the same. Look at your 6th house; Saturn is transiting there. This is why you feel the workload is heavy.",
    timestamp: 1734681720000,
    type: 'human',
  },
  {
    id: '5',
    sender: 'user',
    text: 'Is there any remedy for this? I find it hard to focus.',
    timestamp: 1734681780000,
    type: 'text',
    replyTo: '4',
  },
  {
    id: '6',
    sender: 'ai_astrologer',
    text: 'I suggest chanting the Shani Mantra 108 times on Saturdays. Would you like the specific mantra text?',
    timestamp: 1734681840000,
    type: 'ai',
    hasFeedback: false,
  },
];

const initialState = {
  messages: initialMessages,
  replyToId: null,
  reactions: {}, // { messageId: [emoji, ...] }
  feedback: {}, // { messageId: { liked: bool, dislikeReasons: ["Inaccurate"] } }
  sessionEnded: false,
  rating: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setReplyTo(state, action) {
      state.replyToId = action.payload; // message id
    },
    clearReplyTo(state) {
      state.replyToId = null;
    },
    addMessage(state, action) {
      state.messages.push(action.payload);
    },
    addReaction(state, action) {
      const { messageId, emoji } = action.payload;
      if (!state.reactions[messageId]) state.reactions[messageId] = [];
      state.reactions[messageId].push(emoji);
      // also attach to message object for simple rendering
      const msg = state.messages.find((m) => m.id === messageId);
      if (msg) {
        if (!msg.reaction) msg.reaction = [];
        msg.reaction.push(emoji);
      }
    },
    toggleLike(state, action) {
      const { messageId } = action.payload;
      const fb = state.feedback[messageId] || { liked: false, dislikeReasons: [] };
      fb.liked = !fb.liked;
      // clear dislike reasons if liked now
      if (fb.liked) fb.dislikeReasons = [];
      state.feedback[messageId] = fb;
    },
    setLikeState(state, action) {
      const { messageId, liked } = action.payload;
      const fb = state.feedback[messageId] || { liked: false, dislikeReasons: [] };
      fb.liked = liked;
      if (liked) fb.dislikeReasons = [];
      state.feedback[messageId] = fb;
    },
    setDislikeReasons(state, action) {
      const { messageId, reasons } = action.payload; // reasons: ["Inaccurate"]
      const fb = state.feedback[messageId] || { liked: false, dislikeReasons: [] };
      fb.liked = false;
      fb.dislikeReasons = reasons;
      state.feedback[messageId] = fb;
    },
    endSession(state) {
      state.sessionEnded = true;
    },
    setRating(state, action) {
      state.rating = action.payload; // number 1-5
    },
  },
});

export const {
  setReplyTo,
  clearReplyTo,
  addMessage,
  addReaction,
  toggleLike,
  setDislikeReasons,
  endSession,
  setRating,
} = chatSlice.actions;

export default chatSlice.reducer;
