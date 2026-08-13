// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { DiagnosticReport, Observation, Patient, Task } from '@medplum/fhirtypes';
import { describe, expect, test } from 'vitest';
import { buildNephrologyDemoBundle, nephrologyDemoSummary } from './nephrologyDemo';

describe('nephrology demo dataset', () => {
  test('builds a deterministic cohort of 15 synthetic Vietnamese patients', () => {
    const bundle = buildNephrologyDemoBundle('2026-08-13');
    const patients = bundle.entry
      ?.map((entry) => entry.resource)
      .filter((resource): resource is Patient => resource?.resourceType === 'Patient');

    expect(nephrologyDemoSummary.patientCount).toBe(15);
    expect(nephrologyDemoSummary.detailedPatientCount).toBe(6);
    expect(patients).toHaveLength(15);
    expect(new Set(bundle.entry?.map((entry) => entry.fullUrl)).size).toBe(bundle.entry?.length);
    expect(bundle.entry?.every((entry) => entry.fullUrl?.match(/^urn:uuid:[0-9a-f-]{36}$/))).toBe(true);
    expect(bundle.entry?.every((entry) => entry.request?.method === 'POST' && entry.request.ifNoneExist)).toBe(true);
    expect(patients?.every((patient) => patient.identifier?.[0]?.value?.startsWith('DEMO-NEPH-'))).toBe(true);
  });

  test('provides longitudinal kidney-function stories for the six featured patients', () => {
    const bundle = buildNephrologyDemoBundle('2026-08-13');
    const observations = bundle.entry
      ?.map((entry) => entry.resource)
      .filter((resource): resource is Observation => resource?.resourceType === 'Observation');
    const egfrObservations = observations?.filter((observation) => observation.code.coding?.[0]?.code === '62238-1');

    expect(bundle.entry?.length).toBeGreaterThanOrEqual(250);
    expect(bundle.entry?.length).toBeLessThan(300);
    expect(egfrObservations).toHaveLength(27);
    for (let index = 1; index <= 6; index++) {
      const medicalRecordNumber = `DEMO-NEPH-${String(index).padStart(3, '0')}`;
      const patientEntry = bundle.entry?.find(
        (entry) =>
          entry.resource?.resourceType === 'Patient' && entry.resource.identifier?.[0]?.value === medicalRecordNumber
      );
      const patientReference = patientEntry?.fullUrl;
      expect(
        egfrObservations?.filter((observation) => observation.subject?.reference === patientReference)
      ).toHaveLength(3);
    }
  });

  test('marks every resource as synthetic and includes a coherent urgent potassium workflow', () => {
    const bundle = buildNephrologyDemoBundle('2026-08-13');
    const resources = bundle.entry?.flatMap((entry) => (entry.resource ? [entry.resource] : [])) ?? [];
    const urgentTask = resources.find(
      (resource): resource is Task => resource.resourceType === 'Task' && resource.priority === 'urgent'
    );
    const criticalPotassium = resources.find(
      (resource): resource is Observation =>
        resource.resourceType === 'Observation' &&
        resource.code.coding?.[0]?.code === '2823-3' &&
        resource.valueQuantity?.value === 6
    );
    const patients = resources.filter((resource): resource is Patient => resource.resourceType === 'Patient');
    const serialized = JSON.stringify(bundle);

    expect(resources.every((resource) => resource.meta?.tag?.some((tag) => tag.code === 'synthetic-demo'))).toBe(true);
    expect(patients.every((patient) => patient.telecom?.every((contact) => contact.system !== 'phone'))).toBe(true);
    expect(serialized).not.toContain('@medplum.com');
    expect(serialized.match(/@demo\.hypersol\.test/g)).toHaveLength(15);
    expect(criticalPotassium?.valueQuantity?.value).toBe(6);
    expect(urgentTask).toMatchObject({ status: 'requested', priority: 'urgent' });
  });

  test('keeps every internal demo reference resolvable inside the bundle', () => {
    const bundle = buildNephrologyDemoBundle('2026-08-13');
    const resourceKeys = new Set(bundle.entry?.flatMap((entry) => (entry.fullUrl ? [entry.fullUrl] : [])));
    const internalReferences =
      JSON.stringify(bundle).match(/urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/g) ??
      [];

    expect(internalReferences.length).toBeGreaterThan(100);
    expect([...new Set(internalReferences)].filter((reference) => !resourceKeys.has(reference))).toEqual([]);
  });

  test('groups the latest featured-patient results into visible renal laboratory reports', () => {
    const bundle = buildNephrologyDemoBundle('2026-08-13');
    const reports = bundle.entry
      ?.map((entry) => entry.resource)
      .filter((resource): resource is DiagnosticReport => resource?.resourceType === 'DiagnosticReport');

    expect(reports).toHaveLength(6);
    expect(reports?.every((report) => report.code.coding?.[0]?.code === '24362-6')).toBe(true);
    expect(reports?.every((report) => report.result?.length === 5)).toBe(true);
  });

  test('represents current blood pressure as FHIR vital-sign components', () => {
    const bundle = buildNephrologyDemoBundle('2026-08-13');
    const bloodPressures = bundle.entry
      ?.map((entry) => entry.resource)
      .filter(
        (resource): resource is Observation =>
          resource?.resourceType === 'Observation' && resource.code.coding?.[0]?.code === '85354-9'
      );

    expect(bloodPressures).toHaveLength(15);
    expect(
      bloodPressures?.every(
        (observation) =>
          observation.category?.[0]?.coding?.[0]?.code === 'vital-signs' &&
          observation.component?.some((component) => component.code.coding?.[0]?.code === '8480-6') &&
          observation.component?.some((component) => component.code.coding?.[0]?.code === '8462-4')
      )
    ).toBe(true);
  });
});
