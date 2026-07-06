import { UserRoleEnum } from '../modules/user/enums/user-role.enum';

export type RUser = {
  id: string;
  role: UserRoleEnum;
  tokenId: string;
};

declare global {
  namespace Express {
    interface Request {
      user: RUser | undefined;
    }
  }
}
