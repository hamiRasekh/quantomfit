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
  { value: "inactivity", label: "اعضای غیرفعال" },
  { value: "subscription_expiry", label: "انقضای اشتراک" },
  { value: "birthday", label: "تولد" },
  { value: "occupancy_peak", label: "اوج تراکم" },
];

export default function Page() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [ruleName, setRuleName] = useState("یادآوری تمدید");
  const [triggerType, setTriggerType] = useState("subscription_expiry");
  const [template, setTemplate] = useState("عضویت شما به‌زودی منقضی می‌شود. همین حالا تمدید کنید.");
  const [channel, setChannel] = useState("sms");
  const [status, setStatus] = useState("active");
  const [windowValue, setWindowValue] = useState("3");

  function formatStatusValue(value: string) {
    return value === "active" ? "فعال" : value === "paused" ? "متوقف" : value;
  }

  function formatTrigger(value: string) {
    const map: Record<string, string> = {
      inactivity: "اعضای غیرفعال",
      subscription_expiry: "انقضای اشتراک",
      birthday: "تولد",
      occupancy_peak: "اوج تراکم",
    };
    return map[value] ?? value;
  }

  function formatChannel(value: string) {
    const map: Record<string, string> = {
      sms: "پیامک",
      whatsapp: "واتساپ",
      push: "پوش",
    };
    return map[value] ?? value;
  }

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
      setMessage("قانون ذخیره شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ذخیره قانون ممکن نشد.");
    } finally {
      setSaving(false);
    }
  }

  async function removeRule(ruleId: string) {
    setMessage("");
    try {
      await api.delete(`/api/v1/sms-automations/${ruleId}`);
      setRules((current) => current.filter((item) => item.id !== ruleId));
      setMessage("قانون حذف شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "حذف قانون ممکن نشد.");
    }
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">اتوماسیون پیامک</span>
        <h1>قانون‌های نگهداشت و لاگ پیام‌ها.</h1>
        <p>قانون‌های پیام‌رسانی محدوده‌دار برای تمدید، غیرفعالی، تولد و هشدارهای اوج تراکم را مدیریت کن.</p>
      </header>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>سازنده قانون</span>
            <em>{loading ? "در حال بارگذاری..." : `${rules.length} قانون`}</em>
          </div>
          <div className="field-list">
            <div className="form-field">
              <label>نام قانون</label>
              <input value={ruleName} onChange={(event) => setRuleName(event.target.value)} />
            </div>
            <div className="form-field">
              <label>نوع محرک</label>
              <select value={triggerType} onChange={(event) => setTriggerType(event.target.value)}>
                {triggerOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>بازه / آستانه</label>
              <input value={windowValue} onChange={(event) => setWindowValue(event.target.value)} />
            </div>
            <div className="form-field">
              <label>قالب پیام</label>
              <textarea value={template} onChange={(event) => setTemplate(event.target.value)} rows={4} />
            </div>
            <div className="form-field">
              <label>کانال</label>
              <select value={channel} onChange={(event) => setChannel(event.target.value)}>
                <option value="sms">پیامک</option>
                <option value="whatsapp">واتساپ</option>
                <option value="push">پوش</option>
              </select>
            </div>
            <div className="form-field">
              <label>وضعیت</label>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="active">فعال</option>
                <option value="paused">متوقف</option>
              </select>
            </div>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={saveRule} disabled={saving}>
              {saving ? "در حال ذخیره..." : "ذخیره قانون"}
            </button>
            <span style={{ color: "var(--qf-muted)" }}>{message}</span>
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <span>قانون‌ها</span>
            <em>اتوماسیون‌های فعال</em>
          </div>
          <div className="field-list">
            {rules.length > 0 ? rules.map((rule) => (
              <div key={rule.id}>
                <strong>{rule.ruleName}</strong>
                <span>{formatTrigger(rule.triggerType)} · {formatChannel(rule.channel)} · {formatStatusValue(rule.status)}</span>
                <span>{rule.messageTemplate}</span>
                <div className="actions" style={{ marginTop: 8 }}>
                  <button className="button secondary" type="button" onClick={() => removeRule(rule.id)}>
                    حذف
                  </button>
                </div>
              </div>
            )) : (
              <div>
                <strong>هنوز قانونی تعریف نشده</strong>
                <span>اولین قانون را با سازنده سمت چپ ایجاد کن.</span>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="panel">
        <div className="section-head">
          <span>لاگ‌های اخیر</span>
          <em>تاریخچه ارسال</em>
        </div>
        <ul className="timeline">
          {logs.length > 0 ? logs.map((log) => (
            <li key={log.id}>
              <strong>{formatChannel(log.channel)} · {formatStatusValue(log.status)}</strong>
              <span>{log.message}</span>
              {log.createdAt ? <small style={{ color: "var(--qf-muted)" }}>{new Date(log.createdAt).toLocaleString()}</small> : null}
            </li>
          )) : (
            <li>
              <strong>هنوز لاگی ثبت نشده</strong>
              <span>وقتی پیام‌ها ارسال شوند، تاریخچه اینجا نمایش داده می‌شود.</span>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
