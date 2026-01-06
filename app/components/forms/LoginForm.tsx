    "use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.ok) {
        setMessage({ type: "success", text: `Login berhasil! Selamat datang ${data.username}` });
        setUsername("");
        setPassword("");
        router.push("/menu");
      } else {
        setMessage({ type: "error", text: `Login gagal: ${data.error}` });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan saat login" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a1628 0%, #1a2942 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "420px",
        padding: "40px",
        background: "rgba(15, 30, 50, 0.8)",
        backdropFilter: "blur(10px)",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      }}>
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#ffffff",
            margin: "0 0 8px 0",
            letterSpacing: "-0.5px",
          }}>
            XIORE
          </h1>
          <p style={{
            fontSize: "14px",
            color: "rgba(255, 255, 255, 0.6)",
            margin: "0",
          }}>
            Sign in to your account
          </p>
        </div>

        {message && (
          <div style={{
            marginBottom: "20px",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            backgroundColor: message.type === "success"
              ? "rgba(76, 175, 80, 0.1)"
              : "rgba(244, 67, 54, 0.1)",
            color: message.type === "success"
              ? "#4CAF50"
              : "#F44336",
            border: `1px solid ${message.type === "success" ? "rgba(76, 175, 80, 0.3)" : "rgba(244, 67, 54, 0.3)"}`,
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "rgba(255, 255, 255, 0.8)",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              placeholder="Enter your username"
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: "14px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "8px",
                color: "#ffffff",
                boxSizing: "border-box",
                transition: "all 0.3s ease",
                outline: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.borderColor = "rgba(100, 150, 255, 0.4)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
              }}
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "rgba(255, 255, 255, 0.8)",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Enter your password"
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: "14px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "8px",
                color: "#ffffff",
                boxSizing: "border-box",
                transition: "all 0.3s ease",
                outline: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.borderColor = "rgba(100, 150, 255, 0.4)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !username || !password}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#ffffff",
              backgroundColor: loading || !username || !password
                ? "rgba(100, 150, 255, 0.4)"
                : "linear-gradient(135deg, #6496FF 0%, #4A7FFF 100%)",
              border: "none",
              borderRadius: "8px",
              cursor: loading || !username || !password ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              boxShadow: loading || !username || !password
                ? "none"
                : "0 4px 15px rgba(100, 150, 255, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (!loading && username && password) {
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(100, 150, 255, 0.4)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(100, 150, 255, 0.3)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
