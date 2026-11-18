'use client';

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import Image from 'next/image';
import { dateKey, describeWeek, makeSundayReminder, startOfWeek, weeklyInspiration } from '@/lib/weekly-dashboard';
import styles from './weekly-dashboard.module.css';

const STORAGE_KEY = 'life-edit-dashboard-v1';
const EMPTY_DASHBOARD: DashboardData = { intentions: {}, notes: {}, tasks: [] };

type Task = { id: string; title: string; done: boolean; scheduledOn?: string; completedOn?: string };
type DashboardData = { intentions: Record<string, string>; notes: Record<string, string>; tasks: Task[] };
type WeekDay = ReturnType<typeof describeWeek>['days'][number];

function readDashboard(): DashboardData {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return EMPTY_DASHBOARD;
  const parsed: Partial<DashboardData> | null = JSON.parse(saved);
  return {
    intentions: parsed?.intentions && typeof parsed.intentions === 'object'
      ? parsed.intentions
      : {},
    notes: parsed?.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
    tasks: Array.isArray(parsed?.tasks) ? parsed.tasks : [],
  };
}

function ChecklistComposer({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim());
    setTitle('');
  }

  return (
    <details className={styles.checklistComposer}>
      <summary className={styles.textButton}>
        <span aria-hidden="true">+</span> Add checklist item
      </summary>
      <form className={styles.taskForm} onSubmit={submit}>
        <label className="sr-only" htmlFor="new-task">New checklist item</label>
        <input
          id="new-task"
          className="field-control"
          placeholder="Checklist item…"
          maxLength={160}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <button className="primary-action" disabled={!title.trim()}>Add</button>
      </form>
    </details>
  );
}

function IntentionForm({ saved, suggestion, onSave }: {
  saved: string;
  suggestion: string;
  onSave: (intention: string) => boolean;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const input = useRef<HTMLTextAreaElement>(null);
  const value = draft ?? saved;

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const intention = value.trim();
    if (onSave(intention)) {
      setMessage(intention ? 'Intention saved.' : 'Intention cleared.');
      setDraft(null);
    } else {
      setMessage('Saved for this visit. Browser storage is unavailable.');
    }
  }

  return (
    <form className={styles.intentionForm} onSubmit={save}>
      <label className="sr-only" htmlFor="weekly-intention">Weekly intention</label>
      <textarea
        id="weekly-intention"
        className="field-control"
        ref={input}
        value={value}
        rows={3}
        maxLength={280}
        placeholder="This week, I want to make time for…"
        onChange={(event) => {
          setDraft(event.target.value);
          setMessage('');
        }}
      />
      <div className={styles.actions}>
        <button className="primary-action" disabled={value.trim() === saved}>
          Save intention
        </button>
        <button type="button" className={styles.textButton} onClick={() => {
          setDraft(suggestion);
          setMessage('');
          input.current?.focus();
        }}>
          Use this inspiration
        </button>
        <span className={styles.status} role="status">{message}</span>
      </div>
    </form>
  );
}

function DayCards({ days, today, selected, onSelect }: {
  days: WeekDay[];
  today: string;
  selected: string;
  onSelect: (day: string) => void;
}) {
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let target: number;
    switch (event.key) {
      case 'ArrowLeft': target = (index - 1 + days.length) % days.length; break;
      case 'ArrowRight': target = (index + 1) % days.length; break;
      case 'Home': target = 0; break;
      case 'End': target = days.length - 1; break;
      default: return;
    }
    event.preventDefault();
    onSelect(days[target].key);
    document.getElementById(`day-${days[target].key}`)?.focus();
  }

  return (
    <div className={styles.dayCards} role="tablist" aria-label="Days of this week">
      {days.map((day, index) => (
        <button
          key={day.key}
          id={`day-${day.key}`}
          className={styles.dayCard}
          role="tab"
          type="button"
          aria-label={day.label}
          aria-current={day.key === today ? 'date' : undefined}
          aria-selected={day.key === selected}
          aria-controls="daily-tasks"
          tabIndex={day.key === selected ? 0 : -1}
          onClick={() => onSelect(day.key)}
          onKeyDown={(event) => navigate(event, index)}
        >
          <span className={styles.longDay}>{day.name}</span>
          <span className={styles.shortDay}>{day.name.slice(0, 3)}</span>
          <span className={styles.dayNumber}>{day.dayNumber}</span>
        </button>
      ))}
    </div>
  );
}

export function WeeklyDashboard({ children }: { children: ReactNode }) {
  const [date, setDate] = useState<Date | null>(null);
  const [selected, setSelected] = useState('');
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [reminderStatus, setReminderStatus] = useState('');
  const [storageUnavailable, setStorageUnavailable] = useState(false);

  useEffect(() => {
    function checkDate() {
      const next = new Date();
      setDate((current) => current && dateKey(current) === dateKey(next) ? current : next);
    }

    function refreshData() {
      try {
        setDashboard(readDashboard());
      } catch {
        setStorageUnavailable(true);
      }
    }

    function syncStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY || event.key === null) refreshData();
    }

    checkDate();
    refreshData();
    const interval = window.setInterval(checkDate, 30_000);
    window.addEventListener('focus', checkDate);
    window.addEventListener('storage', syncStorage);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', checkDate);
      window.removeEventListener('storage', syncStorage);
    };
  }, []);

  const week = date ? describeWeek(startOfWeek(date)) : null;
  const today = date ? dateKey(date) : '';
  const selectedDay = week?.days.find((day) => day.key === selected)?.key ?? today;

  function updateDashboard(update: (current: DashboardData) => DashboardData) {
    let next: DashboardData | undefined;
    try {
      next = update(storageUnavailable ? dashboard : readDashboard());
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setDashboard(next);
      setStorageUnavailable(false);
      return true;
    } catch {
      setDashboard(next ?? update(dashboard));
      setStorageUnavailable(true);
      return false;
    }
  }

  function updateNote(note: string) {
    updateDashboard((current) => {
      const notes = { ...current.notes };
      if (note) notes[selectedDay] = note;
      else delete notes[selectedDay];
      return { ...current, notes };
    });
  }

  function addTask(title: string) {
    const task = { id: window.crypto.randomUUID(), title, done: false, scheduledOn: selectedDay };
    updateDashboard((current) => ({ ...current, tasks: [...current.tasks, task] }));
  }

  function downloadReminder() {
    const file = new Blob([makeSundayReminder(new Date())], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'life-edit-sunday-reminder.ics';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    setReminderStatus('Open the downloaded file in your calendar and check that an alert is enabled.');
  }

  const inspiration = week?.inspiration ?? weeklyInspiration[0];
  const dayTasks = dashboard.tasks.filter((task) => {
    const scheduled = task.scheduledOn ?? today;
    return scheduled === selectedDay || task.completedOn === selectedDay ||
      (!task.done && scheduled < selectedDay);
  });
  const completed = dayTasks.filter((task) => task.done).length;

  return (
    <main className="page-frame">
      <div className={styles.heading}>
        <h1 className="page-title">This week</h1>
        <time dateTime={week?.key}>{week?.label}</time>
      </div>

      {week && (
        <>
          <DayCards
            days={week.days}
            today={today}
            selected={selectedDay}
            onSelect={(day) => setSelected(day === today ? '' : day)}
          />
          <section
            key={selectedDay}
            id="daily-tasks"
            className={`surface-card ${styles.panel}`}
            role="tabpanel"
            aria-labelledby={`day-${selectedDay}`}
          >
            <div className={styles.tasksHeading}>
              <h2 id="tasks-heading" className="section-title">To-do list</h2>
              {dayTasks.length > 0 && <p role="status">{completed} of {dayTasks.length} done</p>}
            </div>
            <label className="sr-only" htmlFor="daily-note">Daily to-do notes</label>
            <textarea
              id="daily-note"
              className={styles.notesEditor}
              value={dashboard.notes[selectedDay] ?? ''}
              onChange={(event) => updateNote(event.target.value)}
              placeholder="Start typing…"
              rows={4}
            />
            {dayTasks.length > 0 && (
              <ul className={styles.tasks}>
                {dayTasks.map((task) => (
                  <li key={task.id}>
                    <label className={task.done ? styles.completedTask : undefined}>
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={(event) => {
                          const done = event.target.checked;
                          updateDashboard((current) => ({
                            ...current,
                            tasks: current.tasks.map((item) => item.id === task.id ? {
                              ...item,
                              scheduledOn: item.scheduledOn ?? today,
                              done,
                              completedOn: done ? selectedDay : undefined,
                            } : item),
                          }));
                        }}
                      />
                      <span>{task.title}</span>
                    </label>
                    <button
                      type="button"
                      aria-label={`Remove task: ${task.title}`}
                      className={styles.removeButton}
                      onClick={() => updateDashboard((current) => ({
                        ...current,
                        tasks: current.tasks.filter((item) => item.id !== task.id),
                      }))}
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <ChecklistComposer onAdd={addTask} />
          </section>
        </>
      )}

      <div className={`surface-card ${styles.weeklyRitual}`}>
        <section className={styles.feature} aria-labelledby="weekly-inspiration-heading">
          <div className={styles.featureCopy}>
            <p className={styles.featureLabel}>Weekly inspiration <span>Demo</span></p>
            <h2 id="weekly-inspiration-heading">{inspiration.title}</h2>
            <p>{inspiration.description}</p>
            <a href="#weekly-edit" className={styles.featureLink}>See the Weekly Edit <span aria-hidden="true">↓</span></a>
          </div>
          <div className={styles.featureImage}>
            <Image
              src="/weekly-inspiration.webp"
              alt="Coffee and an open notebook on a sunlit table"
              fill
              priority
              sizes="(max-width: 460px) 100vw, (max-width: 680px) 40vw, (max-width: 1200px) 22vw, 250px"
            />
          </div>
        </section>
        <section className={styles.intentionPanel} aria-labelledby="intention-heading">
          <h2 id="intention-heading" className="section-title">Weekly intention</h2>
          <p className={styles.panelDescription}>What’s one thing you want to make space for this week?</p>
          {week && (
            <IntentionForm
              key={week.key}
              saved={dashboard.intentions[week.key] ?? ''}
              suggestion={inspiration.title}
              onSave={(intention) => updateDashboard((current) => {
                const intentions = { ...current.intentions };
                if (intention) intentions[week.key] = intention;
                else delete intentions[week.key];
                return { ...current, intentions };
              })}
            />
          )}
          <div className={styles.reminder}>
            <div>
              <h3>Sunday reminder</h3>
              <p>Every Sunday at 9:00 AM in your calendar.</p>
            </div>
            <button type="button" className={styles.textButton} onClick={downloadReminder}>
              Download reminder <span aria-hidden="true">↓</span>
            </button>
          </div>
          <p className={styles.status} role="status">{reminderStatus}</p>
        </section>
      </div>
      {storageUnavailable && <p className={styles.storageMessage} role="status">Browser storage is unavailable. Changes may be lost when you leave this page.</p>}
      {children}
    </main>
  );
}
