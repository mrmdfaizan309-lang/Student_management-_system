"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, GraduationCap, KeyRound, LockKeyhole, Mail, Phone } from "lucide-react";

type Role = "ADMINISTRATOR" | "TEACHER" | "STUDENT";
type ContactMethod = "email" | "phone";
type SignInMethod = "password" | "otp";

const roleOptions: { value: Role; label: string }[] = [
  { value: "ADMINISTRATOR", label: "Administrator" },
  { value: "TEACHER", label: "Teacher" },
  { value: "STUDENT", label: "Student" },
];

export default function LoginForm() {
  const [step, setStep] = useState<"contact" | "verify">("contact");
  const [contactMethod, setContactMethod] = useState<ContactMethod>("email");
  const [identifier, setIdentifier] = useState("");
  const [role, setRole] = useState<Role>("ADMINISTRATOR");
  const [signInMethod, setSignInMethod] = useState<SignInMethod>("password");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (signInMethod === "otp" && !codeSent) {
        const response = await fetch("/api/auth/otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, method: contactMethod, role }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Unable to send the sign-in code");
        setCodeSent(true);
        setNotice(`Enter the six-digit code sent to your ${contactMethod === "email" ? "email" : "phone"}.`);
      } else {
        const response = await fetch(signInMethod === "password" ? "/api/auth/login" : "/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, method: contactMethod, role, ...(signInMethod === "password" ? { password } : { code }) }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Unable to sign in");
        window.location.reload();
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in");
    } finally {
      setBusy(false);
    }
  }

  function changeSignInMethod(method: SignInMethod) {
    setSignInMethod(method);
    setCodeSent(false);
    setCode("");
    setError("");
    setNotice("");
  }

  return <main className="auth-shell">
    <section className="auth-panel">
      <div className="auth-brand"><span className="brand-mark"><GraduationCap size={19} strokeWidth={2.5} /></span><span>Edu<span>Manage</span></span></div>
      <div className="auth-content">
        <p className="eyebrow">IQRA Academy</p>
        <h1>{step === "contact" ? "Sign in to your school" : "Welcome back"}</h1>
        <p className="auth-subtitle">{step === "contact" ? "Continue with the email address or mobile number on your account." : identifier}</p>

        {step === "contact" ? <form onSubmit={(event) => { event.preventDefault(); setError(""); setStep("verify"); }}>
          <div className="auth-segment" aria-label="Contact method">
            <button type="button" className={contactMethod === "email" ? "selected" : ""} onClick={() => setContactMethod("email")}><Mail size={15} /> Email</button>
            <button type="button" className={contactMethod === "phone" ? "selected" : ""} onClick={() => setContactMethod("phone")}><Phone size={15} /> Mobile</button>
          </div>
          <label className="auth-label" htmlFor="login-identifier">{contactMethod === "email" ? "Email address" : "Mobile number"}</label>
          <input id="login-identifier" className="auth-input" autoComplete={contactMethod === "email" ? "email" : "tel"} inputMode={contactMethod === "phone" ? "tel" : "email"} type={contactMethod === "email" ? "email" : "tel"} required value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder={contactMethod === "email" ? "name@school.com" : "+91 98765 43210"} />
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="primary-button auth-submit" type="submit">Continue</button>
        </form> : <form onSubmit={submit}>
          <button className="auth-back" type="button" onClick={() => { setStep("contact"); setCodeSent(false); setCode(""); setError(""); setNotice(""); }}><ArrowLeft size={16} /> Change contact</button>
          <fieldset className="role-picker">
            <legend>Your role</legend>
            {roleOptions.map((option) => <button key={option.value} type="button" aria-pressed={role === option.value} className={role === option.value ? "selected" : ""} onClick={() => { setRole(option.value); setCodeSent(false); setCode(""); }}>{option.label}</button>)}
          </fieldset>
          <div className="auth-segment" aria-label="Sign-in method">
            <button type="button" className={signInMethod === "password" ? "selected" : ""} onClick={() => changeSignInMethod("password")}><LockKeyhole size={15} /> Password</button>
            <button type="button" className={signInMethod === "otp" ? "selected" : ""} onClick={() => changeSignInMethod("otp")}><KeyRound size={15} /> One-time code</button>
          </div>
          {signInMethod === "password" ? <>
            <label className="auth-label" htmlFor="login-password">Password</label>
            <input id="login-password" className="auth-input" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" />
          </> : <>
            {codeSent && <p className="auth-notice" role="status">{notice}</p>}
            {codeSent && <><label className="auth-label" htmlFor="login-code">Six-digit code</label><input id="login-code" className="auth-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" />{notice && <button className="auth-resend" type="button" onClick={() => { setCodeSent(false); setCode(""); setNotice(""); }}>Send another code</button>}</>}
          </>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="primary-button auth-submit" type="submit" disabled={busy}>{busy ? "Please wait..." : signInMethod === "password" ? "Sign in" : codeSent ? "Verify code" : "Send code"}</button>
        </form>}
      </div>
      <p className="auth-footer">Secure access for your school community</p>
    </section>
  </main>;
}
