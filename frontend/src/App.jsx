import { useCallback, useEffect, useRef, useState } from 'react';
import socket from './socket';
import { fetchHistory, sendMessageViaRest } from './api';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import './App.css';

const USERNAME_STORAGE_KEY = 'wire-chat-username';

export default function App() {
  const [username, setUsername] = useState(() => sessionStorage.getItem(USERNAME_STORAGE_KEY) || '');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [errorMessage, setErrorMessage] = useState('');
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const usernameRef = useRef(username);
  usernameRef.current = username;

  // Load chat history once we know who's logged in. This is what makes
  // messages survive a page refresh (Socket.io alone is in-memory only).
  useEffect(() => {
    if (!username) return;

    let cancelled = false;

    async function bootstrap() {
      try {
        const history = await fetchHistory();
        if (!cancelled) {
          setMessages(history);
          setHistoryLoaded(true);
        }
      } catch (err) {
        if (!cancelled) setErrorMessage(err.message || 'Could not load chat history.');
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [username]);

  // Own the socket connection lifecycle for as long as a username is set.
  useEffect(() => {
    if (!username) return;

    socket.connect();
    socket.emit('user:join', username);

    function handleConnect() {
      setIsConnected(true);
      setErrorMessage('');
      socket.emit('user:join', usernameRef.current);
    }
    function handleDisconnect() {
      setIsConnected(false);
    }
    function handleNewMessage(message) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    }
    function handlePresenceUpdate(users) {
      setOnlineUsers(users);
    }
    function handleTypingUpdate({ username: typer, isTyping }) {
      setTypingUsers((prev) => {
        if (isTyping) {
          return prev.includes(typer) ? prev : [...prev, typer];
        }
        return prev.filter((u) => u !== typer);
      });
    }
    function handleSocketError(payload) {
      setErrorMessage(payload?.error || 'Something went wrong sending your message.');
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('message:new', handleNewMessage);
    socket.on('presence:update', handlePresenceUpdate);
    socket.on('typing:update', handleTypingUpdate);
    socket.on('message:error', handleSocketError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('message:new', handleNewMessage);
      socket.off('presence:update', handlePresenceUpdate);
      socket.off('typing:update', handleTypingUpdate);
      socket.off('message:error', handleSocketError);
    };
  }, [username]);

  const handleJoin = useCallback((name) => {
    sessionStorage.setItem(USERNAME_STORAGE_KEY, name);
    setUsername(name);
  }, []);

  const handleLeave = useCallback(() => {
    socket.disconnect();
    sessionStorage.removeItem(USERNAME_STORAGE_KEY);
    setUsername('');
    setMessages([]);
    setOnlineUsers([]);
    setTypingUsers([]);
    setHistoryLoaded(false);
  }, []);

  const handleSend = useCallback(async (text) => {
    setErrorMessage('');
    if (socket.connected) {
      socket.emit('message:send', { text }, (ack) => {
        if (ack && !ack.ok) {
          setErrorMessage(ack.error || 'Message failed to send.');
        }
      });
    } else {
      // Socket is down (e.g. reconnecting) - fall back to REST so the
      // message still gets through; other clients will see it once they
      // reconnect and re-fetch history, or if their socket is still up
      // they'll get it live since the server broadcasts on this path too.
      try {
        const message = await sendMessageViaRest({ username: usernameRef.current, text });
        setMessages((prev) => [...prev, message]);
      } catch (err) {
        setErrorMessage(err.message || 'Message failed to send.');
      }
    }
  }, []);

  const handleTypingStart = useCallback(() => {
    if (socket.connected) socket.emit('typing:start');
  }, []);

  const handleTypingStop = useCallback(() => {
    if (socket.connected) socket.emit('typing:stop');
  }, []);

  if (!username) {
    return <LoginScreen onJoin={handleJoin} />;
  }

  return (
    <div className="app-shell">
      <Sidebar username={username} onlineUsers={onlineUsers} isConnected={isConnected} onLeave={handleLeave} />
      <ChatWindow
        username={username}
        messages={messages}
        typingUsers={typingUsers.filter((u) => u !== username)}
        onSend={handleSend}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        isConnected={isConnected}
        errorMessage={historyLoaded ? errorMessage : ''}
      />
    </div>
  );
}
