'use strict';

var command = {
    action: null,
    direction: null,
    message: '',
};

module.exports = {
    /**
     * @param {Object} gameState
     * @return {Object} command
     */
    takeAction: function(gameState) {
        // *********************************************************************
        // CODE HERE!
        // *********************************************************************

        command.action = null;
        command.direction = null;

        if (null != gameState) {
            var northExit = false;
            var southExit = false;
            var eastExit = false;
            var westExit = false;

            if (gameState.engram.sight.includes('north')) northExit = true;
            if (gameState.engram.sight.includes('south')) southExit = true;
            if (gameState.engram.sight.includes('east')) eastExit = true;
            if (gameState.engram.sight.includes('west')) westExit = true;

            if (gameState.engram.smell.includes('molten rock') && gameState.engram.smell.includes('north')) northExit = false;
            if (gameState.engram.smell.includes('molten rock') && gameState.engram.smell.includes('south')) southExit = false;
            if (gameState.engram.smell.includes('molten rock') && gameState.engram.smell.includes('east')) eastExit = false;
            if (gameState.engram.smell.includes('molten rock') && gameState.engram.smell.includes('west')) westExit = false;

            if (gameState.action == 'MOVE') {
                // avoid going backward!
                if (gameState.direction == 'NORTH') southExit = false;
                if (gameState.direction == 'SOUTH') northExit = false;
                if (gameState.direction == 'EAST') westExit = false;
                if (gameState.direction == 'WEST') eastExit = false;
            }

            // now determine where we can go!
            if (northExit) {
                command.action = 'move';
                command.direction = 'north';
            }
            if (southExit) {
                command.action = 'move';
                command.direction = 'south';
            }
            if (eastExit) {
                command.action = 'move';
                command.direction = 'east';
            }
            if (westExit) {
                command.action = 'move';
                command.direction = 'west';
            }

            console.log('Move #' + gameState.score.moveCount);
            console.log('  sight: ' + gameState.engram.sight);
            console.log('  smell: ' + gameState.engram.smell);
            console.log('  sound: ' + gameState.engram.sound);
            console.log('  taste: ' + gameState.engram.taste);
            console.log('  touch: ' + gameState.engram.touch);
        }

        if (command.action == null || command.direction == null) {
            command.action = 'look';
            command.direction = 'none';
        }

        console.log('  action: ' + command.action);
        console.log('  direction: ' + command.direction);

        return command;

        // *********************************************************************
        // STOP CODING!
        // *********************************************************************
    },
};
