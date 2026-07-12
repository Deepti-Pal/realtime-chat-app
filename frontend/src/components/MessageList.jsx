import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { formatDayLabel } from '../utils/formatTime';

export default function MessageList({ messages, username }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="message-list">
        <div className="empty-history">
          <h3>No messages yet</h3>
          <p>Send the first one — everyone in the room will see it instantly.</p>
        </div>
      </div>
    );
  }

  let lastDay = null;

  return (
    <div className="message-list">
      {messages.map((message) => {
        const dayLabel = formatDayLabel(message.createdAt);
        const showDivider = dayLabel !== lastDay;
        lastDay = dayLabel;

        return (
          <div key={message.id}>
            {showDivider && <div className="day-divider">{dayLabel}</div>}
            <MessageBubble message={message} isMe={message.username === username} />
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
