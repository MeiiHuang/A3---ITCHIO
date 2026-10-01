/**
 * Author: Mei Huang
 * Program Name: Crane
 * Description: Crane. A standalone minigame scene where the player operates a crane to drop cargo containers into the ocean on either side of the ship. The player 
 *              walks between four control buttons: Left, Right, Lower, Release. Moving the crane left, right or lower to pickup cargo boxes and releasing right
 *              over the edge of the boat. Containers dropped into the water zones on either side of the ship are destroyed. Once all cargo containers have been
 *              dropped, the scene fades out and routes the player to one of the three endings baded on how many antidotes were collected, or to DLCEnding if it
 *              is the first playthrough. The scene features animated rain, water tile scrolling, window glass reflections, and a slow background zoom effect.
 * Inputs: None. Reads from registry.get('secrets') for firstDLC flag and antidote collection states.
 * Outputs: None. Transitions to TrueEnding, MidEnding, or MenuScene on completion depending on the registry flags
 * Called By: Level6.handleInteractive() via this.scene.start('Crane')
 * Calls: TrueEnding, MidEnding, DLCEnding, MenuScene, Player, Item
 */
class Crane extends Phaser.Scene {

    /**
     * constructor
     * Description: Registers this scene with Phaser under the key 'Crane'
     * Inputs: None
     * Outputs: None
     * Called By: Phaser game when the game config is processed
     * Calls: super()
     */
    constructor() {
        super({key: 'Crane'});
    }

    /**
     * preload
     * Description: Creates all the sound cues ready for the level. Specific for Level6.
     * Inputs: None
     * Outputs: None. Creates all sound obejects ready to use as a side effect
     * Called By: Phaser engine before create()
     * Calls: this.sound.add(), this.sound.play()
     */
    preload () {
        this.rainSound = this.sound.add('rainSound', { loop: true, volume: 0.3 });
        this.boatSound = this.sound.add('onBoat', {volume: 1, loop: true});
        this.ocean = this.sound.add('ocean', {volume: 0.5, loop: true});
        this.craneMove = this.sound.add('craneMove', {volume: 4, loop: false});
        this.dropBox = this.sound.add('dropBox', {volume: 1, loop: false});
    }

    /**
     * create
     * Description: Builds the crane scene. Initializes all scene variables, spawns the player, creates the crane physics image, places all cargo containers with gravity
     *              sets up the four control button items, adds left and right water drop zones, adds the boat zone for container collisions, sets up rain, water, glass
     *              and window drop tile sprites, and configures the antidote HUD for second playthroughs. Overlap callbacks are registered for all containers against
     *              the crane and drop zones.
     * Inputs: None
     * Outputs: None. Builds the Crane scene as a side effect
     * Called By: Phaser engine after preload()
     * Calls: this.checkAnti(), Player constructor, Item constructor, this.physics.add.image(), this.physics.add.collider(), this.physics.add.overlap(),
     *        this.physics.world.enable(), this.add.image(), this.add.tileSprite(), this.add.zone(), this.tweens.add(), this.input.keyboard.createCursorKeys(), 
     *        this.rainSound.play(), this.boatSound.play(), this.ocean.play()
     */
    create () {
        // Initializes all variables
        this.currItem = null;
        this.currItemPickupable = false;
        this.currOverlapping = false;
        this.currMoving = false;
        this.canGrab = true;
        this.grabbed = false;
        this.currContainer = null;
        this.pulledUp = false;
        this.destroyed = false;
        this.grabbing = false;
        this.craneMinX = -89;
        this.craneMaxX = 1761;
        this.craneMaxY = -50;

        // HUD for second playthrough
        this.antiIcons = [];
        if(!this.registry.get('secrets').firstDLC) {
            // Home button
            this.home = this.add.image(-900, -450, 'DLCHome').setOrigin(0).setDepth(999).setScrollFactor(0).setScale(0.5)
                .setInteractive().on('pointerdown', () => {this.scene.start('MenuScene'); this.rainSound.stop(); this.boat.stop(); this.ocean.stop();});
            this.home.on('pointerover', () => {this.home.setScale(0.56); this.diaBoxSound.play();});
            this.home.on('pointerout', () => {this.home.setScale(0.5)});

            this.add.text(-500, -250, 'Antidotes:', {
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

            // Setting up all icons
            this.antis.forEach((antiNames, i) => {
                const icon = this.add.image(-350 + (i * 50), -230, antiNames)
                    .setScrollFactor(0)
                    .setDepth(200)
                    .setScale(1.3)
                    .setAlpha(0.3);
                
                this.antiIcons.push(icon);
            });

            this.checkAnti();

        }


        // Adding background for Crane level
        this.base = this.add.image(963, 186, 'base').setOrigin(0.5, 0.2).setScale(1);

        this.tweens.add({
            targets: this.base,
            scaleX: 2,
            scaleY: 2,
            duration: 100000,
            ease: 'Linear'
        });
        // Boat
        this.boat = this.add.image(275, 560, 'boat').setOrigin(0).setDepth(988);

        // Adding the rain effect
        this.rainSound.play();
        this.boatSound.play();
        this.ocean.play();
        this.rain = this.add.tileSprite(0, 0, 1920, 1080, 'rain')
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(989)
            .setAlpha(0.3);

        // Glass
        this.glass = this.add.image(0, 0, 'glass').setOrigin(0).setDepth(990);
        this.drops = this.add.tileSprite(0, 0, 2918, 1582, 'windowDrop').setDepth(996);
        this.reflect = this.add.image(0, -100, 'reflect').setOrigin(0).setDepth(997).setAlpha(0.8);

        // Crane
        this.crane = this.physics.add.image(150, -350, 'craneBg')
            .setOrigin(0)
            .setDepth(989)
            .setScale(0.9)
            .setSize(159, 305, true)
            .setOffset(55, 710);
        

        // Adding crates and physics colliders
        const cargoPositions = [
            {x: 761, y: 496},
            {x: 661, y: 700},
            {x: 872, y: 700},
            {x: 1283, y: 700},
            {x: 1283, y: 496}
        ];
        
        this.containers = [];
        cargoPositions.forEach(pos => {
            const container = this.physics.add.image(pos.x, pos.y, 'crate').setOrigin(0).setDepth(989).setGravityY(500);
            this.containers.push(container);
        });

        this.containers.forEach(container => {
            this.physics.add.overlap(this.crane, container, () => {this.handleGrab(container)}, null, this);
        });
        this.physics.add.collider(this.containers, this.containers);

        // Adding player
        this.player = new Player(this, 991, 1150, 'catAnim', 1.2, 1.4, 1.3).setOrigin(0, 1).setDepth(992);
        this.player.refreshBody();
        this.player.setGravity(0);
        this.player.setCollideWorldBounds(true);
        this.player.anims.play('catIdleRight');

        // Control panel
        this.controls = this.add.image(0, 950, 'controls').setOrigin(0).setDepth(990);
        // Control buttons
        const itemData = this.cache.json.get('items');
        this.dataText = this.cache.json.get('items');
        this.items = [
            new Item(this, this.player, {key: 'buttonC', weight: 'none', x: 220, y: 1050, type: 'button', sizeX: 'default', sizeY: 'default', direction: 'left'}, itemData),
            new Item(this, this.player, {key: 'buttonC', weight: 'none', x: 680, y: 1050, type: 'button', sizeX: 'default', sizeY: 'default', direction: 'right'}, itemData),
            new Item(this, this.player, {key: 'buttonC', weight: 'none', x: 1260, y: 1050, type: 'button', sizeX: 'default', sizeY: 'default', direction: 'grab'}, itemData),
            new Item(this, this.player, {key: 'buttonC', weight: 'none', x: 1720, y: 1050, type: 'button', sizeX: 'default', sizeY: 'default', direction: 'release'}, itemData),
        ]

        // Adding collider between the containers and boat
        const zoneBoat = this.add.zone(365, 905, 1185, 305).setOrigin(0);
        this.physics.world.enable(zoneBoat, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.add.collider(this.containers, zoneBoat);

        // Adding overlap for all items
        this.items.forEach(item => {
            this.physics.add.overlap(this.player, item.sprite, () => {this.handleItemOverlap(item);}, null, this);
        });


        // Water
        this.water = this.add.tileSprite(-960, 550, 1920, 1080, 'water')
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(1)
            .setScale(1)
            .setAlpha(0.5)

        this.water2 = this.add.tileSprite(960, 550, 1920, 1080, 'water')
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(1)
            .setScale(1)
            .setAlpha(0.3)

        // Setting up cursor keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.cursors.keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        this.cursors.keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.cursors.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.numKeys = this.input.keyboard.addKeys({
            one: Phaser.Input.Keyboard.KeyCodes.ONE,
            two: Phaser.Input.Keyboard.KeyCodes.TWO,
            three: Phaser.Input.Keyboard.KeyCodes.THREE
        });

        // Have two zones for dropping it into the ocean.
        this.zoneLeft = this.add.zone(0, 910, 450, 270).setOrigin(0);
        this.physics.world.enable(this.zoneLeft, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.add.overlap(this.containers, this.zoneLeft, (container, zone) => {this.handleDrop(container);}, null, this);
        this.zoneRight = this.add.zone(1470, 910, 450, 270).setOrigin(0);
        this.physics.world.enable(this.zoneRight, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.add.overlap(this.containers, this.zoneRight, (container, zone) => {this.handleDrop(container);}, null, this);

    }

    /**
     * update
     * Description: Runs every frame. Scrolls the rain, water, and window drop tile sprites for animated effects. Handles item overlap proximity checks to clear
     *              prompts when the player walks away. On E press, routes to handleCraneWithBox() if a container is currently grabbed, or handledCraneMovement()
     *              if not. Passes input state to the player update each frame.
     * Inputs: None
     * Outputs: None. Updates visual effects and game state every frame as a side effect
     * Called By: Phaser engine once per frame
     * Calls: this.player.update(), this.handleCraneWithBox(), this.handleCraneMovement(), Phaser.Input.Keyboard.JustDown(), Phaser.Math.Distance.Between()
     */
    update () {
        // Rain and water effects
        this.rain.tilePositionY -= 8;
        this.rain.tilePositionX += 2;
        this.water.tilePositionX += 2
        this.water.tilePositionY -= 0.5;
        this.water2.tilePositionX -= 2
        this.water2.tilePositionY -= 0.5;
        this.drops.tilePositionY -= 0.5;
        this.drops.tilePositionX += 0.1;

        // Catches E interactions
        const justPressedE = Phaser.Input.Keyboard.JustDown(this.cursors.keyE);



        // Get rid of button highlight when out of range
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

        // Handles button interactions
        if(justPressedE) {
            if(this.currItem !== null) {
                if(this.currContainer !== null) {
                    this.handleCraneWithBox(this.currItem);
                }else {
                    this.handleCraneMovement(this.currItem);
                }                
            }

            
        }

        // Updates player
        const justPressedM = Phaser.Input.Keyboard.JustDown(this.cursors.keyM);
        this.player.update(this.cursors, this.isHurt || this.isFalling, this, justPressedM, this.numKeys, false);
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
        const registry = this.registry.get('secrets');
        if(registry.anti1) {
            this.antiIcons[0].setAlpha(1);
        }
        
        if(registry.anti2) {
            this.antiIcons[1].setAlpha(1);
        }

        if(registry.anti3) {
            this.antiIcons[2].setAlpha(2);
        }
    }

    /**
     * handleDrop
     * Description: Called when a container overlaps a water drop zone. Plays the drop sound, destroys the container after a short delay, and checks if all containers
     *              have been dropped. If none remain, fades to black and routes to the correct ending scene based on antidote count if second play through. Goes back
     *              to main menu if first time playing.
     * Inputs: 
     *      @param container: the container dropped into the ocean
     * Outputs: None. Destroys the containers and triggers scene transition as a side effect
     * Called By: zoneLeft and zoneRight overlap callbacks in create()
     * Calls: this.dropBox.play(), this.time.delayedCall(), container.destroy(), this.add.rectangle(), this.tweens.add(), this.registry.get(),
     *        this.rainSound.stop(), this.ocean.stop(), this.boatSound.stop(), this.scene.start()
     */
    handleDrop(container) {
        if(this.destroyed) return;
        this.destroyed = true;
        this.dropBox.play();
        this.time.delayedCall(500, () => {
            container.destroy();
            this.destroyed = false;
            this.currContainer = null;

            // Check if all containers dropped
            const remaining = this.containers.filter(c => c.active)
            if(remaining.length === 0) {
                // Trigger ending if all dropped
                const rectFade = this.add.rectangle(0, 0, 1920, 1080, 0x0a0a0a).setOrigin(0).setAlpha(0).setDepth(998);
                this.tweens.add({
                    // Fade 
                    targets: rectFade,
                    alpha: 1,
                    duration: 1000,
                    onComplete: () => {
                        this.rainSound.stop();
                        this.ocean.stop();
                        this.boatSound.stop();
                        //go back to menu screen
                        const antidotes = this.registry.get('secrets');
                        const antidoteCount = [antidotes.anti1, antidotes.anti2, antidotes.anti3].filter(Boolean).length;
                        if(antidoteCount === 3) {
                            // Start good ending
                            this.scene.start('TrueEnding');
                        }else if(antidoteCount === 2) {
                            // Start midEnding
                            this.scene.start('MidEnding');
                        }else if(!this.registry.get('secrets').firstDLC) {
                            // Go back to mainmenu after if already played the game
                            this.scene.start('MenuScene');
                        }else {
                            // Normal ending on first play
                            this.registry.get('secrets').firstDLC = false;
                            this.scene.start('DLCEnding');
                        }
                    }
                });
            }

        });

    }

    /**
     * handleCraneMovement
     * Description: Moves the crane left, right, or down when no container is grabbed. enforces crane x and y bounds before tweening. Guards against
     *              overlapping move calls with a flag. Plays crane mvoe sound on each action.
     * Inputs: 
     *      @param item: The control button item that was pressed, used to read direction
     * Outputs: None. Tweens the crane position as a side effect
     * Called By: update() when E is pressed and no container is currently grabbed
     * Calls: this.craneMove.play(), this.tweens.add()
     */
    handleCraneMovement(item) {
        // Guards against spamming the crane buttons
        if(this.currMoving) return;
        this.currMoving = true;
        this.craneMove.play();

        // Moves crane according to the direction
        if(item.config.direction === 'left') {
            if(this.crane.x - 240 <= this.craneMinX) {
                this.currMoving = false;
                return;
            }
            this.tweens.add({
                targets: this.crane,
                x: this.crane.x - 220,
                duration: 1000,
                ease: 'Sine.easeInOut',
                onComplete: () => {this.currMoving = false;
                }
            });
        }else if(item.config.direction === 'right') {
            if(this.crane.x + 220 > this.craneMaxX) {
                this.currMoving = false;
                return;
            }
            this.tweens.add({
                targets: this.crane,
                x: this.crane.x + 220,
                duration: 1000,
                ease: 'Sine.easeInOut',
                onComplete: () => {this.currMoving = false;
                }
            });
        }else if(item.config.direction === 'grab' && !this.grabbing) {
            // Lowers the crane
            if(this.crane.y >= this.craneMaxY) {
                this.currMoving = false;
                return;
            }
            this.tweens.add({
                targets: this.crane,
                y: this.crane.y + 150,
                duration: 1000,
                ease: 'Sine.easeInOut',
                onComplete: () => {
                    this.currMoving = false;
                }   
            });
            
        }else {
            this.currMoving = false;
        }
    }

    /**
     * handleCraneWithBox
     * Description: Moves the crane left or right with the currently grabbed container in tow, or releases the container by re-enabling gravity and its physics
     *              body. Pressing grab again while holding a box does nothing. Guards against overlapping move calls with a flag. Plays crane move sound on
     *              each action.
     * Inputs: 
     *      @param item: the control button direction
     * Outputs: None. Tweens the crane and box that was picked up
     * Called By: update() when E is pressed and a container is currently grabbed
     * Calls: this.craneMove.play(), this.tweens.add(), this.currContainer.setGravityY(), this.currContainer.body.setEnable(), this.time.delayedCall()
     */
    handleCraneWithBox(item) {
        if(this.currMoving) return;
        this.currMoving = true;
        this.craneMove.play();

        // Handles tweening crane and container/box depending in user input direction
        if(item.config.direction === 'left') {
            console.log(this.crane.x + " || ");
            console.log(this.crane.x - 240);
            
            if(this.crane.x - 240 <= this.craneMinX) {
                this.currMoving = false;
                return;
            }
            this.tweens.add({
                targets: [this.crane, this.currContainer],
                x: this.crane.x - 220,
                duration: 1000,
                ease: 'Sine.easeInOut',
                onComplete: () => {this.currMoving = false;
                }
            });
        }else if(item.config.direction === 'right') {
            if(this.crane.x + 220 > this.craneMaxX) {
                this.currMoving = false;
                return;
            }
            this.tweens.add({
                targets: [this.crane, this.currContainer],
                x: this.crane.x + 220,
                duration: 1000,
                ease: 'Sine.easeInOut',
                onComplete: () => {this.currMoving = false;
                }
            });
        }else if (item.config.direction === 'release') {
            // Handles when the player drops the box. enables gravity again for the box.
            this.currContainer.setGravityY(500);
            this.currContainer.body.setEnable(true);
            this.currMoving = false;
            this.grabbing = false;
            this.currContainer = null;
            this.time.delayedCall(1000, () => {
                this.grabbed = false;
            });
        }else {
            // Pressing grab again so do nothing since we have box
            this.currMoving = false;
        }
    }

    /**
     * handleGrab
     * Description: Called when the crane overlaps a container. Attaches the container to the crane by disabling its gravity and physics body, then tweens both the
     *              crane and container upward. Guards against the grabbing multiple containers with a flag. Sets grabbing to true one the pull-up tween completes
     * Inputs: 
     *      @param container: the container being grabbed
     * Outputs: None. Pulls the container upward and sets grabbing stat as a side effect
     * Called By: Container overlap call back registered in create()
     * Calls: this.craneMove.play(), this.tweens.add(), container.setGravityY(), container.setVelocity(), container.body.setEnable()
     */
    handleGrab(container) {
        if(this.grabbed) return;
        // Currently grabbing a box
        this.grabbed = true; 
        this.craneMove.play();
        // Upon collision, attach box to crane and move up, then can move left and right again
        this.currContainer = container;
        this.currContainer.setGravityY(0);
        this.currContainer.setVelocity(0);
        this.currContainer.body.setEnable(false)
        this.currMoving = true;
        this.tweens.add({
            targets: [this.crane, this.currContainer],
            y: '-=150',
            duration: 1000,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.currMoving = false;
                this.grabbing = true;
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
        if (this.currOverlapping) return;
        this.currOverlapping = true;
        this.currItem = item;
        item.sprite.postFX.addGlow(0xffffff, 2, 0, false, 0.1, 2);

        // Only pick up item if it's pick upable
        if(item.type === 'pickup'){
            this.fPrompt = this.add.image(item.sprite.x + (item.sprite.width / 2) - 14, item.sprite.y - (item.sprite.height * 1.5), 'f').setDepth(1).setOrigin(0, 1).setScale(0.5);
            this.currItemPickupable = true;
        }else {
            this.ePrompt = this.add.image(item.sprite.x + (item.sprite.width / 2) - 15, item.sprite.y - (item.sprite.height * 1.2), 'e').setDepth(991).setOrigin(0, 1).setScale(0.5);
            this.currItemPickupable = false;
        }
    }


}