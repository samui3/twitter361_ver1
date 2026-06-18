"use client";
import { useState, useEffect, useCallback } from "react";
import TweetForm from "@/components/TweetForm";
import Tweet from "@/components/Tweet";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import { useTweetStore } from "@/store/useTweetStore";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Tweet as TweetType } from "@/types/tweet";

type SupabaseTweetRow = {
  id: string;
  content: string | null;
  created_at: string | null;
};

function mapSupabaseTweet(row: SupabaseTweetRow): TweetType {
  return {
    id: row.id,
    content: row.content ?? "",
    images: [],
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    authorName: "Supabaseユーザー",
    authorHandle: "supabase",
    likes: 0,
    retweets: 0,
    replies: [],
    isLiked: false,
    isRetweeted: false,
  };
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [supabaseTweets, setSupabaseTweets] = useState<TweetType[] | null>(null);
  const localTweets = useTweetStore((s) => s.tweets);
  const searchQuery = useTweetStore((s) => s.searchQuery);
  const activeTag = useTweetStore((s) => s.activeTag);

  const fetchSupabaseTweets = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      console.warn("Supabase environment variables are not set.");
      return;
    }

    const { data, error } = await supabase
      .from("tweets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch tweets from Supabase:", error);
      return;
    }

    console.log("Supabase tweets:", data);
    setSupabaseTweets((data ?? []).map(mapSupabaseTweet));
  }, []);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
    fetchSupabaseTweets();
  }, [fetchSupabaseTweets]);

  const tweets = supabaseTweets ?? localTweets;
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
        <TweetForm onTweetSaved={fetchSupabaseTweets} />
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
