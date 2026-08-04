const ical = require('node-ical');

const ICS_URL = 'https://calendar.google.com/calendar/ical/pazbarueri%40gmail.com/public/basic.ics';
const TIME_ZONE = 'America/Sao_Paulo';

function dateParts(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  const value = type => parts.find(part => part.type === type)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

function timeParts(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIME_ZONE,
    hour: '2-digit', minute: '2-digit', hour12: false
  }).format(date);
}

function isExcluded(event, start) {
  if (!event.exdate) return false;
  return Boolean(event.exdate[start.toISOString()] || event.exdate[dateParts(start)]);
}

function recurrenceOverride(event, start) {
  if (!event.recurrences) return null;
  return event.recurrences[start.toISOString()] || event.recurrences[dateParts(start)] || null;
}

function toClientEvent(event, start, end) {
  const allDay = Boolean(event.datetype === 'date' || event.start?.dateOnly);
  return {
    id: `google-${event.uid}-${start.toISOString()}`,
    googleUid: event.uid,
    name: event.summary || 'Evento Paz Barueri',
    date: dateParts(start),
    time: allDay ? '' : timeParts(start),
    endTime: allDay ? '' : timeParts(end),
    location: event.location || '',
    description: event.description || '',
    leader: 'Paz Barueri',
    areas: [],
    sessions: [],
    source: 'google'
  };
}

function buildEvents(calendar, rangeStart, rangeEnd) {
  const output = [];

  for (const event of Object.values(calendar)) {
    if (event.type !== 'VEVENT' || event.status === 'CANCELLED' || event.recurrenceid) continue;

    if (event.rrule) {
      const duration = Math.max(0, event.end.getTime() - event.start.getTime());
      for (const occurrenceStart of event.rrule.between(rangeStart, rangeEnd, true)) {
        if (isExcluded(event, occurrenceStart)) continue;
        const override = recurrenceOverride(event, occurrenceStart);
        if (override?.status === 'CANCELLED') continue;
        const instance = override || event;
        const start = override?.start || occurrenceStart;
        const end = override?.end || new Date(start.getTime() + duration);
        output.push(toClientEvent(instance, start, end));
      }
      continue;
    }

    if (event.start >= rangeStart && event.start < rangeEnd) {
      output.push(toClientEvent(event, event.start, event.end || event.start));
    }
  }

  const unique = new Map(output.map(event => [event.id, event]));
  return [...unique.values()].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

module.exports = async function handler(req, res) {
  try {
    const now = new Date();
    const rangeStart = new Date(Date.UTC(now.getUTCFullYear() - 2, 0, 1));
    const rangeEnd = new Date(Date.UTC(now.getUTCFullYear() + 5, 0, 1));
    const calendar = await ical.async.fromURL(ICS_URL, {
      headers: { 'User-Agent': 'Volunteer-Paz-Barueri/2.0' },
      signal: AbortSignal.timeout(10000)
    });
    const events = buildEvents(calendar, rangeStart, rangeEnd);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json({ events, syncedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Google Calendar sync failed:', error);
    res.status(502).json({ error: 'Não foi possível sincronizar o Google Calendar.' });
  }
};

module.exports.buildEvents = buildEvents;
