# A7 Framework: Lightweight and Powerful JavaScript for Modern Web Apps

A7 is a lean, yet powerful JavaScript framework designed to streamline the development of responsive and dynamic web applications.  It provides essential tools for managing modules, handling events, manipulating DOM data, making AJAX requests, and more, all while remaining incredibly lightweight and dependency-free.  A7 empowers you to build modern web experiences with less code and greater efficiency.

## Key Features

*   **Asynchronous Module Loading:** Load JavaScript, CSS, and JSON modules asynchronously with intelligent dependency management. This ensures optimal performance and prevents blocking the main thread.
*   **Robust Event Handling:** Easily manage application events with a simple and powerful API. Subscribe to and trigger custom events, as well as built-in A7 events like `moduleLoaded` and `breakpointChange`.
*   **DOM Data Management:** Associate arbitrary data with DOM elements using a `WeakMap`, providing a safe and efficient way to store element-specific information.
*   **Enhanced AJAX Requests:** Make AJAX calls with a jQuery-like API, featuring `done`, `fail`, `always`, and `timeout` handlers for flexible response management. Includes timeout functionality.
*   **Responsive Design Made Easy:** A7 automatically adds classes to the `<html>` element based on the current breakpoint, simplifying the creation of responsive layouts.
*   **Lightweight and Dependency-Free:** A7 has a minimal footprint and doesn't rely on any external libraries, making it easy to integrate into any project.

## Installation

Simply copy the `a7.js` file into your project and include it in your HTML:

```html
<script src="a7.js"></script>
```

The `A7` object will be globally available immediately after the script is included.

## API Reference

### Module Loading

*   **`A7.loadModule(name, config)`:** Loads a single module.
    *   `name` (string): The name of the module.
    *   `config` (object): Configuration object with `css`, `js`, and `json` properties specifying URLs.
    *   Returns a `Promise` that resolves with the module data or rejects with an error.  If the module is already loaded, the promise resolves immediately with the existing module data.

*   **`A7.loadModules(moduleDefinitions)`:** Loads multiple modules with dependency management.
    *   `moduleDefinitions` (object): An object where keys are module names and values are their configurations (like the `loadModule` config). The `dependsOn` property can specify dependencies as a string or an array of strings.
    *   Returns a `Promise` that resolves with an array of module data when all modules are loaded or rejects with an error.

*   **`A7.getModule(name)`:** Retrieves the status of a loaded module.
    *   `name` (string): The name of the module.
    *   Returns the module object (with `loading`, `loaded`, `data`, and `error` properties) or `undefined` if the module is not found.

### Event Handling

*   **`A7.on(event, callback)`:** Subscribes to an event.
    *   `event` (string): The event name.
    *   `callback` (function): The function to execute when the event is triggered.

*   **`A7.off(event, callback)`:** Unsubscribes from an event.
    *   `event` (string): The event name.
    *   `callback` (function): The function to remove.

*   **`A7.trigger(event, ...args)`:** Triggers an event.
    *   `event` (string): The event name.
    *   `...args`: Arguments to pass to the event handlers.  Available events: `moduleLoaded`, `moduleError`, `modulesLoaded`, `modulesError`, `moduleLoadedInGroup`, `breakpointChange`.

### DOM Data Manipulation

*   **`element.data(key, value)`:** Sets or gets data associated with a DOM element.
    *   `key` (string or object): The data key (string) or an object of key-value pairs.
    *   `value` (*): The value to associate with the key.
    *   Returns the element (for chaining) if setting data, the value associated with the key (if getting data), or all data (if called without arguments).

*   **`element.removeData(key)`:** Removes data associated with a DOM element.
    *   `key` (string, optional): The key to remove. If omitted, all data is removed.
    *   Returns the element (for chaining).

### AJAX Requests

*   **`A7.ajax(options)`:** Makes an AJAX request.
    *   `options` (object): Request configuration.
        *   `url` (string, required): The URL to request.
        *   `method` (string, optional): The HTTP method (default: 'GET').
        *   `data` (object, optional): Data to send with the request.  For `GET` requests, data is appended to the URL as query parameters. For other methods, data is sent as JSON.
        *   `headers` (object, optional): Custom headers.  `Content-Type: application/json` is automatically added for requests with a data payload and non-`GET` methods.
        *   `timeout` (number, optional): Timeout in milliseconds.
    *   Returns an object with the following methods:
        *   `done(callback)`: Executes the callback on successful request completion.  The callback receives the parsed JSON response.
        *   `fail(callback)`: Executes the callback on request failure (network error or non-2xx status code). The callback receives an `Error` object.
        *   `always(callback)`: Executes the callback regardless of success or failure.
        *   `timeout(callback)`: Executes the callback if the request times out. The callback receives an `Error` object.

### Breakpoint Handling

A7 automatically adds classes to the `<html>` element based on the current breakpoint. You can use these classes to apply breakpoint-specific styles.  The available breakpoint classes are: `a7-breakpoint-xs`, `a7-breakpoint-sm`, `a7-breakpoint-md`, `a7-breakpoint-lg`, and `a7-breakpoint-xl`.  The default breakpoints are:

*   `sm`: 576px
*   `md`: 768px
*   `lg`: 992px
*   `xl`: 1200px

You can customize these breakpoints in the `A7` constructor:

```javascript
const a7 = new A7({
  breakpoints: {
    sm: 600, // Customized breakpoint
    md: 800,
    lg: 1000,
    xl: 1200
  }
});
```


### Utility Methods

*   **`A7.getModule(name)`:** Retrieves the status of a loaded module.  See Module Loading for details.
*   **`A7.debounce(func, delay)`:** Creates a debounced version of a function.
    *   `func` (function): The function to debounce.
    *   `delay` (number): The delay in milliseconds.
    *   Returns the debounced function.


## Examples

### Example: Loading Modules

```javascript
// Load a single module
A7.loadModule('myModule', { js: 'my-module.js' })
  .then(module => {
    console.log('Module loaded:', module.data);
    MyModule.init(); // Initialize the module (if it has an init function)
  })
  .catch(error => console.error('Module load error:', error));


// Load multiple modules with dependencies
A7.loadModules({
    'moduleA': { js: 'module-a.js' },
    'moduleB': { js: 'module-b.js', dependsOn: 'moduleA' }
}).then(modules => {
    console.log('Modules loaded:', modules);
    ModuleA.init();
    ModuleB.init();
}).catch(error => console.error('Modules load error:', error));
```

### Example: Event Handling

```javascript
// Subscribe to an event
A7.on('myCustomEvent', (data) => {
  console.log('My custom event triggered:', data);
});

// Trigger the event
A7.trigger('myCustomEvent', { message: 'Hello from A7!' });


// Using breakpoint change event
A7.on('breakpointChange', breakpoint => {
    console.log('Breakpoint changed to:', breakpoint); // xs, sm, md, lg, or xl
    // Add your breakpoint-specific logic here
});
```

### Example: DOM Data Manipulation

```javascript
const element = document.getElementById('myElement');

// Store data
element.data('clicks', 0);

element.addEventListener('click', () => {
  const clicks = element.data('clicks') || 0;
  element.data('clicks', clicks + 1);
  console.log('Clicks:', element.data('clicks
));
});

// Retrieve all data
console.log(element.data()); // { clicks: ... }

// Remove data
element.removeData('clicks');
```

### Example: AJAX Requests

```javascript
A7.ajax({
    url: '/api/data',
    method: 'POST',
    data: { name: 'A7 User', message: 'Hello API!' },
    timeout: 3000 // 3-second timeout
}).done(data => {
    console.log('Success:', data);
}).fail(error => {
    console.error('Error:', error.message);
}).always(() => {
    console.log('Request complete (success or error)');
}).timeout(() => {
    console.warn('Request timed out!');
});


A7.ajax({ url: '/api/users' })
  .done(users => console.log("Users:", users))
  .fail(err => console.error("Failed to fetch users:", err));
```

### Example: Responsive Design

```html
<div class="my-element">This element will change style based on breakpoint.</div>

<style>
  .my-element {
    padding: 20px;
    background-color: lightblue;
  }

  html.a7-breakpoint-sm .my-element {
    background-color: lightcoral;
  }

  html.a7-breakpoint-lg .my-element {
    background-color: lightgreen;
  }
</style>
```

### Example: Debouncing a Function

```javascript
function myFunction() {
  console.log('Function executed!');
}

const debouncedFunction = A7.debounce(myFunction, 300); // Debounce by 300ms

window.addEventListener('scroll', debouncedFunction); // Call the debounced function on scroll
```

## Contributing

Contributions are welcome! Feel free to submit pull requests or open issues.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
