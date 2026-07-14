export interface Customer {
    id: string;
    title: string;
    name: string;
    lastname: string;
    mobile?: string;
    address?: string;
    balance: number;
    isActive: boolean;
    contractFileName?: string | null;
    contractOriginalName?: string | null;
    contractMimeType?: string | null;
    contractSize?: number | null;
    contractUploadedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCustomerDto {
      title?: string;
      name?: string;
      lastname?: string;
      mobile?: string;
      address?: string;
}

export interface UpdateCustomerDto {
    title?: string;
    name?: string;
    lastname?: string;
    mobile?: string;
    address?: string;
    isActive?: boolean;
}

export interface CustomerListParams {
    page?: number;
    limit?: number;
    search?: string;
}

export interface CustomerFilters {
    search: string;
}
