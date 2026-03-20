import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Plus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CommunitiesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const { data, isLoading, error } = useQuery({
    queryKey: ["resources-communities"],
    queryFn: () => api.communities.list({ publicOnly: "true" }),
  });

  const createMutation = useMutation({
    mutationFn: (body: { name: string; description: string; isPublic: boolean }) =>
      api.communities.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources-communities"] });
      setCreateOpen(false);
      setName("");
      setDescription("");
      setIsPublic(true);
      toast.success("Community created!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const joinMutation = useMutation({
    mutationFn: (id: string) => api.communities.join(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources-communities"] });
      toast.success("Joined community!");
    },
  });

  const leaveMutation = useMutation({
    mutationFn: (id: string) => api.communities.leave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources-communities"] });
      toast.success("Left community");
    },
  });

  const communities = data?.communities ?? [];

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Community name required");
      return;
    }
    createMutation.mutate({ name: name.trim(), description: description.trim(), isPublic });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Communities</h1>
            <p className="text-sm text-muted-foreground">Join or create groups to collaborate</p>
          </div>
        </div>
        {user && (
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Community
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}
      {error && <div className="text-center py-12 text-destructive">Failed to load communities</div>}
      {!isLoading && !error && (
        <div className="grid gap-4 sm:grid-cols-2">
          {communities.map((community, i) => (
            <motion.div
              key={community._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card overflow-hidden shadow-card hover:shadow-card-hover transition-shadow"
            >
              <Link to={`/community/${community._id}`} className="block">
                <div
                  className="h-24 bg-gradient-to-br from-primary/20 to-primary/5"
                  style={community.coverImageUrl ? { backgroundImage: `url(${community.coverImageUrl})`, backgroundSize: "cover" } : undefined}
                />
                <div className="p-4">
                  <h3 className="font-semibold text-foreground">{community.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {community.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">
                      {community.memberIds?.length ?? 0} members · by{" "}
                      <Link
                        to={`/profile/${community.createdBy?.username || community.createdBy?.id || community.createdBy?._id}`}
                        className="underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {community.createdBy?.name || "Unknown"}
                      </Link>
                    </span>
                    {user && (
                      community.isMember ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            leaveMutation.mutate(community._id);
                          }}
                          disabled={leaveMutation.isPending}
                        >
                          Leave
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            joinMutation.mutate(community._id);
                          }}
                          disabled={joinMutation.isPending}
                          className="gap-1"
                        >
                          <LogIn className="h-3.5 w-3.5" />
                          Join
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
      {!isLoading && !error && communities.length === 0 && (
        <div className="text-center py-12 text-muted-foreground rounded-xl border border-dashed border-border">
          No communities yet. Run <code className="px-1.5 py-0.5 rounded bg-muted">npm run seed</code> in resources-hub-api or create one.
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Community</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Community name" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this community about?"
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isPublic">Public (anyone can join)</Label>
            </div>
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
