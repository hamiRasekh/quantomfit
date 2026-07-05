import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const styles = variant === "primary" ? "qf-button qf-button--primary" : "qf-button qf-button--secondary";

  return <button className={`${styles} ${className}`.trim()} {...props} />;
}
