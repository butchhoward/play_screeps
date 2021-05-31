var CreepPool = require('./creep.pool');

test('creeppool loads', () => {
  var creepPool = new CreepPool.CreepPool();

  expect(creepPool.a).toBe(1  );
});
