export const startDateInput = document.getElementById("startDateInput");
export const endDateInput = document.getElementById("endDateInput");

const maxDateString = '2099-12-30';
const maxDate = new Date(maxDateString);

const minDateString = '1749-12-31T23:59:59';
const minDate = new Date(minDateString);

const currentDate = new Date();
startDateInput.value = dateToString(currentDate);

currentDate.setDate(currentDate.getDate() + 1);
endDateInput.value = dateToString(currentDate);
console.log("date managher");

startDateInput.addEventListener("blur", function () {
	if (startDateInput.value >= endDateInput.value) {
		const newStartDate = new Date(startDateInput.value);

		if (newStartDate > maxDate) {
			const newStartDate = new Date(maxDate);

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
			newStartDate = new Date(minDate);
			startDateInput.value = dateToString(newStartDate);
		}
	}
});

endDateInput.addEventListener("blur", function () {
	if (endDateInput.value <= startDateInput.value) {
		let newStartDate = new Date(endDateInput.value);

		if (newStartDate < minDate) {
			newStartDate = new Date(minDate);
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
			newEndDate = new Date(maxDate);
			endDateInput.value = DateManager.dateToString(newEndDate);
		}
	}
});

function dateToString(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}