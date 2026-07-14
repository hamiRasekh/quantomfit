"use client";

import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type BaseInputProps = {
  label?: string;
  error?: string;
  hint?: string;
  prefixText?: string;
};

export type QFInputProps = InputHTMLAttributes<HTMLInputElement> & BaseInputProps;

export function QFInput({ label, error, hint, prefixText, className = "", id, ...props }: QFInputProps) {
  const inputId = id || `qf-input-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <div className="qf-form-field">
      {label && <label htmlFor={inputId}>{label}</label>}
      <div className="qf-input-prefix-wrapper">
        {prefixText && <span className="qf-input-prefix">{prefixText}</span>}
        <input
          id={inputId}
          className={`qf-input ${prefixText ? "qf-input-prefixed" : ""} ${error ? "qf-input-error" : ""} ${className}`}
          {...props}
        />
      </div>
      {hint && <span className="qf-input-hint">{hint}</span>}
      {error && <span className="qf-input-error-msg">{error}</span>}
    </div>
  );
}

export type QFSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export function QFSelect({ label, error, hint, className = "", id, children, ...props }: QFSelectProps) {
  const selectId = id || `qf-select-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <div className="qf-form-field">
      {label && <label htmlFor={selectId}>{label}</label>}
      <select
        id={selectId}
        className={`qf-input qf-select ${error ? "qf-input-error" : ""} ${className}`}
        {...props}
      >
        {children}
      </select>
      {hint && <span className="qf-input-hint">{hint}</span>}
      {error && <span className="qf-input-error-msg">{error}</span>}
    </div>
  );
}

export type QFTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export function QFTextarea({ label, error, hint, className = "", id, ...props }: QFTextareaProps) {
  const textareaId = id || `qf-textarea-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <div className="qf-form-field">
      {label && <label htmlFor={textareaId}>{label}</label>}
      <textarea
        id={textareaId}
        className={`qf-input qf-textarea ${error ? "qf-input-error" : ""} ${className}`}
        {...props}
      />
      {hint && <span className="qf-input-hint">{hint}</span>}
      {error && <span className="qf-input-error-msg">{error}</span>}
    </div>
  );
}

export type QFToggleProps = InputHTMLAttributes<HTMLInputElement> & {
  nameText: string;
  descText?: string;
};

export function QFToggle({ nameText, descText, checked, className = "", ...props }: QFToggleProps) {
  return (
    <label className="qf-toggle-row">
      <div className="qf-toggle-info">
        <span className="qf-toggle-name">{nameText}</span>
        {descText && <span className="qf-toggle-desc">{descText}</span>}
      </div>
      <input
        type="checkbox"
        className="qf-toggle-input"
        checked={checked}
        {...props}
      />
      <div className={`qf-toggle-switch ${checked ? "active" : ""}`} />
    </label>
  );
}
