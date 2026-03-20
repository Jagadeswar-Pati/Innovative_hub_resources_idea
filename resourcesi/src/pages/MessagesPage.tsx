import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MessageCircle, Send, IndianRupee, Image as ImageIcon, Video } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { avatarPlaceholder } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/components/ui/sonner";

const MESSAGE_FEE = 5;

export default function MessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();
  const [searchParams] = useSearchParams();
  const openPostId = searchParams.get("post");

  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [pendingPostId, setPendingPostId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    try {
      const { conversations: c } = await api.messages.getConversations();
      setConversations(c);
    } catch (e) {
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      loadConversations();
      if (selected?._id) {
        api.messages.getMessages(selected._id).then(({ messages: m }) => setMessages(m)).catch(() => {});
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [selected?._id]);

  useEffect(() => {
    if (openPostId && user) {
      api.messages
        .startConversation(openPostId)
        .then((res) => {
          if (res.needsPayment) {
            setPendingPostId(openPostId);
            setShowPayModal(true);
          } else if (res.conversation) {
            setSelected(res.conversation);
            setConversations((prev) => [
              res.conversation!,
              ...prev.filter((p) => p._id !== res.conversation!._id),
            ]);
          }
        })
        .catch(() => {});
    }
  }, [openPostId, user?.id]);

  useEffect(() => {
    if (selected) {
      api.messages.getMessages(selected._id).then(({ messages: m }) => setMessages(m));
    } else {
      setMessages([]);
    }
  }, [selected?._id]);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const matched = conversations.find((c) => c._id === conversationId);
      if (matched) setSelected(matched);
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStartFromPost = async (postId: string) => {
    try {
      const res = await api.messages.startConversation(postId);
      if (res.needsPayment) {
        setPendingPostId(postId);
        setShowPayModal(true);
      } else if (res.conversation) {
        setSelected(res.conversation);
        setConversations((prev) => [res.conversation, ...prev.filter((c) => c._id !== res.conversation!._id)]);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const handlePayAndStart = async () => {
    if (!pendingPostId) return;
    setPaying(true);
    try {
      const { conversation } = await api.messages.payMessageAccess(pendingPostId);
      setSelected(conversation);
      setConversations((prev) => [conversation, ...prev.filter((c) => c._id !== conversation._id)]);
      setShowPayModal(false);
      setPendingPostId(null);
      toast.success("Message access unlocked (₹5)");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const handleSend = async () => {
    if (!selected || !newMsg.trim()) return;
    try {
      const { message } = await api.messages.sendMessage(selected._id, newMsg.trim());
      setMessages((prev) => [...prev, message]);
      setNewMsg("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send");
    }
  };

  const handleVideoClick = () => {
    toast.info("Video feature coming soon.");
  };

  const imageInputRef = useRef<HTMLInputElement>(null);
  const handleImageSend = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selected) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image (JPEG, PNG, WebP, GIF)");
      return;
    }
    try {
      const { message } = await api.messages.sendImage(selected._id, file);
      setMessages((prev) => [...prev, message]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send image");
    }
    e.target.value = "";
  };

  const otherUser = selected
    ? selected.postOwnerId?.id === user?.id
      ? selected.otherUserId
      : selected.postOwnerId
    : null;

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border border-border bg-card overflow-hidden">
      <div className="w-full md:w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Messages</h2>
          <p className="text-xs text-muted-foreground">
            Free posts: message free. Paid posts: ₹5 to discuss.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No conversations yet. Click &quot;Message&quot; on a post to start.
            </div>
          ) : (
            conversations.map((c) => {
              const other = c.otherUser || (c.postOwnerId?.id === user?.id ? c.otherUserId : c.postOwnerId);
              return (
                <button
                  key={c._id}
                  onClick={() => {
                    setSelected(c);
                    navigate(`/messages/${c._id}`);
                  }}
                  className={`w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 ${
                    selected?._id === c._id ? "bg-muted" : ""
                  }`}
                >
                  <img
                    src={other?.avatarUrl || avatarPlaceholder(other?.name ?? "u")}
                    alt=""
                    className="h-10 w-10 rounded-full bg-muted"
                  />
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${other?.username || other?.id || other?._id}`} className="font-medium text-foreground truncate hover:underline">
                      {other?.name ?? "User"}
                    </Link>
                    <p className="text-xs text-muted-foreground truncate">
                      {c.postId?.title ?? "Discussion"}
                      {c.postCollaborationType === "paid" && (
                        <span className="ml-1 text-amber-600">· Paid</span>
                      )}
                    </p>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {selected ? (
          <>
            <div className="p-3 border-b border-border flex items-center gap-3">
              <img
                src={otherUser?.avatarUrl || avatarPlaceholder(otherUser?.name ?? "u")}
                alt=""
                className="h-9 w-9 rounded-full bg-muted"
              />
              <div>
                <Link to={`/profile/${otherUser?.username || otherUser?.id || otherUser?._id}`} className="font-medium text-foreground hover:underline">
                  {otherUser?.name ?? "User"}
                </Link>
                <p className="text-xs text-muted-foreground">{selected.postId?.title}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => {
                const isMe = m.senderId?.id === user?.id;
                return (
                  <div
                    key={m._id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isMe
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {m.imageUrl && (
                        <a href={m.imageUrl} target="_blank" rel="noopener noreferrer" className="block mb-1">
                          <img src={m.imageUrl} alt="Shared" className="rounded-lg max-h-48 object-cover" />
                        </a>
                      )}
                      {m.content && (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {m.content.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                            part.match(/^https?:\/\//) ? (
                              <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline">
                                {part}
                              </a>
                            ) : (
                              part
                            )
                          )}
                        </p>
                      )}
                      <p className={`text-[10px] mt-0.5 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t border-border flex gap-2 items-center">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSend}
              />
              <button
                onClick={() => imageInputRef.current?.click()}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Send image"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleVideoClick}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Video"
              >
                <Video className="h-5 w-5" />
              </button>
              <input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                onClick={handleSend}
                disabled={!newMsg.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation or message someone from a post
          </div>
        )}
      </div>

      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-foreground mb-2">Unlock messaging</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This is a paid collaboration post. Pay ₹5 to message the post owner for discussion.
            </p>
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400">
              <IndianRupee className="h-5 w-5" />
              <span className="font-bold">₹{MESSAGE_FEE}</span>
              <span className="text-sm">one-time</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowPayModal(false);
                  setPendingPostId(null);
                }}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handlePayAndStart}
                disabled={paying}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
              >
                {paying ? "Processing..." : "Pay ₹5 & Message"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
