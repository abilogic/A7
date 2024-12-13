/**
 * A7 Framework - A lightweight JavaScript framework for building responsive websites and SPAs.
 *
 * Features:
 *  - Responsive design with breakpoint tracking.
 *  - Asynchronous module loading (CSS, JS, JSON) with dependency management.
 *  - Event-driven architecture for managing module loading and breakpoint changes.
 *  - Ability to associate data with DOM elements using WeakMap.
 *  - Lightweight and dependency-free.
 *
 * Author: Alexander Momot
 * Date: October 26, 2023
 * License: MIT License
 */
(function () {
	const elementData = new WeakMap();

	class A7 {
		constructor() {
			this.modules = {};
			this.events = {};
			this.breakpoints = {
				sm: 576,
				md: 768,
				lg: 992,
				xl: 1200,
			};
			this.currentBreakpoint = this.getBreakpoint();
			this.syncBreakpointClass(); // Initial sync
			window.addEventListener('resize', this.handleResize.bind(this));

			// Add data methods to HTMLElement prototype
			this.extendHTMLElement();
		}

		/**
		 * Extends the HTMLElement prototype with data manipulation methods.
		 * This adds `data`, and `removeData` methods to all DOM elements.
		 *
		 * @returns {void}
		 */
		extendHTMLElement() {
			/**
			* Gets or sets data associated with the DOM element.
			*
			* @param {string|object} [key] - The key of the data to get or set, or an object to set multiple key-value pairs.
			* @param {*} [value] - The value to set for the given key.
			* @returns {object|*|HTMLElement} - If no arguments are passed, returns all data for the element.
			*                                 If a key is passed, returns the value for that key.
			*                                 If a key and value are passed, sets the data and returns the element.
			*                                 If an object is passed, sets multiple key-value pairs and returns the element.
			*/
			HTMLElement.prototype.data = function (key, value) {
				if (arguments.length === 0) {
					return elementData.get(this) || {};
				}
				if (arguments.length === 1 && typeof key === 'string') {
					const data = elementData.get(this);
					return data ? data[key] : undefined;
				}
				if (arguments.length === 1 && typeof key === 'object') {
					if (key === null || typeof key !== 'object' || Array.isArray(key)) {
						console.error('Invalid argument: key must be a non-null object.');
						return this;
					}
					elementData.set(this, key);
					return this;
				}
				if (arguments.length === 2 && typeof key === 'string') {
					let data = elementData.get(this) || {};
					data[key] = value;
					elementData.set(this, data);
					return this;
				}
				return this;
			};

			/**
			* Removes data associated with the DOM element.
			*
			* @param {string} [key] - The key of the data to remove. If no key is provided, all data is removed.
			* @returns {HTMLElement} - Returns the element for chaining.
			*/
			HTMLElement.prototype.removeData = function (key) {
				if (arguments.length === 0) {
					elementData.delete(this);
				} else if (arguments.length === 1 && typeof key === 'string') {
					const data = elementData.get(this);
					if (data) {
						delete data[key];
						if (Object.keys(data).length === 0) {
							elementData.delete(this);
						} else {
							elementData.set(this, data);
						}
					}
				}
				return this;
			};
		}


		/**
		 * Determines the current breakpoint based on the window width.
		 *
		 * @returns {string} - The current breakpoint ('xs', 'sm', 'md', 'lg', or 'xl').
		 */
		getBreakpoint() {
			const width = window.innerWidth;
			if (width < this.breakpoints.sm) return 'xs';
			if (width < this.breakpoints.md) return 'sm';
			if (width < this.breakpoints.lg) return 'md';
			if (width < this.breakpoints.xl) return 'lg';
			return 'xl';
		}

		/**
		 * Handles the window resize event, updates the current breakpoint,
		 * and triggers the 'breakpointChange' event if the breakpoint has changed.
		 *
		 * @returns {void}
		 */
		handleResize() {
			const newBreakpoint = this.getBreakpoint();
			if (newBreakpoint !== this.currentBreakpoint) {
				this.currentBreakpoint = newBreakpoint;
				this.syncBreakpointClass(); // Sync on resize
				this.trigger('breakpointChange', newBreakpoint);
			}
		}

		/**
		 * Synchronizes the breakpoint class on the <html> element.
		 * This adds a class like 'a7-breakpoint-sm' to the <html> element
		 * based on the current breakpoint.
		 *
		 * @returns {void}
		 */
		syncBreakpointClass() {
			const htmlElement = document.documentElement;
			const breakpointClassPrefix = 'a7-breakpoint-';
			// Remove existing breakpoint classes
			htmlElement.classList.forEach(className => {
				if (className.startsWith(breakpointClassPrefix)) {
					htmlElement.classList.remove(className);
				}
			});
			// Add new breakpoint class
			htmlElement.classList.add(breakpointClassPrefix + this.currentBreakpoint);
		}


		/**
		 * Subscribes a callback function to a specific event.
		 *
		 * @param {string} event - The name of the event to subscribe to.
		 * @param {function} callback - The callback function to execute when the event is triggered.
		 * @returns {void}
		 */
		on(event, callback) {
			if (typeof event !== 'string') {
				console.error('Invalid argument: event must be a string.');
				return;
			}
			if (typeof callback !== 'function') {
				console.error('Invalid argument: callback must be a function.');
				return;
			}
			if (!this.events[event]) {
				this.events[event] = [];
			}
			this.events[event].push(callback);
		}

		/**
		 * Unsubscribes a callback function from a specific event.
		 *
		 * @param {string} event - The name of the event to unsubscribe from.
		 * @param {function} callback - The callback function to remove.
		 * @returns {void}
		 */
		off(event, callback) {
			if (typeof event !== 'string') {
				console.error('Invalid argument: event must be a string.');
				return;
			}
			if (typeof callback !== 'function') {
				console.error('Invalid argument: callback must be a function.');
				return;
			}
			if (this.events[event]) {
				this.events[event] = this.events[event].filter(cb => cb !== callback);
			}
		}

		/**
		 * Triggers a specific event, executing all subscribed callback functions.
		 *
		 * @param {string} event - The name of the event to trigger.
		 * @param {...*} args - Any arguments to pass to the callback functions.
		 * @returns {void}
		 */
		trigger(event, ...args) {
			if (typeof event !== 'string') {
				console.error('Invalid argument: event must be a string.');
				return;
			}
			if (this.events[event]) {
				this.events[event].forEach(callback => callback(...args));
			}
		}

		/**
		 * Makes an AJAX request.
		 *
		 * @param {object} options - Configuration object for the request.
		 * @param {string} options.url - The URL to request.
		 * @param {string} [options.method='GET'] - The HTTP method.
		 * @param {object} [options.data] - The data to send with the request.
		 * @param {object} [options.headers] - Custom headers.
		 * @param {number} [options.timeout] - Timeout in milliseconds.
		 * @returns {object} - An object with `done`, `fail`, `always`, and `timeout` methods for handling the response.
		 */
		ajax(options) {
			if (!options || typeof options !== 'object') {
				throw new Error('Invalid argument: options must be an object.');
			}
			if (!options.url || typeof options.url !== 'string') {
				throw new Error('Invalid argument: options.url must be a string.');
			}

			const url = options.url;
			const method = options.method || 'GET';
			const data = options.data;
			const headers = options.headers || {};
			const timeout = options.timeout;

			let timeoutId;
			let timeoutPromise = new Promise((_, reject) => {
				if (timeout) {
					timeoutId = setTimeout(() => {
						reject(new Error('Request timed out'));
					}, timeout);
				}
			});

			let fetchOptions = {
				method,
				headers
			};

			if (data) {
				if (method === 'GET') {
					const queryParams = new URLSearchParams(data);
					url += (url.includes('?') ? '&' : '?') + queryParams.toString();
				} else {
					fetchOptions.body = JSON.stringify(data);
					headers['Content-Type'] = 'application/json';
				}
			}

			const requestPromise = fetch(url, fetchOptions);

			let promise = Promise.race([requestPromise, timeoutPromise])
				.then(response => {
					clearTimeout(timeoutId);
					if (!response.ok) {
						throw new Error(`HTTP error! Status: ${response.status}`);
					}
					return response.json();
				})
				.catch(error => {
					clearTimeout(timeoutId);
					throw error;
				});

			const api = {
				done: function (callback) {
					promise = promise.then(callback);
					return api;
				},
				fail: function (callback) {
					promise = promise.catch(callback);
					return api;
				},
				always: function (callback) {
					promise = promise.finally(callback);
					return api;
				},
				timeout: function (callback) {
					timeoutPromise.then(() => { }).catch(callback); // Empty then to handle only timeouts
					return api;
				}
			};

			return api;
		}

		/**
		 * Loads a single module asynchronously.
		 * If the module is already loaded, resolves the promise immediately.
		 *
		 * @param {string} name - The name of the module.
		 * @param {object} config - The configuration object for the module.
		 * @returns {Promise<object>} - A Promise that resolves with the module data.
		 */
		async loadModule(name, config) {
			if (typeof name !== 'string') {
				return Promise.reject(new Error('Invalid argument: name must be a string.'));
			}
			if (!config || typeof config !== 'object') {
				return Promise.reject(new Error('Invalid argument: config must be an object.'));
			}

			if (this.modules[name]) {
				// Module already loaded, resolve immediately.
				return Promise.resolve(this.modules[name]);
			}

			this.modules[name] = {
				loading: true,
				loaded: false,
				data: null,
				error: null,
			};

			const promises = [];

			if (config.css) {
				promises.push(this.loadCSS(config.css));
			}
			if (config.js) {
				promises.push(this.loadJS(config.js));
			}
			if (config.json) {
				promises.push(this.loadJSON(config.json));
			}

			try {
				const results = await Promise.all(promises);
				this.modules[name].loading = false;
				this.modules[name].loaded = true;
				this.modules[name].data = results.reduce((acc, result) => ({ ...acc, ...result }), {});
				this.trigger('moduleLoaded', name, this.modules[name].data);
				return this.modules[name];
			} catch (error) {
				this.modules[name].loading = false;
				this.modules[name].error = error;
				this.trigger('moduleError', name, error);
				console.error(`Error loading module "${name}":`, error);
				return this.modules[name];
			}
		}

		/**
		 * Loads multiple modules asynchronously, respecting their dependencies.
		 *
		 * @param {object} moduleDefinitions - An object where keys are module names and values are their configurations.
		 * @returns {Promise<Array<object>>} - A Promise that resolves with an array of loaded module data when all modules are loaded or rejects with an error.
		 */
		loadModules(moduleDefinitions) {
			if (!moduleDefinitions || typeof moduleDefinitions !== 'object') {
				console.error('Invalid argument: moduleDefinitions must be an object.');
				return Promise.reject(new Error('Invalid argument: moduleDefinitions must be an object.'));
			}

			const loadQueue = [];
			const loadedModules = new Set();
			const moduleConfigs = {};

			// Prepare module configurations and dependencies
			for (const key in moduleDefinitions) {
				if (moduleDefinitions.hasOwnProperty(key)) {
					const definition = moduleDefinitions[key];
					if (!definition || typeof definition !== 'object') {
						console.error(`Invalid module definition for "${key}": must be an object.`);
						return Promise.reject(new Error(`Invalid module definition for "${key}": must be an object.`));
					}
					moduleConfigs[key] = { ...definition };
					moduleConfigs[key].name = key;
				}
			}

			// Function to add modules to the queue
			const addToQueue = (moduleName) => {
				if (loadedModules.has(moduleName)) {
					return;
				}

				const config = moduleConfigs[moduleName];
				if (!config) {
					console.error(`Module "${moduleName}" not defined.`);
					return;
				}

				if (config.dependsOn) {
					if (!Array.isArray(config.dependsOn) && typeof config.dependsOn !== 'string') {
						console.error(`Invalid dependsOn property for "${moduleName}": must be a string or an array of strings.`);
						return;
					}
					if (Array.isArray(config.dependsOn)) {
						config.dependsOn.forEach(dep => {
							if (typeof dep !== 'string') {
								console.error(`Invalid dependency for "${moduleName}": must be a string.`);
								return;
							}
							addToQueue(dep);
						});
					} else {
						addToQueue(config.dependsOn);
					}
				}

				loadQueue.push(moduleName);
			};

			// Start adding modules to the queue
			for (const moduleName in moduleConfigs) {
				if (moduleConfigs.hasOwnProperty(moduleName)) {
					addToQueue(moduleName);
				}
			}

			// Load modules sequentially
			const loadNext = (index) => {
				if (index >= loadQueue.length) {
					const loadedModulesArray = loadQueue.map(name => this.modules[name]);
					this.trigger('modulesLoaded', loadQueue, loadedModulesArray);
					return Promise.resolve(loadedModulesArray);
				}

				const moduleName = loadQueue[index];
				return this.loadModule(moduleName, moduleConfigs[moduleName])
					.then(module => {
						loadedModules.add(moduleName);
						this.trigger('moduleLoadedInGroup', moduleName, module);
						return loadNext(index + 1);
					})
					.catch(error => {
						this.trigger('modulesError', loadQueue, error);
						console.error(`Error loading modules:`, error);
						throw error;
					});
			};

			return loadNext(0);
		}


		/**
		 * Loads a CSS file asynchronously.
		 *
		 * @param {string} url - The URL of the CSS file.
		 * @returns {Promise<void>} - A Promise that resolves when the CSS file is loaded or rejects with an error.
		 */
		loadCSS(url) {
			if (typeof url !== 'string') {
				return Promise.reject(new Error('Invalid argument: url must be a string.'));
			}

			return new Promise((resolve, reject) => {
				const link = document.createElement('link');
				link.rel = 'stylesheet';
				link.href = url;
				link.onload = () => resolve();
				link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));
				document.head.appendChild(link);
			});
		}

		/**
		 * Loads a JavaScript file asynchronously.
		 *
		 * @param {string} url - The URL of the JavaScript file.
		 * @returns {Promise<void>} - A Promise that resolves when the JavaScript file is loaded or rejects with an error.
		 */
		loadJS(url) {
			if (typeof url !== 'string') {
				return Promise.reject(new Error('Invalid argument: url must be a string.'));
			}
			return new Promise((resolve, reject) => {
				const script = document.createElement('script');
				script.src = url;
				script.onload = () => resolve();
				script.onerror = () => reject(new Error(`Failed to load JS: ${url}`));
				document.head.appendChild(script);
			});
		}

		/**
		 * Loads a JSON file asynchronously.
		 *
		 * @param {string} url - The URL of the JSON file.
		 * @returns {Promise<object>} - A Promise that resolves with the JSON data or rejects with an error.
		 */
		async loadJSON(url) {
			if (typeof url !== 'string') {
				return Promise.reject(new Error('Invalid argument: url must be a string.'));
			}
			try {
				const response = await fetch(url);
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				const data = await response.json();
				return { json: data };
			} catch (error) {
				throw new Error(`Failed to load JSON: ${url} - ${error.message}`);
			}
		}

		/**
		 * Gets the status of a loaded module.
		 *
		 * @param {string} name - The name of the module.
		 * @returns {object|undefined} - The module object containing loading, loaded, data, and error properties, or undefined if the module is not found.
		 */
		getModule(name) {
			if (typeof name !== 'string') {
				console.error('Invalid argument: name must be a string.');
				return;
			}
			return this.modules[name];
		}

		/**
		 * Creates a debounced version of a function.
		 *
		 * @param {function} func - The function to debounce.
		 * @param {number} delay - The delay in milliseconds.
		 * @returns {function} - The debounced function.
		 */
		debounce(func, delay) {
			if (typeof func !== 'function') {
				console.error('Invalid argument: func must be a function.');
				return;
			}
			if (typeof delay !== 'number' || delay < 0) {
				console.error('Invalid argument: delay must be a non-negative number.');
				return;
			}

			let timeout;
			return function (...args) {
				const context = this;
				clearTimeout(timeout);
				timeout = setTimeout(() => func.apply(context, args), delay);
			};
		}
	}

	// Initialize the framework and make it globally available
	window.A7 = new A7();
})();                