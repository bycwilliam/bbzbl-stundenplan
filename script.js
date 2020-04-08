const dateManager = createWeekCalculator();
let jobSelect = $('#jobs');
let classSelect = $('#classes');
let scheduleTable = $('#schedule');
let paginationDiv = $('#paginationDiv');
let classSelectDiv = $('#classSelectDiv');
let scheduleTableDiv = $('#scheduleTableDiv');
let paginationDate = $('#date');
let paginationNext = $('#next');
let paginationPrev = $('#prev');

/**
 * wait for Site to have loaded
 */
$(document).ready(() => {
    getJobData();
});

/**
 * create and handle JSON request
 */
function getJobData() {
    $.getJSON('http://sandbox.gibm.ch/berufe.php').done((jobs) =>
        createJobSelect(jobs)
    ).fail(responseError);
}

/**
 * create elements to fill select with
 *
 * @param jobs
 */
function createJobSelect(jobs) {
    // clear elements
    removeErrorMessage();
    jobSelect.empty().append('<option value="0">--</option>');

    // loop response and create elements
    $.each(jobs, (i, jobData) => {
        $('<option value="' + jobData.beruf_id + '">' + jobData.beruf_name + '</option>').appendTo($('#jobs'));
    });

    // show class info if key in local storage
    if (localStorage.getItem('selectedJob')) {
        jobSelect.val(localStorage.getItem('selectedJob'));
        createClassInfo();
    }
}

/**
 * set local storage, visibility and build class info on change
 */
jobSelect.change(function () {
    // set local storage
    localStorage.setItem('date', dateManager.getWeekString());
    localStorage.setItem('selectedJob', this.value);
    localStorage.removeItem('selectedClass');
    createClassInfo();

    // set visibility
    scheduleTableDiv.fadeOut();
    paginationDiv.fadeOut();
});

/**
 * create and handle JSON request and visibility based on response
 */
function createClassInfo() {
    let url = 'http://sandbox.gibm.ch/klassen.php?beruf_id=' + localStorage.getItem('selectedJob');
    $.getJSON(url).done((classes) => {
        fillClassSelect(classes);
        // check if response is empty
        if (classes.length > 0) {
            classSelectDiv.fadeIn();
        } else {
            classSelectDiv.fadeOut();
        }
    }).fail(responseError);
}

/**
 * create elements to fill select with
 * @param classes
 */
function fillClassSelect(classes) {
    //clear elements
    removeErrorMessage();
    classSelect.empty().append('<option value="0">--</option>');

    // loop response and create elements
    $.each(classes, (i, classData) => {
        $('<option value="' + classData.klasse_id + '">' + classData.klasse_longname + '</option>').appendTo($('#classes'));
    });

    // show class info if key in local storage
    if (localStorage.getItem('selectedClass')) {
        classSelect.val(localStorage.getItem('selectedClass'));
        createScheduleInfo();
    }
}

/**
 * set local storage and build table on change
 */
classSelect.change(function () {
    // set local storage
    localStorage.setItem('selectedClass', this.value);
    createScheduleInfo();
});

function createScheduleInfo() {
    let url = 'http://sandbox.gibm.ch/tafel.php?woche=' + localStorage.getItem('date') + '&klasse_id=' + localStorage.getItem('selectedClass');
    $.getJSON(url).done((schedule) => {
        // set visibility
        paginationDiv.fadeIn();
        fillScheduleTable(schedule);

        // check if response is empty
        if (schedule.length > 0) {
            scheduleTableDiv.fadeIn();
            removeInfoMessage();
        } else {
            scheduleTableDiv.fadeOut();
            infoMessage();
        }
    }).fail(responseError);
}

function fillScheduleTable(schedule) {
    //clear elements
    removeErrorMessage();
    scheduleTable.empty();

    //add current week to pagination
    paginationDate.html(localStorage.getItem('date'));

    // loop response and create elements
    $.each(schedule, (i, scheduleData) => {
        $(
            '<tr id="' + scheduleData.tafel_id + '">' +
            '<td>' + scheduleData.tafel_datum + '</td>' +
            '<td>' + getWeekday(scheduleData.tafel_wochentag) + '</td>' +
            '<td>' + scheduleData.tafel_von + '</td>' +
            '<td>' + scheduleData.tafel_bis + '</td>' +
            '<td>' + scheduleData.tafel_lehrer + '</td>' +
            '<td>' + scheduleData.tafel_fach + '</td>' +
            '<td>' + scheduleData.tafel_raum + '</td>' +
            '</tr>'
        ).appendTo($('#schedule'));
    })
}

/**
 * add week and set local storage, rebuild schedule info
 */
paginationNext.click(function () {
    dateManager.addWeek();
    localStorage.setItem('date', dateManager.getWeekString());
    createScheduleInfo();
});

/**
 * reset week and set local storage, rebuild schedule info
 */
paginationDate.click(function () {
    dateManager.reset();
    localStorage.setItem('date', dateManager.getWeekString());
    createScheduleInfo();
});

/**
 * subtract week and set local storage, rebuild schedule info
 */
paginationPrev.click(function () {
    dateManager.subtractWeek();
    localStorage.setItem('date', dateManager.getWeekString());
    createScheduleInfo();
});

/**
 * get weekday based on number
 * @param weekday
 * @returns {string}
 */
function getWeekday(weekday) {
    switch (weekday) {
        case '0':
            return 'Sonntag';
        case '1':
            return 'Montag';
        case '2':
            return 'Dienstag';
        case '3':
            return 'Mitwoch';
        case '4':
            return 'Donnerstag';
        case '5':
            return 'Freitag';
        case '6':
            return 'Samstag';
        default:
            return 'd';
    }
}

/**
 * show error alert
 */
function responseError() {
    $('#errorMessage').removeAttr('hidden').html('Keine Verbindung zum Server');
}

/**
 * hide error alert
 */
function removeErrorMessage() {
    $('#errorMessage').empty().attr('hidden', true);
}

/**
 * show info alert
 */
function infoMessage() {
    $('#infoMessage').removeAttr('hidden').html('Es konnten keine Stundenplan-Daten von dieser Woche für diese Klasse gefunden werden');
}

/**
 * hide info alert
 */
function removeInfoMessage() {
    $('#infoMessage').empty().attr('hidden', true);
}

