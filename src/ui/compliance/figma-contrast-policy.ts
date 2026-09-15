// Explicitly reviewed Figma color bindings, not a blanket axe exclusion.
// New components/rules require their own source review before joining this list.
const FIGMA_COLOR_SOURCES: Readonly<Record<string, string>> = {
  button: '10429:72459',
  chip: '10463:4107;10560:12598;10560:12744;10563:12834',
  'text-field': '10724:14659',
  autocomplete: '10724:14659 (inherited field tokens)',
};

export function isFigmaContrastObservation(componentId: string, ruleId: string) {
  return ruleId === 'color-contrast' && Object.hasOwn(FIGMA_COLOR_SOURCES, componentId);
}
