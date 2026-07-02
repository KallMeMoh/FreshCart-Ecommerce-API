export enum UserRoleEnum {
  User = 'user',
  Admin = 'admin',
}

export function isUserRoleEnum(value: any): value is UserRoleEnum {
  return (
    Object.values(UserRoleEnum).findIndex((userRole) => userRole === value) !==
    -1
  );
}
