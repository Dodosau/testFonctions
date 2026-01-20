function loadCalendar() {
    fetch("calendar.ics")
        .then(function(response) { return response.text(); })
        .then(function(text) {
            var events = parseICS(text);
            displayEvents(events);
        })
        .catch(function(e) {
            document.getElementById("today").innerHTML = "Erreur : " + e;
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

function displayEvents(events) {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    document.getElementById("date-title").innerHTML =
        today.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

    for (var i = 0; i < events.length; i++) {
        var event = events[i];

        var date = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate());
        var time = formatTime(event.start);

        if (event.end) {
            time += " à " + formatTime(event.end);
        }

        var html = '<div class="event">' + time + " — " + event.summary + "</div>";

        if (date.getTime() === today.getTime()) {
            document.getElementById("today").innerHTML += html;
        } else if (date.getTime() === tomorrow.getTime()) {
            document.getElementById("tomorrow").innerHTML += html;
        } else if (date > tomorrow) {
            var label = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
            document.getElementById("upcoming").innerHTML +=
                '<div class="event">' + label + " — " + time + " — " + event.summary + "</div>";
        }
    }
}

loadCalendar();
