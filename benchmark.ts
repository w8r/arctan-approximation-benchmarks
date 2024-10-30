import Benchmark from 'benchmark';
import { taylorAtan } from './src/utils/atan';

const suite = new Benchmark.Suite;

// Test values in [-1, 1] range
const testValues = [-1, -0.5, 0, 0.5, 1];

suite
  .add('Taylor Series atan 5 terms', function() {
    testValues.forEach(x => taylorAtan(x, 5));
  })
  .add('Taylor Series atan 3 terms', function() {
    testValues.forEach(x => taylorAtan(x, 3));
  })
  .add('Math.atan', function() {
    testValues.forEach(x => Math.atan(x));
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ 'async': true });