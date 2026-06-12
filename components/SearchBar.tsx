"use client";
import { useTweetStore } from "@/store/useTweetStore";

export default function SearchBar({ tags }: { tags: string[] }) {
  const { searchQuery, setSearchQuery, activeTag, setActiveTag } = useTweetStore();

  return (
    <div className="search-area">
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 検索"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {activeTag && (
        <div className="active-tag-banner">
          <span>#{activeTag}</span>
          <button onClick={() => setActiveTag(null)}>✕</button>
        </div>
      )}
      {tags.length > 0 && (
        <div className="tag-cloud">
          <p className="tag-cloud-title">タグ</p>
          <div className="tag-list">
            {tags.map((tag) => (
              <button
                key={tag}
                className={`tag-chip ${activeTag === tag ? "active" : ""}`}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}