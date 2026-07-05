"use client";

import { useEffect, useMemo, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

type Rule = {
  id: string;
  ruleName: string;
  triggerType: string;
  condition: Record<string, unknown>;
  messageTemplate: string;
  channel: string;
  status: string;
  lastTriggeredAt?: string;
  nextTriggerAt?: string;
};

type Log = {
  id: string;
  channel: string;
  status: string;
  message: string;
  metadata: Record<string, unknown>;
  sentAt?: string;
  createdAt?: string;
};

const triggerOptions = [
  { value: "inactivity", label: "Inactive members" },
  { value: "subscription_expiry", label: "Subscription expiry" },
  { value: "birthday", label: "Birthday" },
  { value: "occupancy_peak", label: "Occupancy peak" },
];

export default function Page() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [ruleName, setRuleName] = useState("Renewal reminder");
  const [triggerType, setTriggerType] = useState("subscription_expiry");
  const [template, setTemplate] = useState("Your membership is expiring soon. Renew now to stay active.");
  const [channel, setChannel] = useState("sms");
  const [status, setStatus] = useState("active");
  const [windowValue, setWindowValue] = useState("3");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [rulesPayload, logsPayload] = await Promise.all([
          api.get<{ items: Rule[] }>("/api/v1/sms-automations?limit=24"),
          api.get<{ items: Log[] }>("/api/v1/sms/logs?limit=12"),
        ]);
        if (!mounted) {
          return;
        }
        setRules(rulesPayload.items ?? []);
        setLogs(logsPayload.items ?? []);
      } catch {
        if (mounted) {
          setRules([]);
          setLogs([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const condition = useMemo(() => {
    if (triggerType === "subscription_expiry") {
      return { daysBefore: Number(windowValue) };
    }
    if (triggerType === "inactivity") {
      return { days: Number(windowValue) };
    }
    if (triggerType === "occupancy_peak") {
      return { threshold: Number(windowValue) };
    }
    return { days: Number(windowValue) };
  }, [triggerType, windowValue]);

  async function saveRule() {
    setSaving(true);
    setMessage("");
    try {
      const created = await api.post<Rule>("/api/v1/sms-automations", {
        ruleName,
        triggerType,
        condition,
        messageTemplate: template,
        channel,
        status,
      });
      setRules((current) => [created, ...current.filter((item) => item.id !== created.id)]);
      setMessage("Rule saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save rule.");
    } finally {
      setSaving(false);
    }
  }

  async function removeRule(ruleId: string) {
    setMessage("");
    try {
      await api.delete(`/api/v1/sms-automations/${ruleId}`);
      setRules((current) => current.filter((item) => item.id !== ruleId));
      setMessage("Rule removed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete rule.");
    }
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">SMS Automation</span>
        <h1>Retention rules and message logs.</h1>
        <p>Manage tenant-scoped message rules for renewals, inactivity, birthdays, and peak occupancy alerts.</p>
      </header>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>Rule builder</span>
            <em>{loading ? "Loading..." : `${rules.length} rules`}</em>
          </div>
          <div className="field-list">
            <div className="form-field">
              <label>Rule name</label>
              <input value={ruleName} onChange={(event) => setRuleName(event.target.value)} />
            </div>
            <div className="form-field">
              <label>Trigger type</label>
              <select value={triggerType} onChange={(event) => setTriggerType(event.target.value)}>
                {triggerOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Window / threshold</label>
              <input value={windowValue} onChange={(event) => setWindowValue(event.target.value)} />
            </div>
            <div className="form-field">
              <label>Message template</label>
              <textarea value={template} onChange={(event) => setTemplate(event.target.value)} rows={4} />
            </div>
            <div className="form-field">
              <label>Channel</label>
              <select value={channel} onChange={(event) => setChannel(event.target.value)}>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="push">Push</option>
              </select>
            </div>
            <div className="form-field">
              <label>Status</label>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="active">active</option>
                <option value="paused">paused</option>
              </select>
            </div>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={saveRule} disabled={saving}>
              {saving ? "Saving..." : "Save rule"}
            </button>
            <span style={{ color: "var(--muted)" }}>{message}</span>
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <span>Rules</span>
            <em>Active automations</em>
          </div>
          <div className="field-list">
            {rules.length > 0 ? rules.map((rule) => (
              <div key={rule.id}>
                <strong>{rule.ruleName}</strong>
                <span>{rule.triggerType} · {rule.channel} · {rule.status}</span>
                <span>{rule.messageTemplate}</span>
                <div className="actions" style={{ marginTop: 8 }}>
                  <button className="button secondary" type="button" onClick={() => removeRule(rule.id)}>
                    Delete
                  </button>
                </div>
              </div>
            )) : (
              <div>
                <strong>No automation rules yet</strong>
                <span>Create your first rule using the builder on the left.</span>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="panel">
        <div className="section-head">
          <span>Recent logs</span>
          <em>Delivery history</em>
        </div>
        <ul className="timeline">
          {logs.length > 0 ? logs.map((log) => (
            <li key={log.id}>
              <strong>{log.channel.toUpperCase()} · {log.status}</strong>
              <span>{log.message}</span>
              {log.createdAt ? <small style={{ color: "var(--muted)" }}>{new Date(log.createdAt).toLocaleString()}</small> : null}
            </li>
          )) : (
            <li>
              <strong>No logs yet</strong>
              <span>Automation delivery history will appear here when messages are sent.</span>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
