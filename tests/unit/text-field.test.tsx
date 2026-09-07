import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TextField } from '../../src/ui';

afterEach(cleanup);

describe('Figma TextField native contract', () => {
  it('honors explicit accessible naming and zero-valued affixes', () => {
    const { rerender } = render(<TextField aria-label="자세한 이름" label="이름" prefix={0} suffix={0} />);
    const input = screen.getByRole('textbox', { name: '자세한 이름' });
    expect(input.closest('[data-text-field-variant]')?.querySelector('[data-slot="prefix"]')).toHaveTextContent('0');
    rerender(<><span id="external-label">외부 이름</span><TextField aria-labelledby="external-label" label="이름" /></>);
    expect(screen.getByRole('textbox', { name: '외부 이름' })).toBeInTheDocument();
  });

  it('keeps external description, error, required and hidden accessible label associated', () => {
    render(<><p id="external">외부 설명</p><TextField aria-describedby="external" error errorText="오류" hideLabel label="이름" required size="small" /></>);
    const input = screen.getByRole('textbox', { name: '이름' });
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('외부 설명 오류');
    expect(input.closest('[data-size]')).toHaveAttribute('data-size', 'small');
  });

  it('clears controlled values once through onChange and restores input focus', async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    function Controlled() {
      const [value, setValue] = useState('abc');
      return <TextField clearable label="Controlled" onChange={(event) => { changed(event.currentTarget.value); setValue(event.currentTarget.value); }} value={value} />;
    }
    render(<Controlled />);
    await user.click(screen.getByRole('button', { name: 'Controlled 지우기' }));
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(changed).toHaveBeenCalledExactlyOnceWith('');
    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('submits readonly fields, excludes disabled fields and resets uncontrolled values', async () => {
    const user = userEvent.setup();
    render(<form aria-label="native"><TextField clearable defaultValue="initial" label="Input" name="input" /><TextField clearable defaultValue="code" label="Readonly" name="readonly" readOnly /><TextField clearable defaultValue="no" disabled label="Disabled" name="disabled" /><button type="reset">Reset</button></form>);
    expect(screen.queryByRole('button', { name: 'Readonly 지우기' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Disabled 지우기' })).not.toBeInTheDocument();
    const input = screen.getByRole('textbox', { name: 'Input' });
    await user.clear(input);
    await user.type(input, 'edited');
    expect(Object.fromEntries(new FormData(screen.getByRole('form') as HTMLFormElement))).toEqual({ input: 'edited', readonly: 'code' });
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    await waitFor(() => expect(input).toHaveValue('initial'));
  });

  it('renders and clears a real textarea with native multiline form data', async () => {
    const user = userEvent.setup();
    render(<form aria-label="memo"><TextField clearable defaultValue="one" label="Memo" name="memo" rows={3} type="textarea" /></form>);
    const textarea = screen.getByRole('textbox');
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveAttribute('rows', '3');
    await user.type(textarea, '{Enter}two');
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('memo')).toBe('one\ntwo');
    await user.click(screen.getByRole('button', { name: 'Memo 지우기' }));
    expect(textarea).toHaveValue('');
  });

  it('uses native number constraints and exposes validation as an associated error', async () => {
    const user = userEvent.setup();
    render(<TextField errorText="1~10을 입력하세요." label="Quantity" min={1} max={10} required size="small" step={1} type="number" />);
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    fireEvent.invalid(input);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('1~10을 입력하세요.');
    await user.type(input, '11');
    expect(input.validity.rangeOverflow).toBe(true);
    await user.clear(input);
    await user.type(input, '2');
    expect(input.validity.valid).toBe(true);
    expect(input).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('keeps trailing actions named, non-submitting, and disabled with the field', async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    const { rerender } = render(<TextField label="Password" readOnly trailingAction={{ icon: 'eye', label: 'Show', onClick: action }} />);
    const button = screen.getByRole('button', { name: 'Show' });
    expect(button).toHaveAttribute('type', 'button');
    await user.click(button);
    expect(action).toHaveBeenCalledTimes(1);
    rerender(<TextField disabled label="Password" trailingAction={{ icon: 'eye', label: 'Show', onClick: action }} />);
    await user.click(screen.getByRole('button', { name: 'Show' }));
    expect(action).toHaveBeenCalledTimes(1);
  });
});
