import { FolderOpen, X, FolderTree } from 'lucide-react';
import { GroupCard } from '@/components/GroupCard/GroupCard';
import { Button } from '@/components/Button/Button';
import { useFsApi } from '../hooks/useFsApi';
import styles from './SaveDirBar.module.css';

export function SaveDirBar() {
  const { dirHandle, supported, select, clear } = useFsApi();

  if (!supported) {
    return (
      <GroupCard
        color="yellow"
        icon={<FolderTree size={18} strokeWidth={2} />}
        title="保存目录"
        description="当前浏览器不支持目录直写，生成后可 ZIP 下载"
      >
        <div className={styles.tip}>使用 Chrome / Edge 可开启自动写入</div>
      </GroupCard>
    );
  }

  return (
    <GroupCard
      color="yellow"
      icon={<FolderTree size={18} strokeWidth={2} />}
      title="保存目录"
      description="选中的目录将直接接收生成的音频文件"
    >
      {dirHandle ? (
        <div className={styles.row}>
          <div className={styles.dirInfo}>
            <FolderOpen size={14} />
            <span className={styles.dirName}>{dirHandle.name}</span>
          </div>
          <div className={styles.actions}>
            <Button size="sm" variant="ghost" onClick={select}>
              更换
            </Button>
            <Button size="sm" variant="ghost" onClick={clear}>
              <X size={12} /> 取消
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.row}>
          <div className={styles.tip}>未设置保存目录</div>
          <Button size="sm" variant="secondary" onClick={select}>
            <FolderOpen size={13} /> 选择目录
          </Button>
        </div>
      )}
    </GroupCard>
  );
}
