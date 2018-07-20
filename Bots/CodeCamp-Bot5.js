'use strict';
// James Dean
var command = {
    action: null,
    direction: null,
    message: '',
};

let deadEnded = false;

function exits(xn, xs, xe, xw) {
    let xc = 0;
    if (xn) xc++;
    if (xs) xc++;
    if (xe) xc++;
    if (xw) xc++;

    console.log('  Exit Count: %s', xc);
    return xc;
}

function reverse(dir) {
    if (dir == 'north') return 'south';
    if (dir == 'south') return 'north';
    if (dir == 'east') return 'west';
    if (dir == 'west') return 'east';
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
            command.action = 'look';
            command.direction = 'none';
            return command;
        }

        console.log('MOVE: %s', gameState.score.moveCount);

        let si = gameState.engram.sight;
        let so = gameState.engram.sound;
        let sm = gameState.engram.smell;

        let ld = gameState.direction.toLowerCase();
        let la = gameState.action.toLowerCase();

        let xn = si.includes('exit') && si.includes('north');
        let xs = si.includes('exit') && si.includes('south');
        let xe = si.includes('exit') && si.includes('east');
        let xw = si.includes('exit') && si.includes('west');

        // assume a move...
        command.action = 'move';

        // always stand if end up sitting
        if (gameState.playerStateInWords == 'sitting') {
            command.action = 'stand';
            command.direction = ld;
        }

        // note if we're dead-ended for backtracking
        if (!deadEnded) {
            if (exits(xn, xs, xe, xw) == 1) {
                console.log('  Dead-end detected.');
                deadEnded = true;

                // go back
                command.direction = reverse(ld);
                return command;
            }
        } else {
            if (exits(xn, xs, xe, xw) > 2) {
                deadEnded = false;
                if (!si.includes('note')) {
                    command.action = 'write';
                    command.direction = ld;
                    command.message = 'dead-end ' + reverse(ld);
                    console.log('  Left note.');
                    return command;
                } else {
                    command.direction = ld;
                    return command;
                }
            }
        }

        // hear the exit...
        if (so.includes('beeping')) {
            if (so.includes('south')) command.direction = 'south';
            if (so.includes('east')) command.direction = 'east';
            if (so.includes('west')) command.direction = 'west';
            return command;
        }

        // smell the cheese
        if (sm.includes('CHEESE')) {
            command.direction = 'south';
            return command;
        }

        // choose direction by priority first - south is best!
        if (xs) {
            if (!si.includes('dead-end south') && ld != 'north') {
                if (so.includes('wind to the south') || so.includes('hissing to the south')) {
                    if (la != 'look') command.action = 'look';
                    else if (xs) command.action = 'jump';
                    else {
                        command.action = 'write';
                        command.message = 'dead-end south';
                    }
                }
                command.direction = 'south';
                return command;
            }
        }

        if (xe) {
            if (!si.includes('dead-end west') && ld != 'west') {
                if (so.includes('wind to the east') || so.includes('hissing to the east')) {
                    if (la != 'look') command.action = 'look';
                    else if (xs) command.action = 'jump';
                    else {
                        command.action = 'write';
                        command.message = 'dead-end east';
                    }
                }
                command.direction = 'east';
                return command;
            }
        }

        if (xw) {
            if (!si.includes('dead-end east') && ld != 'east') {
                if (so.includes('wind to the west') || so.includes('hissing to the west')) {
                    if (la != 'look') command.action = 'look';
                    else if (xs) command.action = 'jump';
                    else {
                        command.action = 'write';
                        command.message = 'dead-end west';
                    }
                }
                command.direction = 'west';
                return command;
            }
        }

        if (xn && !so.includes('lava flow')) {
            if (!si.includes('dead-end north') && ld != 'south') {
                if (so.includes('wind to the north') || so.includes('hissing to the north')) {
                    if (la != 'look') command.action = 'look';
                    else if (xs) command.action = 'jump';
                    else {
                        command.action = 'write';
                        command.message = 'dead-end north';
                    }
                }
                command.direction = 'north';
                return command;
            }
        }

        if (exits()) console.log('  ***DEFAULT ACTION***  ');
        command.direction = 'none';
        command.action = 'look';
        return command;

        // *********************************************************************
        // STOP CODING!
        // *********************************************************************
    },
};
