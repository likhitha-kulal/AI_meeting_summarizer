import { Toaster } from "react-hot-toast";

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      toastOptions={{
        duration: 4000,
        style: {
          background: "rgba(15, 12, 41, 0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.10)",
          color: "#f1f5f9",
          borderRadius: "14px",
          fontSize: "13px",
          fontWeight: 500,
          padding: "12px 16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
          maxWidth: "360px",
        },
        success: {
          iconTheme: { primary: "#34d399", secondary: "#022c22" },
          style: {
            borderColor: "rgba(52,211,153,0.2)",
          },
        },
        error: {
          iconTheme: { primary: "#f87171", secondary: "#450a0a" },
          style: {
            borderColor: "rgba(248,113,113,0.2)",
          },
        },
      }}
    />
  );
}
