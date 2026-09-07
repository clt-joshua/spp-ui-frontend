import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { AutoComplete } from '../../src/ui';

afterEach(cleanup);
describe('AutoComplete free-text form contract', () => {
  it('associates label, required and error description with the editable combobox', () => {
    render(<AutoComplete label="도시" options={[]} required error errorText="오류 설명" size="small" />);
    const input = screen.getByRole('combobox', { name: '도시' });
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('오류 설명');
  });
  it('submits free text, includes readonly, excludes disabled and restores uncontrolled reset', async () => {
    const user = userEvent.setup();
    const { container } = render(<form>
      <AutoComplete label="도시" name="city" defaultValue="서울" options={[]} />
      <AutoComplete label="읽기 전용" name="code" defaultValue="fixed" options={[]} readOnly />
      <AutoComplete label="비활성" name="disabled" defaultValue="excluded" options={[]} disabled />
    </form>);
    const input = screen.getByRole('combobox', { name: '도시' });
    await user.clear(input);
    await user.type(input, 'custom');
    const form = container.querySelector('form')!;
    expect(Object.fromEntries(new FormData(form))).toEqual({ city: 'custom', code: 'fixed' });
    fireEvent.reset(form);
    await waitFor(() => expect(input).toHaveValue('서울'));
    expect(screen.getByRole('combobox', { name: '읽기 전용' })).toHaveAttribute('readonly', '');
    expect(screen.getByRole('button', { name: '읽기 전용 제안 목록' })).toBeDisabled();
  });
});
