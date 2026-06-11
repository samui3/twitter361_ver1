"use client";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">🐦</div>
      <nav className="sidebar-nav">
        <a href="#" className="nav-item active">🏠 ホーム</a>
        <a href="#" className="nav-item">🔍 検索</a>
        <a href="#" className="nav-item">🔔 通知</a>
        <a href="#" className="nav-item">✉️ メッセージ</a>
        <a href="#" className="nav-item">👤 プロフィール</a>
      </nav>
      <div className="sidebar-user">
        <div className="avatar-placeholder">自</div>
        <div>
          <p className="author-name">自分の名前</p>
          <p className="author-handle">@myhandle</p>
        </div>
      </div>
    </aside>
  );
}