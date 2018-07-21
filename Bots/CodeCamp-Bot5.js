'use strict';
// James Dean
var command = {
    action: null,
    direction: null,
    message: '',
};

let deadEnded = false; // used while back-tracking out of a dead end
let searchStack = []; // used to track nearby exit smell when dir unknown

let dirs = ['none', 'north', 'south', 'east', 'west'];

// 50x50 grid used to map progress
let map;
let traps;

// init map called with each new maze
function initMap() {
    map = new Array(50);
    traps = new Array(50);
    searchStack = [];
    for (var x = 0; x < map.length; x++) {
        map[x] = new Array(50).fill(0);
        traps[x] = new Array(50).fill(0);
    }

    deadEnded = false;
}

// return the reverse direction
function reverse(dir) {
    if (dir == 'north') return 'south';
    if (dir == 'south') return 'north';
    if (dir == 'east') return 'west';
    if (dir == 'west') return 'east';
}

function getExits(si) {
    let oe = [];
    let sub = si.substring(si.indexOf(' to the ') + 8, si.indexOf('.'));
    for (var x = 1; x < dirs.length; x++) if (sub.includes(dirs[x])) oe.push(x);
    return oe;
}

function peek(arr, loc, dir) {
    var row = dir == 'north' ? loc.row - 1 : dir == 'south' ? loc.row + 1 : loc.row;
    var col = dir == 'west' ? loc.col - 1 : dir == 'east' ? loc.col + 1 : loc.col;
    return arr[row][col];
}

// validate a potential move
function doMove(si, so, sm, oe, loc) {
    let move;
    let paths = [];

    for (var x = 0; x < oe.length; x++) {
        move = 'ok';
        if (move == 'ok') move = traps[loc.row][loc.col] == oe[x] ? 'dead-path' : 'ok';
        if (move == 'ok') move = si.includes('lava') && dirs[oe[x]] == 'north' ? 'trap' : 'ok';
        if (move == 'ok') move = so.includes('wind to the ' + dirs[oe[x]]) ? 'trap' : 'ok';
        if (move == 'ok') move = so.includes('hissing to the ' + dirs[oe[x]]) ? 'trap' : 'ok';
        if (move == 'ok') move = sm.includes('CHEESE') ? 'win' : 'ok';

        // move toward detected exit automatically
        if (move == 'win') return { action: 'move', direction: 'south', message: 'win' };
        if (move == 'near-win') return { action: 'move', direction: dirs[oe[x]], message: 'near-win' };

        if (move == 'ok') {
            paths.push({ dir: dirs[oe[x]], visits: peek(map, loc, dirs[oe[x]]) });
        } else if (move == 'trap') {
            traps[loc.row][loc.col] = oe[x]; // mark trap in dir
        }
    }

    let best = { dir: 'none', visits: 7500 };
    paths.forEach((path) => {
        if (path.visits < best.visits) best = path;
    });

    command = { action: 'move', direction: best.dir, message: '' };
    console.log('  doMove -> %s:%s:%s', command.action, command.direction, command.message);

    return command;
}

module.exports = {
    /**
     * @param {Object} gameState
     * @return {Object} command
     */
    takeAction: function(gameState) {
        // *********************************************************************
        // CODE HERE!
        // *********************************************************************

        if (gameState == null) {
            initMap();
            command.action = 'look';
            command.direction = 'none';
            return command;
        }

        console.log('MOVE: %s', gameState.score.moveCount);

        // alias engram data - ignore taste and touch
        let si = gameState.engram.sight;
        let so = gameState.engram.sound;
        let sm = gameState.engram.smell;

        let loc = gameState.location;
        if (map[loc.row][loc.col] == 0) map[loc.row][loc.col] = 1; // new game, add visit

        // capture last action and direction
        let lDir = gameState.direction.toLowerCase();
        let lAct = gameState.action.toLowerCase();

        // assume we're moving
        command.action = 'move';

        // build ex object from current sight string
        let ex = getExits(si);

        // always stand if end up sitting
        if (gameState.playerStateInWords == 'sitting') {
            command.action = 'stand';
            command.direction = lDir; // carry last dir to next move

            console.log('  !! SITTING !! Action -> %s:%s:%s', command.action, command.direction, command.message);

            return command;
        }

        // update the map visit count
        if (lAct == 'move') {
            map[loc.row][loc.col] = map[loc.row][loc.col] + 1;
        }

        // hear the exit - move there above all other options (it's never north)
        if (so.includes('beeping')) {
            if (so.includes('south')) command.direction = 'south';
            if (so.includes('east')) command.direction = 'east';
            if (so.includes('west')) command.direction = 'west';
            if (command.direction != '') console.log('Exit heard, moving %s', command.direction);
            return command;
        }

        // smell the exit, but no direction given.. focus on this only!
        if (sm.includes('less stale air') || searchStack.length > 0) {
            for (var x = 0; x < ex.length; x++) {
                if (peek(map, loc, dirs[ex[x]]) + peek(traps, loc, dirs[ex[x]]) == 0 && dirs[ex[x]] != 'north') {
                    searchStack.push({ action: 'move', direction: dirs[ex[x]], message: '' });
                }
            }
        }

        // if there's a search dir on the stack go there
        if (searchStack.length > 0) return searchStack.pop();

        // note if we're dead-ended for backtracking
        if (!deadEnded) {
            if (ex.count == 1) {
                deadEnded = true;

                // capture dead-end as trap, -1 indicates dead-end head
                traps[loc.row][loc.col] = -1;

                // back out of dead end
                command.direction = reverse(lDir);
                return command;
            }
        } else {
            traps[loc.row][loc.col] = dirs.indexOf(reverse(lDir)); // note dead end
            if (ex.count > 2) {
                deadEnded = false;
                console.log('  -deadEnded');
            }
        }

        // get and make a move
        return doMove(si, so, sm, ex, loc);

        console.log('  !! NO COMMAND RETURNED !! Command -> = %s:%s:%s', command.action, command.direction, command.message);

        // *********************************************************************
        // STOP CODING!
        // *********************************************************************
    },
};
