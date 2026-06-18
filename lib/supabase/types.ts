export type PlanCode = "free" | "starter" | "supporter";
export type PaymentStatus = "none" | "pending" | "paid" | "rejected";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          plan: PlanCode;
          payment_status: PaymentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          plan?: PlanCode;
          payment_status?: PaymentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          plan?: PlanCode;
          payment_status?: PaymentStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      saved_ideas: {
        Row: {
          id: string;
          user_id: string;
          topic: string;
          content: string;
          source_urls: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          topic: string;
          content: string;
          source_urls?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          topic?: string;
          content?: string;
          source_urls?: string[] | null;
          created_at?: string;
        };
      };
      manual_payments: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          method: string;
          status: PaymentStatus;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          method?: string;
          status?: PaymentStatus;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          method?: string;
          status?: PaymentStatus;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
