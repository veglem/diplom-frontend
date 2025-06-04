import { v4 as uuidv4 } from 'uuid';

// Type definitions
interface User {
  user_id: string;
  user_version: number;
  login: string;
  display_name: string;
  profile_photo?: string;
  password_hash: string;
  registration_date: Date;
}

interface Creator {
  creator_id: string;
  user_id: string;
  name: string;
  cover_photo?: string;
  profile_photo?: string;
  followers_count: number;
  description?: string;
  posts_count: number;
  aim?: string;
  money_needed: number;
  money_got: number;
  balance: number;
}

interface Subscription {
  subscription_id: string;
  creator_id: string;
  month_cost: number;
  title: string;
  description?: string;
  is_available: boolean;
}

interface UserSubscription {
  user_id: string;
  subscription_id: string;
  expire_date: Date;
}

interface UserPayment {
  user_id: string;
  subscription_id: string;
  payment_timestamp: Date;
  payment_info?: string;
  money: number;
  month_count?: number;
}

interface Post {
  post_id: string;
  creator_id: string;
  creation_date: Date;
  title?: string;
  post_text?: string;
  likes_count: number;
  comments_count: number;
}

interface PostSubscription {
  post_id: string;
  subscription_id: string;
}

interface Comment {
  comment_id: string;
  post_id: string;
  user_id: string;
  comment_text: string;
  creation_date: Date;
  likes_count: number;
}

interface Attachment {
  attachment_id: string;
  post_id: string;
  attachment_type: string;
}

interface LikePost {
  post_id: string;
  user_id: string;
}

interface LikeComment {
  comment_id: string;
  user_id: string;
}

interface Donation {
  user_id: string;
  creator_id: string;
  money_count: number;
  donation_date: Date;
}

interface Follow {
  user_id: string;
  creator_id: string;
}

interface Statistics {
  id: string;
  creator_id: string;
  posts_per_month: number;
  subscriptions_bought: number;
  donations_count: number;
  money_from_donations: number;
  money_from_subscriptions: number;
  new_followers: number;
  likes_count: number;
  comments_count: number;
  month: Date;
}

class MockDatabase {
  private users: User[] = [];
  private creators: Creator[] = [];
  private subscriptions: Subscription[] = [];
  private userSubscriptions: UserSubscription[] = [];
  private userPayments: UserPayment[] = [];
  private posts: Post[] = [];
  private postSubscriptions: PostSubscription[] = [];
  private comments: Comment[] = [];
  private attachments: Attachment[] = [];
  private likePosts: LikePost[] = [];
  private likeComments: LikeComment[] = [];
  private donations: Donation[] = [];
  private follows: Follow[] = [];
  private statistics: Statistics[] = [];

  // Helper methods
  private now(): Date {
    return new Date();
  }

  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  private dateTrunc(unit: 'month', date: Date): Date {
    const result = new Date(date);
    if (unit === 'month') {
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
    }
    return result;
  }

  private checkIfBucketExists(creator_id: string, month: Date): boolean {
    return this.statistics.some(
      stat => 
        stat.creator_id === creator_id && 
        this.dateTrunc('month', stat.month).getTime() === this.dateTrunc('month', month).getTime()
    );
  }
  
  private ensureStatisticsBucket(creator_id: string, month: Date = this.now()): void {
    const truncatedMonth = this.dateTrunc('month', month);
    if (!this.checkIfBucketExists(creator_id, truncatedMonth)) {
      this.statistics.push({
        id: uuidv4(),
        creator_id,
        month: truncatedMonth,
        posts_per_month: 0,
        subscriptions_bought: 0,
        donations_count: 0,
        money_from_donations: 0,
        money_from_subscriptions: 0,
        new_followers: 0,
        likes_count: 0,
        comments_count: 0
      });
    }
  }

  // Statistics update methods
  private updateLikesStatistics(creator_id: string, isDelete: boolean = false): void {
    this.ensureStatisticsBucket(creator_id);
    const now = this.now();
    const stat = this.statistics.find(
      s => s.creator_id === creator_id && this.dateTrunc('month', s.month).getTime() === this.dateTrunc('month', now).getTime()
    );
    if (stat) {
      stat.likes_count += isDelete ? -1 : 1;
    }
  }

  private updateCommentsStatistics(creator_id: string, isDelete: boolean = false): void {
    this.ensureStatisticsBucket(creator_id);
    const now = this.now();
    const stat = this.statistics.find(
      s => s.creator_id === creator_id && this.dateTrunc('month', s.month).getTime() === this.dateTrunc('month', now).getTime()
    );
    if (stat) {
      stat.comments_count += isDelete ? -1 : 1;
    }
  }

  private updateFollowersStatistics(creator_id: string): void {
    this.ensureStatisticsBucket(creator_id);
    const now = this.now();
    const stat = this.statistics.find(
      s => s.creator_id === creator_id && this.dateTrunc('month', s.month).getTime() === this.dateTrunc('month', now).getTime()
    );
    if (stat) {
      stat.new_followers += 1;
    }
  }

  private updateSubscriptionStatistics(creator_id: string, money: number): void {
    this.ensureStatisticsBucket(creator_id);
    const now = this.now();
    const stat = this.statistics.find(
      s => s.creator_id === creator_id && this.dateTrunc('month', s.month).getTime() === this.dateTrunc('month', now).getTime()
    );
    if (stat) {
      stat.money_from_subscriptions += money;
      stat.subscriptions_bought += 1;
    }
  }

  private updateDonationStatistics(creator_id: string, money_count: number): void {
    this.ensureStatisticsBucket(creator_id);
    const now = this.now();
    const stat = this.statistics.find(
      s => s.creator_id === creator_id && this.dateTrunc('month', s.month).getTime() === this.dateTrunc('month', now).getTime()
    );
    if (stat) {
      stat.money_from_donations += money_count;
      stat.donations_count += 1;
    }
  }

  private updatePostsStatistics(creator_id: string, isDelete: boolean = false): void {
    this.ensureStatisticsBucket(creator_id);
    const now = this.now();
    const stat = this.statistics.find(
      s => s.creator_id === creator_id && this.dateTrunc('month', s.month).getTime() === this.dateTrunc('month', now).getTime()
    );
    if (stat) {
      stat.posts_per_month += isDelete ? -1 : 1;
    }
  }

  // User related methods
  userProfile(user_id: string): Pick<User, 'login' | 'display_name' | 'profile_photo' | 'registration_date'> | null {
    const user = this.users.find(u => u.user_id === user_id);
    if (!user) return null;
    return {
      login: user.login,
      display_name: user.display_name,
      profile_photo: user.profile_photo,
      registration_date: user.registration_date
    };
  }

  userNamePhoto(user_id: string): Pick<User, 'display_name' | 'profile_photo'> | null {
    const user = this.users.find(u => u.user_id === user_id);
    if (!user) return null;
    return {
      display_name: user.display_name,
      profile_photo: user.profile_photo
    };
  }

  checkIfCreator(user_id: string): { creator_id: string } | null {
    const creator = this.creators.find(c => c.user_id === user_id);
    return creator ? { creator_id: creator.creator_id } : null;
  }

  updateUserProfilePhoto(profile_photo: string, user_id: string): void {
    const user = this.users.find(u => u.user_id === user_id);
    if (user) {
      user.profile_photo = profile_photo;
    }
  }

  updatePassword(password_hash: string, user_id: string): void {
    const user = this.users.find(u => u.user_id === user_id);
    if (user) {
      user.password_hash = password_hash;
      user.user_version += 1;
    }
  }

  updateProfileInfo(login: string, display_name: string, user_id: string): void {
    const user = this.users.find(u => u.user_id === user_id);
    if (user) {
      user.login = login;
      user.display_name = display_name;
    }
  }

  updateAuthorAimMoney(amount: number, creator_id: string): { money_got: number } | null {
    const creator = this.creators.find(c => c.creator_id === creator_id);
    if (!creator) return null;
    
    creator.money_got += amount;
    return { money_got: creator.money_got };
  }

  addDonate(creator_id: string, money_count: number, user_id: string): void {
    this.donations.push({
      user_id,
      creator_id,
      money_count,
      donation_date: this.now()
    });

    // Update statistics
    this.updateDonationStatistics(creator_id, money_count);
    
    // Update creator balance
    const creator = this.creators.find(c => c.creator_id === creator_id);
    if (creator) {
      creator.balance += money_count;
    }
  }

  becameCreator(creator_id: string, user_id: string, name: string, description?: string): void {
    this.creators.push({
      creator_id,
      user_id,
      name,
      description,
      followers_count: 0,
      posts_count: 0,
      money_needed: 0,
      money_got: 0,
      balance: 0
    });
  }

  follow(user_id: string, creator_id: string): void {
    if (!this.follows.some(f => f.user_id === user_id && f.creator_id === creator_id)) {
      this.follows.push({ user_id, creator_id });
      
      // Update creator followers count
      const creator = this.creators.find(c => c.creator_id === creator_id);
      if (creator) {
        creator.followers_count += 1;
      }
      
      // Update statistics
      this.updateFollowersStatistics(creator_id);
    }
  }

  unfollow(user_id: string, creator_id: string): void {
    const index = this.follows.findIndex(f => f.user_id === user_id && f.creator_id === creator_id);
    if (index !== -1) {
      this.follows.splice(index, 1);
      
      // Update creator followers count
      const creator = this.creators.find(c => c.creator_id === creator_id);
      if (creator) {
        creator.followers_count -= 1;
      }
    }
  }

  checkIfFollow(user_id: string, creator_id: string): { user_id: string } | null {
    const follow = this.follows.find(f => f.user_id === user_id && f.creator_id === creator_id);
    return follow ? { user_id } : null;
  }

  updateSubscription(months: number, user_id: string, subscription_id: string): { user_id: string } | null {
    const userSub = this.userSubscriptions.find(
      us => us.user_id === user_id && us.subscription_id === subscription_id
    );
    
    if (!userSub) return null;
    
    userSub.expire_date = this.addMonths(userSub.expire_date, months);
    return { user_id };
  }

  subscribe(user_id: string, subscription_id: string, months: number): void {
    this.userSubscriptions.push({
      user_id,
      subscription_id,
      expire_date: this.addMonths(this.now(), months)
    });
  }

  checkIfSubExists(subscription_id: string): { title: string, creator_id: string } | null {
    const subscription = this.subscriptions.find(s => s.subscription_id === subscription_id);
    return subscription ? { title: subscription.title, creator_id: subscription.creator_id } : null;
  }

  addPaymentInfo(user_id: string, subscription_id: string, month_count: number, payment_info: string): void {
    this.userPayments.push({
      user_id,
      subscription_id,
      payment_timestamp: this.now(),
      month_count,
      payment_info,
      money: 0
    });
  }

  checkPaymentInfo(payment_info: string): { user_id: string, subscription_id: string, month_count: number } | null {
    const payment = this.userPayments.find(p => p.payment_info === payment_info);
    return payment ? {
      user_id: payment.user_id,
      subscription_id: payment.subscription_id,
      month_count: payment.month_count || 0
    } : null;
  }

  updatePaymentInfo(money: number, payment_info: string): void {
    const payment = this.userPayments.find(p => p.payment_info === payment_info);
    if (payment) {
      const oldMoney = payment.money;
      payment.money = money;
      
      // Update subscription statistics and creator balance
      const subscription = this.subscriptions.find(s => s.subscription_id === payment.subscription_id);
      if (subscription) {
        this.updateSubscriptionStatistics(subscription.creator_id, money - oldMoney);
        
        // Update creator balance
        const creator = this.creators.find(c => c.creator_id === subscription.creator_id);
        if (creator) {
          creator.balance += money - oldMoney;
        }
      }
    }
  }

  getUserSubscriptions(user_id: string): ({
    subscription_id: string,
    creator_id: string,
    name: string,
    profile_photo: string | undefined,
    month_cost: number,
    title: string,
    description: string | undefined
  } | null)[] {
    return this.userSubscriptions
      .filter(us => us.user_id === user_id)
      .map(us => {
        const subscription = this.subscriptions.find(s => s.subscription_id === us.subscription_id);
        if (!subscription) return null;
        
        const creator = this.creators.find(c => c.creator_id === subscription.creator_id);
        if (!creator) return null;
        
        return {
          subscription_id: us.subscription_id,
          creator_id: creator.creator_id,
          name: creator.name,
          profile_photo: creator.profile_photo,
          month_cost: subscription.month_cost,
          title: subscription.title,
          description: subscription.description
        };
      })
      .filter(Boolean);
  }

  deletePhoto(user_id: string): void {
    const user = this.users.find(u => u.user_id === user_id);
    if (user) {
      user.profile_photo = undefined;
    }
  }

  getCreatorIDFromSub(subscription_id: string): { creator_id: string } | null {
    const subscription = this.subscriptions.find(s => s.subscription_id === subscription_id);
    return subscription ? { creator_id: subscription.creator_id } : null;
  }

  followsList(user_id: string): ({
    creator_id: string;
    name: string;
    profile_photo: string | undefined;
    description: string | undefined;
} | null)[] {
    return this.follows
      .filter(f => f.user_id === user_id)
      .map(f => {
        const creator = this.creators.find(c => c.creator_id === f.creator_id);

        return creator ? {
          creator_id: creator.creator_id,
          name: creator.name,
          profile_photo: creator.profile_photo,
          description: creator.description
        } : null;
      })
      .filter(Boolean);
  }

  // Subscription related methods
  createSubscription(subscription_id: string, creator_id: string, month_cost: number, title: string, description?: string): void {
    this.subscriptions.push({
      subscription_id,
      creator_id,
      month_cost,
      title,
      description,
      is_available: true
    });
  }

  deleteSubscription(subscription_id: string, creator_id: string): void {
    const subscription = this.subscriptions.find(
      s => s.subscription_id === subscription_id && s.creator_id === creator_id
    );
    
    if (subscription) {
      subscription.is_available = false;
    }
  }

  editSubscription(month_cost: number, title: string, description: string, subscription_id: string): void {
    const subscription = this.subscriptions.find(s => s.subscription_id === subscription_id);
    
    if (subscription) {
      subscription.month_cost = month_cost;
      subscription.title = title;
      subscription.description = description;
    }
  }

  // Post related methods
  insertPost(post_id: string, creator_id: string, title?: string, post_text?: string): void {
    this.posts.push({
      post_id,
      creator_id,
      creation_date: this.now(),
      title,
      post_text,
      likes_count: 0,
      comments_count: 0
    });
    
    // Update creator posts count
    const creator = this.creators.find(c => c.creator_id === creator_id);
    if (creator) {
      creator.posts_count += 1;
    }
    
    // Update statistics
    this.updatePostsStatistics(creator_id);
  }

  insertAttach(attachment_id: string, post_id: string, attachment_type: string): void {
    this.attachments.push({
      attachment_id,
      post_id,
      attachment_type
    });
  }

  incPostCount(creator_id: string): void {
    const creator = this.creators.find(c => c.creator_id === creator_id);
    if (creator) {
      creator.posts_count += 1;
    }
  }

  updatePostInfo(title: string, post_text: string, post_id: string): void {
    const post = this.posts.find(p => p.post_id === post_id);
    if (post) {
      post.title = title;
      post.post_text = post_text;
    }
  }

  deletePostSubscriptions(post_id: string): void {
    this.postSubscriptions = this.postSubscriptions.filter(ps => ps.post_id !== post_id);
  }

  addSubscriptionsToPost(post_id: string, subscription_id: string): void {
    this.postSubscriptions.push({
      post_id,
      subscription_id
    });
  }

  deletePost(post_id: string): void {
    const postIndex = this.posts.findIndex(p => p.post_id === post_id);
    
    if (postIndex !== -1) {
      const post = this.posts[postIndex];
      
      // Decrease creator post count
      const creator = this.creators.find(c => c.creator_id === post.creator_id);
      if (creator) {
        creator.posts_count -= 1;
      }
      
      // Remove post
      this.posts.splice(postIndex, 1);
      
      // Remove related data
      this.deletePostSubscription(post_id);
      this.deleteLikes(post_id);
      this.deleteComments(post_id);
      this.deleteAttachByPostID(post_id);
    }
  }

  deletePostSubscription(post_id: string): void {
    this.postSubscriptions = this.postSubscriptions.filter(ps => ps.post_id !== post_id);
  }

  getUserId(post_id: string): { user_id: string } | null {
    const post = this.posts.find(p => p.post_id === post_id);
    if (!post) return null;
    
    const creator = this.creators.find(c => c.creator_id === post.creator_id);
    return creator ? { user_id: creator.user_id } : null;
  }

  addLike(post_id: string, user_id: string): void {
    if (!this.likePosts.some(lp => lp.post_id === post_id && lp.user_id === user_id)) {
      this.likePosts.push({ post_id, user_id });
      
      // Update post like count
      this.updateLikeCount(1, post_id);
      
      // Update statistics
      const post = this.posts.find(p => p.post_id === post_id);
      if (post) {
        this.updateLikesStatistics(post.creator_id);
      }
    }
  }

  removeLike(post_id: string, user_id: string): void {
    const index = this.likePosts.findIndex(lp => lp.post_id === post_id && lp.user_id === user_id);
    
    if (index !== -1) {
      this.likePosts.splice(index, 1);
      
      // Update post like count
      this.updateLikeCount(-1, post_id);
      
      // Update statistics
      const post = this.posts.find(p => p.post_id === post_id);
      if (post) {
        this.updateLikesStatistics(post.creator_id, true);
      }
    }
  }

  updateLikeCount(delta: number, post_id: string): { likes_count: number } | null {
    const post = this.posts.find(p => p.post_id === post_id);
    
    if (!post) return null;
    
    post.likes_count += delta;
    return { likes_count: post.likes_count };
  }

  isLiked(post_id: string, user_id: string): { post_id: string, user_id: string } | null {
    const like = this.likePosts.find(lp => lp.post_id === post_id && lp.user_id === user_id);
    return like ? { post_id, user_id } : null;
  }

  deleteLikes(post_id: string): void {
    this.likePosts = this.likePosts.filter(lp => lp.post_id !== post_id);
  }

  deleteComments(post_id: string): void {
    // Remove likes for all comments in the post
    const commentsToDelete = this.comments.filter(c => c.post_id === post_id);
    commentsToDelete.forEach(comment => {
      this.deleteCommentLikes(comment.comment_id);
    });
    
    // Remove comments
    this.comments = this.comments.filter(c => c.post_id !== post_id);
  }

  isPostAvailableWithSub(user_id: string, post_id: string): { user_id: string } | null {
    // Check if user has a valid subscription that gives access to the post
    const postSubs = this.postSubscriptions.filter(ps => ps.post_id === post_id);
    
    if (postSubs.length === 0) {
      // Post is available for everyone
      return { user_id };
    }
    
    // Post requires subscription - check if user has any of the required subscriptions
    const now = this.now();
    
    for (const postSub of postSubs) {
      const userSub = this.userSubscriptions.find(
        us => us.user_id === user_id && 
              us.subscription_id === postSub.subscription_id &&
              us.expire_date > now
      );
      
      if (userSub) {
        return { user_id };
      }
    }
    
    return null;
  }

  isPostAvailableForEveryone(post_id: string): { post_id: string } | null {
    const postSub = this.postSubscriptions.find(ps => ps.post_id === post_id);
    return postSub ? null : { post_id };
  }

  isCreator(creator_id: string): { user_id: string } | null {
    const creator = this.creators.find(c => c.creator_id === creator_id);
    return creator ? { user_id: creator.user_id } : null;
  }

  getPost(post_id: string): {
    post_id: string;
    creator_id: string;
    creation_date: Date;
    title: string | undefined;
    post_text: string | undefined;
    likes_count: number;
    comments_count: number;
    attachment_ids: string[];
    attachment_types: string[];
    subscription_ids: string[];
} | null {
    const post = this.posts.find(p => p.post_id === post_id);
    if (!post) return null;
    
    const attachments = this.attachments.filter(a => a.post_id === post_id);
    const postSubs = this.postSubscriptions.filter(ps => ps.post_id === post_id);

    return {
      post_id: post.post_id,
      creator_id: post.creator_id,
      creation_date: post.creation_date,
      title: post.title,
      post_text: post.post_text,
      likes_count: post.likes_count,
      comments_count: post.comments_count,
      attachment_ids: attachments.map(a => a.attachment_id),
      attachment_types: attachments.map(a => a.attachment_type),
      subscription_ids: postSubs.map(ps => ps.subscription_id)
    };
  }

  getSubInfo(subscription_id: string): {
    creator_id: string;
    month_cost: number;
    title: string;
    description: string | undefined;
} | null {
    const subscription = this.subscriptions.find(s => s.subscription_id === subscription_id);

    return subscription ? {
      creator_id: subscription.creator_id,
      month_cost: subscription.month_cost,
      title: subscription.title,
      description: subscription.description
    } : null;
  }

  getComments(post_id: string): ({
    comment_id: string;
    user_id: string;
    display_name: string;
    profile_photo: string | undefined;
    post_id: string;
    comment_text: string;
    creation_date: Date;
    likes_count: number;
} | null)[] {
    return this.comments
      .filter(c => c.post_id === post_id)
      .map(comment => {
        const user = this.users.find(u => u.user_id === comment.user_id);

        return user ? {
          comment_id: comment.comment_id,
          user_id: user.user_id,
          display_name: user.display_name,
          profile_photo: user.profile_photo,
          post_id: comment.post_id,
          comment_text: comment.comment_text,
          creation_date: comment.creation_date,
          likes_count: comment.likes_count
        } : null;
      })
      .filter(Boolean);
  }

  isLikedComment(comment_id: string, user_id: string): { comment_id: string } | null {
    const like = this.likeComments.find(lc => lc.comment_id === comment_id && lc.user_id === user_id);
    return like ? { comment_id } : null;
  }

  getUserIdComments(comment_id: string): { user_id: string } | null {
    const comment = this.comments.find(c => c.comment_id === comment_id);
    return comment ? { user_id: comment.user_id } : null;
  }

  getCreatorPhoto(creator_id: string): { profile_photo?: string } | null {
    const creator = this.creators.find(c => c.creator_id === creator_id);
    return creator ? { profile_photo: creator.profile_photo } : null;
  }

  // Creator related methods
  creatorInfo(creator_id: string): Omit<Creator, 'creator_id'> | null {
    const creator = this.creators.find(c => c.creator_id === creator_id);
    
    return creator ? {
      user_id: creator.user_id,
      name: creator.name,
      cover_photo: creator.cover_photo,
      followers_count: creator.followers_count,
      description: creator.description,
      posts_count: creator.posts_count,
      aim: creator.aim,
      money_got: creator.balance,
      money_needed: creator.money_needed,
      profile_photo: creator.profile_photo,
      balance: creator.balance
    } : null;
  }

  getCreatorSubs(creator_id: string): Pick<Subscription, 'subscription_id' | 'month_cost' | 'title' | 'description' | 'is_available'>[] {
    return this.subscriptions
      .filter(s => s.creator_id === creator_id)
      .map(s => ({
        subscription_id: s.subscription_id,
        month_cost: s.month_cost,
        title: s.title,
        description: s.description,
        is_available: s.is_available
      }));
  }

  getAllCreators(): Pick<Creator, 'creator_id' | 'user_id' | 'name' | 'cover_photo' | 'followers_count' | 'description' | 'posts_count' | 'profile_photo'>[] {
    return this.creators.slice(0, 100).map(c => ({
      creator_id: c.creator_id,
      user_id: c.user_id,
      name: c.name,
      cover_photo: c.cover_photo,
      followers_count: c.followers_count,
      description: c.description,
      posts_count: c.posts_count,
      profile_photo: c.profile_photo
    }));
  }

  creatorPosts(creator_id: string): {
    post_id: string;
    creation_date: Date;
    title: string | undefined;
    post_text: string | undefined;
    likes_count: number;
    comments_count: number;
    attachment_ids: string[];
    attachment_types: string[];
    subs: string[];
}[] {
    const creatorPosts = this.posts.filter(p => p.creator_id === creator_id);
    
    return creatorPosts.map(post => {
      const attachments = this.attachments.filter(a => a.post_id === post.post_id);
      const postSubs = this.postSubscriptions.filter(ps => ps.post_id === post.post_id);
      
      return {
        post_id: post.post_id,
        creation_date: post.creation_date,
        title: post.title,
        post_text: post.post_text,
        likes_count: post.likes_count,
        comments_count: post.comments_count,
        attachment_ids: attachments.map(a => a.attachment_id),
        attachment_types: attachments.map(a => a.attachment_type),
        subs: postSubs.map(ps => ps.subscription_id)
      };
    }).sort((a, b) => b.creation_date.getTime() - a.creation_date.getTime());
  }
  
  getUserSubscriptionsIds(user_id: string): { subscription_ids: string[] } {
    const subscriptions = this.userSubscriptions
      .filter(us => us.user_id === user_id)
      .map(us => us.subscription_id);
    
    return { subscription_ids: subscriptions };
  }
  
  addAim(aim: string, money_got: number, money_needed: number, creator_id: string): void {
    const creator = this.creators.find(c => c.creator_id === creator_id);
    
    if (creator) {
      creator.aim = aim;
      creator.money_got = money_got;
      creator.money_needed = money_needed;
    }
  }
  
  findCreators(query: string): {
    creator_id: string;
    user_id: string;
    name: string;
    cover_photo: string | undefined;
    followers_count: number;
    description: string | undefined;
    posts_count: number;
    profile_photo: string | undefined;
}[] {
    // Simple implementation that checks if the query is in the name or description
    // In a real implementation, this would use proper text search
    const lowerQuery = query.toLowerCase();

    return this.creators
      .filter(c => 
        (c.name && c.name.toLowerCase().includes(lowerQuery)) || 
        (c.description && c.description.toLowerCase().includes(lowerQuery))
      )
      .slice(0, 30)
      .map(c => ({
        creator_id: c.creator_id,
        user_id: c.user_id,
        name: c.name,
        cover_photo: c.cover_photo,
        followers_count: c.followers_count,
        description: c.description,
        posts_count: c.posts_count,
        profile_photo: c.profile_photo
      }));
  }
  
  updateCreatorData(name: string, description: string, creator_id: string): void {
    const creator = this.creators.find(c => c.creator_id === creator_id);
    
    if (creator) {
      creator.name = name;
      creator.description = description;
    }
  }
  
  feed(user_id: string): {
    post_id: string;
    creator_id: string;
    creation_date: Date;
    title: string | undefined;
    post_text: string | undefined;
    attachment_ids: string[];
    attachment_types: string[];
    name: string | undefined;
    profile_photo: string | undefined;
    likes_count: number;
    comments_count: number;
}[] {
    // Get creators that the user follows
    const followedCreators = this.follows
      .filter(f => f.user_id === user_id)
      .map(f => f.creator_id);
    
    if (followedCreators.length === 0) {
      return [];
    }
    
    // Get posts from those creators
    const posts = this.posts
      .filter(p => followedCreators.includes(p.creator_id))
      .slice(0, 50);
    
    // For each post, check if user has access to it or if it's public
    const accessiblePosts = posts.filter(post => {
      const postSubs = this.postSubscriptions.filter(ps => ps.post_id === post.post_id);
      
      if (postSubs.length === 0) {
        // Post is available for everyone
        return true;
      }
      
      // Check if user has any of the required subscriptions
      const now = this.now();

      return postSubs.some(ps => {
        const userSub = this.userSubscriptions.find(
          us => us.user_id === user_id && 
                us.subscription_id === ps.subscription_id &&
                us.expire_date > now
        );
        return !!userSub;
      });
    });

    // Format the posts for the feed
    return accessiblePosts.map(post => {
      const creator = this.creators.find(c => c.creator_id === post.creator_id);
      const attachments = this.attachments.filter(a => a.post_id === post.post_id);
      
      return {
        post_id: post.post_id,
        creator_id: post.creator_id,
        creation_date: post.creation_date,
        title: post.title,
        post_text: post.post_text,
        attachment_ids: attachments.map(a => a.attachment_id),
        attachment_types: attachments.map(a => a.attachment_type),
        name: creator?.name,
        profile_photo: creator?.profile_photo,
        likes_count: post.likes_count,
        comments_count: post.comments_count
      };
    }).sort((a, b) => b.creation_date.getTime() - a.creation_date.getTime());
  }
  
  updateCreatorProfilePhoto(profile_photo: string, creator_id: string): void {
    const creator = this.creators.find(c => c.creator_id === creator_id);
    if (creator) {
      creator.profile_photo = profile_photo;
    }
  }
  
  updateCoverPhoto(cover_photo: string, creator_id: string): void {
    const creator = this.creators.find(c => c.creator_id === creator_id);
    if (creator) {
      creator.cover_photo = cover_photo;
    }
  }
  
  deleteCoverPhoto(creator_id: string): void {
    const creator = this.creators.find(c => c.creator_id === creator_id);
    if (creator) {
      creator.cover_photo = undefined;
    }
  }
  
  deleteProfilePhoto(creator_id: string): void {
    const creator = this.creators.find(c => c.creator_id === creator_id);
    if (creator) {
      creator.profile_photo = undefined;
    }
  }
  
  getStatistics(creator_id: string, startDate: Date, endDate: Date): {
    posts_per_month: number;
    subscriptions_bought: number;
    donations_count: number;
    money_from_donations: number;
    money_from_subscriptions: number;
    new_followers: number;
    likes_count: number;
    comments_count: number;
} {
    const stats = this.statistics.filter(s => 
      s.creator_id === creator_id && 
      this.dateTrunc('month', s.month) >= this.dateTrunc('month', startDate) &&
      this.dateTrunc('month', s.month) <= this.dateTrunc('month', endDate)
    );

    return {
      posts_per_month: stats.reduce((sum, s) => sum + s.posts_per_month, 0),
      subscriptions_bought: stats.reduce((sum, s) => sum + s.subscriptions_bought, 0),
      donations_count: stats.reduce((sum, s) => sum + s.donations_count, 0),
      money_from_donations: stats.reduce((sum, s) => sum + s.money_from_donations, 0),
      money_from_subscriptions: stats.reduce((sum, s) => sum + s.money_from_subscriptions, 0),
      new_followers: stats.reduce((sum, s) => sum + s.new_followers, 0),
      likes_count: stats.reduce((sum, s) => sum + s.likes_count, 0),
      comments_count: stats.reduce((sum, s) => sum + s.comments_count, 0)
    };
  }
  
  creatorNotificationInfo(creator_id: string): { profile_photo?: string, name: string } | null {
    const creator = this.creators.find(c => c.creator_id === creator_id);
    return creator ? { profile_photo: creator.profile_photo, name: creator.name } : null;
  }
  
  firstStatisticsDate(creator_id: string): { month: Date } | null {
    const firstStat = this.statistics
      .filter(s => s.creator_id === creator_id)
      .sort((a, b) => a.month.getTime() - b.month.getTime())[0];
    
    return firstStat ? { month: firstStat.month } : null;
  }
  
  creatorBalance(creator_id: string): { balance: number } | null {
    const creator = this.creators.find(c => c.creator_id === creator_id);
    return creator ? { balance: creator.balance } : null;
  }
  
  updateBalance(amount: number, creator_id: string): { balance: number } | null {
    const creator = this.creators.find(c => c.creator_id === creator_id);
    if (!creator) return null;
    
    if (creator.balance < amount) return null;
    
    creator.balance -= amount;
    return { balance: creator.balance };
  }
  
  // Comment related methods
  createComment(comment_id: string, post_id: string, user_id: string, comment_text: string): void {
    this.comments.push({
      comment_id,
      post_id,
      user_id,
      comment_text,
      creation_date: this.now(),
      likes_count: 0
    });
    
    // Update post comment count
    this.incCommentsCount(post_id);
    
    // Update statistics
    const post = this.posts.find(p => p.post_id === post_id);
    if (post) {
      this.updateCommentsStatistics(post.creator_id);
    }
  }
  
  editComment(comment_text: string, comment_id: string): void {
    const comment = this.comments.find(c => c.comment_id === comment_id);
    if (comment) {
      comment.comment_text = comment_text;
    }
  }
  
  incCommentsCount(post_id: string): { comments_count: number } | null {
    const post = this.posts.find(p => p.post_id === post_id);
    if (!post) return null;
    
    post.comments_count += 1;
    return { comments_count: post.comments_count };
  }
  
  incLikesCount(comment_id: string, post_id: string): { likes_count: number } | null {
    const comment = this.comments.find(c => c.comment_id === comment_id && c.post_id === post_id);
    if (!comment) return null;
    
    comment.likes_count += 1;
    return { likes_count: comment.likes_count };
  }
  
  decLikesCount(comment_id: string): { likes_count: number } | null {
    const comment = this.comments.find(c => c.comment_id === comment_id);
    if (!comment) return null;
    
    comment.likes_count -= 1;
    return { likes_count: comment.likes_count };
  }
  
  decCommentsCount(post_id: string): void {
    const post = this.posts.find(p => p.post_id === post_id);
    if (post) {
      post.comments_count = Math.max(0, post.comments_count - 1);
    }
  }
  
  deleteCommentLikes(comment_id: string): void {
    this.likeComments = this.likeComments.filter(lc => lc.comment_id !== comment_id);
  }
  
  deleteComment(comment_id: string): void {
    const comment = this.comments.find(c => c.comment_id === comment_id);
    if (!comment) return;
    
    // Update post comment count
    this.decCommentsCount(comment.post_id);
    
    // Delete comment likes
    this.deleteCommentLikes(comment_id);
    
    // Delete comment
    this.comments = this.comments.filter(c => c.comment_id !== comment_id);
    
    // Update statistics
    const post = this.posts.find(p => p.post_id === comment.post_id);
    if (post) {
      this.updateCommentsStatistics(post.creator_id, true);
    }
  }
  
  addLikeComment(comment_id: string, user_id: string): void {
    if (!this.likeComments.some(lc => lc.comment_id === comment_id && lc.user_id === user_id)) {
      this.likeComments.push({ comment_id, user_id });
      
      const comment = this.comments.find(c => c.comment_id === comment_id);
      if (comment) {
        this.incLikesCount(comment_id, comment.post_id);
      }
    }
  }
  
  deleteLikeComment(comment_id: string): void {
    this.likeComments = this.likeComments.filter(lc => lc.comment_id !== comment_id);
    
    const comment = this.comments.find(c => c.comment_id === comment_id);
    if (comment) {
      this.decLikesCount(comment_id);
    }
  }
  
  // Authentication related methods
  userAccessDetails(login: string): { user_id: string, password_hash: string, user_version: number } | null {
    const user = this.users.find(u => u.login === login);
    return user ? {
      user_id: user.user_id,
      password_hash: user.password_hash,
      user_version: user.user_version
    } : null;
  }
  
  addUser(user_id: string, login: string, display_name: string, profile_photo: string | undefined, password_hash: string): { user_id: string } {
    this.users.push({
      user_id,
      login,
      display_name,
      profile_photo,
      password_hash,
      user_version: 0,
      registration_date: this.now()
    });
    return { user_id };
  }
  
  incUserVersion(user_id: string): { user_version: number } | null {
    const user = this.users.find(u => u.user_id === user_id);
    if (!user) return null;
    
    user.user_version += 1;
    return { user_version: user.user_version };
  }
  
  checkUserVersion(user_id: string): { user_version: number } | null {
    const user = this.users.find(u => u.user_id === user_id);
    return user ? { user_version: user.user_version } : null;
  }
  
  // Attachment related methods
  deleteAttachByID(attachment_id: string): void {
    this.attachments = this.attachments.filter(a => a.attachment_id !== attachment_id);
  }
  
  deleteAttachByPostID(post_id: string): { attachment_id: string, attachment_type: string }[] {
    const attachments = this.attachments.filter(a => a.post_id === post_id);
    this.attachments = this.attachments.filter(a => a.post_id !== post_id);
    
    return attachments.map(a => ({
      attachment_id: a.attachment_id,
      attachment_type: a.attachment_type
    }));
  }
  
  deleteAttach(attachment_id: string, post_id: string): { attachment_id: string } | null {
    const attachmentIndex = this.attachments.findIndex(
      a => a.attachment_id === attachment_id && a.post_id === post_id
    );
    
    if (attachmentIndex === -1) return null;
    
    const attachment = this.attachments[attachmentIndex];
    this.attachments.splice(attachmentIndex, 1);
    
    return { attachment_id: attachment.attachment_id };
  }
  }
  
  export default MockDatabase;
  
