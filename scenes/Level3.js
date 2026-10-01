/**
 * Author: Mei Huang
 * Program Name: Level3
 * Description: Chapter 3: Concrete and Shadows. Moving platforms, security drones that spot the player, and boxes to hide behind. Secret: Push the jug
 *              off the platform. Sound of dripping water shows where the jug is and drips into the jug. Jug breaks drone below and it reveal a hidden
 *              path in the wall. Interacting with the moonflakes at the end trigger the game's ending. Recipe commits to registry and if call piece are
 *              collected, will trigger the good ending. Otherwise it will trigger the bad ending. 
 * Inputs: None. Reads from registry
 * Outputs: None. Transitions to GoodEndingScene, BadEndingScene, or GameOverScene.
 * Called By: Level2, MenuScene, and GameOverScene.
 * Calls: GoodCutScene, EndingCutScene, MenuScene, GameOverScene, Player
 */

class Level3 extends Phaser.Scene {

    /**
     * constructor
     * Description: Registers this scene with Phaser under the key 'Level3'
     * Inputs: None
     * Outputs: None
     * Called By: Phaser game when config is processed
     * Calls: super()
     */
    constructor() {
        super({key: 'Level3'});
    }

    /**
     * preload
     * Description: Creates all audio objects for this level before the scene starts.
     * Inputs: None
     * Outputs: None. Creates references to each sound
     * Calls: this.sound.add()
     */
    preload() {
       
        // Adding all audio needed for level 3
        this.music   = this.sound.add('level3Song', {volume: 0, loop: true});
        this.hiss    = this.sound.add('hiss',  {volume: 1.3, loop: false});
        this.catFall = this.sound.add('fall',  {volume: 1,   loop: false});
        this.droneBreak = this.sound.add('droneBreak', {volume: 0.25, loop: false});
        this.waterDripping = this.sound.add('waterDrip', { volume: 0.9, loop: true });
        this.pickup = this.sound.add('pickup', { volume: 0.6, loop: false});
    }

    /**
     * create
     * Description: Builds the full level. Instantiating variables, home icons, world bounds, fade in, title,
     *              music, background, player, camera, input, recipe piece, water animation and drip zone, platforms,
     *              moonglakes, holo npc, dialogues, colliders, and the HUD. Recipe icons only show after first playthrough.
     * Inputs: None
     * Outputs: None. Builds the entire Level 3
     * Called By: Phaser engine 
     * Calls: this.loadPlatforms(), this.checkrecipes(), Player constructor, this.physics.add.collider/overlap(),
     *        this.add.text/image/rectangle/sprite(), this.tweens.add(), this.time.delayedCall(), this.anims.create()
     */
    create() {
        // Variables
        this.lives    = 3;
        this.isHurt   = false;
        this.isFalling = false;
        this.worldWidth  = 13440;
        this.worldHeight = 1080;
        this.currPlat = null;
        this.onPlatform = null;
        this.preFrame = null;
        this.currBox = null;
        this.hiding = false;
        this.currDrone = null;
        this.spotted = false;
        this.broke = false;
        this.recipeIcons = null;
        this.holoTalking = false;
        this.moonflakeTriggered = false;

        // Home Icon
        if(!this.registry.get('secrets').firstPlay) {
            this.add.image(50, 50, 'homeIcon').setOrigin(0).setScrollFactor(0).setDepth(200).setInteractive().on('pointerdown', () => {
                const fadeOut = this.add.rectangle(0, 0, 1920, 1080, 0x000000).setAlpha(0).setOrigin(0).setDepth(999).setScrollFactor(0);
                this.tweens.add({ targets: this.music, volume: 0, duration: 500 });
                this.tweens.add({
                    targets: fadeOut,
                    alpha: 1,
                    duration: 500,
                    onComplete: () => {
                        this.music.stop();
                        this.scene.start('MenuScene');
                    }
                });
            });
        }

        // Adding recipe HUD for the second play through
        if(!this.registry.get('secrets').firstPlay) {
            this.add.text(1330, 18, 'Recipes:', {
                        fontSize: '26px',
                        fill: '#ffffff',
                        fontFamily: 'Arial',
                        stroke: '#000000',
                        strokeThickness: 4
                    }).setScrollFactor(0).setDepth(200);

            this.recipeIcons = [];
            for (let i = 0; i < 3; i++) {
                const icon = this.add.image(1470 + (i * 50), 32, 'p1')
                    .setScrollFactor(0)
                    .setDepth(200)
                    .setScale(1.7)
                    .setAlpha(0.5);
                this.recipeIcons.push(icon);
            }

            //Call check for recipes already gotten.
            this.checkRecipes();
        }

        

        // Hearts HUD
        this.add.text(1620, 18, 'Lives:', {
            fontSize: '26px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setScrollFactor(0).setDepth(200);

        this.lifeIcons = [];
        for (let i = 0; i < 3; i++) {
            const icon = this.add.image(1720 + (i * 55), 32, 'lives')
                .setScrollFactor(0)
                .setDepth(200)
                .setScale(0.5);
            this.lifeIcons.push(icon);
        }

        //World bounds
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.physics.world.setBoundsCollision(true, true, true, false); 

        // Fade in
        const fadeRect = this.add.rectangle(0, 0, 1920, 1080, 0x000000)
            .setAlpha(1).setOrigin(0).setDepth(10);
        this.tweens.add({
            targets: fadeRect,
            alpha: 0,
            duration: 3000,
            onComplete: () => { fadeRect.destroy(); }
        });

        // Chapter title 
        this.title = this.add.text(960, 514, "Chp 3: Concrete and Shadows", {
            fontSize: '40px',
            fill: '#ffffff'   // NOTE: change colour to match level3 palette
        }).setOrigin(0.5).setDepth(11);
        this.time.delayedCall(2500, () => { this.title.setVisible(false); });

        //Music 
        this.music.play();
        this.tweens.add({ targets: this.music, volume: 0.1, duration: 2500 });

        //Backgrounds
        this.farBg = this.add.tileSprite(0, 0, this.worldWidth, 1080, 'level3FarBg').setOrigin(0);
        this.midBg = this.add.tileSprite(0, 0, this.worldWidth, 1080, 'level3MidBg').setOrigin(0);

        // Player spawn, choosing correct sprite depending on the play through.
        if(this.registry.get('secrets').firstPlay) {
            this.player = new PlayerA2(this, 38, 367, 'playerNoB').setOrigin(0, 0);
        }else {
            this.player = new PlayerA2(this, 38, 367, 'player').setOrigin(0, 0);
        }
        this.player.refreshBody();
        this.player.setSize(66, 35, true).setOffset(0, 8);
        this.player.postFX.addGlow(0xff5c00, 3, 0, false, 0.1, 8); 

        // Make the camera follow the player
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.startFollow(this.player);

        // Set up cursor keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.cursors.keyM  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        
        // Add secret recipe into world
        this.recipe = this.physics.add.image(10910, 740, 'p3').setOrigin(0);
        this.recipe.setImmovable(true);
        this.recipe.postFX.addGlow(0xFFD000, 2, 0, false, 0.1, 7);
        this.recipe.setScale(1.2);

        // Add dripping animation over jug
        this.water = this.add.sprite(10710, 5, 'dripping').setOrigin(0);
        this.water.setScale(1.5);
        if(!this.anims.exists('dripping')) {
            this.anims.create({
                key: 'dripping',
                frames: [
                    { key: 'dripping', frame: 0, duration: 550 },
                    { key: 'dripping', frame: 1, duration: 100 },
                    { key: 'dripping', frame: 2, duration: 100 },
                    { key: 'dripping', frame: 3, duration: 70 },
                    { key: 'dripping', frame: 4, duration: 70 },
                    { key: 'dripping', frame: 5, duration: 60 },
                    { key: 'dripping', frame: 6, duration: 50 },
                ],
                frameRate: 14,
                repeat: -1
            });
        }

        // Create a drip sound zone
        this.waterDripZone = this.add.zone(9918, 0, 1647, 1080).setOrigin(0);
        this.physics.add.existing(this.waterDripZone, true);
        this.waterDripZoneActive = true;


        // Load level platforms
        this.loadPlatforms();

        // Add Moon flakes at the end of the level
        this.moonFlakes = this.physics.add.image(13193, 220, 'moonFlakes').setOrigin(0);
        this.moonFlakes.setImmovable(true);
        this.moonFlakes.body.allowGravity = false;
        this.moonFlakes.setScale(0.23);
        // Adding a floating up and down animation
        this.tweens.add({
            targets: this.moonFlakes,
            y: this.moonFlakes.y - 20,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });


        // Adding all nps and setting up bubbles for interactive npcs
        this.holo = this.physics.add.image(8165, 317, 'holo').setOrigin(0);
        this.holo.setImmovable(true);
        this.holo.body.allowGravity = false;

        this.dialogue = this.add.image(8100, 317, 'dialogue').setOrigin(0);
        this.dialogue.setScale(0.07);
        this.dialogue.toggleFlipX();

        this.bubble = this.add.image(13153, 220, 'dialogue').setOrigin(0);
        this.bubble.setScale(0.07);
        this.bubble.toggleFlipX();

        this.speechHolo = this.add.image(7900, 220, 'speech').setOrigin(0).setScale(0.4).setVisible(true);
        this.speechHolo.toggleFlipX();
        this.speechHolo.setVisible(false);

        // Loading all dialogues
        this.dialogues = this.cache.json.get('dia');
        this.holoLines = this.dialogues.holo;
        this.dialogues = this.cache.json.get('dia');

        // Configure speech depending on the playthrough. Show secret dialogue on second playthrough
        if(this.registry.get('secrets').firstPlay) {
            this.speechText = this.add.text(8025, 270, this.holoLines.default, {
                fontSize: '15px', 
                fill: '#1b1212', 
                wordWrap: {width: 225}}).setOrigin(0.5).setDepth(1);

        }else{
           this.speechText = this.add.text(8020, 275, this.holoLines.secret, {
                fontSize: '15px', 
                fill: '#1b1212', 
                wordWrap: {width: 225}}).setOrigin(0.5).setDepth(1); 
        }
        this.speechText.setVisible(false);

        // Add text
        this.add.text(1350, 300, "Careful! Moving platforms ahead.", { fontSize: '23px', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(5850, 250, "Drones patrol this sector. Stay behind cover or be detected.", { fontSize: '23px', fill: '#ffffff', wordWrap: {width: 500} }).setOrigin(0.5);

        // Colliders and overlap
        this.physics.add.collider(this.player, this.platforms);
        this.ColliderActive = this.physics.add.collider(this.player, this.moving, this.movePlayer, null, this);
        this.physics.add.overlap(this.player, this.boxes, this.setTransp, null, this);
        this.physics.add.overlap(this.player, this.drones, this.subtractLife, null, this);
        this.physics.add.overlap(this.player, this.holo, null, null, this);
        this.physics.add.collider(this.player, this.jug, this.makeJugFall, null, this);
        this.physics.add.collider(this.jug, this.platforms, null, null, this);
        this.physics.add.collider(this.jug, this.specialDrone, this.breakDrone, null, this);
        this.physics.add.collider(this.player, this.recipe, this.collectPiece, null, this);
        this.physics.add.overlap(this.player, this.waterDripZone, this.playSound, null, this);
    }

    /**
     * update
     * Description: Runs every frame. Updates the player, updates player position if on moving platform using delta system, clears the hiding flag when
     *              the player moves away from a box. Stops the water drip sound when out of the drip zone, handles the drone alert sequence when spotted,
     *              processed M key interactions with npcs, and moonflakes, scrolls the parallax backgrounds, and checks for fall death.
     * Inputs: None. Reads from variable or registry
     * Outputs: None. Moves players, background, trigger events and updates as side effects
     * Called By: Phaser engine
     * Calls: this.player.update(), this.waterDripping.stop(), this.time.addEvent(), this.time.delayedCall(), this.subtractLife(), this.tweens.add(),
     *        this.music.stop(), this.scene.start(), this.catFall.play()
     */
    update() {
        // Update player and set justPressed M for interactions
        const justPressedM = Phaser.Input.Keyboard.JustDown(this.cursors.keyM);
        this.player.update(this.cursors, this.isHurt || this.isFalling, this, justPressedM);

        // Move player along with the platform if standing on it
        if(this.onPlatform !== null && this.onPlatform) {
            this.player.x += (this.onPlatform.x - this.preFrame) * 1.7;
        }

        // Setting the flag for if player jumps then no longer on a platform
        if(!this.player.body.blocked.down) {
            this.onPlatform = false;
        }

        // Setting flags for when the player is hiding behind boxes for cover and sets the alpha for the box
        if(this.currBox !== null && this.currBox) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.currBox.x, this.currBox.y);
            if(dist > 100) {
                this.currBox.setAlpha(1);
                this.hiding = false;
            }
        }

        // Checking for if player is in drip zone to play water dripping sound
        const disWater = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.waterDripZone.x, this.waterDripZone.y);
        if(disWater > 1700) {
            //stop water sound
            this.waterDripping.stop();
            this.playedSound = false;
        }

        // Drone spotted player, player is not hiding and it's currently being alerted
        if (this.currDrone && !this.hiding && this.spotted && !this.alerting) {
            // Flag to prevent continously alerting and making the drone blink red
            this.alerting = true;

            // Adds a red tinted blink to the drone
            this.blinkTimer = this.time.addEvent({
                delay: 70,
                loop: true,
                callback: () => {
                    if(this.currDrone.isTinted) {
                        this.currDrone.clearTint();
                    } else {
                        this.currDrone.setTint(0xf22817);
                    }
                }
            });

            // Slight delay so the beam is directly on player when spotted and subtract a heart and clear the tint
            let num = this.player.x - this.currDrone.x;
            this.time.delayedCall(600, ()=> {
                    this.subtractLife(this.player, this.currDrone);
                    this.time.delayedCall(600, () => {
                        this.currDrone.clearTint();
                    });

            });
            // Stops the blinking after 200 ms
            this.time.delayedCall(200, () => {this.blinkTimer.remove();});
            
        }

        // M key NPC interactions
        if (justPressedM) {

            // Only display text and speech bubble if player is close enough
            const disHolo = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.holo.x, this.holo.y);
            if(disHolo < 260 && !this.holoTalking) {
                this.holoTalking = true;
                this.speechHolo.setVisible(true);
                this.speechText.setVisible(true);
                this.dialogue.setVisible(false);

                // Reset visibility after 6 seconds
                this.time.delayedCall(6000, () => {
                    this.speechHolo.setVisible(false);
                    this.speechText.setVisible(false);
                    this.dialogue.setVisible(true);
                    this.holoTalking = false;
                });
            }

            // Player interacts with the moon flakes
            const disMoonFlakes = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.moonFlakes.x, this.moonFlakes.y);
            const fadeOutRect = this.add.rectangle(960, 540, 1920, 1080, 0xFFFFFF).setAlpha(0);
            if(disMoonFlakes < 200 && !this.moonflakeTriggered) {
                this.moonflakeTriggered = true;

                // Add a fade into the next scene
                this.tweens.add({
                    targets: fadeOutRect,
                    alpha: 1,
                    duration: 1500,
                    onComplete: () => {
                        fadeOutRect.destroy();
                    }
                });

                // Fade out music
                this.tweens.add({
                    targets: this.music,
                    volume: 0,
                    duration: 100,
                    onComplete: () => {
                        
                        // Stop playing the music
                        this.music.stop();
                        
                        // Only sets the registry for the third recipe if they player collected it on this run
                        const registry = this.registry.get('secrets');
                        if(this.hasRecipe) {
                            registry.level3 = true;
                        }

                        // If all pieces are collected set registry flag
                        if(registry.level1 && registry.level2 && registry.level3){
                            registry.collectAll = true;
                        }
                        
                        // Play the food ending only when all pieces have been collected
                        if(this.registry.get('secrets').collectAll) {
                            //play good ending
                            this.scene.start('GoodCutScene');
                        }else {
                            // If it's second playthrough and player selected level, will return back to main menu
                            if(!this.registry.get('secrets').firstPlay) {
                                this.scene.start('MenuScene');
                            }else{
                               // play bad ending
                                this.scene.start('EndingCutScene'); 
                            }
                            
                        }
                        // Setting the flag so system knows it's not players first play through
                        this.registry.get('secrets').firstPlay = false;
                    }
                });

                
            }
        }

        // Variable for the moving platorms 
        if(this.onPlatform !== null) {
            this.preFrame = this.onPlatform.x;
        }

        // Parallax scrolling set up
        this.farBg.tilePositionX = this.cameras.main.scrollX * 0.01;
        this.midBg.tilePositionX = this.cameras.main.scrollX * 0.2;

        // Fall death
        if (!this.isFalling && this.player.y > this.worldHeight) {
            this.catFall.play();
            this.isFalling = true;
            this.time.delayedCall(1500, () => {
                this.music.stop();
                this.scene.restart();
            });
        }

        
    }

    /**
     * checkRecipes
     * Description: Reads the registry and lights up recip icon upon collection and for ones already collected in the previous sesson.  
     *              Called at the beginning to set correct icon states for ones that have been collected already.
     * Inputs: None. Reads from registry.
     * Outputs: None. Sets icon opacity as side effect
     * Called By: this.create()
     * Calls: this.recipeIcons[i].setAlpha()
     */
    checkRecipes() {
        const registry = this.registry.get('secrets');

        // Only change alpha to 1 if player already collected the pieces
        if(registry.level1) {
            this.recipeIcons[0].setAlpha(1);
        }

        if(registry.level2) {
            this.recipeIcons[1].setAlpha(1);
        }

        if(registry.level3) {
            this.recipeIcons[2].setAlpha(1);
        }
    }

    /**
     * playSound
     * Description: Plays the water drip animation and sound when player is within the drip zone. Both played
     *              together so the sound matches the speed of the drip sound. Uses this.playedSound to prevent
     *              it from restarting every frame while the player stays in the zone
     * Inputs:
     *      @param player : reference to the player object
     *      @param zone : references to the drip zone
     * Outputs: None. Plays animation and sound as side effect
     * Called By: Phaser collider callback
     * Calls: this.water.play('dripping'), this.waterDripping.play()
     */
    playSound(player, zone) {
        if(this.playedSound) return;
        this.playedSound = true;
        this.water.play('dripping');
        this.waterDripping.play();
    }

    /**
     * makeJugFall
     * Description: Called each fram the player is collising with the jug. Scales the horizontal push force from the players
     *              currently current velocity. Capped at 180 so the jug doesnt fly off the screen. Gravity pulling down the jug.
     * Inputs: 
     *      @param player :  referencing the player object
     *      @param jug : referencing the jud object
     * Outputs: None. Sets jugs horizontal velocity
     * Called By: Phaser collider callback
     * Calls: jug.body.setVelocityX()
     */
    makeJugFall(player, jug) {
        // Scale push force based on player speed but cap it so the jug doesn't fly off the screen
        const pushForce = Math.min(player.body.velocity.x * 0.4, 180);
        jug.body.setVelocityX(pushForce);
    }

    /**
     * breakDrone
     * Description: Called when the jug collides with the special stationary drone. Uses this.broke so it onyl runs once upon collision. 
     *              Plays the broke drone sound and swaps out the sprite for a broken drone sprite. Drone falls onto the platform and it
     *              reveals the location of the last recipe piece inside the wall. Wall alpha changes upon completetion of drone falling.
     * Inputs: 
     *      @param jug : reference to the jug object
     *      @param drone : referring to the special drone
     * Outputs: None. 
     * Called By: Phaser collision callback
     * Calls: this.droneBreak.play(), this.tweens.add(), drone.setTexture(), this.time.delayedCall(), jug.body.enable, drone.body.enable,
     *        this.platformAlpha.body.checkCollision, this.platformAlpha.setAlpha()
     */
    breakDrone(jug, drone) {

        // Breaks drone only once and plays the broken sound
        if(this.broke) return;
        this.broke = true;
        this.droneBreak.play();

        // Change jugs visibility
        const tween = this.tweens.add({
            targets: jug,
            alpha: 0,
            duration: 300
        });
        
        // Disable jubs body so player can't interacte with it anymore
        this.time.delayedCall(300, ()=> {
            tween.remove();
            jug.body.enable = false;

        // Set the new texture to the broken texture
        drone.setTexture('brokenDrone');

        // Moves drone down onto the platform, mimicing falling down
        const droneBreaking = this.tweens.add({
            targets: drone,
            duration: 500,
            y: drone.y + 200,
            onComplete: () => {

                // Disables collision between player and drone so player cant get hurt
                drone.setAngle(-45);
                drone.body.enable = false;
                drone.checkCollision = false;                
            }
        });
            
            // After a short delay open up left wall and change the alpha to show player the recipe inside the wall
            this.time.delayedCall(500, () => {
                droneBreaking.remove();
                this.platformAlpha.body.checkCollision.left = false;
                this.platformAlpha.setAlpha(0.5);
            });
        });
    }

    /**
     * loadPlatforms
     * Description: Creates all platforms in Level 3 (drones, moving platforms, boxes, platforms). Draws orange lines to show the distance each
     *              moving platform and drone follows. Sets up the special drone, platform for the jug and the jug.
     * Inputs: None
     * Outputs: None. Populates the world level as a side effect
     * Called By: this.create
     * Calls: this.createSmall(), this.createMoving(), this.createPlatform(), this.createDrone(), this.addLine(), this.addBox(),
     *        this.physics.add.staticGroup/group(), this.add.rectangle(), this.physics.add.image()
     */
    loadPlatforms() {
        // Set up all groups, static and dynamic
        this.platforms = this.physics.add.staticGroup();
        this.moving = this.physics.add.group();
        this.boxes = this.physics.add.staticGroup();
        this.drones = this.physics.add.group();
        

        this.createSmall(0, 350);

        this.createSmall(1055, 450);

        this.createMoving(2034, 520, 0, 100, false);
        this.add.rectangle(2034-100, 521, 332, 3, 0xff5c00).setOrigin(0, 0);


        this.createMoving(2578, 520,1, 100, false);
        this.add.rectangle(2578-100, 521, 332, 3, 0xff5c00).setOrigin(0, 0);


        this.createSmall(3113, 450);

        this.createMoving(3912, 440, 0, 100, false);
        this.add.rectangle(3912-100, 441, 332, 3, 0xff5c00).setOrigin(0, 0);


        this.createMoving(4456, 540, 1, 100, false);
        this.add.rectangle(4456-100, 541, 332, 3, 0xff5c00).setOrigin(0, 0);


        this.createMoving(5000, 440, 0, 100, false);
        this.add.rectangle(5000-100, 441, 332, 3, 0xff5c00).setOrigin(0, 0);

        this.createPlatform(5535, 520);

        this.createDrone(6261, 90);
        this.addLine(6261, 110);
        this.addBox(6041, 470);
        this.addBox(6481, 470);

        this.createMoving(7255, 540, 1, 80, false);
        this.add.rectangle(7255 - 80, 541, 292, 3, 0xff5c00).setOrigin(0, 0);

        this.createSmall(7767, 540);

        this.createMoving(8746, 540, 0, 80, false);
        this.add.rectangle(8746 - 80, 541, 292, 3, 0xff5c00).setOrigin(0, 0);

        this.createSmall(9260, 540);

        this.createDrone(9465, 100);
        this.addLine(9465, 120);
        this.addBox(9559, 490);

        this.createMoving(10159, 700, 1, 100, false);
        this.add.rectangle(10159 - 100, 701, 332, 3, 0xff5c00).setOrigin(0, 0);

        this.createSmall(10480, 700);

        this.createMoving(10078, 520, 0, 200, false);
        this.add.rectangle(10078 - 200, 521, 532, 3, 0xff5c00).setOrigin(0, 0);

        // Setting up the jug, jug physics, and the platform it sits on
        this.jugPlat = this.platforms.create(10702, 300, 'jugPlat').setOrigin(0, 0).refreshBody().setSize(291, 47);
        this.jug = this.physics.add.image(10702, 243, 'jug').setOrigin(0).refreshBody();
        this.jug.setGravityY(1200);
        this.jug.body.setBounce(0);
        this.jug.setDragX(3000);
        this.jug.body.setMass(1);
        this.jug.body.allowGravity = true;

        // Adding special drone to break
        this.createDrone(10530, 500, true);

        this.platformAlpha = this.createSmall(10702, 400);

        this.createMoving(11311, 375, 0, 50);
        this.add.rectangle(11311 - 50, 376, 234, 3, 0xff5c00).setOrigin(0, 0);
        
        this.createMoving(11230, 240, 1, 200);
        this.add.rectangle(11230 - 200, 241, 534, 3, 0xff5c00).setOrigin(0, 0);

        this.createPlatform(12100, 300);        

    }

    /**
     * createPlatform
     * Description: Helper function. Creates one large static plaform at the specified world coordinates
     * Inputs:
     *      @param x : world x position
     *      @param y : world y position
     * Outputs: plat object created
     * Called By: this.loadPlatforms()
     * Calls: this.platforms.create(), plat.refreshBody(), plat.setSize()
     */
    createPlatform(x, y) {
        const plat = this.platforms.create(x, y, 'big').setOrigin(0, 0).setDepth(1);
        plat.refreshBody();
        plat.setSize(1400, 593).setOffset(0, 68);
        return plat;
    }

    /**
     * createSmall
     * Description: Helper function. Creates one small static platform at the specified world position
     * Inputs:
     *      @param x : world x position
     *      @param y : world y position
     * Outputs: plat object create
     * Called By: this.loadPlatforms()
     * Calls: this.platforms.create(), plat.refreshBody(), plat.setSize()
     */
    createSmall(x, y) {
        const plat = this.platforms.create(x, y, 'small').setOrigin(0, 0).setDepth(1);
        plat.refreshBody();
        plat.setSize(599, 769).setOffset(0, 60);
        return plat;
    }

    /**
     * createMoving
     * Description: Helper function. Creates a platform at the specified x and y coordinates, sets whether it starts from the left or
     *              right when moving, and the distance to the platform travels
     * Inputs:
     *      @param x : world x position
     *      @param y : world y position
     *      @param num : start the platform moving from the left (0) or start from the right (1) to create different moving platforms
     *      @param distance : the distance the platform travels
     * Outputs: The moving platform object
     * Called By: this.loadPlatforms()
     * Calls: this.moving.create(), plat.refreshBody(), plat.setImmovable(), plat.setSize(), this.tweens.add()
     */
    createMoving(x, y, num, distance) {
        // Add object to the physics group and set physics variables
        const plat = this.moving.create(x, y, 'movingPlat').setOrigin(0, 0).setDepth(1);
        plat.refreshBody();
        plat.setImmovable(true);
        plat.setSize(132, 43).setOffset(0, -4);
        plat.originalVal = x;
        
        // Start position on the left side 
        if(num === 0) {
            plat.x = x - distance;
            this.tweens.add({
                targets: plat,
                duration: 4000,
                x: x + distance,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            }); 

        }else { // Start position on the right side
            plat.x = x + distance;
            this.tweens.add({
                targets: plat,
                duration: 4000,
                x: x - distance,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        return plat;
    }

    /**
     * createDrone
     * Descript: Helper Function. Creates one security drone If the drone is special it doesn't move and is stationary. If normal drone
     *           adds a looping horiontal tween so it partrols back and forth
     * Inputs: 
     *      @param x : world x position
     *      @param y : world y position
     *      @param special : mark the special drone so it's stationary
     * Outputs: Returns the drone object
     * Called By: this.loadPlatforms()
     * Calls: this.drones.create(), plat.refreshBody(), plat.setImmovable(), plat.setSize(), this.tweens.add()
     */
    createDrone(x, y, special) {

        // Sets up drone physics variables
        const plat = this.drones.create(x, y, 'security').setOrigin(0, 0).setDepth(0.5);
        plat.refreshBody();
        plat.setImmovable(true);
        plat.setSize(146, 481).setOffset(10, 28);
        plat.special = special;
        
        // Dont set up horizontal movement if it's the special drone
        if(special) {
            this.specialDrone = plat;
            return;
        }else {
            // Set up horizontal partrol movement
            plat.x = x - 220;
            plat.tweenM = this.tweens.add({
            targets: plat,
            duration: 2500,
            x: x + 220,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        }
    }

    /**
     * addBox
     * Description: Helper function. Creates one static box for player to hide behind. Sets the isHiding flag so player wont get spotted
     * Inputs:
     *      @param x : world x position
     *      @param y : world y position
     * Outputs: None
     * Called By: this.loadPlatforms()
     * Calls: this.boxes.create(), plat.refreshBody(), plat.setImmovable(), plat.setScale(), plat.setSize()
     */
    addBox(x, y) {
        // Sets up physics for boxes
        const plat = this.boxes.create(x, y, 'box').setOrigin(0, 0).setDepth(1);
        plat.refreshBody();
        plat.setImmovable(true);
        plat.setScale(0.8);
        plat.setSize(118, 97).setOffset(0, 27);
    }

    /**
     * addLine
     * Description: Helper function. Adds a visual line image below drone showing its detection beam. Uses a different image key
     *              depending on the d flag (lineK for a left offset, line for the standard one)
     * Inputs:
     *      @param x : world x position
     *      @param y : world y postion
     *      @param d (optional): true to use lineL image variant, line variable otherwise
     * Outputs: None
     * Called By: this.loadPlatforms()
     * Calls: this.add.image()      
     */
    addLine(x, y, d) {
        if(d) {
            this.add.image(x - 200, y, 'lineL').setOrigin(0);
        }else {
            this.add.image(x - 200, y, 'line').setOrigin(0);
        }
        
    }

    /**
     * setTransp
     * Description: Called each frame the player overlaps with a box. Set the isHiding flag so player wont get
     *              detected. The box turns semi transparent to show player is hiding. Flag is spotted set so
     *              player can't get spotted.
     * Inputs: 
     *      @param player : the player object
     *      @param box : the box the player is overlapping
     * Outputs: None
     * Called By: Phaser overlap callback
     * Calls: box.setAlpha()
     */
    setTransp(player, box) {
        // Changes box opacity and sets flags so player isn't spotted
        box.setAlpha(0.6);
        this.currBox = box;
        this.hiding = true;
        this.spotted = false;
    }

    /**
     * movePlayer
     * Description: Called every frame the player is on the moving platform. Records this.onPlatform and this.preFrame so the update()
     *              delta system can offset the player's x by how much the platform moved each frame, so therefore player can ride
     *              the platform.
     * Inputs:
     *      @param player : the player object
     *      @param moving : referencing the platform the player is on
     * Output: None
     * Called By: Phaser collision callback
     * Calls: None. Sets properties 
     */
    movePlayer(player, moving) {

        // Sets the variables for update to move the player along with the platform
        this.onPlatform = moving;
        this.preFrame = moving.x;
    }

    /**
     * droneSpotted
     * Description: Called when the player overlaps with a drone's detectio zone. Stores the current drone and sets this.spotted
     *              to true if the player is not hiding. This will cause the blinking and subtract hearts to happen in update. 
     *              If the player is currently hiding, then player wont get detection.
     * Inputs:
     *      @param player : the player object
     *      @param drone : the drone player is overlapping with
     * Called By: Phasers overlap callback
     * Calls: None. Sets properties
     */
    droneSpotted(player, drone) {
        this.currDrone = drone;
        // Set player is hiding flag so it doesnt set in update
        if(this.hiding) {
            //Hiding can't see so just return;
            return;
        }else {
            //Make drone blink red and subtract hearts
            this.spotted = true;
        }
    }

    /**
     * collectPiece
     * Description: Called when the player touches the recipe piece. Sets the local variable hasRecipe. Lights up the recipe icon on the
     *              second playthrough, plays the pickup sound, restores the platformAlpha wills appearance after 2 seconds.
     * Inputs:
     *      @param player : the player object
     *      @param piece : the recipe piece that was collected
     * Outputs: None
     * Called By: Phaser collider callback
     * Calls: this.pickup.play(), piece.destroy(), this.recipeIcons[2].setAlpha(), this.time.delayedCall(), this.platformAlpha.setAlpha()
     */
    collectPiece(player, piece) {
        // Set flag and play sound
        this.hasRecipe = true;
        this.pickup.play();

        // Change the opacity of the icon and after a delay change the platforms opacity back
        if(this.recipeIcons !== null) this.recipeIcons[2].setAlpha(1);
        this.time.delayedCall(2000, () => {
            this.platformAlpha.setAlpha(1);
        });
        piece.destroy();
    }


    /**
     * subtractLife
     * Description: Handles drone damage. Skips if the player is already hurt, hiding behind a box, or if the broke is set (drone disabled).
     *              Deducts a life, plays a hiss, sets currDrone to GameOverScene if lives reach zero. Has a 1.5s cool down before player
     *              can get hurt again
     * Inputs:
     *      @param player : the player object
     *      @param enemy : the drone player is colliding with
     * Outputs: None
     * Called By: Phaser collision callback, update()
     * Calls: this.hiss.play(), player.setVelocityX/Y(), this.lifeIcons filter, this.music.stop(), this.scene.start('GameOverScene), this.time.delayedCall()
     */
    subtractLife(player, enemy) {
        // Guard so player wont continuously loose lives and sets flags
        if (!this.isHurt && !this.hiding && !this.broke) {
            this.isHurt = true;
            this.lives -= 1;
            this.hiss.play();
            this.currDrone = enemy;
            this.spotted = true;

            // Knock player opposite to enemy travel direction
            const knockDir = enemy.body.velocity.x >= 0 ? -1 : 1;
            player.setVelocityX(knockDir * 250);
            player.setVelocityY(-150);

            // Hide rightmost visible life icon
            const visibleIcons = this.lifeIcons.filter(icon => icon.visible);
            if (visibleIcons.length > 0) {
                visibleIcons[visibleIcons.length - 1].setVisible(false);
            }

            // Show game over screen if player looses all lives and stop the music
            if (this.lives <= 0) {
                if(this.recipeIcons !== null) this.recipeIcons[2].setAlpha(0.5);
                this.music.stop();
                this.scene.start('GameOverScene', {previousScene: 'Level3'});
            }

            // Cool down for player getting hurt
            this.time.delayedCall(1500, () => { this.isHurt = false; this.spotted = false; });

        }
    }

}
