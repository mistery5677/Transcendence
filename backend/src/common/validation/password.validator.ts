import { applyDecorators } from '@nestjs/common';
import { IsString, Matches, MinLength } from 'class-validator';

// Single source of truth for the password policy. It mirrors the rules the
// signup form shows the user (Signup.tsx), so the client-side checklist and the
// server-side rejection can never drift apart. Applied to both account creation
// and password change.
export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_SPECIAL_CHARS = /[!@#$%^&*(),.?":{}|<>]/;

export function IsValidPassword() {
  return applyDecorators(
    IsString(),
    MinLength(PASSWORD_MIN_LENGTH, {
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
    }),
    Matches(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter',
    }),
    Matches(PASSWORD_SPECIAL_CHARS, {
      message: 'Password must contain at least one special character',
    }),
    Matches(/^\S*$/, { message: 'Password must not contain spaces' }),
  );
}
