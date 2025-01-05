import { Builder, Browser } from "selenium-webdriver";

const builder = new Builder().forBrowser(Browser.FIREFOX);
const driver = await builder.build();

await driver.get("https://www.instagram.com/httpsaliba/saved/all-posts");

// Await 10 seconds for the page to load
await driver.manage().setTimeouts({ implicit: 10000 });
