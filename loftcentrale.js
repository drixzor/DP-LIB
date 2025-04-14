(function() {
  var originalAddEventListener = EventTarget.prototype.addEventListener;

  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (type === 'touchstart' || type === 'touchmove') {
      if (!(options instanceof Object)) {
        options = {};
      }
      options.passive = options.passive || true;
    }
    originalAddEventListener.call(this, type, listener, options);
  };
})();

document.addEventListener("DOMContentLoaded", function() {
    var fromDateInputs = document.querySelectorAll(".checkin-date-text");
    var toDateInputs = document.querySelectorAll(".checkout-date-text");
    var guestsInput = document.getElementById("guests");
    var submitButton = document.getElementById("submit-button");
    var monthIn = document.querySelectorAll(".month-in");
    var monthOut = document.querySelectorAll(".month-out");

    var today = new Date();
    var tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    var thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    var nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    fromDateInputs.forEach(function(fromDateInput) {
        fromDateInput.value = formatDate(today);
    });

    toDateInputs.forEach(function(toDateInput) {
        toDateInput.value = formatDate(tomorrow);
    });

    fromDateInputs.forEach(function(fromDateInput) {
        flatpickr(fromDateInput, {
            dateFormat: 'd',
            defaultDate: today,
            minDate: today,
            onChange: function(selectedDates, dateStr, instance) {
                updateMonth(monthIn, instance);
                updateDateStorage(fromDateInput, selectedDates[0]);

                toDateInputs.forEach(function(toDateInput) {
                    var minCheckoutDate = new Date(selectedDates[0]);
                    minCheckoutDate.setDate(minCheckoutDate.getDate() + 1);
                    toDateInput._flatpickr.set("minDate", minCheckoutDate);
                    toDateInput._flatpickr.setDate(minCheckoutDate, true);
                });
            }
        });
    });

    toDateInputs.forEach(function(toDateInput) {
        flatpickr(toDateInput, {
            dateFormat: 'd',
            defaultDate: tomorrow,
            onChange: function(selectedDates, dateStr, instance) {
                updateMonth(monthOut, instance);
                updateDateStorage(toDateInput, selectedDates[0]);
            }
        });
    });

    updateMonth(monthIn, { selectedDates: [today] });
    updateMonth(monthOut, { selectedDates: [tomorrow] });

    function updateMonth(elements, instance) {
        var selectedDates = instance.selectedDates;
        if (selectedDates && selectedDates.length > 0) {
            var month = selectedDates[0].toLocaleString('default', { month: 'short' });
            elements.forEach(function(element) {
                element.textContent = month;
            });
        }
    }

    function updateDateStorage(inputElement, date) {
        inputElement.dataset.dateValue = formatDate(date);
    }

    var increaseButton = document.getElementById("increase");
    var decreaseButton = document.getElementById("decrease");

    increaseButton.addEventListener("click", function() {
        var currentValue = parseInt(guestsInput.textContent);
        guestsInput.textContent = currentValue + 1;
    });

    decreaseButton.addEventListener("click", function() {
        var currentValue = parseInt(guestsInput.textContent);
        if (currentValue > 1) {
            guestsInput.textContent = currentValue - 1;
        }
    });

    function calculateNights(checkin, checkout) {
        var oneDay = 24 * 60 * 60 * 1000;
        var checkinDate = new Date(checkin);
        var checkoutDate = new Date(checkout);
        var differenceMs = Math.abs(checkoutDate.getTime() - checkinDate.getTime());
        var nights = Math.ceil(differenceMs / oneDay);
        return nights;
    }

    function formatDate(date) {
        var year = date.getFullYear();
        var month = (date.getMonth() + 1).toString().padStart(2, '0');
        var day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function constructURL() {
        var checkinDate = fromDateInputs[0].dataset.dateValue;
        var checkoutDate = toDateInputs[0].dataset.dateValue;
        var guests = guestsInput.textContent;
        var nights = calculateNights(checkinDate, checkoutDate);

        var url = `https://loftcentrale.reserve-online.net/?checkin=${checkinDate}&checkout=${checkoutDate}&rooms=1&nights=${nights}&adults=${guests}&src=606`;
        return url;
    }

    submitButton.addEventListener("click", function(event) {
        event.preventDefault();
        var url = constructURL();
        window.open(url, "_blank");
    });

    var mobileSubmitButton = document.querySelector(".search-widget.mobile #submit-button");
    if (mobileSubmitButton) {
        mobileSubmitButton.addEventListener("click", function(event) {
            event.preventDefault();
            var checkinDate = document.querySelector(".search-widget.mobile .checkin-date-text").dataset.dateValue;
            var checkoutDate = document.querySelector(".search-widget.mobile .checkout-date-text").dataset.dateValue;
            var guests = document.getElementById("guests").textContent;
            var nights = calculateNights(checkinDate, checkoutDate);
            var url = `https://loftcentrale.reserve-online.net/?checkin=${checkinDate}&checkout=${checkoutDate}&rooms=1&nights=${nights}&adults=${guests}&src=606`;
            window.location.href = url;
        });
    }
});
