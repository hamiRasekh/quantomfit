// Mini-ERP Routes Configuration

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

const auth = {
  login: '/login',
  register: '/register',
};

const approvals = {
  root: '/approvals',
  list: '/approvals',
};

const assignments = {
  root: '/assignments',
  list: '/assignments',
  details: (id: string) => `/assignments/${id}`,
  orders: {
    list: '/assignments/orders',
    dashboard: (id: string) => `/assignments/orders/${id}`,
    assignmentsList: (id: string) => `/assignments/orders/${id}/assignments`,
  },
};

const activities = {
  root: '/activities',
  list: '/activities',
};

const activityCategories = {
  root: '/activity-categories',
  list: '/activity-categories',
};

const activityRecords = {
  root: '/activity-records',
  list: '/activity-records',
};

const personnel = {
  root: '/personnel',
  list: '/personnel',
  details: (id: string) => `/personnel/${id}`,
};

const positions = {
  root: '/positions',
  list: '/positions',
};

const processes = {
  root: '/processes',
  list: '/processes',
};

const products = {
  root: '/products',
  list: '/products',
  details: (id: string) => `/products/${id}`,
};

const productCategories = {
  root: '/product-categories',
  list: '/product-categories',
};

const attributes = {
  root: '/attributes',
  list: '/attributes',
};

const attributeValues = {
  root: '/attribute-values',
  details: (attributeId: string) => `/attribute-values/${attributeId}`,
};

const bom = {
  root: '/bom',
  list: '/bom',
};

const codingRules = {
  root: '/coding-rules',
  list: '/coding-rules',
};

const productionOrders = {
  root: '/production-orders',
  list: '/production-orders',
  new: '/production-orders/new',
  details: (id: string) => `/production-orders/${id}`,
  edit: (id: string) => `/production-orders/${id}`,
  print: (id: string) => `/production-orders/${id}/print`,
};

const defects = {
  root: '/defects',
  list: '/defects',
  new: '/defects/new',
  details: (id: string) => `/defects/${id}`,
  print: (id: string) => `/defects/${id}/print`,
};

const inventory = {
  root: '/inventory/ledger',
  ledger: '/inventory/ledger',
  rawMaterialCategories: '/inventory/raw-material-categories',
  rawMaterials: '/inventory/raw-materials',
  procurement: '/inventory/procurement',
};

const reports = {
  root: '/reports',
  wages: '/reports/wages',
  overhead: '/reports/overhead',
  productCost: '/reports/product-cost',
  materials: '/reports/material-requirements',
  defects: '/reports/defects',
};

const notifications = {
  root: '/notifications',
  list: '/notifications',
};

const auditLogs = {
  root: '/audit-logs',
  list: '/audit-logs',
};

const units = {
  root: '/units',
  list: '/units',
};

const customers = {
  root: '/customers',
  list: '/customers',
};

const orders = {
  root: '/orders',
  list: '/orders',
  new: '/orders/new',
  details: (id: string) => `/orders/${id}`,
  dashboard: (id: string) => `/orders/${id}/dashboard`,
  reports: {
    wages: (id: string) => `/orders/${id}/reports/wages`,
    progress: (id: string) => `/orders/${id}/reports/progress`,
    materials: (id: string) => `/orders/${id}/reports/materials`,
  },
};

const workCalendar = {
  root: '/work-calendar',
  list: '/work-calendar',
};

const settings = {
  root: '/settings',
  roles: '/settings/roles',
  rolePermissions: (id: string) => `/settings/roles/${id}`,
  userRoles: '/settings/user-roles',
  company: '/settings/company',
  system: '/settings/system',
  backup: '/settings/backup',
  workCalendar: '/settings/work-calendar',
};

export const paths = {
  auth,
  dashboard: {
    root: ROOTS.DASHBOARD,
    approvals,
    assignments,
    activities,
    activityCategories,
    activityRecords,
    personnel,
    positions,
    processes,
    products,
    productCategories,
    attributes,
    attributeValues,
    bom,
    codingRules,
    productionOrders,
    defects,
    inventory,
    reports,
    notifications,
    auditLogs,
    settings,
    units,
    customers,
    orders,
    workCalendar,
  },
  approvals,
  assignments,
  activities,
  activityCategories,
  activityRecords,
  personnel,
  positions,
  processes,
  products,
  productCategories,
  attributes,
  attributeValues,
  bom,
  codingRules,
  productionOrders,
  defects,
  inventory,
  reports,
  notifications,
  auditLogs,
  settings,
  units,
  customers,
  orders,
  workCalendar,
} as const;

