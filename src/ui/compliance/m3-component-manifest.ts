import { SPEC_BASELINE } from './spec-baseline';

export const M3_CHECKED_AREAS = [
  'anatomy',
  'usage',
  'api-semantics',
  'color',
  'typography',
  'shape',
  'size',
  'elevation',
  'state',
  'ripple',
  'focus',
  'motion',
  'accessibility',
] as const;

export type M3CheckedArea = (typeof M3_CHECKED_AREAS)[number];

export interface M3ComponentManifestEntry {
  component: string;
  m3WebUrl: string;
  m3ComponentUrls: readonly string[];
  materialWebMainDocs: readonly string[];
  materialWebSnapshotDocs: readonly string[];
  materialWebReferenceStatus: 'available' | 'unavailable' | 'not-applicable';
  verifiedAt: string;
  checkedAreas: readonly M3CheckedArea[];
  deviations: readonly string[];
  implementationStatus: 'not-started' | 'implemented';
  status: 'BLOCKED' | 'PASS';
  blockers: readonly string[];
}

const M3_WEB_URL = 'https://m3.material.io/develop/web';
// Motion-only evidence does not supersede each component's complete compliance verdict.
export const M3_MICRO_MOTION_AUDIT = {
  verifiedAt: '2026-09-07',
  materialWebCommit: 'c05b4b23485c803f68ff31cde52506cea5cc555a',
  report: 'docs/audits/2026-09-07-micro-motion/README.md',
  noStableWholeComponentCounterpart: ['AutoComplete', 'SegmentedButton', 'Snackbar'],
} as const;
const VERIFIED_AT = '2026-08-26';
const BUTTON_VERIFIED_AT = '2026-09-02';
const CHECKBOX_VERIFIED_AT = '2026-09-02';
const CHIP_VERIFIED_AT = '2026-09-02';
const ICON_BUTTON_VERIFIED_AT = '2026-09-03';
const RADIO_VERIFIED_AT = '2026-09-03';
const TABS_VERIFIED_AT = '2026-09-03';
const SWITCH_VERIFIED_AT = '2026-09-03';
const SEGMENTED_BUTTON_VERIFIED_AT = '2026-09-03';
const FORCED_COLORS_BLOCKER =
  'Windows Contrast Themes remain in support scope; actual forced-colors rendering is pending.';
const SCREEN_READER_BLOCKER =
  'Actual screen-reader verification is pending for state, focus, description, or live-region announcements that DOM and axe checks cannot confirm.';
const COMPOSITE_ACCESSIBILITY_BLOCKERS = [
  SCREEN_READER_BLOCKER,
  FORCED_COLORS_BLOCKER,
] as const;

const DROPDOWN_FEEDBACK_DEVIATION =
  '2026-09-07 user-requested dropdown feedback: Figma listItem 10742:16969 and drawMenu 10742:17727 supply surface-container-lowest and a single black 6% hover/selected wash in Light Standard. Dark/High use neutral on-surface state layers. Keyboard focus retains a static neutral 3px inward ring instead of Material Web default secondary-color grow/shrink. Pointer highlighting does not imply focus-visible. Geometry, menu motion and selection semantics are unchanged; see docs/audits/2026-09-07-dropdown-feedback/README.md.';

function materialWebDocs(docPath: string) {
  return {
    materialWebMainDocs: [materialWebMainUrl(docPath)],
    materialWebSnapshotDocs: [materialWebSnapshotUrl(docPath)],
  } as const;
}

export const M3_COMPONENT_MANIFEST = [
  {
    component: 'Button',
    m3WebUrl: M3_WEB_URL,
    m3ComponentUrls: ['https://m3.material.io/components/buttons/overview'],
    ...materialWebDocs('components/button.md'),
    materialWebReferenceStatus: 'available',
    verifiedAt: BUTTON_VERIFIED_AT,
    checkedAreas: M3_CHECKED_AREAS,
    deviations: [
      'Figma node 10429:72459 adds project-specific medium/small density and error color axes; native button semantics, focus, ripple, and form behavior remain Stable Material Web aligned.',
      'Figma hover/focus remain black 6%/12%. Per the 2026-09-07 user decision, Light Standard pressed black 16% is applied once in Ripple, not an extra whole-button wash; Dark/High use foreground 10%. Project-specific Outlined and disabled color composition remain. See docs/audits/2026-09-07-button-ripple/README.md.',
      'The project adapter defaults type to button to prevent accidental form submission; consumers opt into submit or reset explicitly, while Material Web documents submit as its default.',
    ],
    implementationStatus: 'implemented',
    status: 'BLOCKED',
    blockers: [
      FORCED_COLORS_BLOCKER,
      'M3_WEB_SPEC_CONFLICT: 2026-09-07 gallery audit found Normal Light/Standard error-label contrast below 4.5:1 in Figma-bound Button colors; see docs/audits/2026-09-07-component-gallery/README.md.',
    ],
  },
  {
    component: 'IconButton',
    m3WebUrl: M3_WEB_URL,
    m3ComponentUrls: [
      'https://m3.material.io/components/icon-buttons/overview',
    ],
    ...materialWebDocs('components/icon-button.md'),
    materialWebReferenceStatus: 'available',
    verifiedAt: ICON_BUTTON_VERIFIED_AT,
    checkedAreas: M3_CHECKED_AREAS,
    deviations: [
      'Figma node 10724:16368 adds project-specific medium/small density and error style axes; native button semantics, accessible name, toggle aria-pressed, focus, ripple, and the 48px touch target remain Stable Material Web aligned.',
      'Figma hover/focus black 6%/12% and surface-container disabled composition remain. Per the 2026-09-07 user decision, pressed uses Material Web foreground 10% pointer-origin Ripple without an additional pressed wash. Geometry and keyboard-centered activation are unchanged; see docs/audits/2026-09-07-button-ripple/README.md.',
      'The Figma guide labels the 40/32/24px examples large/small/x-small while the executable component properties are large/medium/small; the public API follows the executable component property names.',
    ],
    implementationStatus: 'implemented',
    status: 'BLOCKED',
    blockers: [FORCED_COLORS_BLOCKER],
  },
  {
    component: 'TextField',
    m3WebUrl: M3_WEB_URL,
    m3ComponentUrls: [
      'https://m3.material.io/components/text-fields/overview',
    ],
    ...materialWebDocs('components/text-field.md'),
    materialWebReferenceStatus: 'available',
    verifiedAt: '2026-09-07',
    checkedAreas: M3_CHECKED_AREAS,
    deviations: [
      'Figma 10724:14659 defines 56 outlined variants: large 48px/small 32px, text/number, seven states and populated/empty. Per-size typography, 3px/2px focus, error colors and disabled opacity are project visual overrides. The latest user decision removes Filled entirely and replaces pinned labels with focus/value-driven 150ms floating labels. Material Web motion preserves the interrupted pose and uses 67ms delay + 83ms emphasized content fade; empty unfocused affixes remain hidden. The playground provides populated samples and explicit empty/sample controls.',
      'Small supporting text is kept in document flow at its source 1px offset instead of overflowing Figma root bounds. Coarse-pointer controls and actions expand to real disjoint 48px targets. Keyboard focus also exposes the hover-only clear action.',
      'TextField type=textarea renders a native textarea. Native form constraints, readonly submission, disabled exclusion, clear onChange/focus return and named trailing actions preserve Web behavior.',
      'Firefox native small input uses a 17px font-normal minimum line-height while retaining the Figma 16px author token and 32px outer geometry; HTML native text-entry rendering takes precedence over forcing clipped glyph metrics.',
    ],
    implementationStatus: 'implemented',
    status: 'BLOCKED',
    blockers: [
      ...COMPOSITE_ACCESSIBILITY_BLOCKERS,
      'M3_WEB_SPEC_CONFLICT: Figma-bound placeholder and affix colors fall below 4.5:1 in supported themes. The 2026-09-07 TextField audit records actual values; source color correction requires a token decision. Axe also leaves complex-background contrast checks incomplete.',
    ],
  },
  {
    component: 'AutoComplete',
    m3WebUrl: M3_WEB_URL,
    m3ComponentUrls: ['https://m3.material.io/components/text-fields/overview', 'https://m3.material.io/components/menus/overview'],
    materialWebMainDocs: [],
    materialWebSnapshotDocs: [],
    materialWebReferenceStatus: 'unavailable',
    verifiedAt: '2026-09-07',
    checkedAreas: M3_CHECKED_AREAS,
    deviations: ['Project composite, not a dedicated Stable Material Web component or a separately verified Figma variant set. Reuses outlined field geometry and dropdown tokens, with Base UI free-text autocomplete and APG virtual focus semantics. Upward menus reserve half the measured label height to avoid occlusion; downward menus keep zero offset.', DROPDOWN_FEEDBACK_DEVIATION],
    implementationStatus: 'implemented',
    status: 'BLOCKED',
    blockers: [...COMPOSITE_ACCESSIBILITY_BLOCKERS, 'M3_WEB_SPEC_CONFLICT: inherited Figma placeholder and affix contrast requires the TextField token decision.'],
  },
  {
    component: 'Checkbox',
    m3WebUrl: M3_WEB_URL,
    m3ComponentUrls: ['https://m3.material.io/components/checkbox/overview'],
    ...materialWebDocs('components/checkbox.md'),
    materialWebReferenceStatus: 'available',
    verifiedAt: CHECKBOX_VERIFIED_AT,
    checkedAreas: M3_CHECKED_AREAS,
    deviations: [
      'Figma node 10466:23091 adds large/medium/small visual sizing and an explicit error presentation. Native checkbox semantics, form behavior, focus, ripple, indeterminate state, and the 48px touch target remain Stable Material Web aligned.',
      'Stable Material Web does not expose error as a current public Checkbox API; this project maps the Figma error variants to aria-invalid on the accessible checkbox control and error/supporting text without redefining checked or indeterminate semantics.',
    ],
    implementationStatus: 'implemented',
    status: 'BLOCKED',
    blockers: COMPOSITE_ACCESSIBILITY_BLOCKERS,
  },
  {
    component: 'Radio',
    m3WebUrl: M3_WEB_URL,
    m3ComponentUrls: ['https://m3.material.io/components/radio-button/overview'],
    ...materialWebDocs('components/radio.md'),
    materialWebReferenceStatus: 'available',
    verifiedAt: RADIO_VERIFIED_AT,
    checkedAreas: M3_CHECKED_AREAS,
    deviations: [
      'Figma node 10724:12073 adds large/medium/small visual density with 36/32/24px state layers and 24/20/16px icons; the native form radio projection, named radiogroup, single selection, keyboard behavior, focus, ripple, and 48px touch target remain Stable Material Web aligned.',
      'The Figma guide labels the 36/32/24px examples large/small/x-small while the executable component properties are large/medium/small; the public API follows the executable component property names.',
      'Figma keeps selected and unselected icon colors stable across interaction, uses black 6%/12%/12% hover/focus/pressed layers, and composes disabled icons from on-surface-variant at 38%; Stable Material Web uses semantic foreground state-layer colors, a 40px state layer, and on-surface at 38% for disabled icons.',
    ],
    implementationStatus: 'implemented',
    status: 'BLOCKED',
    blockers: COMPOSITE_ACCESSIBILITY_BLOCKERS,
  },
  {
    component: 'Tabs',
    m3WebUrl: M3_WEB_URL,
    m3ComponentUrls: ['https://m3.material.io/components/tabs/overview'],
    ...materialWebDocs('components/tabs.md'),
    materialWebReferenceStatus: 'available',
    verifiedAt: TABS_VERIFIED_AT,
    checkedAreas: M3_CHECKED_AREAS,
    deviations: [
      'Figma node 10724:12784 defines a project-specific 40px Primary Tab, 16px horizontal padding, label/large-prominent typography, surface-container-lowest background, and full-width 3px indicator; Stable Material Web defaults to its Primary Tab token anatomy while role, focus, selection, ripple, and panel semantics remain aligned.',
      'The Figma guide captions enabled/hovered/focused/pressed/disabled do not match the executable State property enabled/hovered/selected/selected_hovered/disabled. Selection is controlled by the Tabs value and transient interaction states are produced only by real pointer and keyboard input.',
      'The executable Figma Tab exposes an optional trailing close glyph and a disabled state, while Stable Material Web does not define either a trailing close action or disabled Primary Tab API. The glyph is decorative; aria-disabled Tabs stay discoverable in composite focus but cannot activate or ripple.',
    ],
    implementationStatus: 'implemented',
    status: 'BLOCKED',
    blockers: COMPOSITE_ACCESSIBILITY_BLOCKERS,
  },
  {
    component: 'Switch',
    m3WebUrl: M3_WEB_URL,
    m3ComponentUrls: ['https://m3.material.io/components/switch/overview'],
    ...materialWebDocs('components/switch.md'),
    materialWebReferenceStatus: 'available',
    verifiedAt: SWITCH_VERIFIED_AT,
    checkedAreas: M3_CHECKED_AREAS,
    deviations: [
      'Product scope intentionally removes Figma large and medium Switch variants. The public component is fixed to the 32x18 small anatomy while retaining a 48px minimum touch target, role=switch, form projection, Enter/Space activation, focus, and ripple.',
      'Figma fixes Icon=true and shows check and close glyphs. Stable Material Web makes both icons optional and also offers selected-only icons; the project component follows the retained Figma small invariant rather than exposing an icon axis.',
      'Figma uses black 6%/12%/12% hover/focus/pressed layers, project outline-high, and state-specific handle colors instead of the complete Stable Material Web semantic state-layer token composition.',
    ],
    implementationStatus: 'implemented',
    status: 'BLOCKED',
    blockers: [FORCED_COLORS_BLOCKER],
  },
  {
    component: 'SegmentedButton',
    m3WebUrl: M3_WEB_URL,
    m3ComponentUrls: ['https://m3.material.io/components/segmented-buttons/overview'],
    materialWebMainDocs: [],
    materialWebSnapshotDocs: [],
    materialWebReferenceStatus: 'unavailable',
    verifiedAt: SEGMENTED_BUTTON_VERIFIED_AT,
    checkedAreas: M3_CHECKED_AREAS,
    deviations: [
      'Figma node 10724:13951 defines the project density at 32px high with 12px horizontal space, 8px content gap, 18px icons, a 48px outer radius, outline-high borders, custom-container selection, and black 6%/12%/16% transient state layers.',
      'Figma provides custom-container as a static Light-only extended role. Generated Dark, High, and custom schemes pair that container with the generated secondary-container/on-secondary-container roles so selected content keeps semantic contrast without changing the Figma Standard/Light value.',
      'Stable Material Web has no published component documentation for segmented buttons. On 2026-09-07 the user explicitly required Labs behavior: React ports c05b4b2 nextAnimationState, leading/graphic anatomy, SVG stroke draw-in and selecting/deselecting keyframes, preserving native group/pressed/single/multiple semantics and Figma geometry/color. The earlier font clipping approximation is superseded. Custom selectedIcon uses fade; hideSelectedIcon and disabled/reduced-motion remain documented project exceptions. No Labs/Lit runtime is imported; no Stable whole-component equivalence is claimed.',
      'Figma publishes a five-segment composition and omits disabled-selected variants. The public adapter supports any application-defined segment count and preserves an already-selected disabled value so controlled application state is not misrepresented.',
    ],
    implementationStatus: 'implemented',
    status: 'BLOCKED',
    blockers: COMPOSITE_ACCESSIBILITY_BLOCKERS,
  },
  {
    component: 'Chip',
    m3WebUrl: M3_WEB_URL,
    m3ComponentUrls: ['https://m3.material.io/components/chips/overview'],
    ...materialWebDocs('components/chip.md'),
    materialWebReferenceStatus: 'available',
    verifiedAt: CHIP_VERIFIED_AT,
    checkedAreas: M3_CHECKED_AREAS,
    deviations: [
      'Figma names Assist as Assistive and adds a project-specific non-interactive Location display; Location is not presented as an M3 action or included in toolbar focus.',
    ],
    implementationStatus: 'implemented',
    status: 'BLOCKED',
    blockers: [
      ...COMPOSITE_ACCESSIBILITY_BLOCKERS,
      'M3_WEB_SPEC_CONFLICT: 2026-09-07 gallery audit found Assistive status-label contrast below 4.5:1, including High contrast, and x-small selected Filter contrast failure in High; see docs/audits/2026-09-07-component-gallery/README.md.',
    ],
  },
  {
    component: 'Select',
    m3WebUrl: M3_WEB_URL,
    m3ComponentUrls: [
      'https://m3.material.io/components/text-fields/overview',
      'https://m3.material.io/components/menus/overview',
    ],
    ...materialWebDocs('components/select.md'),
    materialWebReferenceStatus: 'available',
    verifiedAt: VERIFIED_AT,
    checkedAreas: M3_CHECKED_AREAS,
    deviations: [DROPDOWN_FEEDBACK_DEVIATION],
    implementationStatus: 'implemented',
    status: 'BLOCKED',
    blockers: COMPOSITE_ACCESSIBILITY_BLOCKERS,
  },
  {
    component: 'Dialog',
    m3WebUrl: M3_WEB_URL,
    m3ComponentUrls: ['https://m3.material.io/components/dialogs/overview'],
    ...materialWebDocs('components/dialog.md'),
    materialWebReferenceStatus: 'available',
    verifiedAt: VERIFIED_AT,
    checkedAreas: M3_CHECKED_AREAS,
    deviations: [],
    implementationStatus: 'implemented',
    status: 'BLOCKED',
    blockers: COMPOSITE_ACCESSIBILITY_BLOCKERS,
  },
  {
    component: 'Menu',
    m3WebUrl: M3_WEB_URL,
    m3ComponentUrls: ['https://m3.material.io/components/menus/overview'],
    ...materialWebDocs('components/menu.md'),
    materialWebReferenceStatus: 'available',
    verifiedAt: VERIFIED_AT,
    checkedAreas: M3_CHECKED_AREAS,
    deviations: [DROPDOWN_FEEDBACK_DEVIATION],
    implementationStatus: 'implemented',
    status: 'BLOCKED',
    blockers: COMPOSITE_ACCESSIBILITY_BLOCKERS,
  },
  {
    component: 'Snackbar',
    m3WebUrl: M3_WEB_URL,
    m3ComponentUrls: [
      'https://m3.material.io/components/snackbar/overview',
      'https://m3.material.io/components/snackbar/guidelines',
    ],
    materialWebMainDocs: [],
    materialWebSnapshotDocs: [],
    materialWebReferenceStatus: 'unavailable',
    verifiedAt: VERIFIED_AT,
    checkedAreas: M3_CHECKED_AREAS,
    deviations: [],
    implementationStatus: 'implemented',
    status: 'BLOCKED',
    blockers: [
      ...COMPOSITE_ACCESSIBILITY_BLOCKERS,
      'M3_WEB_SPEC_CONFLICT: 2026-09-07 actual gallery flow displays three snackbars simultaneously and auto-dismisses an actionable snackbar after five seconds; MD3 requires one-at-a-time display and persistence until action/dismiss. See docs/audits/2026-09-07-component-gallery/README.md.',
    ],
  },
] as const satisfies readonly M3ComponentManifestEntry[];

export function materialWebMainUrl(docPath: string): string {
  return `${SPEC_BASELINE.materialWeb.docsMain.replace('/tree/', '/blob/')}/${docPath}`;
}

export function materialWebSnapshotUrl(docPath: string): string {
  return `${SPEC_BASELINE.materialWeb.docsSnapshot.replace('/tree/', '/blob/')}/${docPath}`;
}
