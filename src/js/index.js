import 'sanitize.css/sanitize.css';
import * as PIXI from 'pixi.js';
import { getSizeToFillScreen, numberWithCommas,
  lerp, backout, getTweening } from './utils';

const REEL_WIDTH = 150;
const SYMBOL_SIZE = 150;
const BOTTOM_HEIGHT = 112;
const REELS_COLUMN_NUM = 5;
const REELS_ROW_NUM = 3;
const GENERATED_SYMBOL_SIZE = 10;
const PLAY_BUTTON_WIDTH = 112;
const AUTO_PLAY_BUTTON_WIDTH = 136;
const TOTAL_WIN_WIDTH = 220;
const TOTAL_BET_WIDTH = 180;
const BTN_WIDTH = 40;
const MESSAGE_VIEW_WIDTH = 280;

//
// Members
//
let app;
let backgroundView;
let logo;
let bottomView;
let backBtn;
let playBtn;
let autoPlayBtn;
let autoPlayText;
let totalWinBg;
let totalWinLabel;
let totalWinText;
let totalBetBg;
let totalBetLabel;
let totalBetText;
let plusBtn;
let minusBtn;
let messageViewBg;
let messageText;
let soundBtnViewBg;
let soundBtn;
let paytableBtnViewBg;
let paytableBtn;
let balanceLabelText;
let balanceText;
let quickSpinBtn;
let infoBtn;

const tweenings = [];
const reels = [];
let running = false;
let totalWin = 2200.00;
let totalBet = 120.00;
let balance = 200;

// Create a Pixi Application
app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  antialias: true,
  transparent: false,
  resolution: 1
});

app.renderer.view.style.position = 'absolute';
app.renderer.view.style.display = 'block';
app.renderer.autoResize = true;

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

function setup() {
  //
  // Background view
  //
  backgroundView = new PIXI.Sprite(
    PIXI.loader.resources['images/game-background.jpg'].texture
  );
  backgroundView.anchor.set(0.5, 0.5);
  app.stage.addChild(backgroundView);
  setupBackgroundView();

  //
  // Bottom view
  //
  bottomView = new PIXI.Graphics();
  bottomView.beginFill(0xD2F1F6, 1);
  bottomView.drawRect(0, app.screen.height - BOTTOM_HEIGHT, app.screen.width, BOTTOM_HEIGHT);
  app.stage.addChild(bottomView);

  //
  // Logo
  //
  logo = new PIXI.Sprite(PIXI.loader.resources['images/game-logo.png'].texture);
  logo.anchor.set(0.5, 0.5);
  app.stage.addChild(logo);
  setupLogo();

  //
  // Back button
  //
  backBtn = new PIXI.Sprite(PIXI.loader.resources['images/back-normal.png'].texture);
  backBtn.anchor.set(0.5, 0.5);
  app.stage.addChild(backBtn);
  setupBackBtn();

  //
  // Play button
  //
  playBtn = new PIXI.Sprite(PIXI.loader.resources['images/spin-normal.png'].texture);
  playBtn.anchor.set(0, 0.5);
  bottomView.addChild(playBtn);
  playBtn.interactive = true;
  playBtn.buttonMode = true;
  playBtn.addListener('pointerdown', function() {
    startPlay();
  });
  setupPlayBtn();

  //
  // Auot play button
  //
  autoPlayBtn = new PIXI.Sprite(PIXI.loader.resources['images/autoplay-normal.png'].texture);
  autoPlayBtn.anchor.set(0.5, 0.5);
  bottomView.addChild(autoPlayBtn);
  const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 18,
    fill: ['#ffffff'],
    wordWrap: true,
    wordWrapWidth: 156
  });
  autoPlayText = new PIXI.Text('AUTOPLAY', style);
  autoPlayText.anchor.set(0.5, 0.5);
  autoPlayText.x = autoPlayBtn.x + autoPlayBtn.width / 2;
  autoPlayText.y = autoPlayBtn.y + autoPlayBtn.height / 2;
  bottomView.addChild(autoPlayText);
  setupAutoPlayBtn();

  //
  // Total win
  //
  initTotalWin();

  //
  // Total bet
  //
  initTotalBet();

  //
  // Message view
  //
  initMessageView();

  initSoundBtnView();
  initPaytableBtnView();
  initBalanceLabelView();
  initBalanceTextView();
  initQuickSpinBtnView();
  initInfoBtnView();
  initReels();

  window.onresize = function(event) {
    // TODO: responsive
    app.renderer.resize(window.innerWidth, window.innerHeight);
  };
}

function setupBackgroundView() {
  // Fill screen
  const size = getSizeToFillScreen({
    width: backgroundView.width,
    height: backgroundView.height
  }, {
    width: window.innerWidth,
    height: window.innerHeight
  });
  backgroundView.width = size.width;
  backgroundView.height = size.height;
  backgroundView.x = window.innerWidth / 2;
  backgroundView.y = window.innerHeight / 2;
}

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
  // const reels = [];
  const reelsContainer = new PIXI.Container();
  for (let i = 0; i < REELS_COLUMN_NUM; i++) {
    const reelContainer = new PIXI.Container();
    reelContainer.x = i * REEL_WIDTH;
    reelsContainer.addChild(reelContainer);

    const reel = {
      container: reelContainer,
      symbols: [],
      position: 0,
      previousPosition: 0,
      blur: new PIXI.filters.BlurFilter()
    };
    reel.blur.blurX = 0;
    reel.blur.blurY = 0;
    reelContainer.filters = [reel.blur];

    // Build the symbols
    for (let j = 0; j < GENERATED_SYMBOL_SIZE; j++) {
      const symbol = new PIXI.Sprite(
        slotTextures[Math.floor(Math.random() * slotTextures.length)]
      );
      symbol.scale.x = symbol.scale.y = Math.min(
        SYMBOL_SIZE / symbol.width, SYMBOL_SIZE / symbol.height
      );
      symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);
      symbol.y = j * symbol.height;
      reel.symbols.push(symbol);
      reelContainer.addChild(symbol);
    }
    reels.push(reel);
  }
  app.stage.addChild(reelsContainer);

  // Setup reelsContainer
  const margin = (app.screen.height - SYMBOL_SIZE * REELS_ROW_NUM) / 2;
  reelsContainer.y = margin;
  reelsContainer.x = Math.round(app.screen.width - REEL_WIDTH * 5) / 2;

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
  reelsContainer.mask = reelsMask;

  // Listen for animate update.
  app.ticker.add(function(delta) {
    // Update the slots.
    for (let i = 0; i < reels.length; i++) {
      const reel = reels[i];
      // Update blur filter y amount based on speed.
      // This would be better if calculated with time in mind also. Now blur depends on frame rate.
      reel.blur.blurY = (reel.position - reel.previousPosition) * 8;
      reel.previousPosition = reel.position;

      // Update symbol positions on reel.
      for (let j = 0; j < reel.symbols.length; j++) {
        const symbol = reel.symbols[j];
        const prevy = symbol.y;
        symbol.y = (reel.position + j) % reel.symbols.length * symbol.height - symbol.height;
        if (symbol.y < 0 && prevy > symbol.height) {
          // Detect going over and swap a texture.
          // This should in proper product be determined from some logical reel.
          symbol.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
          symbol.scale.x = symbol.scale.y = Math.min(
            SYMBOL_SIZE / symbol.texture.width, SYMBOL_SIZE / symbol.texture.height
          );
          symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);
        }
      }
    }
  });
}

// Listen for animate update.
app.ticker.add(function(delta) {
  const now = Date.now();
  const remove = [];
  for (let i = 0; i < tweenings.length; i++) {
    const t = tweenings[i];
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
    tweenings.splice(tweenings.indexOf(remove[i]), 1);
  }
});

// Start playing
function startPlay() {
  if (running || balance <= 0) return;
  // calculate balance
  balance -= 10; // TODO: editable balance
  balanceText.text = `£${balance}`;
  if (balance === 0) playBtn.interactive = false;

  running = true;
  for (let i = 0; i < reels.length; i++) {
    const reel = reels[i];
    const extra = Math.floor(Math.random() * 3);
    tweenings.push(getTweening(
      reel,
      'position',
      reel.position + 10 + i * 5 + extra,
      2500 + i * 600 + extra * 600,
      backout(0.6),
      null,
      i === reels.length - 1 ? reelsComplete : null
    ));
  }
}

// Reels done handler.
function reelsComplete() {
  running = false;
}

function setupLogo() {
  const LOGO_WIDTH = 280;
  logo.anchor.set(0.5, 0.5);
  logo.scale.x = logo.scale.y = Math.min(
    LOGO_WIDTH / logo.width, LOGO_WIDTH / logo.height
  );
  logo.x = window.innerWidth / 2;
  logo.y = app.screen.y + 56;
}

function setupBackBtn() {
  const BACK_WIDTH = 72;
  backBtn.scale.x = backBtn.scale.y = Math.min(
    BACK_WIDTH / backBtn.width, BACK_WIDTH / backBtn.height
  );
  backBtn.x = app.screen.x + 56;
  backBtn.y = app.screen.y + 56;
}

function setupPlayBtn() {
  playBtn.scale.x = playBtn.scale.y = Math.min(
    PLAY_BUTTON_WIDTH / playBtn.width, PLAY_BUTTON_WIDTH / playBtn.height
  );
  playBtn.x = app.screen.width - PLAY_BUTTON_WIDTH - 36;
  playBtn.y = app.screen.height - BOTTOM_HEIGHT;
}

function setupAutoPlayBtn() {
  autoPlayBtn.scale.x = autoPlayBtn.scale.y = Math.min(
    AUTO_PLAY_BUTTON_WIDTH / autoPlayBtn.width, AUTO_PLAY_BUTTON_WIDTH / autoPlayBtn.height
  );
  autoPlayBtn.x = app.screen.width - PLAY_BUTTON_WIDTH - 200;
  autoPlayBtn.y = app.screen.height - (BOTTOM_HEIGHT / 2);
  autoPlayText.x = autoPlayBtn.x;
  autoPlayText.y = autoPlayBtn.y;
}

function initTotalWin() {
  totalWinBg = new PIXI.Graphics();
  totalWinBg.beginFill(0x0F8D9D, 1);
  totalWinBg.drawRect(app.screen.width / 2 + TOTAL_BET_WIDTH, app.screen.height - BOTTOM_HEIGHT, TOTAL_WIN_WIDTH, BOTTOM_HEIGHT);
  bottomView.addChild(totalWinBg);

  // Add total win label text
  const totalWinLabelStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 18,
    fill: ['#ffffff'],
    wordWrap: true,
    wordWrapWidth: TOTAL_WIN_WIDTH - 40
  });
  totalWinLabel = new PIXI.Text('TOTAL WIN', totalWinLabelStyle);
  totalWinLabel.anchor.set(0.5, 0.5);
  bottomView.addChild(totalWinLabel);

  // Add total win number
  const totalWinTextStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 32,
    fontWeight: 'bold',
    fill: ['#ffffff'],
    wordWrap: true,
    wordWrapWidth: TOTAL_WIN_WIDTH - 40
  });
  totalWinText = new PIXI.Text(`£${numberWithCommas(totalWin)}`, totalWinTextStyle);
  totalWinText.anchor.set(0.5, 0.5);
  bottomView.addChild(totalWinText);

  setupTotalWin();
}

function setupTotalWin() {
  totalWinLabel.x = totalWinBg.getBounds().x + totalWinBg.getBounds().width / 2;
  totalWinLabel.y = totalWinBg.getBounds().y + 24;
  totalWinText.x = totalWinBg.getBounds().x + totalWinBg.getBounds().width / 2;
  totalWinText.y = totalWinBg.getBounds().y + 72;
}

function initTotalBet() {
  totalBetBg = new PIXI.Graphics();
  totalBetBg.beginFill(0x0F8D9D, 1);
  totalBetBg.drawRect(app.screen.width / 2, app.screen.height - BOTTOM_HEIGHT, TOTAL_BET_WIDTH, BOTTOM_HEIGHT);
  bottomView.addChild(totalBetBg);

  // Add total win label text
  const totalBetLabelStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 18,
    fill: ['#ffffff'],
    wordWrap: true,
    wordWrapWidth: TOTAL_BET_WIDTH - 40
  });
  totalBetLabel = new PIXI.Text('TOTAL BET', totalBetLabelStyle);
  totalBetLabel.anchor.set(0.5, 0.5);
  totalBetLabel.x = totalBetBg.getBounds().x + totalBetBg.getBounds().width / 2 - 16;
  totalBetLabel.y = totalBetBg.getBounds().y + 24;
  bottomView.addChild(totalBetLabel);

  // Add total win number
  const totalBetTextStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 24,
    fill: ['#ffffff'],
    wordWrap: true,
    wordWrapWidth: TOTAL_BET_WIDTH - 40
  });
  totalBetText = new PIXI.Text(`£${numberWithCommas(totalBet)}`, totalBetTextStyle);
  totalBetText.anchor.set(0.5, 0.5);
  totalBetText.x = totalBetBg.getBounds().x + totalBetBg.getBounds().width / 2 - 16;
  totalBetText.y = totalBetBg.getBounds().y + 72;
  bottomView.addChild(totalBetText);

  // Add plus button
  plusBtn = new PIXI.Sprite(PIXI.loader.resources['images/plus-normal.png'].texture);
  plusBtn.anchor.set(0.5, 0.5);
  plusBtn.scale.x = plusBtn.scale.y = Math.min(
    BTN_WIDTH / plusBtn.width, BTN_WIDTH / plusBtn.height
  );
  plusBtn.x = totalBetLabel.x + totalBetLabel.width;
  plusBtn.y = totalBetLabel.y + 6;
  bottomView.addChild(plusBtn);

  // Add minus button
  minusBtn = new PIXI.Sprite(PIXI.loader.resources['images/minus-normal.png'].texture);
  minusBtn.anchor.set(0.5, 0.5);
  minusBtn.scale.x = minusBtn.scale.y = Math.min(
    BTN_WIDTH / minusBtn.width, BTN_WIDTH / minusBtn.height
  );
  minusBtn.x = totalBetText.x + totalBetLabel.width;
  minusBtn.y = totalBetText.y + 6;
  bottomView.addChild(minusBtn);
}

function initMessageView() {
  messageViewBg = new PIXI.Graphics();
  messageViewBg.beginFill(0x0F8D9D, 1);
  messageViewBg.drawRect(app.screen.width / 2 - MESSAGE_VIEW_WIDTH, app.screen.height - BOTTOM_HEIGHT, MESSAGE_VIEW_WIDTH, BOTTOM_HEIGHT / 2);
  bottomView.addChild(messageViewBg);

  // Add total win label text
  const messageStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 18,
    fill: ['#ffffff']
  });
  messageText = new PIXI.Text('EMOTIONAL MESSAGE GOES HERE', messageStyle);
  messageText.anchor.set(0.5, 0.5);
  messageText.x = messageViewBg.getBounds().x + messageViewBg.getBounds().width / 2;
  messageText.y = messageViewBg.getBounds().y + 24;
  bottomView.addChild(messageText);

  // Add mask to hide overflow text
  const mask = new PIXI.Graphics();
  mask.drawRect(
    messageViewBg.getBounds().x + 10,
    messageViewBg.getBounds().y,
    MESSAGE_VIEW_WIDTH - 20,
    BOTTOM_HEIGHT / 2
  );
  mask.renderable = true;
  mask.cacheAsBitmap = true;
  messageText.mask = mask;
}

function initSoundBtnView() {
  soundBtnViewBg = new PIXI.Graphics();
  soundBtnViewBg.beginFill(0x0F8D9D, 1);
  soundBtnViewBg.drawRect(app.screen.width / 2 - MESSAGE_VIEW_WIDTH - BOTTOM_HEIGHT / 2, app.screen.height - BOTTOM_HEIGHT, BOTTOM_HEIGHT / 2, BOTTOM_HEIGHT / 2);
  bottomView.addChild(soundBtnViewBg);

  soundBtn = new PIXI.Sprite(PIXI.loader.resources['images/sound-normal.png'].texture);
  soundBtn.anchor.set(0.5, 0.5);
  soundBtn.scale.x = soundBtn.scale.y = Math.min(
    BTN_WIDTH / soundBtn.width, BTN_WIDTH / soundBtn.height
  );
  soundBtn.x = soundBtnViewBg.getBounds().x + soundBtnViewBg.getBounds().width / 2;
  soundBtn.y = soundBtnViewBg.getBounds().y + soundBtnViewBg.getBounds().height / 2;
  bottomView.addChild(soundBtn);
}

function initPaytableBtnView() {
  paytableBtnViewBg = new PIXI.Graphics();
  paytableBtnViewBg.beginFill(0x0F8D9D, 1);
  paytableBtnViewBg.drawRect(app.screen.width / 2 - MESSAGE_VIEW_WIDTH - BOTTOM_HEIGHT, app.screen.height - BOTTOM_HEIGHT, BOTTOM_HEIGHT / 2, BOTTOM_HEIGHT / 2);
  bottomView.addChild(paytableBtnViewBg);

  paytableBtn = new PIXI.Sprite(PIXI.loader.resources['images/paytable-normal.png'].texture);
  paytableBtn.anchor.set(0.5, 0.5);
  paytableBtn.scale.x = paytableBtn.scale.y = Math.min(
    BTN_WIDTH / paytableBtn.width, BTN_WIDTH / paytableBtn.height
  );
  paytableBtn.x = paytableBtnViewBg.getBounds().x + paytableBtnViewBg.getBounds().width / 2;
  paytableBtn.y = paytableBtnViewBg.getBounds().y + paytableBtnViewBg.getBounds().height / 2;
  bottomView.addChild(paytableBtn);
}

function initBalanceLabelView() {
  // Add total win label text
  const balanceLabelStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 18,
    fill: ['#0F8D9D']
  });
  balanceLabelText = new PIXI.Text('BALANCE', balanceLabelStyle);
  balanceLabelText.anchor.set(0, 0.5);
  balanceLabelText.x = app.screen.width / 2 - MESSAGE_VIEW_WIDTH + 16;
  balanceLabelText.y = app.screen.height - BOTTOM_HEIGHT + BOTTOM_HEIGHT / 2 + 28;
  bottomView.addChild(balanceLabelText);
}

function initBalanceTextView() {
  // Add total win label text
  const balanceTextStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 24,
    fill: ['#0F8D9D']
  });
  balanceText = new PIXI.Text(`£${balance}`, balanceTextStyle);
  balanceText.anchor.set(1, 0.5);
  balanceText.x = balanceLabelText.getBounds().x + 224;
  balanceText.y = app.screen.height - BOTTOM_HEIGHT + BOTTOM_HEIGHT / 2 + 28;
  bottomView.addChild(balanceText);
}

function initQuickSpinBtnView() {
  quickSpinBtn = new PIXI.Sprite(PIXI.loader.resources['images/quickspin-normal.png'].texture);
  quickSpinBtn.scale.x = quickSpinBtn.scale.y = Math.min(
    BTN_WIDTH / quickSpinBtn.width, BTN_WIDTH / quickSpinBtn.height
  );
  quickSpinBtn.x = app.screen.width / 2 - MESSAGE_VIEW_WIDTH - BOTTOM_HEIGHT / 2 + 6;
  quickSpinBtn.y = app.screen.height - BOTTOM_HEIGHT + BOTTOM_HEIGHT / 2 + 6;
  bottomView.addChild(quickSpinBtn);
}

function initInfoBtnView() {
  infoBtn = new PIXI.Sprite(PIXI.loader.resources['images/info-normal.png'].texture);
  infoBtn.scale.x = infoBtn.scale.y = Math.min(
    BTN_WIDTH / infoBtn.width, BTN_WIDTH / infoBtn.height
  );
  infoBtn.x = app.screen.width / 2 - MESSAGE_VIEW_WIDTH - BOTTOM_HEIGHT + 6;
  infoBtn.y = app.screen.height - BOTTOM_HEIGHT + BOTTOM_HEIGHT / 2 + 6;
  bottomView.addChild(infoBtn);
}
