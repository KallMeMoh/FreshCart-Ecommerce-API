import { UserRoleEnum } from '../modules/user/enums/user-role.enum';

declare global {
  namespace Express {
    interface Request {
      userId: string | undefined;
      userRole: UserRoleEnum | undefined;
      tokenId: string | undefined;
    }
  }
}
