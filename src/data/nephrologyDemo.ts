// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type {
  Appointment,
  Bundle,
  BundleEntry,
  CarePlan,
  CareTeam,
  Condition,
  DiagnosticReport,
  Encounter,
  Identifier,
  MedicationRequest,
  Observation,
  Organization,
  Patient,
  Practitioner,
  Resource,
  Task,
} from '@medplum/fhirtypes';

const DEMO_IDENTIFIER_SYSTEM = 'https://hypersol.local/fhir/identifier/demo-patient';
const DEMO_ORIGIN_SYSTEM = 'https://hypersol.local/fhir/CodeSystem/data-origin';
const DEMO_RESOURCE_IDENTIFIER_SYSTEM = 'https://hypersol.local/fhir/identifier/demo-resource';

interface DemoPatientSpec {
  readonly key: string;
  readonly name: string;
  readonly gender: Patient['gender'];
  readonly birthDate: string;
  readonly province: string;
  readonly ckdCode: string;
  readonly ckdLabel: string;
  readonly etiologyCode: string;
  readonly etiologyLabel: string;
  readonly medications: readonly string[];
  readonly task: string;
  readonly latest: LabSnapshot;
  readonly trend?: readonly LabSnapshot[];
}

interface LabSnapshot {
  readonly daysAgo: number;
  readonly creatinine: number;
  readonly egfr: number;
  readonly potassium: number;
  readonly hemoglobin: number;
  readonly uacr: number;
  readonly systolic: number;
  readonly diastolic: number;
  readonly weight: number;
}

const patientSpecs: readonly DemoPatientSpec[] = [
  {
    key: '001',
    name: 'Nguyễn Thị Lan',
    gender: 'female',
    birthDate: '1968-03-14',
    province: 'TP. Hồ Chí Minh',
    ckdCode: 'N18.32',
    ckdLabel: 'Chronic kidney disease, stage G3b',
    etiologyCode: 'E11.22',
    etiologyLabel: 'Type 2 diabetes mellitus with diabetic chronic kidney disease',
    medications: ['Losartan 50 mg tablet', 'Dapagliflozin 10 mg tablet', 'Amlodipine 5 mg tablet'],
    task: 'Review home blood pressure log and reinforce kidney-protective care plan',
    latest: {
      daysAgo: 0,
      creatinine: 1.62,
      egfr: 37,
      potassium: 4.7,
      hemoglobin: 11.4,
      uacr: 360,
      systolic: 138,
      diastolic: 82,
      weight: 61.8,
    },
    trend: [
      {
        daysAgo: 330,
        creatinine: 1.4,
        egfr: 42,
        potassium: 4.4,
        hemoglobin: 12.1,
        uacr: 420,
        systolic: 146,
        diastolic: 86,
        weight: 64.2,
      },
      {
        daysAgo: 240,
        creatinine: 1.45,
        egfr: 41,
        potassium: 4.5,
        hemoglobin: 11.9,
        uacr: 405,
        systolic: 142,
        diastolic: 84,
        weight: 63.6,
      },
      {
        daysAgo: 150,
        creatinine: 1.52,
        egfr: 39,
        potassium: 4.5,
        hemoglobin: 11.8,
        uacr: 390,
        systolic: 140,
        diastolic: 84,
        weight: 62.9,
      },
      {
        daysAgo: 60,
        creatinine: 1.58,
        egfr: 38,
        potassium: 4.6,
        hemoglobin: 11.6,
        uacr: 372,
        systolic: 138,
        diastolic: 82,
        weight: 62.4,
      },
      {
        daysAgo: 0,
        creatinine: 1.62,
        egfr: 37,
        potassium: 4.7,
        hemoglobin: 11.4,
        uacr: 360,
        systolic: 138,
        diastolic: 82,
        weight: 61.8,
      },
    ],
  },
  {
    key: '002',
    name: 'Trần Văn Hưng',
    gender: 'male',
    birthDate: '1962-09-02',
    province: 'Đồng Nai',
    ckdCode: 'N18.4',
    ckdLabel: 'Chronic kidney disease, stage G4',
    etiologyCode: 'I12.9',
    etiologyLabel: 'Hypertensive chronic kidney disease',
    medications: ['Amlodipine 10 mg tablet', 'Furosemide 40 mg tablet', 'Sodium bicarbonate 650 mg tablet'],
    task: 'Prepare multidisciplinary review for progressive kidney function decline',
    latest: {
      daysAgo: 0,
      creatinine: 3.5,
      egfr: 18,
      potassium: 5.1,
      hemoglobin: 9.7,
      uacr: 780,
      systolic: 154,
      diastolic: 88,
      weight: 70.4,
    },
    trend: [
      {
        daysAgo: 330,
        creatinine: 2.3,
        egfr: 28,
        potassium: 4.8,
        hemoglobin: 10.8,
        uacr: 680,
        systolic: 162,
        diastolic: 94,
        weight: 72.1,
      },
      {
        daysAgo: 240,
        creatinine: 2.6,
        egfr: 25,
        potassium: 4.9,
        hemoglobin: 10.5,
        uacr: 710,
        systolic: 158,
        diastolic: 92,
        weight: 71.8,
      },
      {
        daysAgo: 150,
        creatinine: 2.9,
        egfr: 22,
        potassium: 5.0,
        hemoglobin: 10.2,
        uacr: 735,
        systolic: 158,
        diastolic: 90,
        weight: 71.4,
      },
      {
        daysAgo: 60,
        creatinine: 3.2,
        egfr: 20,
        potassium: 5.0,
        hemoglobin: 9.9,
        uacr: 760,
        systolic: 156,
        diastolic: 90,
        weight: 70.9,
      },
      {
        daysAgo: 0,
        creatinine: 3.5,
        egfr: 18,
        potassium: 5.1,
        hemoglobin: 9.7,
        uacr: 780,
        systolic: 154,
        diastolic: 88,
        weight: 70.4,
      },
    ],
  },
  {
    key: '003',
    name: 'Lê Thu Hà',
    gender: 'female',
    birthDate: '1991-11-27',
    province: 'TP. Hồ Chí Minh',
    ckdCode: 'N18.2',
    ckdLabel: 'Chronic kidney disease, stage G2',
    etiologyCode: 'M32.14',
    etiologyLabel: 'Glomerular disease in systemic lupus erythematosus',
    medications: [
      'Hydroxychloroquine 200 mg tablet',
      'Mycophenolate mofetil 500 mg tablet',
      'Prednisolone 5 mg tablet',
    ],
    task: 'Review proteinuria response and confirm monitoring laboratory schedule',
    latest: {
      daysAgo: 0,
      creatinine: 1.05,
      egfr: 61,
      potassium: 4.1,
      hemoglobin: 11.5,
      uacr: 280,
      systolic: 124,
      diastolic: 76,
      weight: 52.6,
    },
    trend: [
      {
        daysAgo: 330,
        creatinine: 1.35,
        egfr: 48,
        potassium: 4.3,
        hemoglobin: 10.2,
        uacr: 950,
        systolic: 136,
        diastolic: 84,
        weight: 55.1,
      },
      {
        daysAgo: 240,
        creatinine: 1.28,
        egfr: 51,
        potassium: 4.2,
        hemoglobin: 10.5,
        uacr: 720,
        systolic: 132,
        diastolic: 82,
        weight: 54.4,
      },
      {
        daysAgo: 150,
        creatinine: 1.18,
        egfr: 55,
        potassium: 4.2,
        hemoglobin: 10.9,
        uacr: 510,
        systolic: 128,
        diastolic: 80,
        weight: 53.8,
      },
      {
        daysAgo: 60,
        creatinine: 1.1,
        egfr: 58,
        potassium: 4.1,
        hemoglobin: 11.2,
        uacr: 360,
        systolic: 126,
        diastolic: 78,
        weight: 53.1,
      },
      {
        daysAgo: 0,
        creatinine: 1.05,
        egfr: 61,
        potassium: 4.1,
        hemoglobin: 11.5,
        uacr: 280,
        systolic: 124,
        diastolic: 76,
        weight: 52.6,
      },
    ],
  },
  {
    key: '004',
    name: 'Phạm Quốc Bảo',
    gender: 'male',
    birthDate: '1954-05-19',
    province: 'Long An',
    ckdCode: 'N18.31',
    ckdLabel: 'Chronic kidney disease, stage G3a',
    etiologyCode: 'N17.9',
    etiologyLabel: 'Acute kidney injury, recovering',
    medications: ['Amlodipine 5 mg tablet', 'Atorvastatin 20 mg tablet'],
    task: 'Confirm post-AKI renal panel and medication reconciliation',
    latest: {
      daysAgo: 0,
      creatinine: 1.5,
      egfr: 45,
      potassium: 4.3,
      hemoglobin: 11.2,
      uacr: 140,
      systolic: 132,
      diastolic: 78,
      weight: 66.8,
    },
    trend: [
      {
        daysAgo: 330,
        creatinine: 1.7,
        egfr: 40,
        potassium: 4.5,
        hemoglobin: 11.5,
        uacr: 160,
        systolic: 140,
        diastolic: 84,
        weight: 68.3,
      },
      {
        daysAgo: 240,
        creatinine: 4.2,
        egfr: 14,
        potassium: 5.8,
        hemoglobin: 10.4,
        uacr: 320,
        systolic: 148,
        diastolic: 86,
        weight: 70.1,
      },
      {
        daysAgo: 150,
        creatinine: 3.0,
        egfr: 22,
        potassium: 5.2,
        hemoglobin: 10.6,
        uacr: 240,
        systolic: 142,
        diastolic: 82,
        weight: 68.9,
      },
      {
        daysAgo: 60,
        creatinine: 1.9,
        egfr: 36,
        potassium: 4.6,
        hemoglobin: 10.9,
        uacr: 180,
        systolic: 136,
        diastolic: 80,
        weight: 67.5,
      },
      {
        daysAgo: 0,
        creatinine: 1.5,
        egfr: 45,
        potassium: 4.3,
        hemoglobin: 11.2,
        uacr: 140,
        systolic: 132,
        diastolic: 78,
        weight: 66.8,
      },
    ],
  },
  {
    key: '005',
    name: 'Võ Ngọc Mai',
    gender: 'female',
    birthDate: '1977-01-08',
    province: 'Tiền Giang',
    ckdCode: 'N18.5',
    ckdLabel: 'Chronic kidney disease, stage G5',
    etiologyCode: 'N03.9',
    etiologyLabel: 'Chronic nephritic syndrome',
    medications: ['Furosemide 40 mg tablet', 'Calcium carbonate 500 mg tablet', 'Sodium bicarbonate 650 mg tablet'],
    task: 'Coordinate kidney replacement therapy education and access planning',
    latest: {
      daysAgo: 0,
      creatinine: 5.7,
      egfr: 8,
      potassium: 5.4,
      hemoglobin: 8.7,
      uacr: 1500,
      systolic: 148,
      diastolic: 86,
      weight: 58.9,
    },
    trend: [
      {
        daysAgo: 330,
        creatinine: 3.8,
        egfr: 14,
        potassium: 4.8,
        hemoglobin: 9.8,
        uacr: 1200,
        systolic: 154,
        diastolic: 92,
        weight: 60.3,
      },
      {
        daysAgo: 240,
        creatinine: 4.2,
        egfr: 12,
        potassium: 4.9,
        hemoglobin: 9.5,
        uacr: 1280,
        systolic: 152,
        diastolic: 90,
        weight: 60.0,
      },
      {
        daysAgo: 150,
        creatinine: 4.7,
        egfr: 10,
        potassium: 5.1,
        hemoglobin: 9.2,
        uacr: 1360,
        systolic: 150,
        diastolic: 88,
        weight: 59.7,
      },
      {
        daysAgo: 60,
        creatinine: 5.2,
        egfr: 9,
        potassium: 5.2,
        hemoglobin: 8.9,
        uacr: 1430,
        systolic: 150,
        diastolic: 88,
        weight: 59.3,
      },
      {
        daysAgo: 0,
        creatinine: 5.7,
        egfr: 8,
        potassium: 5.4,
        hemoglobin: 8.7,
        uacr: 1500,
        systolic: 148,
        diastolic: 86,
        weight: 58.9,
      },
    ],
  },
  {
    key: '006',
    name: 'Đặng Minh Tuấn',
    gender: 'male',
    birthDate: '1971-07-23',
    province: 'Bình Dương',
    ckdCode: 'N18.4',
    ckdLabel: 'Chronic kidney disease, stage G4',
    etiologyCode: 'I12.9',
    etiologyLabel: 'Hypertensive chronic kidney disease',
    medications: [
      'Losartan 50 mg tablet - medication review required',
      'Amlodipine 10 mg tablet',
      'Furosemide 40 mg tablet',
    ],
    task: 'Urgent: review potassium 6.0 mmol/L and contact patient using the demo escalation workflow',
    latest: {
      daysAgo: 0,
      creatinine: 3.1,
      egfr: 20,
      potassium: 6.0,
      hemoglobin: 10.2,
      uacr: 620,
      systolic: 158,
      diastolic: 92,
      weight: 74.6,
    },
    trend: [
      {
        daysAgo: 330,
        creatinine: 2.5,
        egfr: 26,
        potassium: 4.7,
        hemoglobin: 11.0,
        uacr: 500,
        systolic: 164,
        diastolic: 96,
        weight: 76.2,
      },
      {
        daysAgo: 240,
        creatinine: 2.7,
        egfr: 24,
        potassium: 4.9,
        hemoglobin: 10.8,
        uacr: 530,
        systolic: 162,
        diastolic: 94,
        weight: 75.8,
      },
      {
        daysAgo: 150,
        creatinine: 2.8,
        egfr: 23,
        potassium: 5.2,
        hemoglobin: 10.6,
        uacr: 560,
        systolic: 160,
        diastolic: 94,
        weight: 75.4,
      },
      {
        daysAgo: 60,
        creatinine: 3.0,
        egfr: 21,
        potassium: 5.7,
        hemoglobin: 10.4,
        uacr: 590,
        systolic: 160,
        diastolic: 92,
        weight: 75.0,
      },
      {
        daysAgo: 0,
        creatinine: 3.1,
        egfr: 20,
        potassium: 6.0,
        hemoglobin: 10.2,
        uacr: 620,
        systolic: 158,
        diastolic: 92,
        weight: 74.6,
      },
    ],
  },
  {
    key: '007',
    name: 'Bùi Thanh Tâm',
    gender: 'female',
    birthDate: '1983-10-16',
    province: 'Bến Tre',
    ckdCode: 'N18.31',
    ckdLabel: 'Chronic kidney disease, stage G3a',
    etiologyCode: 'N11.9',
    etiologyLabel: 'Chronic tubulo-interstitial nephritis',
    medications: ['Amlodipine 5 mg tablet'],
    task: 'Review urine culture history at next visit',
    latest: {
      daysAgo: 0,
      creatinine: 1.35,
      egfr: 49,
      potassium: 4.2,
      hemoglobin: 11.9,
      uacr: 95,
      systolic: 132,
      diastolic: 80,
      weight: 55.2,
    },
  },
  {
    key: '008',
    name: 'Hồ Văn Phúc',
    gender: 'male',
    birthDate: '1959-12-05',
    province: 'Tây Ninh',
    ckdCode: 'N18.4',
    ckdLabel: 'Chronic kidney disease, stage G4',
    etiologyCode: 'E11.22',
    etiologyLabel: 'Type 2 diabetes mellitus with diabetic chronic kidney disease',
    medications: ['Dapagliflozin 10 mg tablet'],
    task: 'Arrange anemia assessment before follow-up',
    latest: {
      daysAgo: 0,
      creatinine: 2.8,
      egfr: 23,
      potassium: 4.9,
      hemoglobin: 9.8,
      uacr: 890,
      systolic: 146,
      diastolic: 84,
      weight: 68.5,
    },
  },
  {
    key: '009',
    name: 'Đỗ Thị Kim Oanh',
    gender: 'female',
    birthDate: '1965-06-30',
    province: 'Vĩnh Long',
    ckdCode: 'N18.32',
    ckdLabel: 'Chronic kidney disease, stage G3b',
    etiologyCode: 'I12.9',
    etiologyLabel: 'Hypertensive chronic kidney disease',
    medications: ['Losartan 50 mg tablet'],
    task: 'Confirm repeat urine albumin-to-creatinine ratio',
    latest: {
      daysAgo: 0,
      creatinine: 1.7,
      egfr: 34,
      potassium: 4.6,
      hemoglobin: 11.1,
      uacr: 310,
      systolic: 142,
      diastolic: 86,
      weight: 59.4,
    },
  },
  {
    key: '010',
    name: 'Ngô Thành Đạt',
    gender: 'male',
    birthDate: '1988-04-12',
    province: 'TP. Hồ Chí Minh',
    ckdCode: 'N18.2',
    ckdLabel: 'Chronic kidney disease, stage G2',
    etiologyCode: 'N02.8',
    etiologyLabel: 'Recurrent hematuria, suspected IgA nephropathy',
    medications: ['Losartan 25 mg tablet'],
    task: 'Review proteinuria trend after lifestyle counseling',
    latest: {
      daysAgo: 0,
      creatinine: 1.25,
      egfr: 68,
      potassium: 4.3,
      hemoglobin: 14.1,
      uacr: 240,
      systolic: 128,
      diastolic: 78,
      weight: 72.0,
    },
  },
  {
    key: '011',
    name: 'Dương Mỹ Linh',
    gender: 'female',
    birthDate: '1974-02-21',
    province: 'Đồng Tháp',
    ckdCode: 'N18.31',
    ckdLabel: 'Chronic kidney disease, stage G3a',
    etiologyCode: 'E11.22',
    etiologyLabel: 'Type 2 diabetes mellitus with diabetic chronic kidney disease',
    medications: ['Dapagliflozin 10 mg tablet'],
    task: 'Review diabetes and kidney monitoring results',
    latest: {
      daysAgo: 0,
      creatinine: 1.4,
      egfr: 47,
      potassium: 4.4,
      hemoglobin: 11.8,
      uacr: 410,
      systolic: 136,
      diastolic: 80,
      weight: 64.7,
    },
  },
  {
    key: '012',
    name: 'Lý Quốc Khánh',
    gender: 'male',
    birthDate: '1969-08-09',
    province: 'An Giang',
    ckdCode: 'N18.32',
    ckdLabel: 'Chronic kidney disease, stage G3b',
    etiologyCode: 'I12.9',
    etiologyLabel: 'Hypertensive chronic kidney disease',
    medications: ['Amlodipine 10 mg tablet'],
    task: 'Reconcile antihypertensive medication list',
    latest: {
      daysAgo: 0,
      creatinine: 1.9,
      egfr: 36,
      potassium: 4.8,
      hemoglobin: 10.9,
      uacr: 220,
      systolic: 150,
      diastolic: 90,
      weight: 78.3,
    },
  },
  {
    key: '013',
    name: 'Trương Thị Hồng',
    gender: 'female',
    birthDate: '1957-04-03',
    province: 'Bà Rịa - Vũng Tàu',
    ckdCode: 'N18.4',
    ckdLabel: 'Chronic kidney disease, stage G4',
    etiologyCode: 'E11.22',
    etiologyLabel: 'Type 2 diabetes mellitus with diabetic chronic kidney disease',
    medications: ['Furosemide 40 mg tablet'],
    task: 'Assess edema and daily weight record',
    latest: {
      daysAgo: 0,
      creatinine: 2.6,
      egfr: 21,
      potassium: 5.0,
      hemoglobin: 9.6,
      uacr: 1050,
      systolic: 148,
      diastolic: 82,
      weight: 60.8,
    },
  },
  {
    key: '014',
    name: 'Mai Đức Long',
    gender: 'male',
    birthDate: '1980-01-29',
    province: 'Bình Thuận',
    ckdCode: 'N18.2',
    ckdLabel: 'Chronic kidney disease, stage G2',
    etiologyCode: 'Q61.2',
    etiologyLabel: 'Autosomal dominant polycystic kidney disease',
    medications: ['Losartan 50 mg tablet'],
    task: 'Confirm kidney imaging follow-up date',
    latest: {
      daysAgo: 0,
      creatinine: 1.3,
      egfr: 64,
      potassium: 4.5,
      hemoglobin: 13.8,
      uacr: 72,
      systolic: 134,
      diastolic: 82,
      weight: 75.2,
    },
  },
  {
    key: '015',
    name: 'Huỳnh Ngọc Diễm',
    gender: 'female',
    birthDate: '1993-07-18',
    province: 'Cần Thơ',
    ckdCode: 'N18.1',
    ckdLabel: 'Chronic kidney disease, stage G1',
    etiologyCode: 'N04.9',
    etiologyLabel: 'Nephrotic syndrome in remission',
    medications: ['Losartan 25 mg tablet'],
    task: 'Review urine protein result at annual follow-up',
    latest: {
      daysAgo: 0,
      creatinine: 0.78,
      egfr: 102,
      potassium: 4.0,
      hemoglobin: 12.7,
      uacr: 42,
      systolic: 118,
      diastolic: 72,
      weight: 49.6,
    },
  },
];

export const nephrologyDemoSummary = {
  patientCount: patientSpecs.length,
  detailedPatientCount: 6,
} as const;

function buildPatient(spec: DemoPatientSpec): Patient {
  return {
    resourceType: 'Patient',
    id: `demo-neph-patient-${spec.key}`,
    meta: {
      tag: [{ system: DEMO_ORIGIN_SYSTEM, code: 'synthetic-demo', display: 'Synthetic demonstration data' }],
    },
    identifier: [
      {
        system: DEMO_IDENTIFIER_SYSTEM,
        value: `DEMO-NEPH-${spec.key}`,
        type: { text: 'Demo medical record number' },
      },
    ],
    active: true,
    name: [{ use: 'official', text: spec.name }],
    telecom: [{ system: 'email', value: `neph-${spec.key}@demo.hypersol.test`, use: 'home' }],
    gender: spec.gender,
    birthDate: spec.birthDate,
    address: [{ use: 'home', city: spec.province, country: 'VN' }],
  };
}

function transactionEntry(resource: Resource): BundleEntry {
  const identity = (resource as Resource & { identifier?: Identifier[] }).identifier?.find(
    (identifier) => identifier.system === DEMO_RESOURCE_IDENTIFIER_SYSTEM
  );
  if (!identity?.value) {
    throw new Error(`Missing demo identity for ${resource.resourceType}`);
  }

  return {
    fullUrl: `urn:uuid:${stableDemoUuid(`${resource.resourceType}/${identity.value}`)}`,
    resource,
    request: {
      method: 'POST',
      url: resource.resourceType,
      ifNoneExist: `identifier=${DEMO_RESOURCE_IDENTIFIER_SYSTEM}|${identity.value}`,
    },
  };
}

function stableDemoUuid(key: string): string {
  const hashes = [0x811c9dc5, 0x9e3779b9, 0x85ebca6b, 0xc2b2ae35];
  for (let index = 0; index < key.length; index++) {
    const code = key.charCodeAt(index);
    hashes[0] = Math.imul(hashes[0] ^ code, 0x01000193);
    hashes[1] = Math.imul(hashes[1] ^ code, 0x27d4eb2d);
    hashes[2] = Math.imul(hashes[2] ^ code, 0x165667b1);
    hashes[3] = Math.imul(hashes[3] ^ code, 0x85ebca77);
  }
  const hex = hashes.map((hash) => (hash >>> 0).toString(16).padStart(8, '0')).join('');
  const variant = ((Number.parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function replaceInternalReferences(value: unknown, referenceMap: ReadonlyMap<string, string>): void {
  if (Array.isArray(value)) {
    value.forEach((item) => replaceInternalReferences(item, referenceMap));
    return;
  }
  if (!value || typeof value !== 'object') {
    return;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.reference === 'string' && referenceMap.has(record.reference)) {
    record.reference = referenceMap.get(record.reference);
  }
  Object.values(record).forEach((item) => replaceInternalReferences(item, referenceMap));
}

function normalizeResourceIds(resources: readonly Resource[]): Resource[] {
  const referenceMap = new Map(
    resources.map((resource) => {
      const sourceReference = `${resource.resourceType}/${resource.id}`;
      return [sourceReference, `urn:uuid:${stableDemoUuid(sourceReference)}`] as const;
    })
  );

  return resources.map((resource) => {
    const normalized = JSON.parse(JSON.stringify(resource)) as Resource;
    delete normalized.id;
    const identifiedResource = normalized as Resource & { identifier?: Identifier[] };
    identifiedResource.identifier = [
      ...(identifiedResource.identifier ?? []),
      { system: DEMO_RESOURCE_IDENTIFIER_SYSTEM, value: resource.id },
    ];
    replaceInternalReferences(normalized, referenceMap);
    return normalized;
  });
}

function dateDaysBefore(asOfDate: string, daysAgo: number): string {
  const date = new Date(`${asOfDate}T09:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString();
}

function patientReference(spec: DemoPatientSpec): string {
  return `Patient/demo-neph-patient-${spec.key}`;
}

const observationDefinitions = [
  {
    key: 'creatinine',
    code: '2160-0',
    display: 'Creatinine',
    unit: 'mg/dL',
    system: 'http://unitsofmeasure.org',
    unitCode: 'mg/dL',
  },
  {
    key: 'egfr',
    code: '62238-1',
    display: 'eGFR by CKD-EPI/1.73 sq M',
    unit: 'mL/min/1.73 m2',
    system: 'http://unitsofmeasure.org',
    unitCode: 'mL/min/{1.73_m2}',
  },
  {
    key: 'potassium',
    code: '2823-3',
    display: 'Potassium',
    unit: 'mmol/L',
    system: 'http://unitsofmeasure.org',
    unitCode: 'mmol/L',
  },
  {
    key: 'hemoglobin',
    code: '718-7',
    display: 'Hemoglobin',
    unit: 'g/dL',
    system: 'http://unitsofmeasure.org',
    unitCode: 'g/dL',
  },
  {
    key: 'uacr',
    code: '9318-7',
    display: 'Albumin/Creatinine [Mass Ratio] in Urine',
    unit: 'mg/g',
    system: 'http://unitsofmeasure.org',
    unitCode: 'mg/g',
  },
  {
    key: 'weight',
    code: '29463-7',
    display: 'Body weight',
    unit: 'kg',
    system: 'http://unitsofmeasure.org',
    unitCode: 'kg',
  },
] as const;

function buildObservation(
  spec: DemoPatientSpec,
  snapshot: LabSnapshot,
  definition: (typeof observationDefinitions)[number],
  asOfDate: string,
  sequence: number
): Observation {
  const value = snapshot[definition.key];
  const effectiveDate = dateDaysBefore(asOfDate, snapshot.daysAgo);
  return {
    resourceType: 'Observation',
    id: `demo-neph-${spec.key}-${definition.key}-${sequence}`,
    meta: { tag: [{ system: DEMO_ORIGIN_SYSTEM, code: 'synthetic-demo' }] },
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: definition.key === 'weight' ? 'vital-signs' : 'laboratory',
            display: definition.key === 'weight' ? 'Vital Signs' : 'Laboratory',
          },
        ],
      },
    ],
    code: {
      coding: [{ system: 'http://loinc.org', code: definition.code, display: definition.display }],
      text: definition.display,
    },
    subject: { reference: patientReference(spec), display: spec.name },
    effectiveDateTime: effectiveDate,
    issued: effectiveDate,
    valueQuantity: { value, unit: definition.unit, system: definition.system, code: definition.unitCode },
    note:
      sequence === 0 && spec.key === '006' && definition.key === 'potassium'
        ? [{ text: 'Synthetic critical result for demonstration. Follow the local escalation protocol.' }]
        : undefined,
  };
}

function buildBloodPressureObservation(spec: DemoPatientSpec, asOfDate: string): Observation {
  const effectiveDate = dateDaysBefore(asOfDate, spec.latest.daysAgo);
  return {
    resourceType: 'Observation',
    id: `demo-neph-${spec.key}-blood-pressure-0`,
    meta: { tag: [{ system: DEMO_ORIGIN_SYSTEM, code: 'synthetic-demo' }] },
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '85354-9',
          display: 'Blood pressure panel with all children optional',
        },
      ],
      text: 'Blood pressure',
    },
    subject: { reference: patientReference(spec), display: spec.name },
    effectiveDateTime: effectiveDate,
    issued: effectiveDate,
    component: [
      {
        code: { coding: [{ system: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure' }] },
        valueQuantity: {
          value: spec.latest.systolic,
          unit: 'mmHg',
          system: 'http://unitsofmeasure.org',
          code: 'mm[Hg]',
        },
      },
      {
        code: { coding: [{ system: 'http://loinc.org', code: '8462-4', display: 'Diastolic blood pressure' }] },
        valueQuantity: {
          value: spec.latest.diastolic,
          unit: 'mmHg',
          system: 'http://unitsofmeasure.org',
          code: 'mm[Hg]',
        },
      },
    ],
  };
}

function buildCondition(spec: DemoPatientSpec, key: 'ckd' | 'etiology'): Condition {
  const code = key === 'ckd' ? spec.ckdCode : spec.etiologyCode;
  const label = key === 'ckd' ? spec.ckdLabel : spec.etiologyLabel;
  return {
    resourceType: 'Condition',
    id: `demo-neph-${spec.key}-${key}`,
    meta: { tag: [{ system: DEMO_ORIGIN_SYSTEM, code: 'synthetic-demo' }] },
    clinicalStatus: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }],
    },
    verificationStatus: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed' }],
    },
    category: [
      { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-category', code: 'problem-list-item' }] },
    ],
    code: { coding: [{ system: 'http://hl7.org/fhir/sid/icd-10-cm', code, display: label }], text: label },
    subject: { reference: patientReference(spec), display: spec.name },
  };
}

function buildDiagnosticReport(spec: DemoPatientSpec, asOfDate: string): DiagnosticReport {
  return {
    resourceType: 'DiagnosticReport',
    id: `demo-neph-${spec.key}-renal-panel`,
    meta: { tag: [{ system: DEMO_ORIGIN_SYSTEM, code: 'synthetic-demo' }] },
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
            code: 'LAB',
            display: 'Laboratory',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '24362-6',
          display: 'Renal function 2000 panel - Serum or Plasma',
        },
      ],
      text: 'Renal function panel',
    },
    subject: { reference: patientReference(spec), display: spec.name },
    effectiveDateTime: dateDaysBefore(asOfDate, spec.latest.daysAgo),
    issued: dateDaysBefore(asOfDate, spec.latest.daysAgo),
    performer: [{ reference: 'Organization/demo-nephrology-service', display: 'HyperSol Nephrology Demo Service' }],
    result: observationDefinitions.slice(0, 5).map((definition) => ({
      reference: `Observation/demo-neph-${spec.key}-${definition.key}-0`,
      display: definition.display,
    })),
    conclusion: 'Synthetic renal function panel for clinical workflow demonstration.',
  };
}

function buildEncounter(spec: DemoPatientSpec, asOfDate: string, daysAgo: number, sequence: number): Encounter {
  const date = dateDaysBefore(asOfDate, daysAgo);
  return {
    resourceType: 'Encounter',
    id: `demo-neph-${spec.key}-encounter-${sequence}`,
    meta: { tag: [{ system: DEMO_ORIGIN_SYSTEM, code: 'synthetic-demo' }] },
    status: 'finished',
    class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB', display: 'Ambulatory' },
    type: [{ text: sequence === 0 ? 'Nephrology follow-up visit' : 'Kidney function review' }],
    subject: { reference: patientReference(spec), display: spec.name },
    participant: [
      { individual: { reference: 'Practitioner/demo-neph-practitioner-01', display: 'Dr. Nguyễn Minh An' } },
    ],
    period: { start: date, end: date },
    reasonCode: [{ text: spec.ckdLabel }],
    serviceProvider: { reference: 'Organization/demo-nephrology-service', display: 'HyperSol Nephrology Demo Service' },
  };
}

function buildMedicationRequest(
  spec: DemoPatientSpec,
  medication: string,
  index: number,
  asOfDate: string
): MedicationRequest {
  return {
    resourceType: 'MedicationRequest',
    id: `demo-neph-${spec.key}-medication-${index}`,
    meta: { tag: [{ system: DEMO_ORIGIN_SYSTEM, code: 'synthetic-demo' }] },
    status: 'active',
    intent: 'order',
    medicationCodeableConcept: { text: medication },
    subject: { reference: patientReference(spec), display: spec.name },
    authoredOn: dateDaysBefore(asOfDate, 30),
    requester: { reference: 'Practitioner/demo-neph-practitioner-01', display: 'Dr. Nguyễn Minh An' },
    note: [{ text: 'Synthetic medication record for workflow demonstration; not a prescribing recommendation.' }],
  };
}

function buildTask(spec: DemoPatientSpec, asOfDate: string, taskOwnerReference?: string): Task {
  let priority: Task['priority'] = 'routine';
  if (spec.key === '006') {
    priority = 'urgent';
  } else if (spec.latest.egfr < 30) {
    priority = 'asap';
  }

  return {
    resourceType: 'Task',
    id: `demo-neph-${spec.key}-follow-up-task`,
    meta: { tag: [{ system: DEMO_ORIGIN_SYSTEM, code: 'synthetic-demo' }] },
    status: spec.key === '006' ? 'requested' : 'in-progress',
    intent: 'order',
    priority,
    description: spec.task,
    for: { reference: patientReference(spec), display: spec.name },
    authoredOn: dateDaysBefore(asOfDate, 2),
    restriction: { period: { end: dateDaysBefore(asOfDate, spec.key === '006' ? -1 : -14) } },
    owner: taskOwnerReference
      ? { reference: taskOwnerReference }
      : { reference: 'Practitioner/demo-neph-practitioner-02', display: 'Điều dưỡng Trần Ngọc Anh' },
    note: [{ text: 'Synthetic demonstration task.' }],
  };
}

function buildAppointment(spec: DemoPatientSpec, asOfDate: string): Appointment {
  const start = dateDaysBefore(asOfDate, -(14 + Number(spec.key)));
  const end = new Date(new Date(start).getTime() + 30 * 60 * 1000).toISOString();
  return {
    resourceType: 'Appointment',
    id: `demo-neph-${spec.key}-appointment`,
    meta: { tag: [{ system: DEMO_ORIGIN_SYSTEM, code: 'synthetic-demo' }] },
    status: 'booked',
    serviceType: [{ text: 'Nephrology follow-up' }],
    description: `Kidney function follow-up - ${spec.name}`,
    start,
    end,
    participant: [
      { actor: { reference: patientReference(spec), display: spec.name }, status: 'accepted' },
      {
        actor: { reference: 'Practitioner/demo-neph-practitioner-01', display: 'Dr. Nguyễn Minh An' },
        status: 'accepted',
      },
    ],
  };
}

function buildCarePlan(spec: DemoPatientSpec, asOfDate: string): CarePlan {
  return {
    resourceType: 'CarePlan',
    id: `demo-neph-${spec.key}-care-plan`,
    meta: { tag: [{ system: DEMO_ORIGIN_SYSTEM, code: 'synthetic-demo' }] },
    status: 'active',
    intent: 'plan',
    title: `Kidney care plan - ${spec.ckdLabel}`,
    description:
      'Monitor kidney function, albuminuria, potassium, blood pressure, anemia, medications, and follow-up adherence.',
    subject: { reference: patientReference(spec), display: spec.name },
    period: { start: asOfDate },
    careTeam: [{ reference: 'CareTeam/demo-nephrology-care-team', display: 'HyperSol Nephrology Demo Team' }],
    activity: [{ detail: { status: 'in-progress', description: spec.task } }],
    note: [{ text: 'Synthetic plan for demonstrating multidisciplinary kidney care.' }],
  };
}

function buildOrganization(): Organization {
  return {
    resourceType: 'Organization',
    id: 'demo-nephrology-service',
    meta: { tag: [{ system: DEMO_ORIGIN_SYSTEM, code: 'synthetic-demo' }] },
    active: true,
    type: [{ text: 'Specialty clinic demonstration' }],
    name: 'HyperSol Nephrology Demo Service',
  };
}

function buildCareTeam(): CareTeam {
  return {
    resourceType: 'CareTeam',
    id: 'demo-nephrology-care-team',
    meta: { tag: [{ system: DEMO_ORIGIN_SYSTEM, code: 'synthetic-demo' }] },
    status: 'active',
    name: 'HyperSol Nephrology Demo Team',
    participant: [
      {
        role: [{ text: 'Nephrologist' }],
        member: { reference: 'Practitioner/demo-neph-practitioner-01', display: 'Dr. Nguyễn Minh An' },
      },
      {
        role: [{ text: 'Nephrology nurse' }],
        member: { reference: 'Practitioner/demo-neph-practitioner-02', display: 'Điều dưỡng Trần Ngọc Anh' },
      },
    ],
    managingOrganization: [
      { reference: 'Organization/demo-nephrology-service', display: 'HyperSol Nephrology Demo Service' },
    ],
  };
}

function buildPractitioner(id: string, name: string, role: string): Practitioner {
  return {
    resourceType: 'Practitioner',
    id,
    meta: { tag: [{ system: DEMO_ORIGIN_SYSTEM, code: 'synthetic-demo' }] },
    active: true,
    identifier: [{ system: 'https://hypersol.local/fhir/identifier/demo-staff', value: id.toUpperCase() }],
    name: [{ text: name }],
    qualification: [{ code: { text: role } }],
  };
}

export function buildNephrologyDemoBundle(
  asOfDate = new Date().toISOString().slice(0, 10),
  taskOwnerReference?: string
): Bundle {
  const resources: Resource[] = [
    buildOrganization(),
    buildPractitioner('demo-neph-practitioner-01', 'Dr. Nguyễn Minh An', 'Nephrologist'),
    buildPractitioner('demo-neph-practitioner-02', 'Điều dưỡng Trần Ngọc Anh', 'Nephrology nurse'),
    buildCareTeam(),
  ];

  for (const spec of patientSpecs) {
    const snapshots = spec.trend ? [spec.trend[4], spec.trend[2], spec.trend[0]] : [spec.latest];
    resources.push(buildPatient(spec), buildCondition(spec, 'ckd'), buildCondition(spec, 'etiology'));
    snapshots.forEach((snapshot, sequence) => {
      const definitions = sequence === 0 ? observationDefinitions : observationDefinitions.slice(0, 5);
      for (const definition of definitions) {
        resources.push(buildObservation(spec, snapshot, definition, asOfDate, sequence));
      }
    });
    resources.push(buildBloodPressureObservation(spec, asOfDate));
    if (spec.trend) {
      resources.push(buildDiagnosticReport(spec, asOfDate));
      [180, 30].forEach((daysAgo, sequence) => resources.push(buildEncounter(spec, asOfDate, daysAgo, sequence)));
      spec.medications.forEach((medication, index) =>
        resources.push(buildMedicationRequest(spec, medication, index, asOfDate))
      );
      resources.push(
        buildTask(spec, asOfDate, taskOwnerReference),
        buildAppointment(spec, asOfDate),
        buildCarePlan(spec, asOfDate)
      );
    }
  }

  return {
    resourceType: 'Bundle',
    type: 'transaction',
    meta: {
      tag: [{ system: DEMO_ORIGIN_SYSTEM, code: 'synthetic-demo', display: 'Synthetic demonstration data' }],
    },
    entry: normalizeResourceIds(resources).map(transactionEntry),
  };
}
