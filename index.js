import { Builder, Browser, By, until } from "selenium-webdriver";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const builder = new Builder().forBrowser(Browser.FIREFOX);
const driver = await builder.build();

await driver.get(process.env.INSTAGRAM_LOGIN_URL);

await driver.manage().setTimeouts({ implicit: 5000 });

let usernameBox = await driver.findElement(By.name("username"));
let passwordBox = await driver.findElement(By.name("password"));

await usernameBox.sendKeys(process.env.INSTAGRAM_USERNAME);
await passwordBox.sendKeys(process.env.INSTAGRAM_PASSWORD);

let loginButton = await driver.findElement(By.css("button[type='submit']"));
await loginButton.click();

// Wait for the URL to update to the two-factor authentication page
try {
  await driver.wait(async () => {
    const currentUrl = await driver.getCurrentUrl();
    return currentUrl.includes("two_factor");
  }, 10000); // Wait for up to 10 seconds
} catch (error) {
  console.error("Two-factor authentication page did not load in time.");
  process.exit(1);
}

console.log("2FA required. Prompting user to enter code...");

const rl = readline.createInterface({ input, output });
const twoFactorCode = await rl.question("Enter two-factor code: ");
rl.close();

if (twoFactorCode) {
  console.log("2FA code received. Proceeding to enter code...");

  let twoFactorInput = await driver.findElement(By.name("verificationCode"));
  await twoFactorInput.sendKeys(twoFactorCode);

  let twoFactorSubmitButton = await driver.findElement(
    By.css("button[type='button']")
  );
  await twoFactorSubmitButton.click();

  try {
    await driver.wait(async () => {
      const currentUrl = await driver.getCurrentUrl();
      return !currentUrl.includes("two_factor");
    }, 10000);

    const stillOnLogin = (await driver.getCurrentUrl()).includes("login");
    if (stillOnLogin) {
      console.error("Two-factor authentication failed. Exiting...");
      process.exit(1);
    }

    // Navigate to the saved posts page
    const savedPosts = `${process.env.INSTAGRAM_BASE_URL}/${process.env.INSTAGRAM_USERNAME}/saved/all-posts`;
    await driver.get(savedPosts);
  } catch (error) {
    console.error("Could not navigate to saved posts page.");
    process.exit(1);
  }

  const savedPostsPage = await driver.getCurrentUrl();
  if (savedPostsPage) {
    console.log("Navigated to user saved posts successfully.");
  }
} else {
  console.error("2FA code was not provided. Exiting...");
  process.exit(1);
}
