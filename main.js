/**
 * Author: Mei Huang
 * main.js
 * Description: Sets up the game renderer, display dimensions, physics, and scene order. Scene load
 *              in this order: Boot -> Menu -> Story -> Levels -> Endings
 * Inputs: None
 * Outputs: None
 * Called By: Entry point to game, called by index.html
 * Calls: Phaser.game(config)
 */
const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    backgroundColor: '#0a0a0a',
    physics: {
        default: 'arcade',
        arcade: {
            gravit: { y: 600},
            debug: false
        }
    },
    //Boots up assets for every scene
    scene: [BootScene, MenuScene, BeginningCutScene, Level1, Level2, Level3, EndingCutScene, GameOverScene, GoodCutScene, DlcStart, Level4, Level5, Level6, Crane, DLCEnding, MidEnding, TrueEnding]
};

// Starts new game
const game = new Phaser.Game(config);

