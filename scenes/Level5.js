/**
 * Author: Mei Huang
 * Program Name: Level5
 * Description: Chapter 5. The player navigates a multi-rom office and lab facility. Players will encounter a small showcase window. In the window it shows
 *              the idea of a third form nudging players to recognize that they can transform into human as well as a dog. Puzzles include: sending the 
 *              correct file via email/pc interface to trigger Kenji walking to the printer room to open the printer door for the player. Upon completion player 
 *              will then grab the paper on the floor left by Kenji and go to the printer jamming the printer which enrages Kenji. Kenji will then come to the 
 *              printer room and leave a wrench and access card 1 for the player to interact with. Player will then take the wrench and head to the lab to which 
 *              player can now break the tank and cause the scientist to leave the access card 2 on the counter to deal with the leak. Player can proceed to level 6 
 *              when they insert both the access cards. In this level the secret is in the lab. Player has to go all the way to the right wall in cat form.
 *              It will then reveal a vent and players can hear mouse squeaking. Once player jumps up into the vent they will see a mouse. Player will have
 *              to bring the mouse back to the scientist which will cause a ruckus and then the scientist will drop the second antidote.
 * Inputs: None. Reads from registry.get('secrets') for firstDLC flag and antidote collection states.
 * Outputs: None. Transitions to Level6, TrueEnding, MidEnding, or MenuScene on completion depending on the registry flags
 * Called By: Level4.startNextScene(), MenuScene
 * Calls: Level6, TrueEnding, MidEnding, MenuScene, Player, Item
 */
class Level5 extends Phaser.Scene {

    /**
     * constructor
     * Description: Registers this scene with Phaser under the key 'Level5'
     * Inputs: None
     * Outputs: None
     * Called By: Phaser game when the game config is processed
     * Calls: super()
     */
    constructor() {
        super({key: 'Level5'});
    }

    /**
     * preload
     * Description: Creates all the sound cues ready for the level. Specific for Level5.
     * Inputs: None
     * Outputs: None. Creates all sound obejects ready to use as a side effect
     * Called By: Phaser engine before create()
     * Calls: this.sound.add(), this.sound.play()
     */
    preload() {
        this.office = this.sound.add('office', {volume: 1, loop: true});
        this.typing = this.sound.add('typing', {volume: 0.6, loop: true});
        this.office.play();
        this.typing.play();
        this.mouseSqueak = this.sound.add('mouseSqueak', {loop: true});
        this.scanner = this.sound.add('scanner', {volume: 1, loop: false});
        this.pcAccess = this.sound.add('pcAccess', {volume: 1, loop: false});
        this.mouseClick = this.sound.add('mouseClick', {volume: 1, loop: false});
        this.printerSound = this.sound.add('printerSound', {volume: 1, loop: true});
        this.printerBeep = this.sound.add('printerBeep', {volume: 1, loop: true});
        this.glassBreak = this.sound.add('glassBreak', {volume: 1, loop: false});
        this.water = this.sound.add('water', {volume: 1, loop: false});
        this.glassAnti = this.sound.add('antiGlass', {volume: 1, loop: false});
        this.press = this.sound.add('cardInsert', {volume: 0.8, loop: false});
        this.d3Door = this.sound.add('d3Door', {volume: 1, loop: false});
        this.pickup = this.sound.add('pickupSound', {volume: 1, loop: false});
        this.textsound = this.sound.add('textSound', {volume: 1, loop: false});
        this.diaBoxSound = this.sound.add('diaBox', {volume: 1, loop: false});
        this.antiPickup = this.sound.add('antiPickup', {volume: 1, loop: false});
        this.openVent = this.sound.add('openVent', {volume: 1, loop: false});
        this.errorSound = this.sound.add('error', {volume: 1, loop: false});
        this.doorOpenSound = this.sound.add('doorOpen', {volume: 1, loop: false});
    }


    /**
     * create
     * Description: Builds level 5. Initializes all scene variables, spawns the player, places all items, zones, NPCS, platforms, and doors. Sets up the email
     *              interface, file picker, hint sustem, antidote HUD, showcase cutscene, printer and scientist animations, mouse vent audio zones, and no-morph
     *              vent zones. Configures the camera, inventory HUD, and triggers the opening fade in and chapter title sequence.
     * Inputs: None
     * Outputs: None. Builds level 5
     * Called By: phaser engine after preload
     * Calls: this.createPlatforms(), this.createDoors(), this.checkAnti(), Player constructor, Item constructor, this.physics.add.collider(), 
     *        this.physics.add.overlap(), this.physics.world.setBounds(), this.add.text(), this.add.image(), this.add.rectangle(),
     *        this.add.sprite(), this.add.zone(), this.tweens.add(), this.time.delayedCall(), this.anims.create(), this.cameras.main.setBounds(), 
     *        this.cameras.main.startFollow(), this.cameras.main.setZoom(), this.input.keyboard.createCursorKeys(), this.setEmailInterface(), 
     *        this.setFilesVisibility()
     */
    create() {
        // Initializes all avariables
        this.worldWidth = 13892;
        this.worldHeight = 2896;
        this.isHurt = false;
        this.currItem = null;
        this.currItemPickupable = false;
        this.currOverlapping = false;
        this.ventCoverOverlap = false;
        this.scentRevealed = false;
        this.hasFirstCard = false;
        this.hasSecondCard = false;
        this.stillShowingText = false;
        this.sentEmail = false;
        this.currFile = null;
        this.addedCard1 = false;
        this.addedCard2 = false;
        this.isFalling = false;

        this.currZone = null;
        this.canMorph = true;
        this.setNoMorph = false;
        this.canCrouch = true;

        this.inCutScene = false;
        this.currMouseOverlap = null;
        this.changedAudio = false;
        this.carryingMouse = false;
        this.handledMouse = false;
        this.mouseVentReveal = false;

        this.showed = false;
        this.finished = false;
        this.handledMouse = false;  
        this.showHint = false;       
        this.alreadyShowing = false;

        this.tempItem = null;
        this.fPrompt = null;
        this.ePrompt = null;
        this.attachedImage = null;
        this.droppedItem = null;
        this.fileText = null;
        this.fileTextSend = null;
        this.itemDia = null;
        this.textBox = null;

        
        // Create world bounds
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.physics.world.setBoundsCollision(true, true, true, true);

        // Adding backgrounds
        this.section1 = this.add.image(0, 0, 'level5Section1').setOrigin(0).setAlpha(0);
        this.section2 = this.add.image(3976, 0, 'level5Section2').setOrigin(0);
        this.section3 = this.add.image(8933, 0, 'level5Section3').setOrigin(0);
        this.lumico = this.add.image(373, 2046, 'lumico').setOrigin(0);

        // Adding player to world
        this.player = new Player(this, 300, 2720, 'catAnim', 0.9, 1.4, 1.3).setOrigin(0, 1).setDepth(992);
        this.player.refreshBody();
        this.player.setCollideWorldBounds(true);
        this.player.anims.play('catIdleRight');

        //HUD antidotes for second playthrough
        this.antiIcons = [];
        if(!this.registry.get('secrets').firstDLC) {
            // Home button
            this.home = this.add.image(-600, -350, 'DLCHome').setOrigin(0).setDepth(999).setScrollFactor(0).setScale(0.5)
                .setInteractive().on('pointerdown', () => {
                    this.scene.start('MenuScene');
                    this.office.stop();
                    this.typing.stop();
                    this.mouseSqueak.stop();
                    this.printerSound.stop();
                });
            this.home.on('pointerover', () => {this.home.setScale(0.56); this.diaBoxSound.play();});
            this.home.on('pointerout', () => {this.home.setScale(0.5)});

            this.add.text(-450, -330, 'Antidotes:', {
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

            // Setting alpha, scale, etc for each icon
            this.antis.forEach((antiNames, i) => {
                const icon = this.add.image(-300 + (i * 50), -320, antiNames)
                    .setScrollFactor(0)
                    .setDepth(200)
                    .setScale(1.3)
                    .setAlpha(0.3);
                
                this.antiIcons.push(icon);
            });

            this.checkAnti();
        }

        // Custom listener for when player drops an item. Drops the postion of the item accordingly so its not overlapping other item
        this.player.on('itemDropped', (item) => {
            if(this.currItem && !this.currItemPickupable) {
                if(this.currItem.sprite.x + this.currItem.sprite.width + 274 >= this.worldWidth) {
                    item.drop(this.currItem.sprite.x - this.currItem.sprite.width - 20, this.player.y);
                }else {
                    item.drop(this.currItem.sprite.x + this.currItem.sprite.width + 20, this.player.y);
                }
                this.clearHUD();
            }else {
                item.drop(this.player.x, this.player.y);
                this.clearHUD();
            }
        });

        // Add show case scene and animation
        this.showcase = this.physics.add.sprite(2303, 2613, 'showcase').setOrigin(0, 1).setAlpha(0);
        this.showcase.setFrame(0);
        this.showcase.setSize(1371, 950);
        this.showcase.setImmovable(true);
        this.showcase.body.allowGravity = false;

        if(!this.anims.exists('showcase')) {
            this.anims.create({
                key: 'showcase',
                frames: this.anims.generateFrameNumbers('showcase', {start: 0, end: 7}),
                frameRate: 3,
                repeat: 0
            });
        }
        this.physics.add.overlap(this.showcase, this.player, this.handleShowcase, null, this);

        this.dataText = this.cache.json.get('items');

        // Inventory slot
        this.inventory = this.add.image(2350, 1320, 'inventory').setScrollFactor(0).setDepth(993).setAlpha(0);
        this.inventoryDisplay = this.add.text(2300, 1192, '', {
            fontSize: '20px',
            fill: '#ffffff'
        }).setScrollFactor(0).setDepth(992);

        // Adding hint system
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

        // Hint covers + text and displaying them
        if(this.registry.get('secrets').firstDLC) {
            this.hintArray = this.dataText.hints.level5;
        }else {
            this.hintArray = this.dataText.hints2.level5;
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
            // Space between each hint text and cover
            currentY += 102;
        });


        // Fade into level and show Chapter title
        const fadeIntro = this.add.rectangle(-760, -120, 1920/0.5, 1080/0.6, 0x0a0a0a)
            .setAlpha(1).setOrigin(0).setDepth(999).setScrollFactor(0);
        this.tweens.add({
            targets: [fadeIntro],
            alpha: 0,
            duration: 4500,
            onComplete: () => { 
                fadeIntro.destroy();
                this.tweens.add({
                    targets: [this.section1, this.showcase, this.inventory, this.hint],
                    alpha: 1,
                    duration: 5000,
                    onComplete: () => {
                        this.lumico.destroy();
                    }
                });
            }
        });

        // Chapter title 
        this.title = this.add.text(226, 424, "Chapter 5", {
            fontSize: '60px',
            fill: '#94aebd'   // NOTE: change colour to match level3 palette
        }).setOrigin(0).setDepth(999).setScrollFactor(0);
        this.time.delayedCall(4500, () => { this.title.destroy() });

        // Make camera follow the player
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(0.6); //0.6 main set to 0.8 at beginning
        this.cameras.main.setFollowOffset(0, 150); //150 for the cat

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

        // Initialize all items
        const itemData = this.cache.json.get('items');

        this.items = [
            this.bio = new Item(this, this.player, {key: 'fingerPrint', weight: 'none', x: 8294, y: 2705, type: 'interactive', sizeX: 'default', sizeY: 'default'}, itemData),
            new Item(this, this.player, {key: 'lockers', weight: 'none', x: 4359, y: 2705, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData),
            new Item(this, this.player, {key: 'reception', weight: 'none', x: 6302, y: 2705, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData),
            new Item(this, this.player, {key: 'logistics', weight: 'none', x: 11915, y: 2681, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData),
            new Item(this, this.player, {key: 'dualID', weight: 'none', x: 13574, y: 2410, type: 'branching', sizeX: 199, sizeY: 700}, itemData),
            this.scientist = new Item(this, this.player, {key: 'scientist', weight: 'none', x: 11621, y: 1720, type: 'puzzle', sizeX: 202, sizeY: 645}, itemData),
            this.employee = new Item(this, this.player, {key: 'employee', weight: 'none', x: 7563, y: 1184, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData),
            new Item(this, this.player, {key: 'fridge', weight: 'none', x: 10963, y: 1436, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData),
            this.tanks = new Item(this, this.player, {key: 'tubes', weight: 'none', x: 12684, y: 1702, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData), 
            this.kenjiAnim = new Item(this, this.player, {key: 'kenjiAnim', weight: 'none', x: 6415, y: 1183, type: 'interactive', sizeX: 'default', sizeY: 'default'}, itemData),
            new Item(this, this.player, {key: 'books', weight: 'none', x: 4007, y: 1162, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData),
            //this.awards = new Item(this, this.player, {key: 'awards', weight: 'none', x: 5368, y: 1053, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData),
            this.printer = new Item(this, this.player, {key: 'printer', weight: 'none', x: 4848, y: 1154, type: 'puzzle', sizeX: 'default', sizeY: 'default'}, itemData),
            this.pc = new Item(this, this.player, {key: 'pc', weight: 'none', x: 8229, y: 915, type: 'branching', sizeX: 'default', sizeY: 'default'}, itemData),
            this.wrench = new Item(this, this.player, {key: 'wrench', weight: 'none', x: 4852, y: 652, type: 'pickup', sizeX: 'default', sizeY: 'default'}, itemData),
            this.paper = new Item(this, this.player, {key: 'paper', weight: 'light', x: 6014, y: 1160, type: 'pickup', sizeX: 'default', sizeY: 'default'}, itemData),
            this.access1 = new Item(this, this.player, {key: 'accessCard1', weight: 'none', x: 6139, y: 1146, type: 'pickup', sizeX: 'default', sizeY: 'default'}, itemData),
            this.access2 = new Item(this, this.player, {key: 'accessCard2', weight: 'none', x: 12243, y: 1417, type: 'pickup', sizeX: 'default', sizeY: 'default'}, itemData),
            this.mouse = new Item(this, this.player, {key: 'mouse', weight: 'none', x: 10899, y: 549, type: 'pickup', sizeX: 'default', sizeY: 'default'}, itemData),
            this.anti2 = new Item(this, this.player, {key: 'anti2', weight: 'none', x: 11675, y: 1437, type: 'pickup', sizeX: 'default', sizeY: 'default'}, itemData)
        ];

        // Setting neccessary sprites to invisible and setting their body and depth
        this.anti2.sprite.setAngle(90);
        this.anti2.sprite.body.setEnable(false);
        this.anti2.sprite.setVisible(false);

        this.paper.sprite.setDepth(10);
        this.access1.sprite.body.enable = false;
        this.access1.sprite.setVisible(false).setDepth(995);
        this.access2.sprite.body.enable = false;
        this.access2.sprite.setVisible(false).setDepth(991);

        this.employee.sprite.setDepth(993);
        this.kenjiAnim.sprite.setDepth(993);
        

        // Access card lights
        this.sequence1 = this.add.image(13643, 2322, 'sequencer').setOrigin(0).setScale(0.6).setTint(0xD63C1E);
        this.sequence2 = this.add.image(13674, 2322, 'sequencer').setOrigin(0).setScale(0.6).setTint(0xD63C1E);

        // Adding overlap for all item sprites
        this.items.forEach(item => {
            this.physics.add.overlap(this.player, item.sprite, () => {this.handleItemOverlap(item);}, null, this);
        });
        

        //Kenji throwing papers animation sprite
        this.kenji = this.add.sprite(5984, 1184, 'kenji').setOrigin(0,1);

        // Adding wrench
        this.wrench.sprite.setVisible(false);

        
        // Throwing the papers animation
        if(!this.anims.exists('kenji')) {
            this.anims.create({
                key: 'kenji',
                frames: this.anims.generateFrameNumbers('kenji', {start: 0, end: 13}),
                frameRate: 5,
                repeat: -1
            });
        }
        this.kenji.play('kenji');

        // Kenji walking sprite
        this.kenjiWalk = this.add.sprite(6315, 1183, 'scientist').setOrigin(0, 1).setVisible(false);
        // Kenji walking over to fix printer animation
        if(!this.anims.exists('kenjiFix')) {
            this.anims.create({
                key: 'kenjiFix',
                frames: this.anims.generateFrameNumbers('scientist', {start: 1, end: 15}),
                frameRate: 5,
                repeat: -1
            });
        }
        this.kenjiWalk.toggleFlipX();
        this.kenjiWalk.setFrame(0);

        // Printer sprite and animation for both normal state and broken state
        this.printer.sprite.setImmovable(true);
        
        if(!this.anims.exists('printer')) {
            this.anims.create({
                key: 'printer',
                frames: this.anims.generateFrameNumbers('printer', {start: 0, end: 5}),
                frameRate: 2,
                repeat: -1
            });
        }
        this.printer.sprite.play('printer');
        if(!this.anims.exists('printerError')) {
            this.anims.create({
                key: 'printerError',
                frames: this.anims.generateFrameNumbers('printer', {start: 6, end: 11}),
                frameRate: 2,
                repeat: -1
            });
        }

        // Email interface sprites + handles pointerdown, pointerover, and pointerout
        this.email = this.add.image(-350, -250, 'email').setOrigin(0).setScrollFactor(0).setScale(1.5).setDepth(995);
        this.send = this.add.image(1900, 1180, 'send').setOrigin(0).setScrollFactor(0).setScale(1).setDepth(996).setInteractive().on('pointerdown', () => this.handleSend());
        this.addBtn = this.add.image(150, 1180, 'add').setOrigin(0).setScrollFactor(0).setScale(1).setDepth(996).setInteractive().on('pointerdown', () => this.handleAdd());
        this.leaveBtn = this.add.image(-500, -250, 'leave').setOrigin(0).setScrollFactor(0).setScale(1.5).setDepth(995).setInteractive().on('pointerdown', () => this.handleLeave());
        this.leaveBtn.on('pointerover', () => { this.leaveBtn.setScale(1.6); });
        this.leaveBtn.on('pointerout', () => { this.leaveBtn.setScale(1.5); });
        this.setEmailInterface(false);
        this.files = this.add.image(90, -20, 'files').setOrigin(0).setScrollFactor(0).setScale(1.5).setDepth(998);
        this.file1 = this.add.image(380, 250, 'f1').setOrigin(0).setScrollFactor(0).setScale(1.4).setDepth(999).setInteractive().on('pointerdown', () => this.handleFileClick(this.file1));
        this.file2 = this.add.image(680, 250, 'f2').setOrigin(0).setScrollFactor(0).setScale(1.4).setDepth(999).setInteractive().on('pointerdown', () => this.handleFileClick(this.file2));
        this.file3 = this.add.image(980, 250, 'f3').setOrigin(0).setScrollFactor(0).setScale(1.4).setDepth(999).setInteractive().on('pointerdown', () => this.handleFileClick(this.file3));
        this.file4 = this.add.image(1280, 250, 'f4').setOrigin(0).setScrollFactor(0).setScale(1.4).setDepth(999).setInteractive().on('pointerdown', () => this.handleFileClick(this.file4));
        this.file5 = this.add.image(380, 550, 'f5').setOrigin(0).setScrollFactor(0).setScale(1.4).setDepth(999).setInteractive().on('pointerdown', () => this.handleFileClick(this.file5));
        this.setFilesVisibility(false);

        this.addBtn.on('pointerover', () => { this.addBtn.setScale(1.1); });
        this.addBtn.on('pointerout', () => { this.addBtn.setScale(1); });
        this.send.on('pointerover', () => { this.send.setScale(1.1); });
        this.send.on('pointerout', () => { this.send.setScale(1); });
        this.file1.on('pointerover', () => { this.file1.setScale(1.5); });
        this.file1.on('pointerout', () => { this.file1.setScale(1.4); });
        this.file2.on('pointerover', () => { this.file2.setScale(1.5); });
        this.file2.on('pointerout', () => { this.file2.setScale(1.4); });
        this.file3.on('pointerover', () => { this.file3.setScale(1.5); });
        this.file3.on('pointerout', () => { this.file3.setScale(1.4); });
        this.file4.on('pointerover', () => { this.file4.setScale(1.5); });
        this.file4.on('pointerout', () => { this.file4.setScale(1.4); });
        this.file5.on('pointerover', () => { this.file5.setScale(1.5); });
        this.file5.on('pointerout', () => { this.file5.setScale(1.4); });
        
        

        //Scientist sprite and animation
        this.scientist.sprite.setImmovable(true).setDepth(992);
        this.scientist.sprite.setFrame(0);
        this.scientist.sprite.setSize(202, 645).setOffset(-10, 0);
        this.scientist.sprite.body.allowGravity = false;

        if(!this.anims.exists('scientist')) {
            this.anims.create({
                key: 'scientist',
                frames: this.anims.generateFrameNumbers('scientist', {start: 0, end: 16}),
                frameRate: 5,
                repeat: -1
            });
        }
        
        // Tank Broken animation and sprite in the world
        this.tankB = this.add.sprite(13021, 894, 'brokenTube').setOrigin(0);
        this.tankB.setVisible(false);
        
        if(!this.anims.exists('tankB')) {
            this.anims.create({
                key: 'tankB',
                frames: this.anims.generateFrameNumbers('brokenTube', {start: 0, end: 6}),
                frameRate: 2,
                repeat: 0
            });
        }

        //create and add platforms and doors
        this.createPlatforms(this);
        this.createDoors();

        // Door to level 6
        this.doorOut = this.add.sprite(12868, 1902, 'd3').setOrigin(0);
        if(!this.anims.exists('d3')) {
            this.anims.create({
                key: 'd3',
                frames: this.anims.generateFrameNumbers('d3', {start: 0, end: 10}),
                frameRate: 5,
                repeat: 0
            });
        }

        // Handles mouse vent overlaps and callbacks to tween the sounds depending on which vent
        this.mouseVentSpots = [
            {x: 10881, y: 359, width: 3000, height: 217},
            {x: 12620, y: 574, width: 2000, height: 1241}
        ];
        
        this.mouseZone1 = this.add.zone(10881, 359, 3000, 217).setOrigin(0).setName('mouseZone1');
        this.physics.world.enable(this.mouseZone1, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.add.overlap(this.player, this.mouseZone1, () => this.changeAudio(this.mouseZone1), null, this);

        this.mouseZone2 = this.add.zone(12620, 574, 2000, 1241).setOrigin(0).setName('mouseZone2');
        this.physics.world.enable(this.mouseZone2, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.add.overlap(this.player, this.mouseZone2, () => this.changeAudio(this.mouseZone2), null, this);

        // Adding the Vent sprite itself
        this.mouseVent = this.add.image(10891, 310, 'ventMouse').setOrigin(0);
        this.mouseVent.setVisible(false).setDepth(500);
        this.mouse.sprite.setVisible(false).setDepth(700);
        this.mouse.sprite.body.setEnable(false);

        // Setting up not morphing zones
        this.ventSpots = [ //origin bottom left
            {x: 10881, y: 359, width: 2510, height: 217},//frist vent room electrical
            {x: 13379, y: 357, width: 510, height: 1458}//second vent, U shaped one left
        ];

        // Vent zones that dont allow morphing
        this.ventSpots.forEach(section => {
            const zones = this.add.zone(section.x, section.y, section.width, section.height).setOrigin(0);
            this.physics.world.enable(zones, Phaser.Physics.Arcade.STATIC_BODY);
            this.physics.add.overlap(this.player, zones, (player, zone) => this.noMorphing(player, zone), null, this);
            return zones;
        });
        
    }
    
    /**
     * update
     * Description: Runs every frame. Handles all real time game logic and handles item overlaps and proximity checks, F key pickup and drop logic,
     *              E key interactio routing, morph zone tracking, mouse audio zone tracking, access card completion check that triggers goNext(),
     *              and passes input state to the player update each frame.
     * Inputs: None
     * Outputs: None. Updates game state every frame
     * Called By: Phaser engine once per frame
     * Calls: this.items[].update(), this.player.update(), this.player.carriedItem, this.player.dropItem(), this.player.pickUp(), this.player.playTug(),
     *        this.handleItemOverlap(), this.handleInteractive(), this.updateHUD(), this.clearHUD(), this.checkAnti(), this.goNext(),
     *        this.tweens.add(), this.time.delayedCall(), this.add.text(), this.add.image(), Phaser.Input.Keyboard.JustDown(), Phaser.Math.Distance.Between()
     */
    update() {
        // Catching cursor key inputs for M, F and E
        const justPressedM = Phaser.Input.Keyboard.JustDown(this.cursors.keyM);
        const justPressedF = Phaser.Input.Keyboard.JustDown(this.cursors.keyF);
        const justPressedE = Phaser.Input.Keyboard.JustDown(this.cursors.keyE);

        // Update all items each frame
        //this.items.forEach(item => item.update());

        // Triggers when player inserts both access cards and plays next scene
        if(this.addedCard1 && this.addedCard2) {
            if(this.finished) return;
            this.finished = true;
            this.goNext();
        }

        // Get rid of highlight on items once out of range
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
        

        // Just pressed F interactions
        if (justPressedF && !this.inCutScene) {
            // Dropping the item if player is currently carrying an item and press F again can only drop when player is on a surface
            if(this.player.carriedItem && this.player.body.onFloor()) {
                // Guards against dropping the item in front of other interactables
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
                
                // For getting rid of the mouse squeak if the player drops the mouse
                if(this.player.carriedItem.key === 'mouse') {
                    this.carryingMouse = false;
                    this.mouseSqueak.stop();
                }
                // Dropping the item
                this.droppedItem = this.player.dropItem();
                this.droppedItem.drop(this.player.x, this.player.y);
                this.clearHUD();
            
            // For when items are pickupable but too heavy. 
            } else if (this.currItem && this.currItemPickupable){
                if(this.currItem.config.key !== 'anti2' && !this.currItem.canCarry(this.player.getForm())){
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
                    // Handles picking the mouse
                    if(this.currItem.key === 'mouse') {
                        this.carryingMouse = true;
                        this.mouseZone1.destroy();
                        this.mouseZone2.destroy();
                        this.currMouseOverlap = null;
                        this.mouseSqueak.stop();
                        this.mouseSqueak.setVolume(1);
                        this.mouseSqueak.play();
                    }
                    // Handles picking up the antidote
                    if(this.currItem.config.key === 'anti2') {
                        this.antiPickup.play();
                        // Anitdote put in the HUD and just light it up.
                        this.anti2.sprite.destroy();
                        this.currItem = null;
                        this.currOverlapping = false;
                        if(this.fPrompt) this.fPrompt.destroy();
                        this.registry.get('secrets').anti2 = true;
                        this.checkAnti();
                        console.log(this.registry.get('secrets').anti2);

                    // Picking all other pickup items
                    }else {
                        this.pickup.play();
                        console.log("PICKING UP ITEM");
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

        // Just pressed E interactions, for interactive items
        if (justPressedE && !this.inCutScene) {
            if(!this.currItem || this.currItemPickupable) return;
            this.handleInteractive(this.currItem);
        }
        
        // Setting up overlap for allowing player to morph again after leaving no morph zones
        if(this.currZone) {
            const dist = Math.abs(this.player.x - this.currZone.x);
            const itemRightBound = this.player.x > (this.currZone.x+this.currZone.width);
            const itemLeftBound =  (this.player.x+this.player.body.width) < this.currZone.x;

            if(itemLeftBound || itemRightBound) {
                this.currZone = null;
                this.setNoMorph = false;
                this.canMorph = true;
            }
        }

        // Clearing the mouse vent when player leaves the vents
        if(this.currMouseOverlap) {
            const isOverlapping = this.physics.overlap(this.player, this.currMouseOverlap);

            if(!isOverlapping) {
                this.currMouseOverlap = null;
                this.changedAudio = false;
                this.mouseSqueak.stop();
                this.mouseVentReveal = false;
                this.mouseVent.postFX.clear();
            }
        }

        // Update the player
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
     * changeAudio
     * Description: Handles audio changes when the player enters a mouse vent zone. Plays quiet squeaking for the deeper zone or louder squeaking and reveals
     *              the mouse sprite for the outer zone. Guards against repeat calls while already in the zone.
     * Inputs:
     *      @param zone: the mouse zone being overlapped
     * Outputs: None. Changes the audio and reveals the mouse sprite as a side effect
     * Called By: mouseZone1 and mouseZone2 overlap callbacks in create()
     * Calls: this.mouseSqueak.setVolume(), this.mouseSqueak.play(), this.mouse.sprite.setVisible(), this.mouse.sprite.body.setEnable()
     */
    changeAudio(zone) {
        // Guards against multiple calls and when player is already carrying the mouse
        if(this.handledMouse) return;
        if(this.carryingMouse) return;
        if(this.changedAudio) return;
        this.changedAudio = true;
        this.currMouseOverlap = zone;
        if(zone === this.mouseZone2) {
            this.mouseSqueak.setVolume(0.08);
        }else{
            this.mouseSqueak.setVolume(0.5);
            this.mouse.sprite.setVisible(true);
            this.mouse.sprite.body.setEnable(true);
        }
        this.mouseSqueak.play();
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
        // Guards against repeated calls
        if(this.setNoMorph) return;
        this.setNoMorph = true;
        this.canMorph = false;
        this.canCrouch = false;
        this.currZone = zone;

        // If the mouse vent zone reveal the mouse vent
        if(this.mouseVentReveal) return;
        this.mouseVentReveal = true;
        this.openVent.play();
        this.mouseVent.postFX.clear();
        this.mouseVent.postFX.addGlow(0xffffff, 1, 0, false, 1, 2);
        this.mouseVent.setVisible(true);
    
    }

    /**
     * handleShowcase
     * Description: Plays the showcase animation when the player walks into the display area for the first time, then shows a dialogue hinting about the third form
     * Inputs:
     *      @param showcase: the showcase sprite
     *      @param player: the player sprite
     * Outputs: None. Plays the animation showcase as a side effect
     * Called By: showcase overlap callback in create()
     * Calls: this.showcase.play(), this.add.text(), this.add.image(), this.time.delayedCall(), this.textsound.play(), this.diaBoxSound.play()
     */
    handleShowcase(showcase, player) {
        // Guards against calling it more than once and plays the animation and displays text and textbox
        if(this.showed) return;
        this.showed = true;
        this.inCutScene = true;
        this.time.delayedCall(100, () => this.showcase.play('showcase'));
        this.showcase.once('animationcomplete', () => {
            this.textsound.play();
            this.diaBoxSound.play();
            this.itemDia = this.add.text(410, 1166, "Third form?...Can I do that too?", {
                fontSize: '25px', 
                fill: '#ffffff', 
                wordWrap: {width: 1200}}).setDepth(994).setScrollFactor(0);
            this.textBox = this.add.image(300, 1350, 'textBox').setOrigin(0, 1).setScrollFactor(0).setDepth(3).setScale(2.5).setAlpha(0.9).setDepth(993);
            this.time.delayedCall(5500, () => {
                this.itemDia.destroy();
                this.textBox.destroy();
                this.stillShowingText = false;
                this.inCutScene = false;
            });
            this.showcase.setFrame(7);
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
        if(this.inCutScene) return;
        this.currOverlapping = true;
        this.currItem = item;
        item.sprite.postFX.clear();
        item.sprite.postFX.addGlow(0xffffff, 2, 0, false, 0.1, 2);

        // Shows an F prompt for pickupable items
        if(item.type === 'pickup'){
            this.fPrompt = this.add.image(item.sprite.x + (item.sprite.width / 2) - 14, item.sprite.y - (item.sprite.height * 1.5), 'f').setDepth(501).setOrigin(0, 1).setScale(0.5); //40 -100
            this.currItemPickupable = true;
        
        // Shows e prompt for iteractive items
        }else {
            if(item.key === 'logistics'){
                this.ePrompt = this.add.image(item.sprite.x + (item.sprite.width / 2) - 15, item.sprite.y - (item.sprite.height * 1.025), 'e').setDepth(501).setOrigin(0, 1).setScale(0.5);
            }else{
                this.ePrompt = this.add.image(item.sprite.x + (item.sprite.width / 2) - 15, item.sprite.y - (item.sprite.height * 1.2), 'e').setDepth(501).setOrigin(0, 1).setScale(0.5);
            }
            this.currItemPickupable = false;
        }
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
        this.tempItem = this.add.image(this.inventory.x, this.inventory.y, item.key).setScrollFactor(0).setDepth(700);
        console.log('Carrying:', item.key);
    }

    /**
     * handleInteractive
     * Description: Routes the player's E key iteraction depending on the item type and what the player is currently carrying. Handles rerouting which includes
     *              printer paper puzzle, dual ID card insertion, tank wrench puzzle, mouse scientist interaction, fingerprint scanner, PC email access, and default
     *              item inspection text. Enforces form equirements for certain interactions and shwos appropriate dialogue if conditions aren't met.
     * Inputs: 
     *      @param item: the interactive item being used
     * Outputs: None. Triggers the appropriate action as a side effect
     * Called By: update() when E is pressed and curritem is iteractive
     * Calls: this.kenjiMad(), this.destroyTank(), this.handleMouse(), this.openFirstDoor(), this.sendEmail(), this.add.text(), this.add.image(), 
     *        this.time.delayedCall(), this.press.play(), this.scanner.play(), this.mouseClick.play(), this.pcAccess.play()
     */
    handleInteractive(item) {
        // Prevents interactions if player is in a cutscene
        if(this.inCutScene) return;
        // Handles interactions if player is carrying any items
        if (this.player.carriedItem){
            const carriedItem = this.player.carriedItem.key;
            if(item.key === 'printer' && carriedItem === 'paper') {
                if(this.player.getForm() !== 'human') {
                    if (this.stillShowingText) return;
                    this.stillShowingText = true;
                    this.textsound.play();
                    this.diaBoxSound.play();
                    this.itemDia = this.add.text(410, 1166, "Hmm, not like this...", {
                        fontSize: '25px', 
                        fill: '#ffffff', 
                        wordWrap: {width: 1200}}).setDepth(994).setScrollFactor(0);
                    this.textBox = this.add.image(300, 1350, 'textBox').setOrigin(0, 1).setScrollFactor(0).setDepth(3).setScale(2.5).setAlpha(0.9).setDepth(993);
                    this.time.delayedCall(5000, () => {
                        this.itemDia.destroy();
                        this.textBox.destroy();
                        this.stillShowingText = false;
                    });
                }else {
                    this.kenjiMad(this);
                }
                return;

            }else if(item.key === 'dualID' && (carriedItem === 'accessCard1' || carriedItem === 'accessCard2')) {
                if(this.player.getForm() !== 'human') {
                    if (this.stillShowingText) return;
                    this.stillShowingText = true;
                    this.textsound.play();
                    this.diaBoxSound.play();
                    this.itemDia = this.add.text(410, 1166, "I can't reach...", {
                        fontSize: '25px', 
                        fill: '#ffffff', 
                        wordWrap: {width: 1200}}).setDepth(994).setScrollFactor(0);
                    this.textBox = this.add.image(300, 1350, 'textBox').setOrigin(0, 1).setScrollFactor(0).setDepth(3).setScale(2.5).setAlpha(0.9).setDepth(993);
                    this.time.delayedCall(5000, () => {
                        this.itemDia.destroy();
                        this.textBox.destroy();
                        this.stillShowingText = false;
                    });
                }else {
                    this.press.play();
                    if(carriedItem === 'accessCard2') {
                        console.log("SHOULDVE CHANGE THE COLOR CHAROLE???");
                        this.access2.sprite.destroy();
                        this.clearHUD();//put these in a function for when clearing T-T too repetative
                        this.currOverlapping = false;
                        this.currItem = null;
                        if(this.ePrompt) this.ePrompt.destroy();
                        this.player.carriedItem = null;
                        this.clearHUD();
                        this.sequence2.setTint(0x1ED62D);
                        this.addedCard2 = true;
                    }else {
                        this.access1.sprite.destroy();
                        this.clearHUD();
                        this.currOverlapping = false;
                        this.currItem = null;
                        if(this.ePrompt) this.ePrompt.destroy();
                        this.player.carriedItem = null;
                        this.sequence1.setTint(0x1ED62D);
                        this.addedCard1 = true;
                    }
                    return; 
                }
            }else if(item.key === 'tubes' && carriedItem === 'wrench') {
                this.destroyTank();
                return;
            }else if(item.key === 'scientist' && carriedItem === 'mouse') {
                this.handleMouse();
                return;
            }
        }

        // Puzzle interactives
        if(item.key === 'fingerPrint'){
            if(this.player.getForm() === 'human') {
                this.bio.sprite.body.setEnable(false);
                this.doorOpenSound.play();
                this.openFirstDoor();
                this.scanner.play();
                return; 
            }else {
                this.scanner.play();
            }
            
        }else if (item.key === 'pc' && this.player.getForm() === 'human') {
            this.mouseClick.play();
            this.pcAccess.play();
            this.sendEmail();
            return;
        }

        // Play printer sounds upon interaction
        if(item.key === 'printer') {this.printerSound.play();}


        // If player has no item display text and textbox
        if (this.stillShowingText) return;
        this.stillShowingText = true;
        this.inCutScene = true;
        this.text = item.getData(item)[this.player.getForm()];
        console.log(this.text);
        this.textsound.play();
        this.diaBoxSound.play();
        this.itemDia = this.add.text(410, 1166, this.text, {
            fontSize: '25px', 
            fill: '#ffffff', 
            wordWrap: {width: 1200}}).setDepth(994).setScrollFactor(0);
        this.textBox = this.add.image(300, 1350, 'textBox').setOrigin(0, 1).setScrollFactor(0).setDepth(3).setScale(2.5).setAlpha(0.9).setDepth(993);
        this.time.delayedCall(5000, () => {
            this.printerSound.stop();
            this.itemDia.destroy();
            this.textBox.destroy();
            this.stillShowingText = false;
            this.inCutScene = false;
        });
    }

    /**
     * handleMouse
     * Description: Handles the sequence of dropping the mouse on the scientist. Shows scientist dialogue, animates the mouse jumping up and down and running
     *              away, then drops and positions the second antidote for the player to collect.
     * Inputs: None
     * Outputs: None. Triggers mouse and antidote animations as a side effect
     * Called By: handleInteractive() when player uses mouse on scientist
     * Calls: this.player.setBlocked(), this.player.setVelocity(), this.player.playIdle(), this.mouseSqueak.setVolume(), this.add.text(), this.add.image(),
     *        this.tweens.add(), this.time.delayedCall(), this.clearHUD()
     * @returns 
     */
    handleMouse() {
        // Prevents multiple calls
        if(this.inCutScene) return;
        if(this.handledMouse) return;
        this.handledMouse = true;
        this.inCutScene = true;
        this.player.setBlocked(true);
        this.player.setVelocity(0);
        this.player.playIdle();
        this.mouseSqueak.setVolume(0.8);
        this.textsound.play();
        this.diaBoxSound.play();

        // Scientist text box
        this.text = "A live specimen!....AHHH! Get off me!";
        this.itemDia = this.add.text(410, 1166, this.text, {
            fontSize: '25px', 
            fill: '#ffffff', 
            wordWrap: {width: 1200}}).setDepth(994).setScrollFactor(0);
        this.textBox = this.add.image(300, 1350, 'textBox').setOrigin(0, 1).setScrollFactor(0).setDepth(3).setScale(2.5).setAlpha(0.9).setDepth(993);
        this.time.delayedCall(5000, () => {
            this.itemDia.destroy();
            this.textBox.destroy();
            this.stillShowingText = false;
            this.inCutScene = false;
        });
        this.anti2.sprite.body.setEnable(false);

        // Mouse jumping onto scientist then running away
        this.mouse.sprite.setVisible(true);
        this.mouse.sprite.body.setEnable(false);
        this.player.carriedItem = null;
        this.currOverlapping = false;
        this.scientist.sprite.body.setEnable(false);
        this.clearHUD();
        if(this.ePrompt) this.ePrompt.destroy();
        this.mouse.sprite.setPosition(11729, 1729);
        this.tweens.add({
            targets: this.mouse.sprite,
            x: 11643,
            y: 951,
            yoyo: true,
            repeat: 1,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.tweens.add({
                    targets: this.mouse.sprite,
                    x: 14000,
                    duration: 3000,
                    ease: 'Sine.easeInOut',
                    onComplete: () => {
                        this.mouseSqueak.stop();
                    }
                });
                // Tweens the antidote being tosses by the scientist
                this.tweens.killTweensOf(this.anti2.sprite);

                this.anti2.sprite.body.setEnable(false);
                this.anti2.sprite.setVisible(true);

                this.tweens.add({
                    targets: this.anti2.sprite,
                    x: 12260,
                    duration: 1000,
                    ease: 'Linear'
                });

                this.tweens.add({
                    targets: this.anti2.sprite,
                    y: 951,
                    duration: 500,
                    ease: 'Sine.easeOut',
                    yoyo: true,
                    onComplete: () => {
                        this.anti2.sprite.body.setEnable(true);
                        this.player.setBlocked(false);
                        this.scientist.sprite.body.setEnable(true);
                    }
                });
                
            }
        })

    }

    /**
     * destroyTank
     * Description: Handles the wrench on tank interaction. Plays the break sound, animations the scientist walking over to the broken tank, drops access card
     *              2, then walks the scientist back into position so the player can do the Level 5 secret
     * Inputs: None
     * Outputs: None. Triggers tank break and scientist movement as a side effect
     * Called By: handleInteractive() when player uses wrench on tubes
     * Calls: this.glassBreak.play(), this.water.play(), this.scientist.sprite.play(), this.tankB.play(), this.tweens.add(), this.time.delayedCall(),
     *        this.access2.sprite.setVisible(), this.clearHUD(), this.add.text(), this.add.image()
     */
    destroyTank() {
        // Destroys any linger text boxes
        if(this.itemDia) this.itemDia.destroy();
        if(this.textBox) this.textBox.destroy();
        this.stillShowingText = false;

        // Play sound
        this.glassBreak.play();
        this.water.play();
        this.inCutScene = true;

        // Destroy tank B sprite
        this.player.carriedItem = null;
        this.currOverlapping = false;
        this.tanks.sprite.body.enable = false;
        this.clearHUD();
        if(this.ePrompt) this.ePrompt.destroy();
        this.scientist.sprite.play('scientist');
        this.scientist.sprite.body.setEnable(false);
        this.text = this.dataText['scientist'].broken;
        this.textsound.play();
        this.diaBoxSound.play();

        // Tween the tanks broken and water leaking out and display scientist text
        this.itemDia = this.add.text(410, 1166, this.text, {
            fontSize: '25px', 
            fill: '#ffffff', 
            wordWrap: {width: 1200}}).setDepth(994).setScrollFactor(0);
        this.textBox = this.add.image(300, 1350, 'textBox').setOrigin(0, 1).setScrollFactor(0).setDepth(3).setScale(2.5).setAlpha(0.9).setDepth(993);
        this.tankB.setVisible(true);
        this.tankB.play('tankB');
        this.time.delayedCall(600, () => {
            // Move scientist over, also display text
            this.tweens.add({
                targets: this.scientist.sprite,
                x: 12078,
                duration: 2500,
                ease: 'Sine.easeInOut',
                onComplete: () => {
                    this.access2.sprite.body.enable = true;
                    this.access2.sprite.setVisible(true);
                    this.scientist.sprite.stop();
                    this.scientist.sprite.setFrame(0);
                    this.time.delayedCall(1000, () => {
                        this.scientist.sprite.play('scientist');
                        this.tweens.add({
                            targets: this.scientist.sprite,
                            x: 13009,
                            duration: 4000,
                            ease: 'Sine.easeInOut',
                            onComplete: () => {
                                this.scientist.sprite.stop();
                                this.scientist.sprite.setFrame(0);
                                this.time.delayedCall(1000, () => {
                                    this.itemDia.destroy();
                                    this.textBox.destroy();
                                    this.inCutScene = false;
                                    this.time.delayedCall(2000, () => {
                                        // Make scientist walk back so player can do the level 5 secret
                                        this.scientist.sprite.toggleFlipX().play('scientist');
                                        this.tweens.add({
                                            targets: this.scientist.sprite,
                                            x: 11661,
                                            duration: 3000,
                                            ease: 'Sine.easeInOut',
                                            onComplete: () => {
                                                this.scientist.sprite.body.setEnable(true);
                                                this.scientist.sprite.toggleFlipX();
                                                this.scientist.sprite.refreshBody();
                                                this.scientist.sprite.stop();
                                                this.scientist.sprite.setFrame(0);
                                            }
                                        })
                                    });
                                });
                            }

                        });
                    });
                }

            });
        });

    }

    /**
     * kenjiMad
     * Description: Handles Kenji's reaction when the player puts paper in the printer after sending the email. Pans the camera to Kenji, plays the printer
     *              error animation, walks Kenji to the printer to fix it, drops access card 1, then walks Kenji back to his chair and returns control
     *              to player.
     * Inputs: None
     * Outputs: None. Triggers Kenji cutsene and drops access card 1 as a side effect
     * Called By: handleInteractive() when player uses paper on printer after email is sent
     * Calls: this.cameras.main.stopFollow(), this.cameras.main.pan(), this.cameras.main.startFollow(), this.tweens.add(), this.time.delayedCall(),
     *        this.add.text(), this.add.image(), this.printerSound.play(), this.printerBeep.play(), this.access1.sprite.setVisible(), 
     *        this.clearHUD(), this.player.setBlocked()
     */
    kenjiMad() {
        // Only allows printer interactions if email was sent and prevents multiple calls
        if(!this.sentEmail) return;
        if(this.itemDia) this.itemDia.destroy();
        if(this.textBox) this.textBox.destroy();
        this.stillShowingText = false;
        this.inCutScene = true;
        this.player.setBlocked(true);
        this.player.playWalk();
        // Move player to the left a bit
        this.tweens.add({
            targets: this.player,
            x: 4266,
            duration: 1000,
            onComplete: () => {
                this.kenjiAnim.sprite.setVisible(false);
                this.kenji.anims.stop();
                this.kenji.setFrame(13);
                this.kenjiWalk.setVisible(true);
                this.kenjiWalk.toggleFlipX();
                this.player.setVelocity(0);
                this.player.playIdle();

                // Camera stop following player
                this.cameras.main.stopFollow();
                this.player.setBlocked(true);
                this.printer.sprite.stop();
                this.printer.sprite.play('printerError');
                this.printer.sprite.body.enable = false;
                console.log("KENJI FREAKS OUT");
                this.printerSound.play();
                this.printerBeep.play();

                // Once email is sent pan camera to Kenji
                this.cameras.main.pan(this.kenjiWalk.x, this.kenjiWalk.y, 700, 'Power3', false, (cam, progress) => {
                    if(progress === 1) {
                        this.kenjiWalk.play('kenjiFix');

                        // Camera following kenji
                        this.cameras.main.startFollow(this.kenjiWalk);
                        this.cameras.main.setFollowOffset(0, 150);
                        // Show kenji dialogue for player breaking printer
                        this.textsound.play();
                        this.diaBoxSound.play();
                        this.itemDia = this.add.text(410, 1166, this.dataText['kenjiAnim'].after, {
                            fontSize: '25px', 
                            fill: '#ffffff', 
                            wordWrap: {width: 1200}}).setDepth(994).setScrollFactor(0);
                        this.textBox = this.add.image(300, 1350, 'textBox').setOrigin(0, 1).setScrollFactor(0).setDepth(3).setScale(2.5).setAlpha(0.9).setDepth(993);
                        this.time.delayedCall(12000, () => {
                            this.itemDia.destroy();
                            this.textBox.destroy();

                        });
                        // Kenji walking over to the printer
                        this.tweens.add({
                            targets: this.kenjiWalk,
                            duration: 4000,
                            x: 4750,
                            ease: 'Sine.easeInOut',
                            onComplete: () => {
                                // Playing beep sounds and printer sounds
                                this.printerSound.stop();
                                this.printerBeep.stop();
                                this.access1.sprite.setVisible(true);
                                this.access1.sprite.body.enable = true;
                                this.kenjiWalk.anims.stop();
                                this.kenjiWalk.setFrame(0);

                                this.time.delayedCall(4000, () => {
                                    // Now make kenji walk back to chair and resume everything.
                                    this.kenjiWalk.toggleFlipX();
                                    this.kenjiWalk.play('kenjiFix');
                                    this.tweens.add({
                                        targets: this.kenjiWalk,
                                        x: 6315,
                                        duration: 3000,
                                        ease: 'Sine.easeInOut',
                                        onComplete: () => {
                                            this.kenjiWalk.anims.stop();
                                            this.kenjiWalk.setFrame(0);
                                            this.kenjiWalk.setVisible(false);

                                            this.kenjiAnim.sprite.setVisible(true);
                                            this.kenji.play('kenji');

                                            this.player.setBlocked(false);
                                            this.player.carriedItem = null;
                                            this.currItem = null;
                                            if(this.ePrompt) this.ePrompt.destroy();
                                            this.currOverlapping = false;
                                            this.clearHUD();
                                            
                                            this.time.delayedCall(600, () => {
                                                // Give access back to player and make camera follow player
                                                this.wrench.sprite.setVisible(true);
                                                this.cameras.main.stopFollow();
                                                this.cameras.main.startFollow(this.player);
                                                this.cameras.main.setFollowOffset(0, 150);
                                                this.player.setBlocked(false);
                                                this.inCutScene = false;
                                            });

                                        }

                                    });

                                });
                            }
                        });

                    }
                });
            }
        });

        return;
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
     * sendEmail
     * Description: Handles the player interacting with the PC. Blocks player movement, dims the background sections, and shows the email interface for the player
     *              to interact with.
     * Inputs: None
     * Outputs: None. Shows email interface and blocks player as a side effect
     * Called By: handleInteractive() when player uses PC as human
     * Calls: this.mouseClick.play(), this.player.setVelocity(), this.player.setBlocked(), this.section2.setAlpha(), this.section3.setAlpha(), this.setEmailInterface()
     */
    sendEmail() {

        // Play sound and only allow to send the correct email once
        this.mouseClick.play();
        if(this.sentEmail) return;
        this.sentEmail = true;

        //Block player movement
        this.player.setVelocity(0);
        this.player.setBlocked(true);

        //Show email
        this.section3.setAlpha(0.2);
        this.section2.setAlpha(0.2);
        this.kenji.anims.stop();
        this.kenji.setFrame(0);
        this.setEmailInterface(true);

    }

    /**
     * openPrinterDoor
     * Description: Opens the printer door by fading it out and disabling its physics body
     * Inputs: None
     * Outputs: None. Fades out door and disables its body as a side effect
     * Called By: kenjiPrints()
     * Calls: this.tweens.add(), this.doorPrinter.body.enable
     */
    openPrinterDoor() {
        this.tweens.add({
            targets: this.doorPrinter,
            alpha: 0,
            duration: 2000,
            onComplete: () => {
                this.doorPrinter.body.enable = false;
            }
        });
    }
    
    /**
     * handleFileClick
     * Description: Handles the player clicking a file in the file picker. Destroys any previously attached image, sets the clicked file as the current file,
     *              hides the file picker, and displays the selected file image in the email interface.
     * Inputs: 
     *      @param file: the file image that was clicked
     * Outputs: None. Sets currFile and shows attached image as a side effect
     * Called By: file1-file5 pointerdown events in create()
     * Calls: this.mouseClick.play(), this.attachedImage.destroy(), this.setFilesVisibility(), this.add.image()
     */
    handleFileClick(file) {
        this.mouseClick.play();
        if(this.attachedImage !== null && this.attachedImage !== undefined) this.attachedImage.destroy(); // Guard against stacking images?
        this.currFile = file;
        this.setFilesVisibility(false); //this.file.texture.key
        this.attachedImage = this.add.image(70, 700, file.texture.key).setOrigin(0).setScrollFactor(0).setDepth(997).setScale(1.3);
    }

    /**
     * setFilesVisibility
     * Description: Handles the player clicking the Add button in the email interface. Shows the file picker so the player can select an attachment.
     * Inputs:
     *      @param status: boolean, shows the file picker, false to hide and true to show interface
     * Outputs: None. Shows file picker as a side effect
     * Called By: addBtn pointerdown event in create()
     * Calls: this.files.setVisible(), this.file1-file5.setVisible()
     */
    setFilesVisibility(status) {
        this.files.setVisible(status);
        this.file1.setVisible(status);
        this.file2.setVisible(status);
        this.file3.setVisible(status);
        this.file4.setVisible(status);
        this.file5.setVisible(status);
    }
    
    /**
     * handleAdd
     * Description: Handles the player clicking the Add button in the email interface. Shows the file picker so the player can select an attachement
     * Inputs: none
     * Outputs: None. Shows file picker as side effect
     * Called By: addBtn pointerdown event in create()
     * Calls: this.mouseClick.play(), this.setFilesVisibilty()
     */
    handleAdd() {
        this.mouseClick.play();
        this.setFilesVisibility(true);
    }

    /**
     * handleSend
     * Description: Handles the player clicking the Send button in the email interface. Validates that a file is attached and that it is the correct file.
     *              Shows an error message for no attachment or wrong file size, and triggers kenjiPrints if the correct file attached.
     * Inputs: None.
     * Outputs: None. Triggers kenjiPrints() or shows error text as a side effect
     * Called By: Send button pointerdown event in create()
     * Calls: this.mouseClick.play(), this.errorSound.play(), this.addtext(), this.time.delayedCall(), this.kenjiPrints()
     */
    handleSend() {
        // Plays the sounds for the click 
        this.mouseClick.play();
        // Play message for if player doesn't attach a file
        if(this.currFile === null) {
            this.errorSound.play();
            this.fileTextSend = this.add.text(1440, 1180, "Please add an attachment file.", {
                fontSize: '25px',
                fill: '#aa0000'}).setScrollFactor(0).setDepth(999); //f3

            this.time.delayedCall(2500, () => {
                this.fileTextSend.destroy();
            });
            return;
        }

        // Displays file and displays "file size too large" if its not the right file
        const fileName = this.currFile.texture.key;
        if(fileName !== 'f3') {
            if(this.fileTextSend) {
                this.fileTextSend.destroy();
            }
            if (this.alreadyShowing) return;
            this.alreadyShowing = true;
            this.errorSound.play();
            this.fileText = this.add.text(1550, 1180, "File size too large!", {
                fontSize: '25px',
                fill: '#aa0000'}).setScrollFactor(0).setDepth(999);
            this.time.delayedCall(2500, () => {
                this.fileText.destroy();
                this.alreadyShowing = false;
            });
        }else {
            this.pc.sprite.body.enable = false;
            this.kenjiPrints();
        }
    }

    /**
     * handleLeave
     * Description: Handles the player clicking the leave button in the email interface. Hides the email UI, restores the background, re-enables the player
     *              movement, and resets sentEmail so the player can access the PC again.
     * Inputs: None
     * Outputs: None. Hides email interface and restores player control as a side effect
     * Called By: leaveBtn pointerdown event in create()
     * Calls: this.mouseClick.play(), this.setEmailInterface(), this.setFilesVisibility(), this.player.setBlocked(), this.kenji.play(), this.attachedImage.destroy(),
     *        this.section2.setAlpha(), this.section3.setAlpha()
     */
    handleLeave() {
        this.mouseClick.play();
        this.setEmailInterface(false);
        this.setFilesVisibility(false);
        this.player.setBlocked(false);
        this.kenji.play('kenji');
        if(this.attachedImage !== null && this.attachedImage !== undefined) this.attachedImage.destroy();
        this.section3.setAlpha(1);
        this.section2.setAlpha(1);
        this.sentEmail = false;
    }

    /**
     * setEmailInterface
     * Description: Sets the visibility of the email interface elements all at once. 
     * Inputs:
     *      @param status: boolean, true to show email interface and false to hide
     * Outputs: None. Sets visibility of the email interface elements all at once. 
     * Called By: create(), sendEmail(), kenjiPrints(), handleLeave()
     * Calls: this.leaveBtn.setVisible(), this.email.setVisible(), this.send.setVisible(), this.addBtn.setVisible()
     */
    setEmailInterface(status) {
        this.leaveBtn.setVisible(status);
        this.email.setVisible(status);
        this.send.setVisible(status);
        this.addBtn.setVisible(status);
    }

    /**
     * kenjiPrints
     * Description: Handles cutscene after the player sends the correct email. Hides the email interface, pans the camera to kenji, walks him to the printer, shows
     *              dialogue, then walks him back to his chair and returns control to the player.
     * Inputs: None
     * Outputs: None. Triggers Kenji walk cutscene as a side effect
     * Called By: handleSend() when the correct file is attached and sent
     * Calls: this.cameras.main.stopFollow(), this.cameras.main.pan(), this.cameras.main.startFollow(), this.openPrinterDoor(), this.tweens.add(),
     *        this.time.delayedCall(), this.add.text(), this.add.image(), this.setEmailInterface(), this.setFilesVisibility(), this.player.setBlocked()
     */
    kenjiPrints() {
        this.inCutScene = true;
        this.setEmailInterface(false);
        this.setEmailInterface(false);
        this.setFilesVisibility(false);
        if(this.attachedImage !== null && this.attachedImage !== undefined) this.attachedImage.destroy();
        this.section3.setAlpha(1);
        this.section2.setAlpha(1);

        // Set kenji variables
        this.kenjiAnim.sprite.setVisible(false);
        this.kenji.anims.stop();
        this.kenjiWalk.setVisible(true);

        // Camera stop following player
        this.cameras.main.stopFollow();
        this.player.setBlocked(true);

        // Once email is sent pan camera to Kenji
        this.cameras.main.pan(this.kenjiWalk.x, this.kenjiWalk.y, 1000, 'Power3', false, (cam, progress) => {
            if(progress === 1) {
                // Open the printer door first
                this.openPrinterDoor();
                this.kenjiWalk.play('kenjiFix');

                // Camera following kenji
                this.cameras.main.startFollow(this.kenjiWalk);
                this.cameras.main.setFollowOffset(0, 150);
                // SHow kenji dialogue for printing for hikari
                this.textsound.play();
                this.diaBoxSound.play();
                this.itemDia = this.add.text(410, 1166, this.dataText['kenjiAnim'].email, {
                    fontSize: '25px', 
                    fill: '#ffffff', 
                    wordWrap: {width: 1200}}).setDepth(994).setScrollFactor(0);
                this.textBox = this.add.image(300, 1350, 'textBox').setOrigin(0, 1).setScrollFactor(0).setDepth(3).setScale(2.5).setAlpha(0.9).setDepth(993);

                // Kenji walking over to the printer
                this.tweens.add({
                    targets: this.kenjiWalk,
                    duration: 6000,
                    x: 4750,
                    ease: 'Sine.easeInOut',
                    onComplete: () => {
                    
                        this.kenjiWalk.anims.stop();
                        this.kenjiWalk.setFrame(0);

                        this.time.delayedCall(3000, () => {
                            // Now make kenji walk back to chair and resume everything.
                            this.kenjiWalk.toggleFlipX();
                            this.kenjiWalk.play('kenjiFix');
                            this.tweens.add({
                                targets: this.kenjiWalk,
                                x: 6315,
                                duration: 6000,
                                ease: 'Sine.easeInOut',
                                onComplete: () => {
                                    this.kenjiWalk.anims.stop();
                                    this.kenjiWalk.setFrame(0);
                                    this.kenjiWalk.setVisible(false);

                                    this.kenjiAnim.sprite.setVisible(true);
                                    this.kenji.play('kenji');

                                    this.player.setBlocked(false);
                                    
                                    this.time.delayedCall(600, () => {
                                        // Give access back to player and make camera follow player
                                        this.cameras.main.stopFollow();
                                        this.cameras.main.startFollow(this.player);
                                        this.cameras.main.setFollowOffset(0, 150);
                                        
                                    });

                                }

                            });

                        });
                    }
                });
                this.time.delayedCall(5000, () => {
                    this.itemDia.destroy();
                    this.textBox.destroy();
                    this.inCutScene = false;
                });

            }
        });

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
        // TODO: clear item icon from HUD
        this.inventoryDisplay.setText('');
        if(this.tempItem) this.tempItem.destroy();
        if(this.fPrompt) this.fPrompt.destroy();
        console.log('Cleared HUD');
    }

    /**
     * createPlatforms
     * Description: Builds all the static collision zones, one-way platforms, and walls for Level 5. Defines the physical layout of every room,
     *              vent shaft, and walkable surface.
     * Inputs:
     *      @param thisScene: reference to current scene
     * Outputs: None. Creates physics bodies as a side effect
     * Called By: create()
     * Calls: this.addWalls(), this.addOneWayPlatforms()
     */
    createPlatforms(thisScene) {
        // Top box and floor
        this.addWalls(0, 0, 3969, 1526);
        this.addWalls(0, 2716, 13892, 167);

        // Reception desk
        this.addOneWayPlatforms(6297, 2331, 1362, 20);
        // Reception door
        this.addWalls(8897, 1346, 65, 327);
        // Top of lockers
        this.addOneWayPlatforms(4354, 1867, 1103, 20);

        // Office floor
        this.addWalls(3944, 1179, 5406, 348);
        this.addOneWayPlatforms(6220, 915, 2468, 20);
        this.addWalls(5916, 0, 63, 290);
        this.addOneWayPlatforms(4848, 650, 322, 20);

        // Lab floor + lab wall
        this.addWalls(10589, 1724, 2782, 165);
        this.addWalls(10814, 0, 60, 730);
            // lab table
        this.addOneWayPlatforms(10951, 1432, 1714, 25);
            // Lab vent
        this.addWalls(13378, 1724, 503, 20); // bottom part
        this.addWalls(13378, 1516, 183, 20); // top part
        this.addWalls(13542, 578, 20, 957);
        this.addWalls(10886, 558, 2675, 20);
        this.addWalls(10886,294, 20, 284);
        this.addWalls(10886, 294, 3006, 20);
        this.addWalls(13372, 578, 30, 1050);
        this.addWalls(13398, 982, 259, 35);
        this.addOneWayPlatforms(12679, 893, 668, 20);

        //Stairs
        this.addOneWayPlatforms(9082, 2545, 304, 35);
        this.addOneWayPlatforms(9384, 2380, 304, 35);
        this.addOneWayPlatforms(9683, 2215, 304, 35);
        this.addOneWayPlatforms(9980, 2050, 304, 35);
        this.addOneWayPlatforms(10279, 1885, 304, 35);
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
        this.doorOne = this.addDoor(8874, 1685);
        this.doorPrinter = this.addDoor(5894, 194);
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
        const door = this.physics.add.image(x, y, 'door').setOrigin(0).setImmovable(true);
        this.physics.add.collider(this.player, door);
        return door;
    }

    /**
     * addWalls
     * Description: Creates static walls that match the level 5 layout background images. Adds floors and walls and any solid surfaces in the game.
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
     * goNext
     * Description: Handles the end of level transitions. Fades out the level, checks how many antidotes the player collected, and routes them to the correct
     *              ending scene.
     * Inputs: None
     * Outputs: None. Trigeers scene transition as a side effect
     * Called By: nextLevel zone overlap in create()
     * Calls: this.player.setVelocityX(), this.player.setBlocked(), this.player.playIdle(), this.tweens.add(), this.registry.get(), this.scene.start(), 
     *        this.whiteSound.stop()
     */
    goNext() {
        this.doorOut.play('d3');
        this.d3Door.play();
        this.doorOut.once('animationcomplete', () => {
            this.time.delayedCall(2500, () => {
                 const fadeOut = this.add.rectangle(-670, -420, 1920/0.6, 1080/0.6, 0x0a0a0a)
                    .setAlpha(0).setOrigin(0).setDepth(999).setScrollFactor(0);
                this.tweens.add({
                    targets: [this.section1, this.section2, this.section3, this.player],
                    alpha: 0,
                    duration: 2500
                });
                this.glassAnti.play();
                this.tweens.add({
                    targets: fadeOut,
                    alpha: 1,
                    duration: 2500,
                    onComplete: () => { 

                        const antidotes = this.registry.get('secrets');
                        const antidoteCount = [antidotes.anti1, antidotes.anti2, antidotes.anti3].filter(Boolean).length;

                        this.office.stop();
                        this.typing.stop();
                        if(antidoteCount === 3) {
                            //start good ending
                            this.scene.start('TrueEnding');
                        }else if(antidoteCount === 2) {
                            //start midEnding
                            this.scene.start('MidEnding');
                        }else if(!this.registry.get('secrets').firstDLC) {
                            this.scene.start('MenuScene');
                        }else {
                            this.scene.start('Level6');
                        }
                    }
                });
            });     
        }); 
    }

}