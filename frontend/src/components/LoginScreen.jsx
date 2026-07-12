import { useState } from 'react';

export default function LoginScreen({ onJoin }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = username.trim();

    if (!trimmed) {
      setError('Enter a name to join the chat.');
      return;
    }
    if (trimmed.length > 24) {
      setError('Keep it under 24 characters.');
      return;
    }

    setError('');
    onJoin(trimmed);
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-mark">
          <span className="dot" />
          <span>Wire</span>
        </div>
        <h1>Join the room</h1>
        <p>Pick a display name to enter the general chat room. No password needed — this is a demo login.</p>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            type="text"
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={24}
          />
          {error && <div className="login-error">{error}</div>}
          <button type="submit">Enter chat</button>
        </form>
        <div className="login-hint">no password · stored only for this session</div>
      </div>
    </div>
  );
}
