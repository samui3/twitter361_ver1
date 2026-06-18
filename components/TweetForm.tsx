"use client";
import { useState, useRef } from "react";
import { useTweetStore } from "@/store/useTweetStore";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type TweetFormProps = {
  onTweetSaved?: () => void | Promise<void>;
};

export default function TweetForm({ onTweetSaved }: TweetFormProps) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const postTweet = useTweetStore((s) => s.postTweet);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const saveTweetToSupabase = async (tweetContent: string) => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      console.warn("Supabase environment variables are not set.");
      return;
    }

    const { data, error } = await supabase
      .from("tweets")
      .insert({ content: tweetContent })
      .select("*")
      .single();

    if (error) {
      console.error("Failed to insert tweet into Supabase:", error);
      return;
    }

    console.log("Inserted Supabase tweet:", data);
    await onTweetSaved?.();
  };

  const handleSubmit = () => {
    const trimmedContent = content.trim();
    if (!trimmedContent && images.length === 0) return;

    postTweet(trimmedContent, images);

    if (trimmedContent) {
      void saveTweetToSupabase(trimmedContent);
    }

    setContent("");
    setImages([]);
  };

  return (
    <div className="tweet-form">
      <div className="tweet-form-inner">
        <div className="avatar-placeholder">自</div>
        <div className="tweet-form-right">
          <textarea
            placeholder="いまどうしてる？"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={280}
            rows={3}
          />
          {images.length > 0 && (
            <div className="image-preview-grid">
              {images.map((img, i) => (
                <div key={i} className="image-preview-item">
                  <img src={img} alt="" />
                  <button
                    className="image-remove"
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="tweet-form-actions">
            <button className="icon-btn" onClick={() => fileRef.current?.click()} title="画像を追加">
              🖼️
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={handleImage}
            />
            <span className={`char-count ${content.length > 260 ? "warn" : ""}`}>
              {280 - content.length}
            </span>
            <button
              className="post-btn"
              onClick={handleSubmit}
              disabled={!content.trim() && images.length === 0}
            >
              ポスト
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
