import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { AppLayout } from '../layouts/AppLayout';
import { fetchJson, postJson } from '../lib/http';
import type { SharedPageProps } from '../types/shared';

type GameMode = 'time' | 'words';

type WordItem = {
  word: string;
};

type TypedWord = {
  target: string;
  typed: string;
};

type TypingResult = {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  time: number;
  characters: {
    correct: number;
    incorrect: number;
    extra: number;
    missed: number;
  };
};

const timeAmounts = [15, 30, 60, 120];
const wordAmounts = [10, 25, 50, 100];

function decorateWord(originalWord: string, punctuation: boolean, numbers: boolean): string {
  let word = originalWord;

  if (numbers && Math.random() < 0.1) {
    word = String(Math.floor(Math.random() * 1000));
  }

  if (punctuation && Math.random() < 0.3) {
    const suffixes = [',', '.', '?', '!', ';', ':'];
    word += suffixes[Math.floor(Math.random() * suffixes.length)];
  }

  return word;
}

function compareWords(target: string, typed: string) {
  let correct = 0;
  let incorrect = 0;

  const sharedLength = Math.min(target.length, typed.length);

  for (let index = 0; index < sharedLength; index += 1) {
    if (target[index] === typed[index]) {
      correct += 1;
    } else {
      incorrect += 1;
    }
  }

  const extra = Math.max(typed.length - target.length, 0);
  const missed = Math.max(target.length - typed.length, 0);

  return { correct, incorrect, extra, missed };
}

function calculateResult(mode: GameMode, amount: number, startedAt: number, typedWords: TypedWord[]): TypingResult {
  const elapsed = mode === 'time' ? amount : Math.max((Date.now() - startedAt) / 1000, 1);
  const wordsPerMinuteRatio = 60 / elapsed;

  const exactWordCount = typedWords.filter(({ target, typed }) => target === typed).length;
  const typedChars = typedWords.reduce((sum, entry) => sum + entry.typed.length, 0);

  const characters = typedWords.reduce(
    (sum, entry) => {
      const score = compareWords(entry.target, entry.typed);

      return {
        correct: sum.correct + score.correct,
        incorrect: sum.incorrect + score.incorrect,
        extra: sum.extra + score.extra,
        missed: sum.missed + score.missed,
      };
    },
    { correct: 0, incorrect: 0, extra: 0, missed: 0 },
  );

  const rawWpm = typedChars > 0 ? (typedChars / 5) * wordsPerMinuteRatio : 0;
  const wpm = exactWordCount * wordsPerMinuteRatio;
  const accuracy = typedChars > 0 ? (characters.correct / typedChars) * 100 : 0;

  return {
    wpm,
    rawWpm,
    accuracy,
    time: elapsed,
    characters,
  };
}

export default function HomePage() {
  const { auth } = usePage<SharedPageProps>().props;

  const [mode, setMode] = useState<GameMode>('words');
  const [amount, setAmount] = useState(10);
  const [punctuation, setPunctuation] = useState(false);
  const [numbers, setNumbers] = useState(false);

  const [words, setWords] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedWords, setTypedWords] = useState<TypedWord[]>([]);

  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [timerLeft, setTimerLeft] = useState(amount);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [saveState, setSaveState] = useState<string>('');
  const [networkStatus, setNetworkStatus] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const selectedAmounts = mode === 'time' ? timeAmounts : wordAmounts;

  const resetGame = useCallback(async () => {
    setLoading(true);
    setFinished(false);
    setResult(null);
    setInputValue('');
    setCurrentWordIndex(0);
    setTypedWords([]);
    setStartedAt(null);
    setTimerLeft(mode === 'time' ? amount : 0);
    setSaveState('');
    setNetworkStatus('');

    const targetCount = mode === 'time' ? 120 : amount;

    try {
      const response = await fetchJson<WordItem[]>(`/home/words?amount=${targetCount}`);
      setWords(response.map((entry) => decorateWord(entry.word, punctuation, numbers)));
    } catch {
      setWords([]);
      setNetworkStatus('Unable to load words right now. Please verify the backend is running, then retry.');
    } finally {
      setLoading(false);
    }

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [amount, mode, numbers, punctuation]);

  useEffect(() => {
    void resetGame();
  }, [resetGame]);

  const finishGame = useCallback(async (
    customTypedWords?: TypedWord[],
    customStartedAt?: number | null,
  ) => {
    if (finished) {
      return;
    }

    const effectiveStartedAt = customStartedAt ?? startedAt;

    if (!effectiveStartedAt) {
      return;
    }

    const finalTypedWords = customTypedWords ?? typedWords;
    const metrics = calculateResult(mode, amount, effectiveStartedAt, finalTypedWords);

    setResult(metrics);
    setFinished(true);

    if (!auth.user) {
      return;
    }

    try {
      setSaveState('Saving result...');
      await postJson<{ status: string }>('/home/typing', {
        wpm: Math.round(metrics.wpm),
        accuracy: Number(metrics.accuracy.toFixed(2)),
        mode,
        amount,
        punctuation,
        numbers,
      });
      setSaveState('Result saved.');
    } catch {
      setSaveState('Unable to save result right now.');
    }
  }, [amount, auth.user, finished, mode, numbers, punctuation, startedAt, typedWords]);

  useEffect(() => {
    if (mode !== 'time' || !startedAt || finished) {
      return;
    }

    const interval = window.setInterval(() => {
      setTimerLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(interval);
          void finishGame();
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [finishGame, finished, mode, startedAt]);

  useEffect(() => {
    if (mode !== 'time' || finished || loadingMore) {
      return;
    }

    const remaining = words.length - currentWordIndex;

    if (remaining > 20) {
      return;
    }

    const loadMoreWords = async () => {
      setLoadingMore(true);
      try {
        const response = await fetchJson<WordItem[]>('/home/words?amount=60');
        setWords((previous) => [
          ...previous,
          ...response.map((entry) => decorateWord(entry.word, punctuation, numbers)),
        ]);
      } catch {
        setNetworkStatus('Unable to load additional words. You can continue typing or reset to retry.');
      } finally {
        setLoadingMore(false);
      }
    };

    void loadMoreWords();
  }, [currentWordIndex, finished, loadingMore, mode, numbers, punctuation, words.length]);

  const processCurrentWord = useCallback(async () => {
    if (finished || loading || words.length === 0) {
      return;
    }

    const currentTarget = words[currentWordIndex] ?? '';
    if (!currentTarget) {
      return;
    }

    const trimmed = inputValue.trim();
    const startedAtValue = startedAt ?? Date.now();

    if (!startedAt) {
      setStartedAt(startedAtValue);
    }

    const nextTypedWords = [...typedWords, { target: currentTarget, typed: trimmed }];

    setTypedWords(nextTypedWords);
    setCurrentWordIndex((previous) => previous + 1);
    setInputValue('');

    if (mode === 'words' && nextTypedWords.length >= amount) {
      await finishGame(nextTypedWords, startedAtValue);
    }
  }, [amount, currentWordIndex, finishGame, finished, inputValue, loading, mode, startedAt, typedWords, words]);

  const progressLabel = useMemo(() => {
    if (mode === 'time') {
      return `${timerLeft}s`;
    }

    return `${Math.min(currentWordIndex, amount)}/${amount}`;
  }, [amount, currentWordIndex, mode, timerLeft]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <AppLayout title="home" description="Type words, track speed, and save sessions to your account.">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-emerald-400">
            {progressLabel}
          </div>

          <button
            type="button"
            onClick={() => {
              setPunctuation((previous) => !previous);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              punctuation ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Punctuation
          </button>

          <button
            type="button"
            onClick={() => {
              setNumbers((previous) => !previous);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              numbers ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Numbers
          </button>

          <div className="mx-1 hidden h-6 w-px bg-slate-700 sm:block" />

          <button
            type="button"
            onClick={() => {
              setMode('time');
              setAmount(15);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === 'time' ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Time
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('words');
              setAmount(10);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === 'words' ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Words
          </button>

          <div className="flex flex-wrap gap-2">
            {selectedAmounts.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setAmount(option)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  amount === option ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              void resetGame();
            }}
            className="ml-auto rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
          >
            Reset
          </button>
        </div>

        {networkStatus ? (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            {networkStatus}
          </p>
        ) : null}

        {!finished ? (
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-5" onClick={focusInput}>
            <div className="min-h-40 rounded-xl border border-slate-800 bg-slate-950/70 p-4 font-mono text-lg leading-8">
              {loading ? (
                <p className="text-slate-500">Loading words…</p>
              ) : (
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                  {words.map((word, index) => {
                    const typedWord = typedWords[index];
                    const isCurrent = index === currentWordIndex;
                    const isDone = index < currentWordIndex;
                    const isCorrect = typedWord ? typedWord.typed === typedWord.target : false;

                    return (
                      <span
                        key={`${word}-${index}`}
                        className={[
                          'rounded px-1.5 py-0.5 transition',
                          isCurrent ? 'bg-slate-700 text-slate-50' : '',
                          isDone && isCorrect ? 'text-emerald-400' : '',
                          isDone && !isCorrect ? 'text-rose-400' : '',
                          !isDone && !isCurrent ? 'text-slate-500' : '',
                        ].join(' ')}
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <input
              ref={inputRef}
              value={inputValue}
              onChange={(event) => {
                if (!startedAt) {
                  setStartedAt(Date.now());
                }
                setInputValue(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Tab') {
                  event.preventDefault();
                  void resetGame();
                  return;
                }

                if (event.key === ' ') {
                  event.preventDefault();
                  void processCurrentWord();
                }
              }}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              disabled={loading}
              placeholder="Type the highlighted word and press Space"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base outline-none transition focus:border-emerald-400"
            />

            <p className="text-xs text-slate-400">
              Press <kbd className="rounded border border-slate-700 px-1.5 py-0.5">Tab</kbd> to restart instantly.
            </p>
          </div>
        ) : (
          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold">Result</h2>

            {result ? (
              <div className="grid gap-3 sm:grid-cols-5">
                <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-center">
                  <p className="text-xs uppercase tracking-wide text-slate-400">WPM</p>
                  <p className="text-2xl font-semibold text-emerald-400">{Math.round(result.wpm)}</p>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-center">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Raw WPM</p>
                  <p className="text-2xl font-semibold">{Math.round(result.rawWpm)}</p>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-center">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Accuracy</p>
                  <p className="text-2xl font-semibold">{Math.round(result.accuracy)}%</p>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-center">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Time</p>
                  <p className="text-2xl font-semibold">{result.time.toFixed(1)}s</p>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-center">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Chars</p>
                  <p className="text-sm font-medium text-slate-200">
                    {result.characters.correct}/{result.characters.incorrect}/{result.characters.extra}/{result.characters.missed}
                  </p>
                </div>
              </div>
            ) : null}

            {saveState ? <p className="text-sm text-slate-300">{saveState}</p> : null}

            <button
              type="button"
              onClick={() => {
                void resetGame();
              }}
              className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Start New Test
            </button>
          </div>
        )}
      </section>
    </AppLayout>
  );
}
