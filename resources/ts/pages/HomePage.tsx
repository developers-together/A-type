import { useEffect, useMemo, useRef, useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useToast } from '../context/ToastContext';
import { firstErrorMessage, getJson, postJson } from '../lib/http';
import type { HomeData, SharedPayload } from '../types/app';

type HomePageProps = {
  shared: SharedPayload;
  data: HomeData;
};

type WordItem = { word: string };

type TypingResult = {
  wpm: number;
  accuracy: number;
  elapsedSeconds: number;
  typedWords: number;
};

const TIME_OPTIONS = [15, 30, 60, 120] as const;
const WORD_OPTIONS = [10, 25, 50, 100] as const;

export function HomePage({ shared, data }: HomePageProps) {
  const { pushToast } = useToast();

  const [mode, setMode] = useState<'time' | 'words'>(data.defaults.mode || 'words');
  const [numbers, setNumbers] = useState(false);
  const [punctuation, setPunctuation] = useState(false);
  const [amount, setAmount] = useState<number>(data.defaults.amount || 10);

  const [words, setWords] = useState<string[]>([]);
  const [typed, setTyped] = useState('');
  const [state, setState] = useState<'ready' | 'running' | 'finished'>('ready');
  const [timeLeft, setTimeLeft] = useState<number>(mode === 'time' ? amount : 0);
  const [result, setResult] = useState<TypingResult | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const typedRef = useRef('');

  const options = mode === 'time' ? TIME_OPTIONS : WORD_OPTIONS;

  const fullText = useMemo(() => words.join(' '), [words]);

  async function loadWords(targetAmount: number): Promise<void> {
    const response = await getJson<WordItem[]>(`/home/words?amount=${targetAmount}`);

    if (!response.ok || !Array.isArray(response.data)) {
      pushToast('Unable to load words for this test.', 'error');
      return;
    }

    setWords(response.data.map((item) => item.word));
    setTyped('');
    typedRef.current = '';
    setState('ready');
    setResult(null);
    setTimeLeft(mode === 'time' ? targetAmount : 0);
    startTimeRef.current = null;
  }

  useEffect(() => {
    const fallbackAmount = mode === 'time' ? 15 : 10;
    const normalizedAmount = options.includes(amount as never) ? amount : fallbackAmount;

    if (normalizedAmount !== amount) {
      setAmount(normalizedAmount);
      return;
    }

    void loadWords(normalizedAmount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, amount]);

  useEffect(() => {
    if (state !== 'running' || mode !== 'time') return;

    const interval = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          finishTest('time-expired', typedRef.current);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, mode]);

  function resetTest(): void {
    void loadWords(amount);
  }

  function countCorrectCharacters(input: string, source: string): number {
    const max = Math.min(input.length, source.length);
    let correct = 0;

    for (let index = 0; index < max; index += 1) {
      if (input[index] === source[index]) {
        correct += 1;
      }
    }

    return correct;
  }

  async function saveTypingStats(payload: TypingResult): Promise<void> {
    if (!shared.auth) return;

    const response = await postJson<{ status?: string; message?: string; errors?: Record<string, string[]> }>('/home/typing', {
      wpm: payload.wpm,
      accuracy: payload.accuracy,
      mode,
      amount,
      punctuation,
      numbers,
    });

    if (!response.ok) {
      pushToast(firstErrorMessage(response.data, 'Unable to save typing session.'), 'error');
    }
  }

  function computeResult(input: string): TypingResult {
    const elapsedSeconds =
      mode === 'time'
        ? amount - timeLeft
        : Math.max(1, Math.round((Date.now() - (startTimeRef.current ?? Date.now())) / 1000));

    const typedWords = input.trim() ? input.trim().split(/\s+/).length : 0;
    const correctChars = countCorrectCharacters(input, fullText);
    const accuracy = input.length === 0 ? 0 : Number(((correctChars / input.length) * 100).toFixed(1));
    const wpm = elapsedSeconds === 0 ? 0 : Math.max(0, Math.round(typedWords / (elapsedSeconds / 60)));

    return {
      wpm,
      accuracy,
      elapsedSeconds,
      typedWords,
    };
  }

  function finishTest(reason: 'time-expired' | 'words-finished', finalInput: string): void {
    if (state === 'finished') return;

    const computed = computeResult(finalInput);
    setResult(computed);
    setState('finished');

    if (reason === 'words-finished') {
      pushToast('Words test completed.', 'success');
    }

    void saveTypingStats(computed);
  }

  function handleTypingChange(value: string): void {
    if (state === 'finished') return;

    if (state === 'ready') {
      setState('running');
      startTimeRef.current = Date.now();
    }

    setTyped(value);
    typedRef.current = value;

    if (mode === 'words') {
      const typedWordsCount = value.trim() ? value.trim().split(/\s+/).length : 0;
      if (typedWordsCount >= amount) {
        finishTest('words-finished', value);
      }
    }
  }

  return (
    <AppLayout shared={shared} currentPage="home">
      <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="atype-card grid gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl border border-[rgb(var(--surface-strong)/0.7)] bg-[rgb(var(--surface-soft))] p-1">
              <button type="button" className={`atype-btn ${mode === 'words' ? 'bg-[rgb(var(--surface))]' : 'text-[rgb(var(--text-soft))]'}`} onClick={() => setMode('words')}>
                Words
              </button>
              <button type="button" className={`atype-btn ${mode === 'time' ? 'bg-[rgb(var(--surface))]' : 'text-[rgb(var(--text-soft))]'}`} onClick={() => setMode('time')}>
                Time
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {options.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={value === amount ? 'atype-btn-primary' : 'atype-btn-muted'}
                  onClick={() => setAmount(value)}
                >
                  {mode === 'time' ? `${value}s` : value}
                </button>
              ))}
            </div>

            <button type="button" className={`atype-btn-muted ${numbers ? 'ring-2 ring-[rgb(var(--focus)/0.4)]' : ''}`} onClick={() => setNumbers((current) => !current)}>
              Numbers
            </button>
            <button type="button" className={`atype-btn-muted ${punctuation ? 'ring-2 ring-[rgb(var(--focus)/0.4)]' : ''}`} onClick={() => setPunctuation((current) => !current)}>
              Punctuation
            </button>

            <button type="button" className="atype-btn-muted" onClick={resetTest}>
              Reset
            </button>
          </div>

          <div className="atype-card-soft">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--text-soft))]">Word stream</p>
            <p className="text-lg leading-relaxed tracking-wide text-[rgb(var(--text-soft))]">{fullText || 'Loading words...'}</p>
          </div>

          <textarea
            className="atype-input min-h-[150px] resize-y font-mono text-sm"
            placeholder="Start typing here..."
            value={typed}
            onChange={(event) => handleTypingChange(event.target.value)}
            disabled={state === 'finished'}
          />
        </div>

        <aside className="grid gap-3">
          <div className="atype-card">
            <p className="atype-section-title">Session</p>
            <div className="mt-3 grid gap-2 text-sm">
              <p>
                <span className="text-[rgb(var(--text-soft))]">Mode:</span> <span className="font-semibold">{mode}</span>
              </p>
              <p>
                <span className="text-[rgb(var(--text-soft))]">Target:</span>{' '}
                <span className="font-semibold">{mode === 'time' ? `${amount} seconds` : `${amount} words`}</span>
              </p>
              <p>
                <span className="text-[rgb(var(--text-soft))]">Status:</span>{' '}
                <span className="font-semibold">{state}</span>
              </p>
              {mode === 'time' ? (
                <p>
                  <span className="text-[rgb(var(--text-soft))]">Time left:</span> <span className="font-semibold">{timeLeft}s</span>
                </p>
              ) : null}
            </div>
          </div>

          <div className="atype-card">
            <p className="atype-section-title">Result</p>
            {result ? (
              <div className="mt-3 grid gap-2 text-sm">
                <p><span className="text-[rgb(var(--text-soft))]">WPM:</span> <span className="font-bold">{result.wpm}</span></p>
                <p><span className="text-[rgb(var(--text-soft))]">Accuracy:</span> <span className="font-bold">{result.accuracy}%</span></p>
                <p><span className="text-[rgb(var(--text-soft))]">Typed words:</span> <span className="font-bold">{result.typedWords}</span></p>
                <p><span className="text-[rgb(var(--text-soft))]">Elapsed:</span> <span className="font-bold">{result.elapsedSeconds}s</span></p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-[rgb(var(--text-soft))]">Complete a test to view your metrics.</p>
            )}
          </div>
        </aside>
      </section>
    </AppLayout>
  );
}
