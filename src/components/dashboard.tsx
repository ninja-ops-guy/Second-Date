"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  CreditCard,
  History,
  LogOut,
  Pencil,
  Plus,
  Printer,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Brand } from "@/components/brand";
import {
  CATEGORIES,
  categoryTone,
  daysLeft,
  endDate,
  formatDate,
  formatShortDate,
  itemEmoji,
  remainingLabel,
  todayISO,
} from "@/lib/product";

const REMINDER_OPTIONS = [1, 2, 3, 7] as const;

type User = {
  id: string;
  email: string | null;
  plan: string;
  subscriptionStatus: string | null;
  reminderEmailEnabled: boolean;
  reminderLeadDays: number;
};

type Item = {
  id: string;
  userId: string;
  name: string;
  category: string;
  openedAt: string;
  useWithinDays: number;
  note: string;
  status: string;
  isExample: boolean;
  completedAt: string | null;
  createdAt: string;
};

type Bootstrap = { user: User; items: Item[]; limit: number };
type ItemDraft = { name: string; category: string; openedAt: string; useWithinDays: number; note: string };

const emptyDraft = (): ItemDraft => ({ name: "", category: "Food", openedAt: todayISO(), useWithinDays: 7, note: "" });

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data as T;
}

export function Dashboard() {
  const [data, setData] = useState<Bootstrap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [tab, setTab] = useState<"active" | "history">("active");
  const [search, setSearch] = useState("");
  const [itemModal, setItemModal] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [draft, setDraft] = useState<ItemDraft>(emptyDraft());
  const [authModal, setAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const next = await requestJson<Bootstrap>("/api/bootstrap");
      setData(next);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load your space.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    requestJson<Bootstrap>("/api/bootstrap")
      .then((next) => {
        if (cancelled) return;
        setData(next);
        setError("");
        setLoading(false);
        const params = new URLSearchParams(window.location.search);
        if (params.get("signin") === "1") { setAuthMode("login"); setAuthModal(true); }
        if (params.get("upgrade")) setUpgradeModal(true);
        if (params.get("checkout") === "success" && params.get("session_id")) {
          requestJson<{ plan: string }>(`/api/billing/verify?session_id=${encodeURIComponent(params.get("session_id")!)}`)
            .then(() => { if (!cancelled) { setToast("Welcome to Plus ✦"); void load(); } })
            .catch((cause) => { if (!cancelled) setToast(cause instanceof Error ? cause.message : "Checkout is still syncing."); });
        }
      })
      .catch((cause) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Could not load your space.");
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const active = useMemo(() => (data?.items ?? []).filter((item) => item.status === "active").sort((a, b) => daysLeft(a.openedAt, a.useWithinDays) - daysLeft(b.openedAt, b.useWithinDays)), [data]);
  const history = useMemo(() => (data?.items ?? []).filter((item) => item.status !== "active"), [data]);
  const soon = active.filter((item) => daysLeft(item.openedAt, item.useWithinDays) <= 3).length;
  const used = history.filter((item) => item.status === "used").length;
  const discarded = history.filter((item) => item.status === "discarded").length;
  const realActiveCount = active.filter((item) => !item.isExample).length;
  const visible = (tab === "active" ? active : history).filter((item) => item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase()));

  const showToast = (message: string) => setToast(message);
  const openNew = () => { setEditing(null); setDraft(emptyDraft()); setItemModal(true); };
  const openEdit = (item: Item) => { setEditing(item); setDraft({ name: item.name, category: item.category, openedAt: item.openedAt, useWithinDays: item.useWithinDays, note: item.note }); setItemModal(true); };

  async function saveItem(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const path = editing ? `/api/items/${editing.id}` : "/api/items";
      await requestJson(path, { method: editing ? "PATCH" : "POST", body: JSON.stringify(draft) });
      setItemModal(false); setEditing(null); showToast(editing ? "Updated." : "Added to your space."); await load();
    } catch (cause) { showToast(cause instanceof Error ? cause.message : "Could not save the item."); }
    finally { setBusy(false); }
  }

  async function updateStatus(item: Item, status: "used" | "discarded") {
    try {
      await requestJson(`/api/items/${item.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      showToast(status === "used" ? "Nice — another thing used up ✦" : "Marked discarded."); await load();
    } catch (cause) { showToast(cause instanceof Error ? cause.message : "Could not update the item."); }
  }

  async function removeItem(item: Item) {
    if (!window.confirm(`Remove ${item.name}?`)) return;
    try { await requestJson(`/api/items/${item.id}`, { method: "DELETE" }); showToast("Removed."); await load(); }
    catch (cause) { showToast(cause instanceof Error ? cause.message : "Could not remove the item."); }
  }

  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      await requestJson(`/api/auth/${authMode === "register" ? "register" : "login"}`, { method: "POST", body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
      setAuthModal(false); showToast(authMode === "register" ? "Your space is saved to your account." : "Welcome back."); await load();
    } catch (cause) { showToast(cause instanceof Error ? cause.message : "Could not sign in."); }
    finally { setBusy(false); }
  }

  async function logout() { await requestJson("/api/auth/logout", { method: "POST" }); window.location.href = "/app"; }

  async function checkout(interval: "month" | "year") {
    setBusy(true);
    try {
      const result = await requestJson<{ url: string }>("/api/billing/checkout", { method: "POST", body: JSON.stringify({ interval }) });
      window.location.href = result.url;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not start checkout.";
      showToast(message);
      if (!data?.user.email) { setUpgradeModal(false); setAuthMode("register"); setAuthModal(true); }
    } finally { setBusy(false); }
  }

  async function openBilling() {
    try { const result = await requestJson<{ url: string }>("/api/billing/portal", { method: "POST" }); window.location.href = result.url; }
    catch (cause) { showToast(cause instanceof Error ? cause.message : "Could not open billing."); }
  }

  async function updateReminders(enabled: boolean, leadDays = data?.user.reminderLeadDays ?? 3) {
    try {
      const result = await requestJson<{ user: User }>("/api/reminders/settings", { method: "PATCH", body: JSON.stringify({ enabled, leadDays }) });
      setData((current) => current ? { ...current, user: result.user } : current); showToast(enabled ? "Email reminders are on." : "Email reminders are off.");
    } catch (cause) { showToast(cause instanceof Error ? cause.message : "Could not update reminders."); }
  }

  async function printLabels() {
    try {
      const result = await requestJson<{ labels: Array<Pick<Item, "name" | "openedAt" | "useWithinDays">> }>("/api/labels");
      const popup = window.open("", "second-date-labels", "width=820,height=900");
      if (!popup) throw new Error("Allow pop-ups to print your labels.");
      popup.document.write(`<title>Second Date labels</title><style>body{font-family:Arial;padding:28px;color:#193a2b}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.label{border:1px dashed #91a991;border-radius:8px;padding:18px;min-height:100px}.label b{font-family:Georgia;font-size:21px;display:block;margin:12px 0}.label span{font-size:11px;color:#647b68}@media print{button{display:none}}</style><h1>second date.</h1><div class="grid">${result.labels.map((label) => `<div class="label"><span>OPENED ${formatShortDate(label.openedAt)}</span><b>${label.name.replace(/[<>&"]/g, "")}</b><span>SECOND DATE ${formatShortDate(endDate(label.openedAt, label.useWithinDays))}</span></div>`).join("")}</div><button onclick="print()">Print</button>`);
      popup.document.close(); popup.focus();
    } catch (cause) { showToast(cause instanceof Error ? cause.message : "Could not prepare labels."); }
  }

  if (loading) return <div className="app-loading"><Brand /><span>Opening your little space…</span></div>;
  if (!data) return <div className="app-loading"><Brand /><p>{error || "Could not load your space."}</p><button className="button button-dark" onClick={() => { setLoading(true); void load(); }}>Try again</button></div>;

  const plus = data.user.plan === "plus";
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Brand href="/" />
        <div className="workspace-chip"><span>✳</span><div><b>{data.user.email ? "Your space" : "Guest space"}</b><small>{plus ? "Plus" : "Free"} · {realActiveCount}{plus ? " active" : ` / ${data.limit} active`}</small></div></div>
        <nav><a href="#things"><Clock3 size={17}/> Open things</a><a href="#history"><History size={17}/> History</a><a href="#account"><CircleUserRound size={17}/> Account</a></nav>
        <div className="sidebar-bottom">{!plus && <button onClick={() => setUpgradeModal(true)}><Sparkles size={16}/> Go Plus <ChevronRight size={15}/></button>}<small>Dates are reminders, not safety advice.</small></div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar"><span>YOUR LITTLE SPACE</span><div>{data.user.email ? <><span>{data.user.email}</span><button title="Log out" onClick={() => void logout()}><LogOut size={16}/></button></> : <button className="text-action" onClick={() => { setAuthMode("login"); setAuthModal(true); }}>Log in</button>}</div></header>
        <div className="dashboard-content">
          <section className="dashboard-heading"><div><p className="section-kicker"><span>✳</span> TODAY</p><h1>Good to see you.</h1><p>A calm little look at what deserves attention next.</p></div><button className="button button-dark" onClick={openNew}><Plus size={18}/> Add something</button></section>

          <section className="stats-grid"><div><Clock3/><small>OPEN NOW</small><strong>{active.length}</strong><p>things keeping their second clock</p></div><div><Bell/><small>COMING UP</small><strong>{soon}</strong><p>due in the next three days</p></div><div><Check/><small>USED UP</small><strong>{used}</strong><p>small wins in your history</p></div></section>

          {active[0] && <section className="dashboard-nudge"><span>✳</span><div><small>A GENTLE NUDGE</small><h2>{daysLeft(active[0].openedAt, active[0].useWithinDays) <= 0 ? `${active[0].name} has reached its Second Date.` : `Make it a ${active[0].name.toLowerCase()} kind of day.`}</h2><p>{remainingLabel(daysLeft(active[0].openedAt, active[0].useWithinDays))}. Always follow the product’s own guidance.</p></div></section>}

          <section className="list-section" id="things">
            <div className="list-toolbar"><div className="list-tabs"><button className={tab === "active" ? "active" : ""} onClick={() => setTab("active")}>Open things <b>{active.length}</b></button><button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}>History <b>{history.length}</b></button></div><label className="search-field"><Search size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your things" /></label></div>
            {active.some((item) => item.isExample) && tab === "active" && <div className="example-note">These are examples. Add your first real item and they’ll quietly disappear.</div>}
            <div className="item-list">{visible.length === 0 ? <div className="empty-state"><span>✳</span><h3>{search ? "Nothing matches that search." : tab === "active" ? "Nothing open yet." : "No history yet."}</h3><p>{tab === "active" ? "Add something when you twist a lid, break a seal, or open a bottle." : "Used and discarded items will show up here."}</p></div> : visible.map((item) => <ItemRow key={item.id} item={item} active={tab === "active"} onEdit={openEdit} onStatus={updateStatus} onDelete={removeItem}/>)}</div>
          </section>

          <section className="account-section" id="account"><div className="account-heading"><div><p className="section-kicker"><span>✳</span> ACCOUNT &amp; EXTRAS</p><h2>Your space, your way.</h2></div>{!data.user.email && <button className="button button-outline" onClick={() => { setAuthMode("register"); setAuthModal(true); }}>Save this space</button>}</div>
            <div className="account-grid"><article><CircleUserRound/><div><small>ACCOUNT</small><strong>{data.user.email || "Guest"}</strong><p>{data.user.email ? "Your space follows your account." : "Try everything essential before signing up."}</p></div></article><article><Sparkles/><div><small>PLAN</small><strong>{plus ? "Plus ✦" : "Free"}</strong><p>{plus ? "Unlimited timers and thoughtful extras." : `${data.limit} active personal items.`}</p>{plus ? <button className="inline-action" onClick={() => void openBilling()}><CreditCard size={14}/> Manage billing</button> : <button className="inline-action" onClick={() => setUpgradeModal(true)}>See Plus</button>}</div></article></div>
            <div className="extras-grid"><article><Bell/><div><strong>Email reminders</strong><p>Get a nudge before a Second Date, plus one on the day.</p>{plus ? <div className="reminder-controls"><label><input type="checkbox" checked={data.user.reminderEmailEnabled} onChange={(event) => void updateReminders(event.target.checked)}/> {data.user.reminderEmailEnabled ? "On" : "Off"}</label><select value={data.user.reminderLeadDays} onChange={(event) => void updateReminders(data.user.reminderEmailEnabled, Number(event.target.value))}>{REMINDER_OPTIONS.map((days) => <option key={days} value={days}>{days} day{days === 1 ? "" : "s"} before</option>)}</select></div> : <button className="inline-action" onClick={() => setUpgradeModal(true)}>Available with Plus</button>}</div></article><article><Printer/><div><strong>Printable labels</strong><p>Print simple opened and Second Date labels for your shelf.</p><button className="inline-action" onClick={() => plus ? void printLabels() : setUpgradeModal(true)}>{plus ? "Print labels" : "Available with Plus"}</button></div></article><article><History/><div><strong>Use-up insight</strong><p>{used + discarded ? `You used ${used} of ${used + discarded} completed items instead of discarding them.` : "Complete a few items and your use-up pattern will appear here."}</p></div></article></div>
          </section>
        </div>
      </main>

      {itemModal && <Modal onClose={() => setItemModal(false)}><form className="modal-form" onSubmit={saveItem}><div className="modal-heading"><div><small>{editing ? "EDIT YOUR THING" : "A NEW SECOND DATE"}</small><h2>{editing ? "Tidy up the details." : "What did you open?"}</h2></div><button type="button" onClick={() => setItemModal(false)}><X/></button></div><label>Name<input required maxLength={80} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Basil pesto" /></label><div className="category-grid">{CATEGORIES.map((category) => <button type="button" key={category} className={draft.category === category ? "selected" : ""} onClick={() => setDraft({ ...draft, category })}>{category}</button>)}</div><div className="form-two"><label>Opened on<input type="date" required max={todayISO()} value={draft.openedAt} onChange={(e) => setDraft({ ...draft, openedAt: e.target.value })}/></label><label>Use within (days)<input type="number" required min={1} max={3650} value={draft.useWithinDays} onChange={(e) => setDraft({ ...draft, useWithinDays: Number(e.target.value) })}/></label></div><label>Note <small>optional</small><textarea maxLength={240} value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} placeholder="Perfect for pasta night" /></label><button className="button button-dark" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Add to my space"}</button></form></Modal>}

      {authModal && <Modal onClose={() => setAuthModal(false)}><form className="modal-form auth-form" onSubmit={authenticate}><div className="modal-heading"><div><small>{authMode === "register" ? "KEEP YOUR SPACE" : "WELCOME BACK"}</small><h2>{authMode === "register" ? "Save the good stuff." : "Open your space."}</h2></div><button type="button" onClick={() => setAuthModal(false)}><X/></button></div><label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" minLength={8} maxLength={128} autoComplete={authMode === "login" ? "current-password" : "new-password"} required /></label><button className="button button-dark" disabled={busy}>{busy ? "One moment…" : authMode === "register" ? "Create free account" : "Log in"}</button><button type="button" className="switch-auth" onClick={() => setAuthMode(authMode === "register" ? "login" : "register")}>{authMode === "register" ? "Already have an account? Log in" : "New here? Create a free account"}</button></form></Modal>}

      {upgradeModal && <Modal onClose={() => setUpgradeModal(false)}><div className="upgrade-panel"><button className="modal-close" onClick={() => setUpgradeModal(false)}><X/></button><span className="upgrade-spark">✳</span><small>SECOND DATE PLUS</small><h2>Room for the whole shelf.</h2><p>Unlimited open things, email reminders, printable labels, and personal use-up insights.</p><ul><li><Check/> Unlimited active items</li><li><Check/> Email Second Date reminders</li><li><Check/> Printable label sheets</li><li><Check/> Personal use-up insights</li></ul><button className="button button-dark" disabled={busy} onClick={() => void checkout("year")}>Choose yearly · $24/year</button><button className="button button-outline" disabled={busy} onClick={() => void checkout("month")}>Monthly · $2.99/month</button><small>Cancel whenever you like.</small></div></Modal>}
      {toast && <div className="app-toast">{toast}</div>}
    </div>
  );
}

function ItemRow({ item, active, onEdit, onStatus, onDelete }: { item: Item; active: boolean; onEdit: (item: Item) => void; onStatus: (item: Item, status: "used" | "discarded") => void; onDelete: (item: Item) => void }) {
  const remaining = daysLeft(item.openedAt, item.useWithinDays);
  return <article className={`item-row ${categoryTone(item.category)}`}><div className="item-emoji">{itemEmoji(item.name, item.category)}</div><div className="item-main"><div><strong>{item.name}</strong>{item.isExample && <span className="example-pill">EXAMPLE</span>}</div><small>{item.category} · opened {formatDate(item.openedAt)}</small>{item.note && <p>{item.note}</p>}</div>{active ? <><div className="item-date"><small>SECOND DATE</small><strong>{formatShortDate(endDate(item.openedAt, item.useWithinDays))}</strong></div><span className={`status-pill ${remaining <= 0 ? "due" : remaining <= 3 ? "soon" : "good"}`}>{remainingLabel(remaining)}</span><div className="row-actions"><button title="Mark used" onClick={() => onStatus(item, "used")}><Check/></button><button title="Edit" onClick={() => onEdit(item)}><Pencil/></button><button title="Discard" onClick={() => onStatus(item, "discarded")}><Trash2/></button></div></> : <><div className="item-date"><small>COMPLETED</small><strong>{item.completedAt ? new Date(item.completedAt).toLocaleDateString() : "—"}</strong></div><span className={`status-pill ${item.status}`}>{item.status === "used" ? "Used up" : "Discarded"}</span><div className="row-actions"><button title="Delete" onClick={() => onDelete(item)}><Trash2/></button></div></>}</article>;
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><div className="modal-panel" role="dialog" aria-modal="true">{children}</div></div>;
}
