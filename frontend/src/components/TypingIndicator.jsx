export default function TypingIndicator({ typingUsers }) {
  if (typingUsers.length === 0) {
    return <div className="typing-indicator" />;
  }

  const label =
    typingUsers.length === 1
      ? `${typingUsers[0]} is typing`
      : typingUsers.length === 2
      ? `${typingUsers[0]} and ${typingUsers[1]} are typing`
      : `${typingUsers.length} people are typing`;

  return (
    <div className="typing-indicator">
      {label}
      <span className="typing-dots">
        <span />
        <span />
        <span />
      </span>
    </div>
  );
}
