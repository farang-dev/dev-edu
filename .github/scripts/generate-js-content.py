import re

FILEPATH = "src/data/curriculum.ts"
with open(FILEPATH) as f:
    text = f.read()

# Each topic: (id, title, shortDesc, difficulty, readTimeMin, keyPoints, tags, content)
topics = [
    {
        "id": "ns-js-syntax",
        "title": "Syntax & Basics",
        "shortDesc": "Variables (var/let/const), data types, operators, type coercion, and strict mode.",
        "difficulty": "foundational",
        "readTimeMin": 12,
        "keyPoints": [
            "var is function-scoped and hoisted; let and const are block-scoped and not hoisted in the same way",
            "JavaScript has seven primitive types: string, number, boolean, null, undefined, bigint, symbol",
            "Dynamic typing means variables can hold any type without declaration; typeof operator inspects the type at runtime",
            "Type coercion happens automatically with == (loose equality); use === (strict equality) to avoid surprises",
            "The + operator concatenates strings but also adds numbers; other arithmetic operators coerce strings to numbers",
            "'use strict' at the top of a file or function enables stricter parsing and error-checking"
        ],
        "tags": ["javascript", "syntax", "variables", "data-types"],
        "content": """## What's This?

JavaScript syntax is the set of rules that govern how JavaScript code is written and interpreted by the engine. It is the grammar of the language — you must arrange words, symbols, and punctuation correctly for the computer to understand your instructions. JavaScript is a dynamic, weakly-typed scripting language that runs in browsers, on servers (Node.js), and increasingly everywhere. It exists because the web needed a programming language that could run in the browser to make pages interactive, and it has grown into one of the most widely-used languages in the world.

## The Big Picture

JavaScript syntax builds on familiar C-family conventions (curly braces, semicolons, operators) but adds dynamic typing, first-class functions, and prototypal inheritance. Variables use \`var\`, \`let\`, or \`const\` with different scoping rules. Seven primitive types form the foundation, and type coercion means values are automatically converted between types in certain contexts. Strict mode catches common mistakes. Mastering syntax fundamentals is essential before moving to DOM manipulation, async patterns, frameworks, or Node.js.

## Core Ideas

### Variables: var, let, const

\`var\` is function-scoped and hoisted to the top of its function. \`let\` and \`const\` are block-scoped (confined to {}) and are not accessible before their declaration (temporal dead zone). \`const\` cannot be reassigned, but objects declared with \`const\` can still have their properties modified.

\`\`\`javascript
var name = "Alice";        // Function-scoped, hoisted
let age = 30;              // Block-scoped, not hoisted
const PI = 3.14159;        // Block-scoped, cannot be reassigned

if (true) {
    var x = 1;             // x escapes the block
    let y = 2;             // y is confined to this block
}
console.log(x);            // 1
console.log(y);            // ReferenceError
\`\`\`

### Seven Primitive Types

JavaScript has seven primitive types (immutable, not objects) and one complex type (object). The \`typeof\` operator returns a string naming the type.

\`\`\`javascript
typeof "hello";             // "string"
typeof 42;                  // "number"
typeof true;                // "boolean"
typeof null;                // "object" (historical quirk)
typeof undefined;           // "undefined"
typeof 100n;                // "bigint"
typeof Symbol("id");        // "symbol"
typeof {};                  // "object"
\`\`\`

### Type Coercion and Equality

\`==\` performs type coercion before comparing; \`===\` compares both value and type without coercion. Prefer \`===\` to avoid unexpected conversions.

\`\`\`javascript
5 == "5";                   // true (string "5" coerced to number 5)
5 === "5";                  // false (number vs string)
0 == false;                 // true (false coerces to 0)
0 === false;                // false
null == undefined;          // true (special rule)
null === undefined;         // false
\`\`\`

### Operators

Arithmetic (\`+\`, \`-\`, \`*\`, \`/\`, \`%\`), comparison (\`===\`, \`!==\`, \`>\`, \`<\`, \`>=\`, \`<=\`), logical (\`&&\`, \`||\`, \`!\`), and assignment (\`=\`, \`+=\`, \`-=\`). The \`+\` operator is overloaded: it adds numbers and concatenates strings.

\`\`\`javascript
let sum = 10 + 5;           // 15
let msg = "Hello, " + "World"; // "Hello, World"
let truth = (10 > 5) && (3 < 8); // true
let result = 2 ** 8;        // 256 (exponentiation, ES2016)
\`\`\`

### Strict Mode

\`"use strict"\` enables a stricter variant of JavaScript that catches silent errors, prohibits certain syntax, and improves security. Place it at the top of a file or function.

\`\`\`javascript
"use strict";

x = 3.14;                   // ReferenceError (x not declared)
// Without strict mode, this would silently create a global variable
\`\`\`

## Wiring It Together

A program that reads a user's name, applies a greeting based on the time of day, and logs the result — demonstrating variables, types, operators, and strict equality.

\`\`\`javascript
"use strict";

function getGreeting(name) {
    const hour = new Date().getHours();

    if (hour < 12) {
        return "Good morning, " + name;
    } else if (hour < 18) {
        return "Good afternoon, " + name;
    } else {
        return "Good evening, " + name;
    }
}

const userName = "Alice";
const message = getGreeting(userName);
console.log(message);

// Verify the types
console.log(typeof message);       // "string"
console.log(typeof getGreeting);   // "function"
\`\`\`

This ties variables (\`const\`), types (\`string\`, \`number\`), operators (comparison, concatenation), control flow (\`if\`), and strict mode into a complete, working script.
"""
    },
    {
        "id": "ns-js-control-flow",
        "title": "Control Flow & Functions",
        "shortDesc": "Conditionals, loops, function declarations vs expressions, arrow functions, and default parameters.",
        "difficulty": "foundational",
        "readTimeMin": 12,
        "keyPoints": [
            "if/else if/else evaluates conditions in order and executes the first true block; switch compares with strict equality",
            "for loops use a counter; while loops check before each iteration; do/while checks after running once",
            "forEach, map, filter, and reduce iterate over arrays with callback functions",
            "Function declarations are hoisted; function expressions and arrow functions are not",
            "Arrow functions inherit this from the enclosing scope and cannot be used as constructors",
            "Default parameters (param = value) handle missing arguments without explicit undefined checks"
        ],
        "tags": ["javascript", "control-flow", "functions", "loops"],
        "content": """## What's This?

Control flow and functions are the mechanisms that let your JavaScript code make decisions, repeat tasks, and organize logic into reusable units. Control flow statements like \`if\`, \`for\`, and \`switch\` determine which code blocks execute based on conditions. Functions package a sequence of statements under a name so you can call them from anywhere without duplicating code. They exist because programs would be unmanageable without conditional logic, loops, and modular organization — every nontrivial application needs these building blocks.

## The Big Picture

Control flow and functions form the backbone of every JavaScript application. Conditionals handle routing logic, input validation, and permissions. Loops process arrays, DOM node lists, and API response data. Functions encapsulate everything from event handlers to data transformations. The distinction between function declarations, function expressions, and arrow functions affects hoisting behavior and how \`this\` is bound. Mastering these fundamentals is essential before moving to DOM manipulation, async patterns, or any framework.

## Core Ideas

### Conditionals: if, else, switch

\`if\` evaluates a boolean expression and executes the corresponding block. \`switch\` compares an expression to multiple cases using strict equality (\`===\`).

\`\`\`javascript
const score = 85;
let grade;

if (score >= 90) {
    grade = "A";
} else if (score >= 80) {
    grade = "B";
} else if (score >= 70) {
    grade = "C";
} else {
    grade = "F";
}

// switch with strict comparison
const day = 3;
let dayName;
switch (day) {
    case 1: dayName = "Monday"; break;
    case 2: dayName = "Tuesday"; break;
    case 3: dayName = "Wednesday"; break;
    default: dayName = "Unknown";
}
\`\`\`

### Loops: for, while, do/while, forEach

\`for\` uses a counter pattern. \`while\` checks a condition before each iteration. \`do/while\` runs at least once. Array methods like \`forEach\`, \`map\`, and \`filter\` provide functional iteration.

\`\`\`javascript
// Classic for loop
for (let i = 0; i < 5; i++) {
    console.log(i);          // 0, 1, 2, 3, 4
}

// While loop
let count = 0;
while (count < 5) {
    console.log(count);      // 0, 1, 2, 3, 4
    count++;
}

// forEach on an array
const fruits = ["apple", "banana", "cherry"];
fruits.forEach((fruit, index) => {
    console.log(index + ": " + fruit);
});

// map creates a new transformed array
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2); // [2, 4, 6]
\`\`\`

### Function Declarations vs Expressions

Function declarations are hoisted (callable before definition). Function expressions and arrow functions are not.

\`\`\`javascript
// Function declaration — hoisted
console.log(add(2, 3));      // 5 (works!)
function add(a, b) {
    return a + b;
}

// Function expression — not hoisted
// console.log(subtract(5, 2));  // ReferenceError
const subtract = function(a, b) {
    return a - b;
};

// Arrow function — not hoisted, inherits this
const multiply = (a, b) => a * b;
\`\`\`

### Arrow Functions

Arrow functions provide a concise syntax and lexically bind \`this\` (they inherit \`this\` from the enclosing scope rather than creating their own).

\`\`\`javascript
// Single parameter, single expression: no parens, no braces, implicit return
const square = x => x * x;

// Multiple parameters require parens
const sum = (a, b) => a + b;

// Multiple statements require braces and explicit return
const greet = (name) => {
    const prefix = "Hello";
    return prefix + ", " + name;
};
\`\`\`

### Default Parameters

Default parameter values are used when the argument is \`undefined\` (or omitted). They are evaluated at call time, not definition time.

\`\`\`javascript
function greet(name = "Guest", greeting = "Hello") {
    return greeting + ", " + name;
}

console.log(greet("Alice"));          // "Hello, Alice"
console.log(greet());                 // "Hello, Guest"
console.log(greet("Bob", "Hi"));      // "Hi, Bob"
\`\`\`

## Wiring It Together

A function that processes an array of user objects, filters by age, maps to formatted strings, and joins them — demonstrating loops, conditionals, arrow functions, and default parameters.

\`\`\`javascript
const users = [
    { name: "Alice", age: 25 },
    { name: "Bob", age: 17 },
    { name: "Charlie", age: 30 },
    { name: "Diana", age: 16 },
];

function formatAdultUsers(userList, minAge = 18) {
    const adults = userList.filter(user => user.age >= minAge);
    const formatted = adults.map(user => user.name + " (" + user.age + ")");
    return formatted.join(", ");
}

console.log(formatAdultUsers(users));
// "Alice (25), Charlie (30)"

console.log(formatAdultUsers(users, 21));
// "Alice (25), Charlie (30)"
\`\`\`

This ties conditionals (\`filter\` callback), loops (\`map\` iterates), arrow functions, and default parameters into a realistic data-processing pipeline.
"""
    },
    {
        "id": "ns-js-dom",
        "title": "DOM Manipulation & Events",
        "shortDesc": "Selecting elements, modifying the DOM, event propagation (capture/bubble), and event delegation.",
        "difficulty": "foundational",
        "readTimeMin": 13,
        "keyPoints": [
            "querySelector and querySelectorAll use CSS selectors to find elements in the DOM tree",
            "innerHTML, textContent, setAttribute, and classList modify element content and appearance",
            "createElement, appendChild, and removeChild dynamically add and remove DOM nodes",
            "The event flow has three phases: capture (root to target), target, and bubble (target to root)",
            "Event delegation attaches a single listener to a parent to handle events from many children using event.target",
            "addEventListener attaches handlers; removeEventListener detaches them; event.preventDefault stops default behavior"
        ],
        "tags": ["javascript", "DOM", "events", "browser"],
        "content": """## What's This?

The Document Object Model (DOM) is a programming interface that represents an HTML document as a tree of objects that JavaScript can manipulate. Think of it as a live map of the webpage: every HTML element is a node you can find, read, change, or delete. The DOM exists because static HTML is not enough for modern web applications — you need to dynamically update content, respond to user interactions, and create rich interfaces. JavaScript's DOM API is the bridge between your code and what the user sees and interacts with.

## The Big Picture

DOM manipulation is the foundation of client-side JavaScript. Every framework (React, Vue, Angular) ultimately manipulates the DOM — they just do it more efficiently than raw DOM calls. Understanding how to select elements, modify their content and attributes, create and remove nodes, and handle events is essential before using any library or framework. Event propagation (capture and bubble phases) explains why events behave the way they do, and event delegation enables performant handling of dynamic content.

## Core Ideas

### Selecting Elements

\`querySelector\` returns the first matching element; \`querySelectorAll\` returns a static NodeList. Older methods like \`getElementById\` and \`getElementsByClassName\` still work but are less flexible.

\`\`\`javascript
const header = document.querySelector("h1");
const buttons = document.querySelectorAll(".btn");
const container = document.getElementById("app");
const items = document.getElementsByClassName("item");
\`\`\`

### Modifying Content and Attributes

\`textContent\` sets plain text (safe against XSS). \`innerHTML\` parses HTML (use carefully). \`setAttribute\` and \`classList\` modify attributes and classes.

\`\`\`javascript
const el = document.querySelector("#greeting");

el.textContent = "Hello, World!";          // Safe text replacement
el.innerHTML = "<strong>Hello</strong>";   // Parses HTML (XSS risk)
el.setAttribute("data-id", "123");
el.classList.add("active");                // Add a CSS class
el.classList.remove("hidden");             // Remove a CSS class
el.classList.toggle("visible");            // Toggle on/off
\`\`\`

### Creating and Removing Elements

\`createElement\` makes a new element, \`appendChild\` and \`append\` add it to the tree, \`removeChild\` and \`remove\` delete it.

\`\`\`javascript
const list = document.querySelector("ul");

const item = document.createElement("li");
item.textContent = "New item";
list.appendChild(item);                    // Add to end

const first = document.createElement("li");
first.textContent = "First item";
list.prepend(first);                       // Add to beginning

list.removeChild(item);                    // Remove specific child
// Or: item.remove();                      // Modern direct removal
\`\`\`

### Event Propagation: Capture, Target, Bubble

When an event fires on an element, it goes through three phases: capture (from document root down to the target), target (the element itself), and bubble (from the target back up to the root).

\`\`\`javascript
document.querySelector("div").addEventListener("click", () => {
    console.log("div — bubble phase");
});

document.querySelector("div").addEventListener("click", () => {
    console.log("div — capture phase");
}, { capture: true });
\`\`\`

### Event Delegation

Instead of attaching a listener to each child, attach one to the parent and use \`event.target\` to identify which child was clicked. This works for dynamically added elements.

\`\`\`javascript
document.querySelector("ul").addEventListener("click", (event) => {
    if (event.target.tagName === "LI") {
        console.log("Clicked:", event.target.textContent);
    }
});

// Works even for LI elements added after this code runs
\`\`\`

## Wiring It Together

A todo list that lets users add and remove items — demonstrating selecting, creating, modifying elements, and event delegation.

\`\`\`javascript
const list = document.querySelector("#todo-list");
const input = document.querySelector("#new-todo");
const addBtn = document.querySelector("#add-btn");

function addTodo() {
    const text = input.value.trim();
    if (text === "") return;

    const item = document.createElement("li");
    item.textContent = text;
    list.appendChild(item);
    input.value = "";
}

// Event delegation: remove items on click
list.addEventListener("click", (event) => {
    if (event.target.tagName === "LI") {
        event.target.remove();
    }
});

addBtn.addEventListener("click", addTodo);
input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addTodo();
});
\`\`\`

This ties selection (\`querySelector\`), creation (\`createElement\`), modification (\`textContent\`, \`appendChild\`), and event delegation into a complete interactive widget.
"""
    },
    {
        "id": "ns-js-es6",
        "title": "ES6+ Features",
        "shortDesc": "Destructuring, spread/rest, template literals, optional chaining, nullish coalescing, and modules.",
        "difficulty": "foundational",
        "readTimeMin": 12,
        "keyPoints": [
            "Destructuring unpacks arrays and objects into individual variables with a concise syntax",
            "Spread (...) expands an iterable into individual elements; rest collects remaining elements into an array",
            "Template literals use backticks and ${} interpolation for multi-line strings with embedded expressions",
            "Optional chaining (?.) short-circuits to undefined if a reference is nullish instead of throwing",
            "Nullish coalescing (??) returns the right operand only when the left is null or undefined (not falsy)",
            "ES modules use export and import with static analysis for tree-shaking and better dependency management"
        ],
        "tags": ["javascript", "es6", "es2015", "modern-javascript"],
        "content": """## What's This?

ES6 (ECMAScript 2015) and subsequent yearly releases brought transformative changes to JavaScript — new syntax, new APIs, and new paradigms that make code more readable, concise, and less error-prone. These features are not just syntactic sugar; they change how you structure and think about code. Destructuring, spread/rest, template literals, optional chaining, and nullish coalescing eliminate entire categories of boilerplate and bugs. Modules bring proper encapsulation and dependency management to the language.

## The Big Picture

ES6+ features are the foundation of modern JavaScript. Every codebase — from vanilla JS to React, Vue, Node.js, and TypeScript — uses these features extensively. They replace older patterns: destructuring replaces manual property extraction, template literals replace string concatenation, arrow functions replace function expressions, and modules replace script tags with global variables. Mastering ES6+ is essential for reading and writing contemporary JavaScript code.

## Core Ideas

### Destructuring

Destructuring extracts values from arrays or properties from objects into individual variables using a pattern that mirrors the structure.

\`\`\`javascript
// Array destructuring
const [first, second, third] = [10, 20, 30];
console.log(first);                      // 10

// Object destructuring
const user = { name: "Alice", age: 30 };
const { name, age } = user;
console.log(name);                       // "Alice"

// Renaming and defaults
const { name: userName, role = "user" } = user;
console.log(userName);                   // "Alice"
console.log(role);                       // "user"
\`\`\`

### Spread and Rest

\`...\` serves two roles: spread (expands an iterable) and rest (collects remaining elements).

\`\`\`javascript
// Spread: expand array into elements
const nums = [1, 2, 3];
const combined = [...nums, 4, 5];        // [1, 2, 3, 4, 5]

// Spread: merge objects (shallow)
const base = { x: 1, y: 2 };
const extended = { ...base, z: 3 };      // { x: 1, y: 2, z: 3 }

// Rest: collect remaining parameters
function sum(first, ...rest) {
    return rest.reduce((acc, n) => acc + n, first);
}
console.log(sum(1, 2, 3, 4));            // 10

// Rest: collect remaining properties
const { name, ...details } = { name: "Alice", age: 30, role: "admin" };
console.log(details);                    // { age: 30, role: "admin" }
\`\`\`

### Template Literals

Template literals use backticks instead of quotes, support multi-line strings, and embed expressions with \`\${}\`.

\`\`\`javascript
const name = "Alice";
const age = 30;

// Expression interpolation
const msg = \`Hello, \${name}! You are \${age} years old.\`;

// Multi-line without concatenation
const html = \`
<div>
    <h1>\${name}</h1>
    <p>Age: \${age}</p>
</div>
\`;

// Tagged templates (advanced)
function highlight(strings, ...values) {
    return strings.reduce((result, str, i) =>
        result + str + (values[i] ? \`<mark>\${values[i]}</mark>\` : ""), "");
}
const highlighted = highlight\`User: \${name}, Age: \${age}\`;
\`\`\`

### Optional Chaining

\`?.\` safely accesses nested properties without throwing if an intermediate value is \`null\` or \`undefined\`.

\`\`\`javascript
const user = { profile: { name: "Alice" } };

// Without optional chaining
const city = user && user.address && user.address.city;

// With optional chaining
const city2 = user?.address?.city;       // undefined (no error)

// Also works for method calls and dynamic access
const result = someObj?.someMethod?.();
const value = obj?.[propName];
\`\`\`

### Nullish Coalescing

\`??\` returns the right operand only when the left operand is \`null\` or \`undefined\` (unlike \`||\` which treats all falsy values the same).

\`\`\`javascript
const count = 0;
const orResult = count || 10;            // 10 (0 is falsy)
const nullishResult = count ?? 10;       // 0 (0 is not null/undefined)

const name = "";
const orName = name || "default";        // "default"
const nullishName = name ?? "default";   // ""
\`\`\`

### ES Modules

\`export\` and \`import\` provide native module syntax with static analysis.

\`\`\`javascript
// math.js
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export default class Calculator { ... }

// app.js
import Calculator, { PI, add } from "./math.js";
import * as MathUtils from "./math.js";
\`\`\`

## Wiring It Together

A function that takes a user object, extracts profile data, formats it with template literals, and safely handles missing fields.

\`\`\`javascript
function formatUserProfile(user) {
    const { name = "Guest", age, preferences = {} } = user ?? {};
    const theme = preferences.theme ?? "light";

    return \`
User Profile
Name: \${name}
Age: \${age ?? "Not specified"}
Theme: \${theme}
\`.trim();
}

console.log(formatUserProfile({
    name: "Alice",
    age: 30,
    preferences: { theme: "dark" }
}));
// User Profile
// Name: Alice
// Age: 30
// Theme: dark

console.log(formatUserProfile({}));
// User Profile
// Name: Guest
// Age: Not specified
// Theme: light
\`\`\`

This ties destructuring, template literals, optional chaining, nullish coalescing, and default parameters into a single realistic pattern.
"""
    },
    {
        "id": "ns-js-async",
        "title": "Asynchronous JavaScript",
        "shortDesc": "Callbacks, Promises, async/await, event loop, microtasks vs macrotasks, and error handling.",
        "difficulty": "intermediate",
        "readTimeMin": 14,
        "keyPoints": [
            "JavaScript is single-threaded but non-blocking: the event loop handles asynchronous operations by queuing callbacks",
            "Callbacks pass a function to execute when an async operation completes; callback hell arises from deeply nested callbacks",
            "A Promise represents a future value with .then() for resolution and .catch() for rejection, enabling chaining",
            "async/await is syntactic sugar over Promises that makes asynchronous code read like synchronous code",
            "Microtasks (Promise.then, queueMicrotask) execute before macrotasks (setTimeout, setInterval, I/O) in each event loop tick",
            "Always handle Promise rejections with try/catch in async functions or .catch() to prevent unhandled rejections"
        ],
        "tags": ["javascript", "async", "promises", "event-loop"],
        "content": """## What's This?

Asynchronous JavaScript is the set of patterns and language features that handle operations that take time — network requests, file I/O, timers, user interactions — without blocking the main thread. JavaScript is single-threaded (one thing at a time), but the event loop enables concurrency by queuing work and processing it in turns. Callbacks were the original pattern, Promises improved composability, and async/await made asynchronous code read like synchronous code. These tools exist because waiting for operations to complete would freeze the UI and create a terrible user experience.

## The Big Picture

Asynchronous programming is central to JavaScript. The browser environment (fetch, setTimeout, DOM events) and Node.js (file system, database queries, network) are fundamentally async. The event loop is the engine that orchestrates async execution. Understanding the difference between microtasks (Promise callbacks) and macrotasks (setTimeout, I/O) explains execution order. Error handling in async code requires deliberate patterns — unhandled Promise rejections are a common bug source.

## Core Ideas

### Callbacks

A callback is a function passed as an argument to be invoked when an async operation completes. Nesting callbacks leads to "callback hell" — deeply indented, hard-to-read code.

\`\`\`javascript
function fetchData(callback) {
    setTimeout(() => {
        callback(null, { id: 1, name: "Alice" });
    }, 1000);
}

fetchData((error, data) => {
    if (error) {
        console.error(error);
        return;
    }
    console.log(data);
});
\`\`\`

### Promises

A Promise is an object representing the eventual completion (or failure) of an async operation. It has three states: pending, fulfilled, or rejected.

\`\`\`javascript
function fetchData() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const success = true;
            if (success) {
                resolve({ id: 1, name: "Alice" });
            } else {
                reject(new Error("Failed to fetch"));
            }
        }, 1000);
    });
}

fetchData()
    .then(data => console.log(data))
    .catch(error => console.error(error))
    .finally(() => console.log("Done"));

// Promise chaining
fetchData()
    .then(data => data.name)
    .then(name => name.toUpperCase())
    .then(result => console.log(result))
    .catch(error => console.error(error));
\`\`\`

### async/await

\`async\` marks a function as asynchronous; \`await\` pauses execution until a Promise settles. Errors are caught with try/catch.

\`\`\`javascript
async function displayUser() {
    try {
        const data = await fetchData();
        const upperName = data.name.toUpperCase();
        console.log(upperName);
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        console.log("Operation complete");
    }
}

displayUser();

// Parallel execution with Promise.all
async function fetchAll() {
    const [user, posts, comments] = await Promise.all([
        fetch("/api/user"),
        fetch("/api/posts"),
        fetch("/api/comments"),
    ]);
    return { user, posts, comments };
}
\`\`\`

### The Event Loop

The event loop continuously checks the call stack and task queues. Microtask queue (Promise callbacks, queueMicrotask) is processed before macrotask queue (setTimeout, setInterval, I/O callbacks) on each tick.

\`\`\`javascript
console.log("1: sync");

setTimeout(() => console.log("2: macrotask"), 0);

Promise.resolve().then(() => console.log("3: microtask"));

console.log("4: sync");

// Output: 1, 4, 3, 2
\`\`\`

### Error Handling Patterns

Always handle Promise rejections. Unhandled rejections crash Node.js processes and create silent failures in browsers.

\`\`\`javascript
// Pattern 1: try/catch in async functions
async function safeFetch(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch failed:", error);
        return null;
    }
}

// Pattern 2: .catch() on Promise chain
fetch("/api/data")
    .then(res => res.json())
    .catch(err => {
        console.error(err);
        return { fallback: true };
    })
    .then(data => console.log(data));
\`\`\`

## Wiring It Together

A function that fetches user data and their posts in parallel, then formats the result.

\`\`\`javascript
async function getUserProfile(userId) {
    try {
        const [user, posts] = await Promise.all([
            fetch(\`/api/users/\${userId}\`).then(r => r.json()),
            fetch(\`/api/users/\${userId}/posts\`).then(r => r.json()),
        ]);

        return {
            name: user.name,
            email: user.email,
            postCount: posts.length,
            latestPost: posts[0]?.title ?? "No posts",
        };
    } catch (error) {
        console.error("Failed to load profile:", error);
        return null;
    }
}

getUserProfile(1).then(profile => {
    if (profile) {
        console.log(\`\${profile.name} has \${profile.postCount} posts\`);
    }
});
\`\`\`

This ties Promises, async/await, parallel execution (\`Promise.all\`), optional chaining, and error handling into a realistic data-fetching pattern.
"""
    },
    {
        "id": "ns-js-oop",
        "title": "Prototypes & Classes",
        "shortDesc": "Prototypal inheritance, class syntax, getters/setters, static methods, and private fields.",
        "difficulty": "intermediate",
        "readTimeMin": 13,
        "keyPoints": [
            "JavaScript uses prototypal inheritance: every object has a hidden [[Prototype]] link to another object",
            "The prototype chain resolves property access by walking up the chain until the property is found or null is reached",
            "Class syntax is syntactic sugar over the prototype system — classes are still functions with a prototype property",
            "Constructor methods initialize instances; super() calls the parent constructor in subclass constructors",
            "Static methods belong to the class itself, not instances; they are called as ClassName.method()",
            "Private fields (#) are truly private to the class and enforced by the JavaScript engine at runtime"
        ],
        "tags": ["javascript", "oop", "prototypes", "classes"],
        "content": """## What's This?

Object-Oriented Programming (OOP) in JavaScript organizes code around objects that contain both data and behavior. Unlike class-based languages (Java, C++), JavaScript uses prototypal inheritance — objects inherit directly from other objects. The \`class\` syntax introduced in ES6 provides a familiar declarative form but still works through prototypes under the hood. OOP exists because organizing code into objects with inheritance, encapsulation, and polymorphism helps manage complexity as applications grow.

## The Big Picture

JavaScript's OOP model is unique: it combines prototypal inheritance with class syntax. Understanding prototypes is essential because every object, array, function, and DOM element uses prototypes. The class syntax makes OOP accessible to developers from other languages while integrating JavaScript-specific features like getters, setters, static methods, and private fields. Modern JavaScript uses a mix of OOP (classes for models, services, components) and functional programming.

## Core Ideas

### Prototypal Inheritance

Every JavaScript object has an internal \`[[Prototype]]\` (accessible via \`Object.getPrototypeOf\`) that points to another object. When you access a property, JavaScript walks the chain.

\`\`\`javascript
const animal = { eats: true };
const rabbit = { jumps: true };

rabbit.__proto__ = animal;               // Set prototype (legacy)

console.log(rabbit.jumps);               // true (own property)
console.log(rabbit.eats);                // true (inherited from animal)
console.log(rabbit.toString);            // inherited from Object.prototype
\`\`\`

### Class Syntax

The \`class\` keyword creates a constructor function with a prototype. The \`constructor\` method runs when you call \`new\`.

\`\`\`javascript
class Animal {
    constructor(name) {
        this.name = name;
    }

    speak() {
        return \`\${this.name} makes a sound\`;
    }
}

class Dog extends Animal {
    constructor(name, breed) {
        super(name);                     // Call parent constructor
        this.breed = breed;
    }

    speak() {
        return \`\${this.name} barks\`;     // Override parent method
    }
}

const dog = new Dog("Rex", "Labrador");
console.log(dog.speak());                // "Rex barks"
console.log(dog instanceof Animal);      // true
\`\`\`

### Getters and Setters

Getters (\`get\`) and setters (\`set\`) define computed properties that execute code on access and assignment.

\`\`\`javascript
class User {
    constructor(first, last) {
        this.firstName = first;
        this.lastName = last;
    }

    get fullName() {
        return \`\${this.firstName} \${this.lastName}\`;
    }

    set fullName(value) {
        [this.firstName, this.lastName] = value.split(" ");
    }
}

const user = new User("Alice", "Smith");
console.log(user.fullName);              // "Alice Smith"
user.fullName = "Bob Jones";
console.log(user.firstName);             // "Bob"
\`\`\`

### Static Methods

\`static\` methods are called on the class, not instances. They are typically used for utility functions, factory methods, or singleton access.

\`\`\`javascript
class MathUtils {
    static add(a, b) {
        return a + b;
    }

    static createDefault() {
        return new MathUtils(0, 0);
    }
}

console.log(MathUtils.add(5, 3));        // 8
// const mu = new MathUtils();
// mu.add(5, 3);                         // TypeError (not a function)
\`\`\`

### Private Fields

Private fields (prefixed with \`#\`) are truly private to the class — they cannot be accessed from outside the class, even by subclasses.

\`\`\`javascript
class BankAccount {
    #balance = 0;                        // Private field

    deposit(amount) {
        if (amount > 0) this.#balance += amount;
    }

    withdraw(amount) {
        if (amount <= this.#balance) {
            this.#balance -= amount;
            return amount;
        }
        return 0;
    }

    getBalance() {
        return this.#balance;
    }
}

const account = new BankAccount();
account.deposit(100);
console.log(account.getBalance());       // 100
// console.log(account.#balance);        // SyntaxError
\`\`\`

## Wiring It Together

A class hierarchy modeling a library system with private fields, inheritance, and static methods.

\`\`\`javascript
class Item {
    #id;
    static #nextId = 1;

    constructor(title) {
        this.title = title;
        this.#id = Item.#nextId++;
    }

    getId() { return this.#id; }
    getType() { return "Item"; }
}

class Book extends Item {
    constructor(title, author, pages) {
        super(title);
        this.author = author;
        this.pages = pages;
    }

    getType() { return "Book"; }
    getSummary() {
        return \`"\${this.title}" by \${this.author}, \${this.pages} pages\`;
    }
}

class DVD extends Item {
    constructor(title, director, duration) {
        super(title);
        this.director = director;
        this.duration = duration;
    }

    getType() { return "DVD"; }
}

const items = [
    new Book("1984", "George Orwell", 328),
    new DVD("Inception", "Christopher Nolan", 148),
];

items.forEach(item => {
    console.log(\`[\${item.getType()}] \${item.title}\`);
});
\`\`\`

This ties class syntax, inheritance (\`extends\`, \`super\`), private fields (\`#\`), static members, and method overriding into a realistic OOP design.
"""
    },
    {
        "id": "ns-js-modules",
        "title": "Modules & Bundlers",
        "shortDesc": "ESM vs CommonJS, dynamic imports, tree-shaking, and bundlers (Vite, Webpack, esbuild).",
        "difficulty": "intermediate",
        "readTimeMin": 13,
        "keyPoints": [
            "ES Modules (ESM) use import/export with static analysis; CommonJS uses require()/module.exports and is synchronous",
            "ESM supports tree-shaking: bundlers statically analyze imports to eliminate unused exports from the final bundle",
            "Dynamic import() returns a Promise and enables code-splitting — loading modules on demand instead of eagerly",
            "Webpack is the most mature bundler with extensive plugin ecosystem; Vite offers near-instant HMR via native ESM in dev",
            "esbuild is an extremely fast bundler written in Go, used internally by Vite and many other tools",
            "Bundlers convert the module graph into optimized bundles by resolving imports, transpiling, minifying, and code-splitting"
        ],
        "tags": ["javascript", "modules", "bundlers", "build-tools"],
        "content": """## What's This?

Modules are a way to split JavaScript code into separate files, each with its own scope, that can explicitly declare what they export and import. Before modules, JavaScript relied on global variables and script tag ordering — fragile and hard to maintain. CommonJS (Node.js) and ES Modules (ESM, the standard) provide proper encapsulation. Bundlers like Webpack, Vite, and esbuild take modules and combine them into optimized files for production. They exist because shipping hundreds of separate module files is inefficient — bundlers merge, minify, and transform code for the browser.

## The Big Picture

The JavaScript module ecosystem has two dominant systems: CommonJS (Node.js, \`require()\`) and ESM (browsers and modern Node.js, \`import\`/ \`export\`). ESM is the official standard and supports static analysis, enabling tree-shaking. Bundlers are essential for production: they resolve the module graph, apply transformations (TypeScript, JSX), optimize output (minification, code-splitting), and produce browser-ready bundles. Vite has emerged as the preferred dev tool with instant hot module replacement (HMR), while Webpack remains widely used in enterprise.

## Core Ideas

### ES Modules (ESM)

\`export\` declares what a module exposes; \`import\` consumes exports. Static analysis means imports are resolved at parse time, enabling optimizations.

\`\`\`javascript
// utils.js
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export default function greet(name) {
    return "Hello, " + name;
}

// app.js
import greet, { PI, add } from "./utils.js";
import * as Utils from "./utils.js";
\`\`\`

### CommonJS

CommonJS uses \`module.exports\` and \`require()\`. It is synchronous and resolves at runtime, which means it cannot support tree-shaking statically.

\`\`\`javascript
// utils.js
const PI = 3.14159;
function add(a, b) { return a + b; }
module.exports = { PI, add };

// app.js
const { PI, add } = require("./utils");
\`\`\`

### Dynamic Imports

\`import()\` (called "dynamic import") loads a module on demand, returning a Promise. This enables code-splitting — loading code only when needed.

\`\`\`javascript
// Lazy load a heavy module only when the user clicks
button.addEventListener("click", async () => {
    try {
        const module = await import("./heavy-module.js");
        module.run();
    } catch (error) {
        console.error("Failed to load module:", error);
    }
});
\`\`\`

### Bundlers

Bundlers process the module graph and produce optimized output.

\`\`\`javascript
// webpack.config.js
module.exports = {
    entry: "./src/index.js",
    output: {
        filename: "bundle.[contenthash].js",
        path: "./dist",
    },
    module: {
        rules: [
            { test: /\.js$/, use: "babel-loader" },
        ],
    },
    optimization: {
        splitChunks: { chunks: "all" },  // Code splitting
    },
};
\`\`\`

### Tree-Shaking

Tree-shaking removes unused exports from the final bundle. It works because ESM has static structure — the bundler can determine which exports are used at build time.

\`\`\`javascript
// math.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const multiply = (a, b) => a * b;  // Never imported → removed

// app.js — only add is imported
import { add } from "./math.js";
// subtract and multiply are tree-shaken away
\`\`\`

### Tool Comparison

Webpack: most mature, massive ecosystem, complex configuration. Vite: fast dev server with native ESM, simple config, uses Rollup for production builds. esbuild: written in Go, 10-100x faster than JS-based bundlers, used internally by Vite.

\`\`\`bash
# Vite project (recommended for new projects)
npm create vite@latest my-app -- --template react
cd my-app && npm run dev

# esbuild (for targeted bundling)
npx esbuild src/index.js --bundle --outfile=dist/bundle.js --minify
\`\`\`

## Wiring It Together

A module structure for a small app with lazy-loaded admin functionality.

\`\`\`javascript
// src/api.js
export async function fetchUsers() {
    const res = await fetch("/api/users");
    return res.json();
}

// src/main.js
import { fetchUsers } from "./api.js";

document.getElementById("admin-btn").addEventListener("click", async () => {
    const { showAdminPanel } = await import("./admin.js");
    showAdminPanel();
});

// src/admin.js — loaded on demand
export function showAdminPanel() {
    console.log("Admin panel loaded");
}
\`\`\`

This ties ESM exports/imports, dynamic imports (code-splitting), and async module loading into a realistic application architecture.
"""
    },
    {
        "id": "ns-js-browser-apis",
        "title": "Browser APIs",
        "shortDesc": "Fetch, localStorage, WebSocket, Service Workers, Canvas, and Web Animations API.",
        "difficulty": "intermediate",
        "readTimeMin": 14,
        "keyPoints": [
            "The Fetch API provides a modern Promise-based interface for HTTP requests, replacing XMLHttpRequest",
            "localStorage persists key-value data across sessions with up to 5-10 MB of storage per origin",
            "WebSocket enables full-duplex real-time communication over a single TCP connection for live features",
            "Service Workers act as programmable network proxies that enable offline support, caching, and push notifications",
            "The Canvas API provides pixel-level 2D drawing via a rendering context with paths, shapes, and images",
            "The Web Animations API offers performant, composable animations directly in JavaScript without CSS or libraries"
        ],
        "tags": ["javascript", "browser-apis", "web-apis", "client-side"],
        "content": """## What's This?

Browser APIs are built-in interfaces that web browsers provide to JavaScript, enabling code to interact with the browser and the user's environment. They cover everything from network requests (Fetch), data storage (localStorage), real-time communication (WebSocket), offline capabilities (Service Workers), graphics (Canvas), and animations (Web Animations API). These APIs exist because web applications need to do more than display static content — they need to communicate with servers, store data locally, respond in real time, and create rich visual experiences without plugins.

## The Big Picture

Browser APIs form the capability layer of web development. Every modern web application uses multiple browser APIs. Fetch replaces XMLHttpRequest for networking. localStorage provides simple key-value persistence. WebSocket powers real-time features (chat, live updates, collaborative editing). Service Workers enable Progressive Web Apps (PWAs) with offline support and push notifications. Canvas powers games, data visualization, and image processing. Together, these APIs make the browser a full-fledged application platform.

## Core Ideas

### Fetch API

The Fetch API makes HTTP requests and returns Promises. It supports all HTTP methods, custom headers, and request/response streaming.

\`\`\`javascript
// GET request
async function getUser(id) {
    const response = await fetch(\`/api/users/\${id}\`);
    if (!response.ok) throw new Error("HTTP " + response.status);
    return response.json();
}

// POST request with JSON body
async function createUser(data) {
    const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return response.json();
}
\`\`\`

### localStorage and sessionStorage

\`localStorage\` persists until explicitly cleared; \`sessionStorage\` clears when the tab closes. Both store strings only — use \`JSON.stringify\` and \`JSON.parse\` for structured data.

\`\`\`javascript
// Save structured data
const user = { id: 1, name: "Alice", theme: "dark" };
localStorage.setItem("user", JSON.stringify(user));

// Read it back
const saved = JSON.parse(localStorage.getItem("user") || "null");
console.log(saved?.name);                // "Alice"

// Remove
localStorage.removeItem("user");
localStorage.clear();                    // Remove all keys
\`\`\`

### WebSocket

WebSocket establishes a persistent bidirectional connection. Messages are sent and received as events.

\`\`\`javascript
const socket = new WebSocket("wss://example.com/chat");

socket.addEventListener("open", () => {
    socket.send(JSON.stringify({ type: "join", room: "general" }));
});

socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    console.log("Received:", data);
});

socket.addEventListener("close", () => {
    console.log("Disconnected");
});
\`\`\`

### Service Workers

A Service Worker is a script that runs in the background, separate from the webpage. It intercepts network requests and enables offline functionality.

\`\`\`javascript
// sw.js (registered from the page)
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open("v1").then((cache) => {
            return cache.addAll(["/", "/index.html", "/app.js"]);
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => {
            return cached || fetch(event.request);
        })
    );
});

// Registration from the page
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
}
\`\`\`

### Canvas API

The Canvas API provides a 2D drawing context on an HTML \`<canvas>\` element.

\`\`\`javascript
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Draw a filled rectangle
ctx.fillStyle = "blue";
ctx.fillRect(10, 10, 100, 50);

// Draw a circle
ctx.beginPath();
ctx.arc(200, 100, 40, 0, Math.PI * 2);
ctx.fillStyle = "red";
ctx.fill();

// Draw text
ctx.font = "20px Arial";
ctx.fillStyle = "black";
ctx.fillText("Hello Canvas", 10, 200);
\`\`\`

### Web Animations API

The Web Animations API provides performant animations directly in JavaScript, composited by the browser on a separate thread.

\`\`\`javascript
const element = document.querySelector(".box");

const animation = element.animate([
    { transform: "translateX(0)", opacity: 1 },
    { transform: "translateX(200px)", opacity: 0.5 },
    { transform: "translateX(0)", opacity: 1 },
], {
    duration: 1000,
    iterations: Infinity,
    easing: "ease-in-out",
});

// Control: pause, play, reverse, cancel
// animation.pause();
// animation.play();
\`\`\`

## Wiring It Together

A component that fetches user data, caches it in localStorage, displays it, and handles offline gracefully.

\`\`\`javascript
async function loadUserProfile(userId) {
    const cacheKey = \`user_\${userId}\`;

    // Try fetching fresh data
    try {
        const response = await fetch(\`/api/users/\${userId}\`);
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem(cacheKey, JSON.stringify({
                data,
                timestamp: Date.now(),
            }));
            return data;
        }
    } catch (error) {
        console.log("Network unavailable, using cache");
    }

    // Fallback to cached data
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        const { data } = JSON.parse(cached);
        return data;
    }

    return null;
}

loadUserProfile(1).then(user => {
    if (user) {
        document.getElementById("profile").textContent =
            \`Name: \${user.name}, Email: \${user.email}\`;
    } else {
        document.getElementById("profile").textContent =
            "User not available offline";
    }
});
\`\`\`

This ties Fetch API, localStorage, error handling (offline fallback), and DOM manipulation into a realistic Progressive Web App pattern.
"""
    },
    {
        "id": "ns-js-frameworks",
        "title": "Frontend Frameworks (React, Vue, Angular)",
        "shortDesc": "Component model, reactivity, state management, routing, and when to choose which.",
        "difficulty": "advanced",
        "readTimeMin": 15,
        "keyPoints": [
            "All three frameworks use a component model: reusable, self-contained units of UI with their own state and lifecycle",
            "React uses a virtual DOM with one-way data flow and explicit state updates via useState/useReducer hooks",
            "Vue provides a reactive data system with mutable state in a setup() function or Options API, plus a template compiler",
            "Angular is a full-featured framework with TypeScript, dependency injection, RxJS, and a strong opinion on architecture",
            "State management solutions (Redux, Pinia, NgRx) centralize shared state outside individual components",
            "Choose React for ecosystem size and flexibility, Vue for simplicity and gentle learning curve, Angular for enterprise-scale teams"
        ],
        "tags": ["javascript", "react", "vue", "angular", "frameworks"],
        "content": """## What's This?

Frontend frameworks are libraries that provide a structured way to build user interfaces for web applications. Instead of manually manipulating the DOM with vanilla JavaScript, frameworks offer a component model — reusable pieces of UI with their own state, lifecycle, and rendering logic. React, Vue, and Angular are the three dominant frameworks. They exist because building complex UIs with direct DOM manipulation is error-prone, hard to maintain, and doesn't scale beyond simple pages. Frameworks enforce patterns that make code predictable, testable, and maintainable.

## The Big Picture

Choosing a framework is a major architectural decision. All three share core concepts: components, reactivity, state management, and routing. React is the most popular with the largest ecosystem — it is a library (not a full framework) focused on the view layer. Vue offers a gentler learning curve with a balance of flexibility and convention. Angular is a complete platform with strong opinions, TypeScript-first design, and enterprise features built in. Understanding the component model, reactivity paradigm, and state management approach of each helps you choose the right tool.

## Core Ideas

### Component Model

Components are the building blocks of every framework. Each component encapsulates HTML (template), JavaScript (logic), and CSS (styling).

\`\`\`javascript
// React component (JSX)
function Greeting({ name }) {
    const [count, setCount] = React.useState(0);
    return (
        <div>
            <h1>Hello, {name}</h1>
            <p>Count: {count}</p>
            <button onClick={() => setCount(c => c + 1)}>+</button>
        </div>
    );
}

// Vue component (Single-File Component)
// <template>
//   <div>
//     <h1>Hello, {{ name }}</h1>
//     <p>Count: {{ count }}</p>
//     <button @click="count++">+</button>
//   </div>
// </template>
// <script setup>
// defineProps(['name'])
// const count = ref(0)
// </script>

// Angular component (TypeScript + Decorator)
// @Component({
//   selector: 'app-greeting',
//   template: \`
//     <h1>Hello, {{ name }}</h1>
//     <p>Count: {{ count }}</p>
//     <button (click)="increment()">+</button>
//   \`
// })
// export class GreetingComponent {
//   @Input() name!: string;
//   count = 0;
//   increment() { this.count++; }
// }
\`\`\`

### Reactivity

How the framework detects changes and updates the DOM.

\`\`\`javascript
// React: explicit state updates trigger re-render
const [state, setState] = React.useState({ count: 0 });
setState(prev => ({ count: prev.count + 1 }));

// Vue: reactive proxy — mutations are automatically tracked
const state = reactive({ count: 0 });
state.count++; // Automatically triggers re-render

// Angular: zone.js patches async APIs and triggers change detection
// OnPush strategy: manual change detection for performance
\`\`\`

### State Management

For complex state shared across many components, dedicated state management libraries provide structure.

\`\`\`javascript
// React: Zustand (lightweight alternative to Redux)
import { create } from "zustand";
const useStore = create(set => ({
    count: 0,
    increment: () => set(s => ({ count: s.count + 1 })),
}));

// Vue: Pinia (official Vue state management)
// export const useCounterStore = defineStore('counter', {
//   state: () => ({ count: 0 }),
//   actions: { increment() { this.count++ } },
// });

// Angular: NgRx (Redux-inspired with RxJS)
// Actions, Reducers, Effects, Selectors pattern
\`\`\`

### When to Choose

React: largest ecosystem, most job opportunities, great for SPAs and cross-platform (React Native). Best when you need maximum flexibility and community support. Vue: easiest to learn, excellent documentation, great for teams transitioning from jQuery or server-rendered apps. Angular: best for large enterprise applications with many developers, strong typing, and opinionated architecture.

## Wiring It Together

The same counter component in all three frameworks, demonstrating the component model and reactivity.

\`\`\`javascript
// React
function Counter() {
    const [count, setCount] = React.useState(0);
    return (
        <div>
            <p>{count}</p>
            <button onClick={() => setCount(c => c + 1)}>+</button>
        </div>
    );
}

// Vue (setup script)
// <script setup>
// const count = ref(0)
// </script>
// <template>
//   <div>
//     <p>{{ count }}</p>
//     <button @click="count++">+</button>
//   </div>
// </template>

// Angular
// @Component({ template: \`
//   <div>
//     <p>{{ count }}</p>
//     <button (click)="increment()">+</button>
//   </div>
// \`})
// export class CounterComponent {
//   count = 0;
//   increment() { this.count++; }
// }
\`\`\`

Each framework achieves the same result with different philosophies: React uses explicit JavaScript state and JSX; Vue uses reactive proxies and templates; Angular uses class-based components with decorators.
"""
    },
    {
        "id": "ns-js-node",
        "title": "Node.js & Runtimes",
        "shortDesc": "CommonJS vs ESM, fs/http modules, npm/yarn/pnpm, Express, and an overview of Deno/Bun.",
        "difficulty": "advanced",
        "readTimeMin": 14,
        "keyPoints": [
            "Node.js is a JavaScript runtime built on Chrome's V8 engine, enabling server-side JavaScript with file system and network access",
            "Node.js uses an event-driven, non-blocking I/O model — most operations accept callbacks or return Promises",
            "The fs module provides file system operations (read, write, delete, watch) with sync, callback, and Promise variants",
            "The http module creates servers and makes HTTP requests without external dependencies",
            "Express is the most popular web framework for Node.js, providing routing, middleware, and request/response handling",
            "Deno and Bun are modern alternatives: Deno has built-in TypeScript and security, Bun focuses on raw speed with integrated bundler"
        ],
        "tags": ["javascript", "nodejs", "server-side", "runtimes"],
        "content": """## What's This?

Node.js is a JavaScript runtime that executes JavaScript outside the browser, primarily on servers. Built on Chrome's V8 engine, it provides APIs for file system access, networking, process management, and more — things that browsers restrict for security reasons. Node.js exists because JavaScript was trapped in the browser; developers wanted to use the same language on the server, enabling full-stack development with a single language. Its event-driven, non-blocking architecture makes it efficient for I/O-heavy applications like web servers, APIs, and real-time services.

## The Big Picture

Node.js revolutionized server-side development by bringing JavaScript to the backend. Its package ecosystem (npm) is the largest software registry in the world. The runtime has two module systems: CommonJS (legacy, \`require\`) and ESM (modern, \`import\`). Key built-in modules include \`fs\` (file system), \`http\` (HTTP server/client), \`path\` (path manipulation), and \`process\` (environment and process control). Express remains the most popular framework, while Deno and Bun are modern competitors offering TypeScript support and improved performance.

## Core Ideas

### CommonJS vs ESM in Node.js

Node.js supports both module systems. \`require()\` is synchronous and CommonJS. \`import\` is asynchronous and ESM. Use \`"type": "module"\` in \`package.json\` to default to ESM.

\`\`\`javascript
// CommonJS (default in Node.js without "type": "module")
const fs = require("fs");
const path = require("path");

// ES Modules (with "type": "module" in package.json)
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
\`\`\`

### File System (fs module)

The \`fs\` module provides file operations with three API styles: synchronous, callback, and Promise.

\`\`\`javascript
import fs from "fs/promises";

// Read a file
const data = await fs.readFile("./data.json", "utf-8");
const parsed = JSON.parse(data);

// Write a file
await fs.writeFile("./output.txt", "Hello, World!", "utf-8");

// List directory contents
const files = await fs.readdir("./src");
console.log(files);

// Watch for changes
const watcher = fs.watch("./src", (event, filename) => {
    console.log(\`\${filename}: \${event}\`);
});
\`\`\`

### HTTP Module

The \`http\` module creates servers and makes requests without external dependencies.

\`\`\`javascript
import http from "http";

// Create a simple server
const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Hello, World!" }));
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});

// Make an HTTP request
const data = await fetch("http://localhost:3000").then(r => r.json());
\`\`\`

### Express Framework

Express provides a clean API for routing, middleware, and request handling. It is the most widely used Node.js web framework.

\`\`\`javascript
import express from "express";

const app = express();
app.use(express.json());                 // Parse JSON bodies

// Route definitions
app.get("/api/users", async (req, res) => {
    const users = await db.findMany();
    res.json(users);
});

app.post("/api/users", async (req, res) => {
    const user = await db.create(req.body);
    res.status(201).json(user);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});

app.listen(3000);
\`\`\`

### Package Managers

npm (Node Package Manager) comes with Node.js. Yarn and pnpm are alternatives that offer faster installs and stricter dependency management.

\`\`\`bash
# npm (default)
npm init -y
npm install express
npm run dev

# pnpm (faster, disk-efficient)
pnpm init
pnpm add express
pnpm run dev
\`\`\`

### Deno and Bun

Deno (created by Node.js's original author) has built-in TypeScript, URL-based imports, and a security-first permission system. Bun is a new runtime focused on speed — it bundles, transpiles, runs, and packages JavaScript, and is designed as a drop-in Node.js replacement.

\`\`\`bash
# Deno — run TypeScript directly, no config needed
deno run --allow-net server.ts

# Bun — fast runtime with integrated bundler
bun run server.ts
bun run build
\`\`\`

## Wiring It Together

A REST API server with Express that reads and writes data to a JSON file — demonstrating the fs module, Express routing, and async/await.

\`\`\`javascript
import express from "express";
import fs from "fs/promises";
import path from "path";

const app = express();
const DATA_FILE = path.join(process.cwd(), "data.json");
app.use(express.json());

async function readData() {
    try {
        const raw = await fs.readFile(DATA_FILE, "utf-8");
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

app.get("/api/items", async (req, res) => {
    const items = await readData();
    res.json(items);
});

app.post("/api/items", async (req, res) => {
    const items = await readData();
    const item = { id: Date.now(), ...req.body };
    items.push(item);
    await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2));
    res.status(201).json(item);
});

app.listen(3000, () => console.log("API running on :3000"));
\`\`\`

This ties Node.js module system, fs/promises, Express routing, JSON handling, and async error handling into a complete working API.
"""
    },
    {
        "id": "ns-js-meta-frameworks",
        "title": "Meta-Frameworks (Next.js, Nuxt)",
        "shortDesc": "SSR, SSG, ISR, file-based routing, server actions, and when to use a meta-framework over vanilla SPA.",
        "difficulty": "advanced",
        "readTimeMin": 14,
        "keyPoints": [
            "Meta-frameworks build on top of frontend frameworks (Next.js on React, Nuxt on Vue) adding server-side rendering, routing, and build optimizations",
            "SSR (Server-Side Rendering) generates HTML on each request for dynamic content and SEO; SSG (Static Site Generation) pre-builds HTML at build time",
            "ISR (Incremental Static Regeneration) re-builds specific pages in the background after deployment without a full rebuild",
            "File-based routing maps the filesystem directly to URL paths — app/page.tsx becomes /page, app/blog/[id]/page.tsx becomes /blog/:id",
            "Server Actions (Next.js 13+) let you call server-side functions directly from client components without creating API endpoints",
            "Choose a meta-framework when you need SEO, fast initial page loads (SSR/SSG), or a full-featured framework with routing and data fetching built in"
        ],
        "tags": ["javascript", "nextjs", "nuxt", "meta-frameworks", "ssr"],
        "content": """## What's This?

Meta-frameworks are opinionated frameworks built on top of frontend frameworks (React, Vue) that add server-side rendering, file-based routing, data fetching strategies, and build optimizations. Next.js (for React) and Nuxt (for Vue) are the primary examples. They exist because single-page applications (SPAs) have limitations: poor SEO (content is rendered in JavaScript), slow initial load (you download and execute the entire app before seeing anything), and complex setup (you need to configure routing, bundling, code-splitting manually). Meta-frameworks solve these problems out of the box.

## The Big Picture

Next.js has become the de facto standard for React applications. It provides multiple rendering strategies: SSR (dynamic content, good SEO), SSG (static content, fastest performance), and ISR (hybrid — static with periodic updates). File-based routing in the \`app\` directory replaces React Router. Server Actions eliminate the need for separate API routes for form submissions and data mutations. Nuxt brings equivalent capabilities to Vue with a similar developer experience. Understanding when to use SSG vs SSR vs ISR is key to building performant web applications.

## Core Ideas

### Rendering Strategies

SSR: Server generates HTML on each request — use for personalized, dynamic content (dashboards, user profiles). SSG: HTML is generated at build time — use for blogs, docs, marketing pages (fastest, can be served from CDN). ISR: SSG with periodic revalidation — best of both worlds for content that changes occasionally.

\`\`\`javascript
// Next.js App Router examples

// SSR — dynamic, rendered per request (default without generateStaticParams)
export default async function Profile({ params }) {
    const user = await fetch(\`/api/users/\${params.id}\`).then(r => r.json());
    return <h1>{user.name}</h1>;
}

// SSG — generated at build time
export async function generateStaticParams() {
    const posts = await fetch("/api/posts").then(r => r.json());
    return posts.map(post => ({ id: post.id.toString() }));
}

export default async function Post({ params }) {
    const post = await fetch(\`/api/posts/\${params.id}\`).then(r => r.json());
    return <article>{post.title}</article>;
}

// ISR — static but revalidates
export default async function Page() {
    const data = await fetch("https://api.example.com/data", {
        next: { revalidate: 60 }, // Revalidate every 60 seconds
    }).then(r => r.json());
    return <div>{data.content}</div>;
}
\`\`\`

### File-Based Routing

The filesystem defines the URL structure. Folders are route segments; files are route handlers.

\`\`\`
app/
  page.js              →  / (homepage)
  about/page.js        →  /about
  blog/[id]/page.js    →  /blog/123
  api/users/route.js   →  /api/users (API endpoint)
\`\`\`

### Server Actions

Server Actions allow calling server-side code directly from client components, handling form submissions and data mutations without building API routes.

\`\`\`javascript
// app/actions.js  ("use server")
export async function createUser(formData) {
    const name = formData.get("name");
    const email = formData.get("email");

    // This code runs on the server
    const db = await connectDB();
    const user = await db.users.create({ name, email });

    return { success: true, id: user.id };
}

// app/page.js (client component importing server action)
import { createUser } from "./actions";

export default function Page() {
    return (
        <form action={createUser}>
            <input name="name" required />
            <input name="email" type="email" required />
            <button type="submit">Create User</button>
        </form>
    );
}
\`\`\`

### When to Use a Meta-Framework

Use a meta-framework when you need SEO (content must be indexed by search engines), fast initial page loads (first contentful paint under 1 second), complex routing (nested layouts, parallel routes), or data fetching at the server level (database access, API aggregation). For a simple admin dashboard behind authentication that does not need SEO, a vanilla SPA (Create React App, Vite) is simpler and sufficient.

## Wiring It Together

A Next.js blog with SSG for the post list, SSR for individual posts, and a server action for comments.

\`\`\`javascript
// app/posts/page.js — SSG (static list)
export default async function PostList() {
    const posts = await fetch("https://api.example.com/posts", {
        next: { revalidate: 300 } // ISR: refresh every 5 min
    }).then(r => r.json());

    return (
        <ul>
            {posts.map(post => (
                <li key={post.id}>
                    <a href={\`/posts/\${post.id}\`}>{post.title}</a>
                </li>
            ))}
        </ul>
    );
}

// app/posts/[id]/page.js — SSR (dynamic per post)
export default async function PostPage({ params }) {
    const post = await fetch(\`https://api.example.com/posts/\${params.id}\`)
        .then(r => r.json());
    return <article>{post.content}</article>;
}

// app/posts/[id]/actions.js — Server Action for comments
"use server";
export async function addComment(postId, formData) {
    const text = formData.get("text");
    await saveComment({ postId, text });
}
\`\`\`

This ties SSG, SSR, file-based routing, and server actions into a complete blog architecture.
"""
    },
    {
        "id": "ns-js-desktop",
        "title": "Desktop Frameworks (Electron, Tauri)",
        "shortDesc": "Cross-platform desktop apps with web tech — IPC, native APIs, bundling, and Tauri's Rust-based architecture.",
        "difficulty": "advanced",
        "readTimeMin": 13,
        "keyPoints": [
            "Electron bundles Chromium and Node.js to run web code as a desktop app — it provides full browser APIs plus native OS access",
            "Tauri is a lighter alternative that uses the OS webview instead of bundling Chromium, producing much smaller binaries (MB vs GB)",
            "IPC (Inter-Process Communication) enables the renderer process (UI) to communicate with the main process (Node.js/native backend)",
            "Electron's main process manages windows, menus, and native APIs; renderer processes run the web UI in Chromium",
            "Tauri uses Rust for the backend — commands are Rust functions callable from JavaScript with strong typing and near-native performance",
            "Both frameworks package apps for Windows, macOS, and Linux from a single codebase with platform-specific installers"
        ],
        "tags": ["javascript", "electron", "tauri", "desktop", "cross-platform"],
        "content": """## What's This?

Desktop frameworks for web developers let you build native desktop applications using web technologies (HTML, CSS, JavaScript). Electron and Tauri are the two dominant options. Electron packages your web app inside Chromium with Node.js access — it is powerful but produces large binaries (100+ MB). Tauri uses the operating system's built-in webview and a Rust backend — it produces much smaller binaries (under 10 MB) and offers better performance. These frameworks exist because building separate native apps for Windows, macOS, and Linux requires different languages and toolchains; web-based desktop frameworks let you share code across platforms.

## The Big Picture

Electron powers major applications: VS Code, Slack, Discord, Figma, and Spotify. Its model is simple: a main process (Node.js) creates browser windows that load your web app. The trade-off is binary size and memory usage (each window is a full Chromium instance). Tauri is the modern alternative: it uses the system webview (WebKit on macOS/Linux, WebView2 on Windows) and a Rust backend. This means smaller binaries, lower memory usage, and native performance, at the cost of a smaller ecosystem and a Rust learning curve for backend logic.

## Core Ideas

### Electron Architecture

Electron has two process types: main (Node.js, manages windows and native APIs) and renderer (Chromium, runs the UI). IPC bridges them.

\`\`\`javascript
// main.js (main process)
const { app, BrowserWindow, ipcMain } = require("electron");

app.whenReady().then(() => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });
    win.loadFile("index.html");
});

// Handle IPC from renderer
ipcMain.handle("read-file", async (event, filePath) => {
    return fs.readFileSync(filePath, "utf-8");
});

// preload.js (bridge between main and renderer)
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
    readFile: (path) => ipcRenderer.invoke("read-file", path),
});

// renderer.js (in the web page)
const content = await window.electronAPI.readFile("/path/to/file");
console.log(content);
\`\`\`

### Tauri Architecture

Tauri uses Rust for the backend. Commands are Rust functions called from JavaScript with \`invoke\`.

\`\`\`rust
// src-tauri/src/main.rs
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
\`\`\`

\`\`\`javascript
// src/App.jsx (frontend)
import { invoke } from "@tauri-apps/api/tauri";

const greeting = await invoke("greet", { name: "Alice" });
console.log(greeting);  // "Hello, Alice! You've been greeted from Rust!"
\`\`\`

### IPC (Inter-Process Communication)

IPC is the mechanism for sending messages between the UI process and the backend. Both Electron and Tauri provide structured IPC.

\`\`\`javascript
// Electron IPC pattern
// Main process
ipcMain.handle("save-file", async (event, { path, content }) => {
    await fs.promises.writeFile(path, content);
    return { success: true };
});

// Renderer process
const result = await window.electronAPI.saveFile({
    path: "/tmp/data.json",
    content: JSON.stringify({ key: "value" }),
});

// Tauri IPC is simpler — just call invoke()
const result = await invoke("save_file", { path: "/tmp/data.json", content: "..." });
\`\`\`

### Packaging and Distribution

Electron uses electron-builder or electron-forge to package apps. Tauri bundles with its own CLI. Both produce native installers.

\`\`\`bash
# Electron
npx electron-builder --mac --win --linux

# Tauri
npm run tauri build    # Produces .dmg (macOS), .msi (Windows), .AppImage (Linux)
\`\`\`

### When to Choose

Choose Electron when you need full Chromium features (DevTools, extensive web APIs), mature ecosystem, or are porting an existing web app with minimal changes. Choose Tauri when binary size matters, you want better performance, or you are starting a new project and can leverage Rust for backend logic.

## Wiring It Together

A simple file viewer app in Tauri that reads and displays a file selected by the user.

\`\`\`rust
// src-tauri/src/main.rs
#[tauri::command]
fn read_text_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read_text_file])
        .run(tauri::generate_context!())
        .expect("error");
}
\`\`\`

\`\`\`javascript
// src/App.jsx
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { useState } from "react";

function App() {
    const [content, setContent] = useState("");

    async function handleOpen() {
        const selected = await open({ multiple: false });
        if (selected) {
            const text = await invoke("read_text_file", { path: selected });
            setContent(text);
        }
    }

    return (
        <div>
            <button onClick={handleOpen}>Open File</button>
            <pre>{content}</pre>
        </div>
    );
}
\`\`\`

This ties Tauri's Rust commands, IPC invocation, native dialogs, and React frontend into a complete cross-platform desktop application.
"""
    },
    {
        "id": "ns-js-testing",
        "title": "Testing JavaScript",
        "shortDesc": "Jest, Vitest, Playwright, testing strategies (unit/integration/e2e), and TDD basics.",
        "difficulty": "intermediate",
        "readTimeMin": 13,
        "keyPoints": [
            "Unit tests verify individual functions or components in isolation; integration tests verify interactions between units",
            "Jest is the most popular test framework with built-in assertions, mocking, and coverage — configure once and run with jest",
            "Vitest is a Vite-native alternative that is faster for Vite projects and supports the same Jest-compatible API",
            "Playwright is an end-to-end testing framework that automates real browsers (Chromium, Firefox, WebKit) with auto-waiting",
            "Test-Driven Development (TDD) writes the test before the implementation: Red (failing test) -> Green (passing code) -> Refactor",
            "Mock functions replace real dependencies to isolate the unit under test and verify behavior without side effects"
        ],
        "tags": ["javascript", "testing", "jest", "vitest", "playwright"],
        "content": """## What's This?

Testing in JavaScript means writing code that verifies your application behaves correctly. Jest and Vitest are test runners for unit and integration tests — they provide assertions, mocking, coverage reports, and watch mode. Playwright is an end-to-end testing framework that automates real browsers to test complete user flows. Testing exists because manual testing is slow, error-prone, and does not scale — automated tests catch regressions, document behavior, and give you confidence to refactor. The testing pyramid recommends many fast unit tests, fewer integration tests, and even fewer end-to-end tests.

## The Big Picture

A solid test suite is non-negotiable for production JavaScript applications. Jest has been the dominant test framework for years; Vitest is its modern successor built for Vite projects with the same API. Unit tests use \`describe\`/\`it\`/ \`expect\` patterns. Mocks replace real dependencies (databases, API calls) so tests run fast and reliably. End-to-end tests with Playwright simulate real user interactions in the browser. Test-Driven Development (TDD) is a discipline where you write the test first, then implement just enough code to pass it, then refactor — leading to better-designed, testable code.

## Core Ideas

### Unit Tests with Jest/Vitest

Tests are organized with \`describe\` (group) and \`it\`/ \`test\` (individual test). Assertions use \`expect\` with matchers.

\`\`\`javascript
// math.js
export function add(a, b) { return a + b; }
export function isEven(n) { return n % 2 === 0; }

// math.test.js
import { describe, it, expect } from "vitest";
import { add, isEven } from "./math";

describe("add", () => {
    it("adds two numbers", () => {
        expect(add(2, 3)).toBe(5);
    });

    it("handles negative numbers", () => {
        expect(add(-1, 1)).toBe(0);
    });
});

describe("isEven", () => {
    it("returns true for even numbers", () => {
        expect(isEven(4)).toBe(true);
    });

    it("returns false for odd numbers", () => {
        expect(isEven(5)).toBe(false);
    });
});
\`\`\`

### Mocking

Mocks replace real dependencies to isolate the code under test.

\`\`\`javascript
// userService.js
import { db } from "./database";

export async function getUser(id) {
    const user = await db.findUser(id);
    return user ?? null;
}

// userService.test.js
import { describe, it, expect, vi } from "vitest";
import { getUser } from "./userService";

vi.mock("./database", () => ({
    db: {
        findUser: vi.fn(),
    },
}));

describe("getUser", () => {
    it("returns user when found", async () => {
        const mockUser = { id: 1, name: "Alice" };
        db.findUser.mockResolvedValue(mockUser);

        const result = await getUser(1);
        expect(result).toEqual(mockUser);
        expect(db.findUser).toHaveBeenCalledWith(1);
    });

    it("returns null when not found", async () => {
        db.findUser.mockResolvedValue(null);

        const result = await getUser(999);
        expect(result).toBeNull();
    });
});
\`\`\`

### End-to-End Tests with Playwright

Playwright tests run in real browsers and interact with the page like a user would.

\`\`\`javascript
// app.spec.js
import { test, expect } from "@playwright/test";

test("user can log in", async ({ page }) => {
    await page.goto("http://localhost:3000/login");

    await page.fill("[name=email]", "alice@example.com");
    await page.fill("[name=password]", "correctpassword");
    await page.click("button[type=submit]");

    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator("h1")).toHaveText("Welcome, Alice!");
});

test("shows error on invalid login", async ({ page }) => {
    await page.goto("http://localhost:3000/login");
    await page.fill("[name=email]", "wrong@example.com");
    await page.fill("[name=password]", "wrong");
    await page.click("button[type=submit]");

    await expect(page.locator(".error")).toBeVisible();
    await expect(page.locator(".error")).toHaveText("Invalid credentials");
});
\`\`\`

### TDD (Test-Driven Development)

TDD follows the Red-Green-Refactor cycle. Write a failing test first, implement the minimal code to pass, then clean up.

\`\`\`javascript
// Step 1: RED — write a failing test
describe("calculateTotal", () => {
    it("applies discount for orders over $100", () => {
        const result = calculateTotal(150, { discount: 0.1 });
        expect(result).toBe(135); // 150 - 15
    });
});

// Step 2: GREEN — implement the minimal code
function calculateTotal(amount, { discount = 0 } = {}) {
    return amount - (amount * discount);
}

// Step 3: REFACTOR — clean up, add edge cases
\`\`\`

## Wiring It Together

A test suite for a simple shopping cart with unit tests, a mocked data layer, and an e2e checkout flow.

\`\`\`javascript
// cart.js
export class Cart {
    constructor() {
        this.items = [];
    }

    addItem(product, quantity = 1) {
        const existing = this.items.find(i => i.id === product.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.items.push({ ...product, quantity });
        }
    }

    getTotal() {
        return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
}

// cart.test.js
import { describe, it, expect } from "vitest";
import { Cart } from "./cart";

describe("Cart", () => {
    it("adds items and calculates total", () => {
        const cart = new Cart();
        cart.addItem({ id: 1, name: "Widget", price: 10 }, 2);
        cart.addItem({ id: 2, name: "Gadget", price: 25 });

        expect(cart.getTotal()).toBe(45);
    });

    it("increments quantity for existing items", () => {
        const cart = new Cart();
        cart.addItem({ id: 1, name: "Widget", price: 10 });
        cart.addItem({ id: 1, name: "Widget", price: 10 }, 2);

        expect(cart.items).toHaveLength(1);
        expect(cart.items[0].quantity).toBe(3);
    });
});
\`\`\`

This ties unit tests with Vitest, mocking (built into test structure), and testing patterns (describe/it/expect) into a practical testing workflow.
"""
    },
]

# Build replacement strings
with open(FILEPATH) as f:
    lines = f.readlines()

# Find the empty JS topics and their exact positions
# Each topic is on a single line like:
#           { id: "ns-js-syntax", title: "Syntax & Basics", ..., content: "", tags: [] },
# We need to replace the entire line with a multi-line object

js_topic_ids = {t["id"]: t for t in topics}

new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    # Check if this line matches an empty JS topic
    for topic_id, topic in js_topic_ids.items():
        pattern = f'id: "{topic_id}"'
        if pattern in line and 'content: ""' in line:
            # Build the replacement multi-line block
            indent = "          "  # 10 spaces for topic object
            
            # Build keyPoints string
            kp_indent = indent + "  "
            kp_lines = []
            for kp in topic["keyPoints"]:
                escaped_kp = kp.replace('"', '\\"')
                kp_lines.append(f'{kp_indent}"{escaped_kp}"')
            key_points_str = "[\n" + ",\n".join(kp_lines) + f"\n{indent}]"
            
            # Build tags string
            tags_str = "[" + ", ".join(f'"{t}"' for t in topic["tags"]) + "]"
            
            # Build content — use template literal with real newlines
            # Need to escape backticks as \` and backslashes properly
            content = topic["content"]
            
            # Build the multi-line topic object
            full_topic = f'''{indent}{{
{indent}  id: "{topic_id}",
{indent}  title: "{topic["title"]}",
{indent}  shortDesc: "{topic["shortDesc"]}",
{indent}  difficulty: "{topic["difficulty"]}",
{indent}  readTimeMin: {topic["readTimeMin"]},
{indent}  keyPoints: {key_points_str},
{indent}  content: `{content}`,
{indent}  tags: {tags_str},
{indent}}},\n'''
            
            new_lines.append(full_topic)
            # Also skip trailing comma lines if any
            i += 1
            break
    else:
        new_lines.append(line)
        i += 1

with open(FILEPATH, "w") as f:
    f.writelines(new_lines)

print(f"Replaced {len(topics)} empty JavaScript topics")
