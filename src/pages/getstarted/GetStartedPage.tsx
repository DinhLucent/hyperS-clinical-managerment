// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import {
  ActionIcon,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Group,
  List,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { convertToTransactionBundle } from '@medplum/core';
import type { Bundle, BundleEntry } from '@medplum/fhirtypes';
import { MedplumLink, useMedplum } from '@medplum/react';
import { useSyncOrderSet } from '@medplum/react-hooks';
import {
  IconApps,
  IconBook,
  IconBuilding,
  IconDatabase,
  IconDownload,
  IconFileText,
  IconHelpCircle,
  IconMedicalCross,
  IconUser,
} from '@tabler/icons-react';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';
import orderSetBundleData from '../../data/order-set-example-bundle.json';
import patientBundleData from '../../data/patient-david-james-williams.json';
import visitBundleData from '../../data/simple-initial-visit-bundle.json';
import { showErrorNotification } from '../../utils/notifications';
import classes from './GetStartedPage.module.css';
import { buildOrderSetImportNotification } from './orderSetImportNotification';

export function GetStartedPage(): JSX.Element {
  const medplum = useMedplum();
  const syncOrderSet = useSyncOrderSet();
  const [importingPatient, setImportingPatient] = useState(false);
  const [importingVisit, setImportingVisit] = useState(false);
  const [importingIcd10, setImportingIcd10] = useState(false);
  const [importingOrderSet, setImportingOrderSet] = useState(false);

  const handleImportPatient = useCallback(async () => {
    setImportingPatient(true);
    try {
      // Convert searchset bundle to transaction bundle
      const transactionBundle = convertToTransactionBundle(patientBundleData as Bundle);
      const result = await medplum.executeBatch(transactionBundle);

      const resourceCount =
        result.entry?.filter((entry: BundleEntry) => entry.response?.status?.startsWith('2')).length || 0;

      showNotification({
        color: 'green',
        title: 'Success',
        message: `Imported ${resourceCount} resources for patient David James Williams`,
      });
    } catch (error) {
      showErrorNotification(error);
    } finally {
      setImportingPatient(false);
    }
  }, [medplum]);

  const handleImportVisit = useCallback(async () => {
    setImportingVisit(true);
    try {
      // The visit bundle is already a transaction bundle
      const result = await medplum.executeBatch(visitBundleData as Bundle);

      const resourceCount =
        result.entry?.filter((entry: BundleEntry) => entry.response?.status?.startsWith('2')).length || 0;

      showNotification({
        color: 'green',
        title: 'Success',
        message: `Imported ${resourceCount} resources for Simple Initial Visit template`,
      });
    } catch (error) {
      showErrorNotification(error);
    } finally {
      setImportingVisit(false);
    }
  }, [medplum]);

  const handleImportIcd10 = useCallback(async () => {
    setImportingIcd10(true);
    try {
      await medplum.upsertResource(
        {
          resourceType: 'ValueSet',
          status: 'active',
          url: 'http://hl7.org/fhir/sid/icd-10-cm/vs/billable',
          title: 'ICD-10-CM Billable Codes',
          name: 'icd10cm-billable',
          compose: {
            include: [
              {
                system: 'http://hl7.org/fhir/sid/icd-10-cm',
                filter: [{ property: 'tty', op: '=', value: 'PT' }],
              },
            ],
          },
        },
        { url: 'http://hl7.org/fhir/sid/icd-10-cm/vs/billable' }
      );
      showNotification({ color: 'green', title: 'Success', message: 'ICD-10-CM Billable Codes ValueSet ready' });
    } catch (error) {
      showErrorNotification(error);
    } finally {
      setImportingIcd10(false);
    }
  }, [medplum]);

  const handleImportOrderSet = useCallback(async () => {
    setImportingOrderSet(true);
    try {
      const transactionBundle = convertToTransactionBundle(orderSetBundleData as Bundle);
      const result = await medplum.executeBatch(transactionBundle);

      const resourceCount =
        result.entry?.filter((entry: BundleEntry) => entry.response?.status?.startsWith('2')).length || 0;

      const pdLocation = result.entry?.find((e) => e.response?.location?.startsWith('PlanDefinition/'))?.response
        ?.location;
      const pdId = pdLocation?.split('/')[1];
      const syncResult = pdId ? await syncOrderSet(pdId) : undefined;

      showNotification({ ...buildOrderSetImportNotification(resourceCount, syncResult) });
    } catch (error) {
      showErrorNotification(error);
    } finally {
      setImportingOrderSet(false);
    }
  }, [medplum, syncOrderSet]);

  return (
    <Box className={classes.page} py="6rem">
      <Container size="md" className={classes.container}>
        {/* Header */}
        <Box mb="6rem">
          <Title order={2} fw={800}>
            Get Started with HyperS
          </Title>
          <Text size="lg" mt=".25rem" className={classes.textSecondary}>
            Use this local demo to explore sample clinical workflows, review the available integrations, and configure
            your workspace at your own pace.
          </Text>
        </Box>

        <Stack gap="6rem">
          {/* Sample Data */}
          <Box>
            <Group mb="xl" gap="sm" align="center">
              <ActionIcon size={48} radius="xl" variant="light" className={classes.sectionIcon}>
                <IconDatabase size={24} color="white" />
              </ActionIcon>
              <Stack gap={0} className={classes.flexOne}>
                <Text fw={800} size="xl">
                  Import Sample Data
                </Text>
                <Text size="sm" className={classes.textSecondary}>
                  Add placeholder data for patients, visits, and more to practice with.
                </Text>
              </Stack>
            </Group>
            <Box className={classes.sampleDataGrid}>
              <Paper radius="md" withBorder p="lg" shadow="sm" className={classes.card}>
                <Stack gap="md" className={classes.flexOne}>
                  <Group gap="sm" align="center">
                    <IconUser size={24} color="var(--icon-secondary)" />
                    <Stack gap={0}>
                      <Text size="11px" fw={500} className={classes.textLabel}>
                        Sample Patient
                      </Text>
                      <Text fw={600} size="lg">
                        David James Williams
                      </Text>
                    </Stack>
                  </Group>
                  <Divider />
                  <Text size="md" className={classes.textSecondary} mb="sm" style={{ flex: 1 }}>
                    Includes a sample patient with demographics and basic clinical data.
                  </Text>
                </Stack>
                <Button
                  variant="filled"
                  size="sm"
                  fullWidth
                  onClick={handleImportPatient}
                  loading={importingPatient}
                  disabled={importingPatient}
                  leftSection={<IconDownload size={14} />}
                  mt="sm"
                >
                  {importingPatient ? 'Importing...' : 'Import Patient'}
                </Button>
              </Paper>
              <Paper radius="md" withBorder p="lg" shadow="sm" className={classes.card}>
                <Stack gap="md" className={classes.flexOne}>
                  <Group gap="sm" align="center">
                    <IconFileText size={24} color="var(--icon-secondary)" />
                    <Stack gap={0}>
                      <Text size="11px" fw={500} className={classes.textLabel}>
                        Sample Care Template
                      </Text>
                      <Text fw={600} size="lg">
                        Simple Initial Visit
                      </Text>
                    </Stack>
                  </Group>
                  <Divider />
                  <Text size="md" className={classes.textSecondary} style={{ flex: 1 }}>
                    A simple note template for a first patient visit that includes tasks and questionnaires.
                  </Text>
                  <Text size="xs" c="dimmed" mb="sm">
                    Note: a Care Template (aka PlanDefinition FHIR resource) is optional, but tasks from it will be
                    automatically added to a visit if one is selected.
                  </Text>
                </Stack>
                <Button
                  variant="filled"
                  size="sm"
                  fullWidth
                  onClick={handleImportVisit}
                  loading={importingVisit}
                  disabled={importingVisit}
                  leftSection={<IconDownload size={14} />}
                  mt="sm"
                >
                  {importingVisit ? 'Importing...' : 'Import Care Template'}
                </Button>
              </Paper>
              <Paper radius="md" withBorder p="lg" shadow="sm" className={classes.card}>
                <Stack gap="md" className={classes.flexOne}>
                  <Group gap="sm" align="center">
                    <IconMedicalCross size={24} color="var(--icon-secondary)" />
                    <Stack gap={0}>
                      <Text size="11px" fw={500} className={classes.textLabel}>
                        Code System
                      </Text>
                      <Text fw={600} size="lg">
                        ICD-10-CM Billable Codes
                      </Text>
                    </Stack>
                  </Group>
                  <Divider />
                  <Text size="md" className={classes.textSecondary} mb="sm" style={{ flex: 1 }}>
                    Registers the ICD-10-CM billable codes ValueSet used for diagnosis code lookup.
                  </Text>
                </Stack>
                <Button
                  variant="filled"
                  size="sm"
                  fullWidth
                  onClick={handleImportIcd10}
                  loading={importingIcd10}
                  disabled={importingIcd10}
                  leftSection={<IconDownload size={14} />}
                  mt="sm"
                >
                  {importingIcd10 ? 'Importing...' : 'Import ValueSet'}
                </Button>
              </Paper>
              <Paper radius="md" withBorder p="lg" shadow="sm" className={classes.card}>
                <Stack gap="md" className={classes.flexOne}>
                  <Group gap="sm" align="center">
                    <IconMedicalCross size={24} color="var(--icon-secondary)" />
                    <Stack gap={0}>
                      <Text size="11px" fw={500} className={classes.textLabel}>
                        Sample Order Set
                      </Text>
                      <Text fw={600} size="lg">
                        Geriatric T2DM Starter
                      </Text>
                    </Stack>
                  </Group>
                  <Divider />
                  <Text size="md" className={classes.textSecondary} mb="sm" style={{ flex: 1 }}>
                    A sample order set with medication templates for geriatric type 2 diabetes management.
                  </Text>
                </Stack>
                <Button
                  variant="filled"
                  size="sm"
                  fullWidth
                  onClick={handleImportOrderSet}
                  loading={importingOrderSet}
                  disabled={importingOrderSet}
                  leftSection={<IconDownload size={14} />}
                  mt="sm"
                >
                  {importingOrderSet ? 'Importing...' : 'Import Order Set'}
                </Button>
              </Paper>
              <Paper radius="md" withBorder p="lg" shadow="sm" className={classes.card}>
                <Stack gap="md" className={classes.flexOne}>
                  <Group gap="sm" align="center">
                    <IconBuilding size={24} color="var(--icon-secondary)" />
                    <Stack gap={0}>
                      <Text size="11px" fw={500} className={classes.textLabel}>
                        Practice Demo
                      </Text>
                      <Text fw={600} size="lg">
                        Full Practice Demo
                      </Text>
                    </Stack>
                  </Group>
                  <Divider />
                  <Text size="md" className={classes.textSecondary} mb="sm" style={{ flex: 1 }}>
                    Complete dataset with patients, practitioners, and schedules.
                  </Text>
                </Stack>
                <Button variant="outline" size="sm" fullWidth disabled mt="sm">
                  Coming Soon
                </Button>
              </Paper>
              <Paper radius="md" withBorder p="lg" shadow="sm" className={classes.card}>
                <Stack gap="md" className={classes.flexOne}>
                  <Group gap="sm" align="center">
                    <IconBuilding size={24} color="var(--icon-secondary)" />
                    <Stack gap={0}>
                      <Text size="11px" fw={500} className={classes.textLabel}>
                        Organization
                      </Text>
                      <Text fw={600} size="lg">
                        Sample Organization
                      </Text>
                    </Stack>
                  </Group>
                  <Divider />
                  <Text size="md" className={classes.textSecondary} mb="sm" style={{ flex: 1 }}>
                    Sample organization data with practitioners and locations.
                  </Text>
                </Stack>
                <Button variant="outline" size="sm" fullWidth disabled mt="sm">
                  Coming Soon
                </Button>
              </Paper>
            </Box>
          </Box>

          {/* Integrate Your Services */}
          <Box>
            <Group mb="xl" gap="sm" align="center">
              <ActionIcon size={48} radius="xl" variant="light" className={classes.sectionIcon}>
                <IconApps size={24} color="white" />
              </ActionIcon>
              <Stack gap={0} className={classes.flexOne}>
                <Text fw={800} size="xl">
                  Integrate Your Services
                </Text>
                <Text size="sm" className={classes.textSecondary}>
                  Explore the services that can connect to your clinical workspace. Integration requests are coming
                  soon.
                </Text>
              </Stack>
            </Group>
            <Paper radius="md" withBorder p="md" shadow="sm">
              <Grid gutter="lg" align="center">
                <Grid.Col span={12}>
                  <Stack gap="md" style={{ display: 'flex', justifyContent: 'center', height: '100%' }}>
                    <Box>
                      <Text size="sm" my="md">
                        Integrate with partners for…
                      </Text>
                      <List size="sm" spacing="0">
                        <List.Item>
                          <Text span size="sm" fw={600}>
                            Labs:
                          </Text>{' '}
                          Labcorp, Quest, & Health Gorilla
                        </List.Item>
                        <List.Item>
                          <Text span size="sm" fw={600}>
                            Pharmacies:
                          </Text>{' '}
                          Surescripts & DoseSpot
                        </List.Item>
                        <List.Item>
                          <Text span size="sm" fw={600}>
                            Billing:
                          </Text>{' '}
                          Candid Health & Stedi
                        </List.Item>
                        <List.Item>
                          <Text span size="sm" fw={600}>
                            Utilities:
                          </Text>{' '}
                          eFax, OpenAI, Okta, and more
                        </List.Item>
                      </List>
                    </Box>
                    <Box mb="sm">
                      <MedplumLink to="/integrations" c="blue" fw={500}>
                        View All Integrations →
                      </MedplumLink>
                    </Box>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Paper>
          </Box>

          {/* Core workflows */}
          <Box>
            <Group mb="xl" gap="sm" align="center">
              <ActionIcon size={48} radius="xl" variant="light" className={classes.sectionIcon}>
                <IconBook size={24} color="white" />
              </ActionIcon>
              <Stack gap={0} className={classes.flexOne}>
                <Text fw={800} size="xl">
                  Explore Core Workflows
                </Text>
                <Text size="sm" className={classes.textSecondary}>
                  Guided documentation is coming soon. These workflow cards outline the main areas to explore in the
                  local demo.
                </Text>
              </Stack>
            </Group>
            <Paper radius="md" withBorder shadow="sm" p={0} style={{ overflow: 'hidden' }}>
              <Grid gutter={0}>
                {/* Getting Started */}
                <Grid.Col span={{ base: 12, sm: 6 }} className={classes.gridCell}>
                  <Box p="lg" className={classes.gridCellContent}>
                    <Box className={classes.dividerRight} />
                    <Box className={classes.dividerBottom} />
                    <Text fw={600} size="lg" className={classes.sectionTitle} mb="xs">
                      Adding Practitioners &amp; Data
                    </Text>
                    <List size="md" spacing={2} className={classes.flexOne}>
                      <List.Item>Adding Practitioners</List.Item>
                      <List.Item>Importing Data</List.Item>
                    </List>
                    <Button variant="light" size="xs" disabled mt="sm">
                      Coming soon
                    </Button>
                  </Box>
                </Grid.Col>

                {/* Patient Profile */}
                <Grid.Col span={{ base: 12, sm: 6 }} className={classes.gridCell}>
                  <Box p="lg" className={classes.gridCellContent}>
                    <Box className={classes.dividerBottom} />
                    <Text fw={600} size="lg" className={classes.sectionTitle} mb="xs">
                      Patient Profile
                    </Text>
                    <List size="md" spacing={2} className={classes.flexOne}>
                      <List.Item>Registering Patients</List.Item>
                      <List.Item>Editing Patient Demographics</List.Item>
                      <List.Item>Updating Patient Summary</List.Item>
                    </List>
                    <Button variant="light" size="xs" disabled mt="sm">
                      Coming soon
                    </Button>
                  </Box>
                </Grid.Col>

                {/* Schedule */}
                <Grid.Col span={{ base: 12, sm: 6 }} className={classes.gridCell}>
                  <Box p="lg" className={classes.gridCellContent}>
                    <Box className={classes.dividerRight} />
                    <Text fw={600} size="lg" className={classes.sectionTitle} mb="xs">
                      Schedule
                    </Text>
                    <List size="sm" spacing={2} className={classes.flexOne}>
                      <List.Item>Scheduling a Visit</List.Item>
                      <List.Item>Setting Provider Availability</List.Item>
                    </List>
                    <Button variant="light" size="xs" disabled mt="sm">
                      Coming soon
                    </Button>
                  </Box>
                </Grid.Col>

                {/* Visits */}
                <Grid.Col span={{ base: 12, sm: 6 }} className={classes.gridCell}>
                  <Box p="lg" className={classes.gridCellContent}>
                    <Text fw={600} size="lg" className={classes.sectionTitle} mb="xs">
                      Visits
                    </Text>
                    <List size="sm" spacing={2} className={classes.flexOne}>
                      <List.Item>Understanding Visits</List.Item>
                      <List.Item>Documenting Visits</List.Item>
                      <List.Item>Setting Up Care Templates</List.Item>
                    </List>
                    <Button variant="light" size="xs" disabled mt="sm">
                      Coming soon
                    </Button>
                  </Box>
                </Grid.Col>
              </Grid>
            </Paper>
          </Box>

          {/* HyperS support */}
          <Box>
            <Group mb="xl" gap="sm" align="center">
              <ActionIcon size={48} radius="xl" variant="light" className={classes.sectionIcon}>
                <IconHelpCircle size={24} color="white" />
              </ActionIcon>
              <Stack gap={0} className={classes.flexOne}>
                <Text fw={800} size="xl">
                  HyperS Support
                </Text>
                <Text size="sm" className={classes.textSecondary}>
                  Support channels are coming soon.
                </Text>
              </Stack>
            </Group>
            <Grid gutter="md">
              <Grid.Col span={12} className={classes.gridCell}>
                <Paper radius="md" withBorder p="lg" shadow="sm" className={classes.helpCard}>
                  <Stack gap="md" className={classes.flexOne}>
                    <Text fw={600} size="lg">
                      Support channels
                    </Text>
                    <Divider />
                    <Text size="md" className={classes.textSecondary} mb="sm" style={{ flex: 1 }}>
                      HyperS support resources are being prepared for this local customer demo.
                    </Text>
                  </Stack>
                  <Button variant="filled" size="sm" mt="sm" fullWidth disabled>
                    Coming soon
                  </Button>
                </Paper>
              </Grid.Col>
            </Grid>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
