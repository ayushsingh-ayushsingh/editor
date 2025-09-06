import {
  user as userTable,
  session as sessionTable,
  account as accountTable,
  verification as verificationTable
} from "./schema/auth-schema"

export const user = userTable;
export const session = sessionTable;
export const account = accountTable;
export const verification = verificationTable;

export const schema = {
  user,
  session,
  account,
  verification,
}
