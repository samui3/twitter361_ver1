"use client";
import { useState, useEffect } from "react";
import { Tweet as TweetType } from "@/types/tweet";
import { useTweetStore } from "@/store/useTweetStore";

function formatTime(date: Date) {
  const now = new Date();
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  if (diff < 60) return `${diff}秒`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間`;
  return `${Math.floor(diff / 86400)}日`;
}

function renderContent(content: string, onTagClick: (tag: string) => void) {
  const parts = content.split(/(#[\w\u3040-\u9FFF]+)/g);
  return parts.map((part, i) =>
    part.startsWith("#") ? (
      <span
        key={i}
        className="tweet-tag"
        onClick={(e) => {
          e.stopPropagation();
          onTagClick(part.slice(1));
        }}
      >
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function Tweet({ tweet }: { tweet: TweetType }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(tweet.content);
  const [showMenu, setShowMenu] = useState(false);
  const { likeTweet, retweetTweet, replyToTweet, editTweet, deleteTweet, setActiveTag } = useTweetStore();

  useEffect(() => { setMounted(true); }, []);

  const handleReply = () => {
    if (!replyText.trim()) return;
    replyToTweet(tweet.id, replyText.trim());
    setReplyText("");
    setShowReply(false);
  };

  const handleEdit = () => {
    if (!editText.trim()) return;
    editTweet(tweet.id, editText.trim());
    setIsEditing(false);
  };

  const isOwn = tweet.authorHandle === "myhandle";

  return (
    <article className="tweet-card">
      {tweet.retweetOf && (
        <div className="retweet-label">🔁 リツイート</div>
      )}
      <div className="tweet-header">
        <div className="avatar-placeholder">
          {tweet.authorName.charAt(0)}
        </div>
        <div className="tweet-meta">
          <span className="author-name">{tweet.authorName}</span>
          <span className="author-handle">@{tweet.authorHandle}</span>
          <span className="tweet-time">
            · {mounted ? formatTime(tweet.createdAt) : ""}
          </span>
        </div>
        {isOwn && (
          <div className="tweet-menu-wrap">
            <button
              className="menu-btn"
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            >
              ···
            </button>
            {showMenu && (
              <div className="tweet-menu">
                <button onClick={() => { setIsEditing(true); setShowMenu(false); }}>
                  ✏️ 編集
                </button>
                <button
                  className="danger"
                  onClick={() => { deleteTweet(tweet.id); setShowMenu(false); }}
                >
                  🗑️ 削除
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="tweet-content">
        {isEditing ? (
          <div className="edit-form">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
            />
            <div className="edit-actions">
              <button className="post-btn small" onClick={handleEdit}>保存</button>
              <button className="cancel-btn" onClick={() => setIsEditing(false)}>キャンセル</button>
            </div>
          </div>
        ) : (
          renderContent(tweet.content, setActiveTag)
        )}
      </div>

      {tweet.images.length > 0 && (
        <div className={`tweet-images count-${tweet.images.length}`}>
          {tweet.images.map((img, i) => (
            <img key={i} src={img} alt="" />
          ))}
        </div>
      )}

      <div className="tweet-actions">
        <button className="action-btn reply-btn" onClick={() => setShowReply(!showReply)}>
          💬 {tweet.replies.length > 0 && tweet.replies.length}
        </button>
        <button
          className={`action-btn retweet-btn ${tweet.isRetweeted ? "active" : ""}`}
          onClick={() => retweetTweet(tweet.id)}
        >
          🔁 {tweet.retweets > 0 && tweet.retweets}
        </button>
        <button
          className={`action-btn like-btn ${tweet.isLiked ? "active" : ""}`}
          onClick={() => likeTweet(tweet.id)}
        >
          {tweet.isLiked ? "❤️" : "🤍"} {tweet.likes > 0 && tweet.likes}
        </button>
      </div>

      {showReply && (
        <div className="reply-form">
          <textarea
            placeholder={`@${tweet.authorHandle} に返信`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={2}
          />
          <button className="post-btn small" onClick={handleReply}>返信</button>
        </div>
      )}

      {tweet.replies.length > 0 && (
        <div className="replies-list">
          {tweet.replies.map((reply) => (
            <div key={reply.id} className="reply-item">
              <div className="avatar-placeholder small">{reply.authorName.charAt(0)}</div>
              <div>
                <span className="author-name">{reply.authorName}</span>
                <span className="author-handle"> @{reply.authorHandle}</span>
                <p className="reply-content">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}