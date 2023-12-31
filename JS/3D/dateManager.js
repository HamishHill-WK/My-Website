export const startDateInput = document.getElementById("startDateInput");
export const currentDateInput = document.getElementById("currentDateInput");
export const endDateInput = document.getElementById("endDateInput");

const maxDateString = '2099-12-30';
const maxDate = new Date(maxDateString);

const minDateString = '1749-12-31T23:59:59';
const minDate = new Date(minDateString);

const currentDate = new Date();
currentDate.setDate(currentDate.getDate() - 365 * 10);
startDateInput.value = dateToString(currentDate);
currentDateInput.value = startDateInput.value;

currentDate.setDate(currentDate.getDate() + 365 * 20);
endDateInput.value = dateToString(currentDate);

startDateInput.addEventListener("blur", function () {
	if (startDateInput.value >= endDateInput.value) {
		const newStartDate = new Date(startDateInput.value);

		if (newStartDate > maxDate) {
			const newStartDate = maxDate;

			newStartDate.setDate(newStartDate.getDate() - 1);

			startDateInput.value = dateToString(newStartDate);
		}

		const newEndDate = new Date(startDateInput.value);
		newEndDate.setDate(newEndDate.getDate() + 1);
		endDateInput.value = dateToString(newEndDate);
	}
	else {
		let newStartDate = new Date(startDateInput.value);
		if (newStartDate < minDate) {
			newStartDate = minDate;
			startDateInput.value = dateToString(newStartDate);
		}
	}
});

currentDateInput.addEventListener("blur", function () {
	console.log("you input " + currentDateInput);
	if (currentDateInput.value > endDateInput.value) {
		currentDateInput.value = endDateInput.value;
	}

	if (currentDateInput.value < startDateInput.value) {
		currentDateInput.value = startDateInput.value;
	}
});

endDateInput.addEventListener("blur", function () {
	if (endDateInput.value <= startDateInput.value) {
		let newStartDate = new Date(endDateInput.value);

		if (newStartDate < minDate) {
			newStartDate = minDate;
			startDateInput.value = dateToString(newStartDate);

			newStartDate.setDate(newStartDate.getDate() + 1);
			endDateInput.value = dateToString(newStartDate);
		}
		else {
			newStartDate.setDate(newStartDate.getDate() - 1);
			startDateInput.value = dateToString(newStartDate);
		}
	}
	else {
		let newEndDate = new Date(endDateInput.value);
		if (newEndDate > maxDate) {
			newEndDate = maxDate;
			endDateInput.value = dateToString(newEndDate);
		}
	}
});

function dateToString(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}