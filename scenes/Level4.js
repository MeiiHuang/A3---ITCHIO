/**
 * Author: Mei Huang
 * Program Name: Level4
 * Description: Chapter 4. The player starts locked in a suspended cage and must swing it hard enough to break free. From there they navigate a large multi-room
 *              facility, solving puzzles to progress. Puzzles include: cutting an electrical wire with clippers they can pick up to open the first door, using
 *              a keycard on a terminal to open the next set of doors, disposing garbage to reveal a scent trail, following scent trails to open vents as a dog
 *              and using cat form to go through the vents, and entering button sequence to trigger the crane and scene. A jumpscare mid-level forces the player
 *              morph into a dog to realize players can morph. A secret reverse button sequence unlocks a hidden antidote collectible. The guard patrols the exit
 *              and will shoo the player away depending on their current form. Completing the level routes the player to one of the three endings based on how
 *              many antidotes they've collected. The level will route to level 5 if it's the players play through.
 * Inputs: None. Reads from registry.get('secrets') for firstDLC flag and antidote collection states.
 * Outputs: None. Transitions to Level5, TrueEnding, MidEnding, or MenuScene on completion depending on the registry flags
 * Called By: Level3.startNextScene()
 * Calls: Level5, TrueEnding, MidEnding, MenuScene, Player, Item
 */
class Level4 extends Phaser.Scene {
    /**
     * constructor
     * Description: Registers this scene with Phaser under the key 'Level4'
     * Inputs: None
     * Outputs: None
     * Called By: Phaser game when the game config is processed
     * Calls: super()
     */
    constructor() {
        super({key: 'Level4'});
    }

    /**
     * preload
     * Description: Creates all the sound cues ready for the level. Specific for Level4.
     * Inputs: None
     * Outputs: None. Creates all sound obejects ready to use as a side effect
     * Called By: Phaser engine before create()
     * Calls: this.sound.add(), this.sound.play()
     */
    preload() {
        // Add all audios here
        this.thud = this.sound.add('thud', {volume: 1, loop: false});
        this.wrong = this.sound.add('wrong', {volume: 1, loop: false});
        this.correctSeq = this.sound.add('correct', {volume: 1, loop: false});
        this.press = this.sound.add('press', {volume: 0.8, loop: false});

        //cage sequence
        this.metalChain = this.sound.add('chains', {volume: 0.01, loop: true});
        this.cageCreak = this.sound.add('cageCreak', {volume: 0.01, loop: true});
        this.metalBreak = this.sound.add('metalBreak', {volume: 1, loop: false});
        //this.metalChain.play();
        this.cageCreak.play({ volume: 0 });
        this.doorOpenSound = this.sound.add('doorOpen', {volume: 1, loop: false});
        this.chuteDoor = this.sound.add('chuteDoor', {volume: 1, loop: false});
        this.alarm = this.sound.add('alarm', {volume: 1, loop: true});
        this.pickup = this.sound.add('pickupSound', {volume: 1, loop: false});
        this.textsound = this.sound.add('textSound', {volume: 1, loop: false});
        this.diaBoxSound = this.sound.add('diaBox', {volume: 1, loop: false});
        this.whiteSound = this.sound.add('whiteSound', {volume: 1, loop: true});
        this.whiteSound.play();
        this.antiPickup = this.sound.add('antiPickup', {volume: 1, loop: false});
        this.openAnti = this.sound.add('openAnti', {volume: 1, loop: false});
        this.openVent = this.sound.add('openVent', {volume: 1, loop: false});
        this.craneMove = this.sound.add('craneSol', {volume: 1, loop: false});
    }

    /**
     * create
     * Description: Builds Level 4 in full. Initializing all scene variables, spawns the player inside the starting cage, places all items in the world,
     *              adds zones, NPCs, platforms, doors, and vents. Sets up all physics collider/overlaps, creates all animations, configures the camera, 
     *              hint system, inventory HUD, antidoes HUD, sequence puzzles, and triggers the opening fade-in and chapter title sequence.          
     * Inputs: None
     * Outputs: None. Builds Level 4
     * Called By: Phaser engine 
     * Calls: this.createPlatforms(), this.createDoors(), this.checkAnti(), Player constructor, this.physics.add.collider/overlap(), this.physics.world.setBounds(),
     *        this.physics.world.enable(), this.add.text/rectangle/image/sprite/zone(), this.tweens.add(), this.time.delayedCall(), this.anims.create(),
     *        this.cameras.main.setBounds(), this.cameras.main.startFollow(), this.cameras.maind.setZoom(), this.input.keyboard.createCursorKeys(), Item contructor
     */
    create() {
        // Instantiate all variables
        this.physics.world.bodies.clear();
        this.physics.world.staticBodies.clear();
        
        this.worldWidth = 20952;
        this.worldHeight = 2664;
        this.isHurt = false;
        this.isFalling = false;
        this.currItem = null;
        this.currItemPickupable = false;
        this.inCage = true;
        this.momentum = 0;
        this.currOverlapping = false;
        this.ventCoverOverlap = false;
        this.secondCoverOverlap = false;
        this.scentRevealed = false;
        this.correct = true;
        this.canPress = true;
        this.branching = false;
        this.disposedGarbage = false;
        this.guardSequence = false;

        this.currZone = null;
        this.canMorph = true;
        this.setNoMorph = false;
        this.findVent = false;

        this.tryingSecondSequence = false;

        this.gotFirstSequence = false;
        this.gotSecondSequence = false;

        this.deletedBtns = false;

        this.lastSwing = 'left';

        this.notStopped = false;
        this.cranePlayed = false;

        this.showHint = false;

        this.cageBreaking = false;

        this.nextScene = false;
        this.playedScare = false;
        this.showedSequence = false;
        this.handledShoo = false;
        this.handledFirstVent = false;
        this.handledSecondVent = false;
        this.swinging = false;
        this.checkingSequence = false;
        this.doneSecretSequence = false;
        this.isLocked = false;
        this.stillShowingText = false;

        this.tempItem = null;
        this.fPrompt = null;
        this.ePrompt = null;
        this.ePromptVent = null;
        this.diaBox = null;
        this.guardText = null;
        this.droppedItem = null;
        this.idleSway = null;

        this.redRect = null;

        //HUD for the antitodes for when players play the game a second time
        this.dataText = this.cache.json.get('items');
        this.antiIcons = [];
        if(!this.registry.get('secrets').firstDLC) {
            // Home button
            this.home = this.add.image(-600, -350, 'DLCHome').setOrigin(0).setDepth(999).setScrollFactor(0).setScale(0.5)
                .setInteractive().on('pointerdown', () => {
                    this.scene.start('MenuScene');
                    this.cageCreak.stop();
                    this.whiteSound.stop();
                    this.alarm.stop();
                });
            this.home.on('pointerover', () => {this.home.setScale(0.56); this.diaBoxSound.play();});
            this.home.on('pointerout', () => {this.home.setScale(0.5)});

            this.add.text(-500, -340, 'Antidotes:', {
                fontSize: '26px',
                fill: '#5580d0',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 4
            }).setScrollFactor(0).setDepth(200);

            // Adding icons to an array for setting the alpha later when pieces get collected.
            this.antis = [
                'anti1',
                'anti2',
                'anti3'
            ]
            
            this.antis = ['anti1', 'anti2', 'anti3'];
            this.antiIcons = [];
            this.antis.forEach((antiNames, i) => {
                const icon = this.add.image(-350 + (i * 50), -320, antiNames)
                    .setScrollFactor(0)
                    .setDepth(200)
                    .setScale(1.3)
                    .setAlpha(0.3);
                
                this.antiIcons.push(icon);
            });

            // Check if players have any previously collected antidotes and set the alpha accordingly
            this.checkAnti();

        }

        // Adding hint system: the button to show/hide the hints, and the hint covers
        this.hint = this.add.image(2380, -250, 'hint')
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(997)
            .setInteractive()
            .on('pointerdown', () => this.handleShowHint())
            .setScale(1.1)
            .setAlpha(0); //setAlpha in the beginning
        this.hint.setInteractive().on('pointerover', () => {this.hint.setScale(1.15); this.diaBoxSound.play();});
        this.hint.setInteractive().on('pointerout', () => {this.hint.setScale(1.1);});

        // Hint panel
        this.hintPanel = this.add.image(1838, -215, 'hintPanel').setOrigin(0).setScrollFactor(0).setDepth(996).setVisible(false).setScale(1.3);

        // Hint covers + text
        console.log(this.dataText.hints.level4);
        if(this.registry.get('secrets').firstDLC) {
            this.hintArray = this.dataText.hints.level4;
        }else {
            this.hintArray = this.dataText.hints2.level4;
        }
        this.hintTexts = [];
        this.hintCovers = [];
        let currentY = this.hintPanel.y + 155;
        Object.values(this.hintArray).forEach(hint => {
            const hintsText = this.add.text(this.hintPanel.x + 50, currentY, hint, {
                fontSize: '17px',
                fill: '#ffffff',
                wordWrap: {width: 350}
            }).setScrollFactor(0).setDepth(997).setVisible(false).setScale(1.3);
            this.hintTexts.push(hintsText);

            // Adding hint covers as well + setting interactives
            const currCover = this.add.image(this.hintPanel.x + 50, currentY, 'hintCover')
                .setOrigin(0)
                .setScrollFactor(0)
                .setDepth(999)
                .setInteractive()
                .on('pointerdown', () => this.handleRemoveCover(currCover)).setVisible(false).setScale(1.3);
            currCover.setInteractive().on('pointerover', () => {currCover.setScale(1.34); this.diaBoxSound.play();});
            currCover.setInteractive().on('pointerout', () => {currCover.setScale(1.3)});
            this.hintCovers.push(currCover);
            // Hint spacing
            currentY += 102;
        });


        // Create world bounds
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
        // All set to true, player can't fall through
        this.physics.world.setBoundsCollision(true, true, true, true);

        // Adding level 4 background/layout
        this.level4Layout = this.add.image(0, 0, 'level4bg1').setOrigin(0).setAlpha(0);
        this.lebel4Layout2 = this.add.image(11001, 0, 'level4bg2').setOrigin(0).setAlpha(0);


        // Fade into level and show Chapter title
        const fadeIntro = this.add.rectangle(-240, -120, 1920/0.8, 1080/0.8, 0x0a0a0a)
            .setAlpha(1).setOrigin(0).setDepth(999).setScrollFactor(0);
        this.tweens.add({
            targets: fadeIntro,
            alpha: 0,
            duration: 4500,
            onComplete: () => { 
                fadeIntro.destroy();
                this.idleSway = this.tweens.add({
                    targets: this.cage,
                    x: this.cage.x + 15,
                    duration: 1500,
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    repeat: -1
                });
                this.tweens.add({
                    targets: [this.level4Layout, this.lebel4Layout2, this.hint],
                    alpha: 1,
                    duration: 2000
                });
            }
        });
        
        // Tween the sounds for the cage
        this.time.delayedCall(3500, () => {
            this.tweens.add({
                targets: [this.metalChain, this.cageCreak],
                volume: 0.5,
                duration: 7000
            });
        })
        
        // Chapter title 
        this.title = this.add.text(1100, 420, "Chapter 4\nEscape Protocol", {
            fontSize: '40px',
            fill: '#94aebd'   // NOTE: change colour to match level3 palette
        }).setOrigin(0.5).setDepth(11);
        this.time.delayedCall(4500, () => { this.title.setVisible(false); });



        // Adding player to world
        this.player = new Player(this, 1422, 370, 'catAnim', 0.9, 1.2, 1).setOrigin(0, 1).setDepth(2); //1422, 370 //19662, 139 //12732.5, 905
        this.player.refreshBody();//0.9 for the cat // cancels world gravity
        this.player.setCollideWorldBounds(true);
        this.player.anims.play('catIdleRight');
        this.player.body.setEnable(true);

        // Adding the cage sprite 
        this.cage = this.add.sprite(this.player.x + 105, this.player.y - 320, 'mainCage');


        // Custom listener for when player drops an item
        this.player.on('itemDropped', (item) => {
            item.drop(this.player.x, this.player.y);
            this.clearHUD();
        });

        // Make camera follow the player
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(0.8); //0.6 main set to 0.8 at beginning
        this.cameras.main.setFollowOffset(0, 150); //150 for the cat

        // Setting up cursor keys arrow keys, and F and E keys.
        this.cursors = this.input.keyboard.createCursorKeys();
        this.cursors.keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        this.cursors.keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.cursors.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.numKeys = this.input.keyboard.addKeys({
            one: Phaser.Input.Keyboard.KeyCodes.ONE,
            two: Phaser.Input.Keyboard.KeyCodes.TWO,
            three: Phaser.Input.Keyboard.KeyCodes.THREE
        });

        // Inventory slot
        this.inventory = this.add.image(2350, 1320, 'inventory').setScrollFactor(0).setDepth(993);
        this.inventoryDisplay = this.add.text(2300, 1192, '', {
            fontSize: '20px',
            fill: '#ffffff'
        }).setScrollFactor(0).setDepth(992);

        // Add first vent cover and first vent body and adding overlap
        this.firstVentCover = this.physics.add.image(14545, 2224, 'ventCover').setOrigin(0, 1);
        this.firstVentCover.setSize(205, 200);
        this.firstVentCover.setAlpha(0);
        this.physics.add.overlap(this.firstVentCover, this.player, this.handleFirstVent, null, this);
        this.firstVent = this.add.image(14520, 2115, 'firstVent').setOrigin(0);
        this.firstVent.setVisible(false);

        // Adding scent trails the first + second trails
        this.firstTrail = this.physics.add.image(13480, 2121, 'scent1').setOrigin(0, 1);
        this.firstTrail.setVisible(false);
        this.secondTrail = this.physics.add.image(18947, 1392, 'scent2').setOrigin(0, 1);
        this.secondTrail.setVisible(false);

        // Second vent cover and vent body + overlap
        this.secondVentAlarm = this.physics.add.image(14944, 154, 'secondCover').setOrigin(0, 1);
        this.secondCover = this.physics.add.image(20000, 1405, 'secondCover').setOrigin(0, 1);
        this.secondCover.setAlpha(0).setScale(1).setImmovable(true);
        this.physics.add.collider(this.secondCover, this.player, this.handleSecondVent, null, this);
        this.secondVent = this.add.image(14985, 0, 'secondVent').setOrigin(0).setDepth(1);

        // Grabbing JSON texts for items
        const itemData = this.cache.json.get('items');
        
        // Initializing and adding all items to the world
        this.items = [
            new Item(this, this.player, {key: 'keyCard', weight: 'light', x: 4290, y: 1775, type: 'pickup', sizeX: 48, sizeY: 100}, itemData),
            new Item(this, this.player, {key: 'garbage', weight: 'medium', x: 19687, y: 1270, type: 'pickup', sizeX: 112, sizeY: 125}, itemData),
            new Item(this, this.player, {key: 'disposer', weight: 'none', x: 18210, y: 1356, type: 'interactive', sizeX: 'default', sizeY: 'default'}, itemData),
            this.terminal = new Item(this, this.player, {key: 'terminal', weight: 'none', x: 6591, y: 2076, type: 'interactive', sizeX: 'default', sizeY: 'default'}, itemData),
            new Item(this, this.player, {key: 'stickyNote1', weight: 'none', x: 14310, y: 590, type: 'interactive', sizeX: 53, sizeY: 60}, itemData),
            new Item(this, this.player, {key: 'stickyNote2', weight: 'none', x: 13370, y: 590, type: 'interactive', sizeX: 53, sizeY: 60}, itemData),
            new Item(this, this.player, {key: 'clippers', weight: 'light', x: 2631, y: 2120, type: 'pickup', sizeX: 'default', sizeY: 'default'}, itemData),
            this.electrical = new Item(this, this.player, {key: 'electricalPanel', weight: 'none', x: 195, y: 2025, type: 'interactive', sizeX: 'default', sizeY: 'default'}, itemData),
            new Item(this, this.player, {key: 'button', weight: 'none', x: 11255, y: 688, type: 'button', sizeX: 'default', sizeY: 'default', direction: 'left'}, itemData),
            new Item(this, this.player, {key: 'button', weight: 'none', x: 11623, y: 688, type: 'button', sizeX: 'default', sizeY: 'default', direction: 'up'}, itemData),
            new Item(this, this.player, {key: 'button', weight: 'none', x: 12025, y: 688, type: 'button', sizeX: 'default', sizeY: 'default', direction: 'down'}, itemData),
            new Item(this, this.player, {key: 'button', weight: 'none', x: 12395, y: 688, type: 'button', sizeX: 'default', sizeY: 'default', direction: 'right'}, itemData),
            this.anti1 = new Item(this, this.player, {key: 'anti1', weight: 'none', x: 13092, y: 799, type: 'pickup', sizeX: 'default', sizeY: 'default'}, itemData)
        ];

        // Adding overlap lisenter for items in the world
        this.items.forEach(item => {
            this.physics.add.overlap(this.player, item.sprite, () => {this.handleItemOverlap(item);}, null, this);
        });

        // Green overlay for the garbage room
        this.stinky = this.add.image(15027, 2120, 'stinky').setOrigin(0, 1);

        // Multiplier for the cage swining
        this.multiplier = 1;

        // Adding jumpscare sprite, setting frames, and adding animation
        this.jumpScare = this.physics.add.sprite(11585, 1961, 'jumpScare').setOrigin(0, 1);
        this.jumpScare.setFrame(0);
        this.jumpScare.setImmovable(true);
        this.jumpScare.setSize(925, 810).setOffset(0, 10);
        this.jumpScare.body.allowGravity = false;

        if(!this.anims.exists('jumpScare')) {
            this.anims.create({
                key: 'jumpScare',
                frames: [
                    { key: 'jumpScare', frame: 2, duration: 10},
                    { key: 'jumpScare', frame: 3, duration: 100},
                    { key: 'jumpScare', frame: 4, duration: 400},
                    { key: 'jumpScare', frame: 5, duration: 300},
                    { key: 'jumpScare', frame: 6, duration: 300},
                    { key: 'jumpScare', frame: 7, duration: 300},
                    { key: 'jumpScare', frame: 8, duration: 300}
                ],
                frameRate: 10,
                repeat: 0
            });
        }

        // Add zone for camera pan sequence 1. Guard sequence 1.
        this.guardZone = this.add.zone(16048, 2121, 30, 1112).setOrigin(0, 1);
        this.physics.add.existing(this.guardZone);
        this.guardZone.body.allowGravity = false;
        this.physics.add.overlap(this.guardZone, this.player, this.guardSequenceOne, null, this);

        // Add guard npc in now and set to frame 1
        this.guard = this.physics.add.sprite(19632, 2120, 'guard').setOrigin(0, 1).setDepth(2);
        this.guard.setImmovable(true);
        this.guard.setSize(142, 686).setOffset(120, 0);
        this.guard.body.allowGravity = false;

        // Adding guard idle animation
        if(!this.anims.exists('guardBreathe')) {
            this.anims.create({
                key: 'guardBreathe',
                frames: this.anims.generateFrameNumbers('guard', { start: 16, end: 19}),
                frameRate: 1,
                repeat: -1
            });
        }
        this.guard.play('guardBreathe');

        // Adding guard walking animation
        if(!this.anims.exists('guard')) {
            this.anims.create({
                key: 'guard',
                frames: this.anims.generateFrameNumbers('guard', { start: 15, end: 0}),
                frameRate: 6,
                repeat: -1
            });
        }

        // Crane and solution animations
        this.crane = this.add.sprite(11200, 60, 'craneAnim').setOrigin(0);
        if(!this.anims.exists('craneAnim')) {
            this.anims.create({
                key: 'craneAnim',
                frames: [
                    {key: 'craneAnim', frame: 0, duration: 100},
                    {key: 'craneAnim', frame: 1, duration: 100},
                    {key: 'craneAnim', frame: 2, duration: 100},
                    {key: 'craneAnim', frame: 3, duration: 100},
                    {key: 'craneAnim', frame: 4, duration: 100},
                ],
                frameRate: 7,
                repeat: 0
            });
        }

        // Adding the two different solutions + animations for the crane and solution sequence
        this.solution = this.add.sprite(12086, 260, 'solutionAnim').setOrigin(0);
        this.solution2 = this.add.sprite(12086, 260, 'solution2Anim').setOrigin(0);
        this.solution2.setAlpha(0);
        if(!this.anims.exists('solutionAnim')) {
            this.anims.create({
                key: 'solutionAnim',
                frames: [
                    {key: 'solutionAnim', frame: 0, duration: 100},
                    {key: 'solutionAnim', frame: 1, duration: 100},
                    {key: 'solutionAnim', frame: 2, duration: 100},
                    {key: 'solutionAnim', frame: 3, duration: 100},
                    {key: 'solutionAnim', frame: 4, duration: 100},
                    {key: 'solutionAnim', frame: 5, duration: 100},
                ],
                frameRate: 3,
                repeat: -1
            });
        }
        if(!this.anims.exists('solution2Anim')) {
            this.anims.create({
                key: 'solution2Anim',
                frames: [
                    {key: 'solution2Anim', frame: 0, duration: 100},
                    {key: 'solution2Anim', frame: 1, duration: 100},
                    {key: 'solution2Anim', frame: 2, duration: 100},
                    {key: 'solution2Anim', frame: 3, duration: 100},
                    {key: 'solution2Anim', frame: 4, duration: 100},
                    {key: 'solution2Anim', frame: 5, duration: 100},
                ],
                frameRate: 10,
                repeat: -1
            });
        }
        this.solution.play('solutionAnim');

        // Add glass window over top of the solutions and crane
        this.add.image(11180, 527, 'alarmGlass').setOrigin(0, 1);

        // Sequences for the puzzles
        this.correctSequence = ['left', 'down', 'right', 'right', 'up', 'left'];
        this.secretSequence = ['right', 'up', 'left', 'left', 'down', 'right' ];
        this.playerSequence = [];
        this.currSequence = this.correctSequence;

        //Sequence indicators 
        this.sequenceIndicators = [
            this.sequence1 = this.add.image(11652, 578, 'sequencer').setOrigin(0, 1),
            this.sequence2 = this.add.image(11726, 578, 'sequencer').setOrigin(0, 1),
            this.sequence3 = this.add.image(11802, 578, 'sequencer').setOrigin(0, 1),
            this.sequence4 = this.add.image(11876, 578, 'sequencer').setOrigin(0, 1),
            this.sequence5 = this.add.image(11951, 578, 'sequencer').setOrigin(0, 1),
            this.sequence6 = this.add.image(12026, 578, 'sequencer').setOrigin(0, 1)
        ]

        // Add overlap for next level
        this.nextLevel = this.add.zone(19995, 2120, 20, 611).setOrigin(0, 1);
        this.physics.world.enable(this.nextLevel, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.add.overlap(this.nextLevel, this.player, this.startNextScene, null, this);

        // Calls helpers to create the level layout and doors
        this.createDoors(this);
        this.createPlatforms(this);

        // Collisions 
        this.physics.add.collider(this.player, this.firstVent);
        this.physics.add.overlap(this.player, this.jumpScare, this.jumpScarePart, null, this);
        this.physics.add.overlap(this.guard, this.player, this.restartAtVent, null, this);

        //Vent zones cannot morph AND can't crouch.
        this.ventSpots = [
            {x: 55, y: 2121, width: 1012, height: 351},//first vent room electrical
            {x: 14500, y: 2446, width: 1076, height: 324},//second vent, U shaped one left
            {x: 20025, y: 1395, width: 1060, height: 1402},//all last vent
            {x: 14949, y: 110, width: 5203, height: 94}
        ];

        // Adding overlap zones and a callback to handle all vents in the level
        this.ventSpots.forEach(section => {
            const zones = this.add.zone(section.x, section.y, section.width, section.height).setOrigin(0, 1);
            this.physics.world.enable(zones, Phaser.Physics.Arcade.STATIC_BODY);
            this.physics.add.overlap(this.player, zones, this.noMorphing, null, this);
            return zones;
        });

        // Adding the box compartment + antidote for level 4
        this.secretBox = this.add.image(13063, 753, 'secretBox').setOrigin(0);
        this.secretBox.setVisible(false);
        this.anti1.sprite.setSize(18, 53).setOffset(0, 10);
        this.anti1.sprite.setDepth(900);
        this.anti1.sprite.setVisible(false).body.setEnable(false);

    }


    /**
     * update
     * Description: Runs every frame. Handles all logic that needs attention real time including cage swinging, player movement, item overlap and pickup logic,
     *              vent cover proximity checks, button sequence completion and validation, morph zone tracking, and F/E interactions for picking up and interacting
     *              with items and vents. Returns early if the player is still in the cage, locking movement to cafe physics.
     * Inputs: None
     * Outputs: None. Updates game state every frame.
     * Called By: Phaser engine
     * Calls: this.items[].update(), this.player.getForm(), this.player.update(),
     *        this.player.carriedItem(), this.player.dropItem(), this.player.pickUp(),
     *        this.player.playTug(), this.player.setPosition(), this.player.refreshBody(),
     *        this.handleItemOverlap(), this.handleInteractive(), this.handleSequence(),
     *        this.revealFirstVent(), this.breakCage(), this.updateHUD(),
     *        this.clearHUD(), this.checkAnti(), this.playCraneSolution(), this.resetSequenceUI(),
     *        this.tweens.add(), this.time.delayedCall(), this.add.text(), this.add.image(),
     *        Phaser.Input.Keyboard.JustDown(), Phaser.Math.Distance.Between()
     */
    update() {
        // Catching F and E cursor keys for interacting with items and picking up items
        const justPressedF = Phaser.Input.Keyboard.JustDown(this.cursors.keyF);
        const justPressedE = Phaser.Input.Keyboard.JustDown(this.cursors.keyE);

        // Update all items each frame
        //this.items.forEach(item => item.update());

        // Trigger for displaying the first scent trail only when in dog form, hides it otherwise
        if(this.firstTrail) {
            if(this.player.getForm() === 'dog') {
                this.firstTrail.setVisible(true);
            }else {
                this.firstTrail.setVisible(false);
            }
        }

        // Trigger for displaying the second scent trail only when in dog form, hides it otherwise
        if(this.secondTrail && this.disposedGarbage) {
            //displays scent trail only when player is a dog
            if(this.player.getForm() === 'dog') {
                this.secondTrail.setVisible(true);
            }else {
                this.secondTrail.setVisible(false);
            }
        }
        
        // Handles checking for the player sequence. Checking against the secret sequence, main sequence, and incorrect sequences.
        if (this.playerSequence.length === 6 && !this.checkingSequence) {
            this.checkingSequence = true;
            this.canPress = false;

            // Turning player object input into strings
            const playerStr = JSON.stringify(this.playerSequence);
            const isCorrectMain = playerStr === JSON.stringify(this.correctSequence);
            const isCorrectSecret = playerStr === JSON.stringify(this.secretSequence);

            // Handle secret sequence upon success
            if (isCorrectSecret && !this.doneSecretSequence) {
                this.gotSecondSequence = true;
                this.correctSeq.play();
                // Tweens the indicators to blink and play the correct sound. Calls handleGotSecret() and resets UI.
                this.tweens.add({
                    targets: this.sequenceIndicators,
                    alpha: { from: 0.8, to: 0 },
                    duration: 200,
                    yoyo: true,
                    repeat: 3,
                    onComplete: () => {
                        this.openAnti.play();
                        this.resetSequenceUI();
                        this.handleGotSecret();
                        this.tryingSecondSequence = false;
                        this.doneSecretSequence = true;
                        this.correct = true;
                    }
                });

            // Handles the main sequence upon success
            }else if (isCorrectMain) {
                this.gotFirstSequence = true;
                this.correctSeq.play();

                // Tweening the sequence indicators, blinking green and plays the correct sound. Calls playCraneSolution and clears UI.
                this.tweens.add({
                    targets: this.sequenceIndicators,
                    alpha: { from: 0.8, to: 0 },
                    duration: 200,
                    yoyo: true,
                    repeat: 3,
                    onComplete: () => {
                        this.playCraneSolution();
                        this.resetSequenceUI();
                        this.correct = true;
                    }
                });

            // Handles any other sequences; incorrect sequences. Plays the incorrect sound and tweens to blink red for indicators
            }else {
                this.wrong.play();
                this.tweens.add({
                    targets: this.sequenceIndicators,
                    alpha: { from: 0.8, to: 0 },
                    duration: 200,
                    yoyo: true,
                    repeat: 3,
                    onComplete: () => {
                        this.time.delayedCall(650, () => {
                            this.resetSequenceUI();
                            this.correct = true;
                        });
                    }
                });
            }
        }

        // Deletes the buttons for inputing sequences after both the secret and main sequences have been inputed and handled
        if(this.gotFirstSequence && this.gotSecondSequence && !this.deletedBtns) {
            this.deletedBtns = true;
            console.log("BOTH ARE CORRECT");
            //delete buttons
            this.items[8].sprite.body.enable = false;
            this.items[9].sprite.body.enable = false;
            this.items[10].sprite.body.enable = false;
            this.items[11].sprite.body.enable = false;
            this.canPress = false;
            this.playerSequence = [];
        }


        // Handles the first vent cover overlap 
        if(this.firstVentCover !==  null && this.ventCoverOverlap) {
            const itemDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.firstVentCover.x, this.firstVentCover.y);
            if(itemDist > 150) {
                this.ventCoverOverlap = false;
                this.firstVentCover.postFX.clear();
                this.handledFirstVent = false;
                if (this.ePromptVent) this.ePromptVent.destroy();
            }
        }

        // Handles the second vent cover overlap
        if(this.secondCover !==  null && this.secondCoverOverlap) {
            const itemDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.secondCover.x, this.secondCover.y);
            if(itemDist > 150) {
                this.secondCoverOverlap = false;
                this.secondCover.postFX.clear();
                if (this.ePromptVent) this.ePromptVent.destroy();
            }
        }

        // Handles item overlaps, gets rid of postFX effects and destroys and prompts still lingering
        if(this.currItem) {
            const itemDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.currItem.sprite.x, this.currItem.sprite.y);
            const itemRightBound = this.player.x > (this.currItem.sprite.x+this.currItem.sprite.body.width);
            const itemLeftBound =  (this.player.x+this.player.body.width) < this.currItem.sprite.x;
            if(itemLeftBound || itemRightBound) {
                this.currItem.sprite.postFX.clear();
                this.currOverlapping = false;
                this.currItem = null;
                this.currItemPickupable = false;
                if(this.fPrompt){
                    this.fPrompt.destroy();
                }
                if(this.ePrompt){
                    this.ePrompt.destroy();
                } 
            }
        }

        // If player still in cage. Only allow cage physics movements and return early till player breaks out of the cage
        if(this.inCage) {
            // Sync player to cage position
            this.player.setPosition(this.cage.x - 105, this.cage.y + 465);
            this.player.refreshBody();

            // Catching player inputs
            const left = this.cursors.left.isDown;
            const right = this.cursors.right.isDown;

            // Handles the player and the cage sprite right by the multiplier and swings back to resting position. Alternates between left and right only
            if (left && this.lastSwing === 'right') {
                if(!this.notStopped  && this.idleSway) {
                    this.notStopped = true;
                    this.idleSway.stop();
                    this.idleSway = null;
                }
                
                if(!this.swinging){
                    this.lastSwing = 'left';
                    this.swinging = true;
                    this.tweens.add({
                        targets: this.cage,
                        x: this.cage.x + (-20.5 * this.multiplier),
                        y: this.cage.y + (-1.01 * this.multiplier),
                        duration: 500,
                        yoyo: true,
                        repeat: 0,
                        ease: 'Cos.easeInOut',
                        onComplete: () => {
                            //this.tweens.destroy();
                            this.multiplier++;
                            this.swinging = false;
                        }
                    });
                }
                
            }

            // Handles the player and the cage sprite right by the multiplier and swings back to resting position. Alternates left and right only
            if (right && this.lastSwing === 'left') {
                if(!this.notStopped && this.idleSway) {
                    this.notStopped = true;
                    this.idleSway.stop();
                    this.idleSway = null;
                }
                if(!this.swinging){
                    this.lastSwing = 'right';
                    this.swinging = true;
                    this.tweens.add({
                        targets: this.cage,
                        x: this.cage.x + (20.5 * this.multiplier),
                        y: this.cage.y + (-1.01 * this.multiplier),
                        duration: 500,
                        yoyo: true,
                        repeat: 0,
                        ease: 'Cos.easeInOut',
                        onComplete: () => {
                            //this.tweens.destroy();
                            this.multiplier++;
                            this.swinging = false;
                        }
                    });
                }
            }
            
            // Once player reaches a certain peak (breaking cage on left wall). Breaks out of cage
            if(this.player.x <= 1070) {
                this.breakCage();
            }
            return;
        }

        // F interactions (pickup interactions). Player cannot pick up items if they are currently in cutscene
        if (justPressedF && !this.inCutScene) {
            //Currently carrying an item. Drop current item if carrying an item
            if (this.player.carriedItem && this.player.body.onFloor()) {
                if (this.currItem) {
                        //Guard against overlapping messages, plays sounds, and displays messages and textbox
                        if (this.stillShowingText) return;
                        this.textsound.play();
                        this.diaBoxSound.play();
                        this.stillShowingText = true;
                        this.itemDia = this.add.text(410, 1166, "I can't drop this here...", {
                            fontSize: '25px', 
                            fill: '#ffffff', 
                            wordWrap: {width: 1200}}).setDepth(994).setScrollFactor(0);
                        this.textBox = this.add.image(300, 1350, 'textBox').setOrigin(0, 1).setScrollFactor(0).setDepth(3).setScale(2.5).setAlpha(0.9).setDepth(993);
                        this.time.delayedCall(1800, () => {
                            this.itemDia.destroy();
                            this.textBox.destroy();
                            this.stillShowingText = false;
                        });
                        return;
                }

                // Drops the item player is currently carrying and clears the inventory
                this.droppedItem = this.player.dropItem();
                this.droppedItem.drop(this.player.x, this.player.y);
                this.clearHUD();

            // Player is not currently carrying anything and can pickup item currently overlapping with.
            }else if (this.currItem && this.currItemPickupable) {
                // Handles items that are too heavy for specific forms, plays the sounds for text and textbox and displays
                if(this.currItem.config.key !== 'anti1' && !this.currItem.canCarry(this.player.getForm())) {
                    this.player.playTug();
                    if (this.stillShowingText) return;
                    this.stillShowingText = true;
                    this.textsound.play();
                    this.diaBoxSound.play();
                    this.itemDia = this.add.text(410, 1166, "This is too heavy for me...", {
                        fontSize: '25px', 
                        fill: '#ffffff', 
                        wordWrap: {width: 1200}}).setDepth(4).setScrollFactor(0);
                    this.textBox = this.add.image(300, 1350, 'textBox').setOrigin(0, 1).setScrollFactor(0).setDepth(3).setScale(2.5).setAlpha(0.9);
                    this.time.delayedCall(1500, () => {
                        this.itemDia.destroy();
                        this.textBox.destroy();
                        this.stillShowingText = false;
                    });

                // Handles items that can be picked and aren't too heavy for the current form
                } else {
                    // Handles item that is the antidote. Lights up HUD for the correct antidote if on the second playthrough. Still plays sound otherwise.
                    if(this.currItem.config.key === 'anti1') {
                        this.antiPickup.play();
                        this.anti1.sprite.destroy();
                        this.currItem = null;
                        this.currOverlapping = false;
                        if(this.fPrompt) this.fPrompt.destroy();
                        this.registry.get('secrets').anti1 = true;
                        this.checkAnti();

                    // Handles picking up an item, plays the sounds, and add item to inventory (updating the HUD)
                    }else {
                        this.pickup.play();
                        this.updateHUD(this.currItem);
                        this.player.pickUp(this.currItem);
                        this.currItem.sprite.setVisible(false);
                        this.currItem.sprite.body.enable = false;
                        if(this.ePrompt) this.ePrompt.destroy();
                        if(this.fPrompt) this.fPrompt.destroy();
                    }
                }
            }
        }


        // Handles interactive items
        if(justPressedE) {
            // Opens up the first vent cover upon interacting as a dog
            if(this.ventCoverOverlap) {
                this.revealFirstVent();
            }

            // Only allow interactions when the player is overlapping items
            if(!this.currItem || this.currItemPickupable) return;
            this.handleInteractive(this.currItem);
        }

        // Allows player to make sounds for entertainment purposes
        const justPressedM = Phaser.Input.Keyboard.JustDown(this.cursors.keyM);

        // Handles the player leaving the vent zones and flags for when the player can and cannot morph
        if(this.currZone) { //If currently holding item
            const itemDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.currZone.x, this.currZone.y);
            const itemRightBound = this.player.x > (this.currZone.x+this.currZone.width);
            const itemLeftBound =  (this.player.x+this.player.body.width) < this.currZone.x;
            if(itemLeftBound || itemRightBound) {
                this.currOverlapping = false;
                this.currZone = null;
                this.setNoMorph = false;
                this.canMorph = true;
            }
        }

        // Update player every frame
        this.player.update(this.cursors, this.isHurt || this.isFalling, this, justPressedM, this.numKeys, this.canMorph);
    }

    /**
     * checkAnti
     * Description: Checks the registry to see which antidotes the player has collected and updates the HUD icons accordingly by setting
     *              their alpha to full upon collection
     * Inputs: None
     * Outputs: None. Updates antiIcon alpha as a side effect
     * Called By: create(), F key pickup logic in update()
     * Calls: this.registry.get(), this.antiIcons[].setAlpha()
     */
    checkAnti() {
        // Only allows checks to happen during the second playthrough when HUD is available
        if(this.antiIcons.length < 3) return;
        const registry = this.registry.get('secrets');
        if(registry.anti1) {
            this.antiIcons[0].setAlpha(1);
        }
        
        if(registry.anti2) {
            this.antiIcons[1].setAlpha(1);
        }

        if(registry.anti3) {
            this.antiIcons[2].setAlpha(1);
        }
    }

    /**
     * resetSequenceUI
     * Description: Resets the button sequence puzzle back to its default state. Clears visual tints on the sequence indicators, 
     *              wipes the player's input array, and re-enables the button pressing
     * Inputs: None
     * Outputs: None. Resets sequence stat as a side effect
     * Called By: update() after a sequence attempt completes (correct or incorrect)
     * Calls: this.sequenceIndicators[].clearTint()
     */
    resetSequenceUI() {
        // Clear the visual tints on all indicators lights and clears player inputs
        this.sequenceIndicators.forEach(item => item.clearTint());
        this.playerSequence = [];
        
        // Reset state flags so they can try again
        this.checkingSequence = false;
        this.canPress = true;
        this.correct = true;
    }


    /**
     * handleShowHint
     * Description: Toggles the hint panel on or off when the player clicks the hint button
     * Inputs: None
     * Outputs: None. Calls displayHint() or hideHint() as a side effect
     * Called By: hint image pointerdown event in create()
     * Calls: this.displayHint(), this.hideHint()
     */
    handleShowHint() {
        // Shows the hint when player presses it and hides when player presses it again
        if(!this.showHint) {
            this.showHint = true;
            this.displayHint();
        }else {
            this.showHint = false;
            this.hideHint();
        }
    }


    /**
     * displayHint
     * Description: Sets the hint panel, hint texts, and hint covers to visible
     * Inputs: None
     * Outputs: None. Sets alpha values accordingly
     * Called By: handleShowHint()
     * Calls: this.hintPanel.setVisible(), this.hintTexts[].setVisible(), this.hintCovers[].setVisible()
     */
    displayHint() {
        // Set the flag and cycle through the array and set alpha
        this.hintPanel.setVisible(true);
        Object.values(this.hintTexts).forEach(hint => {
            hint.setVisible(true);
        });
        Object.values(this.hintCovers).forEach(hint => {
            hint.setVisible(true);
        });
    }

    /**
     * hideHint
     * Description: Sets the hint panel, hint texts, and hint covers to invisible
     * Inputs: None
     * Outputs: None. Sets alpha values accordingly
     * Called By: handleShowHint()
     * Calls: this.hintPanel.setVisible(), this.hintTexts[].setVisible(), this.hintCovers[].setVisible()
     */
    hideHint() {
        // Set the fladgand cycle through the array and set alpha
        this.hintPanel.setVisible(false);
        Object.values(this.hintTexts).forEach(hint => {
            hint.setVisible(false);
        });
        Object.values(this.hintCovers).forEach(hint => {
            hint.setVisible(false);
        });
    }

    /**
     * handleRemoveCover
     * Description: Destroys a hint cover image when the player clicks on it, revealing the hint text underneath.
     * Inputs:
     *      @param cover: the hint cover the player clicked on
     * Outputs: None. Destroys the hint cover as a side effect
     * Called By: hintCovers pointerdopwn event in create()
     * Calls: cover.destroy() 
     */
    handleRemoveCover(cover) {
        cover.destroy();
    }

    /**
     * handleGotSecret
     * Description: Reveals the secret box and the first antidote sprite after the player completes the secret button sequence
     * Inputs: None
     * Outputs: None. Sets visibility and enables physics body as a side effect
     * Called By: update() on secret sequence success
     * Calls: this.secretBox.setVisible(), this.anit1.sprite.setVisible(), this.anti1.sprite.body.setEnable()
     */
    handleGotSecret() {
        this.secretBox.setVisible(true);
        this.anti1.sprite.setVisible(true).body.setEnable(true);
    }

    /**
     * noMorphing
     * Description: Disables the player's ability to morph when they enter a vent zone. Sets the flag to prevent repeat calls and stores the current zone.
     * Inputs:
     *      @param player: the player object 
     *      @param zone: the curr zone being overlapped
     * Outputs: None. Sets canMorph and currZone as a side effect
     * Called By: ventSpots overlap callbacks in create()
     * Calls: None
     */
    noMorphing(player, zone) {
        // Guard against repeated calls
        if(this.setNoMorph) return;
        this.setNoMorph = true;

        // Set variable to pass in to player update.
        this.canMorph = false;
        this.currZone = zone;
    }

    /**
     * startNextScene
     * Description: Handles the end of level transitions. Fades out the level, checks how many antidotes the player collected, and routes them to the correct
     *              ending scene.
     * Inputs: None
     * Outputs: None. Trigeers scene transition as a side effect
     * Called By: nextLevel zone overlap in create()
     * Calls: this.player.setVelocityX(), this.player.setBlocked(), this.player.playIdle(), this.tweens.add(), this.registry.get(), this.scene.start(), 
     *        this.whiteSound.stop()
     */
    startNextScene() {
        // Guards against repeated calls and sets all flags
        if(this.nextScene) return;
        this.nextScene = true;
        this.alarm.stop();
        this.player.setVelocityX(0);
        this.player.setBlocked(true);
        this.player.playIdle();

        // Fades out the level
        const fadeOut = this.add.rectangle(-670, -420, 1920/0.6, 1080/0.6, 0x0a0a0a)
            .setAlpha(0).setOrigin(0).setDepth(999).setScrollFactor(0);

        this.tweens.add({
            targets: [this.level4Layout, this.lebel4Layout2],
            alpha: 0,
            duration: 2500
        });
        this.tweens.add({
            targets: fadeOut,
            alpha: 1,
            duration: 2500,
            onComplete: () => { 
                fadeOut.destroy();

                // Routes the player to the next scene accordingly based on the amount of antidotes collected
                const antidotes = this.registry.get('secrets');
                const antidoteCount = [antidotes.anti1, antidotes.anti2, antidotes.anti3].filter(Boolean).length;
                this.whiteSound.stop();
                if(antidoteCount === 3) {
                    //start good ending
                    this.scene.start('TrueEnding');
                }else if(antidoteCount === 2) {
                    //start midEnding
                    this.scene.start('MidEnding');
                }else if(!this.registry.get('secrets').firstDLC) {
                    this.scene.start('MenuScene');
                }else {
                    this.scene.start('Level5');
                }
            }
        });       
    }

    /**
     * playCraneSolution
     * Description: Plays the crane animation sequence after the correct button sequence is entered. Moves the crane, triggers the solution animation, plays
     *              the alarm, and kicks off the guard running sequence.
     * Inputs: None
     * Output: None. Plays animations and sound as a side effect
     * Called By: update() on correct main sequence
     * Calls: this.tweens.add(), this.craneMove.play(), this.crane.play(), this.alarm.play(), this.cameras.main.shake(), this.playGuardRunning()
     */
    playCraneSolution() {
        // Guard against repeated calls
        if(this.cranePlayed) return;
        this.cranePlayed = true;
        //Move crane
        this.tweens.add({
            targets: this.crane,
            x:  12162,
            duration: 2000,
            onComplete: () => {
                // Play the solution changing after crane moved
                this.craneMove.play();
                this.crane.play('craneAnim');
                this.solution.anims.msPerFrame = 200;
                this.tweens.add({
                    targets: this.solution,
                    setTint: 0xD63C1E,
                    duration: 1000,
                    repeat: 0,
                    onComplete: () => {
                        // Shake the camera and play the alarm sound
                        this.time.delayedCall(1800, () => {
                            this.cameras.main.shake(800, 0.03);
                        });
                        // Switch the solution to the red solution and play
                        this.solution2.play('solution2Anim');
                        this.alarm.play();
                        this.tweens.add({
                            targets: this.solution,
                            alpha: 0,
                            duration: 2000,
                            repeat: 0
                        });
                        // Add red blinking tween and call guard running 
                        this.tweens.add({
                            targets: this.solution2,
                            alpha: 1,
                            duration: 2000,
                            repeat: 0,
                            onComplete: () => {
                                this.redRect = this.add.rectangle(-650, -450, 3432, 1928, 0xA1240D).setOrigin(0).setScrollFactor(0).setDepth(999).setAlpha(0.4);
                                this.alarmTween = this.tweens.add({
                                    targets: this.redRect,
                                    alpha: { from: 0.4, to: 0 },
                                    duration: 1000,
                                    yoyo: true,
                                    repeat: -1,
                                });
                                this.playGuardRunning();
                            }
                        });
                    }
                });
            }
        });
    }

    /**
     * playGuardRunning
     * Description: Pans the camera to the guard, shows guard dialogue, then triggers the guard running animation toward the control room. Once the guard stops
     *              and opens the door, it shows a message to and another message to players saying the exit is now unguarded
     * Inputs: None
     * Outputs: None. Triggers camera pan, guard movement, and door open as a side effect
     * Called By: playCraneSolution()
     * Calls: this.cameras.main.stopFollow(), this.cameras.main.pan(), this.cameras.maind.startFollow(), this.add.image(), this.add.text(), this.guard.play(),
     *        this.tweens.add(), this.doorThree.setTexture(), this.doorOpenSound.play(), this.time.delayedCall()
     */
    playGuardRunning() {
        // Stop following player and pan camera to guard
        this.cameras.main.stopFollow();
        this.cameras.main.pan(this.guard.x, this.guard.y, 1000, 'Power3', false, (cam, progress) => {
            // On camera pan completion show guard dialogue and start guard walking animation
            if (progress === 1) {
                this.cameras.main.startFollow(this.guard);
                this.diaBox = this.add.image(this.guard.x - 550, this.guard.y - 350, 'diaBox2').setOrigin(0, 1).toggleFlipX().setScale(1.2).setDepth(3);
                this.guardText = this.add.text(this.guard.x - 450, this.guard.y - 580, this.dataText.guard.secondSequence, {
                            fontSize: '25px', 
                            fill: '#000000', 
                            wordWrap: {width: 300}}).setDepth(4);

                this.time.delayedCall(4000, () => {
                this.diaBox.destroy();
                this.guardText.destroy();
                this.guard.play('guard');
                this.tweens.add({
                    targets: this.guard,
                    x: this.guard.x - 2000,
                    duration: 4000,
                    onComplete: () => {
                        // Set guard to position at door
                        this.guard.setSize(142, 450).setOffset(120, 0);
                        this.guard.refreshBody();
                        this.guard.setPosition(14706, 904);
                        this.guard.body.enable = false;
                        // Pan back to player so player can run
                        this.time.delayedCall(3000, () => {
                            this.cameras.main.startFollow(this.player);
                        });
                        // Then add tween of guard moving left to the control panel
                        this.tweens.add({
                            targets: this.guard,
                            duration: 10000,
                            x: 11111,
                            ease: 'Linear',
                            onComplete: () => {
                                // Once gaurd makes it to control stop, show dialouge for guard and note that the exit is now unguarded
                                this.guard.anims.stop();
                                this.alarm.stop();
                                this.alarmTween.stop();
                                this.redRect.destroy();
                                this.guard.play('guardBreathe').toggleFlipX();
                                //Show text
                                this.diaBox = this.add.image(this.guard.x + 150, this.guard.y - 350, 'diaBox2').setOrigin(0, 1).toggleFlipX().setScale(1.2).setDepth(3).toggleFlipX();
                                this.guardText = this.add.text(this.guard.x + 390, this.guard.y - 580, this.dataText.guard.problem, {
                                            fontSize: '25px', 
                                            fill: '#000000', 
                                            wordWrap: {width: 300}}).setDepth(4);

                                this.time.delayedCall(2000, () => {
                                    this.diaBox.destroy();
                                    this.guardText.destroy();
                                    this.doorOpenSound.play();
                                    this.doorThree.setTexture('openedDoor');
                                    this.doorThree.body.enable = false;
                                    this.textsound.play();
                                    this.diaBoxSound.play();
                                    this.itemDia = this.add.text(410, 1166, "Now the exit is unguarded", {
                                        fontSize: '25px', 
                                        fill: '#ffffff', 
                                        wordWrap: {width: 1200}}).setDepth(4).setScrollFactor(0);
                                    this.textBox = this.add.image(300, 1350, 'textBox').setOrigin(0, 1).setScrollFactor(0).setDepth(3).setScale(2.5).setAlpha(0.9);
                                    this.time.delayedCall(3000, () => {
                                        this.itemDia.destroy();
                                        this.textBox.destroy();
                                    });

                                });
                            }
                        });
                    }
                });
            });
            }
        });
    }

    /**
     * handleSequence
     * Description: Records the player's button press into the sequence array and updates the sequence indicators with green (correct) or red (incorrect) tints.
     *              Also determines whether the check against the main or secret sequence. 
     * Inputs:
     *      @param direction: the direction of the button being pressing by player (left, right, up, down)
     * Outputs: None. Pushes the playerSequence and updates indicator tints as side effects
     * Called By: handleInteractive() when a button type item is pressed
     * Calls: this.press.play(), this.playerSequence.push(), this.sequenceIndicators[].setTint() 
     */
    handleSequence(direction) {
        // Guards against player skipping puzzles and against multiple calls at once and sets the proper flags
        if(!this.findVent) return;
        if (!this.canPress) return;
        this.findVent = true;
        this.press.play();
        // Pushes the player input
        this.playerSequence.push(direction);
        const index = this.playerSequence.length - 1;
        // Decides which sequence to check against; secret or main sequence
        if(this.playerSequence[0] === 'right' && !this.doneSecretSequence) {
            this.currSequence = this.secretSequence;
            this.tryingSecondSequence = true;
        } else {
            this.currSequence = this.correctSequence;
            this.tryingSecondSequence = false;
        }
        
        // Checks against the selected sequence and sets the tints accordingly. If player gets one wrong, set flag
        if(this.playerSequence[index] === this.currSequence[index]) {
            this.sequenceIndicators[index].setTint(0x1ED62D);
        }else {
            this.sequenceIndicators[index].setTint(0xD63C1E);
            this.correct = false;
        }
    }

    /**
     * restartAtVent
     * Description: Handles the guard shooing the player away when they get too close. Shows the guard dialogue based on the player's current form, then tweens
     *              the player back and re-enables movement after a delay.
     * Inputs:
     *      @param guard: the guard sprite 
     *      @param player: the player sprite
     * Outputs: None. Blocks and tweens the player as a side effect
     * Called By: guard overlap callback in create()
     * Calls: this.player.setVelocityX(), this.player.playIdle(), this.player.setBlocked(), this.player.getForm(), this.add.image(), this.add.text(), this.time.delayedCall()
     */
    restartAtVent(guard, player) {
        // Guards against repeated calls
        if(this.handledShoo) return;
            // Setting all flags and blocking player movement
            this.handledShoo = true;
            this.player.setVelocityX(0);
            this.player.playIdle();
            this.player.setBlocked(true);
            // Displays the correct text for the current form
            const playerForm = this.player.getForm();
            const text = this.dataText.guard.textForm[playerForm];
            if(playerForm === 'human') {
                this.diaBox = this.add.image(this.guard.x - 400, this.guard.y - 400, 'dialogueBox').setOrigin(0, 1).toggleFlipX().setScale(1.4).setDepth(3);
                this.guardText = this.add.text(this.guard.x - 340, this.guard.y - 560, text, {
                        fontSize: '20px', 
                        fill: '#000000', 
                        wordWrap: {width: 350}}).setDepth(4);
            }else {
                this.diaBox = this.add.image(this.guard.x - 200, this.guard.y - 400, 'dialogueBox').setOrigin(0, 1).toggleFlipX().setScale(0.9).setDepth(3);
                this.guardText = this.add.text(this.guard.x - 150, this.guard.y - 500, text, {
                        fontSize: '20px', 
                        fill: '#000000', 
                        wordWrap: {width: 350}}).setDepth(4);
            }
            // Tweens the player back upon collision
            this.tweens.add({
                targets: this.player,
                x: this.player.x - 500,
                duration: 1000,
                repeat: 0,
                onComplete: () => {
                    this.time.delayedCall(1000, () => {
                        this.handledShoo = false;
                        this.diaBox.destroy();
                        this.guardText.destroy();
                        this.player.setBlocked(false);
                    });
                }
            })
        
    }

    /**
     * guardSequenceOne
     * Description: Triggered when the player enters the guard zone for the first time. Locks the player, pans the camera to the guard to show dialogue, then
     *              pans back and re-enables the player. Scene is when player first enters this section (control room and garbage section)
     * Inputs:
     *      @param zone: the guard trigger zone
     *      @param player: the player sprite
     * Outputs: None. Locks the player and triggers camera pan as a side effect
     * Called By: guardZone overlap callback in create()
     * Calls: this.cameras.main.stopFollow(), this.cameras.main.pan(), this.cameras.main.startFollow(), this.add.image(), this.add.text(), this.player.setBlocked(),
     *        this.time.delayedCall()
     */
    guardSequenceOne(zone, player) {
        // Guards against triggering multiple times and sets all flags, and blocks player movement
        if(this.showedSequence) return;
        this.showedSequence = true;
        this.isHurt = true;
        this.player.setBlocked(true);
        this.cameras.main.stopFollow();
        this.player.setVelocityX(0);
        this.player.playIdle();
    
        // Pan camera to guard
        this.cameras.main.pan(this.guard.x, this.guard.y, 1000, 'Power3', false, (cam, progress) => {
            // Upon success, show guard dialogue
            if(progress === 1) {
                //show guard dialogue about the garbage
                this.diaBox = this.add.image(this.guard.x - 550, this.guard.y - 350, 'diaBox2').setOrigin(0, 1).toggleFlipX().setScale(1.2).setDepth(3);
                this.guardText = this.add.text(this.guard.x - 450, this.guard.y - 580, this.dataText.guard.firstSequence, {
                            fontSize: '25px', 
                            fill: '#000000', 
                            wordWrap: {width: 300}}).setDepth(4);

                // Pan camera back to player after timer delay and re-enable player movement
                this.time.delayedCall(6000, () => {
                    this.diaBox.destroy();
                    this.guardText.destroy();
                    this.cameras.main.pan(this.player.x, this.player.y, 1000, 'Power2', false, (cam, progress) => {
                        if (progress === 1) {
                            this.cameras.main.startFollow(this.player);
                            this.isHurt = false;
                            this.player.setBlocked(false);
                        }
                        this.tweens.add({
                            targets: this.cameras.main,
                            zoom: 0.6,
                            duration: 1000,
                            ease: 'Power2'
                        });
                    });
                }); 
            }
            // Un-zoom camera
            this.tweens.add({
                targets: this.cameras.main,
                zoom: 0.8,
                duration: 1000,
                ease: 'Power2'
            });
        })
    }

    /**
     * breakCage
     * Description: Breaks the player out of the starting cage when swung far enough. Destroys the cage, shakes and flashes the camera, repositions the player,
     *              and re-enables movement once the player lands
     * Inputs:
     *      @param player: the player sprite
     *      @param wall: the cage wall zone
     * Outputs: None. Destroys cage and repositions player as side effects
     * Called By: update() when the player x positions goes below the cage wall threshold
     * Calls: this.cage.destroy(), this.cameras.main.shake(), this.cameras.main.flash(), this.player.setPosition(), this.time.addEvent()
     */
    breakCage(player, wall) {
        // Guards again multiple calls and sets flags
        if (this.cageBreaking) return;
        this.cageBreaking = true;
        this.metalBreak.play();
        this.cageCreak.stop();
        // Destroy cage
        this.cage.destroy();
        // Shake the screen
        this.cameras.main.shake(500, 0.02);
        this.cameras.main.setZoom(0.6);
        // Quick flash to simulate impact blur
        this.cameras.main.flash(300, 225, 225, 225, false);
        this.player.body.setEnable(true);
        this.player.setPosition(1200, 981);
        this.player.refreshBody();      
        this.inCage = false;

        // Wait for player to land then free
        const landCheck = this.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                if (this.player.body.onFloor()) {
                    landCheck.destroy();
                }
            }
        });
    }

    /**
     * jumpScarePart
     * Description: Plays the jumpscare animation when the player walks into the jumpscare zone. Shakes the camera, knocks the player back , then morphs
     *              them into dog form and shows a dialogue prompt explaining the new ability
     * Inputs:
     *      @param scare: the jumpscare sprite
     *      @param player: the player sprite
     * Outputs: None. Plays animation, tweens player, and shows text as side effect
     * Called By: jumpScare overlap callback in create()
     * Calls: this.jumpScare.play(), this.cameras.main.shake(), this.cameras.main.flash(),this.tweens.add(), this.player.handleMorphing(), 
     *        this.add.image(), this.add.text(), this.time.delayedCall()
     */
    jumpScarePart(scare, player) {
        // Guards against multiple calls
        if(this.playedScare) return;
        this.playedScare = true;
        // Play the animation once player gets into the middle
        this.time.delayedCall(500, () => {
            this.jumpScare.play('jumpScare');
            this.player.setVelocityX(0);
            this.isHurt = true;
            this.isLocked = true;
            this.time.delayedCall(235, () => {
                // Play the sound and shake the camera for dramatic effect
                this.thud.play();
                this.cameras.main.shake(300, 0.02);
                this.cameras.main.flash(200, 166, 160, 155);
                // Disable player movement and player jumps back
                this.tweens.add({
                    targets: this.player,
                    x: this.player.x - 500,
                    y: this.player.y - 30,
                    duration: 1000,
                    onComplete: () => {
                        // Re-enables player movement and shows dialogue
                        this.time.delayedCall(2000, () => {
                            this.player.handleMorphing('dog');
                            this.player.body.setEnable = true;
                            this.textsound.play();
                            this.diaBoxSound.play();
                            this.morphPrompt = this.add.image(1060, 700, 'morphPrompt').setScale(0.5).setScrollFactor(0);
                            this.textBox = this.add.image(300, 1350, 'textBox').setOrigin(0, 1).setScrollFactor(0).setDepth(3).setScale(2.5).setAlpha(0.9);
                            this.morphText = this.add.text(410, 1166, "What...just happened? Am I a dog?...\nwait I can smell better. (Press 1 and 2 for form switching)", {
                                fontSize: '25px', 
                                fill: '#ffffff', 
                                wordWrap: {width: 1200}}).setDepth(4).setScrollFactor(0);
                            this.time.delayedCall(5000, () => {
                                this.morphPrompt.destroy();
                                this.textBox.destroy();
                                this.morphText.destroy();
                            });
                            this.isHurt = false;
                        });
                    }
                });
            });
        });
    }

    /**
     * handleSecondVent
     * Description: Reveals the second vent cover and glow when the player (as a dog) overlaps it after the garbage has been disposed and the scent trail is active.
     * Inputs:
     *      @param vent: the second vent sprite
     *      @param player: the player sprite
     * Outputs: None: Reveals the vent cover and destroys trail as side effect
     * Called By: secondCover overlap callback in create()
     * Calls:  this.openVent.play(), this.secondCover.postFX.addGlow(), this.secondVent.postFX.addGlow(), this.secondTrail.destroy()
     */
    handleSecondVent(vent, player) {
        // Guard against multiple calls and only allows dog form to reveal
        if (!this.scentRevealed) return;
        if(this.player.getForm() !== 'dog') return;
        if (this.handledSecondVent) return;
        this.secondCover.body.setEnable(false);
        this.openVent.play();
        this.findVent = true;
        this.secondCoverOverlap = true;
        this.handledSecondVent = true;
        this.secondCover.postFX.addGlow(0xffffff, 1, 0, false, 1, 2);
        this.secondCover.setAlpha(1);
        this.secondVent.postFX.addGlow(0xffffff, 1, 0, false, 1, 2);
        this.secondTrail.destroy();
    }

    /**
     * handleFirstVent
     * Description: Reveal the first vent cover and E prompt when the player (as a dog) overlaps it.
     * Inputs: 
     *      @param vent: the vent sprite
     *      @param player: the player sprite
     * Outputs: None. Shows vent glow and E prompt as a side effect
     * Called By: firstVentCover overlap callback in create()
     * Calls: this.add.image(), this.firstVentCover.postFX.addGlow(), this.firstVentCover.setAlpha()
     */
    handleFirstVent(vent, player) {
        // Guards against multiple calls and only allows dog form to reveal
        if(this.player.getForm() !== 'dog') return;
        if (this.handledFirstVent) return;
        this.ventCoverOverlap = true;
        this.handledFirstVent = true;
        this.ePromptVent = this.add.image(vent.x + (vent.width / 2) - 15, vent.y - (vent.height * 1.2), 'e').setDepth(1).setOrigin(0, 1).setScale(0.5);
        this.firstVentCover.postFX.addGlow(0xffffff, 1, 0, false, 1, 3);
        this.firstVentCover.setAlpha(1);
    }

    /**
     * revealFirstVent
     * Description: Opens the first vent by destroying the cover, showing the vent image with a glow, and cleaning up the trail and E prompt.
     * Inputs: None
     * Outputs: None. Destroys cover and reveals vent as a side effect
     * Called By: update() when E is pressed while ventCoverOverlap is true
     * Calls: this.openVent.play(), this.firstVentCover.destroy(), this.firstVent.setVisible(), this.firstVent.postFX.addGlow(), this.firstTrail.destroy(), 
     *        this.cover1.destroy(), this.ePromptVent.destroy()
     */
    revealFirstVent() {
        this.openVent.play();
        this.firstVentCover.destroy();
        this.firstVentCover = null;
        this.ventCoverOverlap = false;
        this.firstVent.setVisible(true);
        this.firstVent.postFX.addGlow(0xffffff, 1, 0, false, 1, 2);
        this.firstTrail.destroy();
        this.cover1.destroy();
        this.ePromptVent.destroy()
    }



    /**
     * disposeGarbage
     * Description: Handles the garbage disposal interaction. Destroys the garbage item, clears the player's inventory, reveals the second scent trail, 
     *              then pans to the guard for a cutscene before returning control over to the player
     * Inputs:
     *      @param item: the disposer interactive item being used
     * Outputs: None. Destroys item, updates flags, and triggers camera pan as a side effect
     * Called By: handleInteractive() when player uses disposer with the garbage in inventory
     * Calls: item.sprite.destroy(), this.player.carriedItem, this.clearHUD(), this.tweens.add(), this.cameras.main.stopFollow(), this.cameras.main.pan(), 
     *        this.add.image(), this.add.text(), this.time.delayedCall()
     */
    disposeGarbage(item) {
        // Destroys the ite sprites to prevent multiple triggers
        item.sprite.destroy();
        this.currItem = null;
        this.ePrompt.destroy();
        this.player.carriedItem = null;
        this.currOverlapping = false;
        this.clearHUD();
        this.disposedGarbage = true;

        // Reveal scent trail.
        this.tweens.add({
            targets: this.stinky,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                this.secondTrail.setVisible(true);
                this.scentRevealed = true;
                this.isHurt = true;
                this.player.setBlocked(true);
                this.player.setVelocity(0);
                this.player.playIdle();

                // Pan down and camera zoom to guard
                this.cameras.main.stopFollow();
                this.cameras.main.pan(this.guard.x, this.guard.y, 1000, 'Power3', false, (cam, progress) => {
                    if(progress === 1) {
                        this.diaBox = this.add.image(this.guard.x - 550, this.guard.y - 350, 'diaBox2').setOrigin(0, 1).toggleFlipX().setScale(1.2).setDepth(3);
                        this.guardText = this.add.text(this.guard.x - 450, this.guard.y - 580, this.dataText.guard.doneSequence, {
                                    fontSize: '25px', 
                                    fill: '#000000', 
                                    wordWrap: {width: 300}}).setDepth(4);

                        // Pans camera back to player and resumes movement
                        this.time.delayedCall(5000, () => {
                            this.diaBox.destroy();
                            this.guardText.destroy();
                            this.cameras.main.pan(this.player.x, this.player.y, 1000, 'Power2', false, (cam, progress) => {
                                if (progress === 1) {
                                    this.cameras.main.startFollow(this.player);
                                    this.isHurt = false;
                                    this.player.setBlocked(false);
                                    
                                }
                                // Camera zoom change
                                this.tweens.add({
                                    targets: this.cameras.main,
                                    zoom: 0.6,
                                    duration: 1000,
                                    ease: 'Power2'
                                });
                            });
                        });
                    }
                    // Camera zoom change
                    this.tweens.add({
                        targets: this.cameras.main,
                        zoom: 0.8,
                        duration: 1000,
                        ease: 'Power2'
                    });
                });
            }
        });
    }

    /**
     * handleItemOverlap
     * Description: Called when the player overlaps an item. Highlights the item with a glow, setw it as the current item, and shows either an F prompt (pickupable),
     *              or an E prompt (interactives)
     * Inputs: 
     *      @param item: the item object player is currently overlapping
     * Outputs: None: Sets currItem and shows prompt as side effect
     * Called By: item overlap callbacks set up in create()
     * Calls: item.sprite.postFX.addGlow(), this.add.image()
     */
    handleItemOverlap(item) {
        // Prevents multiple calls
        if (this.currOverlapping) return;
        this.currOverlapping = true;
        this.currItem = item;
        item.sprite.postFX.addGlow(0xffffff, 5, 0, false, 0.1, 3);

        // Only pick up item if it's pick upable
        if(item.type === 'pickup'){
            this.fPrompt = this.add.image(item.sprite.x + (item.sprite.width / 2) - 14, item.sprite.y - (item.sprite.height * 1.5), 'f').setDepth(1).setOrigin(0, 1).setScale(0.5); //40 -100
            this.currItemPickupable = true;
        // Items not pickupable
        }else {
            this.ePrompt = this.add.image(item.sprite.x + (item.sprite.width / 2) - 15, item.sprite.y - (item.sprite.height * 1.2), 'e').setDepth(1).setOrigin(0, 1).setScale(0.5);
            this.currItemPickupable = false;
        }
    }

    /**
     * handleInteractive
     * Description: Routes the player's E key iteraction depending on the item type and what the player is currently carrying. Handles button presses, door puzzles,
     *              garbage disposal, and default item inspection text.
     * Inputs: 
     *      @param item: the interactive item being used
     * Outputs: None. Triggers the appropriate action as a side effect
     * Called By: update() when E is pressed and curritem is iteractive
     * Calls: this.handleSequence(), this.openFirstDoor(), this.openSecondDoor(), this.disposeGarbage(), this.add.text(), this.add.image(), this.time.delayedCall()
     */
    handleInteractive(item) {
        // Button sequence interactions
        if (item.type === 'button') {
            this.handleSequence(item.config.direction);
            return;
        }

        // Handle player interactions if they have item.
        if (this.player.carriedItem) {
            const playerKey = this.player.carriedItem.key;
            if(playerKey === 'clippers' && this.currItem.key === 'electricalPanel') {
                console.log("OPENS THE FIRST DOOR");
                this.openFirstDoor();
                return;
            }else if (playerKey === 'keyCard' && this.currItem.key === 'terminal') {
                console.log("OPENES SECOND DOOR");
                item.sprite.postFX.clear();
                this.openSecondDoor();
                return;
            }else if (playerKey === 'garbage' && this.currItem.key === 'disposer') {
                console.log("DISPOSE GARBE FOR TRAIO");
                this.chuteDoor.play();
                this.disposeGarbage(item);
                return;
            }
        }

        // If player has no item display text and dialogue box
        if (this.stillShowingText) return;
        this.stillShowingText = true;
        this.text = item.getData(item);
        console.log(this.text);
        this.textsound.play();
        this.diaBoxSound.play();
        this.itemDia = this.add.text(410, 1166, this.text, {
            fontSize: '25px', 
            fill: '#ffffff', 
            wordWrap: {width: 1200}}).setDepth(4).setScrollFactor(0);
        this.textBox = this.add.image(300, 1350, 'textBox').setOrigin(0, 1).setScrollFactor(0).setDepth(3).setScale(2.5).setAlpha(0.9);
        this.time.delayedCall(5000, () => {
            this.itemDia.destroy();
            this.textBox.destroy();
            this.stillShowingText = false;
        });
    }

    /**
     * openFirstDoor
     * Description: Opens the first door by fading it out and swapping its texture to the open state. Plays door sound and shows short message to player.
     * Inputs: None
     * Outputs: None. Changes door texture and disables its body as a side effect
     * Called By: handleInteractive() when player uses clippers on the electrical panel
     * Calls: this.doorOpenSound.play(), this.add.text(), this.add.image(), this.tweens.add(), this.doorOne.setTexture(), this.time.delayedCall()
     */
    openFirstDoor() {
        // Destroys any lingering texts and textboxes
        if(this.itemDia) this.itemDia.destroy();
        if(this.textBox) this.textBox.destroy();
        this.stillShowingText = false;
        this.electrical.sprite.body.setEnable(false);
        this.textsound.play();
        this.diaBoxSound.play();
        this.doorOpenSound.play();
        // Tweens the door to open stat and sets the alpha and displays texts
        this.itemDia = this.add.text(410, 1166, "The door opened", {
            fontSize: '25px', 
            fill: '#ffffff', 
            wordWrap: {width: 1200}}).setDepth(4).setScrollFactor(0);
        this.textBox = this.add.image(300, 1350, 'textBox').setOrigin(0, 1).setScrollFactor(0).setDepth(3).setScale(2.5).setAlpha(0.9);
        this.time.delayedCall(2500, () => {
            this.itemDia.destroy();
            this.textBox.destroy();
        });
        this.tweens.add({
            targets: this.doorOne,
            alpha: 0,
            duration: 2000,
            onComplete: () => {
                this.doorOne.setTexture('openedDoor');
                this.doorOne.setAlpha(1);
                this.doorOne.body.enable = false;
            }
        });
    }

    /**
     * openSecondDoor
     * Description: Opens the second door by fading it out and swapping its texture to the open state. Plays door sound and shows short message to player.
     * Inputs: None
     * Outputs: None. Changes door texture and disables its body as a side effect
     * Called By: handleInteractive() when player uses keycard on the terminal
     * Calls: this.doorOpenSound.play(), this.add.text(), this.add.image(), this.tweens.add(), this.doorOne.setTexture(), this.time.delayedCall()
     */
    openSecondDoor() {
        // Destroys any lingering texts and textboxes
        if(this.itemDia) this.itemDia.destroy();
        if(this.textBox) this.textBox.destroy();
        this.stillShowingText = false;
        this.textsound.play();
        this.diaBoxSound.play();
        this.terminal.sprite.body.setEnable(false);
        this.currItem = null;
        this.currOverlapping = false;
        if(this.ePrompt) this.ePrompt.destroy();
        // Tweens the door to open stat and sets the alpha and displays text
        this.itemDia = this.add.text(410, 1166, "The door opened", {
            fontSize: '25px', 
            fill: '#ffffff', 
            wordWrap: {width: 1200}}).setDepth(4).setScrollFactor(0);
        this.textBox = this.add.image(300, 1350, 'textBox').setOrigin(0, 1).setScrollFactor(0).setDepth(3).setScale(2.5).setAlpha(0.9);
        this.time.delayedCall(2500, () => {
            this.itemDia.destroy();
            this.textBox.destroy();
        });
        this.doorOpenSound.play();
        this.tweens.add({
            targets: this.doorTwo,
            alpha: 0,
            duration: 2000,
            onComplete: () => {
                this.doorTwo.setTexture('openedDoor');
                this.doorTwo.setAlpha(1);
                this.doorTwo.body.enable = false;
            }
        });
    }

    /**
     * updateHUD
     * Description: Updates the inventory HUD to show the item the player just picked up, displaying its icon in the inventory slot.
     * Inputs:
     *      @param item: the item that was picked up
     * Outputs: None. Updates HUD display as side effect
     * Called By: update() when F is pressed and a pickupable item is overlapped
     * Calls: this.inventoryDisplay.setText(), this.add.image()
     */
    updateHUD(item) {
        // Show item icon in HUD
        this.inventoryDisplay.setText(item.key);
        this.tempItem = this.add.image(this.inventory.x, this.inventory.y, item.key).setScrollFactor(0).setDepth(994);
        console.log('Carrying:', item.key);
    }

    /**
     * clearHUD
     * Description: Clears the inventory HUD and destroys the displayed item icon and any prompts
     * Inputs: None
     * Outputs: None. Clears HUD display as a side effect
     * Called By: update() when an item is dropped, disposeGarbage(), player itemDropped event
     * Calls: this.inventoryDisplay.setText(), this.tempItem.destroy(), this.fPrompt.destroy()
     */
    clearHUD () {
        // Clears item icon from HUD
        this.inventoryDisplay.setText('');
        if(this.tempItem) this.tempItem.destroy();
        if(this.fPrompt) this.fPrompt.destroy();
        console.log('Cleared HUD');
    }

    /**
     * createPlatforms
     * Description: Builds all the static collision zones, one-way platforms, and walls for Level 4. Defines the physical layout of every room,
     *              vent shaft, and walkable surface.
     * Inputs:
     *      @param thisScene: reference to current scene
     * Outputs: None. Creates physics bodies as a side effect
     * Called By: create()
     * Calls: this.addWalls(), this.addOneWayPlatforms()
     */
    createPlatforms(thisScene) {
        // The puzzle room 
        this.addWalls(54, 1773, 20, 348);
        this.addWalls(54, 1773, 472, 20);
        this.addWalls(520, 1773, 20, 245);

        // The cage section
        this.cageWall = this.addWalls(0, 0, 1070, 1800);
        this.addWalls(520, 1800, 550, 221);
        this.addWalls(0, 2116, 14485, 114);
        this.addWalls(14800, 2116, 549, 114);
        this.addWalls(15617, 2116, 4241, 114);

        this.addWalls(2955, 0, 58, 1517);
        this.addWalls(3013, 45, 8013, 937);

        // Adding first vent bottom
        this.addWalls(14500, 2437, 1077, 20);//bottom
        this.addWalls(14500, 2117, 30, 400);//left
        this.addWalls(15582, 2117, 30, 400);//right
        this.addWalls(14800, 2117, 549, 193);//top

        this.addOneWayPlatforms(3055, 1883, 1767, 30);
        this.addOneWayPlatforms(4820, 1570, 244, 20);
        this.addOneWayPlatforms(5760, 1853, 641, 20);


        this.addWalls(6956, 0, 58, 1517);

        this.addOneWayPlatforms(7745, 1570, 244, 20);
        this.addOneWayPlatforms(8881, 1570, 244, 20);
        this.addOneWayPlatforms(9976, 1470, 399, 20);

        this.addWalls(10971, 0, 56, 1517);

        this.addWalls(14975, 900, 60, 591);

        // Alarm room
        this.addWalls(11029, 900, 5154, 114);
        this.addOneWayPlatforms(11107, 689, 1516, 30);
        this.addOneWayPlatforms(13023, 689, 1700, 30);
        this.addWalls(14981, 150, 60, 196);

        // Garbage room
        this.addWalls(17343, 1390, 2681, 114);
        this.addOneWayPlatforms(18450, 1162, 1185, 30);
        this.addWalls(17996, 150, 61, 636);
        this.addWalls(20015, 150, 60, 1140);

        //Second vent
        this.addWalls(20010, 1390, 1057, 20);
        this.addWalls(20057, 712, 675, 548);
        this.addWalls(20477, 0, 585, 556);
        this.addWalls(20063, 150, 100, 506);
        this.addWalls(14970, 105, 5175, 150);

        this.cover1 = this.addWalls(14520, 2117, 205, 30);
    }

    /**
     * createDoors
     * Description: Places all door objects in the level using addDoor(). Stores references to doors that need to be opened later.
     * Inputs:
     *      @param thisScene: reference to the current scene
     * Outputs: None. Creates door physics objects as a side effect
     * Called By: create()
     * Calls: this.addDoor(), this.add.image()
     */
    createDoors(thisScene) {
        this.doorOne = this.addDoor(2923, 1484);
        this.doorTwo = this.addDoor(6925, 1485);
        this.addDoor(14945, 1499);
        this.doorThree = this.addDoor(14950, 340);
        this.add.image(17968, 924, 'openedDoor').setOrigin(0, 1);
    }

    /**
     * addDoor
     * Description: Creates a physics-enabled body door image at the given position and adds a collider between player and the door
     * Inputs:
     *      @param  x: x position of the door
     *      @param  y: y position of the door 
     * Outputs: 
     *      @return door: the door object
     * Called By: createDoors()
     * Calls: this.physics.add.image(), this.physics.add.collider()
     */
    addDoor(x, y) {
        const door = this.physics.add.image(x, y, 'closedDoor').setOrigin(0).setImmovable(true);
        this.physics.add.collider(this.player, door);
        return door;
    }

    /**
     * addWalls
     * Description: Creates static walls that match the level 4 layout background images. Adds floors and walls and any solid surfaces in the game.
     *              Adds collider between the player and the walls
     * Inputs:
     *      @param x: x position of the wall
     *      @param y: y position of the wall
     *      @param width: the width of the wall
     *      @param height: the height of the wall
     * Outputs:
     *      @returns zone: returns the zone object
     * Called By: createPlatforms()
     * Calls: this.add.zone(), this.physics.world.enable(), this.physics.add.collider()
     */
    addWalls(x, y, width, height) {
        const zone = this.add.zone(x, y, width, height).setOrigin(0);
        this.physics.world.enable(zone, Phaser.Physics.Arcade.STATIC_BODY);
        zone.body.setSize(width, height);
        this.physics.add.collider(this.player, zone);
        return zone;
    }

    /**
     * addOneWayPlatforms
     * Description: Creates static zones that only collides with the player from above. Allowing the player to jump through the sides and below
     *              but land on top of the surface
     * Inputs:
     *      @param x: x position of the one way platform
     *      @param y: y position of the one way platform
     *      @param width: width of the one way platform
     *      @param height: height of the one way platform
     * @returns 
     */
    addOneWayPlatforms(x, y, width, height) {
        const zone = this.add.zone(x, y, width, height).setOrigin(0);
        this.physics.world.enable(zone, Phaser.Physics.Arcade.STATIC_BODY);
        zone.body.setSize(width, height);
        
        // Only check collision if coming from above
        zone.body.checkCollision.down = false;
        zone.body.checkCollision.left = false;
        zone.body.checkCollision.right = false;
        this.physics.add.collider(this.player, zone);
        return zone;
    }
}