"use client";

import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function useCheckLogin() {
  const user = useSelector((state) => state.auth.user);
  const router = useRouter();
  const checkLogin = () => {
    // If we're on an admin route, admin has their own auth — skip user check
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      return true;
    }

    const token = localStorage.getItem("token");

    if (!user && !token) {
      toast.error("Please login first!");
      router.push("/login");
      return false;
    }
    return true;
  };

  return checkLogin;
}
