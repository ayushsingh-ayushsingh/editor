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

import {
  publishedBlogs as publishedBlogsTable,
  blogLikes as blogLikesTable,
  blogDislikes as blogDislikesTable,
  blogComments as blogCommentsTable,
} from "./schema/publish"

export const user = userTable;
export const session = sessionTable;
export const account = accountTable;
export const verification = verificationTable;

export const blog = blogTable;
export const usersBlogs = usersBlogsTable;

export const files = filesTable;

export const publishedBlogs = publishedBlogsTable;
export const blogLikes = blogLikesTable;
export const blogDislikes = blogDislikesTable;
export const blogComments = blogCommentsTable;

export const schema = {
  user,
  session,
  account,
  verification,
  blog,
  usersBlogs,
  files,
  publishedBlogs,
  blogLikes,
  blogDislikes,
  blogComments,
}
