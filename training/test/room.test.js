var Room = require('../src/room');


test('room object loads', () => {
  var room = new Room.Room();

  expect('run' in room).toBeTruthy();
});
