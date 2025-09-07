/* Generate by @shikijs/codegen */
import type {
  DynamicImportLanguageRegistration,
  DynamicImportThemeRegistration,
  HighlighterGeneric,
} from '@shikijs/types'
import {
  createSingletonShorthands,
  createdBundledHighlighter,
} from '@shikijs/core'
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript'

type BundledLanguage = 'javascript' | 'js' | 'typescript' | 'ts' | 'vue'
type BundledTheme = 'github-light' | 'github-dark'
type Highlighter = HighlighterGeneric<BundledLanguage, BundledTheme>

const bundledLanguages = {
  javascript: () => import('@shikijs/langs-precompiled/javascript'),
  js: () => import('@shikijs/langs-precompiled/javascript'),
  typescript: () => import('@shikijs/langs-precompiled/typescript'),
  ts: () => import('@shikijs/langs-precompiled/typescript'),
  vue: () => import('@shikijs/langs-precompiled/vue'),
} as Record<BundledLanguage, DynamicImportLanguageRegistration>

const bundledThemes = {
  'github-light': () => import('@shikijs/themes/github-light'),
  'github-dark': () => import('@shikijs/themes/github-dark'),
} as Record<BundledTheme, DynamicImportThemeRegistration>

const createHighlighter = /* @__PURE__ */ createdBundledHighlighter<
  BundledLanguage,
  BundledTheme
>({
  langs: bundledLanguages,
  themes: bundledThemes,
  engine: () => createJavaScriptRegexEngine(),
})

const {
  codeToHtml,
  codeToHast,
  codeToTokensBase,
  codeToTokens,
  codeToTokensWithThemes,
  getSingletonHighlighter,
  getLastGrammarState,
} = /* @__PURE__ */ createSingletonShorthands<BundledLanguage, BundledTheme>(
  createHighlighter,
)

export {
  bundledLanguages,
  bundledThemes,
  codeToHast,
  codeToHtml,
  codeToTokens,
  codeToTokensBase,
  codeToTokensWithThemes,
  createHighlighter,
  getLastGrammarState,
  getSingletonHighlighter,
}
export type { BundledLanguage, BundledTheme, Highlighter }
