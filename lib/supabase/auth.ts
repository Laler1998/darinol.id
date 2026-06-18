import { getSupabaseBrowserClient, isSupabaseConfigured } from "./client";
import type { Database } from "./types";

type ProfilePreview = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "email" | "plan" | "payment_status"
>;

function friendlyAuthMessage(message: string, code?: string, status?: number) {
  const lower = message.toLowerCase();
  const lowerCode = code?.toLowerCase() ?? "";

  if (
    lowerCode.includes("invalid_credentials") ||
    lower.includes("invalid login credentials")
  ) {
    return "Akun tidak ditemukan atau password salah. Pastikan email sama persis dengan saat daftar, lalu coba lagi.";
  }

  if (
    lowerCode.includes("email_not_confirmed") ||
    lower.includes("email not confirmed")
  ) {
    return "Email belum dikonfirmasi. Cek inbox atau spam dulu, lalu klik link konfirmasi dari Darinol.id/Supabase.";
  }

  if (
    lowerCode.includes("user_already_exists") ||
    lower.includes("user already registered") ||
    lower.includes("already registered")
  ) {
    return "Email ini sudah terdaftar. Pakai tab Masuk dengan password yang sama seperti di komputer.";
  }

  if (
    lowerCode.includes("signup_disabled") ||
    lower.includes("signups not allowed") ||
    lower.includes("signup disabled")
  ) {
    return "Pendaftaran akun sedang dinonaktifkan. Coba masuk kalau sudah punya akun, atau hubungi admin Darinol.id.";
  }

  if (status === 429 || lower.includes("rate limit") || lower.includes("too many")) {
    return "Terlalu banyak percobaan login. Tunggu sebentar, lalu coba lagi.";
  }

  if (lower.includes("password") && (lower.includes("weak") || lower.includes("short"))) {
    return "Password belum sesuai. Gunakan minimal 6 karakter.";
  }

  if (
    lower.includes("failed to fetch") ||
    lower.includes("network") ||
    lower.includes("timeout")
  ) {
    return "Koneksi ke server login gagal. Cek internet mobile kamu, matikan VPN/ad blocker kalau ada, lalu coba lagi.";
  }

  return `Login belum berhasil: ${message}`;
}

function friendlyUnexpectedAuthMessage(error: unknown) {
  if (error instanceof Error) {
    return friendlyAuthMessage(error.message);
  }

  return "Login belum berhasil karena ada kendala tidak terduga. Coba lagi sebentar lagi.";
}

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
  }).catch((error: unknown) => ({
    error: {
      message: friendlyUnexpectedAuthMessage(error),
    },
  }));

  if (error) {
    const authError = error as { message: string; code?: string; status?: number };

    return {
      ok: false,
      message: friendlyAuthMessage(authError.message, authError.code, authError.status),
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
  }).catch((error: unknown) => ({
    error: {
      message: friendlyUnexpectedAuthMessage(error),
    },
  }));

  if (error) {
    const authError = error as { message: string; code?: string; status?: number };

    return {
      ok: false,
      message: friendlyAuthMessage(authError.message, authError.code, authError.status),
    };
  }

  return {
    ok: true,
    message: "Login berhasil.",
  };
}

export async function sendPasswordResetEmail(email: string, redirectTo: string) {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      message: "Supabase belum dikonfigurasi.",
    };
  }

  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  }).catch((error: unknown) => ({
    error: {
      message: friendlyUnexpectedAuthMessage(error),
    },
  }));

  if (error) {
    const authError = error as { message: string; code?: string; status?: number };

    return {
      ok: false,
      message: friendlyAuthMessage(authError.message, authError.code, authError.status),
    };
  }

  return {
    ok: true,
    message: "Link reset password sudah dikirim. Cek inbox atau spam email kamu.",
  };
}

export async function updateCurrentUserPassword(password: string) {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      message: "Supabase belum dikonfigurasi.",
    };
  }

  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.auth.updateUser({
    password,
  }).catch((error: unknown) => ({
    error: {
      message: friendlyUnexpectedAuthMessage(error),
    },
  }));

  if (error) {
    const authError = error as { message: string; code?: string; status?: number };

    return {
      ok: false,
      message: friendlyAuthMessage(authError.message, authError.code, authError.status),
    };
  }

  return {
    ok: true,
    message: "Password baru sudah tersimpan. Kamu bisa login lagi di device lain.",
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
