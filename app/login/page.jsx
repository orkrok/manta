"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Pattern from "@/components/Pattern";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "오류가 발생했습니다.");
        setLoading(false);
        return;
      }

      // 성공 시 홈으로 리다이렉트
      router.push("/");
      router.refresh();
    } catch (err) {
      setError("네트워크 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <Pattern />
      <div className="w-full max-w-md p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-white">
            {isLogin ? "로그인" : "회원가입"}
          </h1>
          <p className="text-white/70">
            {isLogin
              ? "계정에 로그인하세요"
              : "새 계정을 만드세요"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <Label htmlFor="name" className="text-white">
                이름
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="이름을 입력하세요"
                className="mt-2"
              />
            </div>
          )}

          <div>
            <Label htmlFor="email" className="text-white">
              이메일
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일을 입력하세요"
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-white">
              비밀번호
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요"
              required
              minLength={6}
              className="mt-2"
            />
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-lg btn-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "처리 중..." : isLogin ? "로그인" : "회원가입"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setFormData({ email: "", password: "", name: "" });
            }}
            className="text-accent hover:text-accent-hover transition"
          >
            {isLogin
              ? "계정이 없으신가요? 회원가입"
              : "이미 계정이 있으신가요? 로그인"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-white/70 hover:text-white transition text-sm"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

