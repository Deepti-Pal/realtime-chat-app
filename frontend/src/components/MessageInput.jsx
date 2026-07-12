import { useRef, useState } from 'react';

const TYPING_STOP_DELAY = 1500;

export default function MessageInput({ onSend, onTypingStart, onTypingStop, disabled }) {
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef(null);

  function handleChange(e) {
    setText(e.target.value);

    onTypingStart();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTypingStop();
    }, TYPING_STOP_DELAY);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    onSend(trimmed);
    setText('');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    onTypingStop();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form className="message-input-bar" onSubmit={handleSubmit}>
      <textarea
        rows={1}
        placeholder="Write a message… (Enter to send, Shift+Enter for a new line)"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        maxLength={2000}
      />
      <button type="submit" className="send-button" disabled={disabled || !text.trim()}>
        Send
      </button>
    </form>
  );
}
