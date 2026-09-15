import { Dialog, DialogClose } from '@/ui';
import { SampleGroup } from './SampleGroup';
import styles from '../ComponentGalleryPage.module.css';

export function DialogGallery() {
  return (
    <>
      <SampleGroup title="Dialog variants">
        <div className={styles.row}>
          <Dialog
            actions={<><DialogClose variant="text">취소</DialogClose><DialogClose>확인</DialogClose></>}
            description="Escape, backdrop와 action을 통해 닫고 trigger로 focus가 복원되는지 확인합니다."
            title="기본 Dialog"
            trigger="기본 Dialog 열기"
          >
            <p className={styles.dialogCopy}>Dialog content는 현재 Theme의 surface와 typography token을 사용합니다.</p>
          </Dialog>
          <Dialog
            actions={<DialogClose>확인</DialogClose>}
            description="중요한 결정을 사용자에게 확인받는 alertdialog입니다."
            dismissible={false}
            title="Alert Dialog"
            trigger="Alert Dialog 열기"
            variant="alert"
          />
        </div>
      </SampleGroup>
    </>
  );
}
