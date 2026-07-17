"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Clock, CalendarDays, Timer, Activity, Plus, Gavel, TrendingUp, Trash2 } from "lucide-react";

const DISC_TYPES: Record<string, { label: string; color: string }> = {
  verbal_warning: { label: "Verbal Warning", color: "#eab308" },
  written_warning: { label: "Written Warning", color: "#f97316" },
  final_warning: { label: "Final Warning", color: "#ef4444" },
  probation: { label: "Probation", color: "#a855f7" },
  suspension: { label: "Suspension", color: "#f43f5e" },
  demotion: { label: "Demotion", color: "#ec4899" },
  termination: { label: "Termination", color: "#b91c1c" },
};

function fmtDuration(seconds: number): string {
  if (!seconds) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function StaffProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [discipline, setDiscipline] = useState<any[]>([]);
  const [discForm, setDiscForm] = useState<any>(null);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [promoForm, setPromoForm] = useState<any>(null);
  const [ranks, setRanks] = useState<any[]>([]);
  const [leave, setLeave] = useState<any[]>([]);
  const [leaveForm, setLeaveForm] = useState<any>(null);

  const loadProfile = useCallback(() => {
    fetch(`/api/admin/staff/${id}`).then(r => r.ok ? r.json() : null).then(d => { if (d) setData(d); }).catch(() => {});
  }, [id]);
  const loadDiscipline = useCallback(() => {
    fetch(`/api/admin/discipline?staff_id=${id}`).then(r => r.ok ? r.json() : []).then(setDiscipline).catch(() => {});
  }, [id]);
  const loadPromotions = useCallback(() => {
    fetch(`/api/admin/promotions?staff_id=${id}`).then(r => r.ok ? r.json() : []).then(setPromotions).catch(() => {});
  }, [id]);
  const loadLeave = useCallback(() => {
    fetch(`/api/admin/leave?staff_id=${id}`).then(r => r.ok ? r.json() : []).then(setLeave).catch(() => {});
  }, [id]);

  useEffect(() => {
    fetch("/api/admin/me").then(r => { if (!r.ok) router.push("/admin/login"); });
    fetch(`/api/admin/staff/${id}`)
      .then(r => {
        if (r.status === 401) { router.push("/admin/codes"); throw new Error("unauthorized"); }
        if (r.status === 404) throw new Error("not found");
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData)
      .catch((e) => { if (e.message !== "unauthorized") toast.error("Could not load profile."); })
      .finally(() => setLoading(false));
    loadDiscipline();
    loadPromotions();
    loadLeave();
    fetch("/api/admin/ranks").then(r => r.ok ? r.json() : []).then(setRanks).catch(() => {});
  }, [id, router, loadDiscipline, loadPromotions, loadLeave]);

  const saveLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/leave", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...leaveForm, staff_id: id }) });
    const d = await res.json();
    if (res.ok) { toast.success("Leave logged."); setLeaveForm(null); loadLeave(); } else toast.error(d.error || "Failed.");
  };
  const deleteLeave = async (lid: string) => {
    if (!confirm("Remove this record?")) return;
    const res = await fetch(`/api/admin/leave?id=${lid}`, { method: "DELETE" });
    if (res.ok) loadLeave(); else toast.error("Failed.");
  };

  const savePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/promotions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...promoForm, staff_id: id }) });
    const d = await res.json();
    if (res.ok) { toast.success("Promotion proposed."); setPromoForm(null); loadPromotions(); }
    else toast.error(d.error || "Failed to propose.");
  };
  const decidePromotion = async (pid: string, action: "approve" | "reject") => {
    const res = await fetch("/api/admin/promotions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: pid, action }) });
    const d = await res.json();
    if (res.ok) { toast.success(`Promotion ${action}d.`); loadPromotions(); loadProfile(); }
    else toast.error(d.error || "Failed.");
  };

  const saveDiscipline = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/discipline", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...discForm, staff_id: id }) });
    const d = await res.json();
    if (res.ok) { toast.success("Record issued."); setDiscForm(null); loadDiscipline(); }
    else toast.error(d.error || "Failed to issue record.");
  };
  const revokeDiscipline = async (recId: string) => {
    if (!confirm("Revoke this disciplinary record?")) return;
    const res = await fetch("/api/admin/discipline", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: recId, action: "revoke" }) });
    if (res.ok) { toast.success("Revoked."); loadDiscipline(); } else toast.error("Failed to revoke.");
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Profile not found.</div>;

  const s = data.staff;
  const d = data.duty;
  const statusColor = s.status === "active" ? "bg-green-500/15 text-green-400" : s.status === "on_leave" ? "bg-amber-500/15 text-amber-400" : s.status === "suspended" ? "bg-red-500/15 text-red-400" : "bg-gray-500/15 text-gray-400";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => router.push("/admin/staff")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#333] text-gray-400 hover:text-white hover:bg-white/5 text-xs font-black uppercase tracking-widest">
          <ArrowLeft className="w-3.5 h-3.5" /> Directory
        </button>

        {/* Identity header */}
        <Card className="bg-[#111] border-[#222] p-6">
          <div className="flex items-center gap-4 flex-wrap">
            {s.avatar_url ? <img src={s.avatar_url} className="w-20 h-20 rounded-2xl" alt="" /> : <div className="w-20 h-20 rounded-2xl bg-[#222] flex items-center justify-center text-3xl font-black text-gray-500">{s.display_name[0]?.toUpperCase()}</div>}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black italic tracking-tighter uppercase">{s.display_name}</h1>
                {d.onDutyNow && <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-green-400"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> On Duty</span>}
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {s.rank && <Badge className="border-none" style={{ background: `${s.rank.color || '#666'}22`, color: s.rank.color || '#aaa' }}>{s.rank.name}</Badge>}
                {s.department && <Badge className="border-none" style={{ background: `${s.department.color || '#666'}22`, color: s.department.color || '#aaa' }}>{s.department.name}</Badge>}
                <Badge className={`border-none uppercase text-[9px] ${statusColor}`}>{s.status.replace("_", " ")}</Badge>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 text-sm">
            <Info label="Discord ID" value={s.discord_id || "—"} mono />
            <Info label="Email" value={s.email || "—"} />
            <Info label="Joined" value={s.join_date ? new Date(s.join_date).toLocaleDateString() : "—"} />
            <Info label="Steam ID" value={s.steam_id || "—"} mono />
          </div>
          {s.notes && <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5"><p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Notes</p><p className="text-sm text-gray-300 whitespace-pre-wrap">{s.notes}</p></div>}
        </Card>

        {/* Duty stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat icon={<Timer size={16} />} label="Total Duty" value={fmtDuration(d.totalSeconds)} />
          <Stat icon={<CalendarDays size={16} />} label="Last 7 Days" value={fmtDuration(d.last7dSeconds)} />
          <Stat icon={<Activity size={16} />} label="Sessions" value={String(d.sessionCount)} />
          <Stat icon={<Clock size={16} />} label="Last On Duty" value={d.lastOnDuty ? new Date(d.lastOnDuty).toLocaleDateString() : "—"} />
        </div>

        {/* Performance */}
        {d && (() => {
          const p = data.performance;
          if (!p) return null;
          const gradeColor = p.grade === "A" ? "#22c55e" : p.grade === "B" ? "#84cc16" : p.grade === "C" ? "#eab308" : p.grade === "D" ? "#f97316" : "#ef4444";
          const riskColor = p.risk === "low" ? "bg-green-500/15 text-green-400" : p.risk === "medium" ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400";
          const Bar = ({ label, val }: { label: string; val: number | null }) => (
            <div>
              <div className="flex justify-between text-[10px] mb-1"><span className="text-gray-500 uppercase tracking-widest font-black">{label}</span><span className="text-gray-300 font-mono">{val === null ? "N/A" : val}</span></div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">{val !== null && <div className="h-full rounded-full" style={{ width: `${val}%`, background: val >= 70 ? "#22c55e" : val >= 45 ? "#eab308" : "#ef4444" }} />}</div>
            </div>
          );
          return (
            <Card className="bg-[#111] border-[#222] p-5">
              <div className="flex items-center gap-5 flex-wrap">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black italic" style={{ background: `${gradeColor}18`, color: gradeColor }}>{p.grade}</div>
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-2">Grade</p>
                </div>
                <div className="flex-1 min-w-[220px] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Performance · Overall {p.overall}</p>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${riskColor}`}>{p.risk} risk</span>
                  </div>
                  <Bar label="Activity" val={p.activity} />
                  <Bar label="Reliability" val={p.reliability} />
                  <Bar label="Conduct" val={p.conduct} />
                </div>
              </div>
              <p className="text-[10px] text-gray-600 italic mt-3">Computed from duty hours, schedule compliance, discipline & complaints. Other dimensions (professionalism, leadership…) require FiveM/manual data.</p>
            </Card>
          );
        })()}

        {/* Recent sessions */}
        <Card className="bg-[#111] border-[#222] overflow-hidden">
          <div className="p-3 border-b border-[#222]"><p className="text-xs font-black uppercase tracking-widest text-gray-500">Recent Duty Sessions</p></div>
          <Table>
            <TableHeader className="bg-[#1a1a1a]"><TableRow className="border-[#222]"><TableHead>Start</TableHead><TableHead>End</TableHead><TableHead className="text-right">Duration</TableHead></TableRow></TableHeader>
            <TableBody>
              {d.recent.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-gray-600 py-8 italic">No duty sessions recorded.</TableCell></TableRow>}
              {d.recent.map((x: any, i: number) => (
                <TableRow key={i} className="border-[#222] hover:bg-white/5">
                  <TableCell className="text-gray-400 text-xs">{new Date(x.started_at).toLocaleString()}</TableCell>
                  <TableCell className="text-gray-400 text-xs">{x.ended_at ? new Date(x.ended_at).toLocaleString() : <span className="text-green-400">on duty</span>}{x.auto_closed && <span className="text-amber-500 ml-1" title="Auto-closed">⚠</span>}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{x.duration_seconds ? fmtDuration(x.duration_seconds) : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Discipline history */}
        <Card className="bg-[#111] border-[#222] overflow-hidden">
          <div className="p-3 border-b border-[#222] flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2"><Gavel size={14} /> Discipline History</p>
            <Button size="sm" onClick={() => setDiscForm({ type: "verbal_warning", reason: "", evidence: "", expires_at: "" })} className="bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest h-7"><Plus size={13} className="mr-1" /> Issue</Button>
          </div>
          <Table>
            <TableHeader className="bg-[#1a1a1a]"><TableRow className="border-[#222]"><TableHead>Type</TableHead><TableHead>Reason</TableHead><TableHead>Issued By</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {discipline.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-gray-600 py-8 italic">Clean record — no disciplinary actions.</TableCell></TableRow>}
              {discipline.map(r => {
                const t = DISC_TYPES[r.type] || { label: r.type, color: "#888" };
                const es = r.effective_status;
                return (
                  <TableRow key={r.id} className="border-[#222] hover:bg-white/5">
                    <TableCell><Badge className="border-none text-[10px]" style={{ background: `${t.color}22`, color: t.color }}>{t.label}</Badge></TableCell>
                    <TableCell className="text-sm text-gray-300 max-w-xs"><div className="truncate" title={r.reason}>{r.reason}</div>{r.evidence && <a href={r.evidence} target="_blank" className="text-[10px] text-blue-400 hover:underline">evidence ↗</a>}</TableCell>
                    <TableCell className="text-xs text-gray-400">{r.issued_by || "—"}</TableCell>
                    <TableCell className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}{r.expires_at && <span className="block text-[9px]">exp {new Date(r.expires_at).toLocaleDateString()}</span>}</TableCell>
                    <TableCell><Badge className={`border-none text-[9px] uppercase ${es === "active" ? "bg-red-500/15 text-red-400" : es === "expired" ? "bg-gray-500/15 text-gray-400" : "bg-green-500/15 text-green-400"}`}>{es}</Badge></TableCell>
                    <TableCell className="text-right">{es === "active" && <Button size="sm" variant="ghost" onClick={() => revokeDiscipline(r.id)} className="text-xs h-7 text-gray-400">Revoke</Button>}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        {/* Promotions */}
        <Card className="bg-[#111] border-[#222] overflow-hidden">
          <div className="p-3 border-b border-[#222] flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2"><TrendingUp size={14} /> Promotions</p>
            <Button size="sm" onClick={() => setPromoForm({ to_rank_id: "", reason: "" })} className="bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest h-7"><Plus size={13} className="mr-1" /> Propose</Button>
          </div>
          <Table>
            <TableHeader className="bg-[#1a1a1a]"><TableRow className="border-[#222]"><TableHead>Change</TableHead><TableHead>Reason</TableHead><TableHead>By</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {promotions.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-gray-600 py-8 italic">No promotion history.</TableCell></TableRow>}
              {promotions.map(p => (
                <TableRow key={p.id} className="border-[#222] hover:bg-white/5">
                  <TableCell className="text-sm">
                    <span className="text-gray-400">{p.from_rank?.name || "—"}</span>
                    <span className="text-gray-600 mx-1">→</span>
                    <span style={{ color: p.to_rank?.color || "#fff" }} className="font-bold">{p.to_rank?.name || "—"}</span>
                  </TableCell>
                  <TableCell className="text-xs text-gray-400 max-w-[180px]"><div className="truncate" title={p.reason}>{p.reason || "—"}</div></TableCell>
                  <TableCell className="text-xs text-gray-500">{p.requested_by || "—"}</TableCell>
                  <TableCell><Badge className={`border-none text-[9px] uppercase ${p.status === "pending" ? "bg-amber-500/15 text-amber-400" : p.status === "approved" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>{p.status}</Badge></TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {p.status === "pending" && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => decidePromotion(p.id, "approve")} className="text-xs h-7 text-green-400">Approve</Button>
                        <Button size="sm" variant="ghost" onClick={() => decidePromotion(p.id, "reject")} className="text-xs h-7 text-red-400">Reject</Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        {/* Leave & Absences */}
        <Card className="bg-[#111] border-[#222] overflow-hidden">
          <div className="p-3 border-b border-[#222] flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2"><CalendarDays size={14} /> Leave & Absences</p>
            <Button size="sm" onClick={() => setLeaveForm({ type: "leave", start_date: "", end_date: "", reason: "" })} className="bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest h-7"><Plus size={13} className="mr-1" /> Log</Button>
          </div>
          <Table>
            <TableHeader className="bg-[#1a1a1a]"><TableRow className="border-[#222]"><TableHead>Type</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Reason</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {leave.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-gray-600 py-8 italic">No leave records.</TableCell></TableRow>}
              {leave.map(l => (
                <TableRow key={l.id} className="border-[#222] hover:bg-white/5">
                  <TableCell><Badge className="border-none text-[10px] uppercase bg-blue-500/15 text-blue-300">{l.type}</Badge></TableCell>
                  <TableCell className="text-xs text-gray-400">{new Date(l.start_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-xs text-gray-400">{l.end_date ? new Date(l.end_date).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-xs text-gray-300 max-w-[200px]"><div className="truncate" title={l.reason}>{l.reason || "—"}</div></TableCell>
                  <TableCell className="text-right"><Button size="icon" variant="ghost" onClick={() => deleteLeave(l.id)} className="text-red-500 h-7 w-7"><Trash2 size={13} /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Log leave dialog */}
      <Dialog open={!!leaveForm} onOpenChange={o => !o && setLeaveForm(null)}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-white">
          <DialogHeader><DialogTitle className="font-black italic uppercase tracking-tighter">Log Leave / Absence</DialogTitle></DialogHeader>
          {leaveForm && (
            <form onSubmit={saveLeave} className="space-y-3 pt-2">
              <div className="space-y-1">
                <Label className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Type</Label>
                <select value={leaveForm.type} onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value })} className="w-full bg-[#111] border border-[#333] rounded-md h-10 px-3 text-sm capitalize">
                  <option value="leave">Leave</option><option value="vacation">Vacation</option><option value="absent">Absent</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black tracking-widest">From</Label><Input type="date" required value={leaveForm.start_date} onChange={e => setLeaveForm({ ...leaveForm, start_date: e.target.value })} className="bg-[#111] border-[#333]" /></div>
                <div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black tracking-widest">To (optional)</Label><Input type="date" value={leaveForm.end_date} onChange={e => setLeaveForm({ ...leaveForm, end_date: e.target.value })} className="bg-[#111] border-[#333]" /></div>
              </div>
              <div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Reason</Label><Input value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })} className="bg-[#111] border-[#333]" /></div>
              <DialogFooter><Button type="submit" className="bg-amber-500 text-black font-black uppercase tracking-widest">Log</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Propose promotion dialog */}
      <Dialog open={!!promoForm} onOpenChange={o => !o && setPromoForm(null)}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-white">
          <DialogHeader><DialogTitle className="font-black italic uppercase tracking-tighter">Propose Promotion</DialogTitle></DialogHeader>
          {promoForm && (
            <form onSubmit={savePromotion} className="space-y-3 pt-2">
              <div className="space-y-1">
                <Label className="text-gray-500 text-[10px] uppercase font-black tracking-widest">New Rank</Label>
                <select required value={promoForm.to_rank_id} onChange={e => setPromoForm({ ...promoForm, to_rank_id: e.target.value })} className="w-full bg-[#111] border border-[#333] rounded-md h-10 px-3 text-sm">
                  <option value="">Select rank…</option>
                  {[...ranks].sort((a, b) => (b.level || 0) - (a.level || 0)).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Justification</Label><textarea value={promoForm.reason} onChange={e => setPromoForm({ ...promoForm, reason: e.target.value })} rows={3} className="w-full bg-[#111] border border-[#333] rounded-md p-3 text-sm" placeholder="Why does this member deserve the promotion?" /></div>
              <DialogFooter><Button type="submit" className="bg-amber-500 text-black font-black uppercase tracking-widest">Submit Proposal</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Issue discipline dialog */}
      <Dialog open={!!discForm} onOpenChange={o => !o && setDiscForm(null)}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-white">
          <DialogHeader><DialogTitle className="font-black italic uppercase tracking-tighter">Issue Disciplinary Record</DialogTitle></DialogHeader>
          {discForm && (
            <form onSubmit={saveDiscipline} className="space-y-3 pt-2">
              <div className="space-y-1">
                <Label className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Type</Label>
                <select value={discForm.type} onChange={e => setDiscForm({ ...discForm, type: e.target.value })} className="w-full bg-[#111] border border-[#333] rounded-md h-10 px-3 text-sm">
                  {Object.entries(DISC_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Reason</Label><textarea required value={discForm.reason} onChange={e => setDiscForm({ ...discForm, reason: e.target.value })} rows={3} className="w-full bg-[#111] border border-[#333] rounded-md p-3 text-sm" /></div>
              <div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Evidence (link, optional)</Label><Input value={discForm.evidence} onChange={e => setDiscForm({ ...discForm, evidence: e.target.value })} className="bg-[#111] border-[#333]" placeholder="https://..." /></div>
              <div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Expires (optional)</Label><Input type="date" value={discForm.expires_at} onChange={e => setDiscForm({ ...discForm, expires_at: e.target.value })} className="bg-[#111] border-[#333]" /></div>
              <DialogFooter><Button type="submit" className="bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest">Issue Record</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return <div><p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{label}</p><p className={`mt-0.5 ${mono ? "font-mono text-xs" : ""} text-gray-200 truncate`}>{value}</p></div>;
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="bg-[#111] border-[#222] p-4">
      <div className="flex items-center gap-2 text-amber-500 mb-1">{icon}<span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{label}</span></div>
      <p className="text-xl font-black italic">{value}</p>
    </Card>
  );
}
