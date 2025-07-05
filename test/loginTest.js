import { expect } from 'chai';
import { Builder } from 'selenium-webdriver';
import TodoPage from '../pages/todoPage.js';


describe("lambdaTest todo App", function () {
    let driver,page;
    this.timeout(30000);
    
    before (async () =>{
driver = await new Builder().forBrowser('chrome').usingServer("http://localhost:9515").build();
page = new TodoPage(driver);
    })

    after (async() => {
        if (driver) await driver.quit();
    })

    it("should add a new todo item", async () => {
        await page.open();
        await page.addTask("Zeus new task");
        const text = await page.getLastTaskText();
        expect(text).to.equal("Zeus new task");
    });

})