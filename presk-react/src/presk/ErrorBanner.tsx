import { AlertCircle } from "lucide-react";

interface ErrorBannerProps {
  error: string;
}

export function ErrorBanner({ error }: ErrorBannerProps) {
  return (
    <div
      style={{
        background: "#450a0a",
        border: "1px solid #ef4444",
        color: "#fca5a5",
        padding: "16px",
        borderRadius: "10px",
        whiteSpace: "pre-wrap",
        fontFamily: "monospace",
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      <AlertCircle size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
      <div>
        <strong>Compilation Error:</strong>
        <pre style={{ margin: "8px 0 0 0", fontSize: "0.9rem" }}>{error}</pre>
      </div>
    </div>
  );
}
