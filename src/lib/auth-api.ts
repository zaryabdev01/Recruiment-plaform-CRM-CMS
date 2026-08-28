import { api } from "./api";

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ChallengeToken {
  challenge_token: string;
  requires_2fa: true;
}

export interface CurrentUserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  system_role: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<TokenPair | ChallengeToken>("/auth/login", { email, password }),

  verify2fa: (challenge_token: string, code: string) =>
    api.post<TokenPair>("/auth/2fa/verify", { challenge_token, code }),

  me: () => api.get<CurrentUserResponse>("/users/me"),
};

export function isChallenge(res: TokenPair | ChallengeToken): res is ChallengeToken {
  return (res as ChallengeToken).requires_2fa === true;
}
