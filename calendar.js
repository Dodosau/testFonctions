function loadCalendar() {
  fetch("calendar.ics")
    .then(function(response) { return response.text(); })
    .then(function(text) {
      var events = parseICS(text);
      displayGroupedEvents(events);
    })
    .catch(function(e) {
      document.getElementById("calendar").innerHTML = "Erreur : " + e;
    });
}

function parseICS(text) {
  var events = [];
  var blocks = text.split("BEGIN:VEVENT");

  for (var i = 1; i < blocks.length; i++) {
    var block = blocks[i];

    var summaryMatch = block.match(/SUMMARY:(.+)/);
    var dtstartMatch = block.match(/DTSTART(?:;TZID=[^:]+)?:([0-9T]+)/);
    var dtendMatch = block.match(/DTEND(?:;TZID=[^:]+)?:([0-9T]+)/);

    if (summaryMatch && dtstartMatch) {
      var summary = summaryMatch[1].trim();
      var start = parseICSTime(dtstartMatch[1]);
      var end = dtendMatch ? parseICSTime(dtendMatch[1]) : null;

      events.push({
        summary: summary,
        start: start,
        end: end
      });
    }
  }

  return events;
}

function parseICSTime(str) {
  var year = parseInt(str.slice(0, 4), 10);
  var month = parseInt(str.slice(4, 6), 10) - 1;
  var day = parseInt(str.slice(6, 8), 10);
  var hour = parseInt(str.slice(9, 11), 10);
  var minute = parseInt(str.slice(11, 13), 10);

  return new Date(year, month, day, hour, minute);
}

function formatTime(date) {
  var h = date.getHours();
  var m = date.getMinutes();

  if (h < 10) h = "0" + h;
  if (m < 10) m = "0" + m;

  return h + ":" + m;
}

function displayGroupedEvents(events) {
  var container = document.getElementById("calendar");
  container.innerHTML = "";

  var grouped = {};

  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    var dateKey = event.start.toDateString();

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }

    grouped[dateKey].push(event);
  }

  var keys = Object.keys(grouped).sort(function(a, b) {
    return new Date(a) - new Date(b);
  });

  for (var j = 0; j < keys.length; j++) {
    var date = new Date(keys[j]);
    var label = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

    var block = document.createElement("div");
    block.className = "day-block";
    block.style.marginBottom = "25px";

    var title = document.createElement("div");
    title.className = "day-title";
    title.style.fontSize = "20px";
    title.style.fontWeight = "bold";
    title.style.marginBottom = "10px";
    title.textContent = "📅 " + label;
    block.appendChild(title);

    var dayEvents = grouped[keys[j]];

    for (var k = 0; k < dayEvents.length; k++) {
      var ev = dayEvents[k];

      var table = document.createElement("table");
      table.style.width = "100%";
      table.style.marginBottom = "10px";

      var tr1 = document.createElement("tr");
      var tr2 = document.createElement("tr");

      var tdLeft1 = document.createElement("td");
      tdLeft1.rowSpan = "2";
      tdLeft1.style.verticalAlign = "top";
      tdLeft1.style.fontSize = "16px";
      tdLeft1.style.paddingRight = "10px";
      tdLeft1.textContent = ev.summary;

      var tdRight1 = document.createElement("td");
      tdRight1.style.textAlign = "right";
      tdRight1.style.fontSize = "16px";
      tdRight1.textContent = "🕘 " + formatTime(ev.start);

      var tdRight2 = document.createElement("td");
      tdRight2.style.textAlign = "right";
      tdRight2.style.fontSize = "16px";
      tdRight2.textContent = ev.end ? formatTime(ev.end) : "";

      tr1.appendChild(tdLeft1);
      tr1.appendChild(tdRight1);
      tr2.appendChild(tdRight2);

      table.appendChild(tr1);
      table.appendChild(tr2);

      block.appendChild(table);

      var hr = document.createElement("hr");
      hr.style.border = "0";
      hr.style.borderTop = "1px solid #ccc";
      hr.style.margin = "10px 0";
      block.appendChild(hr);
    }

    container.appendChild(block);
  }
}

loadCalendar();
