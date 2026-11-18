'use client';

import { useEffect, useState } from 'react';
import { FOCUS_AREAS, MOODS, STORAGE_KEY, isLifePreferences, type LifePreferences } from '@/lib/life-dna';

function toggle(items: string[], item: string) {
  return items.includes(item) ? items.filter((value) => value !== item) : [...items, item];
}

export default function Onboarding() {
  const [name, setName] = useState('');
  const [focus, setFocus] = useState<string[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [goal, setGoal] = useState('');
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const value: unknown = JSON.parse(raw);
        if (isLifePreferences(value)) {
          setName(value.name);
          setFocus(value.focusAreas);
          setMoods(value.moods);
          setGoal(value.goal);
          setSaved(true);
        }
      }
    } catch {}
    setReady(true);
  }, []);

  function save() {
    const preferences: LifePreferences = {
      name: name.trim().slice(0, 80),
      focusAreas: focus,
      moods,
      goal: goal.trim().slice(0, 500),
      updatedAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      setSaved(true);
      window.location.assign('/dna');
    } catch {
      setSaved(false);
      window.alert('Your browser could not save your preferences. Please enable local storage and try again.');
    }
  }

  const valid = focus.length > 0 && moods.length > 0;

  return (
    <main className="page-frame page-frame--narrow">
      <h1 className="page-title">Tell us what inspires you.</h1>
      <p className="muted-text mt-4 mb-7">Choose what matters to you. Your answers are saved only in this browser for this prototype—not sent to a server.</p>
      <div className="surface-card space-y-7 p-5 sm:p-8">
        <div>
          <label className="card-title block" htmlFor="name">What should we call you? <span className="muted-text text-sm font-normal">(optional)</span></label>
          <input id="name" maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Your first name" className="field-control mt-2" />
        </div>
        <fieldset>
          <legend className="card-title">What would you like to explore?</legend>
          <p className="muted-text mt-1 mb-3 text-sm">Select at least one.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {FOCUS_AREAS.map((option) => (
              <button
                type="button"
                key={option}
                aria-pressed={focus.includes(option)}
                onClick={() => { setFocus((items) => toggle(items, option)); setSaved(false); }}
                className="option-control"
              >
                {focus.includes(option) && <span aria-hidden="true">✓ </span>}{option}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="card-title">Which aesthetics feel like you?</legend>
          <p className="muted-text mt-1 mb-3 text-sm">Select one or more. You can change this later.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {MOODS.map((option) => (
              <button
                type="button"
                key={option}
                aria-pressed={moods.includes(option)}
                onClick={() => { setMoods((items) => toggle(items, option)); setSaved(false); }}
                className="option-control"
              >
                {moods.includes(option) && <span aria-hidden="true">✓ </span>}{option}
              </button>
            ))}
          </div>
        </fieldset>
        <div>
          <label className="card-title block" htmlFor="goal">One thing you&apos;d love to make happen <span className="muted-text text-sm font-normal">(optional)</span></label>
          <textarea
            id="goal"
            rows={3}
            maxLength={500}
            value={goal}
            onChange={(event) => { setGoal(event.target.value); setSaved(false); }}
            placeholder="e.g. Plan a safari honeymoon, refresh my wardrobe, cook more on Sundays..."
            className="field-control mt-2"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" disabled={!ready || !valid} onClick={save} className="primary-action">Create my Life DNA →</button>
          {saved && <span className="muted-text text-sm">Your previous answers are loaded.</span>}
        </div>
      </div>
      <p className="muted-text mt-5 text-xs">This is a preference-based profile, not AI or Pinterest analysis. No account or database is connected.</p>
    </main>
  );
}
