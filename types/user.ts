export type User = {
  uid: string;
  email: string;
  displayName?: string;
  linkedGroupId?: string | null; // null if solo
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
