import { useState, type CSSProperties, type FormEvent } from 'react';
import {
  Button,
  Checkbox,
  DEFAULT_THEME_CONFIG,
  Dialog,
  DialogPrimitive,
  IconButton,
  isValidSeedColor,
  MaterialIcon,
  Menu,
  Select,
  TextField,
  THEME_PRESETS,
  useSnackbar,
  useTheme,
  type ThemeConfig,
  type ThemeMode,
} from '@/ui';
import styles from './App.module.css';

const modeOptions: Array<{ label: string; value: ThemeMode; icon: string }> = [
  { label: '라이트', value: 'light', icon: 'light_mode' },
  { label: '다크', value: 'dark', icon: 'dark_mode' },
  { label: '시스템', value: 'system', icon: 'brightness_auto' },
];

export default function App() {
  const theme = useTheme();
  const snackbar = useSnackbar();
  const [draft, setDraft] = useState<ThemeConfig>(theme.config);
  const [seedInput, setSeedInput] = useState<string>(theme.config.seedColor);
  const [projectName, setProjectName] = useState('새 디자인 시스템');
  const [platform, setPlatform] = useState<'web' | 'desktop' | 'mobile'>('web');
  const [notifications, setNotifications] = useState(true);
  const [compactPreview, setCompactPreview] = useState(false);
  const [density, setDensity] = useState('comfortable');

  const preview = (next: ThemeConfig) => {
    setDraft(next);
    theme.previewTheme(next);
  };

  const choosePreset = (preset: (typeof THEME_PRESETS)[number]) => {
    setSeedInput(preset.seedColor);
    preview({ ...draft, themeId: preset.id, seedColor: preset.seedColor });
  };

  const previewSeed = () => {
    if (isValidSeedColor(seedInput)) {
      preview({
        ...draft,
        themeId: 'custom',
        seedColor: seedInput.toUpperCase() as `#${string}`,
      });
    }
  };

  const applyDraft = () => {
    if (!isValidSeedColor(seedInput)) return;
    const next = {
      ...draft,
      seedColor: seedInput.toUpperCase() as `#${string}`,
    };
    setDraft(next);
    theme.applyTheme(next);
    snackbar.show({
      dismissLabel: '테마 적용 알림 닫기',
      message: '테마가 이 브라우저에 저장되었습니다.',
      type: 'success',
    });
  };

  const cancelDraft = () => {
    setDraft(theme.appliedConfig);
    setSeedInput(theme.appliedConfig.seedColor);
    theme.cancelPreview();
  };

  const reset = () => {
    setDraft(DEFAULT_THEME_CONFIG);
    setSeedInput(DEFAULT_THEME_CONFIG.seedColor);
    theme.resetTheme();
  };

  const submitProject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    snackbar.show({
      action: { label: '실행 취소', onAction: () => undefined },
      dismissLabel: '프로젝트 생성 알림 닫기',
      message: `${projectName} 구성을 저장했습니다.`,
      type: 'message',
    });
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <a className={styles.brand} href="#top" aria-label="SPP UI Theme Lab 홈">
          <span className={styles.brandMark}><MaterialIcon name="deployed_code" /></span>
          <span>SPP UI</span>
        </a>
        <div className={styles.topActions}>
          <span className={styles.runtimeStatus}>
            <span className={styles.statusDot} />
            {theme.resolvedMode === 'dark' ? 'Dark' : 'Light'} · {draft.contrast === 'high' ? 'High contrast' : 'Standard'}
          </span>
          <Menu
            label="Theme Lab 메뉴"
            radioValue={density}
            onRadioValueChange={setDensity}
            trigger="옵션"
            items={[
              { type: 'checkbox', id: 'compact', label: '컴팩트 미리보기', checked: compactPreview, onCheckedChange: setCompactPreview },
              { type: 'radio', id: 'comfortable', label: '보통 밀도', value: 'comfortable' },
              { type: 'radio', id: 'compact-density', label: '조밀한 밀도', value: 'compact' },
              {
                type: 'submenu', id: 'help', label: '도움말', items: [
                  { type: 'item', id: 'tokens', label: '토큰 가이드', onSelect: () => snackbar.show({ message: '토큰 가이드는 docs/02-architecture에 있습니다.' }) },
                  { type: 'item', id: 'keyboard', label: '키보드 안내', onSelect: () => snackbar.show({ message: 'Tab, 방향키, Escape 흐름을 지원합니다.' }) },
                ],
              },
            ]}
          />
        </div>
      </header>

      <div className={styles.layout} id="top">
        <aside className={styles.settings} aria-labelledby="theme-settings-title">
          <div className={styles.settingsHeading}>
            <div>
              <span className={styles.eyebrow}>Theme runtime</span>
              <h1 id="theme-settings-title">테마 설정</h1>
            </div>
            <IconButton aria-label="테마 기본값 복원" icon={<MaterialIcon name="restart_alt" />} onClick={reset} />
          </div>

          <section className={styles.controlSection} aria-labelledby="preset-title">
            <h2 id="preset-title">색상 프리셋</h2>
            <div className={styles.swatches}>
              {THEME_PRESETS.map((preset) => (
                <button
                  aria-pressed={draft.themeId === preset.id}
                  className={styles.swatch}
                  key={preset.id}
                  onClick={() => choosePreset(preset)}
                  style={{ '--swatch-color': preset.seedColor } as CSSProperties}
                  type="button"
                >
                  <span className={styles.swatchColor} />
                  <span>{preset.label.replace('Material ', '')}</span>
                  {draft.themeId === preset.id ? <MaterialIcon name="check_circle" /> : null}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.controlSection} aria-labelledby="custom-color-title">
            <h2 id="custom-color-title">커스텀 시드</h2>
            <div className={styles.colorControl}>
              <label
                className={styles.colorPicker}
                style={{
                  '--seed-picker-color': isValidSeedColor(seedInput) ? seedInput : draft.seedColor,
                } as CSSProperties}
              >
                <span aria-hidden="true" className={styles.colorPreview} />
                <input
                  aria-label="시드 색상 선택"
                  onChange={(event) => {
                    const value = event.target.value.toUpperCase();
                    setSeedInput(value);
                    preview({ ...draft, themeId: 'custom', seedColor: value as `#${string}` });
                  }}
                  type="color"
                  value={isValidSeedColor(seedInput) ? seedInput : '#6750A4'}
                />
              </label>
              <TextField
                aria-label="16진수 시드 색상"
                error={Boolean(seedInput && !isValidSeedColor(seedInput))}
                errorText="#RRGGBB 형식으로 입력하세요."
                label="HEX"
                onBlur={previewSeed}
                onChange={(event) => setSeedInput(event.target.value)}
                value={seedInput}
              />
            </div>
          </section>

          <section className={styles.controlSection} aria-labelledby="mode-title">
            <h2 id="mode-title">화면 모드</h2>
            <div className={styles.segmented}>
              {modeOptions.map((option) => (
                <button
                  aria-pressed={draft.mode === option.value}
                  key={option.value}
                  onClick={() => preview({ ...draft, mode: option.value })}
                  type="button"
                >
                  <MaterialIcon name={option.icon} />
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          <Checkbox
            checked={draft.contrast === 'high'}
            label="고대비 색상"
            onCheckedChange={(checked) => preview({ ...draft, contrast: checked ? 'high' : 'standard' })}
            supportingText="동일한 시드에서 더 강한 역할 대비를 생성합니다."
          />

          <div className={styles.settingsActions}>
            <Button onClick={cancelDraft} variant="text">취소</Button>
            <Button leadingIcon={<MaterialIcon name="check" />} onClick={applyDraft}>테마 적용</Button>
          </div>
        </aside>

        <section className={styles.workspace} aria-labelledby="playground-title" data-compact={compactPreview || density === 'compact'}>
          <div className={styles.hero}>
            <div>
              <span className={styles.eyebrow}>Component playground</span>
              <h2 id="playground-title">제품 흐름에서 확인하는 Material 3</h2>
              <p>테마를 미리 보면서 실제 폼, 메뉴, 대화상자와 피드백 동작을 함께 검증합니다.</p>
            </div>
            <span className={styles.seedBadge}>{draft.seedColor}</span>
          </div>

          <div className={styles.previewGrid}>
            <form className={styles.formCard} onSubmit={submitProject}>
              <CardHeading icon="dashboard_customize" title="프로젝트 만들기" subtitle="대표 제품 설정 흐름" />
              <TextField
                label="프로젝트 이름"
                leadingIcon={<MaterialIcon name="folder" />}
                onChange={(event) => setProjectName(event.target.value)}
                required
                supportingText="나중에 언제든 변경할 수 있습니다."
                value={projectName}
              />
              <Select
                label="대상 플랫폼"
                onValueChange={setPlatform}
                options={[
                  { value: 'web', label: 'Web application' },
                  { value: 'desktop', label: 'Desktop application' },
                  { value: 'mobile', label: 'Mobile application' },
                ]}
                value={platform}
              />
              <Checkbox checked={notifications} label="변경 알림 받기" onCheckedChange={setNotifications} supportingText="중요한 토큰 변경만 알려드립니다." />
              <div className={styles.formActions}>
                <Dialog
                  actions={
                    <>
                      <DialogPrimitive.Close render={<Button variant="text" />}>계속 편집</DialogPrimitive.Close>
                      <DialogPrimitive.Close render={<Button />}>확인</DialogPrimitive.Close>
                    </>
                  }
                  description="현재 입력한 프로젝트 구성을 검토했습니다. 확인하면 로컬 작업 공간에 저장합니다."
                  title="프로젝트 구성을 저장할까요?"
                  trigger="구성 검토"
                >
                  <dl className={styles.summaryList}>
                    <div><dt>이름</dt><dd>{projectName}</dd></div>
                    <div><dt>플랫폼</dt><dd>{platform}</dd></div>
                    <div><dt>테마</dt><dd>{draft.themeId}</dd></div>
                  </dl>
                </Dialog>
                <Button trailingIcon={<MaterialIcon name="arrow_forward" />} type="submit">프로젝트 생성</Button>
              </div>
            </form>

            <section className={styles.componentCard} aria-labelledby="button-samples-title">
              <CardHeading icon="touch_app" title="Actions" subtitle="상태 레이어와 ripple" titleId="button-samples-title" />
              <div className={styles.buttonSamples}>
                <Button>Filled</Button><Button variant="tonal">Tonal</Button><Button variant="elevated">Elevated</Button><Button variant="outlined">Outlined</Button><Button variant="text">Text</Button>
              </div>
              <div className={styles.iconSamples}>
                <IconButton aria-label="즐겨찾기" icon={<MaterialIcon name="favorite_border" />} selectedIcon={<MaterialIcon name="favorite" />} selected variant="filled" />
                <IconButton aria-label="공유" icon={<MaterialIcon name="share" />} variant="tonal" />
                <IconButton aria-label="더보기" icon={<MaterialIcon name="more_vert" />} variant="outlined" />
              </div>
            </section>

            <section className={styles.paletteCard} aria-labelledby="palette-title">
              <CardHeading icon="palette" title="Color roles" subtitle="생성된 system token" titleId="palette-title" />
              <div className={styles.roleGrid}>
                <div className={styles.primaryRole}><strong>Primary</strong><span>On primary</span></div>
                <div className={styles.secondaryRole}><strong>Secondary</strong><span>Container</span></div>
                <div className={styles.tertiaryRole}><strong>Tertiary</strong><span>Container</span></div>
                <div className={styles.surfaceRole}><strong>Surface</strong><span>Container high</span></div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function CardHeading({ icon, subtitle, title, titleId }: { icon: string; subtitle: string; title: string; titleId?: string }) {
  return (
    <div className={styles.cardHeading}>
      <span className={styles.cardIcon}><MaterialIcon name={icon} /></span>
      <div><h3 id={titleId}>{title}</h3><p>{subtitle}</p></div>
    </div>
  );
}
