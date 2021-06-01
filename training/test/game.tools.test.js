var gameTools = require('../src/game.tools');

describe('game with a zero rooms', () => {

  beforeEach(() => {
    global.Game = {rooms: {}};
  });

  afterEach(() => {
    delete global.Game;
  });

  test('getCurrentRoom reports undefined', () => {
    
    current_room = gameTools.getCurrentRoom();
    expect(current_room).toBeUndefined();

  });

});

describe('game with a single room', () => {

  beforeEach(() => {
    global.Game = {rooms: { 0: {name:'E42S15'} }};
  });

  afterEach(() => {
    delete global.Game;
  });

  test('getCurrentRoom reports the room', () => {
    
    current_room = gameTools.getCurrentRoom();
    expect(current_room.name).toBe('E42S15');

  });

});

describe('game with a multiple room', () => {

  beforeEach(() => {
    global.Game = {rooms: { 0: {name:'E42S14'}, 1: {name:'E42S16'} }};
  });

  afterEach(() => {
    delete global.Game;
  });

  test('getCurrentRoom reports the first room', () => {
    
    current_room = gameTools.getCurrentRoom();
    expect(current_room.name).toBe('E42S14');

  });

});
