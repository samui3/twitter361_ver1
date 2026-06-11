"use client";
import TweetForm from "@/components/TweetForm";
import Tweet from "@/components/Tweet";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import { useTweetStore } from "@/store/useTweetStore";

export default function Home() {
  const tweets = useTweetStore((s) => s.tweets);
  const searchQuery = useTweetStore((s) => s.searchQuery);

  const filteredTweets = searchQuery.trim()
    ? tweets.filter(
        (t) =>
          t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.authorHandle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tweets;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-feed">
        <div className="feed-header">
          <h1>ホーム</h1>
        </div>
        <TweetForm />
        <div className="tweets-list">
          {filteredTweets.length === 0 ? (
            <p className="no-results">ツイートが見つかりません</p>
          ) : (
            filteredTweets.map((tweet) => (
              <Tweet key={tweet.id} tweet={tweet} />
            ))
          )}
        </div>
      </main>
      <div className="right-panel">
        <SearchBar />
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