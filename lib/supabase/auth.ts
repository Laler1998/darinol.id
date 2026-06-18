import { getSupabaseBrowserClient, isSupabaseConfigured } from "./client";
import type { Database } from "./types";

type ProfilePreview = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "email" | "plan" | "payment_status"
>;

export async function signUpWithPassword(email: string, password: string) {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      message: "Supabase belum dikonfigurasi.",
    };
  }

  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return {
      ok: false,
      message: error.message,
    };
  }

  return {
    ok: true,
    message: "Akun berhasil dibuat. Kalau email confirmation aktif, cek email kamu.",
  };
}

export async function signInWithPassword(email: string, password: string) {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      message: "Supabase belum dikonfigurasi.",
    };
  }

  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      ok: false,
      message: error.message,
    };
  }

  return {
    ok: true,
    message: "Login berhasil.",
  };
}

export async function getCurrentUserProfile(): Promise<ProfilePreview | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id,email,plan,payment_status")
    .eq("id", user.id)
    .single();

  return data;
}
