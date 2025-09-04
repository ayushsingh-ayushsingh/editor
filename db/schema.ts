import {
  user as userTable,
  session as sessionTable,
  account as accountTable,
  verification as verificationTable
} from "./schema/auth-schema"

import {
  chapters as chaptersTable,
  chapterContent as chaptersContentTable
} from "./schema/form"

import {
  chapters as exampleChaptersTable,
  chapterContent as exampleChaptersContentTable
} from "./schema/example-editor"

import {
  pageData as pageDataTable,
  tags as TagsTable,
  pageTags as pageTagsTable,
  pageStatusEnum as statusEnum
} from "./schema/editor-schema"

import {
  content as contentTable
} from "./schema/content-schema"

export const user = userTable;
export const session = sessionTable;
export const account = accountTable;
export const verification = verificationTable;
export const pageData = pageDataTable;
export const tags = TagsTable;
export const pageTags = pageTagsTable;
export const pageStatusEnum = statusEnum;
export const content = contentTable;

export const chapters = chaptersTable;
export const chapterContent = chaptersContentTable;

export const chaptersExample = exampleChaptersTable;
export const chapterContentExample = exampleChaptersContentTable;

export const schema = {
  user,
  session,
  account,
  verification,
  tags,
  pageData,
  pageTags,
  statusEnum,
  content,
  chapters,
  chapterContent,
  chaptersExample,
  chapterContentExample,
}
