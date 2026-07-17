'use strict';

/**
 * Sends a real ESC/POS stream to a real Windows printer queue, through the
 * Windows spooler transport (the winspool.drv P/Invoke path).
 *
 * This is the path USB and shared printers take — the majority of restaurant
 * tills. It is completely separate from the TCP/network path, so it needs
 * exercising on its own.
 *
 *   set TEST_PRINTER=Some Printer Name
 *   npx electron ./scripts/dev-print-test.js
 *
 * Lists the available printers if TEST_PRINTER is not set.
 */
const { app } = require('electron');

app.setName('FikraNova Print Agent');

app.whenReady().then(async () => {
  const { listPrinters } = require('../src/services/printer/discovery');
  const { WindowsSpoolerTransport } = require('../src/services/printer/transports/windowsSpooler');
  const { EscPosEncoder } = require('../src/services/printer/escpos/encoder');

  const printers = await listPrinters();

  console.log('PRINTERS_FOUND=' + printers.length);

  for (const printer of printers) {
    console.log(
      `  - ${printer.name} | port=${printer.portName} | width=${printer.detectedWidth ?? 'auto'} | default=${printer.isDefault}`
    );
  }

  const target = process.env.TEST_PRINTER;

  if (!target) {
    console.log('NO_TARGET (set TEST_PRINTER to send a job)');
    app.exit(0);
    return;
  }

  const encoder = new EscPosEncoder({ width: 80 });

  encoder
    .init()
    .align('center')
    .bold(true)
    .doubleSize(true)
    .line('FikraNova')
    .doubleSize(false)
    .line('Spooler path test')
    .bold(false)
    .align('left')
    .rule()
    .columnsLR('1x Test item', '10.00')
    .rule('=')
    .bold(true)
    .columnsLR('TOTAL', '10.00')
    .bold(false)
    .feed(3)
    .cut();

  const bytes = encoder.encode();
  const transport = new WindowsSpoolerTransport({ printerName: target });

  console.log(`SENDING ${bytes.length} bytes to "${target}" via ${transport.describe()}`);

  try {
    await transport.write(bytes, { docName: 'FikraNova Spooler Test' });
    console.log('WRITE_OK');
  } catch (error) {
    console.log(`WRITE_FAILED code=${error.code} message=${error.message}`);
  }

  try {
    const status = await transport.queryStatus();
    console.log(`STATUS state=${status.state} detail=${status.detail || '-'}`);
  } catch (error) {
    console.log(`STATUS_FAILED ${error.message}`);
  }

  app.exit(0);
});
