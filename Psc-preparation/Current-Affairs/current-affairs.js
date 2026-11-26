/* Weekly Current Affairs index — tests are generated for Wednesdays, with
 * explicitly scheduled special dates included as exceptions.
 * No HTML edit is needed: add questions in tests.js. */
(function () {
  'use strict';
  var ND = window.NepaliDate;
  var TESTS = window.CA_TESTS || {};

  /* Series starts Wednesday 14 Oct 2026 AD = 28 Ashwin 2083 BS (Set 1). */
  var SERIES_START_AD = new Date(2026, 9, 14); // local midnight
  // One-off Thursday exam requested for 3 Mangsir 2083 (19 Nov 2026).
  var SPECIAL_TEST_AD_DATES = [new Date(2026, 10, 19)];
  var EXAM_URL = '/Psc-preparation/Current-Affairs/exam/date=';
  var DAY_MS = 86400000;

  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function daysBetween(a, b) { return Math.round((startOfDay(b) - startOfDay(a)) / DAY_MS); }

  /* Wednesdays plus any explicit special dates, newest first. */
  function listTestDates(today) {
    var list = [];
    var d = new Date(SERIES_START_AD);
    while (d.getDay() !== 3) d = new Date(d.getTime() + DAY_MS);
    while (d <= today) { list.push(new Date(d)); d = new Date(d.getTime() + 7 * DAY_MS); }
    SPECIAL_TEST_AD_DATES.forEach(function (special) {
      if (special >= SERIES_START_AD && special <= today && !list.some(function (date) { return daysBetween(date, special) === 0; })) {
        list.push(new Date(special));
      }
    });
    return list.sort(function (a, b) { return b - a; });
  }
  function nextTestDate(today) {
    var d = new Date(SERIES_START_AD);
    while (d.getDay() !== 3) d = new Date(d.getTime() + DAY_MS);
    while (d <= today) d = new Date(d.getTime() + 7 * DAY_MS);
    SPECIAL_TEST_AD_DATES.forEach(function (special) {
      if (special > today && special < d) d = new Date(special);
    });
    return d;
  }
  function weekdayNameEn(day) { return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]; }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function render() {
    var grid = document.getElementById('weeklyTestGrid');
    if (!grid) return;
    if (!ND) {
      grid.textContent = 'Current Affairs tests could not be loaded. Please refresh the page or try again later.';
      return;
    }
    var today = startOfDay(new Date());
    var testDates = listTestDates(today);
    var total = testDates.length;

    /* ---- Hero / status strip ---- */
    var todayBs = ND.adToBs(today);
    var todayEl = document.getElementById('caTodayBs');
    if (todayEl && todayBs) {
      todayEl.textContent = 'आज: ' + ND.formatBsNp(todayBs) + ' (' + ND.weekdayNp(today.getDay()) + ') · ' + ND.formatAdEn(today);
    }
    var next = nextTestDate(today);
    var nextBs = ND.adToBs(next);
    var nextEl = document.getElementById('caNextTest');
    if (nextEl && nextBs) {
      var inDays = daysBetween(today, next);
      nextEl.textContent = 'Next test: ' + ND.formatBsNp(nextBs) + ' ' + ND.weekdayNp(next.getDay()) + ' (' + weekdayNameEn(next.getDay()) + ', ' + ND.formatAdEn(next) + ') — in ' + inDays + (inDays === 1 ? ' day' : ' days');
    }
    var countEl = document.getElementById('caTestCount');
    if (countEl) countEl.textContent = total + (total === 1 ? ' weekly test' : ' weekly tests') + ' so far';

    /* ---- Weekly and special-date exam cards ---- */
    grid.textContent = '';
    if (!total) {
      grid.appendChild(el('p', null, 'The first Weekly Current Affairs Test opens on ' + ND.formatBsNp(ND.adToBs(SERIES_START_AD)) + ' (Wednesday).'));
      return;
    }
    testDates.forEach(function (adDate, i) {
      var setNo = total - i;
      var bs = ND.adToBs(adDate);
      if (!bs) return;
      var key = ND.keyOf(bs);
      var set = TESTS[key];
      var holidayMessage = (window.CA_HOLIDAYS || {})[key];
      var isSpecialDate = adDate.getDay() !== 3;
      var isToday = daysBetween(adDate, today) === 0;
      var isLatest = i === 0;

      var card = el('article', set ? 'topic-card available ca-card' : 'topic-card ca-card');

      var top = el('div', 'topic-top');
      top.appendChild(el('span', 'topic-number', 'Set ' + setNo));
      var badge = el('span', holidayMessage ? 'ca-badge' : (isToday ? 'ca-badge ca-live' : 'ca-badge'),
        holidayMessage ? 'भाइटीका' : (isSpecialDate ? 'Special test' : (isToday ? '● Live today' : (isLatest ? 'Latest test' : 'Wednesday'))));
      top.appendChild(badge);
      card.appendChild(top);

      card.appendChild(el('h3', null, 'Current Affairs Test — ' + ND.formatBsNp(bs)));
      var sub = el('p', null,
        ND.formatBsEn(bs) + ' · ' + ND.weekdayNp(adDate.getDay()) + ' (' + weekdayNameEn(adDate.getDay()) + ')\n' + ND.formatAdEn(adDate) +
        (set ? ' · ' + set.questions.length + ' questions · ' + Math.round(set.questions.length * 0.8) + ' min' : ''));
      sub.style.whiteSpace = 'pre-line';
      card.appendChild(sub);

      if (set) {
        var a = el('a', 'notes-button', 'Give Exam →');
        a.href = EXAM_URL + key;
        a.setAttribute('aria-label', 'Give exam for Weekly Current Affairs Test, ' + ND.formatBsEn(bs) + ' (opens the timed exam)');
        card.appendChild(a);
      } else if (holidayMessage) {
        card.appendChild(el('span', 'coming-soon', holidayMessage));
      } else {
        card.appendChild(el('span', 'coming-soon', 'Questions coming soon'));
      }
      grid.appendChild(card);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
