import { render, screen } from '@testing-library/react';
import type { CSSProperties } from 'react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Button,
  Checkbox,
  Chip,
  ChipSet,
  Dialog,
  DialogClose,
  IconButton,
  MaterialIcon,
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
  type SwitchChangeDetails,
  type TabsValueChangeDetails,
} from '../../src/ui';

describe('public UI components', () => {
  it('implements the small-only Figma Switch with cancelable MD3 form and keyboard behavior', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn((nextSelected: boolean, details: SwitchChangeDetails) => {
      if (!nextSelected) details.cancel();
    });

    render(
      <form aria-label="Settings form">
        <Switch
          aria-label="Cancelable Wi-Fi"
          defaultSelected
          name="wifi"
          onSelectedChange={onSelectedChange}
          value="enabled"
        />
        <Switch aria-label="Notifications" name="notifications" value="enabled" />
        <Switch aria-label="Disabled setting" disabled />
      </form>,
    );

    const cancelable = screen.getByRole('switch', { name: 'Cancelable Wi-Fi' });
    const notifications = screen.getByRole('switch', { name: 'Notifications' });
    const disabled = screen.getByRole('switch', { name: 'Disabled setting' });
    const form = screen.getByRole('form') as HTMLFormElement;

    expect(cancelable).toHaveAttribute('aria-checked', 'true');
    expect(cancelable).not.toHaveAttribute('data-size');
    expect(cancelable.querySelector('[data-slot="track"]')).toBeInTheDocument();
    expect(cancelable.querySelector('[data-slot="thumb"]')).toBeInTheDocument();
    expect(cancelable.querySelector('[data-slot="state-layer"]')).toBeInTheDocument();
    expect(cancelable.querySelector('[data-slot="ripple"]')).toBeInTheDocument();
    expect(cancelable.querySelector('[data-slot="focus-ring"]')).toBeInTheDocument();

    await user.click(cancelable);
    expect(cancelable).toHaveAttribute('aria-checked', 'true');
    expect(onSelectedChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'none' }),
    );
    expect(new FormData(form).get('wifi')).toBe('enabled');

    notifications.focus();
    await user.keyboard(' ');
    expect(notifications).toHaveAttribute('aria-checked', 'true');
    expect(new FormData(form).get('notifications')).toBe('enabled');
    await user.keyboard('{Enter}');
    expect(notifications).toHaveAttribute('aria-checked', 'false');

    expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await user.click(disabled);
    expect(disabled).toHaveAttribute('aria-checked', 'false');
  });

  it('implements Figma Segmented Button anatomy with Stable Material single-selection behavior', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SegmentedButtonSet
        defaultValue="day"
        label="Calendar range"
        onValueChange={onValueChange}
        style={{ '--md-segmented-button-outline-color': '#123456' } as CSSProperties}
      >
        <SegmentedButton icon={<MaterialIcon name="today" />} value="day">Day</SegmentedButton>
        <SegmentedButton value="week">Week</SegmentedButton>
        <SegmentedButton aria-label="Agenda" icon={<MaterialIcon name="view_agenda" />} value="agenda" />
        <SegmentedButton disabled value="disabled">Disabled</SegmentedButton>
      </SegmentedButtonSet>,
    );

    const group = screen.getByRole('group', { name: 'Calendar range' });
    const day = screen.getByRole('button', { name: 'Day' });
    const week = screen.getByRole('button', { name: 'Week' });
    const agenda = screen.getByRole('button', { name: 'Agenda' });
    const disabled = screen.getByRole('button', { name: 'Disabled' });

    expect(group).toHaveAttribute('data-selection-mode', 'single');
    expect(group).toHaveStyle({ '--md-segmented-button-outline-color': '#123456' });
    expect(day).toHaveAttribute('aria-pressed', 'true');
    expect(day.querySelector('[data-slot="selected-icon"]')).toBeInTheDocument();
    expect(day.querySelector('[data-slot="icon"]')).not.toBeInTheDocument();
    expect(day.querySelector('[data-slot="touch-target"]')).toBeInTheDocument();

    await user.click(week);
    expect(day).toHaveAttribute('aria-pressed', 'false');
    expect(week).toHaveAttribute('aria-pressed', 'true');
    expect(onValueChange).toHaveBeenLastCalledWith(
      'week',
      expect.objectContaining({ index: 1, selected: true, value: 'week' }),
    );

    await user.click(week);
    expect(onValueChange).toHaveBeenCalledTimes(1);

    await user.click(agenda);
    expect(agenda).toHaveAttribute('aria-pressed', 'true');
    expect(agenda.querySelector('[data-slot="selected-icon"]')).toBeInTheDocument();
    expect(agenda.querySelector('[data-slot="icon"]')).toBeInTheDocument();

    await user.click(disabled);
    expect(disabled).toHaveAttribute('aria-pressed', 'false');
  });

  it('allows independent Segmented Button toggles only in multiple-selection mode', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SegmentedButtonSet
        defaultValue={['labels']}
        label="Map layers"
        onValueChange={onValueChange}
        selectionMode="multiple"
      >
        <SegmentedButton value="labels">Labels</SegmentedButton>
        <SegmentedButton value="routes">Routes</SegmentedButton>
      </SegmentedButtonSet>,
    );

    const labels = screen.getByRole('button', { name: 'Labels' });
    const routes = screen.getByRole('button', { name: 'Routes' });
    expect(labels).toHaveAttribute('aria-pressed', 'true');
    expect(routes).toHaveAttribute('aria-pressed', 'false');

    await user.click(routes);
    expect(routes).toHaveAttribute('aria-pressed', 'true');
    expect(onValueChange).toHaveBeenLastCalledWith(
      ['labels', 'routes'],
      expect.objectContaining({ index: 1, selected: true, value: 'routes' }),
    );

    await user.click(labels);
    expect(labels).toHaveAttribute('aria-pressed', 'false');
    expect(onValueChange).toHaveBeenLastCalledWith(
      ['routes'],
      expect.objectContaining({ index: 0, selected: false, value: 'labels' }),
    );
  });

  it('implements Figma Tabs with MD3 manual activation and linked tab panels', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn((value: string, details: TabsValueChangeDetails) => {
      if (value === 'behavior') details.cancel();
    });
    render(
      <Tabs defaultValue="overview" onValueChange={onValueChange}>
        <TabList label="Project sections">
          <Tab showTrailingIcon={false} value="overview">Overview</Tab>
          <Tab value="tokens">Tokens</Tab>
          <Tab value="behavior">Behavior</Tab>
          <Tab disabled value="disabled">Disabled</Tab>
        </TabList>
        <TabPanel value="overview">Overview panel</TabPanel>
        <TabPanel value="tokens">Tokens panel</TabPanel>
        <TabPanel value="behavior">Behavior panel</TabPanel>
      </Tabs>,
    );

    const tablist = screen.getByRole('tablist', { name: 'Project sections' });
    const overview = screen.getByRole('tab', { name: 'Overview' });
    const tokens = screen.getByRole('tab', { name: 'Tokens' });
    const disabled = screen.getByRole('tab', { name: 'Disabled' });

    expect(tablist).toBeInTheDocument();
    expect(overview).toHaveAttribute('aria-selected', 'true');
    expect(overview).toHaveAttribute('aria-controls');
    expect(screen.getByRole('tabpanel', { name: 'Overview' })).toHaveTextContent('Overview panel');
    expect(disabled).toHaveAttribute('aria-disabled', 'true');
    expect(overview.querySelector('[data-slot="trailing-icon"]')).not.toBeInTheDocument();
    expect(tokens.querySelector('[data-slot="trailing-icon"]')).toBeInTheDocument();
    expect(tokens.querySelector('[data-slot="state-layer"]')).toBeInTheDocument();
    expect(tokens.querySelector('[data-slot="ripple"]')).toBeInTheDocument();
    expect(tokens.querySelector('[data-slot="focus-ring"]')).toBeInTheDocument();

    overview.focus();
    await user.keyboard('{ArrowRight}');
    expect(tokens).toHaveFocus();
    expect(overview).toHaveAttribute('aria-selected', 'true');
    expect(tokens).toHaveAttribute('aria-selected', 'false');

    await user.keyboard('{Enter}');
    expect(tokens).toHaveAttribute('aria-selected', 'true');
    expect(onValueChange).toHaveBeenLastCalledWith(
      'tokens',
      expect.objectContaining({ reason: 'none' }),
    );
    expect(screen.getByRole('tabpanel', { name: 'Tokens' })).toHaveTextContent('Tokens panel');

    await user.keyboard('{End}');
    expect(disabled).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(tokens).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Behavior' })).toHaveFocus();
    await user.keyboard(' ');
    expect(tokens).toHaveAttribute('aria-selected', 'true');
  });

  it('supports opt-in automatic Tabs activation and root token overrides', async () => {
    const user = userEvent.setup();
    render(
      <Tabs
        defaultValue="one"
        style={{ '--md-primary-tab-active-indicator-color': '#123456' } as CSSProperties}
      >
        <TabList autoActivate label="Automatic sections">
          <Tab value="one">One</Tab>
          <Tab value="two">Two</Tab>
        </TabList>
        <TabPanel value="one">One panel</TabPanel>
        <TabPanel value="two">Two panel</TabPanel>
      </Tabs>,
    );

    const root = screen.getByRole('tablist', { name: 'Automatic sections' }).parentElement;
    expect(root).toHaveStyle({ '--md-primary-tab-active-indicator-color': '#123456' });

    const one = screen.getByRole('tab', { name: 'One' });
    const two = screen.getByRole('tab', { name: 'Two' });
    one.focus();
    await user.keyboard('{ArrowRight}');
    expect(two).toHaveFocus();
    expect(two).toHaveAttribute('aria-selected', 'true');
  });

  it('implements the four Chip types with observable selection, removal, and toolbar focus', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    const onRemove = vi.fn();
    render(
      <>
        <ChipSet label="프로젝트 필터">
          <Chip level="primary">도움</Chip>
          <Chip chipType="filter" onSelectedChange={onSelectedChange}>필터</Chip>
          <Chip chipType="input" onRemove={onRemove}>입력값</Chip>
        </ChipSet>
        <Chip chipType="location" prefix="X">6.058m</Chip>
      </>,
    );

    const toolbar = screen.getByRole('toolbar', { name: '프로젝트 필터' });
    const filter = screen.getByRole('button', { name: '필터' });
    const remove = screen.getByRole('button', { name: '입력값 삭제' });
    const location = screen.getByText('6.058m').closest('[data-chip-type="location"]');

    expect(toolbar).toBeInTheDocument();
    expect(filter).toHaveAttribute('aria-pressed', 'false');
    await user.click(filter);
    expect(filter).toHaveAttribute('aria-pressed', 'true');
    expect(onSelectedChange).toHaveBeenCalledWith(true);

    await user.click(remove);
    expect(onRemove).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: '입력값' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '입력값 삭제' })).not.toBeInTheDocument();
    expect(location).toBeInTheDocument();
    expect(location).toHaveAttribute('data-size', 'small');
    expect(location?.querySelector('button')).not.toBeInTheDocument();

    const assistive = screen.getByRole('button', { name: '도움' });
    assistive.focus();
    await user.keyboard('{ArrowRight}');
    expect(filter).toHaveFocus();
    expect(assistive).toHaveAttribute('tabindex', '-1');
    expect(filter).toHaveAttribute('tabindex', '0');
  });

  it('keeps Filter selection cancelable and makes remove-only Input a single remove action', async () => {
    const user = userEvent.setup();
    render(
      <ChipSet label="제거 전용 태그">
        <Chip chipType="filter" onClick={(event) => event.preventDefault()}>취소 가능한 필터</Chip>
        <Chip chipType="input" removeOnly>태그</Chip>
      </ChipSet>,
    );

    const filter = screen.getByRole('button', { name: '취소 가능한 필터' });
    await user.click(filter);
    expect(filter).toHaveAttribute('aria-pressed', 'false');

    const inputRoot = screen.getByText('태그').closest('[data-chip-type="input"]');
    expect(inputRoot?.querySelector('[data-chip-action="primary"]')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '태그 삭제' }));
    expect(inputRoot).not.toBeInTheDocument();
  });

  it('moves through Input primary and remove actions before the next ChipSet item', async () => {
    const user = userEvent.setup();
    render(
      <ChipSet label="다중 동작 탐색">
        <Chip>첫 항목</Chip>
        <Chip chipType="input" onRemove={(event) => event.preventDefault()}>입력 동작</Chip>
        <Chip chipType="filter">마지막 필터</Chip>
      </ChipSet>,
    );

    const primary = screen.getByRole('button', { name: '입력 동작' });
    const remove = screen.getByRole('button', { name: '입력 동작 삭제' });
    const next = screen.getByRole('button', { name: '마지막 필터' });
    primary.focus();

    await user.keyboard('{ArrowRight}');
    expect(remove).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(next).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(remove).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(primary).toHaveFocus();
  });

  it('keeps Chip component token overrides on the visual root', () => {
    render(
      <Chip
        level="outline"
        style={{ '--md-assistive-chip-outline-color': 'rebeccapurple' } as CSSProperties}
      >
        토큰 재정의
      </Chip>,
    );

    expect(
      screen.getByRole('button', { name: '토큰 재정의' }).closest('[data-chip-type]'),
    ).toHaveStyle({ '--md-assistive-chip-outline-color': 'rebeccapurple' });
  });

  it('keeps button activation and checkbox state observable', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    const onCheckedChange = vi.fn();
    render(
      <>
        <Button onClick={onPress}>저장</Button>
        <Checkbox label="알림" onCheckedChange={onCheckedChange} />
      </>,
    );

    await user.click(screen.getByRole('button', { name: '저장' }));
    await user.click(screen.getByRole('checkbox', { name: '알림' }));

    expect(onPress).toHaveBeenCalledOnce();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    const checkbox = screen.getByRole('checkbox', { name: '알림' });
    expect(checkbox.querySelector('[data-slot="state-layer"]')).toBeInTheDocument();
    expect(checkbox.querySelector('[data-slot="ripple"]')).toBeInTheDocument();
    expect(checkbox.querySelector('[data-slot="focus-ring"]')).toBeInTheDocument();
  });

  it('maps the Figma Checkbox size, error, mixed, and disabled axes to native semantics', () => {
    render(
      <>
        <Checkbox label="Large unchecked" size="large" />
        <Checkbox
          defaultChecked
          error
          errorText="선택을 확인하세요."
          indeterminate
          label="Medium mixed error"
          size="medium"
        />
        <Checkbox defaultChecked disabled error label="Small disabled error" size="small" />
      </>,
    );

    const large = screen.getByRole('checkbox', { name: 'Large unchecked' });
    expect(large).toHaveAttribute('data-size', 'large');
    expect(large).toHaveAttribute('data-selection-state', 'unselected');
    expect(large).not.toHaveAttribute('aria-invalid');

    const mixedError = screen.getByRole('checkbox', { name: 'Medium mixed error' });
    expect(mixedError).toHaveAttribute('data-size', 'medium');
    expect(mixedError).toHaveAttribute('data-selection-state', 'indeterminate');
    expect(mixedError).toHaveAttribute('aria-checked', 'mixed');
    expect(mixedError).toHaveAttribute('aria-invalid', 'true');
    expect(mixedError).toHaveAccessibleDescription('선택을 확인하세요.');

    const disabledError = screen.getByRole('checkbox', { name: 'Small disabled error' });
    expect(disabledError).toHaveAttribute('data-size', 'small');
    expect(disabledError).toHaveAttribute('aria-invalid', 'true');
    expect(disabledError).toHaveAttribute('aria-disabled', 'true');
  });

  it('maps the Figma Radio sizes to one named, keyboard-operable form group', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <form>
        <RadioGroup
          defaultValue="medium"
          label="Density"
          name="density"
          onValueChange={onValueChange}
          required
          supportingText="Choose one density."
        >
          <Radio label="Large density" size="large" value="large" />
          <Radio label="Medium density" size="medium" value="medium" />
          <Radio disabled label="Small density" size="small" value="small" />
        </RadioGroup>
      </form>,
    );

    const group = screen.getByRole('radiogroup', { name: 'Density' });
    const large = screen.getByRole('radio', { name: 'Large density' });
    const medium = screen.getByRole('radio', { name: 'Medium density' });
    const small = screen.getByRole('radio', { name: 'Small density' });

    expect(group).toHaveAttribute('aria-required', 'true');
    expect(group).toHaveAccessibleDescription('Choose one density.');
    expect(large).toHaveAttribute('data-size', 'large');
    expect(medium).toHaveAttribute('data-size', 'medium');
    expect(small).toHaveAttribute('data-size', 'small');
    expect(medium).toHaveAttribute('aria-checked', 'true');
    expect(small).toHaveAttribute('aria-disabled', 'true');
    expect(large.querySelector('[data-slot="touch-target"]')).toBeInTheDocument();
    expect(large.querySelector('[data-slot="state-layer"]')).toBeInTheDocument();
    expect(large.querySelector('[data-slot="ripple"]')).toBeInTheDocument();
    expect(large.querySelector('[data-slot="focus-ring"]')).toBeInTheDocument();

    await user.click(screen.getByText('Large density'));
    expect(large).toHaveAttribute('aria-checked', 'true');
    expect(medium).toHaveAttribute('aria-checked', 'false');
    expect(onValueChange).toHaveBeenLastCalledWith('large');

    large.focus();
    await user.keyboard('{ArrowDown}');
    expect(medium).toHaveFocus();
    expect(medium).toHaveAttribute('aria-checked', 'true');

    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    expect(new FormData(form!).get('density')).toBe('medium');
  });

  it('keeps Radio component token overrides on its public row root', () => {
    render(
      <RadioGroup defaultValue="custom" label="Custom group" name="custom-group">
        <Radio
          label="Custom radio"
          style={{ '--md-radio-selected-icon-color': '#123456' } as CSSProperties}
          value="custom"
        />
      </RadioGroup>,
    );

    expect(screen.getByText('Custom radio').closest('[data-size]')).toHaveStyle({
      '--md-radio-selected-icon-color': '#123456',
    });
  });

  it('maps the Figma Button size, error, content, and disabled axes to native buttons', () => {
    render(
      <>
        <Button
          aria-label="medium error leading"
          error
          leadingIcon={<MaterialIcon name="keyboard_command_key" />}
          size="medium"
          variant="filled"
        >
          Label
        </Button>
        <Button
          aria-label="small trailing"
          size="small"
          trailingIcon={<MaterialIcon name="keyboard_command_key" />}
          variant="text"
        >
          Label
        </Button>
        <Button aria-label="large disabled error" disabled error variant="outlined">
          Label
        </Button>
      </>,
    );

    const medium = screen.getByRole('button', { name: 'medium error leading' });
    expect(medium).toHaveAttribute('data-size', 'medium');
    expect(medium).toHaveAttribute('data-button-variant', 'filled');
    expect(medium).toHaveAttribute('data-content-type', 'left-icon');
    expect(medium).toHaveAttribute('data-error', 'true');
    expect(medium).not.toHaveAttribute('aria-invalid');
    expect(medium.querySelector('[data-slot="touch-target"]')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'small trailing' }))
      .toHaveAttribute('data-content-type', 'right-icon');
    expect(screen.getByRole('button', { name: 'large disabled error' })).toBeDisabled();
  });

  it('connects field labels and error descriptions', () => {
    render(<TextField error errorText="필수 항목입니다." label="이름" />);
    const field = screen.getByRole('textbox', { name: '이름' });
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription('필수 항목입니다.');
  });

  it('exposes icon button size, error style, toggle state, and select descriptions', () => {
    render(
      <>
        <IconButton
          aria-label="즐겨찾기"
          icon={<MaterialIcon name="favorite_border" />}
          selected
          selectedAriaLabel="즐겨찾기 제거"
          selectedIcon={<MaterialIcon name="favorite" />}
          variant="filled"
        />
        <IconButton
          aria-label="오류 작업"
          icon={<MaterialIcon name="error" />}
          size="small"
          variant="error"
        />
        <Select
          error
          errorText="선택이 필요합니다."
          label="플랫폼"
          options={[{ value: 'web', label: 'Web' }]}
        />
      </>,
    );

    const toggle = screen.getByRole('button', { name: '즐겨찾기 제거' });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(toggle).toHaveAttribute('data-size', 'large');
    expect(toggle).toHaveAttribute('type', 'button');
    expect(toggle.querySelector('[data-slot="touch-target"]')).toBeInTheDocument();

    const errorAction = screen.getByRole('button', { name: '오류 작업' });
    expect(errorAction).toHaveAttribute('data-icon-button-variant', 'error');
    expect(errorAction).toHaveAttribute('data-size', 'small');
    expect(errorAction).not.toHaveAttribute('aria-invalid');
    expect(screen.getByRole('combobox', { name: '플랫폼' })).toHaveAccessibleDescription('선택이 필요합니다.');
  });

  it('uses alertdialog semantics and removes dismissal affordances when required', () => {
    render(
      <Dialog
        defaultOpen
        description="확인이 필요한 작업입니다."
        dismissible={false}
        title="삭제할까요?"
        variant="alert"
      />,
    );

    expect(screen.getByRole('alertdialog', { name: '삭제할까요?' })).toBeVisible();
    expect(screen.queryByRole('button', { name: '대화상자 닫기' })).not.toBeInTheDocument();
  });

  it('keeps instance token overrides on public roots and closes through the project adapter', async () => {
    const user = userEvent.setup();
    const tokenStyle = { '--md-checkbox-selected-container-color': '#123456' } as CSSProperties;
    const { container } = render(
      <>
        <Checkbox className="checkbox-instance" label="맞춤 체크" style={tokenStyle} />
        <Dialog
          actions={<DialogClose>완료</DialogClose>}
          className="dialog-instance"
          defaultOpen
          style={{ '--md-dialog-container-max-width': '30rem' } as CSSProperties}
          title="어댑터 확인"
        />
      </>,
    );

    expect(container.querySelector('.checkbox-instance')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: '어댑터 확인' })).toHaveClass('dialog-instance');

    await user.click(screen.getByRole('button', { name: '완료' }));
    expect(screen.queryByRole('dialog', { name: '어댑터 확인' })).not.toBeInTheDocument();
  });
});
