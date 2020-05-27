$(document).foundation();

var calc = null;
var occ = [];
var occupancyUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTytDWD1GyLlAjpPkjZj17YwzgvYd7CScj0T1VcgyQppPNHgSkhX-vv1uDLG-TUaeTl5fWuXHD-_622/pub?gid=0&single=true&range=A3:B1000&output=csv';

if (window && window.fetch) {
  fetch(occupancyUrl).then(
    function(response) {
      return response.text();
    }
  ).then(
      function(data) {
        var rows = data.split('\r\n');
        occ = [];
        for (var i = 0, max = rows.length; i < max; i++) {
          occ.push(rows[i].split(','));
        }

        var disabledDates = occ.map(function(value) {

          var from = convertDate(value[0]);
          var to = convertDate(value[1]);

          return {
            from: from.setDate(from.getDate() + 1),
            to: to.setDate(to.getDate() - 1)
          };
        });

        calc.set('disable', disabledDates);
      }
    );
}
// Call this from the developer console and you can control both instances
var $sticky, dateCheckin, dateCheckout;
var $booking, $bookingForm, $bookingConfirm, $bookingConfirmClose;

$(function() {

    $('.is-booking-trigger').on('click', showBookingForm);
    $('.picker__holder').css('maxWidth', $('.picker__holder').closest('.columns').width());

    $booking                = $('#booking');
    $bookingForm            = $('#booking-form');
    $confirmBooking         = $('#confirm-booking');
    $bookingConfirm         = $('#booking-confirm');
    $bookingConfirmClose    = $('#booking-confirm-close');
    $sticky                 = $('.sticky');

    $('#menu-toggle').on('click', function () {
        if (!$sticky.hasClass('is-stuck') || ($sticky.hasClass('is-stuck') && !$sticky.hasClass('is-at-top') )) {
            $sticky.toggleClass('is-stuck');
        }
    });

    // If the form is valid
    $bookingForm.on('formvalid.zf.abide', handleFormSubmit);
    $bookingForm.on('submit', function(event) {
        event.preventDefault();
        return false;
    });
    $bookingConfirmClose.on('click', hideBookingResult);

    // initiate flatpickr
    calc = $("#cal").flatpickr({
      inline: true,
      locale: 'de',
      minDate: new Date(),
      mode: 'range',
      //plugins: [new rangePlugin({})],
      dateFormat: 'd. M. Y',

      onChange: function(selectedDates, dateStr) {

        dateCheckin = selectedDates[0];
        dateCheckout = selectedDates[1];

        if (dateCheckout) {
          if (dateCheckin.getFullYear() === dateCheckout.getFullYear()) {
            dateStr = dateStr.replace(' ' + dateCheckin.getFullYear(), '');
          }

          if (dateCheckin.getMonth() === dateCheckout.getMonth()) {
            const month = dateStr.slice(2, 7);
            dateStr = dateStr.replace(month, '');
          }
        }

        //$("#date-checkin").attr('disabled', true);
        $("#date-checkin").attr('value', dateStr);
      }
    });

});


const BOOKING_GENERAL = 1,
      BOOKING_EXTRAS = 2,
      BOOKING_NOTES = 3;
var curStep = BOOKING_GENERAL;

const encode = (data) => {
  return Object.keys(data)
      .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");
}

/**
 * handleFormSubmit
 */
function handleFormSubmit(event) {

  event.preventDefault();

  var requestArgs = {};
  var formEntries = $(this).serializeArray();

  $.each(formEntries, function (index, entry) {
      if (entry.name != 'length') {
          requestArgs[entry.name.toLowerCase()] = entry.value;
      }
  });
/*
  requestArgs['dateCheckin'] = dateCheckin.getMilliseconds();
  requestArgs['dateCheckout'] = dateCheckout.getMilliseconds();
*/

  fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: encode(requestArgs)
  })
    .then(() => showBookingResult())
    .catch(error => alert(error));

    event.preventDefault();

/*
  // send form data
  $.ajax({
      method: 'POST',
      url: 'https:/kleine-villa-zimmert.de/api/',
      accepts: 'application/json',
      headers: {
          'Accept': 'application/json'
      },
      data: requestArgs
  }).done(function(data) {
      console.log(data);
      var json = JSON.parse(data);

      if (json.success) {
          showBookingResult();
          //$confirmBooking.attr('disabled', false);
      } else {
          //$confirmBooking.attr('disabled', false);
      }
  }).fail(function(xhr, status, error) {
      console.log(error);
  });
  */

  //ga('send', 'event', 'booking', 'request');

  return false;
}

function showBookingForm() {
  $('html, body').animate({
    scrollTop: ($('.break-water').offset().top + $('#hero').outerHeight() - $('#header').outerHeight()
  )}, 'slow');
  //ga('send', 'event', 'booking', 'open');
}

function hideBookingResult() {
  //Foundation.Motion.animateOut($bookingConfirm, 'fade-out');
  $bookingConfirm.fadeOut();
  //Foundation.Motion.animateIn($booking, 'fade-in');
  //$('html, body').animate({ scrollTop: ($('h1').offset().top)}, 'slow');
}

function showBookingResult() {
  //Foundation.Motion.animateIn($bookingConfirm, 'fade-in');
  //Foundation.Motion.animateOut($booking, 'fade-out');
  $bookingConfirm.fadeIn();
  $booking.fadeOut();
  $('html, body').animate({ scrollTop: ($bookingConfirm.offset().top)}, 1000);
}

/**
 *
 * @param dateStr
 * @returns {Date}
 */
function convertDate(dateStr) {

    var dateArr = dateStr.split('.');
    var date = new Date(
      parseInt(dateArr[2]),
      parseInt(dateArr[1])-1,
      parseInt(dateArr[0]),
      0, 0, 0
    );

    return date;
}
