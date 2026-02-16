export interface User {
  name: string;
  email: string;
  avatar?: string;
  role: string;
  permissions: { name: string }[];
}

export type NavItem = {
  title: string;
  url: string;
  icon?: React.ReactNode;
  roles?: string[];
  requiredPermission?: string;
  items?: NavItem[];
};