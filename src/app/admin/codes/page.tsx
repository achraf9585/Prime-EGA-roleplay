"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
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
  Shield,
  ShieldCheck
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
  Cell,
  PieChart,
  Pie
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
  role?: string;
  discord_id?: string;
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
  rp_experience?: string;
  ensemble_mindset: string;
  strict_rp_standards?: string;
  history_info?: string;
  sample_content: string;
  stream_schedule?: string;
  privacy_comfort?: string;
  status: 'pending' | 'approved' | 'denied';
  created_at: string;
}

interface FamilyApp {
  id: string;
  family_name: string;
  family_picture?: string;
  family_nationality: string;
  family_description: string;
  family_goals: string;
  family_members: { discord_id: string; role: string }[];
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
  countryDistribution: { name: string; value: number }[];
  trafficData: { name: string; visitors: number }[];
  recentActivity: {
    codes: RedeemCode[];
    apps: StreamerApp[];
    family: FamilyApp[];
  };
}

type ActiveTab = "overview" | "codes" | "admins" | "applications" | "family" | "active_families" | "whitelist" | "whitelist_staff" | "players";

interface Player {
  id: string;
  username: string;
  global_name: string | null;
  nickname: string | null;
  avatar: string | null;
  joined_at: string;
}
type AuthMode = "admin" | "whitelist_staff" | "app_reviewer" | "none";

interface WhitelistStaffMember {
  id: string;
  discord_id: string;
  discord_username: string;
  discord_avatar?: string;
  role: "supervisor" | "member" | "app_reviewer";
  created_at: string;
}

interface WhitelistScenario {
  id: string;
  track: string;
  track_name: string;
  title: string;
  scenario_text: string;
  targeted_rules: string;
  fail_criteria: string;
  pass_criteria: string;
  title_tn?: string;
  scenario_text_tn?: string;
  targeted_rules_tn?: string;
  fail_criteria_tn?: string;
  pass_criteria_tn?: string;
}

type ScenarioLang = "en" | "tn";

interface WhitelistLog {
  id: string;
  application_id: string;
  candidate_name: string;
  candidate_discord: string;
  action: "approved" | "rejected";
  actor_type: "admin" | "staff";
  actor_name: string;
  actor_discord_id?: string | null;
  notes?: string;
  created_at: string;
}

interface DiscordProfile {
  username: string;
  global_name: string | null;
  avatar: string | null;
}

type InterviewSubTab = "details" | "quiz" | "scenarios";

interface WhitelistApp {
  id: string;
  discord_id: string;
  discord_username: string;
  discord_avatar?: string;
  character_name: string;
  character_backstory: string;
  experience_portfolio: string;
  traits_flaws: string;
  faction_choice: string;
  quiz_score?: number;
  quiz_answers?: Record<string, string>;
  quiz_details?: {
    id: string;
    question_text: string;
    category_name: string;
    options: { value: string; text: string }[];
    correct_answer: string;
    given_answer: string;
    is_correct: boolean;
  }[];
  tab_out_count: number;
  paste_count: number;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  rejected_at?: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const [authMode, setAuthMode] = useState<AuthMode>("none");
  const [authChecked, setAuthChecked] = useState(false);
  const [whitelistRole, setWhitelistRole] = useState<string | null>(null); // supervisor | member | app_reviewer
  const [discordProfiles, setDiscordProfiles] = useState<Record<string, DiscordProfile | null>>({});
  const [authVia, setAuthVia] = useState<"email" | "discord" | null>(null);
  const [isChangePwOpen, setIsChangePwOpen] = useState(false);
  const [changePw, setChangePw] = useState({ current: "", next: "", confirm: "" });
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [codes, setCodes] = useState<RedeemCode[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [streamerApps, setStreamerApps] = useState<StreamerApp[]>([]);
  const [familyApps, setFamilyApps] = useState<FamilyApp[]>([]);
  const [activeFamilies, setActiveFamilies] = useState<ActiveFamily[]>([]);
  const [whitelistApps, setWhitelistApps] = useState<WhitelistApp[]>([]);
  const [whitelistStaff, setWhitelistStaff] = useState<WhitelistStaffMember[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playersFetchedAt, setPlayersFetchedAt] = useState<number | null>(null);
  const [playersRefreshing, setPlayersRefreshing] = useState(false);
  // Player filters & pagination
  const [pSearch, setPSearch] = useState("");
  const [pSort, setPSort] = useState<"joined_desc" | "joined_asc" | "name_asc">("joined_desc");
  const [pJoinedWithin, setPJoinedWithin] = useState<"all" | "7" | "30" | "90">("all");
  const [pPage, setPPage] = useState(1);
  const PLAYERS_PER_PAGE = 50;
  const [selectedWhitelistApp, setSelectedWhitelistApp] = useState<WhitelistApp | null>(null);
  const [whitelistNotes, setWhitelistNotes] = useState("");
  const [interviewTab, setInterviewTab] = useState<InterviewSubTab>("details");
  const [scenarios, setScenarios] = useState<WhitelistScenario[]>([]);
  const [scenariosLoading, setScenariosLoading] = useState(false);
  const [scenarioVerdicts, setScenarioVerdicts] = useState<Record<string, boolean>>({});
  const [scenarioLang, setScenarioLang] = useState<ScenarioLang>("en");
  // Whitelist list filters
  const [wlSearch, setWlSearch] = useState("");
  const [wlStatusFilter, setWlStatusFilter] = useState<"all" | "pending" | "approved" | "rejected" | "shame">("all");
  const [wlFactionFilter, setWlFactionFilter] = useState<string>("all");
  // Whitelist audit logs
  const [wlLogs, setWlLogs] = useState<WhitelistLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<StreamerApp | null>(null);
  const [selectedFamilyApp, setSelectedFamilyApp] = useState<FamilyApp | null>(null);
  const [selectedActiveFamily, setSelectedActiveFamily] = useState<ActiveFamily | null>(null);
  const [error, setError] = useState("");
  const [newStaff, setNewStaff] = useState({ discord_id: "", discord_username: "", role: "member" as "supervisor" | "member" | "app_reviewer" });
  const [isStaffAddOpen, setIsStaffAddOpen] = useState(false);

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAdminAddOpen, setIsAdminAddOpen] = useState(false);
  const [isFamilyAddOpen, setIsFamilyAddOpen] = useState(false);
  const [isFamilyEditOpen, setIsFamilyEditOpen] = useState(false);
  const [newCode, setNewCode] = useState({ code: "", tier: "Gold", count: 0 });
  const [newAdmin, setNewAdmin] = useState({ email: "", password: "", name: "", role: "admin", discord_id: "" });
  const [newFamily, setNewFamily] = useState({ name: "", logo: "", description: "" });

  // Auth init: check for an admin session cookie, then fall back to Discord whitelist staff check
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/me");
        if (res.ok) {
          const data = await res.json();
          setEmail(data.email || "");
          setIsAuthorized(true);
          setAuthVia("email");
          const role = data.role || "admin";
          if (role === "admin") {
            setAuthMode("admin");
          } else if (role === "app_reviewer") {
            setWhitelistRole("app_reviewer");
            setAuthMode("app_reviewer");
            setActiveTab("applications");
          } else {
            // supervisor | member logging in by email/password
            setWhitelistRole(role);
            setAuthMode("whitelist_staff");
            setActiveTab("whitelist");
          }
          setAuthChecked(true);
          return;
        }
      } catch {
        /* not an admin — fall through to Discord staff check */
      }
      setAuthChecked(true);
    })();
  }, []);

  // Only run the Discord fallback when the admin-cookie check found nothing.
  // (Email-login supervisors/members/app_reviewers already have authMode set and
  // no Discord session — without this guard they'd be bounced to login in a loop.)
  useEffect(() => {
    if (!authChecked) return;
    if (authMode !== "none") return;
    if (sessionStatus === "loading") return;

    if (!session?.user) {
      window.location.href = "/admin/login";
      return;
    }

    fetch("/api/whitelist/my-role")
      .then(r => r.json())
      .then(({ role }) => {
        if (!role) {
          window.location.href = "/admin/login";
          return;
        }
        setWhitelistRole(role);
        setIsAuthorized(true);
        setAuthVia("discord");
        if (role === "app_reviewer") {
          setAuthMode("app_reviewer");
          setActiveTab("applications");
        } else {
          // supervisor | member → whitelist section
          setAuthMode("whitelist_staff");
          setActiveTab("whitelist");
        }
      });
  }, [authChecked, session, sessionStatus, authMode]);

  useEffect(() => {
    if (isAuthorized) fetchData();
  }, [activeTab, isAuthorized]);

  // Reset player pagination when filters change
  useEffect(() => { setPPage(1); }, [pSearch, pSort, pJoinedWithin]);

  // Load Discord profiles for operators (Staff Access tab) and whitelist staff
  useEffect(() => {
    if (activeTab === "admins") loadDiscordProfiles(adminUsers.map(a => a.discord_id));
    if (activeTab === "whitelist_staff") loadDiscordProfiles(whitelistStaff.map(s => s.discord_id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, adminUsers, whitelistStaff]);

  // Auto-load faction scenarios when entering the Step 2 (scenarios) sub-tab
  useEffect(() => {
    if (interviewTab === "scenarios" && selectedWhitelistApp && scenarios.length === 0 && !scenariosLoading) {
      loadScenarios(selectedWhitelistApp.faction_choice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewTab, selectedWhitelistApp]);

  // Admin auth now rides on an HttpOnly session cookie (sent automatically on
  // same-origin requests). Whitelist staff use their NextAuth Discord cookie.
  // No credentials are held in JS anymore — this returns no headers.
  const getAuthHeaders = (): Record<string, string> => ({});

  const fetchData = async () => {
    if (!isAuthorized) return;
    setLoading(true);

    const endpoints: Record<ActiveTab, string> = {
      overview:        "/api/admin/stats",
      codes:           "/api/admin/codes",
      admins:          "/api/admin/users",
      applications:    "/api/admin/applications",
      family:          "/api/admin/family-applications",
      active_families: "/api/admin/families",
      whitelist:       "/api/admin/whitelist",
      whitelist_staff: "/api/admin/whitelist-staff",
      players:         "/api/admin/players",
    };

    try {
      const res = await fetch(endpoints[activeTab], { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (activeTab === "overview")          setStats(data);
        else if (activeTab === "codes")        setCodes(data);
        else if (activeTab === "admins")       setAdminUsers(data);
        else if (activeTab === "applications") setStreamerApps(data);
        else if (activeTab === "family")       setFamilyApps(data);
        else if (activeTab === "active_families") setActiveFamilies(data);
        else if (activeTab === "whitelist")    setWhitelistApps(data);
        else if (activeTab === "whitelist_staff") setWhitelistStaff(data);
        else if (activeTab === "players") { setPlayers(data.players || []); setPlayersFetchedAt(data.fetchedAt || null); }
      } else if (res.status === 401) {
        // Only logout on actual auth failure
        window.location.href = "/admin/login";
      } else {
        toast.error(`Failed to load data (${res.status})`);
      }
    } catch (err) {
      toast.error("Failed to connect to HQ");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (changePw.next.length < 8) { toast.error("New password must be at least 8 characters."); return; }
    if (changePw.next !== changePw.confirm) { toast.error("Passwords do not match."); return; }
    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: changePw.current, newPassword: changePw.next }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Password updated.");
      setIsChangePwOpen(false);
      setChangePw({ current: "", next: "", confirm: "" });
    } else {
      toast.error(data.error || "Failed to update password.");
    }
  };

  const handleLogout = () => {
    if (authMode === "whitelist_staff") {
      signOut({ callbackUrl: "/" });
    } else {
      fetch("/api/admin/logout", { method: "POST" }).finally(() => {
        window.location.href = "/admin/login";
      });
    }
  };

  // Whitelist staff handlers
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/whitelist-staff", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(newStaff),
    });
    if (res.ok) {
      const data = await res.json();
      setWhitelistStaff(prev => [data, ...prev.filter(s => s.id !== data.id)]);
      setIsStaffAddOpen(false);
      setNewStaff({ discord_id: "", discord_username: "", role: "member" });
      toast.success("Staff member added");
    } else {
      toast.error("Failed to add staff");
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm("Remove this staff member?")) return;
    const res = await fetch(`/api/admin/whitelist-staff?id=${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      setWhitelistStaff(prev => prev.filter(s => s.id !== id));
      toast.success("Staff member removed");
    }
  };

  // Force-refresh the player list from Discord (bypasses the server cache)
  const refreshPlayers = async () => {
    setPlayersRefreshing(true);
    try {
      const res = await fetch("/api/admin/players?refresh=1", { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setPlayers(data.players || []);
        setPlayersFetchedAt(data.fetchedAt || null);
        toast.success("Player list refreshed");
      } else {
        toast.error("Failed to refresh players");
      }
    } catch {
      toast.error("Failed to refresh players");
    } finally {
      setPlayersRefreshing(false);
    }
  };

  // Fetch Discord profiles (name + avatar) for a set of IDs, caching results.
  const loadDiscordProfiles = async (ids: (string | null | undefined)[]) => {
    const unique = Array.from(new Set(ids.filter((x): x is string => !!x)));
    const missing = unique.filter(id => !(id in discordProfiles));
    if (missing.length === 0) return;
    const results = await Promise.all(
      missing.map(async (id) => {
        try {
          const res = await fetch(`/api/admin/discord-user?id=${id}`);
          if (res.ok) return [id, await res.json()] as const;
        } catch {}
        return [id, null] as const;
      })
    );
    setDiscordProfiles(prev => {
      const next = { ...prev };
      for (const [id, profile] of results) next[id] = profile;
      return next;
    });
  };

  // Fetch & open the audit logs panel (optionally scoped to one application)
  // Manually grant the Accepted Discord role to a passing candidate.
  const [grantingAccepted, setGrantingAccepted] = useState(false);
  const grantAcceptedRole = async (appId: string) => {
    setGrantingAccepted(true);
    try {
      const res = await fetch("/api/admin/whitelist/grant-accepted", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId }),
      });
      const data = await res.json();
      if (res.ok && data.granted) toast.success("Accepted role granted.");
      else if (res.ok && !data.granted) toast.error("Bot could not assign the role (check perms / hierarchy).");
      else toast.error(data.error || "Failed to grant role.");
    } catch {
      toast.error("Failed to grant role.");
    } finally {
      setGrantingAccepted(false);
    }
  };

  const openLogs = async (applicationId?: string) => {
    setShowLogs(true);
    setLogsLoading(true);
    try {
      const url = applicationId ? `/api/admin/whitelist-logs?application_id=${applicationId}` : "/api/admin/whitelist-logs";
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const logs: WhitelistLog[] = await res.json();
        setWlLogs(logs);
        loadDiscordProfiles(logs.map(l => l.actor_discord_id));
      } else toast.error("Failed to load logs");
    } catch {
      toast.error("Failed to load logs");
    } finally {
      setLogsLoading(false);
    }
  };

  // Open a candidate's interview view (resets sub-tab + scenario state)
  const openCandidate = (app: WhitelistApp) => {
    setSelectedWhitelistApp(app);
    setWhitelistNotes(app.admin_notes || "");
    setInterviewTab("details");
    setScenarios([]);
    setScenarioVerdicts({});
  };

  // Load 3 random scenarios matching the candidate's faction track
  const loadScenarios = async (faction: string) => {
    setScenariosLoading(true);
    try {
      const res = await fetch(`/api/admin/whitelist-scenarios?faction=${encodeURIComponent(faction)}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const all: WhitelistScenario[] = await res.json();
        // Pick 3 random scenarios from the matching track
        const picked = [...all].sort(() => Math.random() - 0.5).slice(0, 3);
        setScenarios(picked);
      } else {
        toast.error("Failed to load scenarios");
      }
    } catch {
      toast.error("Failed to load scenarios");
    } finally {
      setScenariosLoading(false);
    }
  };

  // Submit final verdict (approve / reject) from the interview view
  const submitWhitelistVerdict = async (status: "approved" | "rejected") => {
    if (!selectedWhitelistApp) return;
    const res = await fetch("/api/admin/whitelist", {
      method: "PATCH",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedWhitelistApp.id, status, admin_notes: whitelistNotes }),
    });
    if (res.ok) {
      toast.success(`Application ${status}`);
      setSelectedWhitelistApp(null);
      fetchData();
    } else {
      toast.error("Failed to submit verdict");
    }
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
      setNewAdmin({ email: "", password: "", name: "", role: "admin", discord_id: "" });
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
  const filteredFamily  = familyApps.filter(app => (app.family_name || '').toLowerCase().includes(search.toLowerCase()) || app.discord_id.toLowerCase().includes(search.toLowerCase()));
  const filteredActiveFamilies = activeFamilies.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  // Wall of Shame: candidates who FAILED the quiz (< 15/20) but an admin approved anyway
  const isShame = (a: WhitelistApp) => a.status === "approved" && (a.quiz_score ?? 20) < 15;
  const shameCount = whitelistApps.filter(isShame).length;

  // Whitelist applications filtered by search + status + faction
  const filteredWhitelist = whitelistApps.filter(a => {
    const q = wlSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      a.character_name?.toLowerCase().includes(q) ||
      a.discord_username?.toLowerCase().includes(q) ||
      a.discord_id?.toLowerCase().includes(q);
    const matchesStatus =
      wlStatusFilter === "all" ? true :
      wlStatusFilter === "shame" ? isShame(a) :
      a.status === wlStatusFilter;
    const matchesFaction = wlFactionFilter === "all" || a.faction_choice === wlFactionFilter;
    return matchesSearch && matchesStatus && matchesFaction;
  });

  // Unique faction values present in the data (for the filter dropdown)
  const wlFactions = Array.from(new Set(whitelistApps.map(a => a.faction_choice))).filter(Boolean);

  // Admins and all whitelist staff (supervisor + member) can issue verdicts
  const canVerdict = authMode === "admin" || authMode === "whitelist_staff";

  // Players: filter → sort → paginate
  const filteredPlayers = (() => {
    const q = pSearch.toLowerCase().trim();
    const cutoff = pJoinedWithin === "all" ? 0 : Date.now() - parseInt(pJoinedWithin) * 24 * 60 * 60 * 1000;
    let list = players.filter(p => {
      const matchesSearch = !q ||
        p.username?.toLowerCase().includes(q) ||
        p.global_name?.toLowerCase().includes(q) ||
        p.nickname?.toLowerCase().includes(q) ||
        p.id.includes(q);
      const matchesJoined = cutoff === 0 || (p.joined_at && new Date(p.joined_at).getTime() >= cutoff);
      return matchesSearch && matchesJoined;
    });
    list = [...list].sort((a, b) => {
      if (pSort === "name_asc") return (a.global_name || a.username).localeCompare(b.global_name || b.username);
      const ta = a.joined_at ? new Date(a.joined_at).getTime() : 0;
      const tb = b.joined_at ? new Date(b.joined_at).getTime() : 0;
      return pSort === "joined_asc" ? ta - tb : tb - ta;
    });
    return list;
  })();
  const playersTotalPages = Math.max(1, Math.ceil(filteredPlayers.length / PLAYERS_PER_PAGE));
  const playersPageClamped = Math.min(pPage, playersTotalPages);
  const paginatedPlayers = filteredPlayers.slice((playersPageClamped - 1) * PLAYERS_PER_PAGE, playersPageClamped * PLAYERS_PER_PAGE);

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
    overview:        "HQ OVERVIEW",
    codes:           "UNIT RECORDS",
    admins:          "STAFF BOARD",
    applications:    "CREATOR POOL",
    family:          "FAMILY ROSTER",
    active_families: "ACTIVE FAMILIES",
    whitelist:       "WHITELIST APPLICATIONS",
    whitelist_staff: "WHITELIST STAFF",
    players:         "WHITELISTED PLAYERS",
  };

  const pendingFamilyCount = familyApps.filter(a => a.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-amber-500/30">
      <div className="relative flex min-h-screen">
        
        {/* ── Sidebar ── */}
        <nav className="w-68 border-r border-[#222] bg-[#0d0d0d] flex flex-col p-6 hidden lg:flex">
          <div className="flex items-center gap-3 mb-10 text-amber-500"><Zap fill="currentColor" size={24} /><span className="font-black text-xl italic tracking-tighter text-white">EGA <span className="text-amber-500">HQ</span></span></div>
          <div className="space-y-2 mb-auto">
            {authMode === "whitelist_staff" ? (
              // Restricted nav for whitelist staff (supervisor / member)
              <>
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-600">Whitelist</div>
                <NavButton active={activeTab === "whitelist"} onClick={() => setActiveTab("whitelist")} icon={<Shield size={18} />} label="Applications" count={whitelistApps.filter(a => a.status === 'pending').length || undefined} />
              </>
            ) : authMode === "app_reviewer" ? (
              // Restricted nav for application reviewers (streamer + family)
              <>
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-600">Applications</div>
                <NavButton active={activeTab === "applications"} onClick={() => setActiveTab("applications")} icon={<Video size={18} />} label="Creator Pool" />
                <NavButton active={activeTab === "family"} onClick={() => setActiveTab("family")} icon={<Shield size={18} />} label="Family Roster" />
              </>
            ) : (
              // Full admin nav
              <>
                <NavButton active={activeTab === "overview"}      onClick={() => setActiveTab("overview")}      icon={<LayoutDashboard size={18} />} label="Operational Overview" />
                <div className="h-px bg-[#222] my-4" />
                <NavButton active={activeTab === "codes"}         onClick={() => setActiveTab("codes")}         icon={<Ticket size={18} />}          label="Unit Records" />
                <NavButton active={activeTab === "applications"}  onClick={() => setActiveTab("applications")}  icon={<Video size={18} />}            label="Creator Pool"   count={stats?.metrics.pendingApps} />
                <NavButton active={activeTab === "family"}        onClick={() => setActiveTab("family")}        icon={<Shield size={18} />}           label="Family Roster"  count={pendingFamilyCount || undefined} />
                <NavButton active={activeTab === "active_families"} onClick={() => setActiveTab("active_families")} icon={<Globe size={18} />}          label="Active Families" />
                <div className="h-px bg-[#222] my-4" />
                <NavButton active={activeTab === "whitelist"}      onClick={() => setActiveTab("whitelist")}      icon={<Shield size={18} />}           label="Whitelist Apps" count={whitelistApps.filter(a => a.status === 'pending').length || undefined} />
                <NavButton active={activeTab === "players"}        onClick={() => setActiveTab("players")}        icon={<Users size={18} />}            label="Players" />
                <NavButton active={activeTab === "whitelist_staff"} onClick={() => setActiveTab("whitelist_staff")} icon={<User size={18} />}           label="Whitelist Staff" />
                <div className="h-px bg-[#222] my-4" />
                <NavButton active={activeTab === "admins"}        onClick={() => setActiveTab("admins")}        icon={<Users size={18} />}            label="Staff Access" />
              </>
            )}
          </div>
          <div className="mt-10 pt-6 border-t border-[#222] space-y-3">
            {authVia === "email" && (
              <button onClick={() => setIsChangePwOpen(true)} className="text-gray-500 flex items-center gap-2 text-sm hover:text-amber-500 transition-colors">
                <Lock size={14} /> Change Password
              </button>
            )}
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
                {activeTab === "whitelist_staff" && <Button onClick={() => setIsStaffAddOpen(true)} className="bg-white text-black font-bold h-9 italic tracking-widest uppercase text-xs px-4">Add Staff</Button>}
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
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="h-[200px] w-full lg:col-span-2">
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
                        <div className="h-[200px] w-full lg:col-span-1 flex flex-col items-center justify-center">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Top Origins</p>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={stats.countryDistribution || []}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {(stats.countryDistribution || []).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={['#f59e0b', '#d97706', '#b45309', '#78350f', '#451a03'][index % 5]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{backgroundColor:'#111',border:'1px solid #333',borderRadius:'12px',fontSize:'11px'}} itemStyle={{color:'#fff',fontWeight:'bold'}} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
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
                              <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 text-[10px] font-black">{app.family_name?.[0]?.toUpperCase()}</div>
                              <div>
                                <p className="text-sm font-bold tracking-tight">{app.family_name}</p>
                                <p className="text-[10px] text-gray-600 font-mono">{app.family_nationality}</p>
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
                                      <div className="space-y-6 py-4 pr-3 animate-in fade-in overflow-y-auto max-h-[65vh] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/50 hover:[&::-webkit-scrollbar-thumb]:bg-amber-500/80 [&::-webkit-scrollbar-thumb]:rounded-full shadow-[inset_0_-30px_30px_-30px_rgba(0,0,0,0.8)]">
                                          {/* General Information */}
                                          <div>
                                            <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest italic mb-3">General Information</p>
                                            <div className="grid grid-cols-2 gap-4">
                                              <AppField label="In-Game Name & CID" value={selectedApp.ingame_name_cid} color="amber" />
                                              <AppField label="Discord ID" value={selectedApp.discord_id} mono />
                                              <AppField label="Email Address" value={selectedApp.email} />
                                              <AppField label="Primary Platform" value={selectedApp.platform} color="amber" />
                                              <AppField label="Followers Count" value={selectedApp.followers_count || '—'} />
                                              <AppField label="Applied" value={selectedApp.created_at ? new Date(selectedApp.created_at).toLocaleString() : '—'} />
                                            </div>
                                          </div>

                                          {/* RP Experience & Philosophy */}
                                          <div>
                                            <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest italic mb-3">RP Experience &amp; Philosophy</p>
                                            <div className="space-y-4">
                                              <AppField label="How long have you been roleplaying in GTA V?" value={selectedApp.rp_experience || '—'} />
                                              <div className="space-y-2">
                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic">The Ensemble Mindset</p>
                                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm italic text-gray-300 leading-relaxed font-serif whitespace-pre-wrap">&quot;{selectedApp.ensemble_mindset || '—'}&quot;</div>
                                              </div>
                                              <div className="space-y-2">
                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic">Strict RP Standards</p>
                                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm italic text-gray-300 leading-relaxed font-serif whitespace-pre-wrap">&quot;{selectedApp.strict_rp_standards || '—'}&quot;</div>
                                              </div>
                                              <AppField label="History (bans / warnings on other servers)" value={selectedApp.history_info || '—'} />
                                            </div>
                                          </div>

                                          {/* Technical & Content */}
                                          <div>
                                            <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest italic mb-3">Technical &amp; Content</p>
                                            <div className="grid grid-cols-2 gap-4">
                                              <AppField label="Weekly Stream Schedule" value={selectedApp.stream_schedule || '—'} />
                                              <AppField label="Privacy Comfort (screen hide)" value={selectedApp.privacy_comfort || '—'} color={selectedApp.privacy_comfort === 'Yes' ? 'amber' : 'white'} />
                                            </div>
                                          </div>

                                          {/* Action links */}
                                          <div className="grid grid-cols-2 gap-4 pt-4">
                                            <a href={selectedApp.channel_url} target="_blank" className="flex items-center justify-center gap-3 p-4 bg-purple-600 rounded-2xl text-xs font-black uppercase tracking-widest">Inspect Channel <ExternalLink size={16}/></a>
                                            <a href={selectedApp.sample_content} target="_blank" className="flex items-center justify-center gap-3 p-4 bg-blue-600 rounded-2xl text-xs font-black uppercase tracking-widest">Review Content <Video size={16}/></a>
                                          </div>
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
                        <TableHead>Family Name</TableHead>
                        <TableHead>Nationality</TableHead>
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
                          <TableCell><p className="font-bold text-sm tracking-tight">{app.family_name}</p></TableCell>
                          <TableCell className="text-gray-400 text-sm font-bold">{app.family_nationality}</TableCell>
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
                                    Family Review: {selectedFamilyApp?.family_name}
                                  </DialogTitle>
                                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest pt-1">Submitted {selectedFamilyApp && new Date(selectedFamilyApp.created_at).toLocaleString()}</p>
                                </DialogHeader>
                                {selectedFamilyApp && (
                                  <div className="space-y-6 py-4 pr-3 animate-in fade-in overflow-y-auto max-h-[65vh] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-orange-500/50 hover:[&::-webkit-scrollbar-thumb]:bg-orange-500/80 [&::-webkit-scrollbar-thumb]:rounded-full shadow-[inset_0_-30px_30px_-30px_rgba(0,0,0,0.8)]">
                                    <div className="grid grid-cols-2 gap-4">
                                      <AppField label="Family Name"    value={selectedFamilyApp.family_name} />
                                      <AppField label="Nationality"    value={selectedFamilyApp.family_nationality} color="amber" />
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic">Discord ID (Founder)</p>
                                      <DiscordUserBadge discordId={selectedFamilyApp.discord_id} role="Founder" />
                                    </div>
                                    {selectedFamilyApp.family_picture && (
                                      <div className="space-y-2">
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic">Family Logo</p>
                                        <img src={selectedFamilyApp.family_picture} alt="Family" className="w-24 h-24 object-cover rounded-xl border border-orange-500/20" />
                                      </div>
                                    )}
                                    <div className="space-y-2">
                                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic">Family Description</p>
                                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm text-gray-300 leading-relaxed">{selectedFamilyApp.family_description}</div>
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic">Family Goals</p>
                                      <div className="p-4 bg-white/5 rounded-2xl border border-orange-500/10 text-sm italic text-gray-300 leading-relaxed font-serif max-h-48 overflow-y-auto">"{selectedFamilyApp.family_goals}"</div>
                                    </div>
                                    {selectedFamilyApp.family_members && selectedFamilyApp.family_members.length > 0 && (
                                      <div className="space-y-2">
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic">Members List</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                          {selectedFamilyApp.family_members.map((m, i) => (
                                            <DiscordUserBadge key={i} discordId={m.discord_id} role={m.role} />
                                          ))}
                                        </div>
                                      </div>
                                    )}
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

            {/* TAB: WHITELIST */}
            {activeTab === "whitelist" && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4">
                {/* Stats row */}
                <div className={`grid grid-cols-2 ${authMode === "admin" ? "md:grid-cols-5" : "md:grid-cols-4"} gap-4 mb-2`}>
                  {(['pending','approved','rejected'] as const).map(s => (
                    <button key={s} onClick={() => setWlStatusFilter(wlStatusFilter === s ? 'all' : s)} className={`text-left bg-[#111] border rounded-xl p-4 flex items-center gap-3 transition-colors ${wlStatusFilter === s ? 'border-amber-500/50' : 'border-[#222] hover:border-[#333]'}`}>
                      <div className={`w-2 h-8 rounded-full ${s==='pending'?'bg-amber-500':s==='approved'?'bg-green-500':'bg-red-500'}`}/>
                      <div>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s}</p>
                        <p className="text-2xl font-black italic">{whitelistApps.filter(a=>a.status===s).length}</p>
                      </div>
                    </button>
                  ))}
                  {/* Wall of Shame — approved despite failing the quiz (super admin only) */}
                  {authMode === "admin" && (
                    <button onClick={() => setWlStatusFilter(wlStatusFilter === 'shame' ? 'all' : 'shame')} className={`text-left bg-gradient-to-br from-[#1a0d0d] to-[#111] border rounded-xl p-4 flex items-center gap-3 transition-colors ${wlStatusFilter === 'shame' ? 'border-orange-500/60' : 'border-orange-900/40 hover:border-orange-700/50'}`}>
                      <div className="w-2 h-8 rounded-full bg-orange-500"/>
                      <div>
                        <p className="text-[10px] text-orange-400/80 font-black uppercase tracking-widest flex items-center gap-1">🔥 Wall of Shame</p>
                        <p className="text-2xl font-black italic text-orange-400">{shameCount}</p>
                      </div>
                    </button>
                  )}
                  {/* Activity Logs — click to view full audit trail */}
                  <button onClick={() => openLogs()} className="text-left bg-gradient-to-br from-[#0d1420] to-[#111] border border-blue-900/40 hover:border-blue-700/50 rounded-xl p-4 flex items-center gap-3 transition-colors">
                    <div className="w-2 h-8 rounded-full bg-blue-500"/>
                    <div>
                      <p className="text-[10px] text-blue-400/80 font-black uppercase tracking-widest flex items-center gap-1"><Activity size={11}/> View Logs</p>
                      <p className="text-sm font-black italic text-blue-400 mt-1">Audit Trail</p>
                    </div>
                  </button>
                </div>

                {/* Advanced search & filters */}
                <Card className="bg-[#111] border-[#222] p-3 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      value={wlSearch}
                      onChange={e => setWlSearch(e.target.value)}
                      placeholder="Search by character name, Discord username, or ID..."
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <select
                    value={wlStatusFilter}
                    onChange={e => setWlStatusFilter(e.target.value as any)}
                    className="bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    {authMode === "admin" && <option value="shame">🔥 Wall of Shame</option>}
                  </select>
                  <select
                    value={wlFactionFilter}
                    onChange={e => setWlFactionFilter(e.target.value)}
                    className="bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none capitalize"
                  >
                    <option value="all">All Factions</option>
                    {wlFactions.map(f => (
                      <option key={f} value={f} className="capitalize">{f.replace('_',' ')}</option>
                    ))}
                  </select>
                  {(wlSearch || wlStatusFilter !== 'all' || wlFactionFilter !== 'all') && (
                    <Button size="sm" variant="outline" onClick={() => { setWlSearch(''); setWlStatusFilter('all'); setWlFactionFilter('all'); }} className="bg-transparent border-[#333] hover:bg-white/5 text-xs whitespace-nowrap">
                      Clear
                    </Button>
                  )}
                </Card>

                <div className="flex gap-4">
                  {/* Application list */}
                  <Card className="bg-[#111] border-[#222] flex-1 overflow-hidden">
                    <div className="p-4 border-b border-[#222]">
                      <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                        {filteredWhitelist.length} of {whitelistApps.length} Applications
                      </p>
                    </div>
                    <div className="divide-y divide-[#1a1a1a] max-h-[600px] overflow-y-auto">
                      {filteredWhitelist.length === 0 && (
                        <p className="p-6 text-center text-gray-600 text-sm italic">{whitelistApps.length === 0 ? 'No applications yet.' : 'No applications match your filters.'}</p>
                      )}
                      {filteredWhitelist.map(app => (
                        <button
                          key={app.id}
                          onClick={() => openCandidate(app)}
                          className={`w-full text-left p-4 hover:bg-white/5 transition-colors flex items-center gap-3 ${selectedWhitelistApp?.id === app.id ? 'bg-white/5' : ''}`}
                        >
                          {app.discord_avatar
                            ? <img src={app.discord_avatar} className="w-9 h-9 rounded-full" alt="" />
                            : <div className="w-9 h-9 rounded-full bg-[#222] flex items-center justify-center text-gray-500 text-xs font-black">{app.discord_username?.[0]?.toUpperCase()}</div>
                          }
                          <div className="flex-1 min-w-0">
                            <p className="font-black italic uppercase tracking-tight text-sm truncate flex items-center gap-1.5">
                              {app.character_name}
                              {authMode === "admin" && isShame(app) && <span title="Approved despite failing the quiz">🔥</span>}
                            </p>
                            <p className="text-[10px] text-gray-500 truncate">@{app.discord_username} · {app.faction_choice.replace('_',' ')}</p>
                            <p className="text-[9px] text-gray-600 truncate">{app.created_at ? new Date(app.created_at).toLocaleString() : ''}</p>
                          </div>
                          <div className={`text-[8px] font-black uppercase px-2 py-1 rounded border ${app.status==='pending'?'text-amber-500 border-amber-500/20 bg-amber-500/5':app.status==='approved'?'text-green-500 border-green-500/20 bg-green-500/5':'text-red-500 border-red-500/20 bg-red-500/5'}`}>{app.status}</div>
                        </button>
                      ))}
                    </div>
                  </Card>

                  {/* ── Interview Dashboard ── */}
                  {selectedWhitelistApp && (
                    <Card className="bg-[#111] border-[#222] flex-[2] min-w-0 overflow-hidden">
                      {/* Candidate header */}
                      <div className="p-4 border-b border-[#222] flex items-center gap-3">
                        <button
                          onClick={() => setSelectedWhitelistApp(null)}
                          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#333] text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-black uppercase tracking-widest"
                        >
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Back
                        </button>
                        {selectedWhitelistApp.discord_avatar
                          ? <img src={selectedWhitelistApp.discord_avatar} className="w-11 h-11 rounded-full" alt="" />
                          : <div className="w-11 h-11 rounded-full bg-[#222] flex items-center justify-center text-gray-400 font-black">{selectedWhitelistApp.discord_username?.[0]?.toUpperCase()}</div>
                        }
                        <div className="flex-1 min-w-0">
                          <p className="font-black italic uppercase tracking-tight text-lg">{selectedWhitelistApp.character_name}</p>
                          <p className="text-[11px] text-gray-500">@{selectedWhitelistApp.discord_username}</p>
                        </div>
                        {(() => {
                          const score = selectedWhitelistApp.quiz_score ?? 0;
                          const canGrant = score >= 15 && selectedWhitelistApp.status !== "rejected";
                          if (!canGrant) return null;
                          return (
                            <button
                              onClick={() => grantAcceptedRole(selectedWhitelistApp.id)}
                              disabled={grantingAccepted}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-green-500/40 text-green-400 hover:bg-green-500/10 transition-colors text-xs font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Grant the Discord Accepted role to this candidate"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" /> {grantingAccepted ? "Granting..." : "Grant Accepted"}
                            </button>
                          );
                        })()}
                        <button
                          onClick={() => openLogs(selectedWhitelistApp.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-900/40 text-blue-400 hover:bg-blue-500/10 transition-colors text-xs font-black uppercase tracking-widest"
                        >
                          <Activity className="w-3.5 h-3.5" /> Logs
                        </button>
                        <div className={`text-[9px] font-black uppercase px-3 py-1.5 rounded border ${selectedWhitelistApp.status==='pending'?'text-amber-500 border-amber-500/20 bg-amber-500/5':selectedWhitelistApp.status==='approved'?'text-green-500 border-green-500/20 bg-green-500/5':'text-red-500 border-red-500/20 bg-red-500/5'}`}>{selectedWhitelistApp.status}</div>
                      </div>

                      {/* Sub-tab nav */}
                      <div className="flex border-b border-[#222] px-2">
                        {([
                          { key: 'details', label: '👤 Candidate Details' },
                          { key: 'quiz', label: '📊 Quiz Results' },
                          { key: 'scenarios', label: '📋 Step 2 — Scenarios' },
                        ] as const).map(t => (
                          <button
                            key={t.key}
                            onClick={() => setInterviewTab(t.key)}
                            className={`px-4 py-3 text-xs font-black uppercase tracking-widest transition-colors border-b-2 -mb-px ${interviewTab === t.key ? 'text-amber-500 border-amber-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      <div className="p-5 space-y-4 max-h-[560px] overflow-y-auto">

                        {/* ── SUB-TAB: CANDIDATE DETAILS ── */}
                        {interviewTab === 'details' && (
                          <>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Faction</p>
                                <p className="text-xs font-bold mt-0.5 capitalize">{selectedWhitelistApp.faction_choice.replace('_',' ')}</p>
                              </div>
                              {(() => {
                                const score = selectedWhitelistApp.quiz_score ?? selectedWhitelistApp.quiz_details?.filter(q => q.is_correct).length;
                                const passed = score != null && score >= 15;
                                return (
                                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Quiz Score</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <p className="text-xs font-bold">{score ?? 'N/A'} / 20</p>
                                      {score != null && (
                                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${passed ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                                          {passed ? 'Pass' : 'Fail'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}
                              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Submitted</p>
                                <p className="text-xs font-bold mt-0.5">{selectedWhitelistApp.created_at ? new Date(selectedWhitelistApp.created_at).toLocaleString() : '—'}</p>
                              </div>
                              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Tab-outs</p>
                                <p className={`text-xs font-bold mt-0.5 ${selectedWhitelistApp.tab_out_count > 2 ? 'text-red-400' : 'text-white'}`}>{selectedWhitelistApp.tab_out_count}</p>
                              </div>
                              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Paste Events</p>
                                <p className={`text-xs font-bold mt-0.5 ${selectedWhitelistApp.paste_count > 0 ? 'text-amber-400' : 'text-white'}`}>{selectedWhitelistApp.paste_count}</p>
                              </div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Backstory & Background</p>
                              <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedWhitelistApp.character_backstory}</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Narrative Portfolio</p>
                              <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedWhitelistApp.experience_portfolio}</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Traits & Flaws Exploit Plan</p>
                              <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedWhitelistApp.traits_flaws}</p>
                            </div>
                          </>
                        )}

                        {/* ── SUB-TAB: QUIZ RESULTS ── */}
                        {interviewTab === 'quiz' && (
                          selectedWhitelistApp.quiz_details && selectedWhitelistApp.quiz_details.length > 0 ? (
                            <>
                              {(() => {
                                const correct = selectedWhitelistApp.quiz_details.filter(q => q.is_correct).length;
                                const passed = correct >= 15;
                                return (
                                  <div className={`flex items-center justify-between p-3 rounded-xl border ${passed ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                    <div className="flex items-center gap-3">
                                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total Score</p>
                                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${passed ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                                        {passed ? '✓ Passed' : '✗ Failed'} · need 15/20
                                      </span>
                                    </div>
                                    <p className={`text-lg font-black italic ${passed ? 'text-green-400' : 'text-red-400'}`}>
                                      {correct}/{selectedWhitelistApp.quiz_details.length}
                                    </p>
                                  </div>
                                );
                              })()}
                              <div className="space-y-2">
                                {selectedWhitelistApp.quiz_details.map((q, i) => {
                                  const givenOption = q.options.find(o => o.value === q.given_answer);
                                  const correctOption = q.options.find(o => o.value === q.correct_answer);
                                  return (
                                    <div key={q.id} className={`p-3 rounded-xl border text-xs ${q.is_correct ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                                      <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">{q.category_name} · Q{i + 1}</p>
                                      <p className="text-gray-200 mb-2 leading-snug">{q.question_text}</p>
                                      <div className={`flex items-start gap-1.5 ${q.is_correct ? 'text-green-400' : 'text-red-400'}`}>
                                        <span className="font-black mt-0.5">{q.is_correct ? '✓' : '✗'}</span>
                                        {q.given_answer
                                          ? <span><span className="font-black">{q.given_answer}.</span> {givenOption?.text}</span>
                                          : <span className="italic text-gray-500">No answer (ran out of time)</span>}
                                      </div>
                                      {!q.is_correct && (
                                        <div className="flex items-start gap-1.5 text-green-400 mt-1">
                                          <span className="font-black mt-0.5">→</span>
                                          <span className="text-[10px]"><span className="font-black">{q.correct_answer}.</span> {correctOption?.text}</span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          ) : (
                            <p className="text-center text-gray-600 text-sm italic py-10">No quiz answers recorded.</p>
                          )
                        )}

                        {/* ── SUB-TAB: STEP 2 — SCENARIO ENGINE ── */}
                        {interviewTab === 'scenarios' && (
                          <>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="inline-block text-[9px] font-black uppercase tracking-widest bg-amber-500/15 text-amber-500 px-2 py-1 rounded mb-2">Step 2</div>
                                <p className="text-xs text-gray-400 leading-relaxed max-w-md">
                                  3 random scenarios from the <span className="text-amber-500 font-bold">{scenarios[0]?.track_name || 'matching'}</span> track. Read aloud and evaluate the candidate's rule alignment.
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Language toggle */}
                                <div className="flex rounded-lg border border-[#333] overflow-hidden">
                                  <button
                                    onClick={() => setScenarioLang('en')}
                                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${scenarioLang === 'en' ? 'bg-amber-500 text-black' : 'bg-transparent text-gray-400 hover:text-white'}`}
                                  >EN</button>
                                  <button
                                    onClick={() => setScenarioLang('tn')}
                                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${scenarioLang === 'tn' ? 'bg-amber-500 text-black' : 'bg-transparent text-gray-400 hover:text-white'}`}
                                  >TN 🇹🇳</button>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => { setScenarios([]); loadScenarios(selectedWhitelistApp.faction_choice); }} className="bg-transparent border-[#333] hover:bg-white/5 text-xs">
                                  <RefreshCcw className={`w-3 h-3 mr-1.5 ${scenariosLoading ? 'animate-spin' : ''}`} /> Reroll
                                </Button>
                              </div>
                            </div>

                            {scenariosLoading && (
                              <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
                            )}

                            {!scenariosLoading && scenarios.length === 0 && (
                              <p className="text-center text-gray-600 text-sm italic py-10">No scenarios found for this faction track.</p>
                            )}

                            {!scenariosLoading && scenarios.map((s, idx) => {
                              const verdict = scenarioVerdicts[s.id];
                              // Use Tunisian if selected and available, else fall back to English
                              const tn = scenarioLang === 'tn';
                              const title = (tn && s.title_tn) || s.title;
                              const text = (tn && s.scenario_text_tn) || s.scenario_text;
                              const rules = (tn && s.targeted_rules_tn) || s.targeted_rules;
                              const fail = (tn && s.fail_criteria_tn) || s.fail_criteria;
                              const pass = (tn && s.pass_criteria_tn) || s.pass_criteria;
                              return (
                                <div key={s.id} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                                  <p className="font-black italic uppercase tracking-tight text-sm text-amber-500">Scenario {idx + 1}: {title}</p>
                                  <p className="text-xs text-gray-200 leading-relaxed"><span className="font-black text-gray-400">Read Aloud:</span> &quot;{text}&quot;</p>
                                  <div className="text-[11px] space-y-1 border-t border-[#222] pt-2">
                                    <p><span className="text-amber-500 font-bold">Targeted Rules:</span> <span className="text-gray-400">{rules}</span></p>
                                    <p><span className="text-red-400 font-bold">Fail Criteria:</span> <span className="text-gray-400">{fail}</span></p>
                                    <p><span className="text-green-400 font-bold">Pass Criteria:</span> <span className="text-gray-400">{pass}</span></p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <button
                                      onClick={() => setScenarioVerdicts(p => ({ ...p, [s.id]: true }))}
                                      className={`py-2 rounded-lg text-[11px] font-black uppercase tracking-widest border transition-colors ${verdict === true ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'bg-transparent text-gray-500 border-[#333] hover:border-green-500/30'}`}
                                    >✔ Pass</button>
                                    <button
                                      onClick={() => setScenarioVerdicts(p => ({ ...p, [s.id]: false }))}
                                      className={`py-2 rounded-lg text-[11px] font-black uppercase tracking-widest border transition-colors ${verdict === false ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-transparent text-gray-500 border-[#333] hover:border-red-500/30'}`}
                                    >✖ Fail</button>
                                  </div>
                                </div>
                              );
                            })}
                          </>
                        )}

                        {/* ── Final Verdict — supervisors & admins only; members are review-only ── */}
                        {canVerdict ? (
                          <div className="border-t border-[#222] pt-4 space-y-3">
                            <div className="inline-block text-[9px] font-black uppercase tracking-widest bg-amber-500/15 text-amber-500 px-2 py-1 rounded">Final Verdict</div>
                            <textarea
                              rows={3}
                              value={whitelistNotes}
                              onChange={e => setWhitelistNotes(e.target.value)}
                              placeholder="Interviewer summary notes — communication, mic quality, rule alignment..."
                              className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl p-3 text-xs text-white focus:border-amber-500 focus:outline-none resize-none"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => submitWhitelistVerdict('approved')}
                                className="py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
                              >✓ Approve & Whitelist</button>
                              <button
                                onClick={() => submitWhitelistVerdict('rejected')}
                                className="py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
                              >✗ Reject Applicant</button>
                            </div>
                          </div>
                        ) : (
                          <div className="border-t border-[#222] pt-4">
                            <p className="text-center text-[11px] text-gray-500 italic py-2">
                              Review-only access — only supervisors can issue a verdict.
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Whitelist Audit Logs Dialog */}
            <Dialog open={showLogs} onOpenChange={setShowLogs}>
              <DialogContent className="bg-[#111] border-[#333] text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-black italic tracking-tighter uppercase flex items-center gap-2"><Activity size={18} className="text-blue-400" /> Whitelist Audit Logs</DialogTitle>
                  <DialogDescription className="text-gray-500">Every approve / reject action and the staff member who made it.</DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
                  {logsLoading && (
                    <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
                  )}
                  {!logsLoading && wlLogs.length === 0 && (
                    <p className="text-center text-gray-600 text-sm italic py-10">No log entries yet.</p>
                  )}
                  {!logsLoading && wlLogs.map(log => (
                    <div key={log.id} className={`p-3 rounded-xl border ${log.action === 'approved' ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${log.action === 'approved' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                            {log.action === 'approved' ? '✓ Approved' : '✗ Rejected'}
                          </span>
                          <span className="text-sm font-black italic uppercase tracking-tight">{log.candidate_name}</span>
                          <span className="text-[10px] text-gray-500">@{log.candidate_discord}</span>
                        </div>
                        <span className="text-[10px] text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-gray-500">by</span>
                        {(() => { const dp = log.actor_discord_id ? discordProfiles[log.actor_discord_id] : null; return dp?.avatar
                          ? <img src={dp.avatar} className="w-5 h-5 rounded-full" alt="" />
                          : null; })()}
                        {(() => { const dp = log.actor_discord_id ? discordProfiles[log.actor_discord_id] : null; return dp
                          ? <span className="font-bold text-blue-400">{dp.global_name || dp.username}</span>
                          : null; })()}
                        <span className={`font-bold ${log.actor_type === 'admin' ? 'text-amber-400' : 'text-blue-400'}`}>{log.actor_name}</span>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${log.actor_type === 'admin' ? 'bg-amber-500/15 text-amber-400' : 'bg-blue-500/15 text-blue-400'}`}>{log.actor_type}</span>
                      </div>
                      {log.notes && <p className="text-[11px] text-gray-400 mt-1.5 border-t border-[#222] pt-1.5 italic">&quot;{log.notes}&quot;</p>}
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            {/* TAB: PLAYERS */}
            {activeTab === "players" && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4">
                <Card className="bg-[#111] border-[#222] p-4 flex items-center gap-3">
                  <div className="w-2 h-8 rounded-full bg-green-500" />
                  <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Whitelisted Players</p>
                    <p className="text-2xl font-black italic">{players.length}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    {playersFetchedAt && (
                      <p className="text-[10px] text-gray-600 italic">Updated {new Date(playersFetchedAt).toLocaleTimeString()}</p>
                    )}
                    <Button size="sm" variant="outline" onClick={refreshPlayers} disabled={playersRefreshing} className="bg-transparent border-[#333] hover:bg-white/5 text-xs">
                      <RefreshCcw className={`w-3 h-3 mr-1.5 ${playersRefreshing ? 'animate-spin' : ''}`} /> Refresh from Discord
                    </Button>
                  </div>
                </Card>

                {/* Filters */}
                <Card className="bg-[#111] border-[#222] p-3 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      value={pSearch}
                      onChange={e => setPSearch(e.target.value)}
                      placeholder="Search by name, username, or Discord ID..."
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <select value={pJoinedWithin} onChange={e => setPJoinedWithin(e.target.value as any)} className="bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none">
                    <option value="all">Joined: Any time</option>
                    <option value="7">Joined: Last 7 days</option>
                    <option value="30">Joined: Last 30 days</option>
                    <option value="90">Joined: Last 90 days</option>
                  </select>
                  <select value={pSort} onChange={e => setPSort(e.target.value as any)} className="bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none">
                    <option value="joined_desc">Newest first</option>
                    <option value="joined_asc">Oldest first</option>
                    <option value="name_asc">Name (A–Z)</option>
                  </select>
                  {(pSearch || pJoinedWithin !== 'all' || pSort !== 'joined_desc') && (
                    <Button size="sm" variant="outline" onClick={() => { setPSearch(''); setPJoinedWithin('all'); setPSort('joined_desc'); }} className="bg-transparent border-[#333] hover:bg-white/5 text-xs whitespace-nowrap">Clear</Button>
                  )}
                </Card>

                <Card className="bg-[#111] border-[#222] overflow-hidden">
                  <div className="p-3 border-b border-[#222] flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-500">{filteredPlayers.length} of {players.length} Players</p>
                  </div>
                  <Table>
                    <TableHeader className="bg-[#1a1a1a]">
                      <TableRow className="border-[#222]">
                        <TableHead>Player</TableHead>
                        <TableHead>Discord ID</TableHead>
                        <TableHead>Joined Server</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPlayers.map(p => (
                        <TableRow key={p.id} className="border-[#222] hover:bg-white/[0.02]">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {p.avatar
                                ? <img src={p.avatar} className="w-8 h-8 rounded-full" alt="" loading="lazy" />
                                : <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-black">{(p.global_name || p.username)[0]?.toUpperCase()}</div>
                              }
                              <div>
                                <p className="font-medium">{p.nickname || p.global_name || p.username}</p>
                                <p className="text-[10px] text-gray-500">@{p.username}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-400 font-mono text-xs">{p.id}</TableCell>
                          <TableCell className="text-gray-500 text-xs">{p.joined_at ? new Date(p.joined_at).toLocaleDateString() : '—'}</TableCell>
                        </TableRow>
                      ))}
                      {filteredPlayers.length === 0 && (
                        <TableRow><TableCell colSpan={3} className="text-center text-gray-600 py-10">{players.length === 0 ? 'No whitelisted players found. (Check that the bot has the Server Members Intent enabled.)' : 'No players match your filters.'}</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {playersTotalPages > 1 && (
                    <div className="p-3 border-t border-[#222] flex items-center justify-between">
                      <p className="text-[10px] text-gray-600">Page {playersPageClamped} of {playersTotalPages}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" disabled={playersPageClamped <= 1} onClick={() => setPPage(p => Math.max(1, p - 1))} className="bg-transparent border-[#333] hover:bg-white/5 text-xs">Prev</Button>
                        <Button size="sm" variant="outline" disabled={playersPageClamped >= playersTotalPages} onClick={() => setPPage(p => p + 1)} className="bg-transparent border-[#333] hover:bg-white/5 text-xs">Next</Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* TAB: WHITELIST STAFF */}
            {activeTab === "whitelist_staff" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4">
                <Card className="bg-[#111] border-[#222] overflow-hidden">
                  <Table>
                    <TableHeader className="bg-[#1a1a1a]">
                      <TableRow className="border-[#222]">
                        <TableHead>Member</TableHead>
                        <TableHead>Discord ID</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead className="text-right">Remove</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {whitelistStaff.map(member => (
                        <TableRow key={member.id} className="border-[#222] hover:bg-white/[0.02]">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {member.discord_avatar
                                ? <img src={member.discord_avatar} className="w-8 h-8 rounded-full" alt="" />
                                : <div className="w-8 h-8 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center"><User size={14} className="text-[#8b5cf6]" /></div>
                              }
                              <span className="font-medium">{member.discord_username}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-400 font-mono text-xs">{member.discord_id}</TableCell>
                          <TableCell>
                            <Badge className={member.role === "supervisor"
                              ? "bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/30 uppercase text-[10px]"
                              : "bg-blue-500/20 text-blue-400 border-blue-500/30 uppercase text-[10px]"}>
                              {member.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-500 text-xs">{new Date(member.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteStaff(member.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                              <Trash2 size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {whitelistStaff.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center text-gray-600 py-10">No whitelist staff added yet</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Card>

                {/* Add Staff Dialog */}
                <Dialog open={isStaffAddOpen} onOpenChange={setIsStaffAddOpen}>
                  <DialogContent className="bg-[#111] border-[#333] text-white">
                    <DialogHeader>
                      <DialogTitle className="font-black italic tracking-tighter uppercase">Add Whitelist Staff</DialogTitle>
                      <DialogDescription className="text-gray-500">Grant a Discord user access to the whitelist section.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddStaff} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-gray-400 text-xs uppercase tracking-widest">Discord ID</Label>
                        <Input value={newStaff.discord_id} onChange={e => setNewStaff(p => ({ ...p, discord_id: e.target.value }))} placeholder="123456789012345678" className="bg-[#0a0a0a] border-[#333] text-white" required />
                        <p className="text-[10px] text-gray-600">Right-click user in Discord → Copy User ID (enable Developer Mode first)</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-400 text-xs uppercase tracking-widest">Username</Label>
                        <Input value={newStaff.discord_username} onChange={e => setNewStaff(p => ({ ...p, discord_username: e.target.value }))} placeholder="username" className="bg-[#0a0a0a] border-[#333] text-white" required />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-400 text-xs uppercase tracking-widest">Role</Label>
                        <select value={newStaff.role} onChange={e => setNewStaff(p => ({ ...p, role: e.target.value as any }))} className="w-full bg-[#0a0a0a] border border-[#333] text-white rounded-md px-3 py-2 text-sm">
                          <option value="member">WL Member — review only (no verdict)</option>
                          <option value="supervisor">WL Supervisor — can approve & reject</option>
                          <option value="app_reviewer">App Reviewer — streamer & family apps only</option>
                        </select>
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold uppercase tracking-widest text-xs">Add Staff Member</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* TAB: ADMINS */}
            {activeTab === "admins" && (
                <Card className="bg-[#111] border-[#222] overflow-hidden animate-in slide-in-from-bottom-4">
                    <Table>
                        <TableHeader className="bg-[#1a1a1a]"><TableRow className="border-[#222]"><TableHead>Operator</TableHead><TableHead>HQ Email</TableHead><TableHead>Role</TableHead><TableHead>Discord ID</TableHead><TableHead className="text-right">Revoke Access</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {filteredAdmins.map(admin => {
                                const dp = admin.discord_id ? discordProfiles[admin.discord_id] : null;
                                return (
                                <TableRow key={admin.id} className="border-[#222] hover:bg-white/5 transition-colors">
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        {dp?.avatar
                                          ? <img src={dp.avatar} className="w-8 h-8 rounded-full" alt="" />
                                          : <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-gray-500 text-xs font-black">{(admin.name || admin.email)[0]?.toUpperCase()}</div>}
                                        <div>
                                          <p className="font-black italic uppercase tracking-tighter">{admin.name || "UNIDENTIFIED"}</p>
                                          {dp && <p className="text-[10px] text-gray-500 not-italic">{dp.global_name || dp.username} · @{dp.username}</p>}
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-gray-400 font-mono text-xs italic">{admin.email}</TableCell>
                                    <TableCell><Badge className={`uppercase text-[9px] border-none ${(admin.role || 'admin') === 'admin' ? 'bg-amber-500/15 text-amber-400' : 'bg-blue-500/15 text-blue-400'}`}>{admin.role || 'admin'}</Badge></TableCell>
                                    <TableCell className="text-gray-500 font-mono text-xs">{admin.discord_id || '—'}</TableCell>
                                    <TableCell className="text-right">{admin.email !== "admin@ega.com" && <Button variant="ghost" size="icon" onClick={() => handleDeleteAdmin(admin.id)} className="text-red-500 hover:scale-125 transition-transform"><Trash2 size={16} /></Button>}</TableCell>
                                </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Card>
            )}
          </div>
        </main>
      </div>

      {/* ── Modals ── */}
      <Dialog open={isChangePwOpen} onOpenChange={setIsChangePwOpen}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-white">
          <DialogHeader><DialogTitle className="font-black italic text-xl uppercase tracking-tighter">Change Password</DialogTitle></DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-5 pt-4">
            <div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black italic">Current Password</Label><Input type="password" value={changePw.current} onChange={(e) => setChangePw({ ...changePw, current: e.target.value })} className="bg-[#111] border-[#222] h-12" required /></div>
            <div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black italic">New Password</Label><Input type="password" value={changePw.next} onChange={(e) => setChangePw({ ...changePw, next: e.target.value })} className="bg-[#111] border-[#222] h-12" required /></div>
            <div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black italic">Confirm New Password</Label><Input type="password" value={changePw.confirm} onChange={(e) => setChangePw({ ...changePw, confirm: e.target.value })} className="bg-[#111] border-[#222] h-12" required /></div>
            <Button type="submit" className="w-full bg-amber-500 text-black font-black uppercase tracking-widest h-12 rounded-2xl">Update Password</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}><DialogContent className="bg-[#0a0a0a] border-[#222] text-white"><DialogHeader><DialogTitle className="font-black italic text-xl uppercase tracking-tighter">Initialize Unit Rollout</DialogTitle></DialogHeader><form onSubmit={handleAddCode} className="space-y-6 pt-6"><div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black tracking-widest italic">Product Tier</Label><select value={newCode.tier} onChange={(e) => setNewCode({...newCode, tier: e.target.value})} className="w-full bg-[#111] border-[#222] rounded-2xl p-4 text-sm font-bold focus:ring-1 focus:ring-amber-500"><option>Bronze</option><option>Silver</option><option>Gold</option><option>Platinum</option><option>Ultimate</option></select></div><div className="grid grid-cols-2 gap-4"><div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black italic">Quantity</Label><Input type="number" min="0" placeholder="0 = Single" onChange={(e) => setNewCode({...newCode, count: parseInt(e.target.value) || 0})} className="bg-[#111] border-[#222] h-14 font-black" /></div><div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black italic">Prefix</Label><Input placeholder="EGA" value={newCode.code} onChange={(e) => setNewCode({...newCode, code: e.target.value})} className="bg-[#111] border-[#222] h-14 font-black uppercase" required={!newCode.count}/></div></div><Button type="submit" className="w-full bg-amber-500 text-black font-black uppercase tracking-widest h-14 rounded-2xl shadow-xl shadow-amber-900/10">Authorize Deployment</Button></form></DialogContent></Dialog>
      <Dialog open={isAdminAddOpen} onOpenChange={setIsAdminAddOpen}><DialogContent className="bg-[#0a0a0a] border-[#222] text-white"><DialogHeader><DialogTitle className="font-black italic text-xl uppercase tracking-tighter">Onboard New Operator</DialogTitle></DialogHeader><form onSubmit={handleAddAdmin} className="space-y-6 pt-6"><div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black italic">Operator ID Name</Label><Input placeholder="James" value={newAdmin.name} onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})} className="bg-[#111] border-[#222] h-14 font-bold" /></div><div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black italic">Secure System Email</Label><Input type="email" placeholder="staff@ega.com" value={newAdmin.email} onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})} className="bg-[#111] border-[#222] h-14 font-bold" required /></div><div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black italic">Access Token</Label><Input type="password" placeholder="••••••••" value={newAdmin.password} onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})} className="bg-[#111] border-[#222] h-14 font-bold" required /></div><div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black italic">Role</Label><select value={newAdmin.role} onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})} className="w-full bg-[#111] border border-[#222] rounded-2xl p-4 text-sm font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none"><option value="admin">Super Admin — full access</option><option value="supervisor">WL Supervisor — approve & reject</option><option value="member">WL Member — review only</option><option value="app_reviewer">App Reviewer — streamer & family apps</option></select></div><div className="space-y-1"><Label className="text-gray-500 text-[10px] uppercase font-black italic">Discord ID</Label><Input type="text" inputMode="numeric" autoComplete="off" placeholder="123456789012345678" value={newAdmin.discord_id} onChange={(e) => setNewAdmin({...newAdmin, discord_id: e.target.value})} className="bg-[#111] border-[#222] h-14 font-mono" /></div><Button type="submit" className="w-full bg-amber-500 text-black font-black uppercase tracking-widest h-14 rounded-2xl shadow-xl shadow-amber-900/10">Synchronize Clearance</Button></form></DialogContent></Dialog>
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

function DiscordUserBadge({ discordId, role }: { discordId: string, role?: string }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!discordId) return;
    fetch(`/api/admin/discord-user?id=${discordId}`)
      .then(res => res.ok ? res.json() : null)
      .then(setData)
      .catch(() => {});
  }, [discordId]);

  return (
    <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5">
      <div className="relative shrink-0">
        {data?.avatar ? (
          <img src={data.avatar} className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-500/30" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 text-xs font-black">
            ?
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        {role && <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">{role}</span>}
        <p className="text-sm font-bold tracking-tight text-gray-200 truncate">
          {data?.global_name || data?.username || <span className="animate-pulse bg-white/10 text-transparent rounded w-16 h-4 inline-block" />}
        </p>
        <p className="text-[10px] text-gray-600 font-mono italic truncate">{discordId}</p>
      </div>
    </div>
  );
}
