/**
 * Reads the JWT signing secret from the environment at runtime.
 *
 * The secret must never live in source control; it is provisioned via the
 * gitignored root .env (and, in a later phase, HashiCorp Vault). This helper
 * fails fast so the backend never registers JwtModule with an empty or
 * undefined signing key (which would allow trivial token forgery).
 *
 * @throws Error when JWT_SECRET is unset, empty, or whitespace-only.
 *         The message names JWT_SECRET but never interpolates its value.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error(
      'JWT_SECRET is not set — refusing to start without a JWT signing secret',
    );
  }
  return secret;
}
