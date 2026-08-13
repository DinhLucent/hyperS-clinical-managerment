// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { MantineColorsTuple } from '@mantine/core';

export const hyperSolBrand = {
  name: 'HyperSol',
  productTitle: 'HyperSol Clinical Management',
  description: 'A local-first clinical workspace for HyperSol care teams.',
  colors: {
    primary: '#1264FF',
    primaryDeep: '#084ABF',
    ink: '#0B2944',
    inkDeep: '#061B2D',
    muted: '#5C6F82',
    border: '#DFE6EE',
    surface: '#FFFFFF',
    softSurface: '#F4F7FB',
    focusRing: 'rgba(18, 100, 255, 0.35)',
  },
} as const;

export const hyperSolBlue: MantineColorsTuple = [
  '#EEF4FF',
  '#D9E7FF',
  '#BCD4FF',
  '#8FB8FF',
  '#5E97FF',
  '#337AFF',
  '#1264FF',
  '#0C55DD',
  '#084ABF',
  '#063B99',
];
