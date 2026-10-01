/**
 * Author: Mei Huang
 * Program Name: Player
 * Description: Defines the Player class. Manages all three player form physics bodies, movement,
 *              animations, morphing transitions, and item carrying. The sprite key is passed in
 *              so it refers to the correct spritesheet. Scale values for each form are passed in
 *              so each level can tune the player size independently. Supports cat, dog, and human
 *              forms each with unique gravity, jump velocity, hitbox dimensions, and animation sets.
 * Inputs: None.
 * Outputs: None.
 * Called By: Level4.js, Level5.js, Level6.js, Crane.js
 * Calls: Phaser.Physics.Arcade.Sprite, scene.physics.add.existing, scene.add.existing, scene.anims.remove, scene.anims.create
 */

class Player extends Phaser.Physics.Arcade.Sprite {

    /**
     * constructor
     * Description: Builds the player sprite and physics body, then creates all animations for cat, dog, and human forms including idle, run, jump, tug, vent, 
     *              and morph transition animations. Removes existing animations first so they rebuild with the correct spritesheet for the current playthrough. 
     *              Sets up the MORPH_GRAVITY lookup table with physics stats per form and the MORPH_ANIMS lookup table for transition animation keys.
     * Inputs: scene (Phaser.Scene) - the level scene to add the player to
     *         x (number) - starting world x position
     *         y (number) - starting world y position
     *         sprite (string) - the spritesheet key to use for the cat form
     *         cat (number) - scale value for cat form
     *         dog (number) - scale value for dog form
     *         human (number) - scale value for human form
     * Outputs: None
     * Called By: Level4.create(), Level5.create(), Level6.create(), Crane.create()
     * Calls: super(), scene.physics.add.existing(), scene.add.existing(), this.setCollideWorldBounds(),
     *        this.setGravityY(), this.setSize(), this.setOffset(), this.setScale(),
     *        this.createCatRun(), this.createDogRun(), this.createHumanRun(), this.createMorphs()
     */

    /**
     * constructor
     * Description: Builds the player sprite and physics body, then creates all animations for cat, dog, and human forms including idle, run, jump, tug, vent, 
     *              and morph transition animations. Removes existing animations first so they rebuild with the correct spritesheet for the current playthrough. 
     *              Sets up the MORPH_GRAVITY lookup table with physics stats per form and the MORPH_ANIMS lookup table for transition animation keys.
     * Inputs: 
     *      @param scene: the level scene to add the player to
     *      @param x: starting world x position
     *      @param y: starting world y position
     *      @param sprite: the spritesheet key to use for the cat form
     *      @param cat: scale value for cat form
     *      @param dog: scale value for dog form
     *      @param human: scale value for human form
     * Outputs: None
     * Called By: Level4.create(), Level5.create(), Level6.create(), Crane.create()
     * Calls: super(), scene.physics.add.existing(), scene.add.existing(), this.setCollideWorldBounds(), this.setGravityY(), this.setSize(), this.setOffset(), 
     *        this.setScale(), this.createCatRun(), this.createDogRun(), this.createHumanRun(), this.createMorphs()
     */
    constructor(scene, x, y, sprite, cat, dog, human) {
        // Setting up initial stats
        super(scene, x, y, sprite);
        scene.physics.add.existing(this);
        scene.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setGravityY(1900);
        
        // Setting up flags and variables
        this.isMeowing = false;
        this.facing = 'right';
        this.currentForm = 'cat';
        this.isTugging = false;
        this.isMorphing = false;
        this.carriedItem = null;
        this.canMorph = true;
        this.vented = false;
        this.isBlocked = false;
        this.scene = scene;

        // Create all animation frames
        this.createCatRun(scene);
        this.createDogRun(scene);
        this.createHumanRun(scene);

        this.createMorphs(scene);

        // Look up table for the gravity of each form
        this.MORPH_GRAVITY = {
            cat: {gravity: 1900, jumpVelocity: -1705, width: 200, height: 104, offsetX: 20, offsetY: 100, scale: cat, ventWidth: 200, ventHeight: 50, ventScale: 0.9, ventOffsetY: 150 },
            dog: {gravity: 600, jumpVelocity: -700, width: 274, height: 128, offsetX: 20, offsetY: 70, scale: dog },
            human: {gravity: 700, jumpVelocity: -490, width: 180, height: 488, offsetX: 65, offsetY: 0, scale: human}
        };

        // Setting the proper gravity and size for the first form
        const beginningStats = this.MORPH_GRAVITY['cat'];
        this.setSize(beginningStats.width, beginningStats.height, true).setOffset(beginningStats.offsetX, beginningStats.offsetY).setScale(beginningStats.scale);
        this.setGravityY(this.MORPH_GRAVITY['cat'].gravity);

        // Look up table for morphing animations
        this.MORPH_ANIMS = {
            cat: {dog: 'catToDog', human: 'catToHuman'},
            dog: {cat: 'dogToCat', human: 'dogToHuman'},
            human: {cat: 'humanToCat', dog: 'humanToDog'}
        };

    }

    /**
     * createMorphs
     * Description: Creates all twelve morph transition animations covering every direction and form combinations listed below. Each with a left and right facing
     *              variant. Removes any existing versions of these animations first to prevent conflicts.
     * Inputs:
     *      @param scene: the level scene to register animations on
     * Outputs: None. Registers animations on the scene as a side effect
     * Called By: constructor()
     * Calls: scene.anims.exists(), scene.anims.remove(), scene.anims.create(), scene.anims.generateFrameNumbers()
     */
    createMorphs(scene) {
        ['catToDogRight', 'catToDogLeft', 'dogToCatRight', 'dogToCatLeft', 'catToHumanRight', 'catToHumanLeft', 'humanToCatRight', 
            'humanToCatLeft', 'dogToHumanRight', 'dogToHumanLeft', 'humanToDogRight', 'humanToDogLeft'
        ].forEach(key => {
            if(scene.anims.exists(key)) scene.anims.remove(key);
        });

        this.frames = 4;

        // Cat to dog animations left and right
        scene.anims.create({
            key: 'catToDogRight',
            frames: scene.anims.generateFrameNumbers('catToDog', { start:3 , end: 5}),
            frameRate: this.frames,
            repeat: 0
        });
        scene.anims.create({
            key: 'catToDogLeft',
            frames: scene.anims.generateFrameNumbers('catToDog', { start:2 , end: 0}),
            frameRate: this.frames,
            repeat: 0
        });

        // Dog to cat animations left
        scene.anims.create({
            key: 'dogToCatRight',
            frames: scene.anims.generateFrameNumbers('catToDog', { start:5 , end: 3}),
            frameRate: this.frames,
            repeat: 0
        });
        scene.anims.create({
            key: 'dogToCatLeft',
            frames: scene.anims.generateFrameNumbers('catToDog', { start:0 , end: 2}),
            frameRate: this.frames,
            repeat: 0
        });

        // Cat to human animations left and right
        scene.anims.create({
            key: 'catToHumanRight',
            frames: scene.anims.generateFrameNumbers('catToHuman', { start:4 , end: 7}),
            frameRate: this.frames,
            repeat: 0
        });
        scene.anims.create({
            key: 'catToHumanLeft',
            frames: scene.anims.generateFrameNumbers('catToHuman', { start:3 , end: 0}),
            frameRate: this.frames,
            repeat: 0
        });

        // Human to cat animations left and right
        scene.anims.create({
            key: 'humanToCatRight',
            frames: scene.anims.generateFrameNumbers('catToHuman', { start:7 , end: 4}),
            frameRate: this.frames,
            repeat: 0
        });
        scene.anims.create({
            key: 'humanToCatLeft',
            frames: scene.anims.generateFrameNumbers('catToHuman', { start:0 , end: 3}),
            frameRate: this.frames,
            repeat: 0
        });

        // Dog to human animations left and right
        scene.anims.create({
            key: 'dogToHumanRight',
            frames: scene.anims.generateFrameNumbers('dogToHuman', { start:4 , end: 7}),
            frameRate: this.frames,
            repeat: 0
        });
        scene.anims.create({
            key: 'dogToHumanLeft',
            frames: scene.anims.generateFrameNumbers('dogToHuman', { start:3 , end: 0}),
            frameRate: this.frames,
            repeat: 0
        });

        // Human to dog animations left and right
        scene.anims.create({
            key: 'humanToDogRight',
            frames: scene.anims.generateFrameNumbers('dogToHuman', { start:7 , end: 4}),
            frameRate: this.frames,
            repeat: 0
        });
        scene.anims.create({
            key: 'humanToDogLeft',
            frames: scene.anims.generateFrameNumbers('dogToHuman', { start:0 , end: 3}),
            frameRate: this.frames,
            repeat: 0
        });
    }

    /**
     * createCatRun
     * Description: Creates all cat form animations listed below. Removes any existing versions first to prevent conflicts across scenes.
     * Inputs:
     *      @param scene: the level scene to register the animations on
     * Outputs: None. Registers cat animations on the scene as a side effect
     * Called By: constructor()
     * Calls: scene.anims.exists(), scene.anims.remove(), scene.anims.create(), scene.anims.generateFrameNumbers()
     */
    createCatRun(scene) {
        ['catIdleLeft', 'catIdleRight', 'catRunningLeft', 'catRunningRight', 'catJumpingRight', 'catJumpingLeft', 'catTugLeft', 'catTugRight'].forEach(key => {
            if(scene.anims.exists(key)) scene.anims.remove(key);
        });
        // Idle left animation: frames 11-14
        scene.anims.create({
            key: 'catIdleLeft',
            frames: [
                { key: 'catAnim', frame: 18, duration: 200 },
                { key: 'catAnim', frame: 19, duration: 300 },
                { key: 'catAnim', frame: 20, duration: 300 },
                { key: 'catAnim', frame: 21, duration: 300 }
            ],
            frameRate: 4,
            repeat: -1
        });

        // Idle right animation: frames 15-18
        scene.anims.create({
            key: 'catIdleRight',
            frames:[
                { key: 'catAnim', frame: 22, duration: 200 },
                { key: 'catAnim', frame: 23, duration: 200 },
                { key: 'catAnim', frame: 24, duration: 400 },
                { key: 'catAnim', frame: 25, duration: 100 }
            ],
            frameRate: 8,
            repeat: -1
        });

        // Running Left animation: frames 10 down to 0
        scene.anims.create({
            key: 'catRunningLeft',
            frames: scene.anims.generateFrameNumbers('catAnim', { start: 17, end: 0}),
            frameRate: 18,
            repeat: -1
        });

        // Running Right animation: frames 19-29
        scene.anims.create({
            key: 'catRunningRight',
            frames: scene.anims.generateFrameNumbers('catAnim', { start: 26, end: 43}),
            frameRate: 18,
            repeat: -1
        });

        // Jumping right frame 31
        scene.anims.create({
            key: 'catJumpingRight',
            frames: scene.anims.generateFrameNumbers('catAnim', { start: 44, end: 44}),
            frameRate: 1,
            repeat: 0
        });

        // Jumping left frame 31
        scene.anims.create({
            key: 'catJumpingLeft',
            frames: scene.anims.generateFrameNumbers('catAnim', { start: 45, end: 45}),
            frameRate: 1,
            repeat: 0
        });

        // Tugging animation
        scene.anims.create({
            key: 'catTugLeft',
            frames: scene.anims.generateFrameNumbers('catAnim', { start: 46, end: 46}),
            frameRate: 1,
            repeat: 0
        })
        scene.anims.create({
            key: 'catTugRight',
            frames: scene.anims.generateFrameNumbers('catAnim', { start: 47, end: 47}),
            frameRate: 1,
            repeat: 0
        })

        // Going into vents
        scene.anims.create({
            key: 'catVentRight',
            frames: scene.anims.generateFrameNumbers('catAnim', { start: 48, end: 48}),
            frameRate: 1,
            repeat: 0
        });
        scene.anims.create({
            key: 'catVentLeft',
            frames: scene.anims.generateFrameNumbers('catAnim', { start: 49, end: 49}),
            frameRate: 1,
            repeat: 0
        });

    }

    /**
     * createDogRun
     * Description: Creates all dog form animations listed below. Removes any existing versions first to prevent conflicts across scenes.
     * Inputs:
     *      @param scene: the level scene to register the animations on
     * Outputs: None. Registers dog animations on the scene as a side effect
     * Called By: constructor()
     * Calls: scene.anims.exists(), scene.anims.remove(), scene.anims.create(), scene.anims.generateFrameNumbers()
     */
    createDogRun(scene) {
        ['dogIdleLeft', 'dogIdleRight', 'dogRunningLeft', 'dogRunningRight', 'dogJumpingRight', 'dogJumpingLeft', 'dogTugLeft', 'dogTugRight'].forEach(key => {
            if(scene.anims.exists(key)) scene.anims.remove(key);
        });
        // Idle left animation: frames 20- 24
        scene.anims.create({
            key: 'dogIdleLeft',
            frames: [
                { key: 'dogAnim', frame: 19, duration: 200 },
                { key: 'dogAnim', frame: 20, duration: 300 },
                { key: 'dogAnim', frame: 21, duration: 300 },
                { key: 'dogAnim', frame: 22, duration: 300 }
            ],
            frameRate: 8,
            repeat: -1
        });

        // Idle right animation: frames 15-18
        scene.anims.create({
            key: 'dogIdleRight',
            frames:[
                { key: 'dogAnim', frame: 23, duration: 200 },
                { key: 'dogAnim', frame: 24, duration: 200 },
                { key: 'dogAnim', frame: 25, duration: 400 },
                { key: 'dogAnim', frame: 26, duration: 100 }
            ],
            frameRate: 8,
            repeat: -1
        });

        // Running Left animation: frames 0 to 18
        scene.anims.create({
            key: 'dogRunningLeft',
            frames: scene.anims.generateFrameNumbers('dogAnim', { start: 18, end: 0}),
            frameRate: 13,
            repeat: -1
        });

        // Running Right animation: frames 19-29
        scene.anims.create({
            key: 'dogRunningRight',
            frames: scene.anims.generateFrameNumbers('dogAnim', { start: 27, end: 45}),
            frameRate: 13,
            repeat: -1
        });

        // Jumping right frame 31
        scene.anims.create({
            key: 'dogJumpingRight',
            frames: scene.anims.generateFrameNumbers('dogAnim', { start: 46, end: 46}),
            frameRate: 1,
            repeat: 0
        });

        // Jumping left frame 31
        scene.anims.create({
            key: 'dogJumpingLeft',
            frames: scene.anims.generateFrameNumbers('dogAnim', { start: 47, end: 47}),
            frameRate: 1,
            repeat: 0
        });

        // Tugging animation
        scene.anims.create({
            key: 'dogTugLeft',
            frames: scene.anims.generateFrameNumbers('dogAnim', { start: 48, end: 48}),
            frameRate: 1,
            repeat: 0
        })
        scene.anims.create({
            key: 'dogTugRight',
            frames: scene.anims.generateFrameNumbers('dogAnim', { start: 49, end: 49}),
            frameRate: 1,
            repeat: 0
        })
    }

    /**
     * createHumanRun
     * Description: Creates all human form animations listed below. Removes any existing versions first to prevent conflicts across scenes.
     * Inputs:
     *      @param scene: the level scene to register the animations on
     * Outputs: None. Registers human animations on the scene as a side effect
     * Called By: constructor()
     * Calls: scene.anims.exists(), scene.anims.remove(), scene.anims.create(), scene.anims.generateFrameNumbers()
     */
    createHumanRun(scene) {
        // Remove old animations to make room for new animation for no backpack first playthrough, backpack on remaining playthrough.
        ['humanIdleLeft', 'humanIdleRight', 'humanRunningLeft', 'humanRunningRight', 'humanJumpingRight', 'humanJumpingLeft'].forEach(key => {
            if(scene.anims.exists(key)) scene.anims.remove(key);
        });

        // Idle left animation: frames 20- 24
        scene.anims.create({
            key: 'humanIdleLeft',
            frames: [
                { key: 'humanAnim', frame: 16, duration: 200 },
                { key: 'humanAnim', frame: 17, duration: 300 },
                { key: 'humanAnim', frame: 18, duration: 300 },
                { key: 'humanAnim', frame: 19, duration: 300 }
            ],
            frameRate: 8,
            repeat: -1
        });

        // Idle right animation: frames 15-18
        scene.anims.create({
            key: 'humanIdleRight',
            frames:[
                { key: 'humanAnim', frame: 20, duration: 200 },
                { key: 'humanAnim', frame: 21, duration: 200 },
                { key: 'humanAnim', frame: 22, duration: 400 },
                { key: 'humanAnim', frame: 23, duration: 400 }
            ],
            frameRate: 8,
            repeat: -1
        });

        // Running Left animation: frames 0 to 18
        scene.anims.create({
            key: 'humanRunningLeft',
            frames: scene.anims.generateFrameNumbers('humanAnim', { start: 15, end: 0}),
            frameRate: 5,
            repeat: -1
        });

        // Running Right animation: frames 19-29 correct
        scene.anims.create({
            key: 'humanRunningRight',
            frames: scene.anims.generateFrameNumbers('humanAnim', { start: 24, end: 39}),
            frameRate: 5,
            repeat: -1
        });

        // Jumping right frame 31
        scene.anims.create({
            key: 'humanJumpingRight',
            frames: scene.anims.generateFrameNumbers('humanAnim', { start: 40, end: 40}),
            frameRate: 1,
            repeat: 0
        });

        // Jumping left frame 31
        scene.anims.create({
            key: 'humanJumpingLeft',
            frames: scene.anims.generateFrameNumbers('humanAnim', { start: 41, end: 41}),
            frameRate: 1,
            repeat: 0
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
    /**
     * update
     * Description: Runs every frame. Handles player movement, jumping, idle and running animations based on current form and facing direction, meow/bark
     *              sound playback with a cooldown to prevent spam, and morph key input(1, 2, 3) when the player is on the floor and morphng is allowed.
     *              Freezes all movement while a morph animation is playing. Returns early if the player is blocked. 
     * Inputs:  
     *  @param cursors: keyboard input
     *  @param isKnockedback: true if player is currently knockedback or hurt state
     *  @param thisScene: the current scene, used for delayedCall and sound
     *  @param meow: true if the meow/bark was just pressed
     *  @param morphs: keyboard keys for form switching (1, 2, 3)
     *  @param canMorph: whether morphing is allowed by the level
     * Outputs: None. Updates velocity and animations as a side effect
     * Called By: Phaser engine onver per frame via the level's update
     * Calls: this.handleMorphing(), this.setVelocityX(), this.setVelocityY(), this.setSize(), this.setOffset(), this.setScale(), this.refreshBody(),
     *        this.anims.play(), this.scene.sound.play(), thisScene.time.delayedCall(), Phaser.Input.Keyboard.JustDown(), Phaser.Math.Between()
     */
    update(cursors, isKnockedback, thisScene, meow, morphs, canMorph) {

        // Return early if movement blocked
        if(this.isBlocked) return;
        const speed = 900;

        // Randomly pick between two meow/bark sounds so it's not repetative
        if (meow) {
            let num = Phaser.Math.Between(0, 100);
            if(this.getForm() === 'cat') {
                // If player isn't already meowing, prevents player from spamming and over lapping audio
                if(!this.isMeowing) {
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
            }else if(this.getForm() === 'dog'){
                // If player isn't already barking, prevents player from spamming and over lapping audio
                if(!this.isMeowing) {
                    if(num % 2 == 0) {
                        this.scene.sound.play('bark', { volume: 0.4 });
                    } else {
                        this.scene.sound.play('bark2', { volume: 0.3 });
                    }
                    this.isMeowing = true;
                    
                    // Cool down to prevent spamming
                    thisScene.time.delayedCall(3000, () => {
                        this.isMeowing = false;
                    });
                }
            }
            
        }
        

        // Adding morphing logic and animations
        if(this.body.onFloor() && canMorph) {
            if (Phaser.Input.Keyboard.JustDown(morphs.one)) this.handleMorphing('cat');
            if (Phaser.Input.Keyboard.JustDown(morphs.two)) this.handleMorphing('dog');
            if (Phaser.Input.Keyboard.JustDown(morphs.three)) this.handleMorphing('human');
        }
        

        // Stop movement, freeze and wait
        if (this.isMorphing) {
            this.setVelocityX(0);
            return;
        }


        // Setting up player knockback idle animation depending on direction player was last facing
        if(isKnockedback) {
            if (this.facing === 'left') {
                this.anims.play(`${this.currentForm}IdleLeft`, true);
            } else {
                this.anims.play(`${this.currentForm}IdleRight`, true);
            }
            return;
        }
        
        // Player movement left, right, jump
        if(cursors.left.isDown) {
            this.facing = 'left';
            this.setVelocityX(-speed);
            this.anims.play(`${this.currentForm}RunningLeft`, true); 
        } else if (cursors.right.isDown) {
            this.facing = 'right';
            this.setVelocityX(speed);
            this.anims.play(`${this.currentForm}RunningRight`, true);
            
        } else {
            // When player is not moving, depending on which way they were last facing, play idle animation
            this.setVelocityX(0);
            if (this.facing === 'left') {
                this.anims.play(`${this.currentForm}IdleLeft`, true);
            } else {
                this.anims.play(`${this.currentForm}IdleRight`, true);
            }
        }

        // Only allow jump if player is touching/on a surface
        if(cursors.up.isDown && this.body.onFloor()) { 
            this.canMorph = true;
            if(this.facing === 'right'){
                this.anims.play(`${this.currentForm}JumpingRight`);
            }else {
                this.anims.play(`${this.currentForm}JumpingLeft`);
            }

            const stats = this.MORPH_GRAVITY[this.currentForm];
            this.setVelocityY(stats.jumpVelocity);
        }
    }

    /**
     * handleMorphing
     * Description: Triggers a morph transition from the current form to that target form. Plays the correct left or right facing transition animation, drops
     *              any carried item before morphing, then on animation complete updates the physics body size, offset, scale, gravity, and current form to 
     *              match the new form. Guards against morphing while already morphing, while not on the floor, while tugging, or if morphing is disabled.
     *              Emits an itemDropped event if the player was carrying something so the level can hanel respawning the item.
     * Inputs:
     *      @param morphTarget: the target form
     * Outputs: None. Changes the form of the player and sets body size, and gravity accordingly
     * Called By: update() on number key press, Level4.jumpScarePart() to force dog form
     * Calls: this.setBlocked(), this.dropItem(), this.emit(), this.setGravityY(), this.setVelocityX(), this.setVelocityY(), this.play(), this.setSize(),
     *        this.setOffset(), this.setScale(), this.body.reset(), this.once()
     */
    handleMorphing(morphTarget) {
        // Return early if currently morphing or cannot morph or if currently in target form
        if (this.isMorphing) return;
        if (!this.canMorph) return;
        if (morphTarget === this.currentForm) return;
        if (this.isTugging) return;
        this.setBlocked(true);

        // Emits a dropped item event to tell level player dropped an item
        if (this.carriedItem) {
            const dropped = this.dropItem();
            // Emit event so level can react
            this.emit('itemDropped', dropped);
        }

        this.canMorph = false;
        this.isMorphing = true;
        this.setGravityY(0);
        this.setVelocityX(0);
        this.setVelocityY(0);

        // Picks the correct animation based off the target form abd current form and current facing direction
        const animKey = this.MORPH_ANIMS[this.currentForm][morphTarget];
        if(this.facing === 'right') {
            this.play(animKey + 'Right');
        }else {
            this.play(animKey + 'Left');
        }

        // Once the animation completes resume resets player size and gravity
        this.once('animationcomplete', () => {
            this.canMorph = true;
            if (this.carriedItem) {
                const dropped = this.dropItem();
                this.emit('itemDropped', dropped);
            }
            const stats = this.MORPH_GRAVITY[morphTarget];
            this.currentForm = morphTarget;
            this.setSize(stats.width, stats.height, true)
                .setOffset(stats.offsetX, stats.offsetY)
                .setScale(stats.scale);
            this.body.reset(this.x, this.y);
            this.isMorphing = false;
            this.setGravityY(stats.gravity);
            if(this.facing === 'right') {
                this.play(`${morphTarget}IdleRight`); 
            } else {
                this.play(`${morphTarget}IdleLeft`); 
            }
            this.setBlocked(false);
        });

    }

    /**
     * playTug
     * Description: Plays the tug animation for the current form and facing direction when the player tries to pick up an item that is too heavy.
     *              Does nothing if the current form is human since there is no human tug animation
     * Inputs: None
     * Outputs: None. Plays tug animation as a side effect
     * Called By: Level4.update(), Level5.update(), Level6.update() on failed pickup attempt
     * Calls: this.anims.play()
     */
    playTug() {
        if(this.currentForm === 'human') return;
        this.setBlocked(true);
        if (this.facing === 'left') {
            this.anims.play(`${this.currentForm}TugRight`);
        } else {
            this.anims.play(`${this.currentForm}TugLeft`);
        }
        this.scene.time.delayedCall(500, () => {
            this.setBlocked(false);
        })
    }

    /**
     * playWalk
     * Description: Plays the walking animation for the current form and facing direction. Used by level scenes to start a walk animation
     *              during cutscenes where the level is driving the player's position rather than input.
     * Inputs: None
     * Outputs: None. Plays walking animation as a side effect
     * Called By: Level4.restartAtVent(), Level5.kenjiMad()
     * Calls: this.anims.play()
     */
    playWalk() {
        if(this.facing === 'left') {
            this.anims.play(`${this.currentForm}RunningLeft`);
        }else {
            this.anims.play(`${this.currentForm}RunningRight`);
        }
    }

    /**
     * playIdle
     * Description: Plays the idle animation for the current form and facing direction. Used by level scenes to force the player into an idle state during cutscenes
     *              or when blocking player input.
     * Inputs: None
     * Outputs: None. Plays idle animation as a side effect
     * Called By: Level4, Level5, Level6
     * Calls: this.anims.play()
     */
    playIdle() {
        if(this.facing === 'left') {
            this.anims.play(`${this.currentForm}IdleLeft`);
        }else {
            this.anims.play(`${this.currentForm}IdleRight`);
        }
    }

    /**
     * getForm
     * Description: Returns the player's current form as a string
     * Inputs: None
     * Outputs:
     *      @return this.currentForm: the current player form
     * Called By: Level4, Level5, and Level6
     * Calls: None
     */
    getForm() {
        return this.currentForm;
    }   
    
    /**
     * pickUp
     * Description: Stores the given item the player's currently carrying.
     * Inputs:
     *      @param item: the item to carry
     * Outputs: None. Sets carriedItem as a side effect
     * Called By: Level4, Level5, Level6
     * Calls: None
     */
    pickUp(item) {
        this.carriedItem = item;
    }

    /**
     * dropItem
     * Description: Clears the player's carried item and returns it so the level can handle the reposition and re-enable of the sprite/item dropped
     * Inputs: None
     * Outputs:
     *      @return dropped: item that was dropped
     * Called By: Level4, Level5, Level6
     * Calls: None
     */
    dropItem() {
        const dropped = this.carriedItem;
        this.carriedItem = null;
        return dropped;
    }

    /**
     * setBlocked
     * Description: Sets the isBlocked flag to prevent or restore player input and movement. When true, the update loop returns immediately 
     *              without processing any input. 
     * Inputs:
     *      @param blocked: boolean, true to block player, false to restore movement
     * Outputs: None. Sets isBlocked as a side effect
     * Called By: Level4, Level5, Level6
     * Calls: None
     */
    setBlocked(blocked) {
        this.isBlocked = blocked;
    }


}