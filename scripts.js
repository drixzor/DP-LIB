(function() {
  var originalAddEventListener = EventTarget.prototype.addEventListener;

  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (type === 'touchstart' || type === 'touchmove') {
      // Check if options is an object, if not, create one
      if (!(options instanceof Object)) {
        options = {};
      }
      // Set passive to true if it's not already set
      options.passive = options.passive || true;
    }

    // Call the original addEventListener method with possibly modified options
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

    var today = new Date(); // Get today's date
    var tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Get tomorrow's date
    var thisMonth = new Date(today.getFullYear(), today.getMonth(), 1); // First day of the current month
    var nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1); // First day of the next month

    // Set default values for inputs
    fromDateInputs.forEach(function(fromDateInput) {
        fromDateInput.value = formatDate(today);
    });

    toDateInputs.forEach(function(toDateInput) {
        toDateInput.value = formatDate(tomorrow);
    });

   // Initialize Flatpickr after setting default values
fromDateInputs.forEach(function(fromDateInput) {
    flatpickr(fromDateInput, {
        dateFormat: 'd', // Show date in YYYY-MM-DD format
        defaultDate: today, // Set default selected date to today for check-in
        minDate: today, // Set minimum date to today
        // Additional options...
        onChange: function(selectedDates, dateStr, instance) {
            updateMonth(monthIn, instance);
            updateDateStorage(fromDateInput, selectedDates[0]);
            
            // Set minDate for check-out date inputs
            toDateInputs.forEach(function(toDateInput) {
                var minCheckoutDate = new Date(selectedDates[0]);
                minCheckoutDate.setDate(minCheckoutDate.getDate() + 1); // Minimum check-out date is one day after check-in
                toDateInput._flatpickr.set("minDate", minCheckoutDate);
                toDateInput._flatpickr.setDate(minCheckoutDate, true); // Set the checkout date to the minimum allowed date
            });
        }
    });
});

toDateInputs.forEach(function(toDateInput) {
    flatpickr(toDateInput, {
        dateFormat: 'd', // Show date in YYYY-MM-DD format
        defaultDate: tomorrow, // Set default selected date to tomorrow for check-out
        // Additional options...
        onChange: function(selectedDates, dateStr, instance) {
            updateMonth(monthOut, instance);
            updateDateStorage(toDateInput, selectedDates[0]);
        }
    });
});






    // Update displayed month initially
    updateMonth(monthIn, { selectedDates: [today] });
    updateMonth(monthOut, { selectedDates: [tomorrow] });

    // Function to update the displayed month
    function updateMonth(elements, instance) {
        var selectedDates = instance.selectedDates;
        if (selectedDates && selectedDates.length > 0) {
            var month = selectedDates[0].toLocaleString('default', { month: 'short' });
            elements.forEach(function(element) {
                element.textContent = month;
            });
        }
    }

    // Function to update the stored date value
    function updateDateStorage(inputElement, date) {
        inputElement.dataset.dateValue = formatDate(date);
    }

    // Handle guests increment and decrement
    var increaseButton = document.getElementById("increase");
    var decreaseButton = document.getElementById("decrease");

    increaseButton.addEventListener("click", function() {
        var currentValue = parseInt(guestsInput.textContent); // changed value to textContent
        guestsInput.textContent = currentValue + 1;
    });

    decreaseButton.addEventListener("click", function() {
        var currentValue = parseInt(guestsInput.textContent); // changed value to textContent
        if (currentValue > 1) {
            guestsInput.textContent = currentValue - 1;
        }
    });

    // Function to calculate the number of nights between two dates
    function calculateNights(checkin, checkout) {
        var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        var checkinDate = new Date(checkin);
        var checkoutDate = new Date(checkout);
        // Calculate the difference in milliseconds between the two dates
        var differenceMs = Math.abs(checkoutDate.getTime() - checkinDate.getTime());
        // Convert the difference to days and add 1 to include the check-out day
        var nights = Math.ceil(differenceMs / oneDay);
        return nights;
    }

    // Function to format date as YYYY-MM-DD
    function formatDate(date) {
        var year = date.getFullYear();
        var month = (date.getMonth() + 1).toString().padStart(2, '0');
        var day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Function to construct URL with selected dates and guests parameters
    function constructURL() {
        // Get the selected check-in and check-out dates
        var checkinDate = fromDateInputs[0].dataset.dateValue;
        var checkoutDate = toDateInputs[0].dataset.dateValue;

        // Get the number of guests
        var guests = guestsInput.textContent; // changed value to textContent

        // Calculate the number of nights
        var nights = calculateNights(checkinDate, checkoutDate);

        // Construct the URL
        var url = `https://downtownpark.reserve-online.net/?checkin=${checkinDate}&checkout=${checkoutDate}&rooms=1&nights=${nights}&adults=${guests}&src=606`;

        return url;
    }

    // Event listener for submit button click - Desktop widget
submitButton.addEventListener("click", function(event) {
    // Prevent the default form submission behavior
    event.preventDefault();
    // Construct the URL
    var url = constructURL();
    // Open the new window with the constructed URL
    window.open(url, "_blank");
});

// Event listener for submit button click - Mobile widget
var mobileSubmitButton = document.querySelector(".search-widget.mobile #submit-button");
if (mobileSubmitButton) {
    mobileSubmitButton.addEventListener("click", function(event) {
        // Prevent the default form submission behavior
        event.preventDefault();
        // Construct the URL
        var checkinDate = document.querySelector(".search-widget.mobile .checkin-date-text").dataset.dateValue;
        var checkoutDate = document.querySelector(".search-widget.mobile .checkout-date-text").dataset.dateValue;
        var guests = document.getElementById("guests").textContent;
        var nights = calculateNights(checkinDate, checkoutDate);
        var url = `https://downtownpark.reserve-online.net/?checkin=${checkinDate}&checkout=${checkoutDate}&rooms=1&nights=${nights}&adults=${guests}&src=606`;
        // Redirect to the constructed URL
        window.location.href = url;
    });
}

});
