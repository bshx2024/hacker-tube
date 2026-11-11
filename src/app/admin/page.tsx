"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/core/auth/client";
import { AuthModal } from "@/components/AuthModal";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  credits: number;
  createdAt: string;
}

interface AdminOrder {
  id: string;
  orderNo: string;
  userEmail?: string;
  status: string;
  amount: number;
  currency: string;
  productName?: string;
  paymentProvider: string;
  createdAt: string;
}

interface AdminSubscription {
  id: string;
  userId: string;
  plan: string;
  status: string;
  paymentProvider: string;
  currentPeriodEnd?: string;
}

interface AdminSurvey {
  desiredFeature: string;
  pricingPreference: string;
  role?: string;
  feedback?: string;
  contact?: string;
  country?: string;
  timestamp: string;
}

export default function AdminDashboardPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "orders" | "subscriptions" | "surveys" | "settings">("users");

  const [stats, setStats] = useState({
    totalUsers: 0,
    proSubscribers: 0,
    totalOrders: 0,
    totalRevenue: "0.00",
    totalSurveys: 0,
  });

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [surveys, setSurveys] = useState<AdminSurvey[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [paymentConfig, setPaymentConfig] = useState({
    activeProvider: "stripe",
    isStripeConfigured: false,
    stripeKeyMasked: "",
    isStripeWebhookConfigured: false,
    stripeWebhookMasked: "",
    isPayPalConfigured: false,
    paypalClientIdMasked: "",
    paypalMode: "live",
    isCreemConfigured: false,
    creemKeyMasked: "",
    webhookUrl: "https://www.hacker-tube.net/api/payment/notify",
  });

  const [formStripeKey, setFormStripeKey] = useState("");
  const [formStripeWebhook, setFormStripeWebhook] = useState("");
  const [formPayPalClientId, setFormPayPalClientId] = useState("");
  const [formPayPalSecret, setFormPayPalSecret] = useState("");
  const [formPayPalMode, setFormPayPalMode] = useState<"sandbox" | "live">("live");
  const [formCreemKey, setFormCreemKey] = useState("");
  const [formProvider, setFormProvider] = useState("stripe");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const refreshData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch("/api/admin/stats");
      if (!res.ok) {
        if (res.status === 401) {
          setErrorMsg("Please sign in to access the admin portal.");
        } else if (res.status === 403) {
          setErrorMsg("Access Denied: Your account does not have administrator privileges.");
        } else {
          setErrorMsg("Failed to load admin telemetry.");
        }
        return;
      }

      const data = await res.json();
      setStats(data.stats);
      setUsers(data.users || []);
      setOrders(data.orders || []);
      setSubscriptions(data.subscriptions || []);
      setSurveys(data.surveys || []);
      if (data.paymentConfig) {
        setPaymentConfig(data.paymentConfig);
        setFormProvider(data.paymentConfig.activeProvider || "stripe");
        setFormPayPalMode(data.paymentConfig.paypalMode === "sandbox" ? "sandbox" : "live");
      }
    } catch {
      setErrorMsg("Network error loading admin console.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionLoading) return;

    if (!session?.user) {
      const timer = setTimeout(() => {
        setLoading(false);
        setErrorMsg("Please sign in to access the admin portal.");
      }, 0);
      return () => clearTimeout(timer);
    }

    let isMounted = true;
    fetch("/api/admin/stats")
      .then((res) => {
        if (!isMounted) return null;
        if (!res.ok) {
          if (res.status === 401) {
            setErrorMsg("Please sign in to access the admin portal.");
          } else if (res.status === 403) {
            setErrorMsg("Access Denied: Your account does not have administrator privileges.");
          } else {
            setErrorMsg("Failed to load admin telemetry.");
          }
          setLoading(false);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data || !isMounted) return;
        setErrorMsg(null);
        setStats(data.stats);
        setUsers(data.users || []);
        setOrders(data.orders || []);
        setSubscriptions(data.subscriptions || []);
        setSurveys(data.surveys || []);
        if (data.paymentConfig) {
          setPaymentConfig(data.paymentConfig);
          setFormProvider(data.paymentConfig.activeProvider || "stripe");
          setFormPayPalMode(data.paymentConfig.paypalMode === "sandbox" ? "sandbox" : "live");
        }
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          setErrorMsg("Network error loading admin console.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [session, sessionLoading]);

  const handleUpdateUser = async (targetUserId: string, action: "set_plan" | "set_role" | "delete_user", value: string) => {
    try {
      setActionLoading(`${targetUserId}-${action}`);
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, action, value }),
      });
      if (res.ok) {
        await refreshData();
      } else {
        alert("Action failed.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaveLoading(true);
      setSaveSuccessMsg(null);
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_gateway_settings",
          stripeSecretKey: formStripeKey || undefined,
          stripeWebhookSecret: formStripeWebhook || undefined,
          paypalClientId: formPayPalClientId || undefined,
          paypalClientSecret: formPayPalSecret || undefined,
          paypalMode: formPayPalMode,
          creemApiKey: formCreemKey || undefined,
          activeProvider: formProvider,
        }),
      });
      if (res.ok) {
        setSaveSuccessMsg("Payment gateway settings saved successfully! Live payments are now active.");
        setFormStripeKey("");
        setFormStripeWebhook("");
        setFormPayPalClientId("");
        setFormPayPalSecret("");
        setFormCreemKey("");
        await refreshData();
      } else {
        alert("Failed to save gateway configuration.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Header bar */}
      <header
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(15, 23, 42, 0.7)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="logo-badge" style={{ width: "30px", height: "30px", fontSize: "14px" }}>
              HT
            </div>
            <span style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)" }}>HackerTube</span>
          </Link>
          <span style={{ color: "var(--text-muted)" }}>/</span>
          <span
            style={{
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              background: "rgba(168, 85, 247, 0.15)",
              border: "1px solid rgba(168, 85, 247, 0.4)",
              color: "#c084fc",
              padding: "2px 8px",
              borderRadius: "4px",
              fontWeight: 700,
            }}
          >
            ADMIN OPS PORTAL
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/" className="nav-btn" style={{ padding: "6px 14px", fontSize: "13px" }}>
            ← Back to Web App
          </Link>
          {session?.user && (
            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Signed in as <strong style={{ color: "var(--accent-emerald)" }}>{session.user.email}</strong>
            </div>
          )}
        </div>
      </header>

      <main className="container" style={{ padding: "32px 16px", maxWidth: "1200px", margin: "0 auto" }}>
        {errorMsg ? (
          <div
            style={{
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "16px",
              padding: "48px 24px",
              textAlign: "center",
              maxWidth: "600px",
              margin: "40px auto",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔐</div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "8px" }}>Administrator Access Required</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.6, marginBottom: "24px" }}>
              {session?.user
                ? `Signed in as "${session.user.email}", but this account has not been granted administrator privileges yet.`
                : errorMsg}
            </p>

            {!session?.user ? (
              <button
                className="nav-btn nav-btn-primary"
                onClick={() => setAuthModalOpen(true)}
                style={{ padding: "10px 24px", fontSize: "14px" }}
              >
                Sign In to Administrator Account ⚡
              </button>
            ) : (
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.4)",
                  padding: "20px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontFamily: "var(--font-mono)",
                  textAlign: "left",
                  color: "#93c5fd",
                  lineHeight: 1.6,
                  border: "1px solid rgba(56, 189, 248, 0.2)",
                }}
              >
                <div style={{ color: "#38bdf8", fontWeight: 700, marginBottom: "8px" }}>
                  💡 Two quick ways to grant Admin rights:
                </div>
                <div><strong>Option 1 (Production / Vercel):</strong></div>
                <div>Add to Vercel Environment Variables:</div>
                <code style={{ color: "#34d399", display: "block", margin: "4px 0 12px 0", padding: "6px 10px", background: "rgba(0,0,0,0.3)", borderRadius: "4px" }}>
                  ADMIN_EMAILS={session.user.email}
                </code>
                <div><strong>Option 2 (Local / Terminal):</strong></div>
                <div>Run in project terminal:</div>
                <code style={{ color: "#38bdf8", display: "block", margin: "4px 0 12px 0", padding: "6px 10px", background: "rgba(0,0,0,0.3)", borderRadius: "4px" }}>
                  npx tsx scripts/make_admin.ts {session.user.email}
                </code>
                <div style={{ marginTop: "12px", textAlign: "center" }}>
                  <button
                    onClick={() => refreshData()}
                    className="nav-btn"
                    style={{ fontSize: "12px", padding: "6px 16px" }}
                  >
                    🔄 Refresh Permissions
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
            ⚡ Loading real-time telemetry from SQLite &amp; Stripe...
          </div>
        ) : (
          <>
            {/* Top Stat KPI Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  background: "rgba(15, 23, 42, 0.7)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                  Registered Users
                </div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>{stats.totalUsers}</div>
              </div>

              <div
                style={{
                  background: "rgba(15, 23, 42, 0.7)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                  Active Pro Subs
                </div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-emerald)" }}>{stats.proSubscribers}</div>
              </div>

              <div
                style={{
                  background: "rgba(15, 23, 42, 0.7)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                  Total Revenue
                </div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#38bdf8" }}>${stats.totalRevenue}</div>
              </div>

              <div
                style={{
                  background: "rgba(15, 23, 42, 0.7)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                  Surveys &amp; Feedback
                </div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#c084fc" }}>{stats.totalSurveys}</div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-subtle)", marginBottom: "24px", overflowX: "auto" }}>
              {(["users", "orders", "subscriptions", "surveys", "settings"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "10px 20px",
                    background: "none",
                    border: "none",
                    borderBottom: activeTab === tab ? "2px solid var(--accent-emerald)" : "2px solid transparent",
                    color: activeTab === tab ? "var(--accent-emerald)" : "var(--text-secondary)",
                    fontWeight: activeTab === tab ? 700 : 500,
                    cursor: "pointer",
                    textTransform: tab === "settings" ? "none" : "capitalize",
                    fontSize: "14px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab === "users"
                    ? `Users (${users.length})`
                    : tab === "orders"
                    ? `Orders (${orders.length})`
                    : tab === "subscriptions"
                    ? `Subscriptions (${subscriptions.length})`
                    : tab === "surveys"
                    ? `Surveys (${surveys.length})`
                    : "⚙️ Payment Gateway"}
                </button>
              ))}
            </div>

            {/* Tab 1: Users */}
            {activeTab === "users" && (
              <div style={{ background: "rgba(15, 23, 42, 0.6)", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
                  <thead>
                    <tr style={{ background: "rgba(0, 0, 0, 0.3)", textAlign: "left", color: "var(--text-muted)" }}>
                      <th style={{ padding: "12px 16px" }}>Email</th>
                      <th style={{ padding: "12px 16px" }}>Role</th>
                      <th style={{ padding: "12px 16px" }}>Plan</th>
                      <th style={{ padding: "12px 16px" }}>Credits</th>
                      <th style={{ padding: "12px 16px" }}>Joined</th>
                      <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                          No registered users yet.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                          <td style={{ padding: "14px 16px", fontWeight: 600 }}>{u.email}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontFamily: "var(--font-mono)",
                                background: u.role === "admin" ? "rgba(168, 85, 247, 0.2)" : "rgba(255, 255, 255, 0.05)",
                                color: u.role === "admin" ? "#c084fc" : "var(--text-secondary)",
                              }}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontFamily: "var(--font-mono)",
                                background: u.plan === "pro" ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.05)",
                                color: u.plan === "pro" ? "var(--accent-emerald)" : "var(--text-secondary)",
                              }}
                            >
                              {u.plan.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px" }}>{u.credits}</td>
                          <td style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: "12px" }}>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: "14px 16px", textAlign: "right" }}>
                            <button
                              disabled={actionLoading === `${u.id}-set_plan`}
                              onClick={() => handleUpdateUser(u.id, "set_plan", u.plan === "pro" ? "free" : "pro")}
                              className="nav-btn"
                              style={{ padding: "4px 10px", fontSize: "11px", marginRight: "6px" }}
                            >
                              {u.plan === "pro" ? "Revoke Pro" : "Grant Pro"}
                            </button>
                            <button
                              disabled={actionLoading === `${u.id}-set_role`}
                              onClick={() => handleUpdateUser(u.id, "set_role", u.role === "admin" ? "user" : "admin")}
                              className="nav-btn"
                              style={{ padding: "4px 10px", fontSize: "11px" }}
                            >
                              {u.role === "admin" ? "Remove Admin" : "Make Admin"}
                            </button>
                            {u.id !== session?.user?.id && (
                              <button
                                disabled={actionLoading === `${u.id}-delete_user`}
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete user "${u.email}"?`)) {
                                    handleUpdateUser(u.id, "delete_user", "");
                                  }
                                }}
                                className="nav-btn"
                                style={{
                                  padding: "4px 10px",
                                  fontSize: "11px",
                                  marginLeft: "6px",
                                  color: "#f87171",
                                  borderColor: "rgba(239, 68, 68, 0.3)",
                                  background: "rgba(239, 68, 68, 0.1)",
                                }}
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 2: Orders */}
            {activeTab === "orders" && (
              <div style={{ background: "rgba(15, 23, 42, 0.6)", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
                  <thead>
                    <tr style={{ background: "rgba(0, 0, 0, 0.3)", textAlign: "left", color: "var(--text-muted)" }}>
                      <th style={{ padding: "12px 16px" }}>Order No</th>
                      <th style={{ padding: "12px 16px" }}>User</th>
                      <th style={{ padding: "12px 16px" }}>Product</th>
                      <th style={{ padding: "12px 16px" }}>Amount</th>
                      <th style={{ padding: "12px 16px" }}>Status</th>
                      <th style={{ padding: "12px 16px" }}>Provider</th>
                      <th style={{ padding: "12px 16px" }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                          No checkout orders created yet.
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                          <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: "12px" }}>{o.orderNo}</td>
                          <td style={{ padding: "14px 16px" }}>{o.userEmail || "Anonymous"}</td>
                          <td style={{ padding: "14px 16px" }}>{o.productName || "Pro Plan"}</td>
                          <td style={{ padding: "14px 16px", fontWeight: 700 }}>${(o.amount / 100).toFixed(2)}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                background: o.status === "paid" ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
                                color: o.status === "paid" ? "var(--accent-emerald)" : "#f59e0b",
                              }}
                            >
                              {o.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px", color: "var(--text-muted)" }}>{o.paymentProvider}</td>
                          <td style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: "12px" }}>
                            {new Date(o.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 3: Subscriptions */}
            {activeTab === "subscriptions" && (
              <div style={{ background: "rgba(15, 23, 42, 0.6)", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
                  <thead>
                    <tr style={{ background: "rgba(0, 0, 0, 0.3)", textAlign: "left", color: "var(--text-muted)" }}>
                      <th style={{ padding: "12px 16px" }}>User ID</th>
                      <th style={{ padding: "12px 16px" }}>Plan</th>
                      <th style={{ padding: "12px 16px" }}>Status</th>
                      <th style={{ padding: "12px 16px" }}>Provider</th>
                      <th style={{ padding: "12px 16px" }}>Expires / Renews</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                          No active subscriptions currently.
                        </td>
                      </tr>
                    ) : (
                      subscriptions.map((s) => (
                        <tr key={s.id} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                          <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: "12px" }}>{s.userId}</td>
                          <td style={{ padding: "14px 16px", fontWeight: 700 }}>{s.plan.toUpperCase()}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{ color: "var(--accent-emerald)", fontWeight: 600 }}>{s.status}</span>
                          </td>
                          <td style={{ padding: "14px 16px" }}>{s.paymentProvider}</td>
                          <td style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: "12px" }}>
                            {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : "N/A"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 5: Payment Gateway Settings */}
            {activeTab === "settings" && (
              <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                {saveSuccessMsg && (
                  <div
                    style={{
                      padding: "12px 16px",
                      background: "rgba(16, 185, 129, 0.15)",
                      border: "1px solid rgba(16, 185, 129, 0.4)",
                      borderRadius: "8px",
                      color: "#34d399",
                      fontSize: "14px",
                      marginBottom: "20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>🎉</span>
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}

                {/* Status Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                  <div style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "16px" }}>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Stripe API Status</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "16px" }}>{paymentConfig.isStripeConfigured ? "🟢" : "⚪"}</span>
                      <strong style={{ color: paymentConfig.isStripeConfigured ? "var(--accent-emerald)" : "var(--text-muted)" }}>
                        {paymentConfig.isStripeConfigured ? "Active & Ready" : "Not Configured"}
                      </strong>
                    </div>
                    {paymentConfig.stripeKeyMasked && (
                      <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginTop: "6px" }}>
                        Key: {paymentConfig.stripeKeyMasked}
                      </div>
                    )}
                  </div>

                  <div style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "16px" }}>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Webhook Verification</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "16px" }}>{paymentConfig.isStripeWebhookConfigured ? "🟢" : "⚪"}</span>
                      <strong style={{ color: paymentConfig.isStripeWebhookConfigured ? "var(--accent-emerald)" : "var(--text-muted)" }}>
                        {paymentConfig.isStripeWebhookConfigured ? "Verified (Auto-Upgrade)" : "Missing Secret"}
                      </strong>
                    </div>
                    {paymentConfig.stripeWebhookMasked && (
                      <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginTop: "6px" }}>
                        Secret: {paymentConfig.stripeWebhookMasked}
                      </div>
                    )}
                  </div>

                  <div style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "16px" }}>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>PayPal API Status ({paymentConfig.paypalMode})</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "16px" }}>{paymentConfig.isPayPalConfigured ? "🟢" : "⚪"}</span>
                      <strong style={{ color: paymentConfig.isPayPalConfigured ? "var(--accent-emerald)" : "var(--text-muted)" }}>
                        {paymentConfig.isPayPalConfigured ? "Active & Ready" : "Not Configured"}
                      </strong>
                    </div>
                    {paymentConfig.paypalClientIdMasked && (
                      <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginTop: "6px" }}>
                        Client: {paymentConfig.paypalClientIdMasked}
                      </div>
                    )}
                  </div>
                </div>

                {/* Form card */}
                <form
                  onSubmit={handleSaveGateway}
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "28px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "16px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 6px 0", color: "#f8fafc" }}>
                      💳 Payment Gateway Direct Configuration
                    </h3>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                      Fill in your payment credentials below. Changes are saved directly to the database and take effect immediately without redeploying to Vercel.
                    </p>
                  </div>

                  {/* Webhook Endpoint copy box */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#93c5fd", marginBottom: "6px" }}>
                      1. Webhook Endpoint URL (Stripe Callback Endpoint)
                    </label>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 8px 0" }}>
                      Paste this URL into Stripe Dashboard &gt; Developers &gt; Webhooks &gt; Add Endpoint, and listen to <code>checkout.session.completed</code>.
                    </p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        readOnly
                        value={paymentConfig.webhookUrl}
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          background: "#090d16",
                          border: "1px solid #1e293b",
                          borderRadius: "6px",
                          color: "#38bdf8",
                          fontFamily: "var(--font-mono)",
                          fontSize: "13px",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(paymentConfig.webhookUrl);
                          setCopiedWebhook(true);
                          setTimeout(() => setCopiedWebhook(false), 2000);
                        }}
                        className="nav-btn"
                        style={{ padding: "0 16px", fontSize: "13px" }}
                      >
                        {copiedWebhook ? "✅ Copied!" : "📋 Copy URL"}
                      </button>
                    </div>
                  </div>

                  {/* Active Provider Selector */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#93c5fd", marginBottom: "8px" }}>
                      2. Default Active Payment Provider
                    </label>
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                        <input
                          type="radio"
                          name="provider"
                          value="stripe"
                          checked={formProvider === "stripe"}
                          onChange={(e) => setFormProvider(e.target.value)}
                        />
                        <span>Stripe (Cards &amp; Apple/Google Pay)</span>
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                        <input
                          type="radio"
                          name="provider"
                          value="paypal"
                          checked={formProvider === "paypal"}
                          onChange={(e) => setFormProvider(e.target.value)}
                        />
                        <span style={{ color: "#38bdf8", fontWeight: 600 }}>🅿️ PayPal (Global PayPal &amp; Cards)</span>
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                        <input
                          type="radio"
                          name="provider"
                          value="creem"
                          checked={formProvider === "creem"}
                          onChange={(e) => setFormProvider(e.target.value)}
                        />
                        <span>Creem (Merchant of Record)</span>
                      </label>
                    </div>
                  </div>

                  {/* Stripe Secret Key */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#f8fafc", marginBottom: "6px" }}>
                      3. Stripe Secret Key (sk_test_... or sk_live_...)
                    </label>
                    <input
                      type="password"
                      value={formStripeKey}
                      onChange={(e) => setFormStripeKey(e.target.value)}
                      placeholder={paymentConfig.stripeKeyMasked || "Paste your sk_test_... or sk_live_... key"}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        background: "#090d16",
                        border: "1px solid #1e293b",
                        borderRadius: "6px",
                        color: "#ffffff",
                        fontFamily: "var(--font-mono)",
                        fontSize: "13px",
                        boxSizing: "border-box",
                      }}
                    />
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                      From Stripe Dashboard &gt; Developers &gt; API Keys &gt; Secret key.
                    </div>
                  </div>

                  {/* Stripe Webhook Secret */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#f8fafc", marginBottom: "6px" }}>
                      4. Stripe Webhook Signing Secret (whsec_...)
                    </label>
                    <input
                      type="password"
                      value={formStripeWebhook}
                      onChange={(e) => setFormStripeWebhook(e.target.value)}
                      placeholder={paymentConfig.stripeWebhookMasked || "Paste your whsec_... signing secret"}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        background: "#090d16",
                        border: "1px solid #1e293b",
                        borderRadius: "6px",
                        color: "#ffffff",
                        fontFamily: "var(--font-mono)",
                        fontSize: "13px",
                        boxSizing: "border-box",
                      }}
                    />
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                      From Stripe Dashboard &gt; Developers &gt; Webhooks &gt; Signing secret (Reveal).
                    </div>
                  </div>

                  {/* PayPal Credentials Section */}
                  <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "16px", marginTop: "6px" }}>
                    <h4 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 12px 0", color: "#38bdf8" }}>
                      🅿️ PayPal Credentials (developer.paypal.com)
                    </h4>

                    {/* PayPal Mode (Sandbox vs Live) */}
                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#f8fafc", marginBottom: "6px" }}>
                        PayPal Environment
                      </label>
                      <div style={{ display: "flex", gap: "20px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="radio"
                            name="paypal_mode"
                            value="live"
                            checked={formPayPalMode === "live"}
                            onChange={(e) => setFormPayPalMode(e.target.value as "live")}
                          />
                          <span>Live (Production)</span>
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="radio"
                            name="paypal_mode"
                            value="sandbox"
                            checked={formPayPalMode === "sandbox"}
                            onChange={(e) => setFormPayPalMode(e.target.value as "sandbox")}
                          />
                          <span>Sandbox (Testing)</span>
                        </label>
                      </div>
                    </div>

                    {/* PayPal Client ID */}
                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#f8fafc", marginBottom: "6px" }}>
                        PayPal Client ID
                      </label>
                      <input
                        type="password"
                        value={formPayPalClientId}
                        onChange={(e) => setFormPayPalClientId(e.target.value)}
                        placeholder={paymentConfig.paypalClientIdMasked || "Paste your PayPal Client ID"}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          background: "#090d16",
                          border: "1px solid #1e293b",
                          borderRadius: "6px",
                          color: "#ffffff",
                          fontFamily: "var(--font-mono)",
                          fontSize: "13px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    {/* PayPal Secret Key */}
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#f8fafc", marginBottom: "6px" }}>
                        PayPal Secret Key
                      </label>
                      <input
                        type="password"
                        value={formPayPalSecret}
                        onChange={(e) => setFormPayPalSecret(e.target.value)}
                        placeholder={paymentConfig.isPayPalConfigured ? "••••••••••••••••" : "Paste your PayPal Secret Key"}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          background: "#090d16",
                          border: "1px solid #1e293b",
                          borderRadius: "6px",
                          color: "#ffffff",
                          fontFamily: "var(--font-mono)",
                          fontSize: "13px",
                          boxSizing: "border-box",
                        }}
                      />
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                        From <a href="https://developer.paypal.com/dashboard/applications" target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8" }}>developer.paypal.com &gt; Apps &amp; Credentials</a>.
                      </div>
                    </div>
                  </div>

                  {/* Creem API Key */}
                  <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "16px", marginTop: "6px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                      5. Creem API Key (Optional / Merchant of Record)
                    </label>
                    <input
                      type="password"
                      value={formCreemKey}
                      onChange={(e) => setFormCreemKey(e.target.value)}
                      placeholder={paymentConfig.creemKeyMasked || "Optional: creem_api_key"}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        background: "#090d16",
                        border: "1px solid #1e293b",
                        borderRadius: "6px",
                        color: "#ffffff",
                        fontFamily: "var(--font-mono)",
                        fontSize: "13px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="nav-btn nav-btn-primary"
                      style={{ padding: "12px 28px", fontSize: "14px" }}
                    >
                      {saveLoading ? "Saving..." : "💾 Save Gateway Configuration"}
                    </button>
                  </div>
                </form>
              </div>
            )}
            {activeTab === "surveys" && (
              <div style={{ display: "grid", gap: "12px" }}>
                {surveys.length === 0 ? (
                  <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", background: "rgba(15, 23, 42, 0.6)", borderRadius: "12px" }}>
                    No survey responses recorded yet.
                  </div>
                ) : (
                  surveys.map((sv, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "12px",
                        padding: "16px 20px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontFamily: "var(--font-mono)",
                              background: "rgba(56, 189, 248, 0.15)",
                              color: "#38bdf8",
                            }}
                          >
                            {sv.desiredFeature}
                          </span>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontFamily: "var(--font-mono)",
                              background: "rgba(16, 185, 129, 0.15)",
                              color: "var(--accent-emerald)",
                            }}
                          >
                            {sv.pricingPreference}
                          </span>
                        </div>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {new Date(sv.timestamp).toLocaleString()} {sv.country ? `[${sv.country}]` : ""}
                        </span>
                      </div>

                      {sv.feedback && (
                        <p style={{ fontSize: "14px", fontStyle: "italic", color: "var(--text-primary)", marginBottom: "6px" }}>
                          &ldquo;{sv.feedback}&rdquo;
                        </p>
                      )}

                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        Role: <strong style={{ color: "var(--text-secondary)" }}>{sv.role || "undisclosed"}</strong>
                        {sv.contact && (
                          <span style={{ marginLeft: "12px" }}>
                            Contact: <strong style={{ color: "#c084fc" }}>{sv.contact}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onSuccess={refreshData} />
    </div>
  );
}
