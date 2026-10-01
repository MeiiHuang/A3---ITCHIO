/**
 * Author: Mei Huang
 * Program Name: MidEnding
 * Description: MidEnding. Displays the middle ending when players collect two of the antidotes in the game. Shows one panel, has a fade in
 *              and fade out. Players have the next button which brings them back to the MenuScene.
 * Inputs: None. Reads from registry.get('secrets') for firstDLC flag
 * Outputs: None. Transitions to MenuScene when player clicks next as a side effect
 * Called By: Level4.js, Level5.js, Level6.js, Crane.js
 * Calls: MenuScene
 */
class MidEnding extends Phaser.Scene {
    /**
     * constructor
     * Description: Registers this scene with Phaser under the key 'MidEnding'
     * Inputs: None
     * Outputs: None
     * Called By: Phaser game when the game config is processed
     * Calls: super()
     */
    constructor() {
        super({key: 'MidEnding'});
    }

    /**
     * create
     * Description: Builds the mid ending scene. Displays the "Second Ending" title, fades in from black, then shows the first panel.
     * Inputs: None
     * Outputs: None. Builds the mid ending scene as a side effect
     * Called By: Phaser engine after preload()
     * Calls: this.add.text(), this.add.rectangle(), this.tweens.add(), this.time.delayedCall(), this.showPanel1()
     */
    create() {
        // Title for Ending One in DLC
        this.title = this.add.text(960, 514, "Second Ending", {fontSize: '40px', fill: '#ffffff'}).setOrigin(0.5).setDepth(2);
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

        this.showPanel1();
    }

    /**
     * showPanel1
     * Description: Fades in the mid ending panel image and adds a Next button. When clicked, the Next button fades to black then transitions to the MenuScene.
     * Inputs: None
     * Outputs: None. Displays panel and sets up button interaction as a side effect
     * Called By: create()
     * Calls: this.add.image(), this.add.text(), this.add.rectangle(), this.tweens.add(), this.time.delayedCall(), this.nextBtn.destroy(), this.scene.start()
     */
    showPanel1() {
        this.panel1 = this.add.image(0, 0, 'midEnding').setOrigin(0).setAlpha(0);

        this.tweens.add({
            targets: this.panel1,
            alpha: 1,
            duration: 1500            
        });
        
        // Adds the next button to display the next panel in the wide image
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