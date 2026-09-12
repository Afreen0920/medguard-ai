import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    navigate("/assessment");
  };

  return (
    <div className="min-h-screen bg-[#efefef] px-4 py-10">
      <div className="mx-auto max-w-[760px] rounded-[18px] bg-[#f2f2f2] p-8 md:p-10">
        <div className="mb-7 text-[0.78rem] font-semibold uppercase tracking-[0.28em] text-[#2f3841]">
          Welcome
        </div>

        <h1 className="text-[3.1rem] font-black leading-[0.9] tracking-[-0.06em] text-[#cfd3d4]">
          Sign in to <span className="text-[#2f3841]">MedGuard AI</span>
        </h1>

        <div className="mt-8 space-y-6">
          <label className="block">
            <span className="mb-2 block text-[1.02rem] font-medium text-slate-800">Email address</span>
            <input
              type="email"
              placeholder="name@medguard.ai"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-[#ced4d3] bg-[#edf4f4] px-4 py-3 text-[1.15rem] text-slate-900 placeholder:text-slate-500 focus:border-[#2ea58d] focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[1.02rem] font-medium text-slate-800">Password</span>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-[#ced4d3] bg-[#edf4f4] px-4 py-3 text-[1.15rem] text-slate-900 placeholder:text-slate-500 focus:border-[#2ea58d] focus:outline-none"
            />
          </label>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <button
            type="button"
            onClick={handleLogin}
            className="w-full rounded-2xl bg-[#2ba786] px-4 py-4 text-[1.15rem] font-semibold text-white shadow-sm transition hover:bg-[#248f72]"
          >
            Login
          </button>

          <button
            type="button"
            className="w-full rounded-2xl border border-[#cfd7d5] bg-[#f6f7f7] px-4 py-4 text-[1.15rem] font-medium text-slate-700 transition hover:bg-[#eef1f1]"
          >
            Continue with Google
          </button>

          <div className="pt-1 text-center text-[1.08rem] text-slate-600">
            Need an account? <button type="button" onClick={() => navigate("/assessment")} className="font-semibold text-[#2ba786] underline-offset-2 hover:underline">Sign Up</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;