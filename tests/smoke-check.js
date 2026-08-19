// Prueba de humo (smoke test) para CI: carga index.html en un navegador real
// (Chromium via Playwright) y falla el build si aparece cualquier error de
// consola/JS no capturado, o si algun atributo onclick/onchange/oninput/onsubmit
// del HTML apunta a una funcion que no existe en window (typo, funcion borrada,
// script.js desincronizado con index.html, etc.).
//
// No requiere sesion iniciada -- valida la app tal como la ve un visitante nuevo
// en la pantalla de login. No sustituye pruebas funcionales de una feature
// especifica, solo detecta regresiones basicas que romperian la carga inicial
// para TODOS los usuarios.

const { chromium } = require('playwright');

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:8791';

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Nunca dejar que la prueba dispare un correo real de alerta -- error-reporter.js
  // intercepta console.warn/error globalmente y los manda por emailjs sin distinguir
  // entorno de prueba vs produccion.
  await page.route('**://api.emailjs.com/**', route => route.abort());

  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });

  console.log(`--- Navigating to ${BASE_URL}/index.html ---`);
  await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(3000);

  const missing = await page.evaluate(() => {
    const handlers = new Set();
    const attrs = ['onclick', 'onchange', 'oninput', 'onsubmit'];
    attrs.forEach(attrName => {
      document.querySelectorAll('[' + attrName + ']').forEach(el => {
        const attr = el.getAttribute(attrName);
        const m = attr.match(/^\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/);
        if (m && m[1] !== 'if') handlers.add(m[1]);
      });
    });
    const missingFns = [];
    handlers.forEach(fn => {
      if (typeof window[fn] !== 'function') missingFns.push(fn);
    });
    return { total: handlers.size, missingFns };
  });

  const ok = consoleErrors.length === 0 && pageErrors.length === 0 && missing.missingFns.length === 0;

  if (!ok) {
    await page.screenshot({ path: 'tests/screenshot_failure.png', fullPage: true }).catch(() => {});
  }

  console.log('--- Console errors ---');
  console.log(JSON.stringify(consoleErrors, null, 2));
  console.log('--- Uncaught page errors ---');
  console.log(JSON.stringify(pageErrors, null, 2));
  console.log('--- onclick/onchange/oninput/onsubmit handler existence check ---');
  console.log(JSON.stringify(missing, null, 2));

  await browser.close();

  if (!ok) {
    console.error('\nSMOKE TEST FAILED.');
    if (consoleErrors.length) console.error(`  - ${consoleErrors.length} console error(s)`);
    if (pageErrors.length) console.error(`  - ${pageErrors.length} uncaught page error(s)`);
    if (missing.missingFns.length) console.error(`  - ${missing.missingFns.length} missing handler function(s): ${missing.missingFns.join(', ')}`);
    process.exit(1);
  }

  console.log('\nSMOKE TEST PASSED.');
})().catch(e => {
  console.error('SCRIPT FAILED:', e);
  process.exit(1);
});
