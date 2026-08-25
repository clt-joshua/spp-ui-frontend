import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button, Checkbox, Dialog, IconButton, MaterialIcon, Select, TextField } from '../../src/ui';

describe('public UI components', () => {
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
  });

  it('connects field labels and error descriptions', () => {
    render(<TextField error errorText="필수 항목입니다." label="이름" />);
    const field = screen.getByRole('textbox', { name: '이름' });
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription('필수 항목입니다.');
  });

  it('exposes icon button toggle state and select descriptions', () => {
    render(
      <>
        <IconButton
          aria-label="즐겨찾기"
          icon={<MaterialIcon name="favorite_border" />}
          selected
          selectedIcon={<MaterialIcon name="favorite" />}
          variant="filled"
        />
        <Select
          error
          errorText="선택이 필요합니다."
          label="플랫폼"
          options={[{ value: 'web', label: 'Web' }]}
        />
      </>,
    );

    expect(screen.getByRole('button', { name: '즐겨찾기' })).toHaveAttribute('aria-pressed', 'true');
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
});
