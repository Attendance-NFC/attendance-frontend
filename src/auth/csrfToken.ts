// Reads the csrfToken cookie's value directly — this one isn't httpOnly,
// so unlike the refresh token, JS on OUR OWN origin can read it. That's
// exactly what makes the double-submit check work: this code can read it
// because it's running on the same origin that received the cookie, which
// a different site's forged request cannot replicate.
export function getCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrfToken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}