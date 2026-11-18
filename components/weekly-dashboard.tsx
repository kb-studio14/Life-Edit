'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import Image from 'next/image';
import { describeWeek, makeSundayReminder, startOfWeek, weeklyInspiration } from '@/lib/weekly-dashboard';
import styles from './weekly-dashboard.module.css';

const STORAGE_KEY = 'life-edit-dashboard-v1';
const EMPTY_DASHBOARD: DashboardData = { intentions: {}, tasks: [] };

type Task = { id: string; title: string; done: boolean };
type DashboardData = { intentions: Record<string, string>; tasks: Task[] };

function readDashboard(): DashboardData {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return EMPTY_DASHBOARD;
  const parsed: Partial<DashboardData> | null = JSON.parse(saved);
  return {
    intentions: parsed?.intentions && typeof parsed.intentions === 'object'
      ? parsed.intentions
      : {},
    tasks: Array.isArray(parsed?.tasks) ? parsed.tasks : [],
  };
}

function IntentionForm({ saved, onSave }: {
  saved: string;
  onSave: (intention: string) => boolean;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const [message, setMessage] = useState('');
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
      <label className={styles.srOnly} htmlFor="weekly-intention">Weekly intention</label>
      <textarea
        id="weekly-intention"
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
        <button className={styles.primaryButton} disabled={value.trim() === saved}>
          Save intention
        </button>
        <span className={styles.status} role="status">{message}</span>
      </div>
    </form>
  );
}

export function WeeklyDashboard({ children }: { children: ReactNode }) {
  const [week, setWeek] = useState<ReturnType<typeof describeWeek> | null>(null);
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [taskTitle, setTaskTitle] = useState('');
  const [reminderStatus, setReminderStatus] = useState('');
  const [storageUnavailable, setStorageUnavailable] = useState(false);

  useEffect(() => {
    function checkWeek() {
      const next = describeWeek(startOfWeek(new Date()));
      setWeek((current) => current?.key === next.key ? current : next);
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

    checkWeek();
    refreshData();
    const interval = window.setInterval(checkWeek, 30_000);
    window.addEventListener('focus', checkWeek);
    window.addEventListener('storage', syncStorage);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', checkWeek);
      window.removeEventListener('storage', syncStorage);
    };
  }, []);

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

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = taskTitle.trim();
    if (!title) return;
    const task = { id: window.crypto.randomUUID(), title, done: false };
    updateDashboard((current) => ({ ...current, tasks: [...current.tasks, task] }));
    setTaskTitle('');
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
  const completed = dashboard.tasks.filter((task) => task.done).length;

  return (
    <main className={styles.dashboard}>
      <div className={styles.heading}>
        <h1>This week</h1>
        <time dateTime={week?.key}>{week?.label}</time>
      </div>

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
            sizes="(max-width: 680px) 100vw, (max-width: 1200px) 54vw, 620px"
          />
        </div>
      </section>

      <div className={styles.workspaces}>
        <section className={styles.panel} aria-labelledby="intention-heading">
          <h2 id="intention-heading">Weekly intention</h2>
          <p className={styles.panelDescription}>What do you want to make space for this week?</p>
          {week && (
            <IntentionForm
              key={week.key}
              saved={dashboard.intentions[week.key] ?? ''}
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

        <section className={styles.panel} aria-labelledby="tasks-heading">
          <div className={styles.tasksHeading}>
            <h2 id="tasks-heading">To-do list</h2>
            {dashboard.tasks.length > 0 && <p role="status">{completed} of {dashboard.tasks.length} done</p>}
          </div>
          <form className={styles.taskForm} onSubmit={addTask}>
            <label className={styles.srOnly} htmlFor="new-task">New task</label>
            <input
              id="new-task"
              placeholder="Add a task…"
              maxLength={160}
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
            />
            <button className={styles.primaryButton} disabled={!taskTitle.trim()}>Add task</button>
          </form>
          {dashboard.tasks.length === 0 && <p className={styles.emptyTasks}>No tasks yet.</p>}
          {dashboard.tasks.length > 0 && (
            <ul className={styles.tasks}>
              {dashboard.tasks.map((task) => (
                <li key={task.id}>
                  <label className={task.done ? styles.completedTask : undefined}>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={(event) => {
                        const done = event.target.checked;
                        updateDashboard((current) => ({
                          ...current,
                          tasks: current.tasks.map((item) => item.id === task.id ? { ...item, done } : item),
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
        </section>
      </div>
      {storageUnavailable && <p className={styles.storageMessage} role="status">Browser storage is unavailable. Changes may be lost when you leave this page.</p>}
      {children}
    </main>
  );
}
