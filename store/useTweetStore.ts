import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { Tweet, Reply } from "@/types/tweet";

const MOCK_USER = {
  authorName: "自分の名前",
  authorHandle: "myhandle",
};

const SAMPLE_TWEETS: Tweet[] = [
  {
    id: uuidv4(),
    content: "はじめてのツイートです！🎉 #React",
    images: [],
    createdAt: new Date("2024-01-01T00:00:00Z"),
    authorName: "サンプルユーザー",
    authorHandle: "sample_user",
    likes: 12,
    retweets: 3,
    replies: [],
    isLiked: false,
    isRetweeted: false,
  },
  {
    id: uuidv4(),
    content: "Next.jsでTwitterクローンを作っています。思ったより簡単にできそう！ #Next.js #TypeScript",
    images: [],
    createdAt: new Date("2024-01-01T01:00:00Z"),
    authorName: "サンプルユーザー",
    authorHandle: "sample_user",
    likes: 45,
    retweets: 8,
    replies: [],
    isLiked: false,
    isRetweeted: false,
  },
];

type TweetStore = {
  tweets: Tweet[];
  searchQuery: string;
  activeTag: string | null;
  setSearchQuery: (q: string) => void;
  setActiveTag: (tag: string | null) => void;
  postTweet: (content: string, images: string[]) => void;
  editTweet: (id: string, content: string) => void;
  deleteTweet: (id: string) => void;
  likeTweet: (id: string) => void;
  retweetTweet: (id: string) => void;
  replyToTweet: (id: string, content: string) => void;
  getFilteredTweets: () => Tweet[];
  getAllTags: () => string[];
};

export const useTweetStore = create<TweetStore>()(
  persist(
    (set, get) => ({
      tweets: SAMPLE_TWEETS,
      searchQuery: "",
      activeTag: null,

      setSearchQuery: (q) => set({ searchQuery: q, activeTag: null }),
      setActiveTag: (tag) => set({ activeTag: tag, searchQuery: "" }),

      postTweet: (content, images) => {
        const newTweet: Tweet = {
          id: uuidv4(),
          content,
          images,
          createdAt: new Date(),
          ...MOCK_USER,
          likes: 0,
          retweets: 0,
          replies: [],
          isLiked: false,
          isRetweeted: false,
        };
        set((state) => ({ tweets: [newTweet, ...state.tweets] }));
      },

      editTweet: (id, content) => {
        set((state) => ({
          tweets: state.tweets.map((t) =>
            t.id === id ? { ...t, content } : t
          ),
        }));
      },

      deleteTweet: (id) => {
        set((state) => ({
          tweets: state.tweets.filter((t) => t.id !== id),
        }));
      },

      likeTweet: (id) => {
        set((state) => ({
          tweets: state.tweets.map((t) =>
            t.id === id
              ? { ...t, likes: t.isLiked ? t.likes - 1 : t.likes + 1, isLiked: !t.isLiked }
              : t
          ),
        }));
      },

      retweetTweet: (id) => {
        const tweet = get().tweets.find((t) => t.id === id);
        if (!tweet) return;
        set((state) => {
          const updated = state.tweets.map((t) =>
            t.id === id
              ? { ...t, retweets: t.isRetweeted ? t.retweets - 1 : t.retweets + 1, isRetweeted: !t.isRetweeted }
              : t
          );
          if (!tweet.isRetweeted) {
            const rt: Tweet = {
              id: uuidv4(),
              content: tweet.content,
              images: tweet.images,
              createdAt: new Date(),
              ...MOCK_USER,
              likes: 0,
              retweets: 0,
              replies: [],
              isLiked: false,
              isRetweeted: true,
              retweetOf: tweet,
            };
            return { tweets: [rt, ...updated] };
          }
          return { tweets: updated };
        });
      },

      replyToTweet: (id, content) => {
        const reply: Reply = {
          id: uuidv4(),
          content,
          createdAt: new Date(),
          ...MOCK_USER,
        };
        set((state) => ({
          tweets: state.tweets.map((t) =>
            t.id === id ? { ...t, replies: [...t.replies, reply] } : t
          ),
        }));
      },

      getFilteredTweets: () => {
        const { tweets, searchQuery, activeTag } = get();
        if (activeTag) {
          return tweets.filter((t) =>
            t.content.toLowerCase().includes(`#${activeTag.toLowerCase()}`)
          );
        }
        if (!searchQuery.trim()) return tweets;
        const q = searchQuery.toLowerCase();
        return tweets.filter(
          (t) =>
            t.content.toLowerCase().includes(q) ||
            t.authorName.toLowerCase().includes(q) ||
            t.authorHandle.toLowerCase().includes(q)
        );
      },

      getAllTags: () => {
        const { tweets } = get();
        const tagSet = new Set<string>();
        tweets.forEach((t) => {
          const matches = t.content.match(/#[\w\u3040-\u9FFF]+/g);
          if (matches) matches.forEach((tag) => tagSet.add(tag.slice(1)));
        });
        return Array.from(tagSet);
      },
    }),
    {
      name: "tweet-storage",
      // Dateオブジェクトを復元するための処理
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.tweets = state.tweets.map((t) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            replies: t.replies.map((r) => ({
              ...r,
              createdAt: new Date(r.createdAt),
            })),
          }));
        }
      },
    }
  )
);