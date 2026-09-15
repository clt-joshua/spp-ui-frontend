import { useState } from 'react';
import { Tabs, Tab, TabList, TabPanel } from '@/ui';
import { SampleGroup } from './SampleGroup';
import styles from '../ComponentGalleryPage.module.css';

export function TabsGallery() {
  const [tabValue, setTabValue] = useState<'overview' | 'tokens' | 'behavior'>('overview');

  return (
    <>
      <SampleGroup title="Tabs · interactive state">
        <p className={styles.matrixHint}>
          방향키/Home/End는 focus만 이동하고 Enter/Space 또는 click이 panel을 선택합니다.
        </p>
        <Tabs
          className={styles.tabDemo}
          onValueChange={setTabValue}
          value={tabValue}
        >
          <TabList label="디자인 시스템 문서">
            <Tab showTrailingIcon={false} value="overview">Overview</Tab>
            <Tab value="tokens">Tokens</Tab>
            <Tab value="behavior">Behavior</Tab>
            <Tab disabled value="disabled">Disabled</Tab>
          </TabList>
          <TabPanel className={styles.tabPanel} value="overview">
            Overview panel — Figma 40px container와 full-width active indicator를 확인합니다.
          </TabPanel>
          <TabPanel className={styles.tabPanel} value="tokens">
            Tokens panel — project component token graph를 사용합니다.
          </TabPanel>
          <TabPanel className={styles.tabPanel} value="behavior">
            Behavior panel — MD3 manual activation과 tabpanel 연결을 유지합니다.
          </TabPanel>
          <TabPanel className={styles.tabPanel} value="disabled">
            Disabled tab은 선택할 수 없습니다.
          </TabPanel>
        </Tabs>
      </SampleGroup>
    </>
  );
}
