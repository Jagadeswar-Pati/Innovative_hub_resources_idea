import { Bell, IndianRupee, MessageCircle, UserPlus, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { avatarPlaceholder } from "@/lib/constants";

const typeIcon = {
  new_message: MessageCircle,
  new_follower: UserPlus,
  community_update: Users,
  engineering_paid_unlock: IndianRupee,
};

const typeColor = {
  new_message: "text-primary bg-primary/10",
  new_follower: "text-accent bg-accent/10",
  community_update: "text-primary bg-primary/10",
  engineering_paid_unlock: "text-amber-600 bg-amber-500/10",
};

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["resources-notifications"],
    queryFn: () => api.notifications.list(),
    refetchInterval: 10000,
  });
  const notifications = data?.notifications ?? [];

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.notifications.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resources-notifications"] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.notifications.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resources-notifications"] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-foreground">Notifications</h1>
        <button
          onClick={() => markAllMutation.mutate()}
          className="text-xs text-primary hover:underline disabled:opacity-50"
          disabled={markAllMutation.isPending || notifications.length === 0}
        >
          Mark all as read
        </button>
      </div>
      <div className="space-y-2">
        {notifications.map((notif, i) => {
          const Icon = typeIcon[notif.type as keyof typeof typeIcon] || Bell;
          const colorClass = typeColor[notif.type as keyof typeof typeColor] || "text-primary bg-primary/10";
          return (
            <motion.div
              key={notif._id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => !notif.read && markReadMutation.mutate(notif._id)}
              className={`flex items-center gap-3 rounded-xl border border-border p-4 transition-colors ${
                notif.read ? "bg-card" : "bg-primary/5"
              }`}
            >
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <img
                src={notif.actorId?.avatarUrl || avatarPlaceholder(notif.actorId?.name || "User")}
                alt=""
                className="h-9 w-9 rounded-full bg-muted"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{notif.title}</span>{" "}
                  <span className="text-muted-foreground">{notif.message}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{new Date(notif.createdAt).toLocaleString()}</p>
              </div>
              {!notif.read && <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary" />}
            </motion.div>
          );
        })}
        {notifications.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No notifications yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
