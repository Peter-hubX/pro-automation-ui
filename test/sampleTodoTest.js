import { expect } from 'chai';
import { Builder, By, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

describe("LambdaTest todo App", function () {
  let driver;
  this.timeout(30000);

  before(async () => {
    const options = new chrome.Options();
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .usingServer('http://localhost:9515') // make sure chromedriver runs on this port
      .build();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("should add a new todo item", async () => {
    await driver.get("https://lambdatest.github.io/sample-todo-app/");
    await driver.findElement(By.id("sampletodotext")).sendKeys("Zeus new task", Key.RETURN);
    const text = await driver.findElement(By.xpath("//li[last()]/span")).getText();
    expect(text).to.equal("Zeus new task");
  });
});
