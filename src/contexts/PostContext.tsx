import React, { createContext, useContext, useState, ReactNode } from "react";
import { PostType } from "@/types";

type PostsContextType = {
  posts: PostType[];
  setPosts: (posts: PostType[]) => void;
  updatePostLikes: (postId: string, newLikes: number) => void;
};

const PostsContext = createContext<PostsContextType | undefined>(undefined);

type PostsProviderProps = {
  children: ReactNode;
};

export const PostsProvider: React.FC<PostsProviderProps> = ({ children }) => {
  const [posts, setPosts] = useState<PostType[]>([]);

  const updatePostLikes = (postId: string, newLikes: number) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post._id === postId ? { ...post, total_likes: newLikes } : post
      )
    );
  };

  return (
    <PostsContext.Provider value={{ posts, setPosts, updatePostLikes }}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
};
