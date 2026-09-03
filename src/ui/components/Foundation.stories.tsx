import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button, type ButtonSize, type ButtonVariant } from './Button';
import { Checkbox, type CheckboxSize } from './Checkbox';
import { Chip, ChipSet, type ChipAssistiveLevel, type ChipSize } from './Chip';
import { Dialog } from './Dialog';
import {
  IconButton,
  type IconButtonSize,
  type IconButtonVariant,
} from './IconButton';
import { MaterialIcon } from '../icons/MaterialIcon';
import { Menu } from './Menu';
import { Radio, RadioGroup, type RadioSize } from './Radio';
import { Select } from './Select';
import { SegmentedButton, SegmentedButtonSet } from './SegmentedButton';
import { useSnackbar } from './Snackbar';
import { Switch } from './Switch';
import { Tab, TabList, TabPanel, Tabs } from './Tabs';
import { TextField } from './TextField';

const meta = {
  title: 'Foundation/Component set',
  component: Button,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Buttons: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {(['large', 'medium', 'small'] as ButtonSize[]).map((size) => (
        <section key={size} style={{ display: 'grid', gap: '0.75rem' }}>
          <strong>{size}</strong>
          {(['filled', 'outlined', 'text', 'elevated', 'tonal'] as ButtonVariant[])
            .map((variant) => (
              <div
                key={variant}
                style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}
              >
                <span style={{ inlineSize: '5rem' }}>{variant}</span>
                <Button size={size} variant={variant}>Label</Button>
                <Button
                  leadingIcon={<MaterialIcon name="keyboard_command_key" />}
                  size={size}
                  variant={variant}
                >
                  Label
                </Button>
                {(variant === 'outlined' || variant === 'text') ? (
                  <Button
                    size={size}
                    trailingIcon={<MaterialIcon name="keyboard_command_key" />}
                    variant={variant}
                  >
                    Label
                  </Button>
                ) : null}
                <Button error size={size} variant={variant}>Error</Button>
                <Button disabled size={size} variant={variant}>Disabled</Button>
              </div>
            ))}
        </section>
      ))}
    </div>
  ),
};

export const FormControls: Story = {
  render: () => <FormControlsStory />,
};

export const IconButtonStates: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {(['large', 'medium', 'small'] as IconButtonSize[]).map((size) => (
        <div key={size} style={{ display: 'grid', gap: '0.5rem' }}>
          <strong>{size}</strong>
          {(['standard', 'filled', 'tonal', 'outlined', 'error'] as IconButtonVariant[])
            .map((variant) => (
              <div key={variant} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ inlineSize: '5rem' }}>{variant}</span>
                <IconButton aria-label={`${size} ${variant} action`} icon={<MaterialIcon name="keyboard_command_key" />} size={size} variant={variant} />
                <IconButton aria-label={`${size} ${variant} unselected`} icon={<MaterialIcon name="favorite_border" />} selectedIcon={<MaterialIcon name="favorite" />} size={size} variant={variant} />
                <IconButton aria-label={`${size} ${variant} unselected`} icon={<MaterialIcon name="favorite_border" />} selected selectedAriaLabel={`${size} ${variant} selected`} selectedIcon={<MaterialIcon name="favorite" />} size={size} variant={variant} />
                <IconButton aria-label={`${size} ${variant} disabled`} disabled icon={<MaterialIcon name="block" />} size={size} variant={variant} />
              </div>
            ))}
        </div>
      ))}
    </div>
  ),
};

export const FieldStates: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(12rem, 1fr))', gap: '1.5rem', inlineSize: 'min(56rem, 100%)' }}>
      <TextField label="Outlined" supportingText="Body small supporting text" />
      <TextField label="Filled" supportingText="Body small supporting text" variant="filled" />
      <TextField error errorText="Body small error text" label="Error" />
      <TextField disabled label="Disabled" supportingText="Disabled supporting text" />
      <Select label="Outlined select" options={[{ value: 'one', label: 'One' }]} supportingText="Body small supporting text" />
      <Select label="Filled select" options={[{ value: 'one', label: 'One' }]} supportingText="Body small supporting text" variant="filled" />
      <Select error errorText="Body small error text" label="Error select" options={[{ value: 'one', label: 'One' }]} />
      <Select disabled label="Disabled select" options={[{ value: 'one', label: 'One' }]} supportingText="Disabled supporting text" />
      <Checkbox label="Unchecked" />
      <Checkbox defaultChecked label="Checked" />
      <Checkbox defaultChecked indeterminate label="Indeterminate" />
      <Checkbox defaultChecked disabled label="Disabled" />
    </div>
  ),
};

export const CheckboxFigmaMatrix: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {(['large', 'medium', 'small'] as CheckboxSize[]).map((size) => (
        <section key={size} style={{ display: 'grid', gap: '0.75rem' }}>
          <strong>{size}</strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(12rem, 1fr))', gap: '1rem 1.5rem' }}>
            <Checkbox label="Unchecked" size={size} />
            <Checkbox defaultChecked label="Checked" size={size} />
            <Checkbox defaultChecked indeterminate label="Indeterminate" size={size} />
            <Checkbox error errorText="Selection required" label="Error unchecked" size={size} />
            <Checkbox defaultChecked error errorText="Selection required" label="Error checked" size={size} />
            <Checkbox defaultChecked error errorText="Selection required" indeterminate label="Error indeterminate" size={size} />
            <Checkbox defaultChecked disabled label="Disabled checked" size={size} />
            <Checkbox defaultChecked disabled error label="Disabled error checked" size={size} />
          </div>
        </section>
      ))}
    </div>
  ),
};

export const RadioFigmaMatrix: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {(['large', 'medium', 'small'] as RadioSize[]).map((size) => (
        <section key={size} style={{ display: 'grid', gap: '0.75rem' }}>
          <strong>{size}</strong>
          <RadioGroup
            defaultValue="selected"
            label={`${size} enabled radio group`}
            name={`storybook-radio-${size}`}
            orientation="horizontal"
          >
            <Radio label="Unselected" size={size} value="unselected" />
            <Radio label="Selected" size={size} value="selected" />
          </RadioGroup>
          <RadioGroup
            defaultValue="selected"
            disabled
            label={`${size} disabled radio group`}
            name={`storybook-radio-${size}-disabled`}
            orientation="horizontal"
          >
            <Radio label="Disabled unselected" size={size} value="unselected" />
            <Radio label="Disabled selected" size={size} value="selected" />
          </RadioGroup>
        </section>
      ))}
    </div>
  ),
};

export const TabsFigmaAndMd3: Story = {
  render: () => <TabsStory />,
};

export const SegmentedButtonsFigmaAndMd3: Story = {
  render: () => <SegmentedButtonsStory />,
};

export const SwitchFigmaAndMd3: Story = {
  render: () => <SwitchStory />,
};

export const ChipTypesAndStates: Story = {
  render: () => <ChipTypesAndStatesStory />,
};

export const OverlaysAndFeedback: Story = {
  render: () => <OverlaysAndFeedbackStory />,
};

function TabsStory() {
  const [value, setValue] = useState<'overview' | 'tokens' | 'behavior'>('overview');

  return (
    <Tabs
      onValueChange={setValue}
      style={{ inlineSize: 'min(40rem, 100%)' }}
      value={value}
    >
      <TabList label="Component documentation">
        <Tab showTrailingIcon={false} value="overview">Overview</Tab>
        <Tab value="tokens">Tokens</Tab>
        <Tab value="behavior">Behavior</Tab>
        <Tab disabled value="disabled">Disabled</Tab>
      </TabList>
      <TabPanel style={{ padding: '1rem' }} value="overview">Overview panel</TabPanel>
      <TabPanel style={{ padding: '1rem' }} value="tokens">Tokens panel</TabPanel>
      <TabPanel style={{ padding: '1rem' }} value="behavior">Behavior panel</TabPanel>
    </Tabs>
  );
}

function SegmentedButtonsStory() {
  const [singleValue, setSingleValue] = useState<'day' | 'week' | 'month'>('day');
  const [multipleValue, setMultipleValue] = useState<Array<'labels' | 'routes' | 'locked'>>(['labels']);

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <SegmentedButtonSet<'day' | 'week' | 'month'>
        label="Calendar range"
        onValueChange={setSingleValue}
        value={singleValue}
      >
        <SegmentedButton icon={<MaterialIcon name="today" />} value="day">Day</SegmentedButton>
        <SegmentedButton value="week">Week</SegmentedButton>
        <SegmentedButton aria-label="Month view" icon={<MaterialIcon name="calendar_month" />} value="month" />
      </SegmentedButtonSet>
      <SegmentedButtonSet<'labels' | 'routes' | 'locked'>
        label="Map layers"
        onValueChange={setMultipleValue}
        selectionMode="multiple"
        value={multipleValue}
      >
        <SegmentedButton icon={<MaterialIcon name="label" />} value="labels">Labels</SegmentedButton>
        <SegmentedButton icon={<MaterialIcon name="route" />} value="routes">Routes</SegmentedButton>
        <SegmentedButton disabled value="locked">Locked</SegmentedButton>
      </SegmentedButtonSet>
    </div>
  );
}

function SwitchStory() {
  const [selected, setSelected] = useState(true);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
      <Switch
        aria-label="Controlled switch"
        onSelectedChange={setSelected}
        selected={selected}
      />
      <Switch aria-label="Selected switch" defaultSelected />
      <Switch aria-label="Disabled switch" disabled />
      <Switch aria-label="Disabled selected switch" defaultSelected disabled />
    </div>
  );
}

function FormControlsStory() {
  const [platform, setPlatform] = useState<'web' | 'desktop'>('web');
  const [checked, setChecked] = useState(true);
  return (
    <div style={{ display: 'grid', gap: '1.25rem', inlineSize: 'min(28rem, 100%)' }}>
      <TextField label="Project name" supportingText="Visible supporting text" />
      <Select
        label="Platform"
        onValueChange={setPlatform}
        options={[{ value: 'web', label: 'Web' }, { value: 'desktop', label: 'Desktop' }]}
        value={platform}
      />
      <Checkbox checked={checked} label="Receive updates" onCheckedChange={setChecked} />
    </div>
  );
}

function ChipTypesAndStatesStory() {
  const [filterSelected, setFilterSelected] = useState(false);
  const [inputVisible, setInputVisible] = useState(true);
  const levels: ChipAssistiveLevel[] = [
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
  const sizes: ChipSize[] = ['large', 'small', 'x-small'];

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {sizes.map((size) => (
        <ChipSet key={size} label={`${size} assistive chip levels`}>
          {levels.map((level) => (
            <Chip key={level} level={level} size={size}>{level}</Chip>
          ))}
        </ChipSet>
      ))}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
        <ChipSet label="Selectable chip types">
          <Chip
            chipType="filter"
            onSelectedChange={setFilterSelected}
            selected={filterSelected}
          >
            Filter
          </Chip>
          <Chip chipType="filter" selected showTrailingIcon={false}>Selected</Chip>
          {inputVisible ? (
            <Chip chipType="input" onRemove={() => setInputVisible(false)} removeOnly>Input</Chip>
          ) : null}
          <Chip chipType="input" removeOnly selected>Selected input</Chip>
          <Chip disabled level="neutral">Disabled</Chip>
        </ChipSet>
        <Chip chipType="location" prefix="X">6.058m</Chip>
      </div>
    </div>
  );
}

function OverlaysAndFeedbackStory() {
  const snackbar = useSnackbar();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
      <Dialog
        description="Body medium supporting text"
        dismissible={false}
        title="Alert dialog"
        trigger="Open alert dialog"
        variant="alert"
      />
      <Menu
        items={[
          { type: 'checkbox', id: 'checked', label: 'Checked item', leadingIcon: <MaterialIcon name="visibility" />, checked: true, onCheckedChange: () => undefined },
          { type: 'item', id: 'disabled', label: 'Disabled item', disabled: true, onSelect: () => undefined },
        ]}
        label="Open menu"
      />
      <Button onClick={() => snackbar.show({ message: 'Single-line snackbar', dismissLabel: 'Dismiss' })}>
        Show snackbar
      </Button>
      <Button
        onClick={() => snackbar.show({
          action: { label: 'Undo', onAction: () => undefined },
          dismissLabel: 'Dismiss two-line snackbar',
          message: 'A longer snackbar message wraps to two lines and uses the Material 3 two-line container height.',
        })}
        variant="tonal"
      >
        Show two-line snackbar
      </Button>
    </div>
  );
}
