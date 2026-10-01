/**
 * Author: Mei Huang
 * BeginningCutScene.js
 * Description: This is the introduction scene when players first start the game.Two different cut scenes exist
 *              depending on the state of the game. If the player has played the game already or it's the first
 *              time playing. Both pannels have fade in and face out transitions before starting Level 1 Scene.
 * Inputs: None
 * Outputs: None. It transitions and starts Level 1 Scene after the pannels finish.
 * Called By: MenuScene.goToNxtScene()
 * Calls: Level1
 */

class BeginningCutScene extends Phaser.Scene {
    /**
     * Constructor
     * Description: Registers this scene with Phaser with the key as 'BeginningCutScene'
     * Inputs: None
     * Outputs: None
     * Called By: Phaser game intialisation when the game config processes
     * Calls: super();
     */
    constructor() {
        super({key: 'BeginningCutScene'});
    }

    /**
     * create()
     * Description: Entry point to the two different pannels depending on game states.
     * Inputs: None
     * Outputs: None
     * Called By: Phaser engine
     * Calls: this.showPanel1()
     */
    create() {
        this.showPanel1();
    }

    /**
     * showPanel1
     * Description: Displays two different panels depending on game state. Picks the first panel if it's the players first
     *              playthrough. Picks the second one if its second play through. Will call showPanel2 if user presses the 
     *              next button after a short delay.
     * Inputs: None. It reads from this.registry.get('secrets') to pick panel
     * Outputs: None. Adds buttons and images to the scene.
     * Called By: this.create();
     * Calls: this.tweens.add(), this.add.image(), this.add.text(), this.time.delayedCall(), this.showPanel2()
     */
    showPanel1() {
        
        //First play gets the original intro, second play gets an updated intro
        if(this.registry.get('secrets').firstPlay) {
            this.panel1 = this.add.image(0, 0, 'beginningCutScene').setOrigin(0);
        } else {
            this.panel1 = this.add.image(0, 0, 'beginningCutScene2') .setOrigin(0);
        }

        //Fade into the first panel
        const fadeInRect = this.add.rectangle(960, 540, 1920, 1080, 0x000000).setAlpha(1);
        this.tweens.add({
            targets: fadeInRect,
            alpha: 0,
            duration: 1500,
            onComplete: () => {
                fadeInRect.destroy();
            }
        });

        //Next button when clicked fades out of panel1 and fades into panel2
        this.nextBtn = this.add.text(1748, 995, 'Next', { fontSize: '32px', fill: '#ffffff '})
            .setInteractive()
            .on('pointerdown', () => {
                const fadeRect = this.add.rectangle(960, 540, 1920, 0x000000).setAlpha(0);
                this.tweens.add({
                    targets: fadeRect,
                    alpha: 1,
                    duration: 1000,
                    onComplete: () => {
                        fadeRect.destroy();
                    }
                });

                // Destroy button and call showpanel2() after one second
                this.time.delayedCall(1000, () => {
                    this.showpanel2();
                    this.nextBtn.destroy();
                });
        });

        //Hover over and out button affect.
        this.nextBtn.on('pointerover', () => {
            this.nextBtn.setScale(1.1);
        });
        this.nextBtn.on('pointerout', () => {
            this.nextBtn.setScale(1);
        });
 
    }

    /**
     * showPanel2
     * Description: Moves panel1 off the screen to reveal the second frame (image is wide so used offset to 'move' image). Shifts
     *              the image by -1920. Fades in from black, then auto transitions to Level1 after 4 seconds.
     * Inputs: None
     * Outputs: None. Just transitions to Level1 after a 4 second delay.
     * Called By: this.showPanel1()
     * Calls: this.nextBtn.destroy(), this.tweens.add(), this.panel1.setX(), this.time.delayedCall(), this.FadeToLevel1()
     */
    showpanel2() {
        // Setting up fade rectangle and tween
        const fadeRect = this.add.rectangle(960, 540, 1920, 0x000000).setAlpha(1);
        this.tweens.add({
            targets: fadeRect,
            alpha: 0,
            duration: 2000,
            onComplete: () => {
                fadeRect.destroy();
            }
        });

        // Move the wide sprite to second panel
        this.panel1.setX(-1920);

        // Wait a bit and fade into Level 1
        this.time.delayedCall(4000, () => {
            this.fadeToLevel1();
        });
    }

    /**
     * fadeToLevel1
     * Description: Fades the screen to black and starts Level1 once the fade completes
     * Inputs: None
     * Outputs: None
     * Called By: this.showPanel2()
     * Calls: this.tweens.add(), this.scene.start('Level1')
     */
    fadeToLevel1() {
        // Setting up fade rectangle and tween
        const fadeRect = this.add.rectangle(960, 540, 1920, 1080, 0x000000).setAlpha(0);
        this.tweens.add({
            targets: fadeRect,
            alpha: 1,
            duration: 2000,
            onComplete: () => {
                this.scene.start('Level1');
            }
        });
    }
}