import { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Chip,
  ChipSet,
  Dialog,
  DialogClose,
  IconButton,
  MaterialIcon,
  Menu,
  Radio,
  RadioGroup,
  Select,
  SegmentedButton,
  SegmentedButtonSet,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  TextField,
  useSnackbar,
  useTheme,
  type ButtonSize,
  type ButtonVariant,
  type CheckboxSize,
  type ChipAssistiveLevel,
  type ChipSize,
  type IconButtonSize,
  type IconButtonVariant,
  type RadioSize,
} from '@/ui';
import styles from './ComponentGalleryPage.module.css';

const assistiveLevels: ChipAssistiveLevel[] = [
  'primary',
  'secondary',
  'neutral',
  'outline',
  'systemError',
  'systemWarning',
  'systemGood',
  'systemInfo',
  'systemErrorVariant',
  'systemWarningVariant',
  'systemGoodVariant',
  'systemInfoVariant',
];

const chipSizes: ChipSize[] = ['large', 'small', 'x-small'];
const buttonSizes: ButtonSize[] = ['large', 'medium', 'small'];
const iconButtonSizes: IconButtonSize[] = ['large', 'medium', 'small'];
const iconButtonVariants: IconButtonVariant[] = [
  'standard',
  'filled',
  'tonal',
  'outlined',
  'error',
];
const checkboxSizes: CheckboxSize[] = ['large', 'medium', 'small'];
const radioSizes: RadioSize[] = ['large', 'medium', 'small'];
const buttonVariants: ButtonVariant[] = ['filled', 'outlined', 'text', 'elevated', 'tonal'];
const buttonContentTypes: Record<
  ButtonVariant,
  { leading: boolean; trailing: boolean }
> = {
  filled: { leading: true, trailing: false },
  outlined: { leading: true, trailing: true },
  text: { leading: true, trailing: true },
  elevated: { leading: true, trailing: false },
  tonal: { leading: true, trailing: false },
};

const sections = [
  { id: 'actions', label: 'Actions', count: 2, components: 'Button · IconButton' },
  { id: 'navigation', label: 'Navigation', count: 2, components: 'Tabs · Segmented Button' },
  { id: 'form-fields', label: 'Form fields', count: 2, components: 'TextField · Select' },
  { id: 'selection-controls', label: 'Selection controls', count: 3, components: 'Checkbox · Radio · Switch' },
  { id: 'chips', label: 'Chips', count: 1, components: 'Chip' },
  { id: 'dialogs', label: 'Dialogs', count: 1, components: 'Dialog' },
  { id: 'menus', label: 'Menus', count: 1, components: 'Menu' },
  { id: 'feedback', label: 'Feedback', count: 1, components: 'Snackbar' },
] as const;

export function ComponentGalleryPage() {
  const theme = useTheme();
  const snackbar = useSnackbar();
  const [favoriteSelected, setFavoriteSelected] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [radioValue, setRadioValue] = useState('selected');
  const [switchSelected, setSwitchSelected] = useState(false);
  const [tabValue, setTabValue] = useState<'overview' | 'tokens' | 'behavior'>('overview');
  const [segmentValue, setSegmentValue] = useState<'day' | 'week' | 'month' | 'year' | 'agenda'>('day');
  const [visibleLayers, setVisibleLayers] = useState<Array<'labels' | 'routes' | 'restricted'>>(['labels']);
  const [platform, setPlatform] = useState<'web' | 'desktop' | 'mobile'>('web');
  const [filterSelected, setFilterSelected] = useState(false);
  const [inputChipVisible, setInputChipVisible] = useState(true);
  const [menuChecked, setMenuChecked] = useState(true);
  const [menuDensity, setMenuDensity] = useState('comfortable');

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'SPP UI Component Verification';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const showLoadingSnackbar = () => {
    snackbar.show({
      dismissLabel: '로딩 Snackbar 닫기',
      message: '컴포넌트 상태를 확인하고 있습니다.',
      timeout: 0,
      type: 'loading',
    });
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <a className={styles.brand} href="/" aria-label="SPP UI Theme Lab으로 이동">
          <span className={styles.brandMark}><MaterialIcon name="deployed_code" /></span>
          <span>SPP UI</span>
        </a>
        <nav aria-label="주요 페이지" className={styles.pageNav}>
          <a href="/">Theme Lab</a>
          <a aria-current="page" href="/components">컴포넌트 검증</a>
        </nav>
        <span className={styles.runtimeStatus}>
          <span className={styles.statusDot} />
          {theme.resolvedMode === 'dark' ? 'Dark' : 'Light'} · {theme.config.contrast === 'high' ? 'High' : 'Standard'}
        </span>
      </header>

      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div>
            <span className={styles.eyebrow}>Verification workspace</span>
            <h1>컴포넌트 검증</h1>
            <p>공개 API의 variant, 상태, 크기와 실제 상호작용을 제품 진입점에서 확인합니다.</p>
          </div>

          <div className={styles.summary} aria-label="검증 페이지 요약">
            <div><strong>13</strong><span>Components</span></div>
            <div><strong>{sections.length}</strong><span>Groups</span></div>
            <div><strong>Live</strong><span>Interactions</span></div>
          </div>

          <nav aria-label="컴포넌트 그룹" className={styles.sectionNav}>
            {sections.map((section) => (
              <a href={`#${section.id}`} key={section.id}>
                <span className={styles.sectionNavCopy}>
                  <span>{section.label}</span>
                  <small>{section.components}</small>
                </span>
                <span aria-hidden="true" className={styles.sectionCount}>{section.count}</span>
              </a>
            ))}
          </nav>

          <div className={styles.checklist}>
            <h2>확인 기준</h2>
            <ul>
              <li>variant와 size 누락 여부</li>
              <li>enabled·selected·error·disabled 상태</li>
              <li>Tab·방향키·Escape 포커스 흐름</li>
              <li>현재 Theme token 상속</li>
              <li>좁은 화면 overflow 여부</li>
            </ul>
          </div>
        </aside>

        <div className={styles.content}>
          <section className={styles.hero} aria-labelledby="gallery-title">
            <div>
              <span className={styles.eyebrow}>Design system inventory</span>
              <h2 id="gallery-title">한 페이지에서 전체 상태를 비교하세요</h2>
              <p>각 샘플은 실제 디자인 시스템 export를 사용합니다. Theme Lab에서 색상과 대비를 변경한 뒤 돌아오면 같은 system token 결과가 적용됩니다.</p>
            </div>
            <a className={styles.themeLink} href="/">
              Theme 변경
              <MaterialIcon name="arrow_forward" />
            </a>
          </section>

          <GallerySection
            description="Figma Button 360 variants와 IconButton 75 variants의 size, style, content, error 및 실제 MD3 interaction 상태"
            id="actions"
            index="01"
            title="Actions"
          >
            {buttonSizes.map((size) => (
              <SampleGroup key={size} title={'Button · ' + size}>
                <p className={styles.matrixHint}>
                  Enabled 샘플에 hover, Tab focus, Space/Enter press를 적용해 transient state를 확인합니다.
                </p>
                <div className={styles.buttonMatrixViewport}>
                  <table className={styles.buttonMatrix}>
                    <thead>
                      <tr>
                        <th scope="col">Style</th>
                        <th scope="col">Text</th>
                        <th scope="col">Left icon</th>
                        <th scope="col">Right icon</th>
                        <th scope="col">Error text</th>
                        <th scope="col">Error left</th>
                        <th scope="col">Error right</th>
                        <th scope="col">Disabled</th>
                        <th scope="col">Disabled error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {buttonVariants.map((variant) => {
                        const contentTypes = buttonContentTypes[variant];
                        return (
                          <tr key={variant}>
                            <th scope="row">{variant}</th>
                            <td>
                              <Button
                                aria-label={[size, variant, 'text'].join(' ')}
                                size={size}
                                variant={variant}
                              >
                                Label
                              </Button>
                            </td>
                            <td>
                              {contentTypes.leading ? (
                                <Button
                                  aria-label={[size, variant, 'left icon'].join(' ')}
                                  leadingIcon={<MaterialIcon name="keyboard_command_key" />}
                                  size={size}
                                  variant={variant}
                                >
                                  Label
                                </Button>
                              ) : <span aria-label="지원하지 않음" className={styles.matrixUnavailable}>—</span>}
                            </td>
                            <td>
                              {contentTypes.trailing ? (
                                <Button
                                  aria-label={[size, variant, 'right icon'].join(' ')}
                                  size={size}
                                  trailingIcon={<MaterialIcon name="keyboard_command_key" />}
                                  variant={variant}
                                >
                                  Label
                                </Button>
                              ) : <span aria-label="지원하지 않음" className={styles.matrixUnavailable}>—</span>}
                            </td>
                            <td>
                              <Button
                                aria-label={[size, variant, 'error text'].join(' ')}
                                error
                                size={size}
                                variant={variant}
                              >
                                Label
                              </Button>
                            </td>
                            <td>
                              {contentTypes.leading ? (
                                <Button
                                  aria-label={[size, variant, 'error left icon'].join(' ')}
                                  error
                                  leadingIcon={<MaterialIcon name="keyboard_command_key" />}
                                  size={size}
                                  variant={variant}
                                >
                                  Label
                                </Button>
                              ) : <span aria-label="지원하지 않음" className={styles.matrixUnavailable}>—</span>}
                            </td>
                            <td>
                              {contentTypes.trailing ? (
                                <Button
                                  aria-label={[size, variant, 'error right icon'].join(' ')}
                                  error
                                  size={size}
                                  trailingIcon={<MaterialIcon name="keyboard_command_key" />}
                                  variant={variant}
                                >
                                  Label
                                </Button>
                              ) : <span aria-label="지원하지 않음" className={styles.matrixUnavailable}>—</span>}
                            </td>
                            <td>
                              <Button
                                aria-label={[size, variant, 'disabled'].join(' ')}
                                disabled
                                size={size}
                                variant={variant}
                              >
                                Label
                              </Button>
                            </td>
                            <td>
                              <Button
                                aria-label={[size, variant, 'disabled error'].join(' ')}
                                disabled
                                error
                                size={size}
                                variant={variant}
                              >
                                Label
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </SampleGroup>
            ))}

            {iconButtonSizes.map((size) => (
              <SampleGroup key={size} title={'IconButton · ' + size}>
                <p className={styles.matrixHint}>
                  Action 샘플에 hover, Tab focus, Space/Enter press를 적용해 transient state를 확인합니다.
                </p>
                <div className={styles.buttonMatrixViewport}>
                  <table className={`${styles.buttonMatrix} ${styles.iconButtonMatrix}`}>
                    <thead>
                      <tr>
                        <th scope="col">Style</th>
                        <th scope="col">Action</th>
                        <th scope="col">Toggle</th>
                        <th scope="col">Selected</th>
                        <th scope="col">Disabled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {iconButtonVariants.map((variant) => (
                        <tr key={variant}>
                          <th scope="row">{variant}</th>
                          <td>
                            <IconButton
                              aria-label={[size, variant, 'action'].join(' ')}
                              icon={<MaterialIcon name="keyboard_command_key" />}
                              size={size}
                              variant={variant}
                            />
                          </td>
                          <td>
                            <IconButton
                              aria-label={[size, variant, 'add favorite'].join(' ')}
                              icon={<MaterialIcon name="favorite_border" />}
                              onClick={() => setFavoriteSelected((current) => !current)}
                              selected={favoriteSelected}
                              selectedAriaLabel={[size, variant, 'remove favorite'].join(' ')}
                              selectedIcon={<MaterialIcon name="favorite" />}
                              size={size}
                              variant={variant}
                            />
                          </td>
                          <td>
                            <IconButton
                              aria-label={[size, variant, 'unselected bookmark'].join(' ')}
                              icon={<MaterialIcon name="bookmark_border" />}
                              selected
                              selectedAriaLabel={[size, variant, 'selected bookmark'].join(' ')}
                              selectedIcon={<MaterialIcon name="bookmark" />}
                              size={size}
                              variant={variant}
                            />
                          </td>
                          <td>
                            <IconButton
                              aria-label={[size, variant, 'disabled'].join(' ')}
                              disabled
                              icon={<MaterialIcon name="block" />}
                              size={size}
                              variant={variant}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SampleGroup>
            ))}
          </GallerySection>

          <GallerySection
            description="Figma Primary Tab과 Segmented Button anatomy, MD3 selection 및 keyboard 동작"
            id="navigation"
            index="02"
            title="Navigation"
          >
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

            <SampleGroup title="Segmented Button · single selection">
              <p className={styles.matrixHint}>
                단일 선택은 활성 세그먼트를 다시 눌러 해제하지 않습니다. 각 native button은 Tab으로 이동하고 Space/Enter로 선택합니다.
              </p>
              <div className={styles.segmentedButtonViewport}>
                <SegmentedButtonSet<'day' | 'week' | 'month' | 'year' | 'agenda'>
                  label="일정 보기 범위"
                  onValueChange={setSegmentValue}
                  style={{ inlineSize: '32.25rem' }}
                  value={segmentValue}
                >
                  <SegmentedButton icon={<MaterialIcon name="today" />} value="day">Day</SegmentedButton>
                  <SegmentedButton value="week">Week</SegmentedButton>
                  <SegmentedButton value="month">Month</SegmentedButton>
                  <SegmentedButton value="year">Year</SegmentedButton>
                  <SegmentedButton aria-label="Agenda view" icon={<MaterialIcon name="view_agenda" />} value="agenda" />
                </SegmentedButtonSet>
              </div>
            </SampleGroup>

            <SampleGroup title="Segmented Button · multiple and disabled">
              <div className={styles.segmentedButtonStack}>
                <SegmentedButtonSet<'labels' | 'routes' | 'restricted'>
                  label="지도 레이어"
                  onValueChange={setVisibleLayers}
                  selectionMode="multiple"
                  value={visibleLayers}
                >
                  <SegmentedButton icon={<MaterialIcon name="label" />} value="labels">Labels</SegmentedButton>
                  <SegmentedButton icon={<MaterialIcon name="route" />} value="routes">Routes</SegmentedButton>
                  <SegmentedButton disabled icon={<MaterialIcon name="lock" />} value="restricted">Restricted</SegmentedButton>
                </SegmentedButtonSet>
                <SegmentedButtonSet defaultValue="selected" label="비활성 선택 상태">
                  <SegmentedButton disabled value="selected">Selected disabled</SegmentedButton>
                  <SegmentedButton disabled value="unavailable">Disabled</SegmentedButton>
                </SegmentedButtonSet>
              </div>
            </SampleGroup>
          </GallerySection>

          <GallerySection
            description="텍스트 및 옵션 입력 anatomy, supporting/error와 filled·outlined 상태"
            id="form-fields"
            index="03"
            legacyId="inputs"
            title="Form fields"
          >
            <SampleGroup title="TextField variants and states">
              <div className={styles.fieldGrid}>
                <TextField label="Outlined" supportingText="기본 supporting text" />
                <TextField label="Filled" supportingText="Filled container" variant="filled" />
                <TextField error errorText="입력값을 다시 확인하세요." label="Error" value="Invalid value" readOnly />
                <TextField disabled label="Disabled" supportingText="비활성 상태" value="Unavailable" />
                <TextField label="Leading icon" leadingIcon={<MaterialIcon name="search" />} value="Search query" readOnly />
                <TextField label="Trailing icon" trailingIcon={<MaterialIcon name="visibility" />} type="password" value="password" readOnly />
              </div>
            </SampleGroup>

            <SampleGroup title="Select variants and states">
              <div className={styles.fieldGrid}>
                <Select
                  label="대상 플랫폼"
                  onValueChange={setPlatform}
                  options={[
                    { value: 'web', label: 'Web application' },
                    { value: 'desktop', label: 'Desktop application' },
                    { value: 'mobile', label: 'Mobile application' },
                  ]}
                  supportingText="방향키로 option을 이동합니다."
                  value={platform}
                />
                <Select label="Filled select" options={[{ value: 'one', label: 'Option one' }]} value="one" variant="filled" />
                <Select error errorText="필수 항목입니다." label="Error select" options={[{ value: 'one', label: 'Option one' }]} />
                <Select disabled label="Disabled select" options={[{ value: 'one', label: 'Option one' }]} supportingText="비활성 상태" />
              </div>
            </SampleGroup>
          </GallerySection>

          <GallerySection
            description="Checkbox, Radio, Switch의 binary·single selection, mixed와 disabled 상태"
            id="selection-controls"
            index="04"
            title="Selection controls"
          >
            <SampleGroup title="Switch · selection × disabled">
              <p className={styles.matrixHint}>
                Small 단일 규격입니다. Space와 Enter로 실제 binary 상태를 전환합니다.
              </p>
              <div className={styles.switchMatrix}>
                <div className={styles.switchRow}>
                  <span className={styles.variantLabel}>32 × 18</span>
                  <span className={styles.switchSample}>
                    <Switch
                      aria-label="enabled switch"
                      onSelectedChange={setSwitchSelected}
                      selected={switchSelected}
                    />
                    <span>Enabled</span>
                  </span>
                  <span className={styles.switchSample}>
                    <Switch aria-label="selected switch" defaultSelected />
                    <span>Selected</span>
                  </span>
                  <span className={styles.switchSample}>
                    <Switch aria-label="disabled switch" disabled />
                    <span>Disabled</span>
                  </span>
                  <span className={styles.switchSample}>
                    <Switch aria-label="disabled selected switch" defaultSelected disabled />
                    <span>Disabled selected</span>
                  </span>
                </div>
              </div>
            </SampleGroup>

            {checkboxSizes.map((size) => (
              <SampleGroup key={size} title={`Checkbox — ${size}`}>
                <div className={styles.checkboxGrid}>
                  {size === 'large' ? (
                    <Checkbox
                      checked={notifications}
                      label="large Controlled"
                      onCheckedChange={setNotifications}
                      size={size}
                      supportingText="클릭하여 상태를 확인하세요."
                    />
                  ) : null}
                  <Checkbox label={`${size} Unchecked`} size={size} />
                  <Checkbox defaultChecked label={`${size} Checked`} size={size} />
                  <Checkbox defaultChecked indeterminate label={`${size} Indeterminate`} size={size} />
                  <Checkbox
                    error
                    errorText="선택을 확인하세요."
                    label={`${size} Error unchecked`}
                    size={size}
                  />
                  <Checkbox
                    defaultChecked
                    error
                    errorText="선택을 확인하세요."
                    label={`${size} Error checked`}
                    size={size}
                  />
                  <Checkbox
                    defaultChecked
                    error
                    errorText="선택을 확인하세요."
                    indeterminate
                    label={`${size} Error indeterminate`}
                    size={size}
                  />
                  <Checkbox defaultChecked disabled label={`${size} Disabled checked`} size={size} />
                  <Checkbox
                    defaultChecked
                    disabled
                    error
                    label={`${size} Disabled error checked`}
                    size={size}
                  />
                </div>
              </SampleGroup>
            ))}

            {radioSizes.map((size) => (
              <SampleGroup key={size} title={`Radio — ${size}`}>
                <div className={styles.radioMatrix}>
                  <RadioGroup
                    defaultValue={size === 'large' ? undefined : 'selected'}
                    label={`${size} enabled group`}
                    name={`gallery-radio-${size}-enabled`}
                    onValueChange={size === 'large' ? setRadioValue : undefined}
                    orientation="horizontal"
                    supportingText="방향키로 한 항목만 선택합니다."
                    value={size === 'large' ? radioValue : undefined}
                  >
                    <Radio label={`${size} Unselected`} size={size} value="unselected" />
                    <Radio label={`${size} Selected`} size={size} value="selected" />
                  </RadioGroup>
                  <RadioGroup
                    defaultValue="selected"
                    disabled
                    label={`${size} disabled group`}
                    name={`gallery-radio-${size}-disabled`}
                    orientation="horizontal"
                  >
                    <Radio label={`${size} Disabled unselected`} size={size} value="unselected" />
                    <Radio label={`${size} Disabled selected`} size={size} value="selected" />
                  </RadioGroup>
                </div>
              </SampleGroup>
            ))}
          </GallerySection>

          <GallerySection
            description="Figma Assistive level, 세 크기와 Filter·Input·Location type"
            id="chips"
            index="05"
            title="Chips"
          >
            {chipSizes.map((size) => (
              <SampleGroup key={size} title={`Assistive · ${size}`}>
                <ChipSet label={`${size} Assistive level 전체`}>
                  {assistiveLevels.map((level) => (
                    <Chip key={level} level={level} size={size}>{level}</Chip>
                  ))}
                </ChipSet>
              </SampleGroup>
            ))}

            <SampleGroup title="Filter · state × size">
              {chipSizes.map((size) => (
                <div className={styles.variantRow} key={size}>
                  <span className={styles.variantLabel}>{size}</span>
                  <ChipSet label={`${size} Filter states`}>
                    <Chip
                      chipType="filter"
                      onSelectedChange={size === 'large' ? setFilterSelected : undefined}
                      selected={size === 'large' ? filterSelected : undefined}
                      size={size}
                    >
                      Label
                    </Chip>
                    <Chip chipType="filter" selected size={size}>Label</Chip>
                  </ChipSet>
                </div>
              ))}
            </SampleGroup>

            <SampleGroup title="Input · state × size">
              {chipSizes.map((size) => (
                <div className={styles.variantRow} key={size}>
                  <span className={styles.variantLabel}>{size}</span>
                  <ChipSet label={`${size} Input states`}>
                    {size !== 'large' || inputChipVisible ? (
                      <Chip
                        chipType="input"
                        onRemove={size === 'large' ? () => setInputChipVisible(false) : undefined}
                        removeLabel={size === 'large' ? 'Gallery Input chip 삭제' : undefined}
                        removeOnly
                        size={size}
                      >
                        Label
                      </Chip>
                    ) : null}
                    <Chip chipType="input" removeOnly selected size={size}>Label</Chip>
                  </ChipSet>
                </div>
              ))}
              {!inputChipVisible ? (
                <Button onClick={() => setInputChipVisible(true)} variant="text">Input Chip 다시 표시</Button>
              ) : null}
            </SampleGroup>

            <SampleGroup title="Location · project-specific display">
              <div className={styles.variantRow}>
                <span className={styles.variantLabel}>small</span>
                <Chip chipType="location" prefix="X">6.058m</Chip>
              </div>
            </SampleGroup>

            <SampleGroup title="Disabled">
              <ChipSet label="비활성 Chip 상태">
                <Chip chipType="filter" disabled>Filter</Chip>
                <Chip chipType="input" disabled removeOnly>Input</Chip>
              </ChipSet>
            </SampleGroup>
          </GallerySection>

          <GallerySection
            description="Portal 기반 modal focus, dismiss와 trigger focus return lifecycle"
            id="dialogs"
            index="06"
            legacyId="overlays"
            title="Dialogs"
          >
            <SampleGroup title="Dialog variants">
              <div className={styles.row}>
                <Dialog
                  actions={<><DialogClose variant="text">취소</DialogClose><DialogClose>확인</DialogClose></>}
                  description="Escape, backdrop와 action을 통해 닫고 trigger로 focus가 복원되는지 확인합니다."
                  title="기본 Dialog"
                  trigger="기본 Dialog 열기"
                >
                  <p className={styles.dialogCopy}>Dialog content는 현재 Theme의 surface와 typography token을 사용합니다.</p>
                </Dialog>
                <Dialog
                  actions={<DialogClose>확인</DialogClose>}
                  description="중요한 결정을 사용자에게 확인받는 alertdialog입니다."
                  dismissible={false}
                  title="Alert Dialog"
                  trigger="Alert Dialog 열기"
                  variant="alert"
                />
              </div>
            </SampleGroup>
          </GallerySection>

          <GallerySection
            description="Portal 기반 menu item type, submenu와 keyboard selection lifecycle"
            id="menus"
            index="07"
            title="Menus"
          >
            <SampleGroup title="Menu item types">
              <Menu
                items={[
                  { type: 'item', id: 'new', label: '새 프로젝트', leadingIcon: <MaterialIcon name="add" />, onSelect: () => snackbar.show({ message: '새 프로젝트 메뉴를 선택했습니다.' }) },
                  { type: 'checkbox', id: 'visible', label: '미리보기 표시', checked: menuChecked, onCheckedChange: setMenuChecked },
                  { type: 'radio', id: 'comfortable', label: '보통 밀도', value: 'comfortable' },
                  { type: 'radio', id: 'compact', label: '조밀한 밀도', value: 'compact' },
                  { type: 'submenu', id: 'more', label: '더보기', items: [
                    { type: 'item', id: 'docs', label: '문서', onSelect: () => snackbar.show({ message: '문서 메뉴를 선택했습니다.' }) },
                    { type: 'item', id: 'disabled', label: '비활성 항목', disabled: true, onSelect: () => undefined },
                  ] },
                ]}
                label="검증용 Menu"
                onRadioValueChange={setMenuDensity}
                radioValue={menuDensity}
                trigger="Menu 열기"
              />
            </SampleGroup>
          </GallerySection>

          <GallerySection
            description="message type, action, dismiss와 multi-line anatomy"
            id="feedback"
            index="08"
            title="Feedback"
          >
            <SampleGroup title="Snackbar types">
              <div className={styles.row}>
                <Button onClick={() => snackbar.show({ dismissLabel: 'Message Snackbar 닫기', message: '기본 메시지를 표시했습니다.' })}>Message</Button>
                <Button onClick={() => snackbar.show({ dismissLabel: 'Success Snackbar 닫기', message: '변경 사항을 저장했습니다.', type: 'success' })} variant="tonal">Success</Button>
                <Button onClick={() => snackbar.show({ dismissLabel: 'Error Snackbar 닫기', message: '요청을 완료하지 못했습니다.', type: 'error' })} variant="outlined">Error</Button>
                <Button onClick={showLoadingSnackbar} variant="text">Loading</Button>
                <Button
                  onClick={() => snackbar.show({
                    action: { label: '실행 취소', onAction: () => undefined },
                    dismissLabel: '두 줄 Snackbar 닫기',
                    message: '긴 설명은 두 줄 container로 확장되며 action과 닫기 control을 함께 유지합니다.',
                  })}
                  variant="text"
                >
                  Multi-line
                </Button>
              </div>
            </SampleGroup>
          </GallerySection>
        </div>
      </div>
    </main>
  );
}

interface GallerySectionProps {
  children: React.ReactNode;
  description: string;
  id: string;
  index: string;
  legacyId?: string;
  title: string;
}

function GallerySection({ children, description, id, index, legacyId, title }: GallerySectionProps) {
  return (
    <section className={styles.gallerySection} id={id} aria-labelledby={`${id}-title`}>
      {legacyId ? <span aria-hidden="true" className={styles.anchorAlias} id={legacyId} /> : null}
      <div className={styles.sectionHeading}>
        <span>{index}</span>
        <div>
          <h2 id={`${id}-title`}>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

function SampleGroup({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className={styles.sampleGroup}>
      <h3>{title}</h3>
      <div className={styles.sampleSurface}>{children}</div>
    </div>
  );
}
