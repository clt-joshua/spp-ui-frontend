import { Button, MaterialIcon, type ButtonSize, type ButtonVariant } from '@/ui';
import { SampleGroup } from './SampleGroup';
import styles from '../ComponentGalleryPage.module.css';

const buttonSizes: ButtonSize[] = ['large', 'medium', 'small'];
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

export function ButtonGallery() {
  return (
    <>
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
    </>
  );
}
