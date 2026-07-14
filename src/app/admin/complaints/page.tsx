"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Plus, ShieldAlert, Send } from "lucide-react";

const STATUSES = ["open", "investigating", "waiting_evidence", "interview", "resolved", "rejected", "archived"];
const STATUS_STYLE: Record<string, string> = {
  open: "bg-amber-500/15 text-amber-400",
  investigating: "bg-blue-500/15 text-blue-400",
  waiting_evidence: "bg-purple-500/15 text-purple-400",
  interview: "bg-cyan-500/15 text-cyan-400",
  resolved: "bg-green-500/15 text-green-400",
  rejected: "bg-red-500/15 text-red-400",
  archived: "bg-gray-500/15 text-gray-400",
};
const label = (s: string) => s.replace(/_/g, " ");

export default function ComplaintsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [staff, setStaff] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [noteText, setNoteText] = useState("");
  const [createForm, setCreateForm] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/me").then(r => { if (r.ok) setReady(true); else router.push("/admin/login"); }).catch(() => router.push("/admin/login"));
  }, [router]);

  const loadList = useCallback(() => {
    fetch(`/api/admin/complaints?status=${statusFilter}`).then(r => r.status === 401 ? (toast.error("No access to Complaints."), router.push("/admin/codes"), []) : r.json()).then(setList).catch(() => {});
  }, [statusFilter]);

  useEffect(() => { if (ready) loadList(); }, [ready, loadList]);
  useEffect(() => { if (ready) fetch("/api/admin/staff").then(r => r.ok ? r.json() : []).then(setStaff).catch(() => {}); }, [ready]);

  const openDetail = async (id: string) => {
    const res = await fetch(`/api/admin/complaints/${id}`);
    if (!res.ok) return toast.error("Failed to open complaint.");
    const d = await res.json();
    setSelected(d.complaint);
    setNotes(d.notes);
  };

  const patch = async (fields: any) => {
    const res = await fetch(`/api/admin/complaints/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fields) });
    const d = await res.json();
    if (res.ok) { setSelected(d); loadList(); } else toast.error(d.error || "Update failed.");
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    const res = await fetch(`/api/admin/complaints/${selected.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note: noteText }) });
    if (res.ok) { setNoteText(""); const nd = await res.json(); setNotes(n => [...n, nd]); } else toast.error("Failed to add note.");
  };

  const createComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/complaints", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(createForm) });
    const d = await res.json();
    if (res.ok) { toast.success("Complaint filed."); setCreateForm(null); loadList(); openDetail(d.id); } else toast.error(d.error || "Failed to file.");
  };

  if (!ready) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => router.push("/admin/codes")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#333] text-gray-400 hover:text-white hover:bg-white/5 text-xs font-black uppercase tracking-widest"><ArrowLeft className="w-3.5 h-3.5" /> Dashboard</button>
          <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase flex items-center gap-2"><ShieldAlert /> Complaints</h1>
          <Button onClick={() => setCreateForm({ title: "", reporter: "", reported_staff_id: "", reported_staff_text: "", description: "", evidence: "" })} className="ml-auto bg-amber-500 text-black font-black uppercase text-xs tracking-widest"><Plus size={14} className="mr-1" /> New Complaint</Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", ...STATUSES].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-colors ${statusFilter === s ? "border-amber-500 text-amber-500" : "border-[#333] text-gray-500 hover:text-gray-300"}`}>{label(s)}</button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* List */}
          <Card className="bg-[#111] border-[#222] lg:w-2/5 overflow-hidden">
            <div className="divide-y divide-[#1a1a1a] max-h-[70vh] overflow-y-auto">
              {list.length === 0 && <p className="p-6 text-center text-gray-600 text-sm italic">No complaints.</p>}
              {list.map(c => (
                <button key={c.id} onClick={() => openDetail(c.id)} className={`w-full text-left p-4 hover:bg-white/5 transition-colors ${selected?.id === c.id ? "bg-white/5" : ""}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-sm truncate">{c.title}</p>
                    <Badge className={`border-none text-[8px] uppercase ${STATUS_STYLE[c.status]}`}>{label(c.status)}</Badge>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 truncate">vs {c.reported?.display_name || c.reported_staff_text || "—"} · {new Date(c.created_at).toLocaleDateString()}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Detail */}
          <Card className="bg-[#111] border-[#222] flex-1 overflow-hidden">
            {!selected ? (
              <p className="p-10 text-center text-gray-600 italic">Select a complaint to view the case.</p>
            ) : (
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-black italic uppercase tracking-tight">{selected.title}</h2>
                  <Badge className={`border-none text-[9px] uppercase ${STATUS_STYLE[selected.status]}`}>{label(selected.status)}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Field label="Reporter" value={selected.reporter || "—"} />
                  <Field label="Reported Staff" value={selected.reported?.display_name || selected.reported_staff_text || "—"} />
                  <Field label="Filed By" value={selected.created_by || "—"} />
                  <Field label="Filed" value={new Date(selected.created_at).toLocaleString()} />
                </div>

                <div><p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Description</p><p className="text-sm text-gray-300 whitespace-pre-wrap bg-white/5 rounded-xl p-3 border border-white/5">{selected.description}</p></div>
                {selected.evidence && <div><p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Evidence</p><p className="text-sm text-blue-400 whitespace-pre-wrap break-all">{selected.evidence}</p></div>}

                {/* Workflow controls */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#222]">
                  <div className="space-y-1">
                    <Label className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Status</Label>
                    <select value={selected.status} onChange={e => patch({ status: e.target.value })} className="w-full bg-[#0a0a0a] border border-[#333] rounded-md h-10 px-3 text-sm capitalize">
                      {STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Investigator</Label>
                    <select value={selected.assigned_to || ""} onChange={e => patch({ assigned_to: e.target.value })} className="w-full bg-[#0a0a0a] border border-[#333] rounded-md h-10 px-3 text-sm">
                      <option value="">Unassigned</option>
                      {[...staff].sort((a, b) => a.display_name.localeCompare(b.display_name)).map(s => <option key={s.id} value={s.id}>{s.display_name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Decision</Label>
                  <textarea defaultValue={selected.decision || ""} onBlur={e => e.target.value !== (selected.decision || "") && patch({ decision: e.target.value })} rows={2} className="w-full bg-[#0a0a0a] border border-[#333] rounded-md p-3 text-sm" placeholder="Final decision / outcome…" />
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Punishment</Label>
                  <Input defaultValue={selected.punishment || ""} onBlur={e => e.target.value !== (selected.punishment || "") && patch({ punishment: e.target.value })} className="bg-[#0a0a0a] border-[#333]" placeholder="e.g. Final warning, 3-day suspension…" />
                </div>

                {/* Timeline */}
                <div className="pt-2 border-t border-[#222]">
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-2">Investigation Timeline</p>
                  <div className="space-y-2 mb-3">
                    {notes.length === 0 && <p className="text-gray-600 text-xs italic">No notes yet.</p>}
                    {notes.map(n => (
                      <div key={n.id} className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                        <p className="text-xs text-gray-300 whitespace-pre-wrap">{n.note}</p>
                        <p className="text-[9px] text-gray-600 mt-1">{n.author} · {new Date(n.created_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input value={noteText} onChange={e => setNoteText(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()} placeholder="Add a case note…" className="bg-[#0a0a0a] border-[#333]" />
                    <Button onClick={addNote} className="bg-amber-500 text-black"><Send size={14} /></Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* New complaint dialog */}
      <Dialog open={!!createForm} onOpenChange={o => !o && setCreateForm(null)}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-white max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-black italic uppercase tracking-tighter">File a Complaint</DialogTitle></DialogHeader>
          {createForm && (
            <form onSubmit={createComplaint} className="space-y-3 pt-2">
              <F label="Title"><Input required value={createForm.title} onChange={e => setCreateForm({ ...createForm, title: e.target.value })} className="bg-[#111] border-[#333]" /></F>
              <F label="Reporter (who complained)"><Input value={createForm.reporter} onChange={e => setCreateForm({ ...createForm, reporter: e.target.value })} className="bg-[#111] border-[#333]" placeholder="Player / Discord name" /></F>
              <F label="Reported Staff">
                <select value={createForm.reported_staff_id} onChange={e => setCreateForm({ ...createForm, reported_staff_id: e.target.value })} className="w-full bg-[#111] border border-[#333] rounded-md h-10 px-3 text-sm">
                  <option value="">— select staff (or type below) —</option>
                  {[...staff].sort((a, b) => a.display_name.localeCompare(b.display_name)).map(s => <option key={s.id} value={s.id}>{s.display_name}</option>)}
                </select>
              </F>
              {!createForm.reported_staff_id && <F label="…or name (if not a tracked staff)"><Input value={createForm.reported_staff_text} onChange={e => setCreateForm({ ...createForm, reported_staff_text: e.target.value })} className="bg-[#111] border-[#333]" /></F>}
              <F label="Description"><textarea required value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} rows={4} className="w-full bg-[#111] border border-[#333] rounded-md p-3 text-sm" /></F>
              <F label="Evidence (links, optional)"><textarea value={createForm.evidence} onChange={e => setCreateForm({ ...createForm, evidence: e.target.value })} rows={2} className="w-full bg-[#111] border border-[#333] rounded-md p-3 text-sm" placeholder="https://..." /></F>
              <DialogFooter><Button type="submit" className="bg-amber-500 text-black font-black uppercase tracking-widest">File Complaint</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{label}</p><p className="mt-0.5 text-gray-200 text-sm truncate">{value}</p></div>;
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black tracking-widest">{label}</Label>{children}</div>;
}
