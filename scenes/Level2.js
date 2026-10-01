/**
 * Author: Mei Huang
 * Program Name: Level2
 * Description: Chapter 2 - The Quiet Bog. Player spawns fresh with three hearts again. Lily pads fall after a short delay and after shaking a bit when the player lands on them,
 *              Frogs bound up and down as enemies and knocks the player back on contact and suctracts a life. Secret: stand on the special lily pad (slightly larger than normal
 *              lily pads. It's the right right before the sleeping frog) long enough and the brother frog will hop aside and reveal the secret piece on the stump. Recipe only
 *              saves to registry once the player interacts with the drone npc at the very end.
 * Inputs: None
 * Outputs: None. Transisitions to either Level3, Ending cutScenes, MenuScene, or GameOverScene.
 * Called By: Level1, MenuScene, GameOverScene.
 * Calls: Level3, GoodCutScene, MenuScene, GameOverScene, Player
 */

class Level2 extends Phaser.Scene {
    /**
     * constructor
     * Description: Registers this scene with Phaser as the key 'Level2'
     * Inputs: None
     * Outputs: None
     * Called By: Phaser game when the game config is processed
     * Calls: super()
     */
    constructor() {
        super({key: 'Level2'});
    }

    /**
     * preload
     * Description: Creates all the audio objects for this level before the scene starts. Most assets are already loaded by BootScene. Only the sound objects that need to exist
     *              before create() runs.
     * Inputs: None
     * Outputs: None. Creates references to each sound.
     * Called By: Phaser engine before create()
     * Calls: this.sound.add()
     */
    preload() {
        // All audio files
        this.music = this.sound.add('level2Song', {volume: 0, loop: true});
        this.hiss = this.sound.add('hiss', {volume: 1.3, loop: false});
        this.catFall = this.sound.add('fall', {volume: 0.7, loop: false});
        this.croak = this.sound.add('croak', {volume: 0.3, loop: false});
        this.rustle = this.sound.add('rustle', {volume: 0.5, loop: false});
        this.pickup = this.sound.add('pickup', { volume: 0.6, loop: false});  
        this.brotherJumpSound = this.sound.add('brotherJump', { volume: 0.5, loop: false});  
    }
    
    /**
     * create
     * Description: Builds the full level. All variables, home icon, world bounds, fade in, music, backgrouds, player, camera, frog zones, all nps (willow, brother, stump, drone, 
     *              city house), dialogue, platforms, lily pads, frog enemies, colliders, and the HUD. Recipe icons only appear on second playthrough.
     * Inputs: None. Reads from registry
     * Outputs: None. Builds all necessary objects for the level
     * Called By: Phaser engine
     * Calls: this.loadPlatforms(), this.checkRecipes(), Player constructor, this.physics.add.collider/overlap(), this.add.text/image/rectangle(), this.tweens.add(), 
     *        this.time.delayedCall(), this.sound.add()
     */
    create() {
        // Instantiate all varaibles
        this.lives = 3;
        this.isHurt = false;
        this.overlapping = false;
        this.worldWidth = 13440;
        this.worldHeight = 1080;
        this.isFalling = false;
        this.isRiding = false;
        this.stayed = false;
        this.recipeIcons = null;
        this.willowTalking = false;
        this.droneTalking = false;

         // HUD set up for hearts
         this.add.text(1620, 18, 'Lives:', {
            fontSize: '26px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setScrollFactor(0).setDepth(200);

        // Three life icons stored in an array so we can hide them on each hit
        this.lifeIcons = [];
        for (let i = 0; i < 3; i++) {
            const icon = this.add.image(1720 + (i * 55), 32, 'lives')
                .setScrollFactor(0)
                .setDepth(200)
                .setScale(0.5);
            this.lifeIcons.push(icon);
        }

        // HUD for the recipes after the first play through
         if(!this.registry.get('secrets').firstPlay) {
            this.add.text(1330, 18, 'Recipes:', {
                        fontSize: '26px',
                        fill: '#ffffff',
                        fontFamily: 'Arial',
                        stroke: '#000000',
                        strokeThickness: 4
                    }).setScrollFactor(0).setDepth(200);

            // Adding icons to show which pieces have been collected for the recipes
            this.recipeIcons = [];
            for (let i = 0; i < 3; i++) {
                const icon = this.add.image(1470 + (i * 50), 32, 'p1')
                    .setScrollFactor(0)
                    .setDepth(200)
                    .setScale(1.7)
                    .setAlpha(0.5);
                this.recipeIcons.push(icon);
            }

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

        // Fade into level
        const fadeRect = this.add.rectangle(0, 0, 1920, 1080, 0x000000).setAlpha(1).setOrigin(0).setDepth(1);
        this.tweens.add({
            targets: fadeRect,
            alpha: 0,
            duration: 3000,
            onComplete: () => {fadeRect.destroy(); }
        });

        //Title
        this.title = this.add.text(960, 514, "Chp 2: The Quiet Bog", {fontSize: '45px', fill: '#000000'}).setOrigin(0.5).setDepth(1);
        this.time.delayedCall(3000, ()=> {
            this.title.setVisible(false);
        });

        // Start music fade in for level
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
        this.farBg = this.add.tileSprite(0, 0, this.worldWidth, 1080, 'level2FarBg').setOrigin(0);
        this.midBg = this.add.tileSprite(0, 0, this.worldWidth, 1080, 'level2MidBg').setOrigin(0);

        // Add swamp house to the beginning of the map
        this.startHouse = this.add.image(-120, 650, 'checkpoint').setOrigin(0);
        this.startHouse.setScale(0.5);

        //Add checkpoint house and end of level npc
        this.cityHouse = this.add.image(13006, 220, 'cityH').setOrigin(0);
        this.cityHouse.setScale(0.7);
        this.drone = this.physics.add.image(12806, 270, 'drone').setOrigin(0);
        this.drone.setImmovable(true);
        this.drone.setSize(144, 320).setOffset(10, 15);
        this.drone.body.allowGravity = false;

        // Choose which player sprite to display depending on the game state
        if(this.registry.get('secrets').firstPlay) {
            this.player = new PlayerA2(this, 38, 870, 'playerNoB').setOrigin(0, 0).setDepth(0.5);
        }else {
            this.player = new PlayerA2(this, 38, 870, 'player').setOrigin(0, 0).setDepth(0.5);
        }

        // Spawn player
        this.player.refreshBody();
        this.player.setSize(66, 35, true).setOffset(0, 8); 
        this.player.postFX.addGlow(0x6c9d72, 8, 0, false, 0.1, 10);

        // Make the camera follow the player
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.startFollow(this.player);

        // Setting up cursor keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.cursors.keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);

        // Call load platforms to build the map
        this.loadPlatforms(this);

        // Load stump that secret piece is on
        this.stump = this.physics.add.image(9689, 595, 'stump').setOrigin(0);
        this.stump.setImmovable(true);
        this.stump.setSize(94, 59).setOffset(34, 12);
        this.stump.setScale(1.2);
        this.stump.body.allowGravity = false;

        // Set up secret recipe piece
        this.recipe = this.physics.add.image(9780, 575, 'p2').setOrigin(0);
        this.recipe.setImmovable(true);
        this.recipe.postFX.addGlow(0xFFD000, 2, 0, false, 0.1, 7);
        this.recipe.setScale(1.2);
        this.recipe.body.allowGravity = false;
        this.recipe.body.enable = false;

        // Load brother that hides the secret piece
        this.brotherNpc = this.physics.add.sprite(9760, 540, 'brother').setOrigin(0);
        this.brotherNpc.setScale(0.5);
        this.brotherNpc.setImmovable(true);
        this.brotherNpc.setSize(130, 104).setOffset(0, 31);
        this.brotherNpc.body.allowGravity = false;
        this.brotherNpc.body.enable = false;
        
        // Load brother animation
        if (!this.anims.exists('brother')) {
            this.anims.create({
                key: 'brother',
                frames: [
                    { key: 'brother', frame: 0, duration: 500 },
                    { key: 'brother', frame: 1, duration: 500 }
                ],
                frameRate: 4,
                repeat: -1
            });
        }
        // Starting brother animation
        this.brotherNpc.play('brother');

        // Load willow at mid point
        this.wisp = this.physics.add.sprite(7200, 595, 'willow').setOrigin(0);
        this.wisp.setImmovable(true);
        this.wisp.setSize(86, 151, true).setOffset(0, 0);
        this.wisp.body.allowGravity = false;

        // Universal dialogue bubbles (...) for all npcs, willow and drone
        this.diaBubble = this.add.image(7165, 595, 'dialogue').setOrigin(0);
        this.diaBubble.setScale(0.07);
        this.diaBubble.toggleFlipX();

        this.bubble = this.add.image(12735, 255, 'dialogue').setOrigin(0);
        this.bubble.setScale(0.07);
        this.bubble.toggleFlipX();

        // Speeches bubbles for all npcs, willow, brother, and drone respectively
        this.speechWill = this.add.image(6940, 500, 'speech').setOrigin(0); // Willow speech bubble
        this.speechWill.setScale(0.4);
        this.speechWill.toggleFlipX();
        this.speechWill.setVisible(false);

        this.speechBrother = this.add.image(9370, 470, 'speech').setOrigin(0); // Brother speech bubble 
        this.speechBrother.setScale(0.4);
        this.speechBrother.toggleFlipX();
        this.speechBrother.setVisible(false);

        this.speechDrone = this.add.image(12506, 200, 'speech').setOrigin(0); // Drone speech bubble
        this.speechDrone.setScale(0.4);
        this.speechDrone.toggleFlipX();
        this.speechDrone.setVisible(false);

        // Loading correct npc dialogues for first play, versus second play. Only willow is different.
        this.dialugues = this.cache.json.get('dia');
        this.willowLines = this.dialugues.willow;
        this.brotherLines = this.dialugues.brother;
        this.droneLine = this.dialugues.drone.default;

        // Brother line
        this.brotherText = this.add.text(9480, 520, this.brotherLines.default, {
                fontSize: '15px', 
                fill: '#1b1212', 
                wordWrap: {width: 225}}).setOrigin(0.5).setDepth(1);

        // Set invisible until player discovers secret        
        this.brotherText.setVisible(false);

        // Willow lines
        if(this.registry.get('secrets').firstPlay) {
            this.speechText = this.add.text(7060, 550, this.willowLines.default, {
                fontSize: '15px', 
                fill: '#1b1212', 
                wordWrap: {width: 225}}).setOrigin(0.5).setDepth(1);
        }else{
            this.speechText = this.add.text(7060, 555, this.willowLines.secret, {
                fontSize: '15px', 
                fill: '#1b1212', 
                wordWrap: {width: 225}}).setOrigin(0.5).setDepth(1);
        }
        this.speechText.setVisible(false);

        // Drone line
        this.speechTextD = this.add.text(12623, 255, this.droneLine, {
            fontSize: '15px', 
            fill: '#1b1212', 
            wordWrap: {width: 225}}).setOrigin(0.5).setDepth(1);

        this.speechTextD.setVisible(false);

        // Adding croak zones for enemy frogs
        this.frogZone2 = this.add.zone(9592, 0, 1803, 1080).setOrigin(0);
        this.physics.add.existing(this.frogZone2, true);
        this.frogZone2Active = false;
        this.frogZone1 = this.add.zone(4048, 0, 2066, 1080).setOrigin(0);
        this.physics.add.existing(this.frogZone1, true);
        this.frogZone1Active = false;

        // Adding level texts
        this.add.text(1792, 800, "Tread lightly — lily pads crumble beneath you", {fontSize: '23px', fill: '#ffffff'}).setOrigin(0.5);
        this.add.text(4023, 800, "Watch the frogs' rhythm before you leap", {fontSize: '23px', fill: '#ffffff'}).setOrigin(0);

        // Collisions / overlaps
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.lilypads, this.lilyTiming, null, this);
        this.physics.add.collider(this.frogEnemies, this.lilypads, null, null, this);
        this.physics.add.overlap(this.player, this.frogEnemies, this.subtractHearts, null, this);
        this.physics.add.collider(this.player, this.stump, null, null, this);
        this.physics.add.collider(this.player, this.brotherNpc, null, null, this);
        this.physics.add.collider(this.player, this.recipe, this.collectPiece, null, this);
    }

    /**
     * udpate
     * Description: Runs every frame. Updates player, scrolls parallax backgrounds, checks for all death, updates the frog zone active 
     *              flags, and handles M key interactions with the willow npc, and the drone npc. The frone interaction also commits
     *              the recipe and triggers the level transition.
     * Inputs: None. Read from registry
     * Outputs: None. Triggers events, moves player, scrolls background as side effect
     * Called By: Phaser engine
     * Calls: this.player.update(), this.catFall.play(), this.music.stop(), this.scene.restart/start(), this.tweens.add(), 
     *        this.time.delayedcall()
     */

    update() {

        // Set just pressed M 
        const justPressedM = Phaser.Input.Keyboard.JustDown(this.cursors.keyM);
        // Update player
        this.player.update(this.cursors, this.isHurt || this.isFalling || this.isRiding, this, justPressedM);

        // Overlap with frog zones
        if (this.physics.overlap(this.player, this.frogZone1)) {
            this.frogZone1Active = true;
        } else {
            this.frogZone1Active = false;
        }

        if (this.physics.overlap(this.player, this.frogZone2)) {
            this.frogZone2Active = true;
        } else {
            this.frogZone2Active = false;
        }



        // Parallax scrolling
        this.farBg.tilePositionX = this.cameras.main.scrollX * 0.01;
        this.midBg.tilePositionX = this.cameras.main.scrollX * 0.2;

        // Just pressed M interactions
        if(justPressedM) {
            //If player closer enough to willow and press M, show speech and text bubble
            const disWillow = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.wisp.x, this.wisp.y);
            if(disWillow < 200 && !this.willowTalking) {
                this.willowTalking = true;
                this.speechWill.setVisible(true);
                this.speechText.setVisible(true);
                this.diaBubble.setVisible(false);

                // Set back to invisible after 6 seconds
                this.time.delayedCall(6000, () => {
                    this.speechWill.setVisible(false);
                    this.speechText.setVisible(false);
                    this.diaBubble.setVisible(true);
                    this.willowTalking = false;
                });
            }
            
            //If player closer enough to drone and press M, show speech and text bubble
            const disDrone = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.drone.x, this.drone.y);
            if(disDrone < 400 && !this.droneTalking) {
                this.droneTalking = true;
                
                this.speechDrone.setVisible(true);
                this.speechTextD.setVisible(true);
                this.bubble.setVisible(false);

                // Set back to invisible after 6 seconds and transition to next scene after saving recipe info
                this.time.delayedCall(6000, () => {
                    this.fadeRect = this.add.rectangle(0, 0, 1920, 1080, 0x000000).setAlpha(0).setOrigin(0).setDepth(999).setScrollFactor(0);
                    this.speechDrone.setVisible(false);
                    this.speechTextD.setVisible(false);
                    this.bubble.setVisible(true);          

                    // Fade out music and screen together
                    this.tweens.add({
                        targets: this.music,
                        volume: 0,
                        duration: 1500
                    });
                    this.tweens.add({
                        targets: this.fadeRect,
                        alpha: 1,
                        duration: 1500,
                        onComplete: () => {
                            // commit recipe to registry if they got it this run
                            if(this.hasRecipe) {
                                this.registry.get('secrets').level2 = true;
                            }
                            this.fadeRect.destroy();
                            this.music.stop();
                            // Checks if it's not their first playthrough and transitions to correct ending if all recipes collected
                            const registry = this.registry.get('secrets');
                            if(!this.registry.get('secrets').firstPlay) {
                                // second playthrough — check if they now have everything
                                if(registry.level1 && registry.level2 && registry.level3){
                                    registry.collectAll = true;
                                    this.scene.start('GoodCutScene');
                                }else{
                                    this.scene.start('MenuScene');
                                }
                            }else {
                                // First playthrough, go to level3
                                this.scene.start('Level3');
                            }
                        }
                    });
                });
            }
        }

        // Falling to death
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

        // Check if player already collected the recipe for all levels. Sets alpha accordingly.
        const registry = this.registry.get('secrets');
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
     * collectPiece
     * Description: Called when the player collects/touches the recipe piece after solving the puzzle. Sets a flag so that it sets the recipe
     *              this.hasRecipe. Changes the opacity if the piece has not already been collected. Plays the collection sound and destroys
     *              the recipe.
     * Inputs: 
     *      @param player : the player sprite
     *      @param piece : the recipe piece being collected
     * Outputs: None. Sets hasRecipe, updates icon, plays, sound, destroys piece as side effect.
     * Called By: Phaser collision callback
     * Calls: this.pickup.play(), piece.destroy(), this.recipeIcons[1].setAlpha(1)
     */
    collectPiece(player, piece) {
        this.hasRecipe = true;
        if(this.recipeIcons !== null) this.recipeIcons[1].setAlpha(1);
        this.pickup.play();
        piece.destroy();
    }

    /**
     * loadPlatforms
     * Description: Sets up the proper physics group for each type of platform, platforms and lilypads. Calls helper functions to create the
     *              world map. Calling platform creations, lily pads, and enemies placement.
     * Inputs:
     *      @param thisScene : reference to this level scene
     * Outputs: None. Populates the world as side effect
     * Called By: this.create
     * Calls: this.createPlatform(), this.createSmallPlatform(), this.createLilly(), this.createFrogs()
     */
    loadPlatforms(thisScene) {
        thisScene.platforms = thisScene.physics.add.staticGroup();
        thisScene.lilypads = thisScene.physics.add.staticGroup();
        thisScene.frogEnemies = thisScene.physics.add.group();

        this.createPlatform(-35, 770);

        this.createPlatform(1230, 850);

        this.createLilly(2600, 1030);
        this.createLilly(3104, 1030);
        this.createLilly(3608, 1030);

        this.createSmallPlatform(4046, 880);
        
        this.createFrogs(4510, 995, 390);
        this.createLilly(4480, 1040).frogFloor = true;

        this.createPlatform(4700, 810);

        this.createFrogs(5875, 995, 400);
        this.createLilly(5845, 1040).frogFloor = true;

        this.createSmallPlatform(6100, 880);

        this.createLilly(6568, 930);
        this.createLilly(6780, 840);
        this.createSmallPlatform(6977, 610);

        this.createLilly(7440, 1030);
        this.createLilly(7900, 1030);

        this.createLilly(8320, 945);
        this.createLilly(8730, 860);
        this.createLilly(9145, 770, true);

        this.createSmallPlatform(9544, 540);

        this.createFrogs(10026, 995, 700);
        this.createLilly(9996, 1040).frogFloor = true;

        this.createLilly(10241, 660);
        this.createLilly(10701, 660);

        this.createFrogs(10951, 995, 700);
        this.createLilly(10921, 1040).frogFloor = true;
        
        this.createSmallPlatform(11166, 540);

        this.createLilly(11676, 590);
        this.createLilly(12086, 505);

        this.createSmallPlatform(12596, 455);
        this.createPlatform(12886, 449);

    }

    /**
     * createPlatform
     * Description: Helper function. Creates one standard platorm at the given position, sets its collision body size and offset, and returns it.
     * Inputs: 
     *      @param x : world x position
     *      @param y : world y position
     * Outputs: plat : the platform object created
     * Called By: this.loadPlatforms()
     * Calls: this.platforms.create(), plat.refreshBody(), plat.setSize()
     */
    createPlatform(x, y) {
        const plat = this.platforms.create(x, y, 'level2Platform').setOrigin(0, 0).setDepth(1);
        plat.refreshBody();
        plat.setScale(1);
        plat.setSize(971, 86).setOffset(0, 146);
        return plat;
    }

    /**
     * createSmallPlatform
     * Description: Helper function. Creates one standard small platform at the given position, sets its collision body size and offset, 
     *              and returns it.
     * Inputs:
     *      @param x : world x position
     *      @param y : world y position
     * Outputs: plat : the small platform object created
     * Called By: this.loadPlatforms()
     * Calls: this.platforms.create(), plat.refreshBody(), plat.setSize()
     */
    createSmallPlatform(x, y) {
        const plat = this.platforms.create(x, y, 'level2SmllPlt').setOrigin(0, 0);
        plat.refreshBody();
        plat.setSize(306, 101).setOffset(0, 139);
        return plat;
    }

    
    /**
     * createLilly
     * Description: Helper function. Creates one lily pad at the specified position. If the lily pad is special (for the secret), a special
     *              flag is set. Scales the body of the lily and then returns it.
     * Inputs:
     *      @param x : world x position
     *      @param y : world y position
     * Outputs: lily object, flagged as special if it is special
     * Called By: loadPlatforms()
     * Calls: this.lilypads.create(), lily.refreshBody(), lily.setScale(), lily.setSize()
     */
    createLilly(x, y, special) {
        const lily = this.lilypads.create(x, y, 'lilyPad').setOrigin(0, 0);
        lily.refreshBody();
        lily.setScale(0.7);
        lily.setSize(104, 34);
        
        // If special lily, set as special
        if(special) {lily.special = true; lily.setScale(0.76);}

        return lily;
    }
    
    /**
     * lilyTiming
     * Description: Called each frame the player is colliding with the lily pad. Guards against if the frog enemies uses it as a floor tile.
     *              If player steps on lily pad to try and get accross that is allowed since its clever to use that as a platform as well,
     *              still requires timing. Plays a shaking sound to warn the player its about to fall. After triggering the lily, after
     *              couple seconds it triggers the lily to fall and will respawn after couple seconds.
     * Inputs: 
     *      @param player : the player sprite
     *      @param lilypad : the lily pad that is triggered
     * Outputs: None. Sets lily pad, disables and re-enables body, tweens, plays and sound
     * Called By: Phaser on callback when collision detected
     * Calls: this.onSpecialLilyStand(), this.rustle.play(), this.tweens.add(), this.time.delayedCall(), lilypad.body.enable, 
     *        lilypad.setVisible(), lilypad.refreshBody()
     */
    lilyTiming(player, lilypad) {

        // If the frog is on it return or if the lily pad had already been triggered
        if (lilypad.frogFloor) return; 
        if (lilypad.triggered) return;
        lilypad.triggered = true;
        

        // Shake warning on landing
        this.time.delayedCall(100, () => {
            const originalX = lilypad.x;
            this.tweens.add({
                targets: lilypad,
                x: lilypad.x + 6,
                duration: 60,
                yoyo: true,
                repeat: 5,
                onComplete: () => {
                    lilypad.x = originalX;
                    lilypad.refreshBody();
                }
            });
        });

        // Play the sound when it's about to fall
        this.time.delayedCall(400, () => {
            this.rustle.play();
        });

        // If it's the special lily check if players stands on it long enough
        if (lilypad.special) {

            // Wait 3 seconds. If player is still on it, call the special function
            this.time.delayedCall(900, () => {
                const dist = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y, lilypad.x, lilypad.y
                );

                if (dist < 100) {
                    // Player stayed on lilypad, call the special function to deal with it
                    this.onSpecialLilyStand(lilypad);
                } else {
                    // Player jumped off early, fall like normal
                    lilypad.body.enable = false;
                    lilypad.setVisible(false);
                    this.time.delayedCall(5000, () => {
                        lilypad.setVisible(true);
                        lilypad.body.enable = true;
                        lilypad.refreshBody();
                        lilypad.triggered = false;
                    });
                }
            });

        } else {
            // Normal lily pad reaction, falls after 800ms
            this.time.delayedCall(800, () => {
                lilypad.special = false;
                lilypad.body.enable = false;
                lilypad.setVisible(false);
            });

            // Reset the lily pad and respawn it
            this.time.delayedCall(5800, () => {
                lilypad.setVisible(true);
                lilypad.body.enable = true;
                lilypad.refreshBody();
                lilypad.triggered = false;
            });
        }
    }
    
    /**
     * onSpecialLilyStand
     * Description: Triggers the secret reveal. Moving the brother frog and showing his speech and revealing the secret 
     *              piece on the stump. After 6 seconds speech disappears and the special lily gets reset, prevents from
     *              running more than once per session.
     * Inputs: 
     *      @param lilypad : reference to the special lily player is standing on
     * Outputs: None. Moves brother npc, enables recipe body, shows dialogue and resets lily as side effect
     * Called By: this.lilyTiming()
     * Calls: this.tweens.add(), this.brotherText.setVisible(), this.speechBrother.setVisible(), this.time.delayedCall(),
     *        this.brotherJump.remove()
     */
    onSpecialLilyStand(lilypad) {

        // Resets in create so player can trigger on each run once
        if(this.stayed) return; 
        this.stayed = true;

        // Move brother frog to reveal secret
        this.brotherNpc.body.enable = false;
        this.recipe.body.enable = true;
        
        // Move the brother to reveal the piece
        this.brotherJumpSound.play();
        this.brotherJump = this.tweens.add({
            targets: this.brotherNpc,
            x: this.brotherNpc.x + -150,
            y: this.brotherNpc.y + 70,
            duration: 400,
            onComplete: () => {
                // Show the speech bubble and speech 
                this.brotherText.setVisible(true);
                this.speechBrother.setVisible(true);
                this.time.delayedCall(6000, () => {
                    this.brotherText.setVisible(false);
                    this.speechBrother.setVisible(false);
                });
                this.brotherJump.remove();
            }
        });

        // Reset lily after a delay so it can be triggered again normally
        this.time.delayedCall(5000, () => {
            lilypad.triggered = false;
        });
    }

    /**
     * createFrogs
     * Description: Creates one frog enemy at the given position with the given jump velocity, gives it gravity and world bounds
     *              collision, then sets up a repeating 1.5s timer that makes it jump whenever it's touching the ground. Plays
     *              croak sound when jumping if the player is inside croak zone.
     * Inputs: 
     *      @param x : world x position
     *      @param y : world y positon
     *      @param velocity : the frogs y velocity
     * Outputs: None. Adds frog to frogEnemies and sets up loop timer for jumps
     * Called By: this.loadPlatforms()
     * Calls: this.frogEnemies(), frogs.setScale/setSize/setCollierWorldBounds(), frogs.setGravityY(), this.time.addEvent(),
     *        frogs.setVelocityY(), this.croak.play()
     */
    createFrogs(x, y, velocity) {

        // Create enemy object and set scale, size, collider bounds, gravity and immovable if player touches it
        const frogs = this.frogEnemies.create(x, y, 'frogEne').setOrigin(0, 0);
        frogs.setScale(0.7);
        frogs.setSize(69, 45)
        frogs.setCollideWorldBounds(true);
        frogs.setImmovable(false);
        frogs.setGravityY(400);

        // Slight delay before frogs jump again
        this.time.addEvent({
            delay: 1500,
            loop: true,
            callback: () => {

                // Only jump if frog is actually standing on something.
                if (frogs.body.blocked.down) {
                    frogs.setVelocityY(-velocity);
                    if(this.frogZone1Active || this.frogZone2Active) {
                        this.croak.play();
                    }
                }

            }
        });
    }

    /**
     * subtractHearts
     * Description: Handles overlap with frog enemies. Uses enemy.triggered as a guard against triggering subtract hearts over and over again.
     *              Deducts a life, plays hiss sound, knocks player back, hides a life icon, and sends to GameOverScene if all lives lost.
     * Inputs:
     *      @param player : reference to the player
     *      @param enemy : frog the player hit
     * Outputs: None.
     * Called By: Phaser collision callback
     * Calls: this.hiss.play(), player.setVelocityX/Y(), this.lifeIcons filter, this.music.stop(), this.scene.start('GameOverScene'),
     *        this.time.delayedCall()
     */
    subtractHearts(player, enemy) {
        // Guard against continuous triggers, plays the hiss sound and subtracts a life
        if(enemy.triggered) return;
        enemy.triggered = true;
        this.isHurt = true; 
        this.lives -= 1;
        this.hiss.play();

        // Knockback from enemy
        const knockDir = player.x < enemy.x ? -1 : 1;
        player.setVelocityX(knockDir * 200);
        player.setVelocityY(-100);

        // Hide the rightmost visible life icon
        const visibleIcons = this.lifeIcons.filter(icon => icon.visible);
        if (visibleIcons.length > 0) {
            visibleIcons[visibleIcons.length - 1].setVisible(false);
        }

        // Transition to game over if all lives lost
        if (this.lives <= 0) {
            if(this.recipeIcons !== null) this.recipeIcons[1].setAlpha(0.5);
            this.music.stop();
            this.scene.start('GameOverScene', {previousScene: 'Level2'});
        }
        
        // Enemy can hurt player again after a whole 1second
        this.time.delayedCall(1000, () => {
            this.isHurt = false;
            enemy.triggered = false;
        });
    }


}