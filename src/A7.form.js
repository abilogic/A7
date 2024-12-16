(function () {
	// Attempt to find the A7 library's global object
	let A7Global;

	// Check if A7Config exists and is an object
	if (window.A7Config && typeof window.A7Config === 'object' && window.A7Config.globalName) {
		A7Global = window[window.A7Config.globalName];
	} else {
		A7Global = window.A7;
	}


	// Check if the A7 library is available
	if (!A7Global) {
		console.error(
			"A7.form.js: A7 library not found. Please ensure A7.js is included before A7.form.js, and that A7Config is correctly configured if you're using a custom global name."
		);
		return; // Exit if A7 is not found
	}

	// Extend the A7 library with form-related methods
	A7Global.prototype.form = function (formElement) {
	}
})();