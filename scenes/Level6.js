/**
 * Author: Mei Huang
 * Program Name: Level6
 * Description: Chapter 6. The Shipment. The player navigates a large cargo ship across multiple sections. Puzzles include: opening a special locker to find a chef
 *              hat, giving the hat to the chef to gain kitchen access, ringing the bell to wake the captain and open the bunker door, sniffing the captain's bed
 *              as a dog to reveal the hidden access card, using the access card on the control room door to unlock the bookshelf and control panel, pushing the
 *              bookshelf as a human to reveal a hidffen safe, entering the correct passcode into the keypad to open the safe and collect the third antidote,
 *              and finally interacting with the control panel to transition to the crane scene. The opening sequence features a cinematic zoom-out from the ship
 *              before handing control to the player. Rain volume adjusts dynamically based on player position. Completing the level always transitions to the
 *              Crane scene.
 * Inputs: None. Reads from registry.get('secrets') for firstDLC flag and antidote collection states.
 * Outputs: None. Transitions to Crane scene on completion
 * Called By: Level5.goNext()
 * Calls: Level6, Player, Item
 */
class Level6 extends Phaser.Scene {

    /**
     * constructor
     * Description: Registers this scene with Phaser under the key 'Level6'
     * Inputs: None
     * Outputs: None
     * Called By: Phaser game when the game config is processed
     * Calls: super()
     */
    constructor() {
        super({key: 'Level6'});
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
        this.rainSound = this.sound.add('rainSound', { loop: true, volume: 0.4 });
        this.bell = this.sound.add('bell', {volume: 1, loop: false});
        this.wrong = this.sound.add('wrong', {volume: 1, loop: false});
        this.correctSeq = this.sound.add('correct', {volume: 1, loop: false});
        this.press = this.sound.add('press', {volume: 0.8, loop: false});
        this.lockerOpenSound = this.sound.add('lockerOpen', {volume: 1, loop: false});
        this.fabric = this.sound.add('fabric', {volume: 2, loop: false});
        this.moveShelf = this.sound.add('moveShelf', {volume: 1, loop: false});
        this.boat = this.sound.add('onBoat', {volume: 1, loop: true});
        this.pickup = this.sound.add('pickupSound', {volume: 1, loop: false});
        this.textsound = this.sound.add('textSound', {volume: 1, loop: false});
        this.diaBoxSound = this.sound.add('diaBox', {volume: 1, loop: false});
        this.antiPickup = this.sound.add('antiPickup', {volume: 1, loop: false});
        this.doorOpenSound = this.sound.add('doorOpen', {volume: 1, loop: false});
    }

    /**
     * create
     * Description: Builds level 6. Initializes all scene variables, spawns the player, places all items, NPS, platforms, and doors. Sets up the hint system
     *              keypad passcode interface, captain and chef sprites, scent trail, and all item overlaps. Configures the camera, inventory HUD, 
     *              and delays guard and inventory visibility until the opening sequence completes.
     * Inputs: None
     * Outputs: None. Builds level 6
     * Called By: Phaser engine after preload()
     * Calls: this.createPlatforms(), this.createDoors(), this.checkAnti(), Player constructor, Item constructor, this.physics.add.collider(), this.physics.add.overlap(),
     *        this.physics.world.setBounds(), this.add.text(), this.add.image(), this.add.rectangle(), this.add.sprite(), this.add.zone(), this.add.tileSprite(), this.tweens.add(),
     *        this.time.delayedCall(), this.anims.create(), this.cameras.main.setBounds(), this.cameras.main.startFollow(), this.cameras.main.setZoom(),
     *        this.input.keyboard.createCursorKeys(), this.handleShow(), this.checkAnti()
     */
    create() {
        // Initializes all variables
        this.worldWidth = 23972;
        this.worldHeight = 3500;
        this.cameraBeginningWidth = 14080;
        this.cameraBeginningHeight = 5632;
        this.skip = false;
        this.rainQuieted = false;
        this.rainLouder = false;

        this.currItem = null;
        this.currItemPickupable = false;
        this.currOverlapping = false;

        this.handledBookShelf = false;

        this.specialLockerOpen = false;

        this.allowKitchen = false;
        this.handledKitchen = false;
        this.handledCaptain = false;

        this.isHurt = false;
        this.handledKeyCard = false;

        this.showScent = false;
        this.showedKeyCard = false;
        this.currProcessing = false;
        this.inCutScene = false;
        this.canMorph = true;

        this.fade = null;
        this.openedDoor = false;
        this.setOpenedDoor = false;

        this.stillShowingText = false; 
        this.showHint = false;
        this.isFalling = false;
        this.tempItem = null;
        this.fPrompt = null;
        this.ePrompt = null;
        this.droppedItem = null;
        this.itemDia = null;
        this.textBox = null;
        this.text = null;


        // Create world bounds
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.physics.world.setBoundsCollision(true, true, true, true);

        // Inventory slot
        this.inventory = this.add.image(2350, 1320, 'inventory').setScrollFactor(0).setDepth(989).setAlpha(0);
        this.inventoryDisplay = this.add.text(2300, 1192, '', {
            fontSize: '20px',
            fill: '#ffffff'
        }).setScrollFactor(0).setDepth(992);

        // Adding background for level 6
        this.l1 = this.add.image(0, 0, 'lvl6-1').setOrigin(0);
        this.l2 = this.add.image(4667, 0, 'lvl6-2').setOrigin(0);
        this.l3 = this.add.image(9334, 0, 'lvl6-3').setOrigin(0);
        this.l4 = this.add.image(14001, 0, 'lvl6-4').setOrigin(0);
        this.l5 = this.add.image(18668, 0, 'lvl6-5').setOrigin(0);
        this.l1.setVisible(false);
        this.l2.setVisible(false);
        this.l3.setVisible(false);
        this.l4.setVisible(false);
        this.l5.setVisible(false);

        this.rainSound.play();
        this.boat.play();

        // Set Camera bounds
        this.cameras.main.setBounds(0, 0, this.cameraBeginningWidth, this.cameraBeginningHeight);

        // Adding player to world
        this.player = new Player(this, 57, 2818, 'catAnim', 0.9, 1.4, 1.3).setOrigin(0, 1).setDepth(992); //57, 2818
        this.player.refreshBody();
        this.player.setCollideWorldBounds(true);
        this.player.anims.play('catIdleRight');
        this.player.setVisible(false);

        // Custom listener for when player drops item
        this.player.on('itemDropped', (item) => {
            if(this.currItem && !this.currItemPickupable) {
                item.drop(this.currItem.sprite.x + this.currItem.sprite.width + 20, this.player.y - item.sprite.height + 15);
                this.clearHUD();
            }else {
                item.drop(this.player.x, this.player.y - item.sprite.height + 15);
                this.clearHUD();
            }
        });
        this.antiIcons = [];
        this.antidotes = null;

        // HUD for second playthrough
        if(!this.registry.get('secrets').firstDLC) {
            // Home button
            this.home = this.add.image(-900, -450, 'DLCHome').setOrigin(0).setDepth(999).setScrollFactor(0).setScale(0.5)
                .setInteractive().on('pointerdown', () => {this.scene.start('MenuScene'); this.rainSound.stop(); this.boat.stop();}).setAlpha(0);
            this.home.on('pointerover', () => {this.home.setScale(0.56); this.diaBoxSound.play();});
            this.home.on('pointerout', () => {this.home.setScale(0.5)});

            this.antidotes = this.add.text(-650, -450, 'Antidotes:', {
                fontSize: '26px',
                fill: '#5580d0',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 4
            }).setScrollFactor(0).setDepth(200).setAlpha(0);

            // Adding icons to an array for setting the alpha later when pieces get collected.
            this.antis = [
                'anti1',
                'anti2',
                'anti3'
            ]
            this.antis = ['anti1', 'anti2', 'anti3'];
            this.antiIcons = [];

            // Added 'i' to the arguments so the math works!
            this.antis.forEach((antiNames, i) => {
                const icon = this.add.image(-500 + (i * 50), -430, antiNames)
                    .setScrollFactor(0)
                    .setDepth(999)
                    .setScale(1.3)
                    .setAlpha(0.3); //0.3
                
                this.antiIcons.push(icon);
            });

            this.antiIcons.forEach(icon => icon.setVisible(false));

            this.checkAnti();
        }

        // Adding hint system
        this.dataText = this.cache.json.get('items');
        this.hint = this.add.image(2680, -500, 'hint')
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
        this.hintPanel = this.add.image(2138, -465, 'hintPanel').setOrigin(0).setScrollFactor(0).setDepth(996).setVisible(false).setScale(1.3);

        // Hint covers + text
        this.hintArray = [];
        if(this.registry.get('secrets').firstDLC) {
            this.hintArray = this.dataText.hints.level6;
        }else {
            this.hintArray = this.dataText.hints2.level6;
        }
        
        // Adding hint texts and hint covers
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
            //adding hint covers as well AND setting interactives
            const currCover = this.add.image(this.hintPanel.x + 50, currentY, 'hintCover')
                .setOrigin(0)
                .setScrollFactor(0)
                .setDepth(999)
                .setInteractive()
                .on('pointerdown', () => this.handleRemoveCover(currCover)).setVisible(false).setScale(1.3);
            currCover.setInteractive().on('pointerover', () => {currCover.setScale(1.34); this.diaBoxSound.play();});
            currCover.setInteractive().on('pointerout', () => {currCover.setScale(1.3)});
            this.hintCovers.push(currCover);
            // Space between each hint
            currentY += 102;
        });

        // Skipping the cut scene if the player has played the game twice
        if(!this.skip || !this.registry.get('secrets').firstDLC) {
            const backRect = this.add.rectangle(-960, -520, 1920/0.5, 1080/0.2, 0x0a0a0a)
                .setAlpha(1).setOrigin(0).setDepth(999).setScrollFactor(0);

            
            // Adding backgrounds for zooming
            this.section1 = this.add.image(0, 0, 'section1lvl6').setOrigin(0).setDepth(998).setAlpha(0);
            this.section1_1 = this.add.image(0, 3747, 'section1-1').setOrigin(0).setDepth(998).setAlpha(0);
            this.section2 = this.add.image(4702, 0, 'section2lvl6').setOrigin(0).setDepth(998).setAlpha(0);
            this.section2_1 = this.add.image(4700, 3747, 'section2-1').setOrigin(0).setDepth(998).setAlpha(0);
            this.section3 = this.add.image(9402, 0, 'section3lvl6').setOrigin(0).setDepth(998).setAlpha(0);
            this.section3_1 = this.add.image(9402, 3747, 'section3-1').setOrigin(0).setDepth(998).setAlpha(0);

            // Fade into level and show Chapter title
            const fadeIntro = this.add.rectangle(-960, -520, 1920/0.5, 1080/0.2, 0x0a0a0a)
                .setAlpha(1).setOrigin(0).setDepth(999).setScrollFactor(0);
            this.tweens.add({
                targets: [fadeIntro],
                alpha: 0,
                duration: 4500,
                onComplete: () => { 
                    fadeIntro.destroy();
                    this.tweens.add({
                        targets: [this.section1, this.section1_1, this.section2, this.section2_1, this.section3, this.section3_1],
                        alpha: 1,
                        duration: 5000,
                        onComplete: () => {
                        }
                    });
                }
            });

            // Chapter title 
            this.title = this.add.text(226, 424, "Chapter 6\n\nThe Shipment", {
                fontSize: '60px',
                fill: '#94aebd'   // NOTE: change colour to match level3 palette
            }).setOrigin(0).setDepth(999).setScrollFactor(0);
            this.time.delayedCall(4000, () => { this.title.destroy() });

            this.player.setBlocked(true);
            this.fade = this.add.rectangle(0, 0, this.cameraBeginningWidth, this.cameraBeginningHeight, 0x000000)
                .setOrigin(0, 0)
                .setAlpha(0.3)
                .setScrollFactor(1)
                .setDepth(998);

            // Camera zoom
            this.cameras.main.centerOn(this.player.x, this.player.y);
            this.cameras.main.startFollow(this.player);
            this.cameras.main.setZoom(1.5);

            // Zooming out and setting up the scene
            this.time.delayedCall(5000, () => {
                this.cameras.main.zoomTo(0.205, 4000, 'Sine.easeInOut', false, (cam, progress) => {
                    backRect.destroy();
                    if(progress === 1) {
                        // Zoom complete, give player control
                        this.player.setBlocked(false);
                        this.tweens.add({
                            targets: this.rain,
                            alpha: 0.6,
                            duration: 2000,
                            ease: 'Sine.easeInOut'
                        });
                        this.time.delayedCall(1000, () => {
                            this.tweens.add({
                                targets: [this.fade, this.hint, this.antidotes, this.inventory],
                                alpha: 1,
                                duration: 2400,
                                ease: 'Sine.easeInOut',
                                onComplete: () => {
                                    this.section1.destroy()
                                    this.section1_1.destroy();
                                    this.section2.destroy();
                                    this.section2_1.destroy();
                                    this.section3.destroy();
                                    this.section3_1.destroy();
                                    // Player
                                    this.player.setPosition(300, 0);
                                    this.cameras.main.startFollow(this.player);
                                    this.cameras.main.setZoom(0.5);
                                    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
                                    this.cameras.main.setFollowOffset(0, 150);
                                    this.l1.setVisible(true);
                                    this.l2.setVisible(true);
                                    this.l3.setVisible(true);
                                    this.l4.setVisible(true);
                                    this.l5.setVisible(true);
                                    this.player.setPosition(57, 2818);

                                    this.tweens.add({
                                        targets: this.fade,
                                        alpha: 0,
                                        duration: 1000,
                                        ease: 'Sine.easeInOut',
                                        onComplete: () => {
                                            this.fade.destroy();
                                            this.player.setBlocked(false);
                                            this.player.setVisible(true);
                                            this.antiIcons.forEach(icon => icon.setVisible(true));
                                            if(this.home) this.home.setAlpha(1);
                                        } 
                                    });
                                }
                            });
                        });
                    }
                })
            });
        }


        // Adding the rain effect
        this.rain = this.add.tileSprite(0, 0, 13426, 5632, 'rain')
            .setOrigin(0, 0)
            .setScrollFactor(1)
            .setDepth(999)
            .setAlpha(0.3);
        
        // Camera following player again
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(0.6);
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.setFollowOffset(0, 150);

        // Setting up cursor keys wasd
        this.cursors = this.input.keyboard.createCursorKeys();
        this.cursors.keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        this.cursors.keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.cursors.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.numKeys = this.input.keyboard.addKeys({
            one: Phaser.Input.Keyboard.KeyCodes.ONE,
            two: Phaser.Input.Keyboard.KeyCodes.TWO,
            three: Phaser.Input.Keyboard.KeyCodes.THREE
        });

        // Items
        const itemData = this.cache.json.get('items');
    
        this.items = [
            new Item(this, this.player, {key: 'locker', weight: 'none', x: 16257, y: 2813, type: 'locker', sizeX: 'default', sizeY: 'default'}, itemData),
            new Item(this, this.player, {key: 'locker', weight: 'none', x: 16503, y: 2813, type: 'locker', sizeX: 'default', sizeY: 'default'}, itemData),
            new Item(this, this.player, {key: 'locker', weight: 'none', x: 16749, y: 2813, type: 'locker', sizeX: 'default', sizeY: 'default'}, itemData),
            new Item(this, this.player, {key: 'locker', weight: 'none', x: 16995, y: 2813, type: 'locker', sizeX: 'default', sizeY: 'default'}, itemData),
            new Item(this, this.player, {key: 'locker', weight: 'none', x: 17241, y: 2813, type: 'lockerSp', sizeX: 'default', sizeY: 'default'}, itemData),
            new Item(this, this.player, {key: 'locker', weight: 'none', x: 17487, y: 2813, type: 'locker', sizeX: 'default', sizeY: 'default'}, itemData),
            new Item(this, this.player, {key: 'locker', weight: 'none', x: 17733, y: 2813, type: 'locker', sizeX: 'default', sizeY: 'default'}, itemData),
            new Item(this, this.player, {key: 'locker', weight: 'none', x: 17979, y: 2813, type: 'locker', sizeX: 'default', sizeY: 'default'}, itemData),
            this.guard1 = new Item(this, this.player, {key: 'guardShip', weight: 'none',  x: 3592, y: 2810, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData),
            this.guard = new Item(this, this.player, {key: 'guardShip', weight: 'none',  x: 3998, y: 2810, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData),
            this.guardDog1 = new Item(this, this.player, {key: 'guardShipDog', weight: 'none',  x: 7959, y: 2815, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData),
            this.guardDog = new Item(this, this.player, {key: 'guardShipDog', weight: 'none',  x: 8579, y: 2815, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData),
            this.bookShelf = new Item(this, this.player, {key: 'bookshelf', weight: 'none',  x: 15613, y: 1414, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData), //come back to handle in handleInteractyive
            // new Item(this, this.player, {key: 'chef', weight: 'none',  x: 21445, y: 2808, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData),
            this.control = new Item(this, this.player, {key: 'control', weight: 'none',  x: 13794, y: 1355, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData),
            this.hat = new Item(this, this.player, {key: 'hat', weight: 'none', x: 17247, y: 2285, type: 'pickup', sizeX: 'default', sizeY: 'default'}, itemData),
            this.bellImage = new Item(this, this.player, {key: 'bell', weight: 'none', x: 22794, y: 2500, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData),
            this.access = new Item(this, this.player, {key: 'accessCard1', weight: 'none', x: 23039, y: 532, type: 'pickup', sizeX: 'default', sizeY: 'default'}, itemData),
            this.controlDoor = new Item(this, this.player, {key: 'door6', weight: 'none', x: 15910, y: 1357, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData),
            new Item(this, this.player, {key: 'bed1', weight: 'none', x: 18871, y: 543, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData),
            new Item(this, this.player, {key: 'bed2', weight: 'none', x: 20638, y: 722, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData),
            this.bed = new Item(this, this.player, {key: 'bed3', weight: 'none', x: 22371, y: 732, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData),
            new Item(this, this.player, {key: 'bed4', weight: 'none', x: 18889, y: 1311, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData),
            new Item(this, this.player, {key: 'bed5', weight: 'none', x: 20638, y: 1202, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData),
            new Item(this, this.player, {key: 'bed6', weight: 'none', x: 22371, y: 1173, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData),
            this.passInteractive = new Item(this, this.player, {key: 'passInteractive', weight: 'none', x: 15609, y: 852, type: 'branching', sizeX: 'default',sizeY: 'default'}, itemData),
            this.anti3 = new Item(this, this.player, {key: 'anti3', weight: 'none', x: 15659, y: 830, type: 'pickup', sizeX: 'default',sizeY: 'default'}, itemData)
        ];

        // Setting visibility for certain sprites toggle flip certain sprites. Setting up the NPC and main items
        this.guard1.sprite.setVisible(false);
        this.guard.sprite.setVisible(false);
        this.guardDog1.sprite.setVisible(false);
        this.guardDog.sprite.setVisible(false);
        this.inventory.setVisible(false);
        this.time.delayedCall(12000, () => {
            this.guard1.sprite.setVisible(true);
            this.guard.sprite.setVisible(true);
            this.guardDog1.sprite.setVisible(true);
            this.guardDog.sprite.setVisible(true);
            this.inventory.setVisible(true);
        })

        this.guard.sprite.toggleFlipX();
        this.guardDog.sprite.toggleFlipX();
        this.chef = this.physics.add.image(21445, 2134, 'chef').setOrigin(0).setImmovable(true);
        this.hat.sprite.setVisible(false).setDepth(900);
        this.hat.sprite.body.setEnable(false);
        this.hat.sprite.setAngle(45);
        this.hat.sprite.setSize(123, 92).setOffset(20, 55); 
        this.physics.add.collider(this.player, this.chef, () => this.handleChef(), null, this);

        this.access.sprite.setAlpha(0).setDepth(700);
        this.access.sprite.body.setEnable(false);

        this.bed.sprite.setVisible(false).setDepth(510);

        this.passInteractive.sprite.setDepth(400).setScale(0.18);
        this.passInteractive.sprite.body.setEnable(false);
        this.passInteractive.sprite.setVisible(false);

        // Bookshelf and controls should not be allowed turn off body
        this.openedSafe = this.add.image(15609, 852, 'openedSafe').setOrigin(0, 1).setScale(0.18).setDepth(399);
        this.openedSafe.setVisible(false);
        this.anti3.sprite.setScale(1.3);
        this.anti3.sprite.setVisible(false);
        this.anti3.sprite.setDepth(400);
        this.anti3.sprite.body.setEnable(false);
        this.bookShelf.sprite.body.setEnable(false);
        this.control.sprite.body.setEnable(false);

        // Adding overlap for all item sprites
        this.items.forEach(item => {
            this.physics.add.overlap(this.player, item.sprite, () => {this.handleItemOverlap(item);}, null, this);
        });

        // Creating platforms and doors
        this.createPlatforms();
        this.createDoors();

        // Captain bed 
        this.capBed = this.add.image(22358, 216, 'capBed').setOrigin(0).setDepth(500);
        this.capBed.setVisible(false);

        //Captain sprite
        this.captainWaking = this.add.sprite(22450, 675, 'captain').setOrigin(0).setScale(1.4);
        this.captainWaking.setFrame(16);
        this.captainWaking.setVisible(false).setDepth(600);

        if(!this.anims.exists('captainWalking')) {
            this.anims.create({
                key: 'captainWalking',
                frames: this.anims.generateFrameNumbers('captain', {start: 15, end: 0}),
                frameRate: 5,
                repeat: -1
            });
        }

        // Scent trail
        this.scent = this.add.image(21268, 427, 'scent6').setOrigin(0);
        this.scent.setAlpha(0);

        // Adding HUD for the passcode interactive
        this.pass = this.add.image(-250, -200, 'pass').setOrigin(0);
        this.pass.setScrollFactor(0).setDepth(990).setScale(1.7);

        const btnPos = [
            {key: 'a', x: 255, y: 218},
            {key: 'k', x: 421, y: 218},
            {key: 'l', x: 592, y: 218},
            {key: 'm', x: 255, y: 338},
            {key: 'n', x: 421, y: 338},
            {key: 's', x: 592, y: 338},
            {key: '2', x: 255, y: 457},
            {key: '3', x: 421, y: 457},
            {key: '4', x: 592, y: 457},
            {key: '7', x: 255, y: 572},
            {key: '8', x: 421, y: 572},
            {key: '9', x: 592, y: 572},
            {key: 'enter', x: 255, y: 751}

        ];
        this.playerNum = '';
        this.correctSequence = 'L S K 2 4 9 ';
        this.btns = [];
        // Buttons for the passcode
        btnPos.forEach(btn => {
            const numPad = this.add.image((btn.x * 1.7) - 540, (btn.y - 200) * 1.7, btn.key).setOrigin(0).setDepth(991).setScrollFactor(0).setScale(1.7);
            numPad.setInteractive().on('pointerdown', () => this.handleKeyPad(btn.key));
            numPad.on('pointerover', () => {numPad.setScale(1.8); numPad.postFX.addGlow(0xffffff, 2, 0, false, 0.1, 2);});
            numPad.on('pointerout', () => {numPad.setScale(1.7); numPad.postFX.clear();});
            this.btns.push(numPad);
        });

        // Access denied
        this.denied = this.add.image(1190, 900, 'denied').setOrigin(0).setScrollFactor(0).setDepth(991).setScale(1.7);
        this.granted = this.add.image(1150, 900, 'granted').setOrigin(0).setScrollFactor(0).setDepth(991).setScale(1.7);
        this.granted.setVisible(false);

        // Player input keys
        this.displayText = this.add.text(1220, 430, '', {
            fontSize: '140px',
            fill: '#ffffff'
        }).setScrollFactor(0).setDepth(992);

        // Adding leave button for the safe and setting the buttons to invisible to start
        this.leaveBtn = this.add.image(-500, -250, 'leave').setOrigin(0).setScrollFactor(0).setScale(1.5).setDepth(995).setInteractive().on('pointerdown', () => this.handleLeave());
        this.leaveBtn.on('pointerover', () => { this.leaveBtn.setScale(1.6); });
        this.leaveBtn.on('pointerout', () => { this.leaveBtn.setScale(1.5); });

        this.btns.forEach(btn => {
            btn.setVisible(false);
        });
        this.pass.setVisible(false);
        this.denied.setVisible(false);
        this.displayText.setVisible(false);
        this.leaveBtn.setVisible(false);

    }

    /**
     * update
     * Description: Runs every frame. Handles rain tile scrolling, dynamic rain volume based on player x position, item overlap proximity checks, F key drop and pickup,
     *              E key interaction routing, scent trail visibility when the captain has been handled and player is in dog form, and passes input state to the player
     *              each frame.
     * Inputs: None
     * Outputs: None. Updates game state every frame
     * Called By: Phaser engine once per frame
     * Calls: this.items[].update(), this.player.update(), this.player.carriedItem, this.player.dropItem(), this.player.pickUp(), this.player.playTug(),
     *        this.handleInteractive(), this.updateHUD(), this.clearHUD(), this.checkAnti(), this.tweens.add(), this.time.delayedCall(), this.add.text(),
     *        this.add.image(), Phaser.Input.Keyboard.JustDown(), Phaser.Math.Distance.Between()
     */
    update() {
        // Rain tile sprite movement
        this.rain.tilePositionY -= 8;
        this.rain.tilePositionX += 2;

        // Catches E and F key interaction
        const justPressedE = Phaser.Input.Keyboard.JustDown(this.cursors.keyE);
        const justPressedF = Phaser.Input.Keyboard.JustDown(this.cursors.keyF);
        const justPressedM = Phaser.Input.Keyboard.JustDown(this.cursors.keyM);

        // Change volume when playuer coords is past 13366 for rain 
        if(!this.rainQuieted && this.player.x > 13366) {
            this.rainQuieted = true;
            this.rainLouder = false;
            this.tweens.add({
                targets: this.rainSound,
                volume: 0.17,
                duration: 2000,
                ease: 'Sine.easeInOut'
            });
        } else if(this.rainQuieted && !this.rainLouder && this.player.x < 13366) {
            this.rainLouder = true;
            this.rainQuieted = false;
            this.tweens.add({
                targets: this.rainSound,
                volume: 0.4,
                duration: 2000,
                ease: 'Sine.easeInOut'
            });
        }


        // Update all items each frame
        //this.items.forEach(item => item.update());

        // Get rid of item highlight when out of proximity and destroys F and E prompts
        if(this.currItem) {
            const itemDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.currItem.sprite.x, this.currItem.sprite.y);
            const itemRightBound = this.player.x >= (this.currItem.sprite.x+this.currItem.sprite.body.width);
            const itemLeftBound =  (this.player.x+this.player.body.width) <= this.currItem.sprite.x;
            const itemHeightBound = this.player.y <= (this.currItem.sprite.y - this.currItem.sprite.body.height);
            if(itemHeightBound || itemLeftBound || itemRightBound) {
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

        // Once player moved Captain and if player is in dog form in bunker show scent
        if(this.handledCaptain) {
            if(this.player.getForm() === 'dog') {
                this.scent.setAlpha(1);
            }else {
                this.scent.setAlpha(0);
            }
        }

        // Handles F interactions
        if (justPressedF && !this.inCutScene) {
            // Handles when player is already carrying an item is not in the air
            if(this.player.carriedItem && this.player.body.onFloor()) {
                // Guard against dropping it in front of interactive items cant pick it back up again.
                if (this.currItem) {
                        // Guard against overlapping messages
                        if (this.stillShowingText) return;
                        this.stillShowingText = true;
                        this.textsound.play();
                        this.diaBoxSound.play();
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

                // Drops the item
                this.droppedItem = this.player.dropItem();
                this.droppedItem.drop(this.player.x, this.player.y - this.droppedItem.sprite.height + 15);
                this.clearHUD();
            
            } else if (this.currItem && this.currItemPickupable){
                // Handles if items cannot be picked up because it's too heavy
                if(this.currItem.config.key !== 'anti3' && !this.currItem.canCarry(this.player.getForm())){
                    this.player.playTug();
                    // Shows dialogue for items that are too heavy for that form
                    if (this.stillShowingText) return;
                    this.stillShowingText = true;
                    this.textsound.play();
                    this.diaBoxSound.play();
                    this.itemDia = this.add.text(410, 1166, "This is too heavy for me...", {
                        fontSize: '25px', 
                        fill: '#ffffff', 
                        wordWrap: {width: 1200}}).setDepth(994).setScrollFactor(0);
                    this.textBox = this.add.image(300, 1350, 'textBox').setOrigin(0, 1).setScrollFactor(0).setDepth(3).setScale(2.5).setAlpha(0.9).setDepth(993);
                    this.time.delayedCall(1500, () => {
                        this.itemDia.destroy();
                        this.textBox.destroy();
                        this.stillShowingText = false;
                    });
                }else {
                    // Handles picking up the antidote
                    if(this.currItem.config.key === 'anti3') {
                        this.antiPickup.play();
                        // Anitdote dont pick up, put in the HUD and just light it up
                        this.anti3.sprite.destroy();
                        this.currItem = null;
                        this.currOverlapping = false;
                        if(this.fPrompt) this.fPrompt.destroy();
                        this.registry.get('secrets').anti3 = true;
                        this.checkAnti();

                    // Handles picking up the item
                    }else {
                        this.pickup.play();
                        console.log(this.currItem);
                        console.log("PICKING UP ITEM");
                        this.updateHUD(this.currItem);
                        this.player.pickUp(this.currItem);
                        this.currItem.sprite.setVisible(false);
                        this.currItem.sprite.body.setEnable(false);
                        this.currItem.sprite.refreshBody();
                        if(this.ePrompt) this.ePrompt.destroy();
                        if(this.fPrompt) this.fPrompt.destroy();
                    }
                    
                }

            } 
        }

        // Handles E interactions
        if (justPressedE) {
            if(!this.currItem || this.currItemPickupable) return;
            console.log("NO NEED TO RETURN");
            this.handleInteractive(this.currItem);
        }
        

        // Updates the player
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
        this.hintPanel.setVisible(false);
        //cycle through the array and show
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
     * updateHUD
     * Description: Updates the inventory HUD to show the item the player just picked up, displaying its icon in the inventory slot.
     * Inputs:
     *      @param item: the item that was picked up
     * Outputs: None. Updates HUD display as side effect
     * Called By: update() when F is pressed and a pickupable item is overlapped
     * Calls: this.inventoryDisplay.setText(), this.add.image()
     */
    updateHUD(item) {
        // TODO: show item icon in HUD
        this.inventoryDisplay.setText(item.key);
        this.tempItem = this.add.image(this.inventory.x, this.inventory.y, item.key).setScrollFactor(0).setDepth(10);
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
    clearHUD() {
        // TODO: clear item icon from HUD
        this.inventoryDisplay.setText('');
        if(this.tempItem) this.tempItem.destroy();  // ADD null check
        if(this.fPrompt) this.fPrompt.destroy();
        console.log('Cleared HUD');
    }

    /**
     * handleBookShelf
     * Description: Handles the bookshelf push interaction. Blocks the player, tweens the bookshelf to the left, then reveals the hidden safe interface after a delay.
     *              Guards against repeat calls with a flag.
     * Inputs: None
     * Outputs: None. Moves bookshelf and reveals safe as a side effect
     * Called By: handleInteractive() when player interacts with bookshelf as human
     * Calls: this.player.setVelocity(), this.player.setBlocked(), this.player.playIdle(), this.tweens.add(), this.time.delayedCall(), this.handleShow(),
     *        this.passInteractive.sprite.body.setEnable(), this.passInteractive.sprite.setVisible()
     */
    handleBookShelf() {
        if(this.handledBookShelf) return;
        this.handledBookShelf = true;
        if(this.itemDia) this.itemDia.destroy();
        if(this.textBox) this.textBox.destroy();
        this.stillShowingText = false;
        this.player.setVelocity(0);
        this.player.setBlocked(true);
        this.currItem.sprite.postFX.clear();
        this.bookShelf.sprite.body.setEnable(false);
        if(this.ePrompt) this.ePrompt.destroy();
        this.currOverlapping = false;
        this.currItem = null;
        
        
        // Move bookshelf
        this.tweens.add({
            targets: this.bookShelf.sprite,
            x: 15217,
            duration: 3000,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                // Show the HUD for the pass and blurr background set leaveBtn visible
                this.time.delayedCall(1500, () => {
                    if(this.itemDia) this.itemDia.destroy();
                    if(this.textBox) this.textBox.destroy();
                    this.player.setVisible(false);
                    this.player.playIdle();
                    this.passInteractive.sprite.body.setEnable(true);
                    this.passInteractive.sprite.setVisible(true);
                    this.handleShow();
                });
            }
        });
        
    }

    /**
     * handleLeave
     * Description: Hides the keypad passcode interface, destroys the fade overlay, re-enables the player, and resets the input state so the player can try
     *              the code again.
     * Input: None
     * Outputs: None. Hides keypad interface and restores player control as a side effect
     * Called By: leaveBtn pointerdown event in create)_, handleEnter() on correct code
     * Calls: this.fade.destroy(), this.btns[].setVisible(), this.player.setVisible(), this.player.setVelocity(), this.player.setBlocked(), this.pass.setVisible(),
     *        this.denied.setVisible(), this.displayText.setVisible(), this.leaveBtn.setVisible()
     */
    handleLeave() {
        if(this.itemDia) this.itemDia.destroy();
        if(this.textBox) this.textBox.destroy();
        this.stillShowingText = false;
        if(this.fade) this.fade.destroy();
        if(this.ePrompt) this.ePrompt.destroy();

        // Hides all pass code buttons and hides entire interface
        this.btns.forEach(btn => {
            btn.setVisible(false);
        });
        this.player.setVisible(true);
        this.player.setVelocity(0);
        this.player.setBlocked(false);

        this.pass.setVisible(false);
        this.denied.setVisible(false);
        this.displayText.setVisible(false);
        this.leaveBtn.setVisible(false);
        this.playerNum = '';
        this.displayText.setText('');
    }

    /**
     * handleShow
     * Description: Shows the keypad passcode interface by adding a fade overlay and making all keypad buttons, the pass panel, denied indicator,
     *              display text, and leave button visible. Blocks player movement while the interface is open.
     * Inputs: None
     * Outputs: None. Shows keypad interface as a side effect
     * Called By: handleBookShelf(), handleInteractive() when passInteractive is pressed
     * Calls: this.add.rectangle(), this.player.setVisible(), this.player.setVelocity(), this.player.setBlocked(), this.btns[].setVisible(), this.pass.setVisible(),
     *        this.denied.setVisible(), this.displayText.setVisible(), this.leaveBtn.setVisible()
     */
    handleShow() {
        // Adds a fade to the background behind safe
        this.fade = this.add.rectangle(-850, -550, 1920, 1080, 0x000000)
            .setOrigin(0)
            .setAlpha(0.6)
            .setScrollFactor(0)
            .setDepth(700)
            .setScale(2);

        // Sets safe interface to visible
        this.player.setVisible(false);
        this.player.setVelocity(0);
        this.player.setBlocked(true);

        this.btns.forEach(btn => {
            btn.setVisible(true);
        });
        this.pass.setVisible(true);
        this.denied.setVisible(true);
        this.displayText.setVisible(true);
        this.leaveBtn.setVisible(true);        
    }

    /**
     * handleKeyPad
     * Description: Handles a keypad button press. Appends the pressed key to the player's input string and updates the display text. Triggers handleEnter(),
     *              when Enter is pressed and the input is at max length. Guards against input beyong max length.
     * Inputs:
     *      @param key: the key label of the button that was pressed
     * Outputs: None. Updates the playerNum and displayText as a side effect
     * Called By: keypad button pointerdown events in create()
     * Calls: this.press.play(), this.handleEnter(), this.displayText.setText()
     */
    handleKeyPad(key) {
        // Guards against multiple calls
        if(this.currProcessing) return;
        if(key === 'enter') {
            if(this.playerNum.length === 12) {
                this.currProcessing = true;
                this.handleEnter();
                return;
            }
            return;
        } // Max inputs
        if(this.playerNum.length === 12) { 
            return
        }

        // Update the display to show what player pressed
        this.press.play();
        this.playerNum += key.toUpperCase() + ' ';
        this.displayText.setText(this.playerNum);
    }

    /**
     * handleEnter
     * Description: Validates the player's entered code against the correct sequence. On success, plays the correct sound, hides the passcode interface, and
     *              reveals the opened safe and third antidote. On failure, plays the wrong sound and resets the input.
     * Inputs: None
     * Outputs: None. Reveals safe and antidote or resets input as a side effect
     * Called By: handleKeyPad(), this.wrong.play(), this.handleLeave()
     * Calls: this.correctSeq.play(), this.wrong.play(), this.handleLeave(), this.openedSafe.setVisible(), this.anti3.sprite.setVisible(),
     *        this.anti3.sprite.body.setEnable(), this.passInteractive.sprite.body.setEnable(), this.time.delayedCall(), this.btns[].destroy()
     */
    handleEnter() {
        // Checks player input and correct sequence if correct blink green and show safe and antidote
        if(this.playerNum === this.correctSequence) {
            this.denied.setVisible(false);
            this.granted.setVisible(true);
            this.correctSeq.play();
            this.granted.setVisible(true);
            this.time.delayedCall(1500, () => {
                this.pass.setVisible(false);
                this.btns.forEach(btn => {
                    btn.destroy();
                });
                this.handleLeave();
                this.currItem = null;
                this.currOverlapping = null;
                this.granted.setVisible(false);
                if(this.ePrompt) this.ePrompt.destroy();
                this.passInteractive.sprite.body.setEnable(false);
                this.passInteractive.sprite.setVisible(false);
                this.openedSafe.setVisible(true);
                this.anti3.sprite.setVisible(true);
                this.anti3.sprite.body.setEnable(true);
            });
        
        // If wrong handles wrong input
        }else {
            this.wrong.play();
            this.playerNum = '';
            this.displayText.setText('');
        }
        this.currProcessing = false;
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
        if (this.currOverlapping) return;
        this.currOverlapping = true;
        this.currItem = item;
        item.sprite.postFX.addGlow(0xffffff, 2, 0, false, 0.1, 2);
      

        // Only pick up item if it's pick upable
        if(item.type === 'pickup'){
            this.fPrompt = this.add.image(item.sprite.x + (item.sprite.width / 2) - 14, item.sprite.y - (item.sprite.height * 1.5), 'f').setDepth(700).setOrigin(0, 1).setScale(0.5); //40 -100
            this.currItemPickupable = true;

        // Only E interactive items
        }else {
            if(item.key === 'door6') {
                this.ePrompt = this.add.image(item.sprite.x + (item.sprite.width / 2) - 15, item.sprite.y - (item.sprite.height * 0.7), 'e').setDepth(700).setOrigin(0, 1).setScale(0.5);
            }else if(item.key === 'bookshelf'){
                this.ePrompt = this.add.image(item.sprite.x + (item.sprite.width / 2) - 15, item.sprite.y - (item.sprite.height * 1.03), 'e').setDepth(700).setOrigin(0, 1).setScale(0.5);
            }else if (item.key === 'passInteractive'){
                this.ePrompt = this.add.image(item.sprite.x + (item.sprite.width / 2 * 0.18) - 15, item.sprite.y - (item.sprite.height * 2 *0.18), 'e').setDepth(800).setOrigin(0, 1).setScale(0.5);
            }else {
                this.ePrompt = this.add.image(item.sprite.x + (item.sprite.width / 2) - 15, item.sprite.y - (item.sprite.height * 1.2), 'e').setDepth(800).setOrigin(0, 1).setScale(0.5);

            }
            // Current item cannot be pickedup
            this.currItemPickupable = false;
        }
    }

    /**
     * handleChef
     * Description: Handles the player colliding with the chef at the kitchen entrance. Blocks entry unless the player is human and carrying the chef hat. Shows
     *              form-specific dialogue for invalid attempts and knocks the player back. On success, allows kitchen access and disables the chef collider.
     * Inputs: None
     * Outputs: None. Grants or denies kitchen access and shows dialogue as a side effect
     * Called By: chef collider callback in create()
     * Calls: this.player.setBlocked(), this.player.setVelocity(), this.player.playIdle(), this.player.getForm(), this.add.text(), this.add.image(), this.tweens.add(),
     *        this.time.delayedCall(), this.textsound.play(), this.diaBoxSound.play(), this.chef.body.setEnable()
     */
    handleChef() {
        // Only handles the chef once
        if(this.allowKitchen) return;
        if(this.handledKitchen) return;
        if(this.inCutScene) return;
        this.handledKitchen = true;
        this.inCutScene = true;
        this.player.setBlocked(true);
        this.player.setVelocity(0);
        this.player.playIdle();
        this.canMorph = false;

        // Can pass if player has a hat and is human
        if (this.player.carriedItem && this.player.getForm() === 'human'){
            this.player.setBlocked(true);
            this.player.setVelocity(0);
            const carriedItem = this.player.carriedItem.key;
            if(carriedItem === 'hat') {
                this.allowKitchen = true;
                this.player.playIdle();
                if (this.stillShowingText) return;
                this.stillShowingText = true;
                this.textsound.play();
                this.diaBoxSound.play();
                this.text = "Chef: Okay got your hat, nice, help me prep food for the rest of the crew. We ring the bell when the food is done, don't get trigger happy now.";
                this.itemDia = this.add.text(410, 1166, this.text, {
                    fontSize: '25px', 
                    fill: '#ffffff', 
                    wordWrap: {width: 1200}}).setDepth(994).setScrollFactor(0);
                this.textBox = this.add.image(300, 1350, 'textBox').setOrigin(0, 1).setScrollFactor(0).setDepth(3).setScale(2.5).setAlpha(0.9).setDepth(993);
                this.time.delayedCall(5000, () => {
                    this.itemDia.destroy();
                    this.textBox.destroy();
                    this.stillShowingText = false;
                    this.handledKitchen = false;
                    this.player.setBlocked(false);
                    this.chef.body.setEnable(false);;
                });
                this.inCutScene = false;
                this.canMorph = true;
                return;
            }
            this.allowKitchen = true;
            this.handledKitchen = false;
            this.player.setBlocked(false);
            this.canMorph = true;
            return;
        }

        // Show text for wrong form or no item and do not allow access to kitchen
        if (this.stillShowingText) {
            this.handledKitchen = false;
            this.player.setBlocked(false);
            this.canMorph = true;
            return;
        }
        
        // Show text for incorrect forms or no item
        this.stillShowingText = true;
        this.textsound.play();
        this.diaBoxSound.play();
        this.text = this.dataText.chef.forms[this.player.getForm()];
        this.itemDia = this.add.text(410, 1166, this.text, {
            fontSize: '25px', 
            fill: '#ffffff', 
            wordWrap: {width: 1200}}).setDepth(994).setScrollFactor(0);
        this.textBox = this.add.image(300, 1350, 'textBox').setOrigin(0, 1).setScrollFactor(0).setDepth(3).setScale(2.5).setAlpha(0.9).setDepth(993);
        this.time.delayedCall(4000, () => {
            this.itemDia.destroy();
            this.textBox.destroy();
            this.stillShowingText = false;
            this.inCutScene = false;
            this.player.setBlocked(false);
            this.handledKitchen = false;
            this.canMorph = true;
        });

        // Knock player back and display text
        this.tweens.add({
            targets: this.player,
            x: this.player.x - 100,
            y: this.player.y - 20,
            duration: 1000
        });
    }

    /**
     * handleInteractive
     * Description: Routes the player's E key interaction depending on the item type and what the player is currently carrying. Handles access card door unlock, locker
     *              opening, special locker, bell ringing, bed sniffing, bookshelf pushing, passcode interface, control panel transition, and default item inspection text.
     * Inputs: 
     *      @param item: the interactive item being used
     * Outputs: None. Triggers the appropriate action as a side effect
     * Called By: update() when E is pressed and curritem is iteractive
     * Calls: this.handleKeyCard(), this.specialLocker(), this.handleCaptain(), this.handleSniffKey(), this.handleBookShelf(), this.handleShow(), this.lockerOpenSound.play(), 
     *        this.bell.play(), this.fabric.play(), this.moveShelf.play(), this.add.text(), this.add.image(), this.time.delayedCall(), this.scene.start()
     */
    handleInteractive(item) {
        // Handles interactive if player is carrying an item
        if (this.player.carriedItem){
            const carriedItem = this.player.carriedItem.key;
            if(carriedItem === 'accessCard1' && item.key === 'door6') {
                this.bookShelf.sprite.body.setEnable(true);
                this.control.sprite.body.setEnable(true);
                this.handleKeyCard();
                return;
            }
        
        }
        
        // Puzzle interactives for all interactive items
        if(item.config.type === 'locker') {
            this.lockerOpenSound.play();
            //open door one.
            this.currItem.sprite.setTexture('openLocker');
            this.currItem.sprite.body.setEnable(false);
            this.currItem.sprite.postFX.clear();
            this.currOverlapping = false;
            this.currItem = null;
            if(this.ePrompt) this.ePrompt.destroy();
        }else if(item.config.type === 'lockerSp') {
            this.specialLocker();
            return;
        }else if(item.config.key === 'bell') {
            this.bell.play();
            this.handleCaptain();
            return;
        }else if (item.key === 'bed3' && this.player.getForm() === 'dog' && this.allowKitchen) {
            this.handleSniffKey();
            return;
        }else  if (this.player.getForm() === 'human' && item.key === 'bookshelf') {
            this.textsound.play();
            this.diaBoxSound.play(); 
            this.text = item.getData(item)[this.player.getForm()];
            this.itemDia = this.add.text(410, 1166, this.text, {
                fontSize: '25px', 
                fill: '#ffffff', 
                wordWrap: {width: 1200}}).setDepth(994).setScrollFactor(0);
            this.textBox = this.add.image(300, 1350, 'textBox').setOrigin(0, 1).setScrollFactor(0).setDepth(3).setScale(2.5).setAlpha(0.9).setDepth(993);
            this.time.delayedCall(3500, () => {
                this.itemDia.destroy();
                this.textBox.destroy();
                this.stillShowingText = false;
            });
            this.moveShelf.play();
            this.handleBookShelf();
            return;
        }else if(item.key === 'passInteractive') {
            this.handleShow();
            return;
        }else if(item.key === 'control') {
            this.textsound.play();
            this.diaBoxSound.play();
            this.text = item.getData(item)[this.player.getForm()];
            this.itemDia = this.add.text(410, 1166, this.text, {
                fontSize: '25px', 
                fill: '#ffffff', 
                wordWrap: {width: 1200}}).setDepth(994).setScrollFactor(0);
            this.textBox = this.add.image(300, 1350, 'textBox').setOrigin(0, 1).setScrollFactor(0).setDepth(3).setScale(2.5).setAlpha(0.9).setDepth(993);
            this.time.delayedCall(5000, () => {
                this.rainSound.stop();
                this.boat.stop();
                this.itemDia.destroy();
                this.textBox.destroy();
                this.stillShowingText = false;
                this.scene.start('Crane');
            });
        }

        // Play sound when player is checking beds
        if(item.key === 'bed1' || item.key === 'bed2' || item.key === 'bed3' || item.key === 'bed4' || item.key === 'bed5' || item.key === 'bed6') {
            this.fabric.play();
        }

        // If player has no item just display texts and dia box
        if(this.itemDia) this.itemDia.destroy();
        if(this.textBox) this.textBox.destroy();
        this.stillShowingText = true;
        this.textsound.play();
        this.diaBoxSound.play();
        this.text = item.getData(item)[this.player.getForm()];
        console.log(this.text);
        this.itemDia = this.add.text(410, 1166, this.text, {
            fontSize: '25px', 
            fill: '#ffffff', 
            wordWrap: {width: 1200}}).setDepth(994).setScrollFactor(0);
        this.textBox = this.add.image(300, 1350, 'textBox').setOrigin(0, 1).setScrollFactor(0).setDepth(3).setScale(2.5).setAlpha(0.9).setDepth(993);
        this.time.delayedCall(5000, () => {
            this.itemDia.destroy();
            this.textBox.destroy();
            this.stillShowingText = false;
        });
    }

    /**
     * handleSniffKey
     * Description: Reveals the hideen access card by tweening its alpha from 0 to 1 and enabling its physics body. Guards against repeat calls with a flag.
     *              Clears the current item overlap state before revealing the card
     * Inputs: None
     * Outputs: None. Reveals access card as a side effect
     * Called By: handleInteractive() when player sniffs bed 3 as a dog with kitchen access
     * Calls: this.tweens.add(), this.access.sprite.body.setEnable(), this.currItem.sprite.body.setEnable()
     */
    handleSniffKey() {
        // Prevents multiple calls
        if(this.showedKeyCard) return;
        this.showedKeyCard = true;
        if(this.currItem) {
            this.currItem.sprite.body.setEnable(false);
            this.currItem = null;
            this.currOverlapping = false;
            this.currItemPickupable = null;
            if(this.ePrompt) this.ePrompt.destroy();
        }

        // Add tween of alpha of card showing up 
        this.tweens.add({
            targets: this.access.sprite,
            alpha: 1,
            duration: 700,
            onComplete: () => {
                this.access.sprite.body.setEnable(true);
            }
                    
        });
    }

    /**
     * handleKeyCard
     * Description: Handles the access card being used on the control room door. Destroys the door sprite, hides and disables the control room door body, and
     *              clears the current item overlap state. Guards against repeat calls with a flag.
     * Inputs: None
     * Outputs: None. Removes control room door and clears overlap state as a side effect
     * Called By: handleInteractive() when player uses accessCard1 on door 6
     * Calls: this.controlDoor.sprite.destroy(), this.controlRoom.setVisible(), this.controlRoom.body.setEnable()
     */
    handleKeyCard() {
        // Prevents multiple calls
        if(this.handledKeyCard) return;
        this.handledKeyCard = true;
        this.doorOpenSound.play();
        // Setting sprites to invisible and destroys sprites and destroys E prompts if shown
        this.controlDoor.sprite.destroy();
        this.controlRoom.setVisible(false);
        this.controlRoom.body.setEnable(false);
        this.currItem = null;
        this.currOverlapping = false;
        this.currItemPickupable = null;
        if(this.ePrompt) this.ePrompt.destroy();
    }

    /**
     * handleCaptain
     * Description: Handles the bell sequence. Clears existing dialouge, blocks the player, opens the bunker door, pans the camera to the captain waking up,
     *              shows captain dialogue, walks the captain to the cafeteria, then pans back to the player. Guards against repeated calls with flag.
     * Inputs: None
     * Outputs: None. Triggers captain cutscene and opens bunker door as a side effect
     * Called By: handleInteractive() when player interacts with bell
     * Calls: this.cameras.main.stopFollow(), this.cameras.main.pan(), this.cameras.main.startFollow(), this.tweens.add(), this.time.delayedCall(),
     *        this.add.text(), this.add.image(), this.captainWaking.play(), this.player.setBlocked(), this.player.setVelocity(), this.player.playIdle()
     */
    handleCaptain() {
        // Guards against multiple calls
        if(this.handledCaptain) return;
        if(this.itemDia) this.itemDia.destroy();
        if(this.textBox) this.textBox.destroy();
        this.stillShowingText = false;
        this.handledCaptain = true;
        
        // Pause player movement and velocity
        this.player.setVelocity(0);
        this.player.setBlocked(true);
        this.player.playIdle();

        // Set the variables to visible
        this.capBed.setVisible(true);
        this.captainWaking.setVisible(true);
        this.bed.sprite.setVisible(true);

        // Open the bunker door
        this.tweens.add({
            targets: this.bunkers,
            duration: 600,
            alpha: 0,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                // Disabled the door body
                this.bunkers.body.setEnable(false);
            }
        });

        // Pan camera to captain
        this.cameras.main.stopFollow();
        this.cameras.main.pan(this.captainWaking.x, this.captainWaking.y, 700, 'Power3', false, (cam, progress) => {
            // When camera finishes panning
            if(progress === 1) {
                this.cameras.main.startFollow(this.captainWaking);
                this.cameras.main.setFollowOffset(0, 150);
                this.textsound.play();
                this.diaBoxSound.play();
                 // Show dialogue for the captain waking up and going to the cafeteria
                this.itemDia = this.add.text(410, 1166, "Ugh, already dinner time, I was knocked out. Wondering what's today's option is.", {
                    fontSize: '25px', 
                    fill: '#ffffff', 
                    wordWrap: {width: 1200}}).setDepth(994).setScrollFactor(0);
                this.textBox = this.add.image(300, 1350, 'textBox').setOrigin(0, 1).setScrollFactor(0).setDepth(3).setScale(2.5).setAlpha(0.9).setDepth(993);
                this.time.delayedCall(4000, () => {
                    this.itemDia.destroy();
                    this.textBox.destroy();
                });

                // Once captain finishes walking pan back to player and resume control
                this.captainWaking.play('captainWalking');
                this.tweens.add({
                    targets: this.captainWaking,
                    x: 18772,
                    duration: 6000,
                    ease: 'Sine.easeInOut',
                    onComplete: () => {
                        //camera pan back to player
                        this.cameras.main.stopFollow();
                        this.cameras.main.pan(this.player.x, this.player.y, 700, 'Power3', false, (cam, progress) => {
                            if(progress === 1) {
                                this.cameras.main.startFollow(this.player);
                                this.cameras.main.setFollowOffset(0, 150);
                                this.player.setBlocked(false);
                                this.captainWaking.anims.stop();
                                this.captainWaking.setFrame(16);
                                this.captainWaking.setPosition(20791, 2137).toggleFlipX();
                                
                            }
                        });
                    }

                })

            }
        });
    }

    /**
     * specialLocker
     * Description: Opens the special locker and reveals the chef hat inside. Changes the locker texture to open state, disables its body, and enables the hat sprite
     *              for pickup. Guards against repeat calls with a flag.
     * Inputs: None
     * Outputs: None. Opens locker and reveals hat as a side effect
     * Called By: handleInteractive() when player opens the lockerSP type locker
     * Calls: this.currItem.sprite.setTexture(), this.currItem.sprite.body.setEnable(), this.currItem.sprite.postFX.clear(), this.hat.sprite.setVisible(),
     *        this.hat.sprite.body.setEnable()
     */
    specialLocker() {
        // Guards against multiple calls
        if(this.specialLockerOpen) return;
        this.specialLockerOpen = true;

        // Change locker sprite to open locker and enabled chef hat for pickup
        this.currItem.sprite.setTexture('openLocker');
        this.currItem.sprite.body.setEnable(false);
        this.currItem.sprite.postFX.clear();
        this.currOverlapping = false;
        this.currItem = null;
        if(this.ePrompt) this.ePrompt.destroy();
        this.hat.sprite.setVisible(true);
        this.hat.sprite.body.setEnable(true);
    }

    /**
     * createPlatforms
     * Description: Builds all the static collision zones, one-way platforms, and walls for Level 6. Defines the physical layout of every room,
     *              vent shaft, and walkable surface.
     * Inputs:
     *      @param thisScene: reference to current scene
     * Outputs: None. Creates physics bodies as a side effect
     * Called By: create()
     * Calls: this.addWalls(), this.addOneWayPlatforms()
     */
    createPlatforms() {
        // Floor
        this.currPlat = this.addWalls(0, 2813, 23985, 100);
        this.addWalls(13791, 1356, 2513, 217);
        this.addWalls(18067, 1356, 5958, 217);

        // Section 1 all boxes
        this.addWalls(1303, 2091, 869, 732);
        this.addWalls(2172, 2091, 869, 732);
        this.addWalls(2172, 1359, 869, 732);

        this.addWalls(4865, 2091, 869, 732);
        this.addWalls(5739, 2091, 869, 732);
        this.addWalls(6607, 2091, 869, 732);
        this.addWalls(5739, 1359, 869, 732);

        this.addWalls(9955, 2091, 869, 732);
        this.addWalls(10824, 2091, 869, 732);

        // Beam before entering
        this.addWalls(13426, 0, 370, 1569);

        // Lockers
        this.addOneWayPlatforms(16257, 2062, 1968, 20);


        // Kitchen
        this.addOneWayPlatforms(18938, 2646, 199, 53);
        this.addOneWayPlatforms(19141, 2545, 420, 34);
        this.addOneWayPlatforms(19583, 2646, 199, 53);
        this.addOneWayPlatforms(20054, 2646, 199, 53);
        this.addOneWayPlatforms(20258, 2545, 420, 34);
        this.addOneWayPlatforms(20699, 2646, 199, 53);
        this.addWalls(18609, 1516, 142, 481);
        // Hood
        this.addWalls(21123, 2003, 414, 110);
        // Wall
        this.addWalls(22984, 1567, 1000, 1243);

        this.addWalls(21091, 1563, 43, 553);
        this.addOneWayPlatforms(21135, 2496, 373, 316);
        this.addOneWayPlatforms(21986, 2495, 391, 317);
        this.addOneWayPlatforms(22743, 2496, 373, 316);
        this.addWalls(22006, 1957, 365, 39);
        this.addOneWayPlatforms(22827, 2111, 161, 25);

        // Bunkers
        this.addOneWayPlatforms(18866, 525, 1247, 100);
        this.addOneWayPlatforms(20638, 525, 1172, 100);
        this.addOneWayPlatforms(22371, 525, 1247, 100);
        this.addOneWayPlatforms(18866, 1142, 1247, 100);
        this.addOneWayPlatforms(20638, 1142, 1172, 100);
        this.addOneWayPlatforms(22371, 1142, 1247, 100); //22358
        this.addWalls(18609, 0, 142, 481);


        // Control room
        this.addWalls(15949, 0, 142, 484);
        this.addOneWayPlatforms(14544, 1087, 366, 89);
    }

    /**
     * addWalls
     * Description: Creates static walls that match the level 6 layout background images. Adds floors and walls and any solid surfaces in the game.
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
        
        //only check collision if coming from above
        zone.body.checkCollision.down = false;
        zone.body.checkCollision.left = false;
        zone.body.checkCollision.right = false;

        this.physics.add.collider(this.player, zone);
        return zone;
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
    createDoors() {
        this.bunkers = this.addDoor(18570, 0);
        this.controlRoom = this.addDoor(15910, 0);
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
        const door = this.physics.add.image(x, y, 'door6').setOrigin(0).setImmovable(true);
        this.physics.add.collider(this.player, door);
        return door;
    }

}