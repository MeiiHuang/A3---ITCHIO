/**
 * Author: Mei Huang
 * Program Name: Level1
 * Description: Chapter 1. Sumi starts at the mountain where their house is and has to reach the frog npc at the end. Bird
 *              enemies fly across two zones. There is a raven NPC which has two dialogues, one to guide you, the other is
 *              a hint to the first secret. Secret: Meow near the bird on the nest to make it fly away, then collect the recipe
 *              hidden behind the bird that flew away. Finish the level by talking to the frog npc.
 * Inputs: None. Reads from registry.get('secrets') for firstPlay flag and recipe states.
 * Outputs: None. Transitions to Level2, GoodCutScene, or MenuScene on completion; Depends on the states of the game
 * Called By: BeginningCutScene.fadeToLevel1(), MenuScene.create(), GameOverScene.create().
 * Calls: Level2, GoodCutScene, MenuScene, GameOverScene, Player
 */

class Level1 extends Phaser.Scene {
    /**
     * constructor
     * Description: Resgiters this scene with Phaser under the key 'Level1'
     * Inputs: None
     * Outputs: None
     * Called By: Phaser game when the game config is processed
     * Calls: super()
     */
    constructor() {
        super({key: 'Level1'});
    }

    /**
     * preload
     * Description: Creates all the sound cues ready for the level. Specific for Level1.
     * Inputs: None
     * Outputs: None. Creates all sound obejects ready to use as a side effect
     * Called By: Phaser engine before create()
     * Calls: this.sound.add()
     */
    preload() {
        this.pickup = this.sound.add('pickup', { volume: 0.6, loop: false});
        this.music = this.sound.add('level1Song', {volume: 0, loop: true});
        this.hiss = this.sound.add('hiss', {volume: 0.6, loop: false});
        this.chirp = this.sound.add('chirp', {volume: 0.3, loop: false});
        this.catFall = this.sound.add('fall', {volume: 1, loop: false});
        this.squawk = this.sound.add('squawk', {volume: 0.7, loop: false});
    }

    /**
     * create
     * Description: Builds the entire level, home icon, fade in, starts music, world bounds, parallax background, player, camera,
     *              platforms, bird nest secret, npcs, dialogue, colliders, and the HUD. Recipe icons only appear after the first
     *              play through. Lighting up only when collected by checkRecipes().
     * Inputs: None. Read from registry for firstPlay, and recipe state.
     * Outputs: None. Builds all level objects and physics as side effects
     * Called By:  Phaser engine after scene.start('Level1') or scene.restart()
     * Calls: this.loadLevelPlatforms(), this.checkRecipes(), Player constructor, this.physics.add.collider/overlap(),
     *        this.add.text/image/rectangle(), this.tweens.add(), this.time.delayedCall(), this.sound.add()
     * 
     */
    create() {
        // Instantiate all variables
        this.recipeIcons = null;
        this.lives = 3;
        this.isHurt = false;
        this.overlapping = false;
        this.isFalling = false;
        this.worldWidth = 13440;
        this.worldHeight = 1080;
        this.birdFlying = false;
        this.ravenTalking = false;
        this.frogTalking = false;

        // HUD set up for hearts
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

        // HUD set up for recipe pieces after the first play through.
        if(!this.registry.get('secrets').firstPlay) {
            this.add.text(1330, 18, 'Recipes:', {
                        fontSize: '26px',
                        fill: '#ffffff',
                        fontFamily: 'Arial',
                        stroke: '#000000',
                        strokeThickness: 4
                    }).setScrollFactor(0).setDepth(200);

            // Adding icons to an array for setting the alpha later when pieces get collected.
            this.recipeIcons = [];
            for (let i = 0; i < 3; i++) {
                const icon = this.add.image(1470 + (i * 50), 32, 'p1')
                    .setScrollFactor(0)
                    .setDepth(200)
                    .setScale(1.7)
                    .setAlpha(0.5);
                this.recipeIcons.push(icon);
            }

            // Set the proper alpha value depending on pieces of recipes collected in play through
            this.checkRecipes();
        }

        // Setting up home icon only for after the first playthrough
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

        // Fade into the level with title that disappears after a few seconds
        const fadeRect = this.add.rectangle(0, 0, 1920, 1080, 0x000000).setAlpha(1).setOrigin(0).setDepth(1);
        this.tweens.add({
            targets: fadeRect,
            alpha: 0,
            duration: 1500,
            onComplete: () => {fadeRect.destroy(); }
        });

        // Title
        this.title = this.add.text(960, 514, "Chp 1: Beyond the Peaks", {fontSize: '40px', fill: '#0a0a0a'}).setOrigin(0.5).setDepth(2);
        this.time.delayedCall(2500, () => {
            this.title.setVisible(false);
        });

        // Start Level 1 Music, fade the music in.
        this.music.play();
        this.tweens.add({
            targets: this.music,
            volume: 0.1,
            duration: 2500
        });

        // Create world bounds
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
        // Disable bottom bound so player can fall off screen instead of sitting on it
        this.physics.world.setBoundsCollision(true, true, true, false);

        // Setting up parallax scrolling
        this.farBg = this.add.tileSprite(0, 0, this.worldWidth, 1080, 'level1FarBg').setOrigin(0);
        this.midBg = this.add.tileSprite(0, 575, this.worldWidth, 1080, 'level1MidBg').setOrigin(0);

        // Add Home to the beginning of the map
        this.homePng = this.add.tileSprite(-200, 580, 1924, 928, 'home').setOrigin(0);
        this.homePng.setScale(0.5);

        //Add checkpoint house
        this.checkpoint = this.add.tileSprite(12959, 345, 957, 545, 'checkpoint').setOrigin(0);
        this.checkpoint.setScale(0.5);

        //Add frog npc at the end of the level
        this.npc = this.physics.add.image(12870, 517, 'frogNpc').setOrigin(0);
        this.npc.setScale(0.3);
        this.npc.setImmovable(true);
        this.npc.body.allowGravity = false;
        
        // Choose which player sprite to display depending on the game state
        if(this.registry.get('secrets').firstPlay) {
            this.player = new PlayerA2(this, 98, 920, 'playerNoB').setOrigin(0, 0);
        }else {
            this.player = new PlayerA2(this, 98, 920, 'player').setOrigin(0, 0);
        }

        // Spawn player
        this.player.refreshBody();
        this.player.setSize(66, 35, true).setOffset(0, 8);
        this.player.postFX.addGlow(0xdd5437, 8, 0, false, 0.1, 10);

        // Make the camera follow the player
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.startFollow(this.player);

        // Set up cursor keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.cursors.keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);

        // Call load platforms to build the map
        this.loadLevelPlatforms(this);

        // Set up secret recipe piece
        this.recipe = this.physics.add.image(11790, 950, 'p1').setOrigin(0);
        this.recipe.setImmovable(true);
        this.recipe.postFX.addGlow(0xFFD000, 2, 0, false, 0.1, 7);
        this.recipe.setScale(1.2);

        // Loading bird that stays in front of the recipe piece
        this.bird = this.physics.add.sprite(11753, 890, 'birdFly').setOrigin(0); 
        this.bird.setFrame(1);
        this.bird.setImmovable(true);
        this.bird.setScale(0.5);
        this.bird.setSize(300,100, true).setOffset(0, 100);
        this.bird.body.allowGravity = false;

        // Loading nest for the bird
        this.nest = this.add.image(11735, 945, 'nest').setOrigin(0);
        this.nest.setScale(0.5);

        // Load Raven npc at mid point
        this.raven = this.physics.add.sprite(8900, 865, 'mrRaven').setOrigin(0);
        this.raven.setImmovable(true);
        this.raven.setSize(86, 137, true).setOffset(0, 0);
        this.raven.body.allowGravity = false;

        // Load the universal dialogue bubbles (...) for both the raven and the npc frog
        this.diaBubble = this.add.image(8870, 845, 'dialogue').setOrigin(0);
        this.diaBubble.setScale(0.07);
        this.diaBubble.toggleFlipX();
        this.frogBubble = this.add.image(12810, 500, 'dialogue').setOrigin(0);
        this.frogBubble.setScale(0.07);
        this.frogBubble.toggleFlipX();

        // Load speech bubbles for both raven and npc frog respectively
        this.speech = this.add.image(8990, 681, 'speech').setOrigin(0); // Raven
        this.speech.setScale(0.4);
        this.speech.setVisible(false);
        this.speech.setDepth(1);
            
        this.speech1 = this.add.image(12620, 370, 'speech').setOrigin(0); // Frog
        this.speech1.setScale(0.4);
        this.speech1.setVisible(false);
        this.speech1.toggleFlipX();

        // Load the proper scripts for both npcs
        this.dialogues = this.cache.json.get('dia');
        this.ravenLines = this.dialogues.raven;
        this.frogNpc = this.dialogues.frog;

        // Loading the proper speech for the raven npc depending on registry game state
        if(this.registry.get('secrets').firstPlay) {
            this.speechText = this.add.text(9125, 735, this.ravenLines.default, {
                fontSize: '15px', 
                fill: '#1b1212', 
                wordWrap: {width: 225}}).setOrigin(0.5).setDepth(1);
        }else {
            this.speechText = this.add.text(9125, 735, this.ravenLines.secret, {
                fontSize: '15px', 
                fill: '#1b1212',
                wordWrap: {width: 225}}).setOrigin(0.5).setDepth(1);
        }
        // Set to invisible until player interacts with them
        this.speechText.setVisible(false);
        
        // Loads the npc frog speech
        this.frogSpeech = this.add.text(12740, 425, this.frogNpc.default, {
                fontSize: '15px', 
                fill: '#1b1212', 
                wordWrap: {width: 225}}).setOrigin(0.5);
        // Set to invisible until player interacts with them
        this.frogSpeech.setVisible(false);

        // Create animation for the bird with recipe to fly and enemy birds
        if(!this.anims.exists('birdFly')) {
            this.anims.create({
                key: 'birdFly',
                frames: this.anims.generateFrameNumbers('birdFly', { start: 0, end: 3 }),
                frameRate: 12,
                repeat: -1
            });
        }

        // Setting up the physics group for the enemy birds
        this.birdEnemies = this.physics.add.group().setDepth(1);

        // Adding spawn zones for the enemy birds, two zones total
        this.birdZone1 = this.add.zone(2680, 0, 1690, 1080).setOrigin(0);
        this.physics.add.existing(this.birdZone1);
        this.birdZone1.body.allowGravity = false;
        this.birdZone1Active = false;

        this.birdZone2 = this.add.zone(6930, 0, 1359, 1080).setOrigin(0);
        this.physics.add.existing(this.birdZone2);
        this.birdZone2.body.allowGravity = false;
        this.birdZone2Active = false;

        // Add tutorial text
        this.add.text(480, 800, "Use the arrow keys to move left and right", {fontSize: '23px', fill: '#ffffff'}).setOrigin(0.5);
        this.add.text(1095, 760, "Press the up arrow key to jump", {fontSize: '23px', fill: '#ffffff'}).setOrigin(0.5);
        this.add.text(9000, 765, "Press 'M' to meow, use it to interact with other characters", {fontSize: '23px', fill: '#ffffff', wordWrap: {width: 400}}).setOrigin(0.5);
        this.add.text(2000, 760, "Keep an eye out for birds — dodge them or let them fly by", {fontSize: '23px', fill: '#ffffff'}).setOrigin(0.5);

        // Add Colliders
        this.physics.add.collider(this.player, this.platforms);
        this.birdCollider = this.physics.add.collider(this.player, this.bird, this.handleBirdCollision, null, this);
        this.recipecollider = this.physics.add.collider(this.player, this.recipe, this.collectPiece, null, this);
        this.birdEnemiesCollider = this.physics.add.overlap(this.player, this.birdEnemies, this.subtractLife, null, this);

    }

    /**
     * update
     * Description: Runs every frame. Checks the birdzones and triggers them to spawn when player collides with zones. Handles
     *              M key interactions with the nest bird, raven npc, and frog npc (the frog the end level transition and commits
     *              the recipe collected). Updates the player, scrolls the parallac backgrounds, and checks for fall death.
     * Inputs: None. Reads this.cursors, this.isFalling, this.birdZone1Active, this.birdZone2Active, this.birdFlying, this.hasRecipe
     * Outputs: None. Triggers events, moves player, and updates tilePositionX as side effects
     * Called By: Phaser engine every frame
     * Calls: this.loadBirds(), this.triggerBirdFly(), this.player.update(), this.time.delayedCall(), this.tweens.add(), this.music.stop(),
     *        this.scene.start(), this.catFall.play()
     */
    update() {

        // Checks if player overlaps with bird zones, if they do call this.loadBirds() to spawn bird enemies
        if (this.physics.overlap(this.player, this.birdZone1) && !this.birdZone1Active) {
            this.birdZone1Active = true;
            this.loadBirds();
        }
        if (this.physics.overlap(this.player, this.birdZone2) && !this.birdZone2Active) {
            this.birdZone2Active = true;
            this.loadBirds();
        }

        // Interaction with npcs with cursor key M
        const justPressedM = Phaser.Input.Keyboard.JustDown(this.cursors.keyM);

        if(justPressedM) {
            // Distance between the player and the npcs to trigger speeches.
            const disFrog = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.npc.x, this.npc.y);
            const disRaven = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.raven.x, this.raven.y);

            // For the secret bird, if the player is close enough it will call triggerBirdFlyAway() and have the bird fly
            if(!this.birdFlying) {
                const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.bird.x, this.bird.y);
                if (dist < 200) {
                    this.triggerBirdFlyAway();
                }
            }

            // Checks for if player is interactive with the raven npc and displays speech for a few seconds
            if(disRaven < 200 && !this.ravenTalking) {
                this.ravenTalking = true;
                this.speechText.setVisible(true);
                this.speech.setVisible(true);
                this.diaBubble.setVisible(false);

                // Set back to normal states after 6 seconds
                this.time.delayedCall(6000, () => {
                    this.speechText.setVisible(false);
                    this.speech.setVisible(false);
                    this.diaBubble.setVisible(true);
                    this.ravenTalking = false;
                });
            }

            // Checks if player is close enough to frog npc. If so display the speech, set registry variables if need be and start level 2.
            if(disFrog < 200 && !this.frogTalking) {
                    this.frogTalking = true;
                    this.frogSpeech.setVisible(true);
                    this.speech1.setVisible(true);
                    this.frogBubble.setVisible(false);

                    // Set back to normal states after 6.5 seconds, since longer speech
                    this.time.delayedCall(6500, ()=> {
                        this.frogSpeech.setVisible(false);
                        this.speech1.setVisible(false);
                        this.frogBubble.setVisible(true);
                    });


                this.fadeRect = this.add.rectangle(0, 0, 1920, 1080, 0x000000).setAlpha(0).setOrigin(0).setDepth(999).setScrollFactor(0);

                // Transition to level 2, fade music, set registry variables, checks registry variables
                this.time.delayedCall(6000, () => {
                    this.tweens.add({
                        targets: this.music,
                        volume: 0,
                        duration: 1500
                    });

                    // Fade to black
                    this.tweens.add({
                        targets: this.fadeRect,
                        alpha: 1,
                        duration: 1500,
                        onComplete: () => {
                            // Save the recipe now if they got it this run and made it to end npc
                            if(this.hasRecipe) {
                                this.registry.get('secrets').level1 = true;
                            }

                            this.music.stop();

                            // Check if registry secrets need to be set 
                            const registry = this.registry.get('secrets');
                            if(!this.registry.get('secrets').firstPlay) {

                                // Second playthrough: check if they now have all three and go to good ending else go back to menu
                                if(registry.level1 && registry.level2 && registry.level3){
                                    registry.collectAll = true;
                                    this.scene.start('GoodCutScene');
                                }else{
                                    this.scene.start('MenuScene');
                                }
                            }else {
                                // First playthrough: just keep going to next level, level2
                                this.scene.start('Level2');
                            }
                                
                        }
                    });
                });
            }

        }// Just pressed M if

        // Block all input while falling, let gravity carry player down
        this.player.update(this.cursors, this.isHurt || this.isFalling, this, justPressedM);

        // Parallax scrolling
        this.farBg.tilePositionX = this.cameras.main.scrollX * 0.01;
        this.midBg.tilePositionX = this.cameras.main.scrollX * 0.2;

        // Fall death.
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
     * Description: Reads the registry and lights up each recip icon that has already been collected. Called once in create() to restore
     *              the correct icon state at the start of each session or after a restart
     * Inputs: None. Reads this.registry.get('secrets').level1/level2/level3
     * Outputs: None. Sets icon alpha to 1 for collected as a side effect
     * Called By: this.create() only runs on second playthrough when recipe icons exist
     * Calls: this.recipeIcons[i].setAlpha()
     */
    checkRecipes() {
        const registry = this.registry.get('secrets');
        
        // Only set alpha at 1 if player collected the piece
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
     * triggerBirdFlyAway
     * Description: Removes the collision between the player and the nest bird, plays the fly animation, gives it a velocity to fly off screen
     *              and stops it after 4 seconds. Sets the birdFlying so it can only trigger once.
     * Inputs: None. Reads this.birdCollider, this.bird.
     * Outputs: None. Modifies bird physics and animation as side effects.
     * Called By: this.update() when M key pressed and player is within 200px of the bird
     * Calls: this.physics.world.removerCollider(), this.bird.play(), this.bird.setVelocityY(), this.bird.setVelocityX(), this.time.delayedCall()
     * 
     */
    triggerBirdFlyAway() {
        // Setting up bird fly away, disable collision and start animation
        this.birdFlying = true;
        this.physics.world.removeCollider(this.birdCollider);
        this.bird.play('birdFly');

        // Times the sound of the bird so it doesn't completely overlap with meow audio
        this.time.delayedCall(400, () => {
            this.squawk.play();
        });
        
        this.bird.setVelocityY(-300);
        this.bird.setVelocityX(150);

        // Stop bird fly so it doesnt' fly indefinately 
        this.time.delayedCall(4000, () => {
            this.bird.setVelocityX(0);
            this.bird.setVelocityY(0);
        });
    }

    /**
     * collectPiece
     * Description: Called when the player touches the recipe piece. Sets the scene and local hasRecipe flag (not registry). Lights up the first
     *              recipe icon if on the second playthrough, plays the pickup sound, and destroys the piece so it can't be collected again.
     * Inputs:
     *      @param player : this.player
     *      @param piece : this.recipe
     * Outputs: None. Sets this.hasRecipe, updates icon, play sound, destroys piece
     * Called By: Phaser collider detector callback in create()
     * Calls: this.pickup.play(), piece.destroy(), this.recipeIcons[0].setAlpha()
     */
    collectPiece(player, piece) {
        this.hasRecipe = true;
        if(this.recipeIcons !== null) this.recipeIcons[0].setAlpha(1);
        this.pickup.play();
        piece.destroy();
    }

    /**
     * handleBirdCollision
     * Description: handles collision with the nest bird (not the enemy ones.) Deducts a life, plays the hiss, and knocks player back, hides a life icon,
     *              and sends to GameOverScene if lives reach zero. Has a 500ms hurt cooldown so the player can't lose multiple lives from one collision.
     * Inputs:
     *      @param player : this.player
     *      @param bird  : this.bird
     * Outputs: None.
     * Called By: Phaser collider detector callback in create()
     * Calls: this.hiss.play(), player.setVelocityX/Y(), this.lifeIcons filter, this.music.stop(), this.scene.start("GamerOverScene"), this.time.delayedCall()
     */
    handleBirdCollision(player, bird) {
        // Checks and set flag so it doesnt continusouly push player and plays sound
        if (!this.isHurt) {
            this.lives -= 1;
            this.isHurt = true;
            this.hiss.play();

            // Pushes player back and adds a slight bounce up
            player.setVelocityX(-170);
            player.setVelocityY(-200);

            // Hide the rightmost visible life icon
            const visibleIcons = this.lifeIcons.filter(icon => icon.visible);
            if (visibleIcons.length > 0) {
                visibleIcons[visibleIcons.length - 1].setVisible(false);
            }

            // When players looses all lives, start Game over scene
            if (this.lives <= 0) {
                this.music.stop();
                this.scene.start('GameOverScene', {previousScene: 'Level1'});
            }

            // Cool down for getting hurt
            this.time.delayedCall(500, () => {
                this.isHurt = false;
            });
        }
    }

    /**
     * subtractLife
     * Description: Subtracts player life when hurt by enemy birds or the bird with the secret. Plays hiss sounds, knocks player back,
     *              hides a life icon, and sends to the Game Over Screen if all lives lost. Has a 500ms cool down.
     * Inputs:
     *      @param player : this.player
     *      @param bird : this.bird
     * Outputs: None.
     * Called By: Phaser collider detection callback in create()
     * Calls: this.hiss.play(), player.setVelocityX/Y(), this.lifeIcons filter, this.music.stop(), this.scene.start('GameOverScene'),
     *        this.time.delayedCall()
     */
    subtractLife(player, bird) {
        if(!this.isHurt) {
            this.isHurt = true;
            this.lives -= 1;
            this.hiss.play();

            // Knock player opposite to bird's travel direction so they separate instantly
            const knockDir = bird.body.velocity.x >= 0 ? -1 : 1;
            player.setVelocityX(knockDir * 240);
            player.setVelocityY(-150);

            // Hide the rightmost visible life icon
            const visibleIcons = this.lifeIcons.filter(icon => icon.visible);
            if (visibleIcons.length > 0) {
                visibleIcons[visibleIcons.length - 1].setVisible(false);
            }

            // All lives lost goes to GameOverScene
            if (this.lives <= 0) {
                if(this.recipeIcons !== null) this.recipeIcons[0].setAlpha(0.5);
                this.music.stop();
                this.scene.start('GameOverScene', {previousScene: 'Level1'});
            }
            
            // Cool down for getting hurt
            this.time.delayedCall(500, () => {
                this.isHurt = false;
            });
        }
    }

    /**
     * loadLevelPlatforms
     * Description: Creates the static layout of the platforms group in this level. Every platform hardcoded and adds a path to the secret
     * Inputs:
     *      @param thisScene : the current scene
     * Outputs: None. Popultes world as side effect
     * Called By: this.create()
     * Calls: this.createPlatform(), this.createSmallStep(), thisScene.physics.add.staticGroup()
     */
    loadLevelPlatforms(thisScene) {
        thisScene.platforms = thisScene.physics.add.staticGroup();

        this.plat1 = this.createPlatform(0, 970, 0);
        this.plat2 = this.createPlatform(276, 970, 1);
        this.plat3 = this.createPlatform(552, 970, 2);
        this.plat4 = this.createPlatform(828, 970, 3);

        this.createPlatform(1350, 895, 0);
        this.createPlatform(1626, 895, 1);
        this.createPlatform(1902, 895, 2);
        this.createPlatform(2178, 895, 3);
 
        this.createPlatform(2747, 820, 0);
        this.createPlatform(3023, 820, 3);

        this.createPlatform(3575, 820, 0);
        this.createPlatform(3851, 820, 3);

        this.createPlatform(4479, 970, 0);
        this.createPlatform(4755, 970, 1);
        this.createPlatform(5031, 970, 3);

        this.createSmallStep(5583, 970);
        this.createSmallStep(5805, 970);
        this.createSmallStep(6027, 970);

        this.createPlatform(6377, 880, 0);
        this.createPlatform(6653, 880, 1);
        this.createPlatform(6929, 880, 3);

        this.createPlatform(7481, 790, 0);
        this.createPlatform(7757, 790, 3);

        this.createSmallStep(8309, 725);

        this.createPlatform(8859, 970, 0);
        this.createPlatform(9135, 970, 3);

        this.createSmallStep(9135, 903);

        this.createSmallStep(9335, 805);

        this.createSmallStep(9762, 740);

        this.createSmallStep(10140, 675);

        this.createSmallStep(10518, 610);

        this.createSmallStep(10896, 545);

        this.createSmallStep(11274, 480);

        this.createSmallStep(11652, 415);
        this.createSmallStep(11724, 415);

        //Flat section before end
        this.createPlatform(11855, 583, 1);
        this.createPlatform(12131, 583, 2);
        this.createPlatform(12407, 583, 2);
        this.createPlatform(12683, 583, 1);
        this.createPlatform(12959, 583, 2);
        this.createPlatform(13235, 583, 1);
        this.createPlatform(13511, 583, 3);
        

        //Path to secret
        this.createSmallStep(9762, 970);

        this.createSmallStep(10140, 970);

        this.createSmallStep(10518, 970);
        
        this.createSmallStep(10896, 970);

        this.createSmallStep(11274, 970);

        //For bird.
        this.createPlatform(11855, 964, 0);
        this.createSmallStep(11783, 964);
        this.createSmallStep(11711, 964);
        this.createSmallStep(11639, 964);



        this.createPlatform(11855, 710, 1);
        this.createPlatform(11855, 837, 0);//side wall
    }

    /**
     * createPlatform
     * Description: Helper function - creates one standard platform tile at the given position with the specified frame and 
     *              sets it collision body size and offset and returns it
     * Inputs:
     *       @param x : world x position
     *       @param y : world y position
     *       @param frame : which frame from the wall sprite to use
     *       @returns plat: returns the plat object created using this.platforms.create
     * Outputs: plat - created platform object
     * Called By: this.loadLevel1Platforms()
     * Calls: this.platforms.create(), plat.refreshBody(), plat.setSize()
     * 
     */
    createPlatform(x, y, frame) {
        const plat = this.platforms.create(x, y, 'smllPlatform', frame).setOrigin(0, 0);
        plat.refreshBody();
        plat.setSize(276, 127).setOffset(0, 30);
        return plat;
    }

    /**
     * createSmallStep
     * Description: Helper function. Creates one small step platform at the given position,
     *              sets its collision body size and offset, and returns it.
     * Inputs:
     *      @param x : world x position
     *      @param y : world y position
     * Outputs: plat, the plat object created
     * Called By: this.loadLevel1Platforms()
     * Calls: this.platforms.create(), plat.refreshBody(), plat.setSize()
     */
    createSmallStep(x, y) {
        const plat = this.platforms.create(x, y, 'smallStep').setOrigin(0, 0);
        plat.refreshBody();
        plat.setSize(73, 128).setOffset(0, 24);
        return plat;
    }

    /*
     * loadBirds
     * Description: Plays the chirp sound and spawns three flying bird enemies
     *              at different y positions and timings. called once per zone entry. Zones flag themselves as active
     *              so this only fires once per zone.
     * Inputs: None
     * Outputs: None. Schedules bird spawns as side effects
     * Called By: this.update() when player enters birdZone1 or birdZone2
     * Calls: this.chirp.play(), this.spawnBirds(), this.time.delayedCall()
     */
    loadBirds() {
        this.chirp.play();
        this.spawnBirds(0, 800);
        this.time.delayedCall(2000, () => {this.chirp.play(); this.spawnBirds(0, 750)});
        this.time.delayedCall(6000, () => {this.chirp.play();this.spawnBirds(0, 790);});
    }

    /**
     * spawnBirds
     * Description: Spawns one flying bird enemy just off the right edge of the camera, plays its fly animation, moves leftwards, 
     *              and destroys it after 8 seconds once it's well off screen.
     * Inputs:
     *      @param x : world x position
     *      @param y : world y position
     * Outputs: None. Adds a bird to this.birdEnemies and destroys after a couple seconds
     * Called By: this.loadBirds() in update()
     * Calls: this.birdEnemies.create(), bird.play(), bird.setVelocityX(), this.time.delayedCall(), bird.destroy()
     */
    spawnBirds(x, y){
        const xPos = this.cameras.main.scrollX + this.cameras.main.width + 50;
        const bird = this.birdEnemies.create(xPos, y, 'birdFly').setOrigin(0);
        bird.play('birdFly');
        bird.body.allowGravity = false;
        bird.setVelocityX(-250);
        bird.setScale(0.2);
        bird.setImmovable(true);
        this.time.delayedCall(8000, ()=> {
            bird.destroy();
        })
    }


}