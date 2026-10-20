let tokens = { token: null, refreshToken: null }

export const setAuthTokens = (nextTokens) => {
  tokens = {
    token: nextTokens?.token ?? null,
    refreshToken: nextTokens?.refreshToken ?? null,
  }
}

export const getAuthTokens = () => tokens

export const clearAuthTokens = () => {
  tokens = { token: null, refreshToken: null }
}
