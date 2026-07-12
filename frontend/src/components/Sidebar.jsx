function initialFor(name) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export default function Sidebar({ username, onlineUsers, isConnected, onLeave }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-mark">
        <span className="dot" />
        <span>Wire</span>
      </div>
      <h2>General</h2>

      <div className="sidebar-section-label">Online — {onlineUsers.length}</div>
      <div className="user-rail">
        {onlineUsers.length === 0 && <div className="sidebar-empty">Nobody else is here yet.</div>}
        {onlineUsers.map((name) => {
          const isMe = name === username;
          return (
            <div className={`user-chip${isMe ? ' is-me' : ''}`} key={name}>
              <div className="avatar-initial">
                {initialFor(name)}
                <span className="presence-dot pulse" />
              </div>
              <div className="user-chip-name">
                {name}
                {isMe && <span className="you-tag">you</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="connection-status">
          <span className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
          {isConnected ? 'connected' : 'reconnecting…'}
        </div>
        <button className="leave-button" onClick={onLeave}>
          Leave
        </button>
      </div>
    </aside>
  );
}
