yarn install
npx react-native start
npx react-native run-android
# or
npx react-native run-ios


🚀 Features Implemented
1. Interactive Message Actions

Swipe to Reply

Swipe a message to the right to reply.

Message springs back after release.

“Replying to…” preview appears above the input.

Sent message shows the replied message context (WhatsApp-style).

Emoji Reactions

Long-press any message to open an emoji bar.

Selecting an emoji attaches it below the message.

Reactions are grouped and shown as compact pills.

2. AI Feedback & Session Flow

AI Like / Dislike Feedback

Available only for AI astrologer messages.

Like / Dislike toggle.

On Dislike, feedback chips expand:

Inaccurate

Too Vague

Too Long

Selected reasons are stored locally with smooth animations.

End Chat & Rating

“End Chat” button in the header.

Full-screen animated overlay appears.

5-star rating component.

Confirmation alert after submission.

🧠 Technical Decisions
Animations

Used Animated for:

Swipe-to-reply motion

Emoji bar transitions

Feedback chip animations

Rating modal transitions

Animations are kept lightweight and focused on UX clarity.

Gesture Handling

Used PanResponder for swipe gestures.

Threshold-based swipe detection for reply action.

Long-press handled via TouchableOpacity.

Gesture logic was implemented first for correctness and UX validation.
The structure allows easy migration to Reanimated + Gesture Handler if required.

State Management

Redux Toolkit used for predictable state updates.

Centralized handling for:

Messages

Reply state

Emoji reactions

AI feedback

Session end & rating