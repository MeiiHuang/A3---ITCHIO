/**
 * Author: Mei Huang
 * GoodCutScene.js
 * Program Name: GoodCutScene
 * Description: The true ending cutscene. Only plays when player has collected all three recipes (collectAll = true). Shows
 *              "Ending Two" title, fades in the good ending panel, then returns the player to the main menu.
 * Inputs: None
 * Outputs: None. Transitions to MenuScene after the panel.
 * Called By: Level1.update(), Level2.update(), Level3.update() via this.scene.start('GoodCutScene') when all three recipes are confirmed
 * Calls: MenuScene
 */

class GoodCutScene extends Phaser.Scene {
    /**
     * constructor
     * Description: Registers this scene with Phaser with the key 'GoodCutScene'
     * Inputs: None
     * Outputs: None
     * Called By: Phaser game initialization when the game config is processed
     * Calls: super()
     */
    constructor() {
        super({key: 'GoodCutScene'});
    }

    /**
     * create
     * Description: Shows the "Ending Two" title card that fades after the 2.5 seconds, fades in from black, then calls showPanel1
     *              to display the ending panel.
     * Inputs: None
     * Outputs: None. Adds title text and fade in rectangle as side effects
     * Called By: Phaser engine
     * Calls: this.add.text(), this.time.delayedCall(), this.tweens.add(), this.showPanel1()
     */
    create() {
        // Title card fades out after 2.5 seconds
        this.title = this.add.text(960, 514, "Ending Two. . .", {fontSize: '40px', fill: '#ffffff'}).setOrigin(0.5).setDepth(2);
        this.time.delayedCall(2500, () => {
            this.title.setVisible(false);
        });

        // Fade in from black
        const fadeInRect = this.add.rectangle(960, 540, 1920, 1080, 0x000000)
            .setAlpha(1).setDepth(10);
        this.tweens.add({
            targets: fadeInRect,
            alpha: 0,
            duration: 2500
        });

        // Show the next panel
        this.showPanel1();
    }

    /**
     * showPanel1
     * Description: Displays the good ending panel image and adds a next button that fades to black and returns player to main menu
     * Inputs: None
     * Outputs: None. Adds panel image and next buttons as side effects
     * Called By: this.create()
     * Calls: this.add.image(), this.add.text(), this.tweens.add(), this.time.delayedCall(), this.scene.start('MenuScene')
     */
    showPanel1() {
        // Add panel image
        this.panel1 = this.add.image(0, 0, 'goodEndingCutScene').setOrigin(0, 0);

        // Fades to black then goes back to menu when presses next
        this.nextBtn = this.add.text(1748, 995, 'Next', { fontSize: '32px', fill: '#ffffff' }).setInteractive().on('pointerdown', () => {
            const fadeRect = this.add.rectangle(960, 540, 1920, 1080, 0x000000).setAlpha(0);
            this.tweens.add({
            targets: fadeRect,
            alpha: 1,
            duration: 3000,
            onComplete: () => {
                fadeRect.destroy();
            }
            });

            // Start MenuScene after a short delay
            this.time.delayedCall(1000, () => {
                this.scene.start('MenuScene');
            });

        });
    }
}