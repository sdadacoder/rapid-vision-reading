
console.log('Hello from test.js!');


function greet(name) {
  return `Hello, ${name}!`;
}


const message = greet('World');
console.log(message);

const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log('Doubled numbers:', doubled);


const testObject = {
  title: 'Rapid Vision Reading',
  version: '1.0.0',
  active: true
};

console.log('Test object:', testObject);


if (typeof module !== 'undefined' && module.exports) {
  module.exports = { greet, testObject };
}

