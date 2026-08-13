# HyperSol Nephrology Demo Data

## Purpose

This seed creates a compact, presentation-ready nephrology workspace for demonstrating HyperSol clinical workflows. It is designed for product demonstrations and internal testing, not clinical decision-making.

All people, identifiers, contact details, measurements, encounters, medications, and care activities are synthetic. Vietnamese names and provinces are fictional combinations created for the demo. No real patient record was used.

## What the seed creates

- 15 synthetic Vietnamese patient journeys with demo medical record numbers `DEMO-NEPH-001` through `DEMO-NEPH-015`.
- 6 featured longitudinal cases with three kidney-function time points.
- 9 supporting patients with a current clinical snapshot for cohort browsing.
- CKD stage and etiology problem-list entries.
- Creatinine, CKD-EPI eGFR, potassium, hemoglobin, urine albumin/creatinine ratio, weight, and component-based blood pressure observations.
- Renal laboratory reports for the six featured cases so results are visible from the patient summary.
- Medications, ambulatory encounters, follow-up appointments, care plans, and actionable tasks for the featured cases.
- One synthetic nephrology organization, two clinicians, and one multidisciplinary care team.

The generated transaction currently contains 267 linked FHIR resources. It is deliberately kept below 300 resources so it remains reliable on the default local rate limit.

## Featured demo stories

| Demo MRN        | Patient        | Story to demonstrate                                                                  |
| --------------- | -------------- | ------------------------------------------------------------------------------------- |
| `DEMO-NEPH-001` | Nguyễn Thị Lan | Diabetic CKD G3b with persistent albuminuria and kidney-protective therapy.           |
| `DEMO-NEPH-002` | Trần Văn Hưng  | Progressive hypertensive CKD G4 with anemia and declining eGFR.                       |
| `DEMO-NEPH-003` | Lê Thu Hà      | Lupus-related glomerular disease with improving proteinuria and kidney function.      |
| `DEMO-NEPH-004` | Phạm Quốc Bảo  | Acute kidney injury followed by partial renal recovery and medication reconciliation. |
| `DEMO-NEPH-005` | Võ Ngọc Mai    | CKD G5 requiring kidney replacement therapy education and access planning.            |
| `DEMO-NEPH-006` | Đặng Minh Tuấn | Urgent potassium result of 6.0 mmol/L linked to an escalation task.                   |

## Loading the demo

1. Sign in to the local HyperSol workspace.
2. Open **Get Started**.
3. Select **Import Nephrology Demo**.
4. Open **Patients** to browse the 15-patient cohort.
5. Open **Tasks** to demonstrate the six follow-up actions assigned to the signed-in clinician.

The import uses conditional-create identifiers, so running it again does not duplicate the same demo records. Tasks are assigned to the account performing the import, which keeps the main **My Tasks** view useful during a presentation.

## Recommended presentation path

1. Start in **Patients** and explain the compact cohort.
2. Open Nguyễn Thị Lan to show problems, medications, renal laboratory results, weight, and blood pressure in one patient view.
3. Open the renal function report to show Creatinine, eGFR, Potassium, Hemoglobin, and UACR together.
4. Open **Tasks** and select Đặng Minh Tuấn to demonstrate the urgent hyperkalemia escalation workflow.
5. Open Võ Ngọc Mai to discuss advanced CKD care planning.

## Safety and maintenance

- Never present this dataset as real clinical information.
- Medication entries are workflow examples and are not prescribing recommendations.
- Clinical values are plausible for demonstration, but a nephrologist should review any dataset intended for education or protocol design.
- Every generated resource is tagged `synthetic-demo` using the HyperSol local data-origin code system.
- The source of truth is `src/data/nephrologyDemo.ts`; tests in `src/data/nephrologyDemo.test.ts` protect cohort size, reference integrity, terminology, idempotence, and the urgent-result workflow.
