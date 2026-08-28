"use client";

import { useState } from "react";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function SignupForm({ instagram }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [state, setState] = useState("idle"); // idle | sending | done
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!EMAIL.test(email.trim())) {
      setError("That email doesn't look right — mind checking it?");
      return;
    }

    setState("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          phone: phone.trim(),
          company, // bots fill this in; humans never see it
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setState("done");
    } catch (err) {
      setState("idle");
      setError(err.message || "Couldn't save that. Try again in a moment?");
    }
  }

  if (state === "done") {
    return (
      <div className="thanks">
        <h2>You're on the list.</h2>
        <p>
          We'll write once when the first pieces are ready — and not before.
          No weekly newsletter, we promise.
        </p>
        {instagram ? (
          <p style={{ marginBottom: 0 }}>
            Everything before that goes here:{" "}
            <a
              className="textlink"
              href={`https://instagram.com/${instagram}`}
              target="_blank"
              rel="noreferrer"
            >
              @{instagram}
            </a>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="row">
        <input
          className="field"
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Your email"
          aria-label="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="field"
          type="tel"
          name="phone"
          inputMode="tel"
          autoComplete="tel"
          placeholder="WhatsApp (optional)"
          aria-label="WhatsApp number, optional"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button className="btn" type="submit" disabled={state === "sending"}>
          {state === "sending" ? "One moment" : "Notify me"}
        </button>
      </div>

      <input
        className="hp"
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />

      <p className={`note ${error ? "err" : ""}`} role="status">
        {error || "One email when we open. Nothing else."}
      </p>
    </form>
  );
}
