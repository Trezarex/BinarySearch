import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useStorage, useMutation } from '@/lib/liveblocks';

export default function CodeEditor({ language }) {
  const editorRef = useRef(null);
  const code = useStorage((root) => root.code) || '';

  const updateCode = useMutation(({ storage }, newCode) => {
    storage.set('code', newCode);
  }, []);

  function handleEditorMount(editor) {
    editorRef.current = editor;
  }

  function handleChange(value) {
    if (value !== undefined) {
      updateCode(value);
    }
  }

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={code}
        onChange={handleChange}
        onMount={handleEditorMount}
        theme="vs-dark"
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
        }}
      />
    </div>
  );
}
