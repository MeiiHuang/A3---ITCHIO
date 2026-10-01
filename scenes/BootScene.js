/**
 * Author: Mei Huang
 * BootScene.js
 * Description: The first scene to run in the first play through. Loads every asset this scene needs before anything else
 *              starts. Also initializes the secrets registry object once it persists across all scenes throughout the game.
 * Inputs: None
 * Outputs: None
 * Called By: Phaser game config
 * Calls: MenuScene
 */

class BootScene extends Phaser.Scene {

    /**
     * constructor
     * Description: Registers this scene with phaser as the key 'BootScene'
     * Inputs: None
     * Outputs: None
     * Called By: Phaser Game when the game config is processed
     * Calls: super()
     */
    constructor() {
        super({key: 'BootScene'});
    }

    /**
     * preload
     * Description: Loads all the game assets into the Phaser's cashe. Images, spritesheets, audio, and json dialogue data.
     *              Also sets up secrets registry here for sharing game states across each level/scene.
     * Inputs: None
     * Outputs: None
     * Called By: Phaser Engine automatically before create()
     * Calls: this.registry.set(), this.load.image(), this.load.spritesheet(), this.load.json(), this.load.audio()
     */
    preload() {
        
        //Instantiate game registry variables
        this.registry.set('secrets', { firstPlay: true, level1: false, level2: false, level3: false, collectAll: false, showMessage: false, anti1: false, anti2: false, anti3: false, firstDLC: true, showDLC: false});
        //CHANGE firstPlay AND firstDLC BACK!!!-------------------------------------------------------



        // const gl = document.createElement('canvas').getContext('webgl');
        // console.log(gl.getParameter(gl.MAX_TEXTURE_SIZE));

        // Ui + shared assets + player assets
        this.load.image('p1', 'assets/images/level1/p1.png');
        this.load.image('dialogue', 'assets/images/a2/dialogue.png');
        this.load.json('dia', 'assets/json/dialogues.json');
        this.load.image('badEnding', 'assets/images/a2/badEndingScreen.png');
        this.load.image('goodEnding', 'assets/images/a2/goodEndingScreen.png');
        this.load.image('levels', 'assets/images/a2/levelButton.png');
        this.load.image('levels1', 'assets/images/a2/levels1.png');
        this.load.image('levels2', 'assets/images/a2/levels2.png');
        this.load.image('levels3', 'assets/images/a2/levels3.png');
        this.load.image('level1star', 'assets/images/a2/levels1s.png');
        this.load.image('level2star', 'assets/images/a2/levels2s.png');
        this.load.image('level3star', 'assets/images/a2/levels3s.png');
        this.load.image('star', 'assets/images/a2/star.png');
        this.load.image('popup', 'assets/images/a2/popup.png');
        this.load.image('levelspop', 'assets/images/a2/levels.png');
        this.load.image('back', 'assets/images/a2/backButton.png');
        this.load.image('message', 'assets/images/a2/titlePopup.png');
        this.load.image('homeIcon', 'assets/images/a2/homeIcon.png');
        this.load.image('speech', 'assets/images/a2/speechBub.png');
        this.load.image('lives', 'assets/images/a2/lifeIcon.png');
        this.load.spritesheet('player', 'assets/images/a2/playerBackpack.png', {frameWidth: 75, frameHeight: 54});
        this.load.spritesheet('playerNoB', 'assets/images/a2/player.png', {frameWidth: 75, frameHeight: 54});
        this.load.image('srtBtn', 'assets/images/a2/startButton.png');

        // Cut scene panels
        this.load.image('beginningCutScene', 'assets/images/a2/beginningScene1.png');
        this.load.image('beginningCutScene2', 'assets/images/a2/beginningScene2.png');
        this.load.image('badEndingCutScene', 'assets/images/a2/badEnding.png');
        this.load.image('goodEndingCutScene', 'assets/images/a2/goodEnding.png');

        // Menu backgrounds
        this.load.image('menuBg', 'assets/images/a2/titlePage.png');
        this.load.image('sky', 'assets/images/a2/sky.png');
        this.load.image('rBirds', 'assets/images/a2/rBirds.png');
        this.load.image('lBirds', 'assets/images/a2/lBirds.png');
        this.load.image('clouds', 'assets/images/a2/clouds.png');
        this.load.image('home', 'assets/images/a2/home.png');
        this.load.spritesheet('gmOv', 'assets/images/a2/gameOver.png', {frameWidth: 1920, frameHeight: 1080});

        // DLC UI + shared assets + player assets
        this.load.json('items', 'assets/json/items.json');
        this.load.image('inventory', 'assets/images/level4/inventory.png');
        this.load.image('f', 'assets/images/player/f.png');
        this.load.image('e', 'assets/images/player/e.png');
        this.load.image('textBox', 'assets/images/player/textBox.png');
        this.load.image('closedDoor', 'assets/images/level4/doorClosed.png');
        this.load.image('openedDoor', 'assets/images/level4/doorOpen.png');
        this.load.image('dialogueBox', 'assets/images/player/dialogueBox.png');
        this.load.image('diaBox2', 'assets/images/player/dialogueBox2.png');

        // DLC Level 4 assets
        this.load.image('level4bg1', 'assets/images/level4/section1bg.png');
        this.load.image('level4bg2', 'assets/images/level4/section2bg.png');
        this.load.image('mainCage', 'assets/images/level4/mainCage.png');
        this.load.image('wall', 'assets/images/level4/wall.png');
        this.load.image('ventCover', 'assets/images/level4/ventCover.png');
        this.load.image('firstVent', 'assets/images/level4/firstVent.png');
        this.load.image('secondVent', 'assets/images/level4/secondVent.png');
        this.load.image('secondCover', 'assets/images/level4/ventCover2.png');
        this.load.image('garbage', 'assets/images/level4/garbage.png');
        this.load.image('disposer', 'assets/images/level4/disposer.png');
        this.load.image('keyCard', 'assets/images/level4/keyCard.png');
        this.load.image('terminal', 'assets/images/level4/terminal.png');
        this.load.image('stickyNote1', 'assets/images/level4/stickyNote.png');
        this.load.image('stickyNote2', 'assets/images/level4/stickyNote.png');
        this.load.image('clippers', 'assets/images/level4/clippers.png');
        this.load.image('electricalPanel', 'assets/images/level4/electricPanel.png');
        this.load.spritesheet('jumpScare', 'assets/images/level4/jumpScare.png', {frameWidth: 925, frameHeight: 700});
        this.load.image('morphPrompt', 'assets/images/level4/morphPrompt.png');
        this.load.image('scent1', 'assets/images/level4/scent1.png');
        this.load.image('scent2', 'assets/images/level4/scent2.png');
        this.load.spritesheet('guard', 'assets/images/player/guard.png', {frameWidth: 298, frameHeight: 496});
        this.load.image('stinky', 'assets/images/level4/stinky.png');
            //Alarm Room
        this.load.spritesheet('solutionAnim', 'assets/images/level4/solutionAnim.png', {frameWidth: 470, frameHeight: 258 });
        this.load.spritesheet('solution2Anim', 'assets/images/level4/solution2Anim.png', {frameWidth: 470, frameHeight: 258 });
        this.load.spritesheet('craneAnim', 'assets/images/level4/craneAnim.png', { frameWidth: 306, frameHeight: 396});
        this.load.image('alarmGlass', 'assets/images/level4/seeThroughAlarm.png');
        this.load.image('button', 'assets/images/level4/button.png');
        this.load.image('sequencer', 'assets/images/level4/sequencer.png');
        this.load.image('secretBox', 'assets/images/level4/secretBox.png');
        this.load.image('anti1', 'assets/images/level4/anti1.png');
            //Audio
        this.load.audio('wrong', 'assets/audio/level4/wrong.mp3');
        this.load.audio('correct', 'assets/audio/level4/correct.mp3');
        this.load.audio('press', 'assets/audio/level4/press.mp3');

        // Level 5
        this.load.image('level5Section1', 'assets/images/level5/section1.png');
        this.load.image('level5Section2', 'assets/images/level5/section2.png');
        this.load.image('level5Section3', 'assets/images/level5/section3.png');
        this.load.image('lockers', 'assets/images/level5/lockers.png');
        this.load.image('fingerPrint', 'assets/images/level5/fingerPrint.png');
        this.load.image('reception', 'assets/images/level5/receptionist.png');
        this.load.image('logistics', 'assets/images/level5/logistics.png');
        this.load.image('dualID', 'assets/images/level5/id.png');
        this.load.spritesheet('scientist', 'assets/images/level5/scientist.png', {frameWidth: 367, frameHeight: 645});
        this.load.image('employee', 'assets/images/level5/employee.png');
        this.load.spritesheet('kenji', 'assets/images/level5/kenji.png', {frameWidth: 880, frameHeight: 571});
        this.load.image('books', 'assets/images/level5/books.png');
        this.load.image('awards', 'assets/images/level5/awards.png');
        this.load.spritesheet('printer', 'assets/images/level5/printer.png', {frameWidth: 322, frameHeight: 554});
        this.load.image('pc', 'assets/images/level5/pc.png');
        this.load.image('fridge', 'assets/images/level5/fridge.png');
        this.load.image('tubes', 'assets/images/level5/tubes.png');
        this.load.image('kenjiAnim', 'assets/images/level5/kenjiAnim.png');
        this.load.spritesheet('showcase', 'assets/images/level5/showcase.png', {frameWidth: 1371, frameHeight: 913});
        this.load.image('door', 'assets/images/level5/door.png');
        this.load.image('email', 'assets/images/level5/email.png');
        this.load.image('send', 'assets/images/level5/send.png');
        this.load.image('add', 'assets/images/level5/add.png');
        this.load.image('files', 'assets/images/level5/files.png');
        this.load.image('f1', 'assets/images/level5/file1.png');
        this.load.image('f2', 'assets/images/level5/file2.png');
        this.load.image('f3', 'assets/images/level5/file3.png');
        this.load.image('f4', 'assets/images/level5/file4.png');
        this.load.image('f5', 'assets/images/level5/file5.png');
        this.load.image('leave' ,'assets/images/level5/leave.png');
        this.load.image('wrench', 'assets/images/level5/wrench.png');
        this.load.image('paper', 'assets/images/level5/paper.png');
        this.load.image('accessCard1', 'assets/images/level5/accessCard.png');
        this.load.image('accessCard2', 'assets/images/level5/accessCard.png');
        this.load.spritesheet('brokenTube', 'assets/images/level5/tankBroken.png', {frameWidth: 327, frameHeight: 873});
        this.load.spritesheet('d3', 'assets/images/level5/d3.png', {frameWidth: 605, frameHeight: 804});
        this.load.image('ventMouse', 'assets/images/level5/ventMouse.png');
        this.load.image('mouse', 'assets/images/level5/mouse.png');
        this.load.image('anti2', 'assets/images/level5/anti2.png');
        this.load.image('lumico', 'assets/images/level5/lumico.png');

        // Level6
        this.load.image('section1lvl6', 'assets/images/level6/section1.png');
        this.load.image('section1-1', 'assets/images/level6/section1-1.png');
        this.load.image('section2lvl6', 'assets/images/level6/section2.png');
        this.load.image('section2-1', 'assets/images/level6/section2-2.png');
        this.load.image('section3lvl6', 'assets/images/level6/section3.png');
        this.load.image('section3-1', 'assets/images/level6/section3-2.png');
        this.load.image('lvl6-1', 'assets/images/level6/lvl6-1.png');
        this.load.image('lvl6-2', 'assets/images/level6/lvl6-2.png');
        this.load.image('lvl6-3', 'assets/images/level6/lvl6-3.png');
        this.load.image('lvl6-4', 'assets/images/level6/lvl6-4.png');
        this.load.image('lvl6-5', 'assets/images/level6/lvl6-5.png');
        this.load.image('locker', 'assets/images/level6/locker.png');
        this.load.image('openLocker', 'assets/images/level6/openLocker.png');
        this.load.image('guardShipDog', 'assets/images/level6/guardDog.png');
        this.load.image('guardShip', 'assets/images/level6/guard.png');
        this.load.image('bookshelf', 'assets/images/level6/books.png');
        this.load.image('chef', 'assets/images/level6/chef.png');
        this.load.image('control', 'assets/images/level6/control.png');
        this.load.image('door6', 'assets/images/level6/door6.png');
        this.load.image('hat', 'assets/images/level6/hat.png');
        this.load.image('bell', 'assets/images/level6/bell.png');
        this.load.spritesheet('captain', 'assets/images/level6/captain.png', {frameWidth: 297, frameHeight: 501});
        this.load.image('capBed', 'assets/images/level6/capBed.png');
        this.load.image('scent6', 'assets/images/level6/scent.png');
        this.load.image('bed1' , 'assets/images/level6/bed1.png');
        this.load.image('bed2' , 'assets/images/level6/bed2.png');
        this.load.image('bed3' , 'assets/images/level6/bed3.png');
        this.load.image('bed4' , 'assets/images/level6/bed4.png');
        this.load.image('bed5' , 'assets/images/level6/bed5.png');
        this.load.image('bed6' , 'assets/images/level6/bed6.png');
        this.load.image('pass', 'assets/images/level6/pass.png');
        this.load.image('denied', 'assets/images/level6/denied.png');
        this.load.image('granted', 'assets/images/level6/granted.png');
        this.load.image('a', 'assets/images/level6/a.png');
        this.load.image('k', 'assets/images/level6/k.png');
        this.load.image('l', 'assets/images/level6/l.png');
        this.load.image('m', 'assets/images/level6/m.png');
        this.load.image('n', 'assets/images/level6/n.png');
        this.load.image('s', 'assets/images/level6/s.png');
        this.load.image('2', 'assets/images/level6/2.png');
        this.load.image('3', 'assets/images/level6/3.png');
        this.load.image('4', 'assets/images/level6/4.png');
        this.load.image('7', 'assets/images/level6/7.png');
        this.load.image('8', 'assets/images/level6/8.png');
        this.load.image('9', 'assets/images/level6/9.png');
        this.load.image('enter', 'assets/images/level6/enter.png');
        this.load.image('passInteractive', 'assets/images/level6/passInteractive.png');
        this.load.image('openedSafe', 'assets/images/level6/openedSafe.png');
        this.load.image('anti3', 'assets/images/level6/anti3.png');

        // Crane
        this.load.image('rain', 'assets/images/level6/rain.png');
        this.load.image('water', 'assets/images/level6/waves.png');
        this.load.image('craneBg', 'assets/images/level6/craneBg.png');
        this.load.image('base', 'assets/images/level6/base.png');
        this.load.image('boat', 'assets/images/level6/boat.png');
        this.load.image('controls', 'assets/images/level6/controls.png');
        this.load.image('reflect', 'assets/images/level6/reflect.png');
        this.load.image('glass', 'assets/images/level6/glass.png');
        this.load.image('windowDrop', 'assets/images/level6/windowDrop.png');
        this.load.image('crate', 'assets/images/level6/box.png');
        this.load.image('buttonC', 'assets/images/level6/button.png');

        //Hints
        this.load.image('hint', 'assets/images/player/hint.png');
        this.load.image('hintPanel', 'assets/images/level4/hintPanel.png');
        this.load.image('hintCover', 'assets/images/player/hintCover.png');

        // Player
        this.load.spritesheet('catAnim', 'assets/images/player/cat.png', {frameWidth: 249, frameHeight: 210});
        this.load.spritesheet('dogAnim', 'assets/images/player/dog.png', {frameWidth: 320, frameHeight: 200});
        this.load.spritesheet('humanAnim', 'assets/images/player/human.png', {frameWidth: 298, frameHeight: 492});
            //Morphing anims
        this.load.spritesheet('catToDog', 'assets/images/player/catToDog.png', {frameWidth: 204, frameHeight: 137});
        this.load.spritesheet('dogToHuman', 'assets/images/player/dogToHuman.png', {frameWidth: 280, frameHeight: 487});
        this.load.spritesheet('catToHuman', 'assets/images/player/humanToCat.png', {frameWidth: 200, frameHeight: 414});





        // Level 1 assets
        this.load.image('level1FarBg', 'assets/images/level1/level1FarBg.png');
        this.load.image('level1MidBg', 'assets/images/level1/level1MidBg.png');
        this.load.spritesheet('smllPlatform', 'assets/images/level1/level1Plt.png', {frameWidth:276, frameHeight:159});
        this.load.image('smallStep', 'assets/images/level1/smallplt.png');
        this.load.image('checkpoint', 'assets/images/level1/checkpoint.png');
        this.load.image('frogNpc', 'assets/images/level1/npc.png');
        this.load.image('bird', 'assets/images/level1/bird.png');
        this.load.spritesheet('birdFly', 'assets/images/level1/birdFly.png', {frameWidth: 229, frameHeight: 211});
        this.load.image('nest', 'assets/images/level1/nest.png');
        this.load.image('mrRaven', 'assets/images/level1/raven.png');

        // Level 2 assets
        this.load.image('level2FarBg', 'assets/images/level2/far.png');
        this.load.image('level2MidBg', 'assets/images/level2/mid.png');
        this.load.image('level2Platform', 'assets/images/level2/plat1.png');
        this.load.image('level2SmllPlt', 'assets/images/level2/platSmll.png');
        this.load.image('lilyPad', 'assets/images/level2/lily.png');
        this.load.image('willow', 'assets/images/level2/willow.png');
        this.load.image('stump', 'assets/images/level2/stump.png');
        this.load.image('p2', 'assets/images/level2/p2.png');
        this.load.image('cityH', 'assets/images/a2/cityHouse.png');
        this.load.spritesheet('brother', 'assets/images/level2/brother.png', {frameWidth: 130, frameHeight: 135});
        this.load.image('drone', 'assets/images/level2/drone.png');
        this.load.image('frogEne', 'assets/images/level2/frog.png');

        //Level 3 assets
        this.load.image('level3FarBg', 'assets/images/level3/level3FarBg.png');
        this.load.image('level3MidBg', 'assets/images/level3/level3MidBg.png');
        this.load.image('big', 'assets/images/level3/bigg.png');
        this.load.image('small', 'assets/images/level3/smll.png');
        this.load.image('box', 'assets/images/level3/box.png');
        this.load.image('jugPlat', 'assets/images/level3/form.png');
        this.load.image('jug', 'assets/images/level3/jug.png');
        this.load.image('movingPlat', 'assets/images/level3/movingg.png');
        this.load.image('security', 'assets/images/level3/drone.png');
        this.load.image('holo', 'assets/images/level3/npc.png');
        this.load.image('p3', 'assets/images/level3/p3.png');
        this.load.image('line', 'assets/images/level3/line.png');
        this.load.image('lineL', 'assets/images/level3/droneLine.png');
        this.load.image('brokenDrone', 'assets/images/level3/brokenDrone.png');
        this.load.image('moonFlakes', 'assets/images/level3/moonFlakes.png');
        this.load.spritesheet('dripping', 'assets/images/level3/drip.png', {frameWidth: 320, frameHeight: 160});

        //mis
        this.load.image('dlcBtn', 'assets/images/misc/dlc.png');
        this.load.image('dlc1', 'assets/images/misc/dlc1.png');
        this.load.image('dlc1Star', 'assets/images/misc/dlc1Star.png');
        this.load.image('dlc2', 'assets/images/misc/dlc2.png');
        this.load.image('dlc2Star', 'assets/images/misc/dlc2Star.png');
        this.load.image('dlc3', 'assets/images/misc/dlc3.png');
        this.load.image('dlc3Star', 'assets/images/misc/dlc3Star.png');
        this.load.image('dummy', 'assets/images/misc/dummy.png');
        this.load.image('afterDLC', 'assets/images/misc/afterDLC.png');
        this.load.image('dlcMessage', 'assets/images/misc/dlcMessage.png');
        this.load.image('dlcEnding1', 'assets/images/misc/dlcEnding1.png');
        this.load.image('midEnding', 'assets/images/misc/dlcEnding2.png');
        this.load.image('trueEnding', 'assets/images/misc/dlcEnding3.png');
        this.load.image('toDLC', 'assets/images/misc/toDLC.png');
        this.load.image('DLCHome', 'assets/images/misc/dlcHome.png');

        // All audio assets
        this.load.audio('meow', 'assets/audio/A2/meow.mp3');
        this.load.audio('meow2', 'assets/audio/A2/meow1.mp3');
        this.load.audio('hiss', 'assets/audio/A2/hiss.mp3');
        this.load.audio('fall', 'assets/audio/A2/catOut.mp3');
        this.load.audio('level1Song', 'assets/audio/A2/level1.mp3');
        this.load.audio('chirp', 'assets/audio/A2/chirp.mp3');
        this.load.audio('level2Song', 'assets/audio/A2/level2.mp3');
        this.load.audio('croak', 'assets/audio/A2/croak.mp3');
        this.load.audio('rustle', 'assets/audio/A2/lilyFall.mp3');
        this.load.audio('level3Song', 'assets/audio/A2/level3.mp3');
        this.load.audio('waterDrip', 'assets/audio/A2/waterDrip.mp3');
        this.load.audio('droneBreak', 'assets/audio/A2/droneBreak.mp3');
        this.load.audio('pickup', 'assets/audio/A2/pickup.mp3');
        this.load.audio('brotherJump', 'assets/audio/A2/brotherJump.mp3');
        this.load.audio('squawk', 'assets/audio/A2/squawk.mp3');
        this.load.audio('bark', 'assets/audio/bark.mp3');
        this.load.audio('bark2', 'assets/audio/bark2.mp3');

        this.load.audio('doorOpen', 'assets/audio/doorOpen.mp3');
        this.load.audio('pickupSound', 'assets/audio/pickup.mp3');
        this.load.audio('textSound', 'assets/audio/textSound.mp3');
        this.load.audio('diaBox', 'assets/audio/diaBox.mp3');
        this.load.audio('antiPickup', 'assets/audio/antidotePickup.mp3');
        this.load.audio('openVent', 'assets/audio/vent.mp3');

        this.load.audio('humanSteps', 'assets/audio/walkingHuman.mp3');
        this.load.audio('buttonHover', 'assets/audio/buttonSound.mp3');

        //level 4 audio
        this.load.audio('thud', 'assets/audio/level4/thud.mp3');
        this.load.audio('cageCreak', 'assets/audio/level4/cageCreak.mp3');
        this.load.audio('metalBreak', 'assets/audio/level4/metalBreak.mp3');
        this.load.audio('chains', 'assets/audio/level4/chains.mp3');
        this.load.audio('chuteDoor', 'assets/audio/level4/chuteDoor.mp3');
        this.load.audio('alarm', 'assets/audio/level4/alarm.mp3');
        this.load.audio('whiteSound', 'assets/audio/level4/whiteSound.mp3');
        this.load.audio('openAnti', 'assets/audio/level4/openAnti.mp3');
        this.load.audio('craneSol', 'assets/audio/level4/crane.mp3');

        //level 5 audio
        this.load.audio('mouseSqueak', 'assets/audio/level5/mouse.mp3');
        this.load.audio('scanner', 'assets/audio/level5/bio.mp3');
        this.load.audio('office', 'assets/audio/level5/office.mp3');
        this.load.audio('typing', 'assets/audio/level5/typing.mp3');
        this.load.audio('pcAccess', 'assets/audio/level5/pc.mp3');
        this.load.audio('mouseClick', 'assets/audio/level5/mouseClick.mp3');
        this.load.audio('printerSound', 'assets/audio/level5/printer.mp3');
        this.load.audio('printerBeep', 'assets/audio/level5/printerBeep.mp3');
        this.load.audio('glassBreak', 'assets/audio/level5/glassBreak.mp3');
        this.load.audio('water', 'assets/audio/level5/water.mp3');
        this.load.audio('antiGlass', 'assets/audio/level5/glassAnti.mp3');
        this.load.audio('cardInsert', 'assets/audio/level5/cardInsert.mp3');
        this.load.audio('d3Door', 'assets/audio/level5/d3Door.mp3');
        this.load.audio('error', 'assets/audio/level5/error.mp3');
        //Level 6 audio
        this.load.audio('rainSound', 'assets/audio/level6/rain.mp3');
        this.load.audio('bell', 'assets/audio/level6/bell.mp3');
        this.load.audio('lockerOpen', 'assets/audio/level6/locker.mp3');
        this.load.audio('fabric', 'assets/audio/level6/fabric.mp3');
        this.load.audio('moveShelf', 'assets/audio/level6/moveShelf.mp3');
        this.load.audio('onBoat', 'assets/audio/level6/boat.mp3');
        this.load.audio('craneMove', 'assets/audio/level6/crane.mp3');
        this.load.audio('ocean', 'assets/audio/level6/oceanWaves.mp3');
        this.load.audio('dropBox', 'assets/audio/level6/dropBox.mp3');


        
    }

    /**
     * create
     * Description: Called by Phaser after all assets are loaded
     * Inputs: None
     * Outputs: None
     * Called By: Phaser engine after preload() completes
     * Calls: this.scene.start('MenuScene')
     */
    create() {
        // Go to main menu screen
        this.scene.start('MenuScene');
    }
}