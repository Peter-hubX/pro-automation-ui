import { By, Key } from 'selenium-webdriver';

export default class TodoPage{
    constructor(driver){
        this.driver = driver;
        this.inputField = By.id("sampletodotext");
        this.lastItem = By.xpath("//li[last()]/span");
    }
    async open(){
        await this.driver.get("https://lambdatest.github.io/sample-todo-app/");
    }
    async addTask(task){
        await this.driver.findElement(this.inputField).sendKeys(task, Key.RETURN);
}
async getLastTaskText(){
    return await this.driver.findElement(this.lastItem).getText();
}
}