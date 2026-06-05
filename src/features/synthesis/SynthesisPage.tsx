import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { useGenerationStore } from '@/store/useGenerationStore';
import { useToastStore } from '@/store/useToastStore';
import { ModelLanguageSection } from './components/ModelLanguageSection';
import { VoiceSlotSection } from './components/VoiceSlotSection';
import { ParamsSection } from './components/ParamsSection';
import { InputArea } from './components/InputArea';
import { SaveDirBar } from './components/SaveDirBar';
import { WordTable } from './components/WordTable';
import { BottomBar } from './components/BottomBar';
import { useGeneration } from './hooks/useGeneration';
import styles from './SynthesisPage.module.css';

export function SynthesisPage() {
  const isGenerating = useGenerationStore((s) => s.isGenerating);
  const entries = useGenerationStore((s) => s.entries);
  const push = useToastStore((s) => s.push);
  const { start, stop } = useGeneration();

  useKeyboardShortcut(
    { key: 'Enter', mod: true },
    () => {
      if (isGenerating) return;
      if (entries.length === 0) {
        push('请先导入文本', 'warning');
        return;
      }
      void start();
    },
  );

  useKeyboardShortcut(
    { key: 'Escape' },
    () => {
      if (isGenerating) stop();
    },
  );

  return (
    <div className={styles.layout}>
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <ModelLanguageSection />
          <VoiceSlotSection />
          <ParamsSection />
        </aside>
        <main className={styles.main}>
          <InputArea />
          <SaveDirBar />
          <WordTable />
        </main>
      </div>
      <BottomBar />
    </div>
  );
}
