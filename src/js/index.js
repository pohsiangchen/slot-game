import 'sanitize.css/sanitize.css';
import * as PIXI from 'pixi.js';
import { getSizeToFillScreen, numberWithCommas } from './utils';

// Create a Pixi Application
let app = new PIXI.Application({
  width: 1920,
  height: 1080,
  antialias: true,
  transparent: false,
  resolution: 1
});

app.renderer.view.style.position = 'absolute';
app.renderer.view.style.display = 'block';
// app.renderer.autoResize = true;

// Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

// load an image and run the `setup` function when it's done
PIXI.loader
  .add('images/autoplay-normal.png')
  .add('images/back-normal.png')
  .add('images/game-background.jpg')
  .add('images/game-logo.png')
  .add('images/info-normal.png')
  .add('images/minus-normal.png')
  .add('images/paytable-normal.png')
  .add('images/plus-normal.png')
  .add('images/quickspin-normal.png')
  .add('images/sound-normal.png')
  .add('images/spin-normal.png')
  .add('images/symbol1.png')
  .add('images/symbol2.png')
  .add('images/symbol3.png')
  .add('images/symbol4.png')
  .add('images/symbol5.png')
  .add('images/symbol6.png')
  .add('images/symbol7.png')
  .add('images/symbol8.png')
  .add('images/symbol9.png')
  .add('images/symbol10.png')
  .load(setup);

// This `setup` function will run when the image has loaded
let bg;
function setup() {
  // Create the bg sprite
  bg = new PIXI.Sprite(PIXI.loader.resources['images/game-background.jpg'].texture);
  bg.anchor.set(0.5, 0.5);
  setupBackgroundView();
  // Add the cat to the stage
  app.stage.addChild(bg);

  window.onresize = function(event) {
    setupBackgroundView();
  };

  initReels();
  initLogo();
  initBackBtn();
  initAutoPlayBtn();
  initTotalWin();
  initTotalBet();
  initMessageView();
  initSoundBtnView();
  initPaytableBtnView();
  initBalanceLabelView();
  initBalanceTextView();
  initQuickSpinBtnView();
  initInfoBtnView();
}

function setupBackgroundView() {
  // Fill screen
  const size = getSizeToFillScreen({
    width: bg.width,
    height: bg.height
  }, {
    width: window.innerWidth,
    height: window.innerHeight
  });

  bg.width = size.width;
  bg.height = size.height;
  bg.x = window.innerWidth / 2;
  bg.y = window.innerHeight / 2;

  app.renderer.resize(window.innerWidth, window.innerHeight);
}

const REEL_WIDTH = 150;
const SYMBOL_SIZE = 150;
// const BOTTOM_HEIGHT = 124;
let bottom;
function initReels() {
  // Create different slot symbols.
  const slotTextures = [
    PIXI.Texture.fromImage('images/symbol1.png'),
    PIXI.Texture.fromImage('images/symbol2.png'),
    PIXI.Texture.fromImage('images/symbol3.png'),
    PIXI.Texture.fromImage('images/symbol4.png'),
    PIXI.Texture.fromImage('images/symbol5.png'),
    PIXI.Texture.fromImage('images/symbol6.png'),
    PIXI.Texture.fromImage('images/symbol7.png'),
    PIXI.Texture.fromImage('images/symbol8.png'),
    PIXI.Texture.fromImage('images/symbol9.png'),
    PIXI.Texture.fromImage('images/symbol10.png')
  ];

  // Build the reels
  const reels = [];
  const reelContainer = new PIXI.Container();
  for (let i = 0; i < 5; i++) {
    const rc = new PIXI.Container();
    rc.x = i * REEL_WIDTH;
    reelContainer.addChild(rc);

    const reel = {
      container: rc,
      symbols: [],
      position: 0,
      previousPosition: 0,
      blur: new PIXI.filters.BlurFilter()
    };
    reel.blur.blurX = 0;
    reel.blur.blurY = 0;
    rc.filters = [reel.blur];

    // Build the symbols
    for (let j = 0; j < 10; j++) {
      const symbol = new PIXI.Sprite(
        slotTextures[Math.floor(Math.random() * slotTextures.length)]
      );
      // Scale the symbol to fit symbol area.
      // symbol.y = j * SYMBOL_SIZE;
      symbol.scale.x = symbol.scale.y = Math.min(
        SYMBOL_SIZE / symbol.width, SYMBOL_SIZE / symbol.height
      );
      symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);
      symbol.y = j * symbol.height;
      reel.symbols.push(symbol);
      rc.addChild(symbol);
    }
    reels.push(reel);
  }
  app.stage.addChild(reelContainer);

  // Build top & bottom covers and position reelContainer
  const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;
  reelContainer.y = margin;
  reelContainer.x = Math.round(app.screen.width - REEL_WIDTH * 5) / 2;

  // Limits the visibility of reels
  const reelsMask = new PIXI.Graphics();
  reelsMask.drawRect(
    0,
    margin,
    app.screen.width,
    reels[0].symbols[0].height * 3
  );
  reelsMask.renderable = true;
  reelsMask.cacheAsBitmap = true;
  reelContainer.mask = reelsMask;

  bottom = new PIXI.Graphics();
  bottom.beginFill(0xD2F1F6, 1);
  bottom.drawRect(0, SYMBOL_SIZE * 3 + margin, app.screen.width, margin);

  const playBtn = new PIXI.Sprite(PIXI.loader.resources['images/spin-normal.png'].texture);
  playBtn.anchor.set(0.5, 0.5);
  playBtn.scale.x = playBtn.scale.y = Math.min(
    112 / playBtn.width, 112 / playBtn.height
  );
  playBtn.x = app.screen.width - 96;
  playBtn.y = app.screen.height - margin;
  bottom.addChild(playBtn);
  playBtn.interactive = true;
  playBtn.buttonMode = true;
  playBtn.addListener('pointerdown', function() {
    startPlay();
  });

  app.stage.addChild(bottom);

  let running = false;

  // Function to start playing.
  function startPlay() {
    if (running || balance <= 0) return;
    // calculate balance
    balance -= 10;
    balanceText.text = `£${balance}`;
    if (balance === 0) playBtn.interactive = false;

    running = true;
    for (let i = 0; i < reels.length; i++) {
      const r = reels[i];
      const extra = Math.floor(Math.random() * 3);
      tweenTo(
        r,
        'position',
        r.position + 10 + i * 5 + extra,
        2500 + i * 600 + extra * 600,
        backout(0.6),
        null,
        i === reels.length - 1 ? reelsComplete : null
      );
    }
  }

  // Reels done handler.
  function reelsComplete() {
    running = false;
  }

  // Listen for animate update.
  app.ticker.add(function(delta) {
    // Update the slots.
    for (let i = 0; i < reels.length; i++) {
      const r = reels[i];
      // Update blur filter y amount based on speed.
      // This would be better if calculated with time in mind also. Now blur depends on frame rate.
      r.blur.blurY = (r.position - r.previousPosition) * 8;
      r.previousPosition = r.position;

      // Update symbol positions on reel.
      for (let j = 0; j < r.symbols.length; j++) {
        const s = r.symbols[j];
        const prevy = s.y;
        s.y = (r.position + j) % r.symbols.length * s.height - s.height;
        if (s.y < 0 && prevy > s.height) {
          // Detect going over and swap a texture.
          // This should in proper product be determined from some logical reel.
          s.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
          s.scale.x = s.scale.y = Math.min(
            SYMBOL_SIZE / s.texture.width, SYMBOL_SIZE / s.texture.height
          );
          s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
        }
      }
    }
  });
}

// Very simple tweening utility function.
// This should be replaced with a proper tweening library in a real product.
const tweening = [];
function tweenTo(object, property, target, time, easing, onchange, oncomplete) {
  const tween = {
    object: object,
    property: property,
    propertyBeginValue: object[property],
    target: target,
    easing: easing,
    time: time,
    change: onchange,
    complete: oncomplete,
    start: Date.now()
  };
  tweening.push(tween);
  return tween;
}

// Listen for animate update.
app.ticker.add(function(delta) {
  const now = Date.now();
  const remove = [];
  for (let i = 0; i < tweening.length; i++) {
    const t = tweening[i];
    const phase = Math.min(1, (now - t.start) / t.time);

    t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
    if (t.change) t.change(t);
    if (phase === 1) {
      t.object[t.property] = t.target;
      if (t.complete) t.complete(t);
      remove.push(t);
    }
  }
  for (let i = 0; i < remove.length; i++) {
    tweening.splice(tweening.indexOf(remove[i]), 1);
  }
});

// Basic lerp funtion.
function lerp(a1, a2, t) {
  return a1 * (1 - t) + a2 * t;
}

// Backout function from tweenjs.
// https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
function backout(amount) {
  return function(t) {
    return (--t * t * ((amount + 1) * t + amount) + 1);
  };
};

function initLogo() {
  const LOGO_WIDTH = 280;
  const logo = new PIXI.Sprite(PIXI.loader.resources['images/game-logo.png'].texture);
  logo.anchor.set(0.5, 0.5);
  logo.scale.x = logo.scale.y = Math.min(
    LOGO_WIDTH / logo.width, LOGO_WIDTH / logo.height
  );
  logo.x = window.innerWidth / 2;
  logo.y = app.screen.y + 56;
  app.stage.addChild(logo);
}

function initBackBtn() {
  const BACK_WIDTH = 72;
  const backBtn = new PIXI.Sprite(PIXI.loader.resources['images/back-normal.png'].texture);
  backBtn.anchor.set(0.5, 0.5);
  backBtn.scale.x = backBtn.scale.y = Math.min(
    BACK_WIDTH / backBtn.width, BACK_WIDTH / backBtn.height
  );
  backBtn.x = app.screen.x + 56;
  backBtn.y = app.screen.y + 56;
  app.stage.addChild(backBtn);
}

function initAutoPlayBtn() {
  const WIDTH = 136;
  const autoPlayBtn = new PIXI.Sprite(PIXI.loader.resources['images/autoplay-normal.png'].texture);
  autoPlayBtn.scale.x = autoPlayBtn.scale.y = Math.min(
    WIDTH / autoPlayBtn.width, WIDTH / autoPlayBtn.height
  );
  autoPlayBtn.x = app.screen.width - 320;
  autoPlayBtn.y = app.screen.height - (bottom.height / 2);
  bottom.addChild(autoPlayBtn);

  // Add auto play text
  const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 18,
    fill: ['#ffffff'],
    wordWrap: true,
    wordWrapWidth: 156
  });
  const autoPlayText = new PIXI.Text('AUTOPLAY', style);
  autoPlayText.anchor.set(0.5, 0.5);
  autoPlayText.x = autoPlayBtn.x + autoPlayBtn.width / 2;
  autoPlayText.y = autoPlayBtn.y + autoPlayBtn.height / 2;
  bottom.addChild(autoPlayText);
}

let totalWin = 2200.00;
function initTotalWin() {
  const BG_WIDTH = 220;
  const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;
  const totalWinBg = new PIXI.Graphics();
  totalWinBg.beginFill(0x0F8D9D, 1);
  totalWinBg.drawRect(app.screen.width - 560, SYMBOL_SIZE * 3 + margin, BG_WIDTH, margin);
  bottom.addChild(totalWinBg);

  // Add total win label text
  const totalWinLabelStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 18,
    fill: ['#ffffff'],
    wordWrap: true,
    wordWrapWidth: BG_WIDTH - 40
  });
  const totalWinLabel = new PIXI.Text('TOTAL WIN', totalWinLabelStyle);
  totalWinLabel.anchor.set(0.5, 0.5);
  totalWinLabel.x = totalWinBg.getBounds().x + totalWinBg.getBounds().width / 2;
  totalWinLabel.y = totalWinBg.getBounds().y + 24;
  bottom.addChild(totalWinLabel);

  // Add total win number
  const totalWinTextStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 32,
    fontWeight: 'bold',
    fill: ['#ffffff'],
    wordWrap: true,
    wordWrapWidth: BG_WIDTH - 40
  });
  const totalWinText = new PIXI.Text(`£${numberWithCommas(totalWin)}`, totalWinTextStyle);
  totalWinText.anchor.set(0.5, 0.5);
  totalWinText.x = totalWinBg.getBounds().x + totalWinBg.getBounds().width / 2;
  totalWinText.y = totalWinBg.getBounds().y + 72;
  bottom.addChild(totalWinText);
}

let totalBet = 120.00;
function initTotalBet() {
  const BG_WIDTH = 180;
  const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;
  const totalWinBg = new PIXI.Graphics();
  totalWinBg.beginFill(0x0F8D9D, 1);
  totalWinBg.drawRect(app.screen.width - 740, SYMBOL_SIZE * 3 + margin, BG_WIDTH, margin);
  bottom.addChild(totalWinBg);

  // Add total win label text
  const totalWinLabelStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 18,
    fill: ['#ffffff'],
    wordWrap: true,
    wordWrapWidth: BG_WIDTH - 40
  });
  const totalWinLabel = new PIXI.Text('TOTAL BET', totalWinLabelStyle);
  totalWinLabel.anchor.set(0.5, 0.5);
  totalWinLabel.x = totalWinBg.getBounds().x + totalWinBg.getBounds().width / 2 - 16;
  totalWinLabel.y = totalWinBg.getBounds().y + 24;
  bottom.addChild(totalWinLabel);

  // Add total win number
  const totalWinTextStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 24,
    fill: ['#ffffff'],
    wordWrap: true,
    wordWrapWidth: BG_WIDTH - 40
  });
  const totalWinText = new PIXI.Text(`£${numberWithCommas(totalBet)}`, totalWinTextStyle);
  totalWinText.anchor.set(0.5, 0.5);
  totalWinText.x = totalWinBg.getBounds().x + totalWinBg.getBounds().width / 2 - 16;
  totalWinText.y = totalWinBg.getBounds().y + 72;
  bottom.addChild(totalWinText);

  // Add plus button
  const BTN_WIDTH = 40;
  const plusBtn = new PIXI.Sprite(PIXI.loader.resources['images/plus-normal.png'].texture);
  plusBtn.anchor.set(0.5, 0.5);
  plusBtn.scale.x = plusBtn.scale.y = Math.min(
    BTN_WIDTH / plusBtn.width, BTN_WIDTH / plusBtn.height
  );
  plusBtn.x = totalWinLabel.x + totalWinLabel.width;
  plusBtn.y = totalWinLabel.y + 6;
  bottom.addChild(plusBtn);
  // plusBtn.interactive = true;
  // plusBtn.buttonMode = true;
  // plusBtn.addListener('pointerdown', function() {
  //   // addBet();
  // });

  // Add minus button
  const minusBtn = new PIXI.Sprite(PIXI.loader.resources['images/minus-normal.png'].texture);
  minusBtn.anchor.set(0.5, 0.5);
  minusBtn.scale.x = minusBtn.scale.y = Math.min(
    BTN_WIDTH / minusBtn.width, BTN_WIDTH / minusBtn.height
  );
  minusBtn.x = totalWinText.x + totalWinLabel.width;
  minusBtn.y = totalWinText.y + 6;
  bottom.addChild(minusBtn);
  // minusBtn.interactive = true;
  // minusBtn.buttonMode = true;
  // minusBtn.addListener('pointerdown', function() {
  //   // reduceBet();
  // });
}

function initMessageView() {
  const BG_WIDTH = 280;
  const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;
  const messageViewBg = new PIXI.Graphics();
  messageViewBg.beginFill(0x0F8D9D, 1);
  messageViewBg.drawRect(app.screen.width - 1020, SYMBOL_SIZE * 3 + margin, BG_WIDTH, margin / 2);
  bottom.addChild(messageViewBg);

  // Add total win label text
  const messageStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 18,
    fill: ['#ffffff']
  });
  const messageText = new PIXI.Text('EMOTIONAL MESSAGE GOES HERE', messageStyle);
  messageText.anchor.set(0.5, 0.5);
  messageText.x = messageViewBg.getBounds().x + messageViewBg.getBounds().width / 2;
  messageText.y = messageViewBg.getBounds().y + 24;
  bottom.addChild(messageText);

  // Add mask to hide overflow text
  const mask = new PIXI.Graphics();
  mask.drawRect(
    messageViewBg.getBounds().x + 10,
    messageViewBg.getBounds().y,
    BG_WIDTH - 20,
    margin / 2
  );
  mask.renderable = true;
  mask.cacheAsBitmap = true;
  messageText.mask = mask;
}

function initSoundBtnView() {
  const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;
  const soundBtnViewBg = new PIXI.Graphics();
  soundBtnViewBg.beginFill(0x0F8D9D, 1);
  soundBtnViewBg.drawRect(app.screen.width - 1072, SYMBOL_SIZE * 3 + margin, margin / 2, margin / 2);
  bottom.addChild(soundBtnViewBg);

  const BTN_WIDTH = 40;
  const soundBtn = new PIXI.Sprite(PIXI.loader.resources['images/sound-normal.png'].texture);
  soundBtn.anchor.set(0.5, 0.5);
  soundBtn.scale.x = soundBtn.scale.y = Math.min(
    BTN_WIDTH / soundBtn.width, BTN_WIDTH / soundBtn.height
  );
  soundBtn.x = soundBtnViewBg.getBounds().x + soundBtnViewBg.getBounds().width / 2;
  soundBtn.y = soundBtnViewBg.getBounds().y + soundBtnViewBg.getBounds().height / 2;
  bottom.addChild(soundBtn);
  // soundBtn.interactive = true;
  // soundBtn.buttonMode = true;
  // soundBtn.addListener('pointerdown', function() {
  // });
}

function initPaytableBtnView() {
  const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;
  const paytableBtnViewBg = new PIXI.Graphics();
  paytableBtnViewBg.beginFill(0x0F8D9D, 1);
  paytableBtnViewBg.drawRect(app.screen.width - 1124, SYMBOL_SIZE * 3 + margin, margin / 2, margin / 2);
  bottom.addChild(paytableBtnViewBg);

  const BTN_WIDTH = 40;
  const paytableBtn = new PIXI.Sprite(PIXI.loader.resources['images/paytable-normal.png'].texture);
  paytableBtn.anchor.set(0.5, 0.5);
  paytableBtn.scale.x = paytableBtn.scale.y = Math.min(
    BTN_WIDTH / paytableBtn.width, BTN_WIDTH / paytableBtn.height
  );
  paytableBtn.x = paytableBtnViewBg.getBounds().x + paytableBtnViewBg.getBounds().width / 2;
  paytableBtn.y = paytableBtnViewBg.getBounds().y + paytableBtnViewBg.getBounds().height / 2;
  bottom.addChild(paytableBtn);
  // paytableBtn.interactive = true;
  // paytableBtn.buttonMode = true;
  // paytableBtn.addListener('pointerdown', function() {
  // });
}

function initBalanceLabelView() {
  const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;

  // Add total win label text
  const balanceLabelStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 18,
    fill: ['#0F8D9D']
  });
  const balanceLabelText = new PIXI.Text('BALANCE', balanceLabelStyle);
  balanceLabelText.anchor.set(0.5, 0.5);
  balanceLabelText.x = app.screen.width - 940;
  balanceLabelText.y = SYMBOL_SIZE * 3 + margin + margin / 2 + 28;
  bottom.addChild(balanceLabelText);
}

let balance = 200;
let balanceText;
function initBalanceTextView() {
  const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;

  // Add total win label text
  const balanceTextStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 24,
    fill: ['#0F8D9D']
  });
  balanceText = new PIXI.Text(`£${balance}`, balanceTextStyle);
  balanceText.anchor.set(0.5, 0.5);
  balanceText.x = app.screen.width - 800;
  balanceText.y = SYMBOL_SIZE * 3 + margin + margin / 2 + 28;
  bottom.addChild(balanceText);
}

function initQuickSpinBtnView() {
  const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;
  const BTN_WIDTH = 40;
  const quickSpinBtn = new PIXI.Sprite(PIXI.loader.resources['images/quickspin-normal.png'].texture);
  // quickSpinBtn.anchor.set(0.5, 0.5);
  quickSpinBtn.scale.x = quickSpinBtn.scale.y = Math.min(
    BTN_WIDTH / quickSpinBtn.width, BTN_WIDTH / quickSpinBtn.height
  );
  quickSpinBtn.x = app.screen.width - 1066;
  quickSpinBtn.y = SYMBOL_SIZE * 3 + margin + margin / 2 + 6;
  bottom.addChild(quickSpinBtn);
  // quickSpinBtn.interactive = true;
  // quickSpinBtn.buttonMode = true;
  // quickSpinBtn.addListener('pointerdown', function() {
  // });
}

function initInfoBtnView() {
  const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;
  const BTN_WIDTH = 40;
  const infoBtn = new PIXI.Sprite(PIXI.loader.resources['images/info-normal.png'].texture);
  // quickSpinBtn.anchor.set(0.5, 0.5);
  infoBtn.scale.x = infoBtn.scale.y = Math.min(
    BTN_WIDTH / infoBtn.width, BTN_WIDTH / infoBtn.height
  );
  infoBtn.x = app.screen.width - 1118;
  infoBtn.y = SYMBOL_SIZE * 3 + margin + margin / 2 + 6;
  bottom.addChild(infoBtn);
  // infoBtn.interactive = true;
  // infoBtn.buttonMode = true;
  // infoBtn.addListener('pointerdown', function() {
  // });
}
