// Deliberately not localStorage/sessionStorage — keeping the token in memory
// only reduces exposure to XSS reading it off disk. It does mean a page
// refresh logs the person out, which is a fine tradeoff until real auth
// (with a refresh flow) is built.
let token: string | null = null;

export function setAuthToken(value: string | null) {
  token = value;
}

export function getAuthToken() {
  return token;
}