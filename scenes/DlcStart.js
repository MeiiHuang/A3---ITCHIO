/**
 * Program Name:DlcStart
 * Description: Introductory cutscene scene that bridges the main game into the DLC content. Sets the firstDLC registry flag to false and marks the DLC as shown, 
 *              then displays a title card reading "A couple days after Sumi ate the Moon Flakes..." before fading into the DLC intro panel. 
 *              The Next button transitions the player into Level4.
 * Inputs: None. Writes to registry fristDLC and secrets.showDLC flags.
 * Outputs: None. Transitions to Level4 on completion.
 * Called By: MenuScene
 * Calls: Level4
 */
class DlcStart extends Phaser.Scene {
    /**
     * constructor
     * Description: Registers this scene with Phaser under the key 'DlcStart'
     * Inputs: None
     * Outputs: None
     * Called By: Phaser game when the game config is processed
     * Calls: super()
     */
    constructor() {
        super({key: 'DlcStart'});
    }

    /**
     * create
     * Description: Builds the DLC intro scene. Sets the firstDLC registry flag to false and marks showDLC as true, displays the intro title card, 
     *              fades in from black over 6 seconds, then kicks off the first panel.
     * Inputs: None
     * Outputs: None. Builds the DLC intro scene as a side effect
     * Called By: Phaser engine after preload()
     * Calls: this.registry.set(), this.registry.get(), this.add.text(), this.add.rectangle(), this.tweens.add(), this.time.delayedCall(), this.show.Panel1()
     */
    create() {
        this.registry.set('firstDLC', false);
        this.registry.get('secrets').showDLC = true;

        // Title for Ending One in DLC
        this.title = this.add.text(960, 514, "A couple days after Sumi ate the Moon Flakes...", {fontSize: '40px', fill: '#ffffff'}).setOrigin(0.5).setDepth(2);
        this.time.delayedCall(2500, () => {
            this.title.setVisible(false);
        });

        // Fade in from black
        const fadeInRect = this.add.rectangle(960, 540, 1920, 1080, 0x000000).setAlpha(1).setDepth(1);
        this.tweens.add({
            targets: fadeInRect,
            alpha: 0,
            duration: 6000
        });

        this.showPanel1();

    }

    /**
     * showPanel1
     * Description: Fades in the DLC intro panel image over 6 seconds and adds a Next button. When clicked, the Next button fades to black then transitions to Level4.
     * Inputs: None
     * Outputs: None. Displays panel and sets up button interaction as a side effect
     * Called By: create()
     * Calls: this.add.image(), this.add.text(), this.add.rectangle(), this.tweens.add(), this.time.delayedCall(), this.nextBtn.destroy(), this.scene.start()
     */
    showPanel1() {
        this.panel1 = this.add.image(0, 0, 'toDLC').setOrigin(0).setAlpha(0);

        this.tweens.add({
            targets: this.panel1,
            alpha: 1,
            duration: 6000            
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
                this.scene.start('Level4');
            });
        });
    }
}