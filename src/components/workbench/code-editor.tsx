'use client';

import { useEffect, useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView, keymap } from '@codemirror/view';
import { Prec } from '@codemirror/state';

type Props = {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  tsx: boolean;
  onRun?: () => void;
  label: string;
};

function usePrefersDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => {
      const forced = document.documentElement.dataset.theme;
      setDark(forced ? forced === 'dark' : mq.matches);
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return dark;
}

export default function CodeEditor({ value, onChange, readOnly, tsx, onRun, label }: Props) {
  const dark = usePrefersDark();
  const extensions = useMemo(
    () => [
      javascript({ typescript: true, jsx: tsx }),
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({ 'aria-label': label }),
      Prec.highest(
        keymap.of([
          {
            key: 'Mod-Enter',
            run: () => {
              onRun?.();
              return true;
            },
          },
        ]),
      ),
    ],
    [tsx, onRun, label],
  );
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      editable={!readOnly}
      theme={dark ? 'dark' : 'light'}
      extensions={extensions}
      minHeight="220px"
      maxHeight="60vh"
      basicSetup={{ foldGutter: false, highlightActiveLine: !readOnly, autocompletion: !readOnly }}
    />
  );
}
