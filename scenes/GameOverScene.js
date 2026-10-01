/**
 * Author: Mei Huang
 * Program Name: GameOverScene
 * Description: Shown when the player runs out of lives. Plays the game over animation and gives the player a retry button to 
 *              restart the level they died in.
 * Inputs: data.precviousScene(string). The scene key to return to on retry, passed via scene.start
 * Outputs: None. Restarts previous scene level
 * Called By: Level1.substractLife(), Level2.subtractHearts(), Level3.subtractLife()
 * Calls: Level1, Level2, or Level3, depending on what was passed in as previousScene
 */

class GameOverScene extends Phaser.Scene {
    
    /**
     * constructor
     * Description: Registers this scene with Phaser with the key as 'GameOverScene'
     * Inputs: None
     * Outputs: None
     * Called By: Phaser game initialisation when the game config is processed
     * Calls: super()
     */
    constructor() {
        super({key: 'GameOverScene'});
    }

    /**
     * create
     * Description: Reads the previousScene from the data passed in, creates the looping game over animation, guarded with an exist
     *              to avoid warnings in console on every call. Adds a retry button that sends the player back to the correct level.
     * Inputs: data (object): expected to contain data.previousScene(string), falls back to level player died at
     * Output: None. Displays game over screen with retry button as side effect.
     * Called By: Phaser engine
     * Calls: this.anims.exist(), this.anims.create(), this.anims.play(), this.add.sprite(), this.add.text(), this.scene.start()
     */
    create(data) {
        // Restarts level the player died at
        this.previousScene = data.previousScene;

        //Guard against re-creating anims
        if(!this.anims.exists('gameOverAnim')) {
            this.anims.create({
                key: 'gameOverAnim',
                frames: this.anims.generateFrameNumbers('gmOv', { start: 0, end: 1}),
                frameRate: 1,
                repeat: -1
            });
        }
        // Play game over animation
        this.anims.play('gameOverAnim', this.add.sprite(0, 0, 'gmOv').setOrigin(0));

        // Retry button sends player back to which ever level they died in
        const menuBtn = this.add.text(960, 1000, 'Retry', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            this.scene.start(this.previousScene);
        });
    }
}