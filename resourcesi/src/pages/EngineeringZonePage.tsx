import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Plus, Link2, Presentation, Cpu, ExternalLink, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "CSE", label: "CSE" },
  { value: "ECE", label: "ECE" },
  { value: "EEE", label: "EEE" },
  { value: "Mechanical", label: "Mechanical" },
  { value: "Civil", label: "Civil" },
  { value: "AI_ML", label: "AI & ML" },
  { value: "Robotics", label: "Robotics" },
  { value: "IoT", label: "IoT" },
];

const DIFFICULTIES = [
  { value: "", label: "All" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const TRENDING_ENGINEERING_IDEAS = [
  "AI-based Smart Irrigation System",
  "Gesture Controlled Robot Arm",
  "IoT Smart Energy Meter",
  "Autonomous Delivery Robot",
  "Smart Helmet for Accident Detection",
  "Smart Attendance System using Face Recognition",
  "AI Resume Analyzer",
  "Low-cost CNC Machine",
  "Drone-based Crop Monitoring",
  "Smart Waste Segregation System",
];

export default function EngineeringZonePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "CSE",
    difficulty: "intermediate",
    tags: [] as string[],
    links: [] as { label: string; url: string }[],
    pptUrl: "",
    circuitDetails: "",
    contactAllowed: true,
  });

  const addLink = () => setForm((f) => ({ ...f, links: [...f.links, { label: "", url: "" }] }));
  const updateLink = (i: number, field: "label" | "url", v: string) => {
    setForm((f) => {
      const next = [...f.links];
      next[i] = { ...next[i], [field]: v };
      return { ...f, links: next };
    });
  };
  const removeLink = (i: number) => setForm((f) => ({ ...f, links: f.links.filter((_, j) => j !== i) }));

  const handleShareSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    setSubmitting(true);
    try {
      await api.projects.create({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        difficulty: form.difficulty,
        tags: form.tags,
        links: form.links.filter((l) => l.url?.trim()),
        pptUrl: form.pptUrl.trim() || undefined,
        circuitDetails: form.circuitDetails.trim() || undefined,
        contactAllowed: form.contactAllowed,
      });
      toast.success("Idea shared successfully!");
      setShareOpen(false);
      setForm({ title: "", description: "", category: "CSE", difficulty: "intermediate", tags: [], links: [], pptUrl: "", circuitDetails: "", contactAllowed: true });
      queryClient.invalidateQueries({ queryKey: ["resources-projects"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to share idea");
    } finally {
      setSubmitting(false);
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["resources-projects", category, difficulty],
    queryFn: () => api.projects.list({ category: category || undefined, difficulty: difficulty || undefined }),
  });

  const projects = data?.projects ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Engineering Zone</h1>
            <p className="text-sm text-muted-foreground">
              Semester project ideas · Branch-wise · Mini & Major projects
            </p>
          </div>
        </div>
        {user ? (
          <Button onClick={() => setShareOpen(true)} size="sm" className="shrink-0">
            <Plus className="h-4 w-4 mr-1" />
            Share Idea
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className="shrink-0">
            Sign in to share ideas
          </Button>
        )}
      </div>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Share project idea</DialogTitle>
            <DialogDescription>Add links, PPT, circuit details — anything helpful for others.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Smart Home Automation" />
            </div>
            <div>
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief idea description" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Branch</Label>
                <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.filter((c) => c.value).map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Difficulty</Label>
                <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}>
                  {DIFFICULTIES.filter((d) => d.value).map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-1.5"><Link2 className="h-4 w-4" /> Links</Label>
              <div className="mt-1 space-y-2">
                {form.links.map((l, i) => (
                  <div key={i} className="flex gap-2">
                    <Input placeholder="Label (optional)" value={l.label} onChange={(e) => updateLink(i, "label", e.target.value)} className="flex-1" />
                    <Input placeholder="URL" value={l.url} onChange={(e) => updateLink(i, "url", e.target.value)} className="flex-[2]" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addLink}>Add link</Button>
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-1.5"><Presentation className="h-4 w-4" /> PPT / Slides link</Label>
              <Input value={form.pptUrl} onChange={(e) => setForm((f) => ({ ...f, pptUrl: e.target.value }))} placeholder="https://drive.google.com/..." className="mt-1" />
            </div>
            <div>
              <Label className="flex items-center gap-1.5"><Cpu className="h-4 w-4" /> Circuit details / diagram link</Label>
              <Textarea value={form.circuitDetails} onChange={(e) => setForm((f) => ({ ...f, circuitDetails: e.target.value }))} placeholder="Circuit diagram URL or brief details" rows={2} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareOpen(false)}>Cancel</Button>
            <Button onClick={handleShareSubmit} disabled={submitting}>{submitting ? "Sharing…" : "Share"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap gap-3">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground">Branch:</span>
          {CATEGORIES.map((c) => (
            <button
              key={c.value || "all"}
              onClick={() => setCategory(c.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                category === c.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground">Difficulty:</span>
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value || "all"}
              onClick={() => setDifficulty(d.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                difficulty === d.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 font-semibold text-foreground">Trending Engineering Ideas</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {TRENDING_ENGINEERING_IDEAS.map((idea) => (
            <div key={idea} className="rounded-lg bg-muted/40 px-3 py-2 text-sm text-foreground">
              {idea}
            </div>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-muted-foreground">Loading projects...</p>
        </div>
      )}
      {error && (
        <div className="text-center py-12 text-destructive">Failed to load projects</div>
      )}
      {!isLoading && !error && (
        <div className="space-y-4">
          {projects.map((project, i) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-border bg-card p-4 shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
                      {project.category.replace("_", " ")}
                    </span>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground capitalize">
                      {project.difficulty}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {project.description}
                  </p>
                  {project.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {(project.links?.length || project.pptUrl || project.circuitDetails) && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.links?.map((l, idx) => (
                        <a key={idx} href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          <Link2 className="h-3 w-3" />
                          {l.label || l.url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                      {project.pptUrl && (
                        <a href={project.pptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          <Presentation className="h-3 w-3" />
                          PPT / Slides
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {project.circuitDetails && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Cpu className="h-3 w-3" />
                          {project.circuitDetails.startsWith("http") ? (
                            <a href={project.circuitDetails} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              Circuit diagram <ExternalLink className="h-3 w-3 inline" />
                            </a>
                          ) : (
                            project.circuitDetails
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {project.contactAllowed && project.createdBy && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">
                      By{" "}
                      <Link to={`/profile/${project.createdBy?.username || project.createdBy?.id || project.createdBy?._id}`} className="underline">
                        {project.createdBy?.name || "Anonymous"}
                      </Link>
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {!isLoading && !error && projects.length === 0 && (
        <div className="text-center py-12 text-muted-foreground rounded-xl border border-dashed border-border">
          No projects found. Run <code className="px-1.5 py-0.5 rounded bg-muted">npm run seed</code> in resources-hub-api to load dummy data.
        </div>
      )}
    </div>
  );
}
