import {
  user as userTable,
  session as sessionTable,
  account as accountTable,
  verification as verificationTable
} from "./schema/auth-schema"

import {
  pageData as pageDataTable,
  tags as TagsTable,
  pageTags as pageTagsTable
} from "./schema/editor-schema"

export const user = userTable;
export const session = sessionTable;
export const account = accountTable;
export const verification = verificationTable;
export const pageData = pageDataTable;
export const tags = TagsTable;
export const pageTags = pageTagsTable;

export const schema = {
  user,
  session,
  account,
  verification,
  tags,
  pageData,
  pageTags
}
