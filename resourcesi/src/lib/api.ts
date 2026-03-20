const API_BASE = import.meta.env.VITE_RESOURCES_API_URL || 'http://localhost:5001/api/resources';

function getToken(): string | null {
  return localStorage.getItem('resources_token');
}

function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  auth: {
    register: async (body: {
      email: string;
      password: string;
      bio: string;
      name?: string;
      username?: string;
      role?: string;
      institution?: string;
      experienceLevel?: string;
      skills?: string[];
      links?: Record<string, string>;
    }) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return handleResponse<{ success: boolean; token: string; user: ResourcesUser; needsVerification?: boolean; verificationUrl?: string }>(res);
    },
    verifyEmail: async (token: string) => {
      const res = await fetch(`${API_BASE}/auth/verify-email?token=${encodeURIComponent(token)}`);
      return handleResponse<{ success: boolean; message: string }>(res);
    },
    login: async (email: string, password: string) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse<{ success: boolean; token: string; user: ResourcesUser }>(res);
    },
    forgotPassword: async (email: string) => {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return handleResponse<{ success: boolean; message: string; resetUrl?: string; expiresInMinutes?: number }>(res);
    },
    resetPassword: async (token: string, newPassword: string) => {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      return handleResponse<{ success: boolean; message: string }>(res);
    },
    me: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() });
      return handleResponse<{ success: boolean; user: ResourcesUser }>(res);
    },
    changePassword: async (currentPassword: string, newPassword: string) => {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      return handleResponse<{ success: boolean; message: string }>(res);
    },
    deleteAccount: async (password: string, confirm: string) => {
      const res = await fetch(`${API_BASE}/auth/delete-account`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password, confirm }),
      });
      return handleResponse<{ success: boolean; message: string }>(res);
    },
  },
  profile: {
    get: async () => {
      const res = await fetch(`${API_BASE}/profile/me`, { headers: getAuthHeaders() });
      return handleResponse<{ success: boolean; user: ResourcesUser }>(res);
    },
    getByHandle: async (handle: string) => {
      const res = await fetch(`${API_BASE}/profile/handle/${encodeURIComponent(handle)}`, { headers: getAuthHeaders() });
      return handleResponse<{ success: boolean; user: ResourcesUser }>(res);
    },
    update: async (body: Partial<ResourcesUser>) => {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      return handleResponse<{ success: boolean; user: ResourcesUser }>(res);
    },
    uploadAvatar: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/profile/avatar`, { method: 'POST', headers, body: formData });
      return handleResponse<{ success: boolean; avatarUrl: string; user: ResourcesUser }>(res);
    },
    uploadCover: async (file: File) => {
      const formData = new FormData();
      formData.append('cover', file);
      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/profile/cover`, { method: 'POST', headers, body: formData });
      return handleResponse<{ success: boolean; coverPhotoUrl: string; user: ResourcesUser }>(res);
    },
    follow: async (userId: string) => {
      const res = await fetch(`${API_BASE}/profile/follow/${userId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return handleResponse<{ success: boolean; followersCount: number; followingCount: number; isFollowing: boolean }>(res);
    },
    unfollow: async (userId: string) => {
      const res = await fetch(`${API_BASE}/profile/unfollow/${userId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return handleResponse<{ success: boolean; followersCount: number; followingCount: number; isFollowing: boolean }>(res);
    },
  },
  posts: {
    list: async (params?: { collaborationType?: string; tag?: string; postType?: string }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      const res = await fetch(`${API_BASE}/posts${q ? '?' + q : ''}`, { headers: getAuthHeaders() });
      return handleResponse<{ success: boolean; posts: ResourcesPost[] }>(res);
    },
    get: async (id: string) => {
      const res = await fetch(`${API_BASE}/posts/${id}`, { headers: getAuthHeaders() });
      return handleResponse<{ success: boolean; post: ResourcesPost }>(res);
    },
    create: async (formData: FormData) => {
      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers,
        body: formData,
      });
      return handleResponse<{ success: boolean; post: ResourcesPost }>(res);
    },
    update: async (id: string, formData: FormData) => {
      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/posts/${id}`, {
        method: 'PUT',
        headers,
        body: formData,
      });
      return handleResponse<{ success: boolean; post: ResourcesPost }>(res);
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE}/posts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse<{ success: boolean }>(res);
    },
  },
  projects: {
    list: async (params?: { category?: string; difficulty?: string; tag?: string }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      const res = await fetch(`${API_BASE}/projects${q ? '?' + q : ''}`, { headers: getAuthHeaders() });
      return handleResponse<{ success: boolean; projects: ResourcesProject[] }>(res);
    },
    get: async (id: string) => {
      const res = await fetch(`${API_BASE}/projects/${id}`, { headers: getAuthHeaders() });
      return handleResponse<{ success: boolean; project: ResourcesProject }>(res);
    },
    create: async (body: {
      title: string;
      description: string;
      category: string;
      difficulty?: string;
      tags?: string[];
      links?: { label?: string; url: string }[];
      pptUrl?: string;
      circuitDetails?: string;
      contactAllowed?: boolean;
    }) => {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      return handleResponse<{ success: boolean; project: ResourcesProject }>(res);
    },
  },
  search: {
    search: async (q: string, limit?: number) => {
      const params = new URLSearchParams({ q });
      if (limit) params.set('limit', String(limit));
      const res = await fetch(`${API_BASE}/search?${params}`, { headers: getAuthHeaders() });
      return handleResponse<SearchResult>(res);
    },
    users: async (q: string, limit?: number) => {
      const params = new URLSearchParams({ q });
      if (limit) params.set('limit', String(limit));
      const res = await fetch(`${API_BASE}/search/users?${params}`, { headers: getAuthHeaders() });
      return handleResponse<{ success: boolean; users: ResourcesUser[] }>(res);
    },
  },
  explore: {
    trending: async () => {
      const res = await fetch(`${API_BASE}/search/trending`, { headers: getAuthHeaders() });
      return handleResponse<TrendingResult>(res);
    },
  },
  communities: {
    list: async (params?: { publicOnly?: string }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      const res = await fetch(`${API_BASE}/communities${q ? '?' + q : ''}`, { headers: getAuthHeaders() });
      return handleResponse<{ success: boolean; communities: ResourcesCommunity[] }>(res);
    },
    get: async (id: string) => {
      const res = await fetch(`${API_BASE}/communities/${id}`, { headers: getAuthHeaders() });
      return handleResponse<{ success: boolean; community: ResourcesCommunity }>(res);
    },
    create: async (body: { name: string; description?: string; isPublic?: boolean }) => {
      const res = await fetch(`${API_BASE}/communities`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      return handleResponse<{ success: boolean; community: ResourcesCommunity }>(res);
    },
    join: async (id: string) => {
      const res = await fetch(`${API_BASE}/communities/${id}/join`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return handleResponse<{ success: boolean; community: ResourcesCommunity }>(res);
    },
    leave: async (id: string) => {
      const res = await fetch(`${API_BASE}/communities/${id}/leave`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return handleResponse<{ success: boolean; community: ResourcesCommunity }>(res);
    },
    messages: async (id: string) => {
      const res = await fetch(`${API_BASE}/communities/${id}/messages`, { headers: getAuthHeaders() });
      return handleResponse<{ success: boolean; messages: ResourcesCommunityMessage[] }>(res);
    },
    postMessage: async (id: string, body: { text?: string; imageUrl?: string }) => {
      const res = await fetch(`${API_BASE}/communities/${id}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      return handleResponse<{ success: boolean; message: ResourcesCommunityMessage }>(res);
    },
    deleteMessage: async (id: string, messageId: string) => {
      const res = await fetch(`${API_BASE}/communities/${id}/messages/${messageId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse<{ success: boolean; message: string }>(res);
    },
    addAdmin: async (id: string, userId: string) => {
      const res = await fetch(`${API_BASE}/communities/${id}/admins`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId }),
      });
      return handleResponse<{ success: boolean; community: ResourcesCommunity }>(res);
    },
    removeAdmin: async (id: string, userId: string) => {
      const res = await fetch(`${API_BASE}/communities/${id}/admins/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse<{ success: boolean; community: ResourcesCommunity }>(res);
    },
    deleteCommunity: async (id: string) => {
      const res = await fetch(`${API_BASE}/communities/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse<{ success: boolean; message: string }>(res);
    },
  },
  likes: {
    toggle: async (postId: string) => {
      const res = await fetch(`${API_BASE}/likes/${postId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return handleResponse<{ success: boolean; liked: boolean }>(res);
    },
  },
  comments: {
    list: async (postId: string) => {
      const res = await fetch(`${API_BASE}/comments/post/${postId}`, { headers: getAuthHeaders() });
      return handleResponse<{ success: boolean; comments: ResourcesComment[] }>(res);
    },
    create: async (postId: string, content: string) => {
      const res = await fetch(`${API_BASE}/comments/post/${postId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content }),
      });
      return handleResponse<{ success: boolean; comment: ResourcesComment }>(res);
    },
  },
  collaborations: {
    apply: async (postId: string, message?: string) => {
      const res = await fetch(`${API_BASE}/collaborations/apply/${postId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: message || '' }),
      });
      return handleResponse<{ success: boolean; collaboration: ResourcesCollaboration }>(res);
    },
    reject: async (collabId: string) => {
      const res = await fetch(`${API_BASE}/collaborations/reject/${collabId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return handleResponse<{ success: boolean; collaboration: ResourcesCollaboration }>(res);
    },
    accept: async (collabId: string) => {
      const res = await fetch(`${API_BASE}/collaborations/accept/${collabId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return handleResponse<{ success: boolean; collaboration: ResourcesCollaboration }>(res);
    },
    confirmPayment: async (collabId: string) => {
      const res = await fetch(`${API_BASE}/collaborations/confirm-payment/${collabId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return handleResponse<{ success: boolean; collaboration: ResourcesCollaboration }>(res);
    },
    complete: async (collabId: string) => {
      const res = await fetch(`${API_BASE}/collaborations/complete/${collabId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return handleResponse<{ success: boolean; collaboration: ResourcesCollaboration }>(res);
    },
    my: async () => {
      const res = await fetch(`${API_BASE}/collaborations/my`, { headers: getAuthHeaders() });
      return handleResponse<{ success: boolean; collaborations: ResourcesCollaboration[] }>(res);
    },
    postApplications: async (postId: string) => {
      const res = await fetch(`${API_BASE}/collaborations/post/${postId}`, { headers: getAuthHeaders() });
      return handleResponse<{ success: boolean; applications: ResourcesCollaboration[] }>(res);
    },
  },
  messages: {
    getFee: async () => {
      const res = await fetch(`${API_BASE}/messages/fee`, { headers: getAuthHeaders() });
      return handleResponse<{ success: boolean; messageFee: number }>(res);
    },
    startConversation: async (postId: string) => {
      const res = await fetch(`${API_BASE}/messages/start`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ postId }),
      });
      return handleResponse<StartConversationResponse>(res);
    },
    payMessageAccess: async (postId: string) => {
      const res = await fetch(`${API_BASE}/messages/pay-access`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ postId }),
      });
      return handleResponse<{ success: boolean; conversation: ResourcesConversation }>(res);
    },
    getConversations: async () => {
      const res = await fetch(`${API_BASE}/messages/conversations`, { headers: getAuthHeaders() });
      return handleResponse<{ success: boolean; conversations: ConversationWithMeta[] }>(res);
    },
    getMessages: async (conversationId: string) => {
      const res = await fetch(`${API_BASE}/messages/conversations/${conversationId}`, { headers: getAuthHeaders() });
      return handleResponse<{ success: boolean; messages: ResourcesMessage[] }>(res);
    },
    sendMessage: async (conversationId: string, content: string) => {
      const res = await fetch(`${API_BASE}/messages/conversations/${conversationId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content }),
      });
      return handleResponse<{ success: boolean; message: ResourcesMessage }>(res);
    },
    sendImage: async (conversationId: string, file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/messages/conversations/${conversationId}/image`, {
        method: 'POST',
        headers,
        body: formData,
      });
      return handleResponse<{ success: boolean; message: ResourcesMessage }>(res);
    },
  },
  notifications: {
    list: async () => {
      const res = await fetch(`${API_BASE}/notifications`, { headers: getAuthHeaders() });
      return handleResponse<{ success: boolean; notifications: ResourcesNotification[]; unreadCount: number }>(res);
    },
    markRead: async (id: string) => {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      return handleResponse<{ success: boolean; notification: ResourcesNotification }>(res);
    },
    markAllRead: async () => {
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      return handleResponse<{ success: boolean; message: string }>(res);
    },
  },
};

export interface ResourcesUser {
  id: string;
  _id?: string;
  name: string;
  username?: string | null;
  email: string;
  bio?: string;
  role?: 'student' | 'mentor' | 'professor' | null;
  skills?: string[];
  experienceLevel?: string | null;
  avatarUrl?: string | null;
  coverPhotoUrl?: string | null;
  institution?: string;
  links?: Record<string, string>;
  education?: string;
  experience?: string;
  interests?: string[];
  followers?: string[];
  following?: string[];
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  paidProfile?: boolean;
  profileVisibility?: 'public' | 'private';
  walletBalance?: number;
  isEmailVerified?: boolean;
}

export interface ResourcesPost {
  _id: string;
  title: string;
  description: string;
  mediaUrl?: string | null;
  mediaType: string;
  tags: string[];
  postType?: 'idea' | 'startup' | 'resource' | 'general';
  featuredPaid?: boolean;
  collaborationType: 'free' | 'paid';
  budget?: number | null;
  deadline?: string | null;
  platformFee?: number | null;
  gstAmount?: number | null;
  totalAmount?: number | null;
  createdBy: ResourcesUser;
  createdAt: string;
  updatedAt: string;
  likes?: number;
  comments?: number;
  liked?: boolean;
}

export interface ResourcesComment {
  _id: string;
  postId: string;
  userId: ResourcesUser;
  content: string;
  createdAt: string;
}

export interface ResourcesConversation {
  _id: string;
  postId: { _id: string; title: string; collaborationType: string };
  postOwnerId: ResourcesUser;
  otherUserId: ResourcesUser;
  postCollaborationType: string;
  messageAccessPaid?: boolean;
  lastMessageAt?: string;
}

export interface ResourcesMessage {
  _id: string;
  conversationId: string;
  senderId: ResourcesUser;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
}

export interface StartConversationResponse {
  success: boolean;
  conversation: ResourcesConversation | null;
  needsPayment: boolean;
  messageFee: number | null;
  post?: { _id: string; title: string };
}

export interface ConversationWithMeta extends ResourcesConversation {
  otherUser: ResourcesUser;
  lastMessage?: ResourcesMessage;
  unreadCount: number;
}

export interface SearchResult {
  success: boolean;
  users: ResourcesUser[];
  posts: ResourcesPost[];
  projects: ResourcesProject[];
  communities: ResourcesCommunity[];
  hashtags: { tag: string; count: number }[];
}

export interface TrendingResult {
  success: boolean;
  trendingIdeas: ResourcesPost[];
  trendingStartups: ResourcesPost[];
  popularCommunities: ResourcesCommunity[];
  hashtags: { tag: string; count: number }[];
}

export interface ResourcesCommunity {
  _id: string;
  name: string;
  description?: string;
  avatarUrl?: string | null;
  coverImageUrl?: string | null;
  isPublic: boolean;
  createdBy: ResourcesUser;
  adminIds?: ResourcesUser[];
  memberIds?: ResourcesUser[];
  isMember?: boolean;
  isAdmin?: boolean;
  createdAt: string;
}

export interface ResourcesCommunityMessage {
  _id: string;
  communityId: string;
  senderId: ResourcesUser;
  text?: string;
  imageUrl?: string | null;
  createdAt: string;
}

export interface ResourcesProject {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  links?: { label?: string; url: string }[];
  pptUrl?: string | null;
  circuitDetails?: string | null;
  createdBy?: ResourcesUser | null;
  contactAllowed?: boolean;
  isDummy?: boolean;
  createdAt: string;
}

export interface ResourcesCollaboration {
  _id: string;
  postId: { _id: string; title: string; description: string; collaborationType: string; budget?: number; totalAmount?: number };
  ownerId: ResourcesUser;
  applicantId: ResourcesUser;
  applicantMessage?: string;
  status: string;
  budget?: number;
  totalAmount?: number;
  paidAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export interface ResourcesNotification {
  _id: string;
  userId: string;
  actorId?: ResourcesUser | null;
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}
