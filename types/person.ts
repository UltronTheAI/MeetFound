export type Person = {
  id: string;
  name: string;
  age?: number;
  phone?: string;
  email?: string;
  company?: string;
  role?: string;
  field?: string;
  country?: string;
  state?: string;
  city?: string;
  description?: string;
  website?: string;
  profileImage?: string;
  businessCardImage?: string;
  createdAt: number;
};

export type PersonInput = Omit<Person, "id" | "createdAt"> & {
  id?: string;
  createdAt?: number;
};
