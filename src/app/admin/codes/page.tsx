"use client";

import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Trash2, 
  RefreshCcw, 
  Search, 
  LayoutDashboard, 
  Ticket,
  Lock,
  User,
  LogOut,
  Users,
  Video,
  ExternalLink,
  Info,
  Globe,
  TrendingUp,
  Activity,
  Zap,
  ArrowRight,
  BarChart3,
  MousePointer2,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';

// --- Types ---

interface RedeemCode {
  id: string;
  codeHash: string;
  tier: string;
  isRedeemed: boolean;
  redeemedBy?: string;
  redeemedAt?: string;
  created_at: string;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

interface StreamerApp {
  id: string;
  ingame_name_cid: string;
  discord_id: string;
  discord_name?: string;
  discord_avatar?: string;
  email: string;
  platform: string;
  channel_url: string;
  followers_count: string;
  ensemble_mindset: string;
  sample_content: string;
  status: 'pending' | 'approved' | 'denied';
  created_at: string;
}

interface FamilyApp {
  id: string;
  ic_name: string;
  age: number;
  experience: string;
  backstory: string;
  discord_id: string;
  status: 'pending' | 'approved' | 'denied';
  created_at: string;
}

interface ActiveFamily {
  id: string;
  name: string;
  logo: string | null;
  description: string | null;
  created_at: string;
}

interface DashboardStats {
  metrics: {
    totalCodes: number;
    redeemedCodes: number;
    activeCodes: number;
    redemptionRate: number | string;
    // Streamer
    pendingApps: number;
    approvedApps: number;
    totalApps: number;
    // Family
    pendingFamilyApps: number;
    approvedFamilyApps: number;
    totalFamilyApps: number;
    // Staff
    staffCount: number;
  };
  tierDistribution: Record<string, number>;
  trafficData: { name: string; visitors: number }[];
  recentActivity: {
    codes: RedeemCode[];
    apps: StreamerApp[];
    family: FamilyApp[];
  };
}

type ActiveTab = "overview" | "codes" | "admins" | "applications" | "family" | "active_families";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [codes, setCodes] = useState<RedeemCode[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [streamerApps, setStreamerApps] = useState<StreamerApp[]>([]);
  const [familyApps, setFamilyApps] = useState<FamilyApp[]>([]);
  const [activeFamilies, setActiveFamilies] = useState<ActiveFamily[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<StreamerApp | null>(null);
  const [selectedFamilyApp, setSelectedFamilyApp] = useState<FamilyApp | null>(null);
  const [selectedActiveFamily, setSelectedActiveFamily] = useState<ActiveFamily | null>(null);
  const [error, setError] = useState("");

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAdminAddOpen, setIsAdminAddOpen] = useState(false);
  const [isFamilyAddOpen, setIsFamilyAddOpen] = useState(false);
  const [isFamilyEditOpen, setIsFamilyEditOpen] = useState(false);
  const [newCode, setNewCode] = useState({ code: "", tier: "Gold", count: 0 });
  const [newAdmin, setNewAdmin] = useState({ email: "", password: "", name: "" });
  const [newFamily, setNewFamily] = useState({ name: "", logo: "", description: "" });

  useEffect(() => {
    const auth = localStorage.getItem("ega_admin_auth");
    if (auth) {
      try {
        const { email: savedEmail, password: savedPassword } = JSON.parse(auth);
        setEmail(savedEmail);
        setPassword(savedPassword);
        setIsAuthorized(true);
      } catch (e) {
        localStorage.removeItem("ega_admin_auth");
        window.location.href = "/admin/login";
      }
    } else {
      window.location.href = "/admin/login";
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) fetchData();
  }, [activeTab, isAuthorized]);

  const getAuthHeaders = () => ({
    "x-admin-email": email,
    "x-admin-password": password,
  });

  const fetchData = async () => {
    if (!isAuthorized) return;
    setLoading(true);

    const endpoints: Record<ActiveTab, string> = {
      overview:     "/api/admin/stats",
      codes:        "/api/admin/codes",
      admins:       "/api/admin/users",
      applications: "/api/admin/applications",
      family:       "/api/admin/family-applications",
      active_families: "/api/admin/families",
    };

    try {
      const res = await fetch(endpoints[activeTab], { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (activeTab === "overview")     setStats(data);
        else if (activeTab === "codes")   setCodes(data);
        else if (activeTab === "admins")  setAdminUsers(data);
        else if (activeTab === "applications") setStreamerApps(data);
        else if (activeTab === "family")  setFamilyApps(data);
        else if (activeTab === "active_families") setActiveFamilies(data);
      } else {
        localStorage.removeItem("ega_admin_auth");
        window.location.href = "/admin/login";
      }
    } catch (err) {
      toast.error("Failed to connect to HQ");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ega_admin_auth");
    window.location.href = "/admin/login";
  };

  // Code handlers
  const handleAddCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(newCode),
      });
      if (res.ok) {
        const data = await res.json();
        setCodes(prev => Array.isArray(data) ? [...data, ...prev] : [data, ...prev]);
        setIsAddOpen(false);
        setNewCode({ code: "", tier: "Gold", count: 0 });
        toast.success("Units Deployed");
      }
    } catch (err) { toast.error("Deployment failed"); }
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm("Decommission this unit?")) return;
    const res = await fetch(`/api/admin/codes?id=${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      setCodes(prev => prev.filter(c => c.id !== id));
      toast.success("Unit Purged");
    }
  };

  // Admin handlers
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(newAdmin),
    });
    if (res.ok) {
      const data = await res.json();
      setAdminUsers(prev => [data, ...prev]);
      setIsAdminAddOpen(false);
      setNewAdmin({ email: "", password: "", name: "" });
      toast.success("Operator Authorized");
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm("Revoke access?")) return;
    const res = await fetch(`/api/admin/users?id=${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      setAdminUsers(prev => prev.filter(u => u.id !== id));
      toast.success("Access Revoked");
    }
  };

  // Streamer application handlers
  const handleUpdateAppStatus = async (id: string, status: 'approved' | 'denied') => {
    const res = await fetch(`/api/admin/applications?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setStreamerApps(prev => prev.map(app => app.id === id ? { ...app, status } : app));
      if (selectedApp?.id === id) setSelectedApp({ ...selectedApp, status });
      toast.success(`Applicant ${status}`);
    }
  };

  // Family application handlers
  const handleUpdateFamilyStatus = async (id: string, status: 'approved' | 'denied') => {
    const res = await fetch(`/api/admin/family-applications?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setFamilyApps(prev => prev.map(app => app.id === id ? { ...app, status } : app));
      if (selectedFamilyApp?.id === id) setSelectedFamilyApp({ ...selectedFamilyApp!, status });
      toast.success(`Family application ${status}`);
    }
  };

  // Filtered lists
  const filteredCodes   = codes.filter(c => c.codeHash.toLowerCase().includes(search.toLowerCase()) || c.tier.toLowerCase().includes(search.toLowerCase()));
  const filteredAdmins  = adminUsers.filter(u => u.email.toLowerCase().includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase()));
  const filteredApps    = streamerApps.filter(app => app.ingame_name_cid.toLowerCase().includes(search.toLowerCase()) || app.discord_id.toLowerCase().includes(search.toLowerCase()));
  const filteredFamily  = familyApps.filter(app => app.ic_name.toLowerCase().includes(search.toLowerCase()) || app.discord_id.toLowerCase().includes(search.toLowerCase()));
  const filteredActiveFamilies = activeFamilies.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  // Active Family handlers
  const handleAddFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/families", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(newFamily),
    });
    if (res.ok) {
      const data = await res.json();
      setActiveFamilies(prev => [data, ...prev]);
      setIsFamilyAddOpen(false);
      setNewFamily({ name: "", logo: "", description: "" });
      toast.success("Family Established");
    }
  };

  const handleEditFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActiveFamily) return;
    const res = await fetch(`/api/admin/families?id=${selectedActiveFamily.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(selectedActiveFamily),
    });
    if (res.ok) {
      const data = await res.json();
      setActiveFamilies(prev => prev.map(f => f.id === data.id ? data : f));
      setIsFamilyEditOpen(false);
      setSelectedActiveFamily(null);
      toast.success("Family Updated");
    }
  };

  const handleDeleteFamily = async (id: string) => {
    if (!confirm("Disband this family?")) return;
    const res = await fetch(`/api/admin/families?id=${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      setActiveFamilies(prev => prev.filter(f => f.id !== id));
      toast.success("Family Disbanded");
    }
  };

  const pageTitle: Record<ActiveTab, string> = {
    overview:     "HQ OVERVIEW",
    codes:        "UNIT RECORDS",
    admins:       "STAFF BOARD",
    applications: "CREATOR POOL",
    family:       "FAMILY ROSTER",
    active_families: "ACTIVE FAMILIES",
  };

  const pendingFamilyCount = familyApps.filter(a => a.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-amber-500/30">
      <div className="relative flex min-h-screen">
        
        {/* ── Sidebar ── */}
        <nav className="w-68 border-r border-[#222] bg-[#0d0d0d] flex flex-col p-6 hidden lg:flex">
          <div className="flex items-center gap-3 mb-10 text-amber-500"><Zap fill="currentColor" size={24} /><span className="font-black text-xl italic tracking-tighter text-white">EGA <span className="text-amber-500">HQ</span></span></div>
          <div className="space-y-2 mb-auto">
            <NavButton active={activeTab === "overview"}      onClick={() => setActiveTab("overview")}      icon={<LayoutDashboard size={18} />} label="Operational Overview" />
            <div className="h-px bg-[#222] my-4" />
            <NavButton active={activeTab === "codes"}         onClick={() => setActiveTab("codes")}         icon={<Ticket size={18} />}          label="Unit Records" />
            <NavButton active={activeTab === "applications"} onClick={() => setActiveTab("applications")}  icon={<Video size={18} />}            label="Creator Pool"   count={stats?.metrics.pendingApps} />
            <NavButton active={activeTab === "family"}        onClick={() => setActiveTab("family")}        icon={<Shield size={18} />}           label="Family Roster"  count={pendingFamilyCount || undefined} />
            <NavButton active={activeTab === "active_families"} onClick={() => setActiveTab("active_families")} icon={<Globe size={18} />}            label="Active Families" />
            <NavButton active={activeTab === "admins"}        onClick={() => setActiveTab("admins")}        icon={<Users size={18} />}            label="Staff Access" />
          </div>
          <div className="mt-10 pt-6 border-t border-[#222] opacity-50 hover:opacity-100 transition-opacity">
            <button onClick={handleLogout} className="text-gray-500 flex items-center gap-2 text-sm hover:text-white transition-colors">
              <LogOut size={14} /> Terminate Session
            </button>
          </div>
        </nav>

        {/* ── Main ── */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                  <h1 className="text-4xl font-black italic tracking-tighter uppercase">{pageTitle[activeTab]}</h1>
                  <p className="text-gray-400 font-medium tracking-wide">Command &amp; Control Interface</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={fetchData} className="bg-transparent border-[#333] hover:bg-white/5 opacity-80"><RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Sync State</Button>
                {activeTab === "codes"  && <Button onClick={() => setIsAddOpen(true)}      className="bg-white text-black font-bold h-9 italic tracking-widest uppercase text-xs px-4">New Distribution</Button>}
                {activeTab === "admins" && <Button onClick={() => setIsAdminAddOpen(true)} className="bg-white text-black font-bold h-9 italic tracking-widest uppercase text-xs px-4">New Operator</Button>}
                {activeTab === "active_families" && <Button onClick={() => setIsFamilyAddOpen(true)} className="bg-white text-black font-bold h-9 italic tracking-widest uppercase text-xs px-4">New Family</Button>}
              </div>
            </div>

            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && stats && (
                <div className="space-y-10 animate-in fade-in duration-500">

                  {/* ── Traffic Chart ── */}
                  <Card className="bg-[#0d0d0d] border-[#222] overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03]"><Activity size={160} /></div>
                    <div className="p-8 relative z-10 space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 flex items-center gap-2"><TrendingUp size={12}/> Visitor Flow — Last 7 Days</p>
                          <p className="text-2xl font-black italic tracking-tighter mt-1 uppercase">Real‑Time Traffic</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Total Visitors</p>
                          <p className="text-3xl font-black italic text-amber-500">{stats.trafficData.reduce((s,d)=>s+d.visitors,0)}</p>
                        </div>
                      </div>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats.trafficData}>
                            <defs><linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a1a1a" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#555',fontSize:10}} dy={10} />
                            <YAxis hide />
                            <Tooltip contentStyle={{backgroundColor:'#111',border:'1px solid #333',borderRadius:'12px',fontSize:'11px'}} itemStyle={{color:'#f59e0b',fontWeight:'bold'}} />
                            <Area type="monotone" dataKey="visitors" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVis)" dot={{r:3,fill:'#f59e0b',strokeWidth:0}} activeDot={{r:5}} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </Card>

                  {/* ── 6 Metric Cards ── */}
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                    <MiniStatCard label="Total Codes"   value={stats.metrics.totalCodes}              color="amber"  sub={`${stats.metrics.activeCodes} idle`} />
                    <MiniStatCard label="Redeemed"      value={stats.metrics.redeemedCodes}            color="green"  sub={`${stats.metrics.redemptionRate}% rate`} />
                    <MiniStatCard label="Creator Apps"  value={stats.metrics.totalApps}                color="purple" sub={`${stats.metrics.pendingApps} pending`} />
                    <MiniStatCard label="Family Apps"   value={stats.metrics.totalFamilyApps}          color="orange" sub={`${stats.metrics.pendingFamilyApps} pending`} />
                    <MiniStatCard label="HQ Staff"      value={stats.metrics.staffCount}               color="blue"   sub="operators" />
                    <MiniStatCard label="Approved Total" value={(stats.metrics.approvedApps||0)+(stats.metrics.approvedFamilyApps||0)} color="green" sub="across both pools" />
                  </div>

                  {/* ── Application Pipelines ── */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                    {/* Creator Pool Pipeline */}
                    <Card className="bg-[#0d0d0d] border-[#222] overflow-hidden">
                      <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-[#1a1a1a]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center"><Video size={16} className="text-purple-400" /></div>
                          <div>
                            <p className="font-black uppercase tracking-tighter italic text-sm">Creator Pool</p>
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{stats.metrics.totalApps} Total Applications</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <PipelinePill label="Pending" count={stats.metrics.pendingApps} color="amber" />
                          <PipelinePill label="Approved" count={stats.metrics.approvedApps||0} color="green" />
                        </div>
                      </div>
                      <div className="divide-y divide-[#1a1a1a]">
                        {stats.recentActivity.apps.length === 0
                          ? <p className="text-center text-gray-700 py-8 text-xs font-black uppercase tracking-widest">No applications yet</p>
                          : stats.recentActivity.apps.map(app => (
                          <div key={app.id} className="px-6 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 text-[10px] font-black">{app.ingame_name_cid?.[0]?.toUpperCase()}</div>
                              <div>
                                <p className="text-sm font-bold tracking-tight">{app.ingame_name_cid}</p>
                                <p className="text-[10px] text-gray-600 font-mono">{app.platform}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="text-[10px] text-gray-700 font-mono">{new Date(app.created_at).toLocaleDateString()}</p>
                              <StatusBadge status={app.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-6 py-3 border-t border-[#1a1a1a]">
                        <button onClick={() => setActiveTab('applications')} className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500 hover:text-purple-400 flex items-center gap-2 italic">View Full Pipeline <ArrowRight size={11}/></button>
                      </div>
                    </Card>

                    {/* Family Roster Pipeline */}
                    <Card className="bg-[#0d0d0d] border-[#222] overflow-hidden">
                      <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-[#1a1a1a]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center"><Shield size={16} className="text-orange-400" /></div>
                          <div>
                            <p className="font-black uppercase tracking-tighter italic text-sm">Family Roster</p>
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{stats.metrics.totalFamilyApps} Total Applications</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <PipelinePill label="Pending" count={stats.metrics.pendingFamilyApps} color="amber" />
                          <PipelinePill label="Approved" count={stats.metrics.approvedFamilyApps||0} color="green" />
                        </div>
                      </div>
                      <div className="divide-y divide-[#1a1a1a]">
                        {stats.recentActivity.family.length === 0
                          ? <p className="text-center text-gray-700 py-8 text-xs font-black uppercase tracking-widest">No applications yet</p>
                          : stats.recentActivity.family.map((app: FamilyApp) => (
                          <div key={app.id} className="px-6 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 text-[10px] font-black">{app.ic_name?.[0]?.toUpperCase()}</div>
                              <div>
                                <p className="text-sm font-bold tracking-tight">{app.ic_name}</p>
                                <p className="text-[10px] text-gray-600 font-mono">Age {app.age}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="text-[10px] text-gray-700 font-mono">{new Date(app.created_at).toLocaleDateString()}</p>
                              <StatusBadge status={app.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-6 py-3 border-t border-[#1a1a1a]">
                        <button onClick={() => setActiveTab('family')} className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 hover:text-orange-400 flex items-center gap-2 italic">View Full Roster <ArrowRight size={11}/></button>
                      </div>
                    </Card>
                  </div>

                  {/* ── Bottom Row: Tier Chart + Quick Actions ── */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                    {/* Tier Distribution */}
                    <div className="xl:col-span-7 space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2"><BarChart3 size={14}/> Tier Saturation</h3>
                      <Card className="bg-[#111] border-[#222] p-6">
                        <div className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={Object.entries(stats.tierDistribution).map(([name,value])=>({name,value}))} barSize={28}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a1a1a" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#555',fontSize:10}} />
                              <Tooltip cursor={{fill:'rgba(255,255,255,0.03)'}} contentStyle={{backgroundColor:'#000',border:'1px solid #333',borderRadius:'8px',fontSize:'11px'}} />
                              <Bar dataKey="value" radius={[6,6,0,0]}>
                                {Object.entries(stats.tierDistribution).map((_,i)=>(<Cell key={i} fill={['#f59e0b','#a855f7','#3b82f6','#22c55e','#ef4444','#ec4899'][i%6]} />))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {Object.entries(stats.tierDistribution).map(([name,val],i)=>(
                            <div key={name} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                              <div className="w-2 h-2 rounded-full" style={{backgroundColor:['#f59e0b','#a855f7','#3b82f6','#22c55e','#ef4444','#ec4899'][i%6]}} />
                              <span className="text-[10px] font-bold text-gray-400 uppercase italic">{name}</span>
                              <span className="text-[10px] font-black text-white">{val}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="xl:col-span-5 space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2"><Zap size={14}/> Quick Actions</h3>
                      <div className="space-y-3">
                        <QuickAction icon={<Video size={15}/>}  label="Review Creator Applications" sub={`${stats.metrics.pendingApps} awaiting decision`}   color="purple" onClick={()=>setActiveTab('applications')} />
                        <QuickAction icon={<Shield size={15}/>} label="Review Family Applications"  sub={`${stats.metrics.pendingFamilyApps} awaiting decision`} color="orange" onClick={()=>setActiveTab('family')} />
                        <QuickAction icon={<Ticket size={15}/>} label="Manage Redeem Codes"          sub={`${stats.metrics.activeCodes} idle units`}             color="amber"  onClick={()=>setActiveTab('codes')} />
                        <QuickAction icon={<Users size={15}/>}  label="Manage HQ Staff"              sub={`${stats.metrics.staffCount} operators registered`}    color="blue"   onClick={()=>setActiveTab('admins')} />
                      </div>
                    </div>
                  </div>

                </div>
            )}

            {/* TAB: CREATOR POOL (Streamer Applications) */}
            {activeTab === "applications" && (
                <Card className="bg-[#111] border-[#222] overflow-hidden animate-in slide-in-from-bottom-4">
                  <div className="p-4 bg-[#1a1a1a] flex gap-4"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" /><Input placeholder="Filter applicants..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-[#0a0a0a] border-[#333] max-w-sm" /></div></div>
                  <Table>
                    <TableHeader className="bg-[#1a1a1a]"><TableRow className="border-[#222]"><TableHead>Status</TableHead><TableHead>Applicant</TableHead><TableHead>Platform</TableHead><TableHead className="text-right">Operational Review</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {filteredApps.map(app => (
                        <TableRow key={app.id} className="border-[#222] hover:bg-white/5 transition-colors">
                          <TableCell><StatusBadge status={app.status} /></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {/* Discord Avatar */}
                              <div className="relative shrink-0">
                                {app.discord_avatar ? (
                                  <img
                                    src={app.discord_avatar}
                                    alt={app.discord_name || app.discord_id}
                                    className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500/30"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xs font-black">
                                    {(app.discord_name || app.ingame_name_cid)?.[0]?.toUpperCase()}
                                  </div>
                                )}
                                {/* Online indicator dot */}
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#111] border-2 border-[#111] flex items-center justify-center">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                </span>
                              </div>
                              <div>
                                <p className="font-bold text-sm tracking-tight">{app.ingame_name_cid}</p>
                                <p className="text-[10px] text-purple-400/80 font-semibold">
                                  {app.discord_name
                                    ? `@${app.discord_name}`
                                    : <span className="text-gray-600 font-mono italic">{app.discord_id}</span>}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-400 text-[10px] font-black uppercase italic tracking-widest">{app.platform}</TableCell>
                          <TableCell className="text-right">
                              <Dialog><DialogTrigger asChild><Button size="sm" onClick={() => setSelectedApp(app)} className="bg-white text-black font-black uppercase text-[10px] h-8 px-5 italic tracking-widest">Review Code</Button></DialogTrigger>
                              <DialogContent className="bg-[#0a0a0a] border-[#222] text-white max-w-2xl">
                                  <DialogHeader><DialogTitle className="text-2xl font-black italic tracking-tighter uppercase underline decoration-amber-500">Review: {selectedApp?.ingame_name_cid}</DialogTitle></DialogHeader>
                                  {selectedApp && (
                                      <div className="space-y-6 py-6 animate-in fade-in">
                                          <div className="grid grid-cols-2 gap-4"><AppField label="Discord ID" value={selectedApp.discord_id} mono /><AppField label="Reach" value={selectedApp.platform} color="amber" /></div>
                                          <AppField label="Internal Email" value={selectedApp.email} />
                                          <div className="space-y-2"><p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic">Core Philosophy</p><div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm italic text-gray-300 leading-relaxed font-serif">"{selectedApp.ensemble_mindset}"</div></div>
                                          <div className="grid grid-cols-2 gap-4 pt-4"><a href={selectedApp.channel_url} target="_blank" className="flex items-center justify-center gap-3 p-4 bg-purple-600 rounded-2xl text-xs font-black uppercase tracking-widest">Inspect Channel <ExternalLink size={16}/></a><a href={selectedApp.sample_content} target="_blank" className="flex items-center justify-center gap-3 p-4 bg-blue-600 rounded-2xl text-xs font-black uppercase tracking-widest">Review Content <Video size={16}/></a></div>
                                      </div>
                                  )}
                                  <DialogFooter className="flex flex-row gap-4 border-t border-[#222] pt-6">
                                    {selectedApp?.status === 'pending' ? (<><Button onClick={() => handleUpdateAppStatus(selectedApp!.id, 'denied')} variant="destructive" className="flex-1 font-black h-12 uppercase italic tracking-widest">Decline</Button><Button onClick={() => handleUpdateAppStatus(selectedApp!.id, 'approved')} className="bg-green-600 flex-1 font-black h-12 uppercase italic tracking-widest">Authorize</Button></>) : (<div className="w-full text-center text-gray-600 font-black uppercase tracking-[0.4em] text-xs py-3 bg-white/5 rounded-2xl border border-white/5">ARCHIVED: {selectedApp?.status}</div>)}
                                  </DialogFooter>
                              </DialogContent></Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
            )}

            {/* TAB: FAMILY ROSTER */}
            {activeTab === "family" && (
                <Card className="bg-[#111] border-[#222] overflow-hidden animate-in slide-in-from-bottom-4">
                  <div className="p-4 bg-[#1a1a1a] flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <Input placeholder="Filter applicants..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-[#0a0a0a] border-[#333] max-w-sm" />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                      <span className="text-orange-500">{familyApps.filter(a => a.status === 'pending').length}</span> Pending
                    </div>
                  </div>
                  <Table>
                    <TableHeader className="bg-[#1a1a1a]">
                      <TableRow className="border-[#222]">
                        <TableHead>Status</TableHead>
                        <TableHead>IC Name</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Discord ID</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead className="text-right">Review</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFamily.length === 0 ? (
                        <TableRow className="border-[#222]">
                          <TableCell colSpan={6} className="text-center text-gray-600 py-16 font-black uppercase tracking-widest italic text-sm">
                            No applications filed yet.
                          </TableCell>
                        </TableRow>
                      ) : filteredFamily.map(app => (
                        <TableRow key={app.id} className="border-[#222] hover:bg-white/5 transition-colors">
                          <TableCell><StatusBadge status={app.status} /></TableCell>
                          <TableCell><p className="font-bold text-sm tracking-tight">{app.ic_name}</p></TableCell>
                          <TableCell className="text-gray-400 text-sm font-bold">{app.age}</TableCell>
                          <TableCell className="text-[10px] text-gray-500 font-mono italic">{app.discord_id}</TableCell>
                          <TableCell className="text-[10px] text-gray-600 font-mono">{new Date(app.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" onClick={() => setSelectedFamilyApp(app)} className="bg-orange-500 hover:bg-orange-600 text-black font-black uppercase text-[10px] h-8 px-5 italic tracking-widest">
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-[#0a0a0a] border-[#222] text-white max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase underline decoration-orange-500">
                                    Family Review: {selectedFamilyApp?.ic_name}
                                  </DialogTitle>
                                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest pt-1">Submitted {selectedFamilyApp && new Date(selectedFamilyApp.created_at).toLocaleString()}</p>
                                </DialogHeader>
                                {selectedFamilyApp && (
                                  <div className="space-y-6 py-6 animate-in fade-in">
                                    <div className="grid grid-cols-3 gap-4">
                                      <AppField label="IC Name"    value={selectedFamilyApp.ic_name} />
                                      <AppField label="Age"        value={String(selectedFamilyApp.age)} color="amber" />
                                      <AppField label="Discord ID" value={selectedFamilyApp.discord_id} mono />
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic">RP Experience</p>
                                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm text-gray-300 leading-relaxed">{selectedFamilyApp.experience}</div>
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic">Character Backstory</p>
                                      <div className="p-4 bg-white/5 rounded-2xl border border-orange-500/10 text-sm italic text-gray-300 leading-relaxed font-serif max-h-48 overflow-y-auto">"{selectedFamilyApp.backstory}"</div>
                                    </div>
                                  </div>
                                )}
                                <DialogFooter className="flex flex-row gap-4 border-t border-[#222] pt-6">
                                  {selectedFamilyApp?.status === 'pending' ? (
                                    <>
                                      <Button onClick={() => handleUpdateFamilyStatus(selectedFamilyApp!.id, 'denied')}   variant="destructive"                                              className="flex-1 font-black h-12 uppercase italic tracking-widest">Decline</Button>
                                      <Button onClick={() => handleUpdateFamilyStatus(selectedFamilyApp!.id, 'approved')} className="bg-green-600 hover:bg-green-700 flex-1 font-black h-12 uppercase italic tracking-widest">Authorize</Button>
                                    </>
                                  ) : (
                                    <div className="w-full text-center text-gray-600 font-black uppercase tracking-[0.4em] text-xs py-3 bg-white/5 rounded-2xl border border-white/5">
                                      ARCHIVED: {selectedFamilyApp?.status}
                                    </div>
                                  )}
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
            )}

            {/* TAB: CODES */}
            {activeTab === "codes" && (
                <Card className="bg-[#111] border-[#222] overflow-hidden animate-in slide-in-from-bottom-4">
                    <Table>
                        <TableHeader className="bg-[#1a1a1a]"><TableRow className="border-[#222]"><TableHead>State</TableHead><TableHead>Tier</TableHead><TableHead>Unit Key</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {filteredCodes.map(code => (
                                <TableRow key={code.id} className="border-[#222] hover:bg-white/5 transition-colors">
                                    <TableCell>{code.isRedeemed ? <Badge className="bg-green-500 text-black border-none text-[8px] font-black italic">ACTIVE</Badge> : <Badge variant="outline" className="border-amber-500/30 text-amber-500 text-[8px] font-black italic">IDLE</Badge>}</TableCell>
                                    <TableCell className="font-black text-amber-500 italic uppercase tracking-tighter">{code.tier}</TableCell>
                                    <TableCell className="font-mono text-xs opacity-50 tracking-widest">{code.codeHash}</TableCell>
                                    <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDeleteCode(code.id)} className="text-red-500 hover:scale-125 transition-transform"><Trash2 size={16} /></Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {/* TAB: ACTIVE FAMILIES */}
            {activeTab === "active_families" && (
                <Card className="bg-[#111] border-[#222] overflow-hidden animate-in slide-in-from-bottom-4">
                    <div className="p-4 bg-[#1a1a1a] flex gap-4"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" /><Input placeholder="Search families..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-[#0a0a0a] border-[#333] max-w-sm" /></div></div>
                    <Table>
                        <TableHeader className="bg-[#1a1a1a]"><TableRow className="border-[#222]"><TableHead>Logo</TableHead><TableHead>Name</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {filteredActiveFamilies.length === 0 ? (
                              <TableRow className="border-[#222]"><TableCell colSpan={4} className="text-center text-gray-600 py-16 font-black uppercase tracking-widest italic text-sm">No families exist yet.</TableCell></TableRow>
                            ) : filteredActiveFamilies.map(f => (
                                <TableRow key={f.id} className="border-[#222] hover:bg-white/5 transition-colors">
                                    <TableCell>{f.logo ? <img src={f.logo} alt={f.name} className="w-10 h-10 rounded-full object-cover border border-[#333]" /> : <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center font-bold text-gray-500 border border-[#333]">{f.name[0]?.toUpperCase()}</div>}</TableCell>
                                    <TableCell className="font-black italic uppercase tracking-tighter text-amber-500">{f.name}</TableCell>
                                    <TableCell className="text-gray-400 text-xs italic max-w-xs truncate">{f.description || "No description provided."}</TableCell>
                                    <TableCell className="text-right">
                                      <Button variant="ghost" size="sm" onClick={() => { setSelectedActiveFamily(f); setIsFamilyEditOpen(true); }} className="text-blue-500 hover:text-blue-400 mr-2 uppercase text-[10px] font-black tracking-widest italic">Edit</Button>
                                      <Button variant="ghost" size="icon" onClick={() => handleDeleteFamily(f.id)} className="text-red-500 hover:scale-125 transition-transform"><Trash2 size={16} /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {/* TAB: ADMINS */}
            {activeTab === "admins" && (
                <Card className="bg-[#111] border-[#222] overflow-hidden animate-in slide-in-from-bottom-4">
                    <Table>
                        <TableHeader className="bg-[#1a1a1a]"><TableRow className="border-[#222]"><TableHead>Operator</TableHead><TableHead>HQ Email</TableHead><TableHead className="text-right">Revoke Access</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {filteredAdmins.map(admin => (
                                <TableRow key={admin.id} className="border-[#222] hover:bg-white/5 transition-colors">
                                    <TableCell className="font-black italic uppercase tracking-tighter">{admin.name || "UNIDENTIFIED"}</TableCell>
                                    <TableCell className="text-gray-400 font-mono text-xs italic">{admin.email}</TableCell>
                                    <TableCell className="text-right">{admin.email !== "admin@ega.com" && <Button variant="ghost" size="icon" onClick={() => handleDeleteAdmin(admin.id)} className="text-red-500 hover:scale-125 transition-transform"><Trash2 size={16} /></Button>}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
          </div>
        </main>
      </div>

      {/* ── Modals ── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}><DialogContent className="bg-[#0a0a0a] border-[#222] text-white"><DialogHeader><DialogTitle className="font-black italic text-xl uppercase tracking-tighter">Initialize Unit Rollout</DialogTitle></DialogHeader><form onSubmit={handleAddCode} className="space-y-6 pt-6"><div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black tracking-widest italic">Product Tier</Label><select value={newCode.tier} onChange={(e) => setNewCode({...newCode, tier: e.target.value})} className="w-full bg-[#111] border-[#222] rounded-2xl p-4 text-sm font-bold focus:ring-1 focus:ring-amber-500"><option>Bronze</option><option>Silver</option><option>Gold</option><option>Platinum</option><option>Ultimate</option></select></div><div className="grid grid-cols-2 gap-4"><div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black italic">Quantity</Label><Input type="number" min="0" placeholder="0 = Single" onChange={(e) => setNewCode({...newCode, count: parseInt(e.target.value) || 0})} className="bg-[#111] border-[#222] h-14 font-black" /></div><div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black italic">Prefix</Label><Input placeholder="EGA" value={newCode.code} onChange={(e) => setNewCode({...newCode, code: e.target.value})} className="bg-[#111] border-[#222] h-14 font-black uppercase" required={!newCode.count}/></div></div><Button type="submit" className="w-full bg-amber-500 text-black font-black uppercase tracking-widest h-14 rounded-2xl shadow-xl shadow-amber-900/10">Authorize Deployment</Button></form></DialogContent></Dialog>
      <Dialog open={isAdminAddOpen} onOpenChange={setIsAdminAddOpen}><DialogContent className="bg-[#0a0a0a] border-[#222] text-white"><DialogHeader><DialogTitle className="font-black italic text-xl uppercase tracking-tighter">Onboard New Operator</DialogTitle></DialogHeader><form onSubmit={handleAddAdmin} className="space-y-6 pt-6"><div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black italic">Operator ID Name</Label><Input placeholder="James" value={newAdmin.name} onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})} className="bg-[#111] border-[#222] h-14 font-bold" /></div><div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black italic">Secure System Email</Label><Input type="email" placeholder="staff@ega.com" value={newAdmin.email} onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})} className="bg-[#111] border-[#222] h-14 font-bold" required /></div><div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black italic">Access Token</Label><Input type="password" placeholder="••••••••" value={newAdmin.password} onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})} className="bg-[#111] border-[#222] h-14 font-bold" required /></div><Button type="submit" className="w-full bg-amber-500 text-black font-black uppercase tracking-widest h-14 rounded-2xl shadow-xl shadow-amber-900/10">Synchronize Clearance</Button></form></DialogContent></Dialog>
      <Dialog open={isFamilyAddOpen} onOpenChange={setIsFamilyAddOpen}><DialogContent className="bg-[#0a0a0a] border-[#222] text-white"><DialogHeader><DialogTitle className="font-black italic text-xl uppercase tracking-tighter">Register New Family</DialogTitle></DialogHeader><form onSubmit={handleAddFamily} className="space-y-4 pt-6"><div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black italic">Family Name</Label><Input placeholder="Cartel de Sinaloa" value={newFamily.name} onChange={(e) => setNewFamily({...newFamily, name: e.target.value})} className="bg-[#111] border-[#222] h-12 font-bold" required /></div><div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black italic">Logo URL</Label><Input placeholder="https://example.com/logo.png" value={newFamily.logo} onChange={(e) => setNewFamily({...newFamily, logo: e.target.value})} className="bg-[#111] border-[#222] h-12 font-bold" /></div><div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black italic">Description</Label><textarea rows={3} value={newFamily.description} onChange={(e) => setNewFamily({...newFamily, description: e.target.value})} className="w-full bg-[#111] border-[#222] rounded-2xl p-4 text-sm font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none" placeholder="A brief description of the family..." /></div><Button type="submit" className="w-full bg-amber-500 text-black font-black uppercase tracking-widest h-12 rounded-2xl">Create Family</Button></form></DialogContent></Dialog>
      <Dialog open={isFamilyEditOpen} onOpenChange={setIsFamilyEditOpen}><DialogContent className="bg-[#0a0a0a] border-[#222] text-white"><DialogHeader><DialogTitle className="font-black italic text-xl uppercase tracking-tighter">Update Family</DialogTitle></DialogHeader>{selectedActiveFamily && <form onSubmit={handleEditFamily} className="space-y-4 pt-6"><div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black italic">Family Name</Label><Input value={selectedActiveFamily.name} onChange={(e) => setSelectedActiveFamily({...selectedActiveFamily, name: e.target.value})} className="bg-[#111] border-[#222] h-12 font-bold" required /></div><div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black italic">Logo URL</Label><Input value={selectedActiveFamily.logo || ""} onChange={(e) => setSelectedActiveFamily({...selectedActiveFamily, logo: e.target.value})} className="bg-[#111] border-[#222] h-12 font-bold" /></div><div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black italic">Description</Label><textarea rows={3} value={selectedActiveFamily.description || ""} onChange={(e) => setSelectedActiveFamily({...selectedActiveFamily, description: e.target.value})} className="w-full bg-[#111] border-[#222] rounded-2xl p-4 text-sm font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none" /></div><Button type="submit" className="w-full bg-blue-600 text-white font-black uppercase tracking-widest h-12 rounded-2xl">Save Changes</Button></form>}</DialogContent></Dialog>
    </div>
  );
}

// --- Component Atoms ---
function StatusBadge({ status }: { status: string }) {
  if (status === 'pending')  return <Badge className="bg-amber-500/10 text-amber-500  border-none uppercase text-[9px] font-black italic">Pending</Badge>;
  if (status === 'approved') return <Badge className="bg-green-500/10  text-green-500  border-none uppercase text-[9px] font-black italic">Approved</Badge>;
  return                            <Badge className="bg-red-500/10    text-red-500    border-none uppercase text-[9px] font-black italic">Denied</Badge>;
}

function ActivityRow({ title, sub, status, time, icon = "video" }: any) {
    return (<div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20"><Video size={18}/></div><div><p className="font-black text-sm tracking-tight italic uppercase">{title}</p><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mt-1">{sub}</p></div></div><div className="text-right"><p className="text-[9px] font-mono text-gray-600 mb-1">{time}</p><div className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${status === 'pending' ? 'text-amber-500 border-amber-500/20' : 'text-green-500 border-green-500/20'}`}>{status}</div></div></div>);
}

function StatCard({ title, value, sub, icon, trend, color = "amber" }: any) {
    const colors: any = { amber: "from-amber-500/20 shadow-amber-500/5", purple: "from-purple-500/20 shadow-purple-500/5", green: "from-green-500/20 shadow-green-500/5", blue: "from-blue-500/20 shadow-blue-500/5" };
    return (<Card className={`bg-[#111] border-[#222] p-6 shadow-2xl relative overflow-hidden group transition-all hover:border-gray-700`}><div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br transition-opacity opacity-10 group-hover:opacity-30 blur-3xl ${colors[color]}`} /><div className="space-y-4 relative z-10"><div className="flex items-center justify-between"><div className="p-2.5 rounded-xl bg-white/5 border border-white/10">{icon}</div><span className="text-[10px] font-black uppercase text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">{trend}</span></div><div><p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">{title}</p><p className="text-3xl font-black italic tracking-tighter mt-1">{value}</p><p className="text-[10px] text-gray-600 mt-2 flex items-center gap-1 font-bold italic"><Info size={10} /> {sub}</p></div></div></Card>);
}

function AppField({ label, value, mono = false, color = "white" }: any) {
    return (<div className="space-y-1.5 p-4 bg-white/5 rounded-2xl border border-white/5"><p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic">{label}</p><p className={`text-sm ${mono ? 'font-mono' : 'font-bold'} ${color === 'amber' ? 'text-amber-500' : 'text-white'} leading-none`}>{value}</p></div>);
}

function NavButton({ active, onClick, icon, label, count }: any) {
    return (<button onClick={onClick} className={`flex items-center justify-between w-full px-4 py-3.5 rounded-2xl transition-all duration-300 ${active ? "bg-amber-500/10 text-amber-500 font-black italic shadow-2xl shadow-amber-500/5 border border-amber-500/20" : "text-gray-500 hover:text-gray-300 hover:bg-white/5 hover:translate-x-1"}`}><div className="flex items-center gap-3">{icon}<span className="text-sm uppercase tracking-tighter">{label}</span></div>{count > 0 && <span className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">{count}</span>}</button>);
}

function MiniStatCard({ label, value, sub, color = "amber" }: any) {
  const palette: any = {
    amber:  { bg: "bg-amber-500/5",  border: "border-amber-500/10",  text: "text-amber-400"  },
    green:  { bg: "bg-green-500/5",  border: "border-green-500/10",  text: "text-green-400"  },
    purple: { bg: "bg-purple-500/5", border: "border-purple-500/10", text: "text-purple-400" },
    orange: { bg: "bg-orange-500/5", border: "border-orange-500/10", text: "text-orange-400" },
    blue:   { bg: "bg-blue-500/5",   border: "border-blue-500/10",   text: "text-blue-400"   },
  };
  const p = palette[color] ?? palette.amber;
  return (
    <div className={`${p.bg} border ${p.border} rounded-2xl p-4 space-y-2`}>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{label}</p>
      <p className={`text-3xl font-black italic tracking-tighter ${p.text}`}>{value}</p>
      <p className="text-[10px] text-gray-700 font-bold italic">{sub}</p>
    </div>
  );
}

function PipelinePill({ label, count, color = "amber" }: any) {
  const palette: any = {
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    red:   "bg-red-500/10   text-red-500   border-red-500/20",
  };
  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase ${palette[color] ?? palette.amber}`}>
      <span className="text-[11px] font-black">{count}</span> {label}
    </span>
  );
}

function QuickAction({ icon, label, sub, color = "amber", onClick }: any) {
  const palette: any = {
    amber:  { ring: "hover:border-amber-500/30  group-hover:text-amber-500",  bg: "bg-amber-500/10"  },
    purple: { ring: "hover:border-purple-500/30 group-hover:text-purple-500", bg: "bg-purple-500/10" },
    orange: { ring: "hover:border-orange-500/30 group-hover:text-orange-500", bg: "bg-orange-500/10" },
    blue:   { ring: "hover:border-blue-500/30   group-hover:text-blue-500",   bg: "bg-blue-500/10"   },
  };
  const p = palette[color] ?? palette.amber;
  return (
    <button onClick={onClick} className={`group w-full flex items-center gap-4 p-4 rounded-2xl bg-[#111] border border-[#222] ${p.ring} transition-all hover:translate-x-1 text-left`}>
      <div className={`w-9 h-9 rounded-xl ${p.bg} flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black uppercase tracking-tight">{label}</p>
        <p className="text-[10px] text-gray-600 font-bold italic mt-0.5">{sub}</p>
      </div>
      <ArrowRight size={14} className="text-gray-700 group-hover:text-gray-400 transition-colors shrink-0" />
    </button>
  );
}

