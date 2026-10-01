
/**
 * Author: Mei Huang
 * Program Name: MenuScene
 * Description: The main menu of the game. The background changes depending on the state of the game.
 *              First time playing the game, only shows a start button and the normal background. If
 *              it's the second time playing after the player gets the bad ending, it shows the gate open.
 *              When the player finally gets the good ending it'll show Sumi's owner calling for her and
 *              sumi coming through the gates. After the first playthrough, the main menu also shows a new
 *              button, the Levels button where players can choose which level to attempt again so they 
 *              can collect the recipes. Shows a gold star on the levels where secret was collected. When player
 *              finishes the game, levels 1-3, a DLC button will show up, allowing players to advance and play
 *              the expansion levels of this game. After completeting all three levels in the DLC players
 *              now will see a change in the background and a message pop up. In the levels it will also show the 
 *              new DLC levels. Upon getting any of the secrets in the three levels, players will return here and see 
 *              a symbol on which levels they have collected the antidote.
 * Inputs: None. Reads from registry.
 * Outputs: None. Transitions to BeginningCutScene, DlcStart, Level1, Level2, Level3, Level4, Level5, Level6, or MenuScene 
 *          depending on button pressed.
 * Called By: BootScene, DLCEnding, MidEnding, TrueEnding, Level4, Level5, Level6, Crane
 * Calls: BeginningCutScene, DlcStart, Level1, Level2, Level3, Level4, Level5, Level6
 */
class MenuScene extends Phaser.Scene {

    /**
     * constructor
     * Description: Registers this scene with Phaser as the key 'MenuScene'
     * Inputs: None
     * Outputs: None
     * Called By: Phaser game after config is processed
     * Calls: super()
     */
    constructor() {
        super({key: 'MenuScene'});
    }


    /**
     * preload
     * Description: Creates all sound cues ready for the menu. Loads the dialogue box click sound and the button hover sound.
     * Inputs: None
     * Outputs: None. Creates all sound objects ready to use as a side effect
     * Called By: Phaser engine before create()
     * Calls: this.sound.add()
     */
    preload() {
        // Adding audio cues
        this.diaboxSound = this.sound.add('diaBox', {volume: 1, loop: false});
        this.buttonHover = this.sound.add('buttonHover', {volume: 1.5, loop: false});
    }

    /**
     * create
     * Description: Builds the full main menu scene. Sky, clouds, birds and house in that order. The
     *              Birds and clouds have a tween that makes the image move so the main menu doesnt
     *              seem flat or static. Shows the title and the start button that has a hover over
     *              and mouse out animation. Returning to the main menu after the first playthrough
     *              shows two new buttons, Levels and DLC. Also showing a popup message after the first playthrough
     *              for both the first three levels but also the dlc levels.
     * Inputs: None
     * Outputs: None. Builds the menu and sets up all button interactions as a side effect
     * Called By: Phaser engine
     * Calls: this.add.image(), this.add.text(), this.add.rectangle(), this.tweens.add(), this.registry.get(), this.goToNxtScene(), 
     *        this.scene.start(), this.scene.stop(), this.buttonHover.play(), this.diaboxSound.play()
     */
    create() {
        // Picking a background depending on the state of the game
        const registry = this.registry.get('secrets');
        //registry.collectAll = true;// for skipping the first three levels in the game
        registry.firstPlay = false;// for skipping the first three levels in the game
        //registry.firstDLC = false;// for skipping the first three levels in the game
        if(!registry.firstDLC) {
            this.background = this.add.image(0, 0, 'afterDLC').setOrigin(0).setDepth(9);
        } else if(registry.collectAll) {
            this.background = this.add.image(0, 0, 'goodEnding').setOrigin(0).setDepth(9);
        } else if(!registry.collectAll) {
            this.background = this.add.image(0, 0, 'badEnding').setOrigin(0).setDepth(9);
        } else {
            this.background = this.add.image(0, 0, 'menuBg').setOrigin(0).setDepth(9);
        }

        // Show the original game backgrounds and tweens if player has not played the game yet
        if(registry.firstDLC) {
            this.add.image(0, 0, 'sky').setOrigin(0);
            this.clouds = this.add.image(0, 0, 'clouds').setOrigin(0);
            // Decorative birds in the sky
            this.rBirds = this.add.image(1177, 89, 'rBirds');
            this.lBirds = this.add.image(49, 229, 'lBirds');

            // Adding animations for both the birds, slight swaying animation
            this.tweens.add({
                targets: this.rBirds,
                y: this.rBirds.y + 20,
                x: this.rBirds.x + 20,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Cos.easeInOut'
            });

            this.tweens.add({
                targets: this.lBirds,
                y: this.lBirds.y + 20,
                x: this.lBirds.x + 30,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Adding clouds that move up and down to add more depth to main scene
            this.tweens.add({
                targets: this.clouds,
                y: this.clouds.y + 20,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Game title and decorative lines
            this.add.text(500, 140, "Sumi's Journey", { fontSize: '48px', fill: '#161414' }).setOrigin(0.5);
            this.add.rectangle(520, 165, 616, 3, 0x425777);
            this.add.rectangle(570, 175, 616, 3, 0x425777);
        }
        

        // Start button
        const startBtn = this.add.image(1320, 230, 'srtBtn').setDepth(10).setInteractive().on('pointerdown', () => {
            this.goToNxtScene();
        });

        // Levels button, only shows after the second playthrough
        if(!this.registry.get('secrets').firstPlay) {
            const registry = this.registry.get('secrets');

            //DLC button + pointerover and pointerout interactions
            this.dlcBtn = this.add.image(1320, 630, 'dlcBtn').setScale(0.75).setDepth(10).setInteractive().on('pointerdown', () => {this.scene.start('DlcStart')}); 
            this.dlcBtn.on('pointerover', () => {this.dlcBtn.setScale(0.85);this.diaboxSound.play();});
            this.dlcBtn.on('pointerout', () => {this.dlcBtn.setScale(0.75)});

            // Levels button
            const levelBtn = this.add.image(1320, 330, 'levels').setScale(0.75).setDepth(10).setInteractive().on('pointerdown', () => {
                // Levels popup overlay
                this.levelPop = this.add.image(0, 0, 'popup').setOrigin(0).setDepth(11);

                // Back button to return to main menu scene
                this.backButton = this.add.image(380, 260, 'back').setOrigin(0).setInteractive().on('pointerdown', () => {
                    this.scene.start('MenuScene');
                }).setDepth(999);

                // Pointer over and pointer out animations for back button
                this.backButton.on('pointerover', () => {
                    this.backButton.setScale(1.1);
                    this.buttonHover.play();
                });
                this.backButton.on('pointerout', () => {
                    this.backButton.setScale(1);
                });

                // Show DLC levels after the first succesful playthrough
                if(!this.registry.get('secrets').firstDLC) {
                    // Chooses the correct sprite for if player has collected any secrets
                    const level4Star = registry.anti1 ? 'dlc1Star' : 'dlc1';
                    const level5Star = registry.anti2 ? 'dlc2Star' : 'dlc2';
                    const level6Star = registry.anti3 ? 'dlc3Star' : 'dlc3';

                    // Adding all button interactives
                    this.level4btn = this.add.image(652, 540, level4Star).setOrigin(0).setInteractive().on('pointerdown', () => {
                        this.scene.stop('Level4');
                        this.scene.start('Level4');
                    }).setDepth(999).setScale(1);

                    this.level5btn = this.add.image(900, 540, level5Star).setOrigin(0).setInteractive().on('pointerdown', () => {
                        this.scene.start('Level5');
                    }).setDepth(999).setScale(1);

                    this.level6btn = this.add.image(1148, 540, level6Star).setOrigin(0).setInteractive().on('pointerdown', () => {
                        this.scene.start('Level6');
                    }).setDepth(999).setScale(1);

                    this.level4btn.on('pointerover', () => { this.level4btn.setScale(1.1);this.diaboxSound.play();});
                    this.level4btn.on('pointerout', () => { this.level4btn.setScale(1)});
                    this.level5btn.on('pointerover', () => { this.level5btn.setScale(1.1);this.diaboxSound.play();});
                    this.level5btn.on('pointerout', () => { this.level5btn.setScale(1)});
                    this.level6btn.on('pointerover', () => { this.level6btn.setScale(1.1);this.diaboxSound.play();});
                    this.level6btn.on('pointerout', () => { this.level6btn.setScale(1)});

                }

                // Display a level with a start if recipe was collected, plain level button if not collected
                const level1Star = registry.level1 ? 'level1star' : 'levels1';
                const level2Star = registry.level2 ? 'level2star' : 'levels2';
                const level3Star = registry.level3 ? 'level3star' : 'levels3';

                // All level buttons, 1, 2, 3
                this.level1Back = this.add.image(652, 380, level1Star).setOrigin(0).setInteractive().on('pointerdown', () => {
                    this.scene.start('Level1');
                }).setDepth(11);

                this.level2Back = this.add.image(900, 380, level2Star).setOrigin(0).setInteractive().on('pointerdown', () => {
                    this.scene.start('Level2');
                }).setDepth(11);

                this.level3Back = this.add.image(1148, 380, level3Star).setOrigin(0).setInteractive().on('pointerdown', () => {
                    this.scene.start('Level3');
                }).setDepth(11);

                // Adding all pointer over and pointer out animations for all three level buttons
                this.level1Back.on('pointerover', () => { this.level1Back.setScale(1.1); this.buttonHover.play();});
                this.level1Back.on('pointerout', () => { this.level1Back.setScale(1); });

                this.level2Back.on('pointerover', () => { this.level2Back.setScale(1.1); this.buttonHover.play();});
                this.level2Back.on('pointerout', () => { this.level2Back.setScale(1); });

                this.level3Back.on('pointerover', () => { this.level3Back.setScale(1.1); this.buttonHover.play();});
                this.level3Back.on('pointerout', () => { this.level3Back.setScale(1); });


            });


            // Pointer out and pointer over for the level button itself on main screen
            levelBtn.on('pointerover', () => { levelBtn.setScale(0.8); this.buttonHover.play();});
            levelBtn.on('pointerout', () => { levelBtn.setScale(0.7); });
        }

        // Dlc message
        if(this.registry.get('secrets').showDLC) {
            this.registry.get('secrets').showDLC = false;
            this.dlcMessage = this.add.image(0, 0, 'dlcMessage').setOrigin(0).setDepth(11);
            this.backButtonM = this.add.image(180, 260, 'back').setOrigin(0).setInteractive().on('pointerdown', () => {
                    this.scene.start('MenuScene');
                }).setDepth(11);

                // Adding pointer over and pointer out animations for the back button
                this.backButtonM.on('pointerover', () => { this.backButtonM.setScale(1.1); this.diaboxSound.play();});
                this.backButtonM.on('pointerout', () => { this.backButtonM.setScale(1); });
        }

        // Displays a message popup after the player plays through the game once
        if(this.registry.get('secrets').showMessage) {
            this.registry.get('secrets').showMessage = false;
            this.messagePop = this.add.image(0, 0, 'message').setOrigin(0).setDepth(11);
            this.backButtonM = this.add.image(380, 260, 'back').setOrigin(0).setInteractive().on('pointerdown', () => {
                    this.scene.start('MenuScene');
                }).setDepth(11);

                // Adding pointer over and pointer out animations for the back button
                this.backButtonM.on('pointerover', () => { this.backButtonM.setScale(1.1); this.buttonHover.play();});
                this.backButtonM.on('pointerout', () => { this.backButtonM.setScale(1); });
        }

        // Start button animations and scaling and positions
        this.startBtn = startBtn;
        this.startBtn.setScale(0.7);
        startBtn.on('pointerover', () => { startBtn.setScale(0.8); this.buttonHover.play();});
        startBtn.on('pointerout', () => { startBtn.setScale(0.7); });

        // next button — skips straight to level 1 ____FOR DEBUGGING ONLY______
        this.nextBtn = this.add.text(1748, 995, 'Next', { fontSize: '32px', fill: '#181515' }).setInteractive().on('pointerdown', () => {
                this.scene.start('Level4');
                });

    }

    /**
     * goToNxtScene
     * Description: Fades the screen to black then starts the beginning cutscene after 2 seconds
     *              Used by the start button so there's a smooth transition out of the menu.
     * Inputs: None
     * Outputs: None. Only transitions to BeginningCutScene
     * Called By: this.create
     * Calls: this.add.rectangle(), this.tweens.add(), this.time.delayedCall(), this.scene.start
     * 
     */
    goToNxtScene() {
        // Fade to black before starting the next scene
        const fadeRect = this.add.rectangle(960, 540, 1920, 1080, 0x000000).setAlpha(0);
        this.tweens.add({
            targets: fadeRect,
            alpha: 1,
            duration: 2000,
            onComplete: () => { fadeRect.destroy(); }
        });
        // After fade start next scene
        this.time.delayedCall(1500, () => {
            this.scene.start('BeginningCutScene');
        });
    }
}
