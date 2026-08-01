"use client";

import { useState } from "react";
import { X, Loader2, Check, Zap } from "lucide-react";

interface CreditBundle {
  id: string;
  credits: number;
  bonus: number;
  price: number;
  label: string;
  popular?: boolean;
  bestValue?: boolean;
}

const BUNDLES: CreditBundle[] = [
  { id: "starter", credits: 20, bonus: 0, price: 5, label: "Starter" },
  { id: "popular", credits: 50, bonus: 5, price: 10, label: "Popular", popular: true },
  { id: "best-value", credits: 100, bonus: 20, price: 18, label: "Best Value", bestValue: true },
];

function getTotalCredits(b: CreditBundle) {
  return b.credits + b.bonus;
}

export function CreditsModal({
  open,
  onClose,
  creatorId,
  onPurchased,
}: {
  open: boolean;
  onClose: () => void;
  creatorId: string;
  onPurchased?: () => void;
}) {
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  const [paymentProvider, setPaymentProvider] = useState<"stripe" | "paystack">("stripe");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handlePurchase() {
    if (!selectedBundle) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/credits/buy/${paymentProvider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId, bundleId: selectedBundle }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Purchase failed");
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card-dark"
        style={{
          maxWidth: "480px",
          width: "100%",
          padding: "32px",
          borderRadius: "8px",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--gray)",
          }}
        >
          <X style={{ width: "20px", height: "20px" }} />
        </button>

        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(232, 64, 44, 0.15)",
              marginBottom: "12px",
            }}
          >
            <Zap style={{ width: "24px", height: "24px", color: "var(--red-bright)" }} />
          </div>
          <h2 className="font-serif-display" style={{ fontSize: "24px", fontStyle: "italic" }}>
            Buy Credits
          </h2>
          <p style={{ color: "var(--gray)", fontSize: "13px", marginTop: "4px" }}>
            Credits never expire. Use them anytime.
          </p>
        </div>

        {/* Bundle selection */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
          {BUNDLES.map((bundle) => {
            const total = getTotalCredits(bundle);
            const selected = selectedBundle === bundle.id;
            return (
              <button
                key={bundle.id}
                onClick={() => setSelectedBundle(bundle.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderRadius: "6px",
                  border: selected
                    ? "2px solid var(--red-bright)"
                    : "1px solid var(--line)",
                  background: selected ? "rgba(232, 64, 44, 0.08)" : "var(--bg-raised)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      border: selected ? "6px solid var(--red-bright)" : "2px solid var(--line)",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="font-serif-display" style={{ fontSize: "16px" }}>
                        {total} credits
                      </span>
                      {bundle.popular && (
                        <span className="font-mono-label" style={{ fontSize: "10px", color: "var(--red-bright)", padding: "2px 6px", background: "rgba(232,64,44,0.15)", borderRadius: "3px" }}>
                          POPULAR
                        </span>
                      )}
                      {bundle.bestValue && (
                        <span className="font-mono-label" style={{ fontSize: "10px", color: "#22c55e", padding: "2px 6px", background: "rgba(34,197,94,0.15)", borderRadius: "3px" }}>
                          BEST VALUE
                        </span>
                      )}
                    </div>
                    {bundle.bonus > 0 && (
                      <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)" }}>
                        {bundle.credits} + {bundle.bonus} bonus
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-serif-display" style={{ fontSize: "20px" }}>
                  ${bundle.price}
                </span>
              </button>
            );
          })}
        </div>

        {/* Payment provider selection */}
        <div style={{ marginBottom: "24px" }}>
          <span className="font-mono-label" style={{ fontSize: "11px", color: "var(--gray)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px", display: "block" }}>
            Payment Method
          </span>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => setPaymentProvider("stripe")}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "4px",
                border: paymentProvider === "stripe" ? "2px solid var(--red-bright)" : "1px solid var(--line)",
                background: paymentProvider === "stripe" ? "rgba(232,64,44,0.08)" : "transparent",
                cursor: "pointer",
                color: paymentProvider === "stripe" ? "var(--paper)" : "var(--gray)",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Card (Stripe)
            </button>
            <button
              onClick={() => setPaymentProvider("paystack")}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "4px",
                border: paymentProvider === "paystack" ? "2px solid var(--red-bright)" : "1px solid var(--line)",
                background: paymentProvider === "paystack" ? "rgba(232,64,44,0.08)" : "transparent",
                cursor: "pointer",
                color: paymentProvider === "paystack" ? "var(--paper)" : "var(--gray)",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Paystack
            </button>
          </div>
        </div>

        {error && (
          <p style={{ color: "var(--red-bright)", fontSize: "13px", marginBottom: "16px", textAlign: "center" }}>
            {error}
          </p>
        )}

        <button
          onClick={handlePurchase}
          disabled={!selectedBundle || loading}
          className="btn btn-primary"
          style={{
            width: "100%",
            justifyContent: "center",
            opacity: !selectedBundle || loading ? 0.5 : 1,
            cursor: !selectedBundle || loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? (
            <>
              <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
              Redirecting...
            </>
          ) : (
            <>
              <Check style={{ width: "16px", height: "16px" }} />
              Continue to Payment
            </>
          )}
        </button>

        <p style={{ textAlign: "center", fontSize: "11px", color: "var(--gray)", marginTop: "16px" }}>
          Secure payment via {paymentProvider === "stripe" ? "Stripe" : "Paystack"}. Credits added instantly after payment.
        </p>
      </div>
    </div>
  );
}
