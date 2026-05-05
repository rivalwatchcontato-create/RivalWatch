// Stub database for standalone deployment
// Replace these with your actual API calls (Supabase, Firebase, etc.)

const makeEntity = (name) => ({
  list: async () => [],
  filter: async () => [],
  get: async () => null,
  create: async (data) => ({ id: Date.now().toString(), ...data }),
  update: async (id, data) => ({ id, ...data }),
  delete: async (id) => ({ id }),
});

export const db = {
  auth: {
    isAuthenticated: async () => false,
    me: async () => null,
    logout: (redirectUrl) => {
      window.location.href = redirectUrl || '/';
    },
    redirectToLogin: (fromUrl) => {
      window.location.href = `/api/auth/login?from=${encodeURIComponent(fromUrl || window.location.href)}`;
    },
    updateMe: async (data) => ({}),
  },
  entities: new Proxy({}, {
    get: (_, entityName) => makeEntity(entityName),
  }),
  integrations: {
    Core: {
      UploadFile: async () => ({ file_url: '' }),
      SendEmail: async () => ({}),
      InvokeLLM: async ({ prompt }) => ({ choices: [{ message: { content: 'LLM não disponível no modo standalone.' } }] }),
    },
  },
};
