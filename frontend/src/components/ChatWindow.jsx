import MessageList from './MessageList';
import TypingIndicator from './TypingIndicator';
import MessageInput from './MessageInput';

export default function ChatWindow({
  username,
  messages,
  typingUsers,
  onSend,
  onTypingStart,
  onTypingStop,
  isConnected,
  errorMessage,
}) {
  return (
    <main className="chat-panel">
      <div className="chat-header">
        <h1># general</h1>
        <span className="room-tag">{messages.length} messages</span>
      </div>

      {errorMessage && <div className="banner-error">{errorMessage}</div>}

      <MessageList messages={messages} username={username} />
      <TypingIndicator typingUsers={typingUsers} />
      <MessageInput
        onSend={onSend}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
        disabled={false}
      />
    </main>
  );
}
