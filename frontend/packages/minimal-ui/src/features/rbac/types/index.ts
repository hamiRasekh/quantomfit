export enum PermissionModule {
  DASHBOARD = 'DASHBOARD',
  ORDERS = 'ORDERS',
  MATERIALS = 'MATERIALS',
  PRODUCTION = 'PRODUCTION',
  CONCRETE_MIX = 'CONCRETE_MIX',
  PERSONNEL = 'PERSONNEL',
  VEHICLES = 'VEHICLES',
  FINANCIAL = 'FINANCIAL',
  COMPANY = 'COMPANY',
  RBAC = 'RBAC',
  PRODUCTS = 'PRODUCTS',
  INVENTORY = 'INVENTORY',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS',
  ACTIVITY_RECORDS = 'ACTIVITY_RECORDS',
  APPROVALS = 'APPROVALS',
  ASSIGNMENTS = 'ASSIGNMENTS',
}

export enum PermissionAction {
  VIEW = 'VIEW',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
}

export interface Role {
  id: string;
  name: string;
  code?: string | null;
  description?: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  permissions?: Permission[];
  userCount?: number;
}

export interface Permission {
  id: string;
  module: PermissionModule;
  action: PermissionAction;
  resource?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
}

export interface UpdateRolePermissionsDto {
  permissionIds: string[];
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  createdAt: string;
  updatedAt: string;
  role?: Role;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface AssignRoleDto {
  roleId: string;
}

export type AuthUserPermissions = {
  permissions?: string[];
  rbacRoleId?: string | null;
  rbacRoleCode?: string | null;
  rbacRoleName?: string | null;
  isSystemAdmin?: boolean;
};
