// App parameters - reads from env vars or URL params
export const appParams = {
  appId: import.meta.env.VITE_APP_ID || 'rivalwatch',
  token: null,
  fromUrl: typeof window !== 'undefined' ? window.location.href : '/',
};
