"use client";
import { useState, useEffect } from "react";
import TweetForm from "@/components/TweetForm";
import Tweet from "@/components/Tweet";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import { useTweetStore } from "@/store/useTweetStore";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const tweets = useTweetStore((s) => s.tweets);
  const searchQuery = useTweetStore((s) => s.searchQuery);
  const activeTag = useTweetStore((s) => s.activeTag);

  useEffect(() => { setMounted(true); }, []);

  let filteredTweets = tweets;
  if (activeTag) {
    filteredTweets = tweets.filter((t) =>
      t.content.toLowerCase().includes(`#${activeTag.toLowerCase()}`)
    );
  } else if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredTweets = tweets.filter(
      (t) =>
        t.content.toLowerCase().includes(q) ||
        t.authorName.toLowerCase().includes(q) ||
        t.authorHandle.toLowerCase().includes(q)
    );
  }

  const tagSet = new Set<string>();
  if (mounted) {
    tweets.forEach((t) => {
      const matches = t.content.match(/#[\w\u3040-\u9FFF]+/g);
      if (matches) matches.forEach((tag) => tagSet.add(tag.slice(1)));
    });
  }
  const tags = Array.from(tagSet);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-feed">
        <div className="feed-header">
          <h1>ホーム</h1>
        </div>
        <TweetForm />
        <div className="tweets-list">
          {!mounted ? null : filteredTweets.length === 0 ? (
            <p className="no-results">ツイートが見つかりません</p>
          ) : (
            filteredTweets.map((tweet) => (
              <Tweet key={tweet.id} tweet={tweet} />
            ))
          )}
        </div>
      </main>
      <div className="right-panel">
        <SearchBar tags={tags} />
        <div className="trends-box">
          <h2>トレンド</h2>
          <div className="trend-item">#Next.js</div>
          <div className="trend-item">#TypeScript</div>
          <div className="trend-item">#React</div>
        </div>
      </div>
    </div>
  );
}