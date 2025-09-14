import {
  user as userTable,
  session as sessionTable,
  account as accountTable,
  verification as verificationTable
} from "./schema/auth-schema"

import {
  blog as blogTable,
  usersBlogs as usersBlogsTable
} from "./schema/blog"

import {
  files as filesTable,
} from "./schema/file"

export const user = userTable;
export const session = sessionTable;
export const account = accountTable;
export const verification = verificationTable;

export const blog = blogTable;
export const usersBlogs = usersBlogsTable;

export const files = filesTable;

export const schema = {
  user,
  session,
  account,
  verification,
  blog,
  usersBlogs,
  files,
}
