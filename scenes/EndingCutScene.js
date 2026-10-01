/**
 * Author: Mei Huang
 * EndingCutScene.js
 * Program Name: EndingCutScene
 * Description: The bad ending cut scene. This scene plays when the player finishes the game without collecting all the 
 *              recipe pieces. Sets showMessage to true so the menu shows a pop to the next time it loads. Ending has
 *              three panels in total, all in one wide image, so it shifts to the left using setX offset to show each frame.
 * Inputs: None
 * Outputs: None
 * Called By: Level3.update()
 * Calls: MenuScene
 */

class EndingCutScene extends Phaser.Scene {

    /**
     * constructor
     * Description: Registers this scene with Phaser with the key 'EndingCutScene'
     * Inputs: None
     * Outputs: None
     * Called By: Phaser game initialisation when the game config is processed
     * Calls: super()
     */
    constructor() {
        super({key: 'EndingCutScene'});
    }

    /**
     * create
     * Description: Sets the showMessage flag so the menu shows the pop up dialogue once. Shows the 'Ending One' title card,
     *              fades in from black, then calls showPanel1.
     * Inputs: None. Reads and sets registry flag, 'showMessage'
     * Outputs: None. Sets registry flags. Adds title and fade elements as a side effect
     * Called By: Phaser engine after scene.start('EndingCutScene')
     * Calls: this.registry.get(), this.add.text(), this.time.delayedCall(), this.tweens.add(), this.showPanel1()
     */
    create() {
        //Read and set showMessage so the menu knows to display pop up.
        this.registry.set('firstPlay', false);
        this.registry.get('secrets').showMessage = true;

        // Title for Ending One
        this.title = this.add.text(960, 514, "Ending One. . .", {fontSize: '40px', fill: '#ffffff'}).setOrigin(0.5).setDepth(2);
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
     * Description: Loads the bad ending cutscene image (which is a wide image that holds all three panels) and adds a next
     *              button that fades to black then calls showPanel2
     * Inputs: None
     * Outputs: None. Adds panel image and next button as side effects
     * Called By: this.create()
     * Calls: this.add.image(), this.add.text(), this.tweens.ad(), this.time.delayedCall(), this.showPanel2()
     */
    showPanel1() {
        
        // Adds the wide image and displays first panel
        this.panel1 = this.add.image(0, 0, 'badEndingCutScene').setOrigin(0);

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

            // After a delay call show panel2
            this.time.delayedCall(1000, () => {
                this.nextBtn.destroy();
                this.showPanel2();
            });
        });
    }

    /**
     * showPanel2
     * Description: Slides panel1 left by 1920px to reveal the second frame in the wide image. Fades in from black then adds a next button
     *              that calls showPanel3
     * Inputs: None
     * Outputs: None. Shifts the panel 1 and adds fade/next button as side effects
     * Called By: this.showPanel1()
     * Calls: this.tweens.add(), this.panel1.setX(), this.time.delayedCall(), this.showPanel3
     */
    showPanel2() {
        // Fading into scene
        const fadeRect = this.add.rectangle(960, 540, 1920, 1080, 0x000000).setAlpha(1);
        this.tweens.add({
            targets: fadeRect,
            alpha: 0,
            duration: 2000,
            onComplete: () => {
                fadeRect.destroy();

            }
        });

        // Slide panel1 to show the second frame
        this.panel1.setX(-1920);

        // Adds a next button that transitions to the last frame
        this.nextBtn = this.add.text(1748, 995, 'Next', { fontSize: '32px', fill: '#ffffff' }).setInteractive().on('pointerdown', () => {
            const fadeRect = this.add.rectangle(960, 540, 1920, 1080, 0x000000).setAlpha(0);
            this.tweens.add({
            targets: fadeRect,
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                fadeRect.destroy();
            }
            });

            this.time.delayedCall(1000, () => {
                this.nextBtn.destroy();
                this.showPanel3();
            });

        });
    }

    /**
     * showPanel3
     * Description: Slides panel1 left by 3840px total to reveal the last panel in the wide image, fades in from black, then auto-returns
     *              to the menu after 5 seconds.
     * Inputs: None
     * Outputs: None. Shifts panel1 left to the last frame and returns to menu as side effects
     * Called By: this.showPanel2()
     * Calls: this.tweens.ad(), this.panel1.setX(), this.time.delayedCall(), this.scene.start('MenuScene')
     */
    showPanel3() {

        // fade into last panel
        const fadeRect = this.add.rectangle(960, 540, 1920, 1080, 0x000000).setAlpha(1);
        this.tweens.add({
            targets: fadeRect,
            alpha: 0,
            duration: 2000,
            onComplete: () => {
                fadeRect.destroy();

            }
        });

        // Slide to third frame
        this.panel1.setX(-3840);

        // Auto return to main menu after a few seconds
        this.time.delayedCall(5000, () => {
            this.scene.start('MenuScene');
        });
    }


}