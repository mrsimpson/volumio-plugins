'use strict';

const mfrc522 = require('mfrc522-rpi');

class MFRC522Daemon {
    constructor(spiChannel, onCardDetected, onCardRemoved, logger=console, interval = 500) {
        mfrc522.initWiringPi(spiChannel);

        const self = this;

        self.interval = interval;
        self.logger = logger;

        self.intervalHandle = null;
        self.currentUID = null;

        self.watcher = function () {
            //# reset card
            mfrc522.reset();

            //# Scan for cards
            let response = mfrc522.findCard();
            self.logger.info('NFC reader daemon:', JSON.stringify(response, '', 2));
            if (!response.status) {
                if (self.currentUID) {
                    onCardRemoved(self.currentUID);
                    self.currentUID = null;
                }
            } else {
                response = mfrc522.getUid();
                if (self.currentUID !== response) {
                    self.currentUID = response;
                    onCardDetected(self.currentUID.data);
                }
            }
        }
    }

    start() {
        self.logger.info(JSON.stringify(this));
        this.intervalHandle = setInterval(this.watcher, this.interval);
    }

    stop() {
        clearInterval(this.intervalHandle);
    }
}

module.exports = MFRC522Daemon;
