import { db } from "../utils/db";
import { Writer, Post } from "../types/user";

class WriterService {
  async getSelfWriterId(userId: string): Promise<string | undefined> {
    return new Promise((resolve) => {
      const id = db.checkIfCreator(userId)?.creator_id
      resolve(id)
    }
    )
  }

  async getWriterProfile(writerId: string): Promise<Writer | undefined> {
    return new Promise((resolve) => {
      const creator = db.creatorInfo(writerId);
      if (!creator) {
        resolve(undefined);
        return;
      }

      const writer: Writer = {
        id: creator.user_id,
        username: creator.name,
        login: "", // no login in creator
        avatar: creator.profile_photo,
        isAuthor: true,
        notificationSettings: {
          newPosts: false,
          news: false,
          commentReplies: false,
          commentLikes: false,
        },
        bio: creator.description || this.getDefaultDescription(),
        goal: {
          current: creator.money_got,
          target: creator.money_needed,
        },
        subscriptions: creator.followers_count || 0,
      };
      resolve(writer);
    });
  }

  async getWriterPosts(writerId: string): Promise<Post[]> {
    return new Promise((resolve) => {
      const posts = db.creatorPosts(writerId);
      const result: Post[] = posts.map(post => ({
        id: post.post_id,
        title: post.title || "",
        content: post.post_text || "",
        authorId: writerId,
      }));
      resolve(result);
    });
  }

  // Add more methods as needed for other data like subscriptions

  getDefaultAvatar() {
    return "https://via.placeholder.com/150"; // Placeholder avatar URL
  }

  getDefaultDescription() {
    return "No description available.";
  }
}

export const writerService = new WriterService();
