export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BLOB_READ_WRITE_TOKEN?: string;
      BLOB_STORE_ID?: string;
      CRON_SECRET?: string;
      DATABASE_URL?: string;
      GDELT_MAX_RECORDS?: string;
      GDELT_QUERY?: string;
      NEXT_PUBLIC_SITE_URL?: string;
      NEWS_API_KEY?: string;
      NEWS_COUNTRY?: string;
      NEWS_PAGE_SIZE?: string;
      OPENROUTER_API_KEY?: string;
      RESEND_API_KEY?: string;
      RESEND_EMAIL_DOMAIN?: string;
      SPONSOR_NOTIFICATION_EMAIL?: string;
      VERCEL_OIDC_TOKEN?: string;
      YOUTUBE_API_KEY?: string;
      YOUTUBE_REGION_CODES?: string;
    }
  }
}
