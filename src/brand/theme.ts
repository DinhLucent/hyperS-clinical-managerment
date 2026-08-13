// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { createTheme } from '@mantine/core';
import { hyperSolBlue } from './brand';

const bodyFont =
  '"Segoe UI Variable Text", "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';
const displayFont =
  '"Segoe UI Variable Display", "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';

export const hyperSolTheme = createTheme({
  fontFamily: bodyFont,
  fontFamilyMonospace: '"Cascadia Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace',
  colors: {
    blue: hyperSolBlue,
  },
  primaryColor: 'blue',
  primaryShade: 6,
  defaultRadius: 'md',
  shadows: {
    xs: '0 1px 2px rgba(11, 41, 68, 0.04)',
    sm: '0 2px 8px rgba(11, 41, 68, 0.08)',
    md: '0 8px 24px rgba(11, 41, 68, 0.10)',
    lg: '0 16px 40px rgba(11, 41, 68, 0.12)',
    xl: '0 24px 56px rgba(11, 41, 68, 0.14)',
  },
  headings: {
    fontFamily: displayFont,
    fontWeight: '650',
    sizes: {
      h1: { fontSize: '1.625rem', lineHeight: '1.25' },
      h2: { fontSize: '1.375rem', lineHeight: '1.3' },
      h3: { fontSize: '1.1875rem', lineHeight: '1.35' },
      h4: { fontSize: '1.0625rem', lineHeight: '1.4' },
      h5: { fontSize: '0.9375rem', lineHeight: '1.45' },
      h6: { fontSize: '0.8125rem', lineHeight: '1.45' },
    },
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.8125rem',
    md: '0.9375rem',
    lg: '1.0625rem',
    xl: '1.25rem',
  },
  lineHeights: {
    xs: '1.35',
    sm: '1.4',
    md: '1.5',
    lg: '1.5',
    xl: '1.35',
  },
});
