// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Bundle } from '@medplum/fhirtypes';

export function getSuccessfulDemoImportCount(response: Bundle): number {
  const entries = response.entry ?? [];
  if (entries.length === 0) {
    throw new Error('The demo import returned no resource results.');
  }

  const failures = entries.filter((entry) => !entry.response?.status?.startsWith('2'));
  if (failures.length > 0) {
    throw new Error(`${failures.length} of ${entries.length} resources failed to import.`);
  }

  return entries.length;
}
