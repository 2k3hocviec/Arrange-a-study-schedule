export class User {
  id!: number;
  email!: string;
  password!: string;
  phone!: string | null;
  address!: string | null;
  createdAt!: Date;
  role!: string;
}
