// @ts-nocheck
import { DateLocalizer } from "react-big-calendar";

const weekRangeFormat = ({ start, end }, culture, local) =>
  local.format(start, "MMMM DD", culture) +
  " – " +
  local.format(end, local.eq(start, end, "month") ? "DD" : "MMMM DD", culture);

const dateRangeFormat = ({ start, end }, culture, local) =>
  // biome-ignore lint/style/useTemplate: Fix this later
  local.format(start, "L", culture) + " – " + local.format(end, "L", culture);

const timeRangeFormat = ({ start, end }, culture, local) =>
  // biome-ignore lint/style/useTemplate: Fix this later
  local.format(start, "LT", culture) + " – " + local.format(end, "LT", culture);

const timeRangeStartFormat = ({ start }, culture, local) =>
  // biome-ignore lint/style/useTemplate: Fix this later
  local.format(start, "LT", culture) + " – ";

const timeRangeEndFormat = ({ end }, culture, local) =>
  // biome-ignore lint/style/useTemplate: Fix this later
  " – " + local.format(end, "LT", culture);

export const formats = {
  dateFormat: "DD",
  dayFormat: "DD ddd",
  weekdayFormat: "ddd",

  selectRangeFormat: timeRangeFormat,
  eventTimeRangeFormat: timeRangeFormat,
  eventTimeRangeStartFormat: timeRangeStartFormat,
  eventTimeRangeEndFormat: timeRangeEndFormat,

  timeGutterFormat: "LT",

  monthHeaderFormat: "MMMM YYYY",
  dayHeaderFormat: "dddd MMM DD",
  dayRangeHeaderFormat: weekRangeFormat,
  agendaHeaderFormat: dateRangeFormat,

  agendaDateFormat: "ddd MMM DD",
  agendaTimeFormat: "LT",
  agendaTimeRangeFormat: timeRangeFormat,
};

function fixUnit(unit) {
  let datePart = unit ? unit.toLowerCase() : unit;
  if (datePart === "FullYear") {
    datePart = "year";
  } else if (!datePart) {
    datePart = undefined;
  }
  return datePart;
}

export default function (dayjs) {
  const locale = (m, c) => (c ? m.locale(c) : m);

  /*** BEGIN localized date arithmetic methods with dayjs ***/
  function defineComparators(a, b, unit) {
    const datePart = fixUnit(unit);
    const dtA = datePart ? dayjs(a).startOf(datePart) : dayjs(a);
    const dtB = datePart ? dayjs(b).startOf(datePart) : dayjs(b);
    return [dtA, dtB, datePart];
  }

  // biome-ignore lint/style/useDefaultParameterLast: Fix this later
  function startOf(date = null, unit) {
    const datePart = fixUnit(unit);
    if (datePart) {
      return dayjs(date).startOf(datePart).toDate();
    }
    return dayjs(date).toDate();
  }

  // biome-ignore lint/style/useDefaultParameterLast: Fix this later
  function endOf(date = null, unit) {
    const datePart = fixUnit(unit);
    if (datePart) {
      return dayjs(date).endOf(datePart).toDate();
    }
    return dayjs(date).toDate();
  }

  // dayjs comparison operations *always* convert both sides to dayjs objects
  // prior to running the comparisons
  function eq(a, b, unit) {
    const [dtA, dtB, datePart] = defineComparators(a, b, unit);
    return dtA.isSame(dtB, datePart);
  }

  function neq(a, b, unit) {
    return !eq(a, b, unit);
  }

  function gt(a, b, unit) {
    const [dtA, dtB, datePart] = defineComparators(a, b, unit);
    return dtA.isAfter(dtB, datePart);
  }

  function lt(a, b, unit) {
    const [dtA, dtB, datePart] = defineComparators(a, b, unit);
    return dtA.isBefore(dtB, datePart);
  }

  function gte(a, b, unit) {
    const [dtA, dtB, datePart] = defineComparators(a, b, unit);
    return dtA.isSameOrBefore(dtB, datePart);
  }

  function lte(a, b, unit) {
    const [dtA, dtB, datePart] = defineComparators(a, b, unit);
    return dtA.isSameOrBefore(dtB, datePart);
  }

  function inRange(day, min, max, unit = "day") {
    const datePart = fixUnit(unit);
    const mDay = dayjs(day);
    const mMin = dayjs(min);
    const mMax = dayjs(max);
    return mDay.isBetween(mMin, mMax, datePart, "[]");
  }

  function min(dateA, dateB) {
    const dtA = dayjs(dateA);
    const dtB = dayjs(dateB);
    const minDt = dayjs.min(dtA, dtB);
    return minDt.toDate();
  }

  function max(dateA, dateB) {
    const dtA = dayjs(dateA);
    const dtB = dayjs(dateB);
    const maxDt = dayjs.max(dtA, dtB);
    return maxDt.toDate();
  }

  function merge(date, time) {
    if (!date && !time) return null;

    const tm = dayjs(time).format("HH:mm:ss");
    const dt = dayjs(date).startOf("day").format("MM/DD/YYYY");
    // We do it this way to avoid issues when timezone switching
    return dayjs(`${dt} ${tm}`, "MM/DD/YYYY HH:mm:ss").toDate();
  }

  function add(date, adder, unit) {
    const datePart = fixUnit(unit);
    return dayjs(date).add(adder, datePart).toDate();
  }

  function range(start, end, unit = "day") {
    const datePart = fixUnit(unit);
    // because the add method will put these in tz, we have to start that way
    let current = dayjs(start).toDate();
    const days = [];

    while (lte(current, end)) {
      days.push(current);
      current = add(current, 1, datePart);
    }

    return days;
  }

  function ceil(date, unit) {
    const datePart = fixUnit(unit);
    const floor = startOf(date, datePart);

    return eq(floor, date) ? floor : add(floor, 1, datePart);
  }

  function diff(a, b, unit = "day") {
    const datePart = fixUnit(unit);
    // don't use 'defineComparators' here, as we don't want to mutate the values
    const dtA = dayjs(a);
    const dtB = dayjs(b);
    return dtB.diff(dtA, datePart);
  }

  function minutes(date) {
    const dt = dayjs(date);
    return dt.minutes();
  }

  function firstOfWeek() {
    const data = dayjs.localeData();
    return data ? data.firstDayOfWeek() : 0;
  }

  function firstVisibleDay(date) {
    return dayjs(date).startOf("month").startOf("week").toDate();
  }

  function lastVisibleDay(date) {
    return dayjs(date).endOf("month").endOf("week").toDate();
  }

  function visibleDays(date) {
    let current = firstVisibleDay(date);
    const last = lastVisibleDay(date);
    const days = [];

    while (lte(current, last)) {
      days.push(current);
      current = add(current, 1, "d");
    }

    return days;
  }
  /*** END localized date arithmetic methods with dayjs ***/

  /**
   * Moved from TimeSlots.js, this method overrides the method of the same name
   * in the localizer.js, using dayjs to construct the js Date
   * @param {Date} dt - date to start with
   * @param {Number} minutesFromMidnight
   * @param {Number} offset
   * @returns {Date}
   */
  function getSlotDate(dt, minutesFromMidnight, offset) {
    return dayjs(dt)
      .startOf("day")
      .minute(minutesFromMidnight + offset)
      .toDate();
  }

  // dayjs will automatically handle DST differences in it's calculations
  function getTotalMin(start, end) {
    return diff(start, end, "minutes");
  }

  function getMinutesFromMidnight(start) {
    const dayStart = dayjs(start).startOf("day");
    const day = dayjs(start);
    return day.diff(dayStart, "minutes");
  }

  // These two are used by DateSlotMetrics
  function continuesPrior(start, first) {
    const mStart = dayjs(start);
    const mFirst = dayjs(first);
    return mStart.isBefore(mFirst, "day");
  }

  function continuesAfter(_start, end, last) {
    const mEnd = dayjs(end);
    const mLast = dayjs(last);
    return mEnd.isSameOrAfter(mLast, "minutes");
  }

  // These two are used by eventLevels
  function sortEvents({
    evtA: { start: aStart, end: aEnd, allDay: aAllDay },
    evtB: { start: bStart, end: bEnd, allDay: bAllDay },
  }) {
    const startSort = +startOf(aStart, "day") - +startOf(bStart, "day");

    const durA = diff(aStart, ceil(aEnd, "day"), "day");

    const durB = diff(bStart, ceil(bEnd, "day"), "day");

    return (
      startSort || // sort by start Day first
      Math.max(durB, 1) - Math.max(durA, 1) || // events spanning multiple days go first
      !!bAllDay - !!aAllDay || // then allDay single day events
      +aStart - +bStart || // then sort by start time *don't need dayjs conversion here
      +aEnd - +bEnd // then sort by end time *don't need dayjs conversion here either
    );
  }

  function inEventRange({
    event: { start, end },
    range: { start: rangeStart, end: rangeEnd },
  }) {
    const startOfDay = dayjs(start).startOf("day");
    const eEnd = dayjs(end);
    const rStart = dayjs(rangeStart);
    const rEnd = dayjs(rangeEnd);

    const startsBeforeEnd = startOfDay.isSameOrBefore(rEnd, "day");
    // when the event is zero duration we need to handle a bit differently
    const sameMin = !startOfDay.isSame(eEnd, "minutes");
    const endsAfterStart = sameMin
      ? eEnd.isAfter(rStart, "minutes")
      : eEnd.isSameOrAfter(rStart, "minutes");

    return startsBeforeEnd && endsAfterStart;
  }

  // dayjs treats 'day' and 'date' equality very different
  // dayjs(date1).isSame(date2, 'day') would test that they were both the same day of the week
  // dayjs(date1).isSame(date2, 'date') would test that they were both the same date of the month of the year
  function isSameDate(date1, date2) {
    const dt = dayjs(date1);
    const dt2 = dayjs(date2);
    return dt.isSame(dt2, "date");
  }

  /**
   * This method, called once in the localizer constructor, is used by eventLevels
   * 'eventSegments()' to assist in determining the 'span' of the event in the display,
   * specifically when using a timezone that is greater than the browser native timezone.
   * @returns number
   */
  function browserTZOffset() {
    /**
     * Date.prototype.getTimezoneOffset horrifically flips the positive/negative from
     * what you see in it's string, so we have to jump through some hoops to get a value
     * we can actually compare.
     */
    const dt = new Date();
    const neg = /-/.test(dt.toString()) ? "-" : "";
    const dtOffset = dt.getTimezoneOffset();
    const comparator = Number(`${neg}${Math.abs(dtOffset)}`);
    // dayjs correctly provides positive/negative offset, as expected
    const mtOffset = dayjs().utcOffset();
    return mtOffset > comparator ? 1 : 0;
  }

  return new DateLocalizer({
    formats,

    firstOfWeek,
    firstVisibleDay,
    lastVisibleDay,
    visibleDays,

    format(value, format, culture) {
      return locale(dayjs(value), culture).format(format);
    },

    lt,
    lte,
    gt,
    gte,
    eq,
    neq,
    merge,
    inRange,
    startOf,
    endOf,
    range,
    add,
    diff,
    ceil,
    min,
    max,
    minutes,

    getSlotDate,
    getTotalMin,
    getMinutesFromMidnight,
    continuesPrior,
    continuesAfter,
    sortEvents,
    inEventRange,
    isSameDate,
    browserTZOffset,
  });
}
