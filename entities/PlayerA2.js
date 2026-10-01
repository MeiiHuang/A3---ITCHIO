/**
 * Author: Mei Huang
 * Program Name: Player
 * Description: Defines the Player class. Manages Sumi's physics body, movement, animations,
 *              and meowing sounds. The sprite key is passed in so it refers to the correct version
 *              (backpack or no backpack) depending on the play through.
 * Inputs: None.
 * Outputs: None.
 * Called By: Level1.js, Level2.js, Level3.js
 * Calls: Phaser.Physics.Arcade.Sprite, scene.physics.add.existing, scene.add.existing, scene.anims.remove,
 *        scene.anims.create
 */

class PlayerA2 extends Phaser.Physics.Arcade.Sprite {

    /**
     * constructor
     * Description: Builds the player sprite and physics body, then creats all four animations (idleLeft,
     *              idleRight, runningRight, runningLeft). Removes existing animations frist so they rebuild
     *              with the correct player animation for the playthrough.
     * Inputs: scene (Phaser.Scene): the level scene to add the player to
     *         x : starting world x postion
     *         y : starting world y position
     * Outputs: None. 
     * Called By: Level1.create(), Level2.create(), Level3.create()
     * Calls: super(), scene.physics.add.existing(), scene.add.exisiting(), setCollideWorldBounds(), setGravity(),
     *        scene.anims.remove(), scene.anims.create(), scene.anims.generateFrameNumbers()
     */
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        scene.physics.add.existing(this);
        scene.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setGravityY(450);
        
        // Setting up flags
        this.isMeowing = false;
        this.facing = 'right';

        // Remove old animations to make room for new animation for no backpack first playthrough, backpack on remaining playthrough.
        ['idleLeft', 'idleRight', 'runningLeft', 'runningRight'].forEach(key => {
            if(scene.anims.exists(key)) scene.anims.remove(key);
        });

        // Idle left animation: frames 11-14
        scene.anims.create({
            key: 'idleLeft',
            frames: [
                { key: sprite, frame: 11, duration: 200 },
                { key: sprite, frame: 12, duration: 300 },
                { key: sprite, frame: 13, duration: 300 },
                { key: sprite, frame: 14, duration: 300 }
            ],
            frameRate: 4,
            repeat: -1
        });

        // Idle right animation: frames 15-18
        scene.anims.create({
            key: 'idleRight',
            frames:[
                { key: sprite, frame: 15, duration: 200 },
                { key: sprite, frame: 16, duration: 200 },
                { key: sprite, frame: 17, duration: 400 },
                { key: sprite, frame: 18, duration: 100 }
            ],
            frameRate: 8,
            repeat: -1
        });

        // Running Left animation: frames 10 down to 0
        scene.anims.create({
            key: 'runningLeft',
            frames: scene.anims.generateFrameNumbers(sprite, { start: 10, end: 0}),
            frameRate: 10,
            repeat: -1
        });

        // Running Right animation: frames 19-29
        scene.anims.create({
            key: 'runningRight',
            frames: scene.anims.generateFrameNumbers(sprite, { start: 19, end: 29}),
            frameRate: 10,
            repeat: -1
        });
    }

    /**
     * update
     * Description: Sets up player movement, up, left, and right. Plays meow sound and adds a cool down so the sound
     *              doesn't get spammed and overlaps. Alternatesly between two different types of meows depending on
     *              randomly generated number between 0 - 100. Plays the correct running, idle animations depending
     *              on direction player is facing.
     * Inputs:
     *      @param cursors : keyboard input
     *      @param isKnockedback : true or false for if player is knocked back
     *      @param thisScene : the current scene we're dealing with
     *      @param meow : true or false for if the player is meowing
     * Outputs: None
     * Called By: Phaser engine
     * Calls: Phaser.Math.Between(), this.scene.sound.play(), cursors.left/right.isDown(), cursors.up.isDown,
     *        this.setVelovityX/Y(), this.anims.play()
     */
    update(cursors, isKnockedback, thisScene, meow) {

        const speed = 320;

        // Randomly pick between two meow sounds so it's not repetative
        if (meow) {
            
            // If player isn't already meowing, prevents player from spamming and over lapping audio
            if(!this.isMeowing) {
                let num = Phaser.Math.Between(0, 100);
                if(num % 2 == 0) {
                    this.scene.sound.play('meow', { volume: 0.4 });
                } else {
                    this.scene.sound.play('meow2', { volume: 0.3 });
                }
                this.isMeowing = true;
                
                // Cool down to prevent spamming
                thisScene.time.delayedCall(3000, () => {
                    this.isMeowing = false;
                });
            }

            
        }


        // Setting up player knockback idle animation depending on direction player was last facing
        if(isKnockedback) {
            if (this.facing === 'left') {
                this.anims.play('idleLeft', true);
            } else {
                this.anims.play('idleRight', true);
            }
            return;
        }

        // Setting up player movement with correct animation
        if(cursors.left.isDown) {
            this.facing = 'left';
            this.setVelocityX(-speed);
            this.anims.play('runningLeft', true);
        } else if (cursors.right.isDown) {
            this.facing = 'right';
            this.setVelocityX(speed);
            this.anims.play('runningRight', true);
        } else {
            // When player is not moving, depending on which way they were last facing, play idle animation
            this.setVelocityX(0);
            if (this.facing === 'left') {
                this.anims.play('idleLeft', true);
            } else {
                this.anims.play('idleRight', true);
            }
        }

        // Only allow jump if player is touching/on a surface
        if(cursors.up.isDown && this.body.onFloor()) {
            this.setVelocityY(-300);
        }
    }
}