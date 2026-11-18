const WEEK_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;
const FIRST_SUNDAY = Date.UTC(1970, 0, 4);
const REMINDER_HOUR = 9;
const monthAndDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const dayOnly = new Intl.DateTimeFormat('en-US', { day: 'numeric' });
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const weeklyInspiration = [
  {
    title: 'Make room for a slower morning.',
    description: 'Pick one morning to leave the phone aside. Make something warm, open a notebook, and give yourself ten minutes before the day starts.',
  },
  {
    title: 'Look at the familiar with fresh eyes.',
    description: 'Take a neighborhood walk and notice three things you usually pass. Bring one color, texture, or idea back into your week.',
  },
  {
    title: 'Give an ordinary evening a little care.',
    description: 'Choose one night for a simple dinner, a playlist you love, and a table set just for you.',
  },
  {
    title: 'Give something you love a second life.',
    description: 'Pull one favorite thing off a shelf or out of a drawer. Find a small way to use, wear, or enjoy it again this week.',
  },
];

export function startOfWeek(date: Date) {
  const sunday = new Date(date);
  sunday.setHours(0, 0, 0, 0);
  sunday.setDate(sunday.getDate() - sunday.getDay());
  return sunday;
}

export function dateKey(date: Date) {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function describeWeek(sunday: Date) {
  const saturday = new Date(sunday);
  saturday.setDate(saturday.getDate() + 6);
  const weekIndex = Math.round(
    (Date.UTC(sunday.getFullYear(), sunday.getMonth(), sunday.getDate()) - FIRST_SUNDAY) /
      WEEK_IN_MILLISECONDS,
  );
  const inspirationIndex = ((weekIndex % weeklyInspiration.length) + weeklyInspiration.length) %
    weeklyInspiration.length;
  const endLabel = sunday.getMonth() === saturday.getMonth()
    ? dayOnly.format(saturday)
    : monthAndDay.format(saturday);

  return {
    key: dateKey(sunday),
    label: `${monthAndDay.format(sunday)}–${endLabel}, ${saturday.getFullYear()}`,
    inspiration: weeklyInspiration[inspirationIndex],
    days: WEEKDAYS.map((name, offset) => {
      const date = new Date(sunday);
      date.setDate(date.getDate() + offset);
      return {
        key: dateKey(date),
        name,
        dayNumber: date.getDate(),
        label: `${name}, ${monthAndDay.format(date)}`,
      };
    }),
  };
}

export function makeSundayReminder(now: Date) {
  const sunday = startOfWeek(now);
  sunday.setHours(REMINDER_HOUR);
  if (sunday <= now) sunday.setDate(sunday.getDate() + 7);

  const localStart = dateKey(sunday).replaceAll('-', '') + 'T090000';
  const timestamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Life Edit//Weekly Intention//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:weekly-intention@the-life-edit',
    `DTSTAMP:${timestamp}`,
    `DTSTART:${localStart}`,
    'DURATION:PT10M',
    'RRULE:FREQ=WEEKLY;BYDAY=SU',
    'SUMMARY:Set your Life Edit intention',
    'DESCRIPTION:Open Life Edit and choose an intention for the week.',
    'TRANSP:TRANSPARENT',
    'BEGIN:VALARM',
    'TRIGGER:PT0M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Set your Life Edit intention',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}
