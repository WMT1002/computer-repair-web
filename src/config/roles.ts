import { UserRoleCode } from '../types';

export const ROLE_CODES = {
  ADMIN: 0,
  STAFF: 1,
  MANAGER: 2,
} as const;

export const normalizeRoleCode = (value?: number | null): UserRoleCode => {
  if (value === ROLE_CODES.ADMIN || value === ROLE_CODES.MANAGER) return value;
  return ROLE_CODES.STAFF;
};

export const roleLabels: Record<UserRoleCode, string> = {
  [ROLE_CODES.ADMIN]: '系統管理員',
  [ROLE_CODES.STAFF]: '一般工程師',
  [ROLE_CODES.MANAGER]: '維修主管',
};

export const getRoleLabel = (value?: number | null): string => {
  return roleLabels[normalizeRoleCode(value)];
};

export const getRoleStyle = (value?: number | null) => {
  const code = normalizeRoleCode(value);
  if (code === ROLE_CODES.ADMIN) {
    return {
      color: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.15)',
      border: 'rgba(168, 85, 247, 0.35)',
      badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    };
  }
  if (code === ROLE_CODES.MANAGER) {
    return {
      color: '#14b8a6',
      bg: 'rgba(20, 184, 166, 0.15)',
      border: 'rgba(20, 184, 166, 0.35)',
      badgeClass: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    };
  }
  return {
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.15)',
    border: 'rgba(56, 189, 248, 0.35)',
    badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  };
};

export const isAdmin = (value?: number | null): boolean => {
  return normalizeRoleCode(value) === ROLE_CODES.ADMIN;
};
