import 'dotenv/config';

const nodeEnv=process.env.NODE_ENV||'development';

export const config = {
  port: Number(process.env.API_PORT || 3001),
  databaseUrl: process.env.DATABASE_URL || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://127.0.0.1:5173',
  authBypass: nodeEnv!=='production'&&process.env.DEV_AUTH_BYPASS==='true',
  nodeEnv,
  resendApiKey: process.env.RESEND_API_KEY || '',
  emailFrom: process.env.EMAIL_FROM || 'SecureVision AI <onboarding@resend.dev>',
  contactToEmail: process.env.CONTACT_TO_EMAIL || '',
  appPublicUrl: process.env.APP_PUBLIC_URL || 'http://127.0.0.1:5173',
};

export function configurationSummary() {
  return {
    environment: config.nodeEnv,
    database: config.databaseUrl ? 'postgresql' : 'in-memory development store',
    authentication: config.authBypass ? 'development bypass' : 'firebase',
    email: config.resendApiKey ? 'resend' : 'not configured',
  };
}
