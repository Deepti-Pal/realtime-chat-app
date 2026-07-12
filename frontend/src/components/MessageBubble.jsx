import { formatClock } from '../utils/formatTime';

export default function MessageBubble({ message, isMe }) {
  return (
    <div className={`message-row${isMe ? ' is-me' : ''}`}>
      <div className="message-bubble-wrap">
        <div className="message-meta">
          {!isMe && <span className="message-username">{message.username}</span>}
          <span className="message-stamp">{formatClock(message.createdAt)}</span>
        </div>
        <div className="message-bubble">{message.text}</div>
      </div>
    </div>
  );
}
