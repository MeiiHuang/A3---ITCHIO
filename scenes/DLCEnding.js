/**
 * Author: Mei Huang
 * Program Name: DLCEnding
 * Description: DLCEnding. Displays the normal ending when players go through all three levels of the DLC. Shows one panel, has a fade in
 *              and fade out. Players have the next button which brings them back to the MenuScene.
 * Inputs: None. Reads from registry.get('secrets') for firstDLC flag
 * Outputs: None. Transitions to MenuScene when player clicks next as a side effect
 * Called By: Crane.js
 * Calls: MenuScene
 */
class DLCEnding extends Phaser.Scene {

    /**
     * constructor
     * Description: Registers this scene with Phaser under the key 'DLCEnding'
     * Inputs: None
     * Outputs: None
     * Called By: Phaser game when the game config is processed
     * Calls: super()
     */
    constructor() {
        super({key: 'DLCEnding'});
    }

    /**
     * create
     * Description: Builds the DLC ending scene. Resets the firstDLC registry flag, displays the "Ending One" title, fades in from black, then kicks off the first panel.
     * Inputs: None
     * Outputs: None. Builds the DLC ending scene as a side effect
     * Called By: Phaser engine after preload()
     * Calls: this.registry.set(), this.add.text(), this.add.rectangle(), this.tweens.add(), this.time.delayedCall(), this.showPanel1()
     */
    create() {
        this.registry.set('firstDLC', false);

        // Title for Ending One in DLC
        this.title = this.add.text(960, 514, "Ending One", {fontSize: '40px', fill: '#ffffff'}).setOrigin(0.5).setDepth(2);
        this.time.delayedCall(2500, () => {
            this.title.setVisible(false);
        });

        // Fade in from black
        const fadeInRect = this.add.rectangle(960, 540, 1920, 1080, 0x000000).setAlpha(1).setDepth(1);
        this.tweens.add({
            targets: fadeInRect,
            alpha: 0,
            duration: 3500
        });

        // Show the DLC ending panel
        this.showPanel1();

    }

    /**
     * showPanel1
     * Description: Fades in the first ending panel image and adds a Next button. When clicked, the Next button fades to black then transitions to the MenuScene.
     * Inputs: None
     * Outputs: None. Displays panel and sets up a button interaction as a side effect
     * Calls By: create()
     * Calls: this.add.image(), this.add.text(), this.add.rectangle(), this.tweens.add(), this.time.delayedCall(), this.nextBtn.destroy(), this.scene.start()
     */
    showPanel1() {
        this.panel1 = this.add.image(0, 0, 'dlcEnding1').setOrigin(0).setAlpha(0);

        // Fade in the panel
        this.tweens.add({
            targets: this.panel1,
            alpha: 1,
            duration: 2000            
        });
        
        // Adds the next button to go back to MenuScene
        this.nextBtn = this.add.text(1748, 995, 'Next', { fontSize:'32px', fill: '#ffffff' }).setInteractive().on('pointerdown', () => {
            const fadeRect = this.add.rectangle(960, 540, 1920, 1080, 0x000000).setAlpha(0);
            this.tweens.add({
            targets: fadeRect,
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                fadeRect.destroy();
            }
            });
        this.nextBtn.on('pointerover', () => {this.nextBtn.setScale(1.1)});
        this.nextBtn.on('pointerout', () => {this.nextBtn.setScale(1)});

            // After a delay call show panel2
            this.time.delayedCall(1000, () => {
                this.nextBtn.destroy();
                this.scene.start('MenuScene');
            });
        });
    }
}