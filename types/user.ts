export type User = {
  uid: string;
  email: string;
  name?: string;
  linkedGroupId?: string | null;
  createdAt?: string; // ISO or Timestamp
};

export type UserRegistrationData = {
  email: string;
  password: string;
  name: string;
};

export type UserLoginData = {
  email: string;
  password: string;
};

export type UserResponse = {
  success: boolean;
  user: User;
  status: number;
};
