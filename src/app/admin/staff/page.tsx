"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Users, Shield, Building2, RefreshCcw, Clock, LayoutDashboard, ShieldAlert, TrendingUp, Gavel, CalendarDays, X, ScrollText, Bell, Sparkles, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const AUDIT_MODULES = ["all", "staff", "ranks", "departments", "duty", "discipline", "promotions", "complaints"];

const SCHED_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SCHED_SLOTS = [
  { h: 20, l: "20:00 – 21:00" }, { h: 21, l: "21:00 – 22:00" }, { h: 22, l: "22:00 – 23:00" },
  { h: 23, l: "23:00 – 00:00" }, { h: 0, l: "00:00 – 01:00" }, { h: 1, l: "01:00 – 02:00" },
];

interface Rank { id: string; name: string; level: number; color: string | null; permissions: Record<string, string[]>; }
interface Department { id: string; name: string; description: string | null; color: string | null; }
interface Staff {
  id: string; display_name: string; discord_id: string | null; steam_id: string | null;
  fivem_identifier: string | null; email: string | null; avatar_url: string | null;
  join_date: string | null; status: string; notes: string | null;
  rank: Rank | null; department: Department | null;
}

type Tab = "overview" | "directory" | "duty" | "schedule" | "notifications" | "assistant" | "ranks" | "departments" | "audit";

const AI_REPORTS = [
  { key: "executive_summary", label: "Executive Summary", desc: "High-level state of the team for leadership." },
  { key: "weekly_report", label: "Weekly Report", desc: "Activity, complaints, promotions & coverage over the period." },
  { key: "risk_analysis", label: "Risk Analysis", desc: "Where the team carries operational risk, ranked." },
  { key: "promotion_recommendations", label: "Promotion & Training", desc: "Who looks ready, backed by the numbers." },
];
const STATUSES = ["active", "inactive", "on_leave", "suspended"];

// Duty tracking launched on this date — no window ever counts data before it.
const TRACKING_START = new Date(2026, 6, 12, 0, 0, 0, 0); // 12 Jul 2026
const DAY_MS = 86_400_000;

function fmtDuration(seconds: number): string {
  if (!seconds) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ISO → value for <input type="datetime-local"> in local time
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

const emptyStaff = { display_name: "", discord_id: "", email: "", rank_id: "", department_id: "", status: "active", notes: "" };

export default function StaffOpsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [overview, setOverview] = useState<any>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");

  // Dialog state
  const [staffForm, setStaffForm] = useState<any>(null); // null = closed; {id?} = open
  const [bulkImporting, setBulkImporting] = useState(false);
  const [rankForm, setRankForm] = useState<any>(null);
  const [deptForm, setDeptForm] = useState<any>(null);

  // Duty state
  const [duty, setDuty] = useState<{ sessions: any[]; onDuty: any[]; totals: any[] } | null>(null);
  const [dutyRange, setDutyRange] = useState<"today" | "week" | "month">("week");
  const [syncing, setSyncing] = useState(false);
  const [editSession, setEditSession] = useState<any>(null);
  // Audit
  const [audit, setAudit] = useState<any[]>([]);
  const [auditModule, setAuditModule] = useState("all");
  // Schedule
  const [schedule, setSchedule] = useState<any[]>([]);
  const [addCell, setAddCell] = useState<any>(null); // { day, slot }
  const [addStaffId, setAddStaffId] = useState("");
  // Notifications
  const [notif, setNotif] = useState<{ alerts: any[]; counts: any; generatedAt: string } | null>(null);
  // AI Assistant
  const [aiType, setAiType] = useState<string>("executive_summary");
  const [aiReport, setAiReport] = useState<{ label: string; text: string; generatedAt: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Auth gate — reuse the existing admin session check
  useEffect(() => {
    fetch("/api/admin/me")
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(() => setReady(true))
      .catch(() => router.push("/admin/login"));
  }, [router]);

  const loadAll = useCallback(async () => {
    try {
      const [s, r, d] = await Promise.all([
        fetch("/api/admin/staff"),
        fetch("/api/admin/ranks"),
        fetch("/api/admin/departments"),
      ]);
      if (s.status === 401) { toast.error("You don't have access to Staff Operations."); router.push("/admin/codes"); return; }
      if (s.ok) setStaff(await s.json());
      if (r.ok) setRanks(await r.json());
      if (d.ok) setDepartments(await d.json());
    } catch { toast.error("Failed to load data."); }
  }, []);

  useEffect(() => { if (ready) loadAll(); }, [ready, loadAll]);

  const loadDuty = useCallback(async (range: "today" | "week" | "month") => {
    const now = new Date();
    let from: Date;
    if (range === "today") {
      from = new Date(now); from.setHours(0, 0, 0, 0);
    } else if (range === "week") {
      // rolling 7 days, but never before the tracking start
      from = new Date(Math.max(now.getTime() - 7 * DAY_MS, TRACKING_START.getTime()));
    } else {
      // rolling 30 days, floored at tracking start
      from = new Date(Math.max(now.getTime() - 30 * DAY_MS, TRACKING_START.getTime()));
    }
    try {
      const res = await fetch(`/api/admin/duty?from=${from.toISOString()}&to=${now.toISOString()}`);
      if (res.status === 401) { toast.error("No access to Duty."); return; }
      if (res.ok) setDuty(await res.json());
    } catch { toast.error("Failed to load duty data."); }
  }, []);

  useEffect(() => { if (ready && tab === "duty") loadDuty(dutyRange); }, [ready, tab, dutyRange, loadDuty]);

  const loadOverview = useCallback(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    // "Duty Today" = start of today; the leaderboard/total = since the tracking start
    fetch(`/api/admin/staff-ops/overview?today=${today.toISOString()}&week=${TRACKING_START.toISOString()}`)
      .then(r => r.ok ? r.json() : null).then(d => { if (d) setOverview(d); }).catch(() => {});
  }, []);
  useEffect(() => { if (ready && tab === "overview") loadOverview(); }, [ready, tab, loadOverview]);

  const loadAudit = useCallback(() => {
    fetch(`/api/admin/audit?module=${auditModule}`).then(r => r.ok ? r.json() : []).then(setAudit).catch(() => {});
  }, [auditModule]);
  useEffect(() => { if (ready && tab === "audit") loadAudit(); }, [ready, tab, loadAudit]);

  const loadSchedule = useCallback(() => {
    fetch("/api/admin/schedule").then(r => r.ok ? r.json() : []).then(setSchedule).catch(() => {});
  }, []);
  useEffect(() => { if (ready && tab === "schedule") loadSchedule(); }, [ready, tab, loadSchedule]);

  const loadNotifications = useCallback(() => {
    fetch("/api/admin/notifications").then(r => r.ok ? r.json() : null).then(d => { if (d) setNotif(d); }).catch(() => {});
  }, []);
  // Load once on ready so the header bell badge is always current.
  useEffect(() => { if (ready) loadNotifications(); }, [ready, loadNotifications]);

  const generateReport = useCallback(async (type: string) => {
    setAiLoading(true); setAiReport(null);
    try {
      const res = await fetch("/api/admin/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to generate report."); return; }
      setAiReport(data);
    } catch { toast.error("Failed to reach the AI service."); }
    finally { setAiLoading(false); }
  }, []);

  const addAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addStaffId) return;
    const res = await fetch("/api/admin/schedule", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ staff_id: addStaffId, day_of_week: addCell.day, slot_hour: addCell.slot }) });
    if (res.ok) { toast.success("Assigned."); setAddCell(null); setAddStaffId(""); loadSchedule(); } else toast.error((await res.json()).error || "Failed.");
  };
  const removeAssignment = async (id: string) => {
    const res = await fetch(`/api/admin/schedule?id=${id}`, { method: "DELETE" });
    if (res.ok) loadSchedule(); else toast.error("Failed to remove.");
  };

  const closeSessionNow = async (id: string) => {
    const res = await fetch(`/api/admin/duty/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ close_now: true }) });
    if (res.ok) { toast.success("Session closed."); loadDuty(dutyRange); } else toast.error((await res.json()).error || "Failed.");
  };
  const deleteSession = async (id: string) => {
    if (!confirm("Delete this duty session?")) return;
    const res = await fetch(`/api/admin/duty/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted."); loadDuty(dutyRange); } else toast.error("Failed to delete.");
  };
  const saveSessionEnd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/admin/duty/${editSession.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ended_at: new Date(editSession.end).toISOString() }) });
    if (res.ok) { toast.success("Session updated."); setEditSession(null); loadDuty(dutyRange); } else toast.error((await res.json()).error || "Failed.");
  };

  const syncDutyNow = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/duty/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) { toast.success(`Synced: ${data.opened} started, ${data.closed} ended.`); loadDuty(dutyRange); }
      else toast.error(data.error || "Sync failed.");
    } catch { toast.error("Sync failed."); }
    finally { setSyncing(false); }
  };

  if (!ready) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const filteredStaff = staff.filter(s => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return [s.display_name, s.discord_id, s.steam_id, s.fivem_identifier, s.email, s.rank?.name, s.department?.name]
      .some(v => v?.toLowerCase().includes(q));
  });

  // ── Handlers ───────────────────────────────────────────────
  const saveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = staffForm.id ? "PATCH" : "POST";
    const res = await fetch("/api/admin/staff", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(staffForm) });
    const data = await res.json();
    if (res.ok) { toast.success(staffForm.id ? "Staff updated." : "Staff added."); setStaffForm(null); loadAll(); }
    else toast.error(data.error || "Failed to save.");
  };
  const bulkImport = async () => {
    if (!confirm("Import all members of the Discord 'Staff Team' role as staff? Existing members are skipped.")) return;
    setBulkImporting(true);
    try {
      const res = await fetch("/api/admin/staff/bulk-import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const data = await res.json();
      if (res.ok) { toast.success(`Imported ${data.imported} · skipped ${data.skipped} existing · ${data.matched} in role.`); loadAll(); }
      else toast.error(data.error || "Bulk import failed.");
    } catch { toast.error("Bulk import failed."); }
    finally { setBulkImporting(false); }
  };

  const deleteStaff = async (id: string) => {
    if (!confirm("Remove this staff member?")) return;
    const res = await fetch(`/api/admin/staff?id=${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Removed."); loadAll(); } else toast.error("Failed to remove.");
  };

  const saveRank = async (e: React.FormEvent) => {
    e.preventDefault();
    let permissions = rankForm.permissions;
    if (typeof permissions === "string") {
      try { permissions = JSON.parse(permissions); }
      catch { toast.error("Permissions must be valid JSON."); return; }
    }
    const method = rankForm.id ? "PATCH" : "POST";
    const payload = { ...rankForm, level: Number(rankForm.level) || 0, permissions };
    const res = await fetch("/api/admin/ranks", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (res.ok) { toast.success("Rank saved."); setRankForm(null); loadAll(); } else toast.error(data.error || "Failed.");
  };
  const deleteRank = async (id: string) => {
    if (!confirm("Delete this rank? Staff on it will lose their rank.")) return;
    const res = await fetch(`/api/admin/ranks?id=${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted."); loadAll(); } else toast.error("Failed.");
  };

  const saveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = deptForm.id ? "PATCH" : "POST";
    const res = await fetch("/api/admin/departments", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(deptForm) });
    const data = await res.json();
    if (res.ok) { toast.success("Department saved."); setDeptForm(null); loadAll(); } else toast.error(data.error || "Failed.");
  };
  const deleteDept = async (id: string) => {
    if (!confirm("Delete this department?")) return;
    const res = await fetch(`/api/admin/departments?id=${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted."); loadAll(); } else toast.error("Failed.");
  };

  const statusColor = (s: string) => s === "active" ? "bg-green-500/15 text-green-400" : s === "on_leave" ? "bg-amber-500/15 text-amber-400" : s === "suspended" ? "bg-red-500/15 text-red-400" : "bg-gray-500/15 text-gray-400";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => router.push("/admin/codes")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#333] text-gray-400 hover:text-white hover:bg-white/5 text-xs font-black uppercase tracking-widest">
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </button>
          <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase">Staff Operations</h1>
          <Button variant="outline" size="sm" onClick={loadAll} className="ml-auto bg-transparent border-[#333] hover:bg-white/5 text-xs"><RefreshCcw className="w-3 h-3 mr-1.5" /> Refresh</Button>
        </div>

        {/* Sub-tab nav */}
        <div className="flex border-b border-[#222] gap-1">
          {([["overview", "Overview", LayoutDashboard], ["directory", "Directory", Users], ["duty", "Duty", Clock], ["schedule", "Schedule", CalendarDays], ["notifications", "Alerts", Bell], ["assistant", "AI Assistant", Sparkles], ["ranks", "Ranks", Shield], ["departments", "Departments", Building2], ["audit", "Audit Log", ScrollText]] as const).map(([key, label, Icon]) => (
            <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest border-b-2 -mb-px transition-colors ${tab === key ? "text-amber-500 border-amber-500" : "text-gray-500 border-transparent hover:text-gray-300"}`}>
              <Icon size={14} /> {label}
              {key === "notifications" && notif && notif.counts.total > 0 && (
                <span className={`ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center ${notif.counts.high > 0 ? "bg-red-500 text-white" : "bg-amber-500 text-black"}`}>{notif.counts.total}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="space-y-5">
            {!overview ? (
              <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Kpi icon={<Clock size={16} />} label="On Duty Now" value={String(overview.duty.onDutyNow)} accent="green" />
                  <Kpi icon={<Clock size={16} />} label="Duty Today" value={fmtDuration(overview.duty.todaySeconds)} />
                  <Kpi icon={<Users size={16} />} label="Active Staff" value={`${overview.staff.active}/${overview.staff.total}`} />
                  <Kpi icon={<ShieldAlert size={16} />} label="Open Complaints" value={String(overview.complaints.open)} accent={overview.complaints.open ? "red" : undefined} />
                  <Kpi icon={<TrendingUp size={16} />} label="Pending Promotions" value={String(overview.promotions.pending)} accent={overview.promotions.pending ? "amber" : undefined} />
                  <Kpi icon={<Gavel size={16} />} label="Active Discipline" value={String(overview.discipline.active)} accent={overview.discipline.active ? "red" : undefined} />
                  <Kpi icon={<ShieldAlert size={16} />} label="Total Complaints" value={String(overview.complaints.total)} />
                </div>

                {/* Duty trend chart */}
                <Card className="bg-[#111] border-[#222] p-4">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3 flex items-center gap-2"><TrendingUp size={13} /> Duty Hours — last 14 days</p>
                  <div style={{ width: "100%", height: 200 }}>
                    <ResponsiveContainer>
                      <BarChart data={overview.duty.dailyDuty || []} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} tick={{ fill: "#666", fontSize: 10 }} axisLine={{ stroke: "#333" }} tickLine={false} />
                        <YAxis tick={{ fill: "#666", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#aaa" }} formatter={(v: any) => [`${v}h`, "Duty"]} />
                        <Bar dataKey="hours" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Duty leaderboard */}
                  <Card className="bg-[#111] border-[#222] p-4">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3 flex items-center gap-2"><TrendingUp size={13} /> Top Duty (since launch)</p>
                    {overview.duty.top.length === 0 ? <p className="text-gray-600 text-sm italic">No duty recorded.</p> : (
                      <div className="space-y-2">
                        {overview.duty.top.map((t: any, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-gray-600 font-black text-sm w-4">{i + 1}</span>
                            {t.avatar ? <img src={t.avatar} className="w-7 h-7 rounded-full" alt="" /> : <div className="w-7 h-7 rounded-full bg-[#222]" />}
                            <span className="text-sm flex-1 truncate">{t.name}</span>
                            <span className="font-mono text-amber-400 text-sm">{fmtDuration(t.seconds)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Complaint status breakdown */}
                  <Card className="bg-[#111] border-[#222] p-4">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3 flex items-center gap-2"><ShieldAlert size={13} /> Complaints by Status</p>
                    {Object.keys(overview.complaints.byStatus).length === 0 ? <p className="text-gray-600 text-sm italic">No complaints filed.</p> : (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(overview.complaints.byStatus).map(([s, n]: any) => (
                          <div key={s} className="px-3 py-2 rounded-xl bg-white/5 border border-white/5">
                            <p className="text-[9px] text-gray-500 uppercase tracking-widest">{s.replace(/_/g, " ")}</p>
                            <p className="text-lg font-black italic">{n}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── DIRECTORY ── */}
        {tab === "directory" && (
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <Input placeholder="Search name, Discord, rank..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 min-w-[200px] bg-[#111] border-[#333]" />
              <Button onClick={bulkImport} disabled={bulkImporting} variant="outline" className="bg-transparent border-[#333] hover:bg-white/5 font-black uppercase text-xs tracking-widest"><Users size={14} className="mr-1" /> {bulkImporting ? "Importing..." : "Bulk Import (Staff Team)"}</Button>
              <Button onClick={() => setStaffForm({ ...emptyStaff })} className="bg-amber-500 text-black font-black uppercase text-xs tracking-widest"><Plus size={14} className="mr-1" /> Add Staff</Button>
            </div>
            <Card className="bg-[#111] border-[#222] overflow-hidden">
              <Table>
                <TableHeader className="bg-[#1a1a1a]"><TableRow className="border-[#222]"><TableHead>Member</TableHead><TableHead>Rank</TableHead><TableHead>Department</TableHead><TableHead>Status</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredStaff.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-gray-600 py-10 italic">No staff yet.</TableCell></TableRow>}
                  {filteredStaff.map(s => (
                    <TableRow key={s.id} className="border-[#222] hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {s.avatar_url ? <img src={s.avatar_url} className="w-8 h-8 rounded-full" alt="" /> : <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-xs font-black text-gray-500">{s.display_name[0]?.toUpperCase()}</div>}
                          <div><p className="font-bold">{s.display_name}</p><p className="text-[10px] text-gray-500 font-mono">{s.discord_id || "—"}</p></div>
                        </div>
                      </TableCell>
                      <TableCell>{s.rank ? <Badge className="border-none text-[10px]" style={{ background: `${s.rank.color || '#666'}22`, color: s.rank.color || '#aaa' }}>{s.rank.name}</Badge> : <span className="text-gray-600 text-xs">—</span>}</TableCell>
                      <TableCell className="text-gray-400 text-xs">{s.department?.name || "—"}</TableCell>
                      <TableCell><Badge className={`border-none text-[9px] uppercase ${statusColor(s.status)}`}>{s.status.replace("_", " ")}</Badge></TableCell>
                      <TableCell className="text-gray-500 text-xs">{s.join_date ? new Date(s.join_date).toLocaleDateString() : "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => router.push(`/admin/staff/${s.id}`)} className="text-xs h-7 text-amber-500">View</Button>
                        <Button size="sm" variant="ghost" onClick={() => setStaffForm({ ...s, rank_id: s.rank?.id || "", department_id: s.department?.id || "" })} className="text-xs h-7">Edit</Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteStaff(s.id)} className="text-red-500 h-7 w-7"><Trash2 size={14} /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* ── DUTY ── */}
        {tab === "duty" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-lg border border-[#333] overflow-hidden text-xs font-black uppercase tracking-widest">
                {(["today", "week", "month"] as const).map(r => (
                  <button key={r} onClick={() => setDutyRange(r)} className={`px-4 py-2 transition-colors ${dutyRange === r ? "bg-amber-500 text-black" : "text-gray-400 hover:text-white"}`}>{r}</button>
                ))}
              </div>
              <Button onClick={syncDutyNow} disabled={syncing} className="ml-auto bg-amber-500 text-black font-black uppercase text-xs tracking-widest">
                <RefreshCcw className={`w-3.5 h-3.5 mr-1.5 ${syncing ? "animate-spin" : ""}`} /> {syncing ? "Syncing" : "Sync from Discord"}
              </Button>
            </div>

            {/* On duty now */}
            <Card className="bg-[#111] border-[#222] p-4">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> On Duty Now ({duty?.onDuty.length ?? 0})</p>
              {(!duty || duty.onDuty.length === 0) ? (
                <p className="text-gray-600 text-sm italic">No one is currently on duty.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {duty.onDuty.map(s => (
                    <div key={s.id} className="flex items-center gap-2 bg-green-500/5 border border-green-500/20 rounded-xl px-3 py-2">
                      {s.staff?.avatar_url ? <img src={s.staff.avatar_url} className="w-7 h-7 rounded-full" alt="" /> : <div className="w-7 h-7 rounded-full bg-[#222] flex items-center justify-center text-xs font-black text-gray-500">{(s.staff?.display_name || s.discord_username || "?")[0]?.toUpperCase()}</div>}
                      <div>
                        <p className="text-xs font-bold">{s.staff?.display_name || s.discord_username || s.discord_id}</p>
                        <p className="text-[10px] text-green-400">since {new Date(s.started_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Totals per staff */}
            <Card className="bg-[#111] border-[#222] overflow-hidden">
              <div className="p-3 border-b border-[#222]"><p className="text-xs font-black uppercase tracking-widest text-gray-500">Duty Totals ({dutyRange})</p></div>
              <Table>
                <TableHeader className="bg-[#1a1a1a]"><TableRow className="border-[#222]"><TableHead>Staff</TableHead><TableHead>Sessions</TableHead><TableHead className="text-right">Total Time</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(!duty || duty.totals.length === 0) && <TableRow><TableCell colSpan={3} className="text-center text-gray-600 py-8 italic">No duty recorded in this range.</TableCell></TableRow>}
                  {duty?.totals.map(t => (
                    <TableRow key={t.discord_id} className="border-[#222] hover:bg-white/5">
                      <TableCell><div className="flex items-center gap-2">{t.avatar ? <img src={t.avatar} className="w-6 h-6 rounded-full" alt="" /> : null}<span className="font-medium text-sm">{t.name}</span></div></TableCell>
                      <TableCell className="text-gray-400 text-sm">{t.sessions}</TableCell>
                      <TableCell className="text-right font-mono text-amber-400">{fmtDuration(t.seconds)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Recent sessions */}
            <Card className="bg-[#111] border-[#222] overflow-hidden">
              <div className="p-3 border-b border-[#222]"><p className="text-xs font-black uppercase tracking-widest text-gray-500">Sessions</p></div>
              <Table>
                <TableHeader className="bg-[#1a1a1a]"><TableRow className="border-[#222]"><TableHead>Staff</TableHead><TableHead>Start</TableHead><TableHead>End</TableHead><TableHead className="text-right">Duration</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {(!duty || duty.sessions.length === 0) && <TableRow><TableCell colSpan={5} className="text-center text-gray-600 py-8 italic">No sessions.</TableCell></TableRow>}
                  {duty?.sessions.map(s => (
                    <TableRow key={s.id} className="border-[#222] hover:bg-white/5">
                      <TableCell className="text-sm">{s.staff?.display_name || s.discord_username || s.discord_id}</TableCell>
                      <TableCell className="text-gray-400 text-xs">{new Date(s.started_at).toLocaleString()}</TableCell>
                      <TableCell className="text-gray-400 text-xs">{s.ended_at ? new Date(s.ended_at).toLocaleString() : <span className="text-green-400">on duty</span>}{s.auto_closed && <span className="text-amber-500 ml-1" title="Auto-closed / inferred — verify">⚠</span>}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{s.duration_seconds != null && s.ended_at ? fmtDuration(s.duration_seconds) : "—"}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {!s.ended_at && <Button size="sm" variant="ghost" onClick={() => closeSessionNow(s.id)} className="text-xs h-7 text-green-400">Close</Button>}
                        <Button size="sm" variant="ghost" onClick={() => setEditSession({ id: s.id, end: toLocalInput(s.ended_at || new Date().toISOString()) })} className="text-xs h-7">Edit</Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteSession(s.id)} className="text-red-500 h-7 w-7"><Trash2 size={13} /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* ── SCHEDULE ── */}
        {tab === "schedule" && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">Weekly duty roster · 8:00 PM → 2:00 AM · target <span className="text-amber-400 font-bold">5 slots/week</span> per admin. Dots show this week's attendance vs actual duty (<span className="text-green-400">●</span> covered <span className="text-red-400">●</span> missed <span className="text-gray-500">●</span> upcoming).</p>

            {/* Coverage heatmap */}
            <div className="bg-[#111] border border-[#222] rounded-xl p-4">
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-3">Coverage — <span className="text-red-400">red = gap</span>, <span className="text-amber-400">amber = 1</span>, <span className="text-green-400">green = 2+</span></p>
              <div className="overflow-x-auto">
                <div className="min-w-[720px] grid" style={{ gridTemplateColumns: "60px repeat(6, 1fr)" }}>
                  <div />
                  {SCHED_SLOTS.map(s => <div key={s.h} className="text-center text-[9px] text-gray-500 pb-1 whitespace-nowrap">{s.l}</div>)}
                  {SCHED_DAYS.map((day, di) => (
                    <div key={day} className="contents">
                      <div className="text-[10px] text-gray-500 font-black pr-2 flex items-center">{day}</div>
                      {SCHED_SLOTS.map(s => {
                        const c = schedule.filter(a => a.day_of_week === di && a.slot_hour === s.h).length;
                        const col = c === 0 ? "bg-red-500/25 text-red-300" : c === 1 ? "bg-amber-500/25 text-amber-300" : "bg-green-500/25 text-green-300";
                        return <div key={s.h} className={`m-0.5 rounded text-center text-[11px] font-bold py-1.5 ${col}`}>{c}</div>;
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="bg-[#111] border border-[#222] rounded-xl overflow-auto max-h-[70vh]">
              <div className="min-w-[980px]">
                <div className="grid" style={{ gridTemplateColumns: "72px repeat(6, 1fr)" }}>
                  <div className="p-3 border-b border-r border-[#222] sticky top-0 z-20 bg-[#111]" />
                  {SCHED_SLOTS.map(slot => <div key={slot.h} className="p-3 text-center text-xs font-black uppercase tracking-widest text-amber-400/80 border-b border-[#222] whitespace-nowrap sticky top-0 z-10 bg-[#111]">{slot.l}</div>)}
                  {SCHED_DAYS.map((day, dayIdx) => (
                    <div key={day} className="contents">
                      <div className="p-3 text-xs font-black uppercase tracking-widest text-gray-300 border-r border-b border-[#222] flex items-center">{day}</div>
                      {SCHED_SLOTS.map(slot => {
                        const cell = schedule.filter(a => a.day_of_week === dayIdx && a.slot_hour === slot.h);
                        return (
                          <div key={slot.h} className="p-2 border-b border-r border-[#222] min-h-[80px] space-y-1.5">
                            {cell.map(a => (
                              <div key={a.id} className="group flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1.5 text-xs">
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${a.compliance === "covered" ? "bg-green-500" : a.compliance === "missed" ? "bg-red-500" : "bg-gray-500"}`} />
                                {a.staff?.avatar_url
                                  ? <img src={a.staff.avatar_url} className="w-6 h-6 rounded-full flex-shrink-0" alt="" />
                                  : <div className="w-6 h-6 rounded-full bg-[#333] flex-shrink-0" />}
                                <span className="truncate flex-1 font-medium">{a.staff?.display_name || "?"}</span>
                                <button onClick={() => removeAssignment(a.id)} className="opacity-0 group-hover:opacity-100 text-red-400"><X size={14} /></button>
                              </div>
                            ))}
                            <button onClick={() => { setAddCell({ day: dayIdx, slot: slot.h }); setAddStaffId(""); }} className="w-full text-[11px] text-gray-600 hover:text-amber-400 py-1">+ add</button>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Per-admin stats */}
            <Card className="bg-[#111] border-[#222] overflow-hidden">
              <div className="p-3 border-b border-[#222]"><p className="text-xs font-black uppercase tracking-widest text-gray-500">Coverage & Compliance (this week)</p></div>
              <Table>
                <TableHeader className="bg-[#1a1a1a]"><TableRow className="border-[#222]"><TableHead>Admin</TableHead><TableHead>Scheduled / Target</TableHead><TableHead className="text-right">Compliance</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(() => {
                    const byStaff: Record<string, { name: string; assigned: number; past: number; covered: number }> = {};
                    for (const a of schedule) {
                      const k = a.staff_id;
                      if (!byStaff[k]) byStaff[k] = { name: a.staff?.display_name || "?", assigned: 0, past: 0, covered: 0 };
                      byStaff[k].assigned++;
                      if (a.compliance !== "upcoming") byStaff[k].past++;
                      if (a.compliance === "covered") byStaff[k].covered++;
                    }
                    const rows = Object.values(byStaff);
                    if (rows.length === 0) return <TableRow><TableCell colSpan={3} className="text-center text-gray-600 py-8 italic">No one scheduled yet.</TableCell></TableRow>;
                    return rows.sort((a, b) => b.assigned - a.assigned).map((r, i) => (
                      <TableRow key={i} className="border-[#222] hover:bg-white/5">
                        <TableCell className="text-sm">{r.name}</TableCell>
                        <TableCell className={`text-sm font-mono ${r.assigned >= 5 ? "text-green-400" : "text-amber-400"}`}>{r.assigned} / 5</TableCell>
                        <TableCell className="text-right font-mono text-sm">{r.past ? `${Math.round((r.covered / r.past) * 100)}% (${r.covered}/${r.past})` : "—"}</TableCell>
                      </TableRow>
                    ));
                  })()}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* ── AUDIT LOG ── */}
        {tab === "audit" && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {AUDIT_MODULES.map(m => (
                <button key={m} onClick={() => setAuditModule(m)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-colors ${auditModule === m ? "border-amber-500 text-amber-500" : "border-[#333] text-gray-500 hover:text-gray-300"}`}>{m}</button>
              ))}
            </div>
            <Card className="bg-[#111] border-[#222] overflow-hidden">
              <Table>
                <TableHeader className="bg-[#1a1a1a]"><TableRow className="border-[#222]"><TableHead>When</TableHead><TableHead>Actor</TableHead><TableHead>Module</TableHead><TableHead>Action</TableHead><TableHead>Summary</TableHead></TableRow></TableHeader>
                <TableBody>
                  {audit.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-gray-600 py-8 italic">No audit entries.</TableCell></TableRow>}
                  {audit.map(a => (
                    <TableRow key={a.id} className="border-[#222] hover:bg-white/5">
                      <TableCell className="text-xs text-gray-500 whitespace-nowrap">{new Date(a.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-xs"><span className="font-medium">{a.actor_name || "—"}</span> {a.actor_type && <span className="text-[9px] text-gray-500 uppercase">({a.actor_type})</span>}</TableCell>
                      <TableCell><Badge className="border-none text-[9px] uppercase bg-white/5 text-gray-300">{a.module}</Badge></TableCell>
                      <TableCell className="text-xs text-gray-400">{a.action}</TableCell>
                      <TableCell className="text-xs text-gray-300 max-w-md"><div className="truncate" title={a.summary}>{a.summary || "—"}</div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* ── RANKS ── */}
        {tab === "ranks" && (
          <div className="space-y-4">
            <div className="flex justify-end"><Button onClick={() => setRankForm({ name: "", level: 0, color: "#8b5cf6", permissions: {} })} className="bg-amber-500 text-black font-black uppercase text-xs tracking-widest"><Plus size={14} className="mr-1" /> Add Rank</Button></div>
            <Card className="bg-[#111] border-[#222] overflow-hidden">
              <Table>
                <TableHeader className="bg-[#1a1a1a]"><TableRow className="border-[#222]"><TableHead>Rank</TableHead><TableHead>Level</TableHead><TableHead>Permissions</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {ranks.map(r => (
                    <TableRow key={r.id} className="border-[#222] hover:bg-white/5">
                      <TableCell><Badge className="border-none" style={{ background: `${r.color || '#666'}22`, color: r.color || '#aaa' }}>{r.name}</Badge></TableCell>
                      <TableCell className="text-gray-400 font-mono text-sm">{r.level}</TableCell>
                      <TableCell className="text-[10px] text-gray-500 font-mono max-w-md truncate">{r.permissions["*"] ? "ALL (owner)" : Object.keys(r.permissions).join(", ") || "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => setRankForm({ ...r, permissions: r.permissions })} className="text-xs h-7">Edit</Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteRank(r.id)} className="text-red-500 h-7 w-7"><Trash2 size={14} /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* ── DEPARTMENTS ── */}
        {tab === "departments" && (
          <div className="space-y-4">
            <div className="flex justify-end"><Button onClick={() => setDeptForm({ name: "", description: "", color: "#3b82f6" })} className="bg-amber-500 text-black font-black uppercase text-xs tracking-widest"><Plus size={14} className="mr-1" /> Add Department</Button></div>
            <Card className="bg-[#111] border-[#222] overflow-hidden">
              <Table>
                <TableHeader className="bg-[#1a1a1a]"><TableRow className="border-[#222]"><TableHead>Department</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {departments.map(d => (
                    <TableRow key={d.id} className="border-[#222] hover:bg-white/5">
                      <TableCell><Badge className="border-none" style={{ background: `${d.color || '#666'}22`, color: d.color || '#aaa' }}>{d.name}</Badge></TableCell>
                      <TableCell className="text-gray-400 text-xs">{d.description || "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => setDeptForm({ ...d })} className="text-xs h-7">Edit</Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteDept(d.id)} className="text-red-500 h-7 w-7"><Trash2 size={14} /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* ── NOTIFICATIONS / ALERTS ── */}
        {tab === "notifications" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2"><Bell size={13} /> Live Alerts</p>
              {notif && <span className="text-[11px] text-gray-600">Updated {new Date(notif.generatedAt).toLocaleTimeString()}</span>}
              <Button variant="outline" size="sm" onClick={loadNotifications} className="ml-auto bg-transparent border-[#333] hover:bg-white/5 text-xs"><RefreshCcw className="w-3 h-3 mr-1.5" /> Refresh</Button>
            </div>
            {!notif ? (
              <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : notif.alerts.length === 0 ? (
              <Card className="bg-[#111] border-[#222] p-10 text-center">
                <Bell className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 font-black uppercase tracking-widest text-sm">All clear</p>
                <p className="text-gray-600 text-xs mt-1">No operational issues need attention right now.</p>
              </Card>
            ) : (
              <div className="space-y-2.5">
                {notif.alerts.map((a: any) => {
                  const tone = a.severity === "high" ? "border-red-500/40 bg-red-500/5" : a.severity === "medium" ? "border-amber-500/40 bg-amber-500/5" : "border-[#222] bg-[#111]";
                  const iconColor = a.severity === "high" ? "text-red-400" : a.severity === "medium" ? "text-amber-400" : "text-gray-500";
                  return (
                    <Card key={a.id} className={`border p-4 flex items-start gap-3 ${tone}`}>
                      <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm">{a.title}</span>
                          <Badge className={`border-none text-[9px] uppercase tracking-widest ${a.severity === "high" ? "bg-red-500/20 text-red-400" : a.severity === "medium" ? "bg-amber-500/20 text-amber-400" : "bg-gray-500/20 text-gray-400"}`}>{a.severity}</Badge>
                          <span className="text-[9px] text-gray-600 uppercase tracking-widest">{a.module}</span>
                        </div>
                        <p className="text-gray-400 text-xs mt-1">{a.detail}</p>
                      </div>
                      {a.href && a.href !== "/admin/staff" && (
                        <Button size="sm" variant="ghost" onClick={() => router.push(a.href)} className="text-xs h-7 shrink-0">Open</Button>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── AI ASSISTANT ── */}
        {tab === "assistant" && (
          <div className="space-y-4">
            <Card className="bg-[#111] border-[#222] p-4">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1 flex items-center gap-2"><Sparkles size={13} /> AI Assistant</p>
              <p className="text-gray-500 text-xs mb-4">Generates analysis from your real staff data. Recommendations are advisory only — decisions remain yours.</p>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {AI_REPORTS.map(r => (
                  <button key={r.key} onClick={() => setAiType(r.key)} className={`text-left p-3 rounded-lg border transition-colors ${aiType === r.key ? "border-amber-500 bg-amber-500/5" : "border-[#222] hover:border-[#333]"}`}>
                    <p className="font-black text-sm">{r.label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{r.desc}</p>
                  </button>
                ))}
              </div>
              <Button onClick={() => generateReport(aiType)} disabled={aiLoading} className="mt-4 bg-amber-500 text-black font-black uppercase tracking-widest text-xs disabled:opacity-50">
                {aiLoading ? <><div className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin mr-2" /> Generating…</> : <><Sparkles size={14} className="mr-1.5" /> Generate</>}
              </Button>
            </Card>
            {aiLoading && (
              <Card className="bg-[#111] border-[#222] p-8 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 text-xs">Analysing staff data — this can take up to a minute.</p>
              </Card>
            )}
            {aiReport && !aiLoading && (
              <Card className="bg-[#111] border-[#222] p-5">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="font-black italic uppercase tracking-tighter text-lg">{aiReport.label}</span>
                  <span className="text-[11px] text-gray-600 ml-auto">{new Date(aiReport.generatedAt).toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{aiReport.text}</div>
                <p className="text-[10px] text-gray-600 mt-4 pt-3 border-t border-[#222]">Generated by AI from live data. Verify before acting.</p>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* ── Staff dialog ── */}
      <Dialog open={!!staffForm} onOpenChange={o => !o && setStaffForm(null)}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-white max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-black italic uppercase tracking-tighter">{staffForm?.id ? "Edit" : "Add"} Staff</DialogTitle></DialogHeader>
          {staffForm && (
            <form onSubmit={saveStaff} className="space-y-3 pt-2">
              <Field label="Display Name"><Input required value={staffForm.display_name} onChange={e => setStaffForm({ ...staffForm, display_name: e.target.value })} className="bg-[#111] border-[#333]" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Discord ID"><Input value={staffForm.discord_id} onChange={e => setStaffForm({ ...staffForm, discord_id: e.target.value })} className="bg-[#111] border-[#333] font-mono" /></Field>
                <Field label="Email"><Input value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} className="bg-[#111] border-[#333]" /></Field>
              </div>
              <p className="text-[10px] text-gray-500 -mt-1">Avatar is fetched automatically from the Discord ID.</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Rank">
                  <select value={staffForm.rank_id} onChange={e => setStaffForm({ ...staffForm, rank_id: e.target.value })} className="w-full bg-[#111] border border-[#333] rounded-md h-10 px-3 text-sm">
                    <option value="">—</option>
                    {ranks.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </Field>
                <Field label="Department">
                  <select value={staffForm.department_id} onChange={e => setStaffForm({ ...staffForm, department_id: e.target.value })} className="w-full bg-[#111] border border-[#333] rounded-md h-10 px-3 text-sm">
                    <option value="">—</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Join Date"><Input type="date" value={staffForm.join_date?.slice(0, 10) || ""} onChange={e => setStaffForm({ ...staffForm, join_date: e.target.value })} className="bg-[#111] border-[#333]" /></Field>
                <Field label="Status">
                  <select value={staffForm.status} onChange={e => setStaffForm({ ...staffForm, status: e.target.value })} className="w-full bg-[#111] border border-[#333] rounded-md h-10 px-3 text-sm capitalize">
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Notes"><textarea value={staffForm.notes} onChange={e => setStaffForm({ ...staffForm, notes: e.target.value })} rows={2} className="w-full bg-[#111] border border-[#333] rounded-md p-3 text-sm" /></Field>
              <DialogFooter><Button type="submit" className="bg-amber-500 text-black font-black uppercase tracking-widest">{staffForm.id ? "Save" : "Add"}</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Rank dialog ── */}
      <Dialog open={!!rankForm} onOpenChange={o => !o && setRankForm(null)}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-white">
          <DialogHeader><DialogTitle className="font-black italic uppercase tracking-tighter">{rankForm?.id ? "Edit" : "Add"} Rank</DialogTitle></DialogHeader>
          {rankForm && (
            <form onSubmit={saveRank} className="space-y-3 pt-2">
              <Field label="Name"><Input required value={rankForm.name} onChange={e => setRankForm({ ...rankForm, name: e.target.value })} className="bg-[#111] border-[#333]" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Level (0–100)"><Input type="number" min={0} max={100} value={rankForm.level} onChange={e => setRankForm({ ...rankForm, level: e.target.value })} className="bg-[#111] border-[#333]" /></Field>
                <Field label="Color"><Input type="color" value={rankForm.color || "#8b5cf6"} onChange={e => setRankForm({ ...rankForm, color: e.target.value })} className="bg-[#111] border-[#333] h-10 p-1" /></Field>
              </div>
              <Field label="Permissions (JSON)">
                <textarea
                  value={typeof rankForm.permissions === "string" ? rankForm.permissions : JSON.stringify(rankForm.permissions, null, 2)}
                  onChange={e => setRankForm({ ...rankForm, permissions: e.target.value })}
                  onBlur={e => { try { setRankForm({ ...rankForm, permissions: JSON.parse(e.target.value) }); } catch {} }}
                  rows={6}
                  className="w-full bg-[#111] border border-[#333] rounded-md p-3 text-xs font-mono"
                  placeholder='{"complaints":["view","create"],"staff":["view"]}'
                />
              </Field>
              <p className="text-[10px] text-gray-500">Modules: staff, duty, performance, complaints, investigations, discipline, promotions, attendance, coverage, leaderboards, notifications, audit. Actions: view, create, edit, delete, approve, export. Use <span className="font-mono">{`{"*":["*"]}`}</span> for full access.</p>
              <DialogFooter><Button type="submit" className="bg-amber-500 text-black font-black uppercase tracking-widest">Save</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Assign to schedule slot dialog ── */}
      <Dialog open={!!addCell} onOpenChange={o => !o && setAddCell(null)}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-white">
          <DialogHeader><DialogTitle className="font-black italic uppercase tracking-tighter">Assign to {addCell ? `${SCHED_DAYS[addCell.day]} ${SCHED_SLOTS.find(s => s.h === addCell.slot)?.l}` : ""}</DialogTitle></DialogHeader>
          {addCell && (
            <form onSubmit={addAssignment} className="space-y-3 pt-2">
              <Field label="Staff Member">
                <select required value={addStaffId} onChange={e => setAddStaffId(e.target.value)} className="w-full bg-[#111] border border-[#333] rounded-md h-10 px-3 text-sm">
                  <option value="">Select…</option>
                  {[...staff].sort((a, b) => a.display_name.localeCompare(b.display_name)).map(s => <option key={s.id} value={s.id}>{s.display_name}</option>)}
                </select>
              </Field>
              <DialogFooter><Button type="submit" className="bg-amber-500 text-black font-black uppercase tracking-widest">Assign</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit duty session dialog ── */}
      <Dialog open={!!editSession} onOpenChange={o => !o && setEditSession(null)}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-white">
          <DialogHeader><DialogTitle className="font-black italic uppercase tracking-tighter">Correct Session End Time</DialogTitle></DialogHeader>
          {editSession && (
            <form onSubmit={saveSessionEnd} className="space-y-3 pt-2">
              <Field label="End Time"><Input type="datetime-local" value={editSession.end} onChange={e => setEditSession({ ...editSession, end: e.target.value })} className="bg-[#111] border-[#333]" required /></Field>
              <p className="text-[10px] text-gray-500">Set the real time the admin went off duty. Duration is recalculated automatically.</p>
              <DialogFooter><Button type="submit" className="bg-amber-500 text-black font-black uppercase tracking-widest">Save</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Department dialog ── */}
      <Dialog open={!!deptForm} onOpenChange={o => !o && setDeptForm(null)}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-white">
          <DialogHeader><DialogTitle className="font-black italic uppercase tracking-tighter">{deptForm?.id ? "Edit" : "Add"} Department</DialogTitle></DialogHeader>
          {deptForm && (
            <form onSubmit={saveDept} className="space-y-3 pt-2">
              <Field label="Name"><Input required value={deptForm.name} onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} className="bg-[#111] border-[#333]" /></Field>
              <Field label="Description"><Input value={deptForm.description || ""} onChange={e => setDeptForm({ ...deptForm, description: e.target.value })} className="bg-[#111] border-[#333]" /></Field>
              <Field label="Color"><Input type="color" value={deptForm.color || "#3b82f6"} onChange={e => setDeptForm({ ...deptForm, color: e.target.value })} className="bg-[#111] border-[#333] h-10 p-1" /></Field>
              <DialogFooter><Button type="submit" className="bg-amber-500 text-black font-black uppercase tracking-widest">Save</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-gray-500 text-[10px] uppercase font-black tracking-widest">{label}</Label>
      {children}
    </div>
  );
}

function Kpi({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: "green" | "red" | "amber" }) {
  const color = accent === "green" ? "text-green-400" : accent === "red" ? "text-red-400" : accent === "amber" ? "text-amber-400" : "text-white";
  return (
    <Card className="bg-[#111] border-[#222] p-4">
      <div className="flex items-center gap-2 text-gray-500 mb-1">{icon}<span className="text-[9px] font-black uppercase tracking-widest">{label}</span></div>
      <p className={`text-2xl font-black italic ${color}`}>{value}</p>
    </Card>
  );
}
