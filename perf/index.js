var Benchmark = require('benchmark')
var t = require('../lib/index')

const suite = new Benchmark.Suite()

const T = t.type({
  a: t.string,
  b: t.number,
  c: t.array(t.boolean),
  d: t.tuple([t.number, t.string])
})
const payload = { c: [1], d: ['foo'] }
// const payload = {}

suite
  .add('io-ts', function() {
    t.validate(payload, T)
  })
  .on('cycle', function(event) {
    console.log(String(event.target))
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
