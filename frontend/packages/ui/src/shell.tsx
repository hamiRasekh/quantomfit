import type { ReactNode } from "react";

type ShellProps = {
  title: string;
  children: ReactNode;
};

export function Shell({ title, children }: ShellProps) {
  return (
    <div className="qf-shell">
      <div className="qf-shell__inner">
        <header className="qf-shell__header">
          <div>
            <p className="qf-shell__eyebrow">QuantomFit</p>
            <h1 className="qf-shell__title">{title}</h1>
          </div>
          <div className="qf-badge">v0.1</div>
        </header>
        <main className="qf-main">{children}</main>
      </div>
    </div>
  );
}
