import { createContext, useContext } from 'react';

const AuthContext = createContext({
  user: null,
  signin: async () => {},
  signup: async () => {},
  signout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext };
