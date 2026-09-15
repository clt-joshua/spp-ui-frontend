import { useState } from 'react';
import { IconButton, MaterialIcon, type IconButtonSize, type IconButtonVariant } from '@/ui';
import { SampleGroup } from './SampleGroup';
import styles from '../ComponentGalleryPage.module.css';

const iconButtonSizes: IconButtonSize[] = ['large', 'medium', 'small'];
const iconButtonVariants: IconButtonVariant[] = [
  'standard',
  'filled',
  'tonal',
  'outlined',
  'error',
];

export function IconButtonGallery() {
  const [favoriteSelected, setFavoriteSelected] = useState(false);

  return (
    <>
      {iconButtonSizes.map((size) => (
        <SampleGroup key={size} title={'IconButton · ' + size}>
          <p className={styles.matrixHint}>
            Action 샘플에 hover, Tab focus, Space/Enter press를 적용해 transient state를 확인합니다.
          </p>
          <div className={styles.buttonMatrixViewport}>
            <table className={`${styles.buttonMatrix} ${styles.iconButtonMatrix}`}>
              <thead>
                <tr>
                  <th scope="col">Style</th>
                  <th scope="col">Action</th>
                  <th scope="col">Toggle</th>
                  <th scope="col">Selected</th>
                  <th scope="col">Disabled</th>
                </tr>
              </thead>
              <tbody>
                {iconButtonVariants.map((variant) => (
                  <tr key={variant}>
                    <th scope="row">{variant}</th>
                    <td>
                      <IconButton
                        aria-label={[size, variant, 'action'].join(' ')}
                        icon={<MaterialIcon name="keyboard_command_key" />}
                        size={size}
                        variant={variant}
                      />
                    </td>
                    <td>
                      <IconButton
                        aria-label={[size, variant, 'add favorite'].join(' ')}
                        icon={<MaterialIcon name="favorite_border" />}
                        onClick={() => setFavoriteSelected((current) => !current)}
                        selected={favoriteSelected}
                        selectedAriaLabel={[size, variant, 'remove favorite'].join(' ')}
                        selectedIcon={<MaterialIcon name="favorite" />}
                        size={size}
                        variant={variant}
                      />
                    </td>
                    <td>
                      <IconButton
                        aria-label={[size, variant, 'unselected bookmark'].join(' ')}
                        icon={<MaterialIcon name="bookmark_border" />}
                        selected
                        selectedAriaLabel={[size, variant, 'selected bookmark'].join(' ')}
                        selectedIcon={<MaterialIcon name="bookmark" />}
                        size={size}
                        variant={variant}
                      />
                    </td>
                    <td>
                      <IconButton
                        aria-label={[size, variant, 'disabled'].join(' ')}
                        disabled
                        icon={<MaterialIcon name="block" />}
                        size={size}
                        variant={variant}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SampleGroup>
      ))}
    </>
  );
}
