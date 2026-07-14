export interface FooterLink {
  name: string;
  href: string;
  external?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterSettings {
  description?: string;
  address?: string;
  email?: string;
  instagram_url?: string;
  links?: FooterLink[];
  columns?: FooterColumn[];
  copyright?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  enamad_id?: string;
  enamad_code?: string;
  samandehi_id?: string;
  samandehi_code?: string;
}

