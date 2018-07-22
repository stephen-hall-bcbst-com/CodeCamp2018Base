'use strict';
// James Dean
var command = { action: null, direction: null, message: '' };
let deadEnded = false; // used while back-tracking out of a dead end
let searchStack = []; // used to track nearby exit smell when dir unknown
let dirs = ['none', 'north', 'south', 'east', 'west'];
let map; // used to track movement
let traps; // used to track traps

function initMap(loc) {
    map = new Array(50);
    traps = new Array(50);
    deadEnded = false;
    searchStack = [];
    for (var x = 0; x < map.length; x++) {
        map[x] = new Array(50).fill(0);
        traps[x] = new Array(50).fill(0);
    }
    map[loc.row][loc.col] = 1; // add visit to start cell
    traps[loc.row][loc.col] = 1; // note lava trap in start cell
}

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

function doMove(si, so, sm, oe, loc) {
    let paths = [];
    let best = { dir: 'none', visits: 7500 }; // 7500 is max potential cell count

    for (var x = 0; x < oe.length; x++) {
        if (so.includes('beeping') && so.includes(dirs[oe[x]])) return { action: 'move', direction: dirs[oe[x]], message: 'win' }; // WIN!
        if ((so.includes('wind') || so.includes('rhythm')) && so.includes('to the ' + dirs[oe[x]])) traps[loc.row][loc.col] = oe[x];
        if (traps[loc.row][loc.col] != oe[x]) paths.push({ dir: dirs[oe[x]], visits: peek(map, loc, dirs[oe[x]]) }); // save this path
    }
    for (var x = 0; x < paths.length; x++) if (paths[x].visits < best.visits) best = paths[x];
    if (searchStack.length > 0) return searchStack.pop();
    else return { action: 'move', direction: best.dir, message: '' };
}

module.exports = {
    takeAction: function(gameState) {
        if (gameState == null) return { action: 'look', direction: 'none', message: '' };
        if (gameState.score.moveCount == 1) initMap(gameState.location);

        let loc = gameState.location; // grab location
        let lDir = gameState.direction.toLowerCase(); // alias last direction
        let ex = getExits(gameState.engram.sight); // build ex (open exits) array
        if (gameState.action.toLowerCase() == 'move') map[loc.row][loc.col] = map[loc.row][loc.col] + 1; // update map visit count
        if (gameState.engram.smell.includes('CHEESE')) return { action: 'move', direction: 'south', message: 'win' }; // move toward exit
        if (gameState.engram.smell.includes('less stale air') && searchStack == 0) {
            for (var x = 0; x < ex.length; x++) {
                if (dirs[ex[x]] != 'north' && peek(map, loc, dirs[ex[x]]) + peek(traps, loc, dirs[ex[x]]) == 0) {
                    searchStack.push({ action: 'move', direction: reverse(dirs[ex[x]]), message: '' });
                    searchStack.push({ action: 'move', direction: dirs[ex[x]], message: '' });
                }
            }
        }

        // handle escaping and marking dead-ends
        if (!deadEnded) {
            if (ex.count == 1) {
                deadEnded = true;
                traps[loc.row][loc.col] = -1; // capture dead-end as trap, -1 indicates dead-end head
                command.direction = reverse(lDir); // back out of dead end
                return command;
            }
        } else {
            traps[loc.row][loc.col] = dirs.indexOf(reverse(lDir)); // note dead end
            if (ex.count > 2) deadEnded = false;
        }

        return doMove(gameState.engram.sight, gameState.engram.sound, gameState.engram.smell, ex, loc); // make a normal move
    },
};
