import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { Dialog } from './Dialog';
import { IconButton } from './IconButton';
import { MaterialIcon } from '../icons/MaterialIcon';
import { Menu } from './Menu';
import { Select } from './Select';
import { useSnackbar } from './Snackbar';
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
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
      <Button leadingIcon={<MaterialIcon name="add" />}>Filled</Button>
      <Button variant="tonal">Tonal</Button>
      <Button variant="elevated">Elevated</Button>
      <Button variant="outlined">Outlined</Button>
      <Button variant="text">Text</Button>
      <Button disabled>Disabled</Button>
    </div>
  ),
};

export const FormControls: Story = {
  render: () => <FormControlsStory />,
};

export const IconButtonStates: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {(['standard', 'filled', 'tonal', 'outlined'] as const).map((variant) => (
        <div key={variant} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ inlineSize: '5rem' }}>{variant}</span>
          <IconButton aria-label={`${variant} action`} icon={<MaterialIcon name="favorite_border" />} variant={variant} />
          <IconButton aria-label={`${variant} unselected`} icon={<MaterialIcon name="favorite_border" />} selectedIcon={<MaterialIcon name="favorite" />} variant={variant} />
          <IconButton aria-label={`${variant} selected`} icon={<MaterialIcon name="favorite_border" />} selected selectedIcon={<MaterialIcon name="favorite" />} variant={variant} />
          <IconButton aria-label={`${variant} disabled`} disabled icon={<MaterialIcon name="favorite_border" />} variant={variant} />
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

export const OverlaysAndFeedback: Story = {
  render: () => <OverlaysAndFeedbackStory />,
};

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
          { type: 'checkbox', id: 'checked', label: 'Checked item', checked: true, onCheckedChange: () => undefined },
          { type: 'item', id: 'disabled', label: 'Disabled item', disabled: true, onSelect: () => undefined },
        ]}
        label="Open menu"
      />
      <Button onClick={() => snackbar.show({ message: 'Single-line snackbar', dismissLabel: 'Dismiss' })}>
        Show snackbar
      </Button>
    </div>
  );
}
