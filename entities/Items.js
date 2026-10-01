/**
 * Author: Mei Huang
 * Program Name: Item
 * Description: Defines the Item class. Manages all itneractive and pickupable objects in the game. Items are initialized as either 
 *              physics images or physics sprites depending on if they have animation frames. Handles pickup, drop, and glow effects,
 *              proximity text, weight-based carry checks, and item data lookups from the items JSON file. Item types include: pickup,
 *              interactive, button, branching, puzzle, locker, and lockerSp.
 * Inputs: None
 * Outputs: None
 * Called By: Level4.js, Level5.js, Level6.js, Crane.js
 * Calls: scene.physics.add.image(), scene.physics.add.sprite(), scene.physics.add.overlap()
 */
class Item {

    /**
     * constructor
     * Description: Builts the item physics body in the world. Initializes all item state flags and pulls item data from item JSON
     *              using the config key. Creates the sprite as a physics sprite for puzzle types (puzzle types have animations) or
     *              a physics image for all other types. Applies a custom hitbox size if sizeX is not 'default', sets depth for button
     *              type items.
     * Inputs:
     *      @param scene: the level scene to add the item to
     *      @param player: reference to the player, used for carry checks and form lookups
     *      @param config: item configuration with the following fields:
     *              key (string): the texture/sprite key
     *              weight (string): item weight ('light', 'medium', 'heavy')
     *              x (number): x position in the world
     *              y (number): y position in the world
     *              type (string): item type ('pickup', 'interactive', 'button', 'branching', 'puzzle', 'locker', 'lockerSp')
     *              sizeX (number|string): hitbox width or 'default' to use sprite size
     *              sizeY (number|string): hitbox height or 'default' to use sprite size
     *              direction (string): optional, used by button types
     *      @param itemData: the parsed items.json cache used to look up text and weight data per key
     * Ouputs: None. Creates and registers the item sprite as a side effect
     * Called By: Level4.create(), Level5.create(), Level6.create(), Crane.create()
     * Calls: scene.physics.add.sprite(), scene.physics.add.image(), this.sprite.setOrigin(), this.sprite.setSize(), this.sprite.setDepth()
     */
    constructor(scene, player, config, itemData) {
        this.scene = scene;
        this.player = player;
        this.config = config;
        this.key = config.key;
        this.data = itemData[config.key];
        this.isPickedUp = false;
        this.proximityText = null;
        this.playerNear = false;
        this.glow = null;
        this.type = config.type;

        //Puzzles have animation frames so initialize them as sprites
        if(config.type === 'puzzle') {
            this.sprite = scene.physics.add.sprite(config.x, config.y, config.key).setOrigin(0, 1);
        }else {
            // Add sprites into the world if it doesnt have animation
            this.sprite = scene.physics.add.image(config.x, config.y, config.key).setOrigin(0, 1);
        }

        // Change sprite size if specified
        if(config.sizeX !== 'default') {
            this.sprite.setSize(config.sizeX, config.sizeY, true);
        }

        // Setting depth for buttons
        if(config.type === 'button') {
            this.sprite.setDepth(991);
        }
    }

    // update() {
    //     if (this.isPickedUp) return;

    //     if (this.playerNear) {
    //         this.showGlow();
    //         this.showInteractiveText();
    //     } else {
    //         this.hideGlow();
    //         this.hideInteractiveText();
    //     }
    //     this.playerNear = false;

    // }

    // handleInteract(form) {
    //     if (this.isPickedUp) return null;
    //     if (!this.playerNear) return null;

    //     if (this.canCarry(form)) {
    //         this.isPickedUp = true;
    //         this.sprite.setVisible(false);
    //         this.sprite.body.enable = false;
    //         this.hideGlow();
    //         this.hideInteractiveText();
    //         return 'picked_up';
    //     }else {
    //         this.showToast(this.data.tooHeavyText);
    //     }
    // }

    /**
     * drop
     * Description: Drops the item back into the world at the given position. Re-enables the physics body, makes the sprite visible
     *              , and resets the isPickedUp flag.
     * Inputs:
     *      @param x: world x position to drop the item at
     *      @param y: world y position to drop the item at
     * Outputs: None. Respositions and re-enables the sprite as a side effect
     * Called By: Level4.update(), Level5.update(), Level6.update() via player itemDropped event, and directly called in disposeGarbage(),
     *            handleMouse()
     * Calls: this.sprite.setPosition(), this.sprite.setVisible(), this.sprite.body.enable
     */
    drop(x, y) {
        this.isPickedUp = false;
        this.sprite.setPosition(x, y);
        this.sprite.setVisible(true);
        this.sprite.body.enable = true;
    }

    /**
     * canCarry
     * Description: Checks if the given player form has enough carry capacity to pickup this item. Uses a weight hierarchy of
     *              none < light < medium < heavy and compares the form's max capacity against the item's weight.
     * Inputs:
     *      @param form: the player's current form
     * Outputs:
     *      @returns formCarry: true if the form can carry the item, false if its too heavy
     * Called By:  handleInteract(), Level4.update(), Level5.update(), Level6.update() on F key pickup attempt
     * Calls: None
     */
    canCarry(form) { 
        const weights = ['none', 'light', 'medium', 'heavy'];
        const capacity = {cat: 'light', dog: 'medium', human: 'heavy'};
        const formCarry = weights.indexOf(capacity[form]) >= weights.indexOf(this.data.weight);
        return formCarry;
    }

    // showGlow() {
    //     if (this.glow) return;
    //     this.glow = this.sprite.postFX.addGlow(0xffffff, 6, 0, false, 1, 3);
    // }

    // hideGlow() {
    //     if (!this.glow) return;
    //     this.sprite.postFX.clear();
    //     this.glow = null;
    // }

    // showInteractiveText() {
    //     if (this.proximityText) {
    //         this.proximityText.setText(this.data.formText[this.player.getForm()]);
    //         return ;
    //     }

    //     this.proximityText = this.scene.add.text(
    //         640, 800, this.data.formText[this.player.getForm()],
    //         { fontSize: '20px', fill: '#ffffff', backgroundColor: '0x000000', padding: { x: 8, y: 4} }
    //     ).setScrollFactor(1);
    
    // }

    // hideInteractiveText() {
    //     if (!this.proximityText) return;
    //     this.proximityText.destroy();
    //     this.proximityText = null;
    // }

    // showToast(message) {//For when it's too heavy
    //     const toast = this.scene.add.text(
    //         640, 800, message, {fontSize: '24px', fill: '#ffffff', backgroundColor: '0x000000', padding: { x: 8, y: 4}}
    //     ).setScrollFactor(1);
    //     this.scene.time.delayedCall(1500, () => toast.destroy());
    // }

    // ableToPickup() {
    //     return this.config.type;
    // }

    /**
     * getData
     * Description: Returns the item's type string from its config
     * Inputs:
     *      @param item: the item to retrieve data for
     * Outputs:
     *      @returns (string|object): the relevant data field from item.json based on the item type, weight.
     * Called By: Level4.handleInteractive(), Level5.handleInteractive(), Level6.handleInteractive() when showing default item inspection text
     * Calls: None
     */
    getData(item) {
        // Get the json query for interactive objects
        if(item.config.type === 'button') {
            return item.config.type;
        }
        if(item.data.weight === 'branching') {
            return item.data.forms;
        }
        if(item.data.weight === 'interact') {
           return item.data.text;
        }
                
    }

}