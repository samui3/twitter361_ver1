export type Tweet = {
  id: string;
  content: string;
  images: string[]; // Base64またはURL
  createdAt: Date;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  likes: number;
  retweets: number;
  replies: Reply[];
  retweetOf?: Tweet; // リツイート元
  isLiked: boolean;
  isRetweeted: boolean;
};

export type Reply = {
  id: string;
  content: string;
  createdAt: Date;
  authorName: string;
  authorHandle: string;
};