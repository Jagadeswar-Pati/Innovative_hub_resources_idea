import React, { useEffect, useState } from 'react';
import {
  FileText,
  DollarSign,
  TrendingUp,
  Trash2,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/sonner';
import * as resourcesHubApi from '@/services/resourcesHubAdminApi';

interface Post {
  _id: string;
  title: string;
  description: string;
  collaborationType: string;
  budget?: number;
  totalAmount?: number;
  createdBy?: { name: string; email: string };
  createdAt: string;
}

interface Collaboration {
  _id: string;
  status: string;
  budget?: number;
  totalAmount?: number;
  ownerId?: { name: string; email: string };
  applicantId?: { name: string; email: string };
  postId?: { title: string };
  createdAt: string;
}

const ResourcesHub: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [revenue, setRevenue] = useState<{ totalRevenue: number; gstCollected: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [postsRes, collabsRes, revenueRes] = await Promise.all([
        resourcesHubApi.getResourcesPosts(),
        resourcesHubApi.getPaidCollaborations(),
        resourcesHubApi.getRevenueStats(),
      ]);
      setPosts(postsRes.posts || []);
      setCollaborations(collabsRes.collaborations || []);
      setRevenue(revenueRes);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load Resources Hub data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeletePost = async (id: string) => {
    try {
      await resourcesHubApi.deleteResourcesPost(id);
      setPosts((p) => p.filter((x) => x._id !== id));
      setDeleteId(null);
      toast.success('Post deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resources & Ideas Hub</h1>
          <p className="text-muted-foreground">Manage posts, collaborations, and revenue</p>
        </div>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(revenue?.totalRevenue ?? 0).toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GST Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(revenue?.gstCollected ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
          <CardDescription>View and delete posts from the Resources Hub</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No posts
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-medium truncate max-w-[200px]">{p.title}</TableCell>
                    <TableCell>
                      <span
                        className={
                          p.collaborationType === 'paid'
                            ? 'text-amber-600'
                            : 'text-muted-foreground'
                        }
                      >
                        {p.collaborationType}
                      </span>
                    </TableCell>
                    <TableCell>{p.createdBy?.name ?? '—'}</TableCell>
                    <TableCell>
                      {p.budget ? `₹${p.budget.toLocaleString('en-IN')}` : '—'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(p._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paid Collaborations</CardTitle>
          <CardDescription>View paid collaboration activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collaborations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No paid collaborations
                  </TableCell>
                </TableRow>
              ) : (
                collaborations.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="truncate max-w-[150px]">{c.postId?.title ?? '—'}</TableCell>
                    <TableCell>{c.ownerId?.name ?? '—'}</TableCell>
                    <TableCell>{c.applicantId?.name ?? '—'}</TableCell>
                    <TableCell>{c.status}</TableCell>
                    <TableCell>₹{(c.totalAmount ?? 0).toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDeletePost(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ResourcesHub;
